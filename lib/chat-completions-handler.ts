import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { randomUUID } from 'crypto';
import { classifyIntentAndFreshness } from '@/lib/agents/router';
import { knowledgeRetriever } from '@/lib/knowledge/retriever';

type ChatBody = {
  messages?: Array<{ role: string; content: unknown }>;
  model?: string;
  stream?: boolean;
  [key: string]: unknown;
};

type ChatCompletionsDeps = {
  createOpenAIClient: typeof createOpenAI;
  streamTextImpl: typeof streamText;
};

/**
 * OpenAI-compatible Chat Completions endpoint backed by Vercel AI SDK.
 *
 * Agora's Conversational AI Engine calls this as its "custom LLM" — sending
 * standard OpenAI chat completion requests and expecting OpenAI SSE chunks back.
 *
 * Automatically intercepts time-sensitive / current information queries, executes
 * live knowledge retrieval, and injects grounded authoritative context before streaming.
 */
export function createChatCompletionsHandler({
  createOpenAIClient,
  streamTextImpl,
}: ChatCompletionsDeps) {
  return async function POST(request: NextRequest) {
    // ── Config ────────────────────────────────────────────────────────────────
    const apiKey = process.env.NEXT_LLM_API_KEY;
    const llmUrl = process.env.NEXT_LLM_URL;
    // Model is pinned here — change this to switch models without other config changes.
    // Never use body.model; that would allow callers to route to arbitrary models.
    const modelId = 'gpt-4o';

    if (!apiKey || !llmUrl) {
      return NextResponse.json(
        { error: 'NEXT_LLM_API_KEY and NEXT_LLM_URL must be set' },
        { status: 500 },
      );
    }

    // @ai-sdk/openai needs a base URL, not the full /chat/completions path
    const baseURL = llmUrl.replace(/\/chat\/completions\/?$/, '');

    let body: ChatBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const openai = createOpenAIClient({ apiKey, baseURL });

    // Dynamic Live Retrieval Augmentation
    const rawMessages = (body.messages ?? []) as Array<{ role: string; content: string }>;
    const lastUserMsg = [...rawMessages].reverse().find((m) => m.role === 'user')?.content;

    const augmentedMessages = [...rawMessages];
    let groundedContextIncluded = false;

    if (lastUserMsg && typeof lastUserMsg === 'string') {
      try {
        const classification = classifyIntentAndFreshness(lastUserMsg);

        console.log(
          `[ROUTER] query: "${classification.query}" | intent: ${classification.intent} | needsFreshInformation: ${classification.needsFreshInformation}`,
        );

        if (classification.needsFreshInformation) {
          console.log(`[RETRIEVAL] triggered: true | query: "${classification.query}"`);
          const sources = await knowledgeRetriever.getCurrentInformation(classification.query);

          console.log(
            `[RETRIEVAL] results count: ${sources.length} | top source: ${sources[0]?.sourceName || 'none'}`,
          );

          if (sources.length > 0) {
            groundedContextIncluded = true;
            const contextSnippet = sources
              .map(
                (s, i) =>
                  `[Source ${i + 1}] (${s.sourceName}): ${s.title}\nURL: ${s.url}\nSummary: ${s.snippet}`,
              )
              .join('\n\n');

            augmentedMessages.push({
              role: 'system',
              content: `VERIFIED FRESH KNOWLEDGE CONTEXT:\n${contextSnippet}\n\nCRITICAL GROUNDING INSTRUCTIONS:\n- Answer using the retrieved information above.\n- Do NOT contradict reliable retrieved evidence with pretrained memory.\n- If the user corrected a previous answer, acknowledge the update gracefully.\n- Keep your voice response concise (1-4 sentences) and maintain strict native script for the language spoken.`,
            });
          } else {
            augmentedMessages.push({
              role: 'system',
              content: `CURRENT INFORMATION NOTICE:\nLive retrieval was attempted for "${classification.query}", but real-time verification could not be confirmed. State clearly that the latest real-time status could not be verified right now instead of guessing from stale memory.`,
            });
          }
        }
      } catch (err) {
        console.warn('[RETRIEVAL] Knowledge retrieval error (continuing with base model):', err);
      }
    }

    console.log(`[LLM] groundedContextIncluded: ${groundedContextIncluded}`);

    const result = streamTextImpl({
      // modelId is always sourced from the environment — body.model is ignored
      model: openai(modelId),
      messages: augmentedMessages as NonNullable<
        Parameters<typeof streamText>[0]['messages']
      >,
    });

    const encoder = new TextEncoder();
    const id = `chatcmpl-${randomUUID()}`;
    const created = Math.floor(Date.now() / 1000);
    const model = body.model ?? modelId;

    const sseChunk = (
      delta: Record<string, unknown>,
      finishReason: string | null = null,
    ) =>
      encoder.encode(
        `data: ${JSON.stringify({
          id,
          object: 'chat.completion.chunk',
          created,
          model,
          choices: [{ index: 0, delta, finish_reason: finishReason }],
        })}\n\n`,
      );

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Role-only first chunk (OpenAI convention)
          controller.enqueue(sseChunk({ role: 'assistant', content: '' }));

          for await (const chunk of result.textStream) {
            controller.enqueue(sseChunk({ content: chunk }));
          }

          controller.enqueue(sseChunk({}, 'stop'));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          console.error('[custom-llm] Stream error:', err);
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  };
}
