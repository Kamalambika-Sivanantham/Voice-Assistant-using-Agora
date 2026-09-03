import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createChatCompletionsHandler } from '@/lib/chat-completions-handler';

export const POST = createChatCompletionsHandler({
  createOpenAIClient: createOpenAI,
  streamTextImpl: streamText,
});

