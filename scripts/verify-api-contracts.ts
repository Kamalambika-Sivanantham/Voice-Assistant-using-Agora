import { AgoraClient, Agent } from 'agora-agents';
import { RtcTokenBuilder } from 'agora-token';
import { NextRequest } from 'next/server';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function getJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

process.env.NEXT_PUBLIC_AGORA_APP_ID = '0123456789abcdef0123456789abcdef';
process.env.NEXT_AGORA_APP_CERTIFICATE = 'fedcba9876543210fedcba9876543210';

async function verifyGenerateAgoraTokenRoute() {
  const { GET: generateAgoraToken } =
    await import('../app/api/generate-agora-token/route');
  const originalBuildTokenWithRtm = RtcTokenBuilder.buildTokenWithRtm;
  let tokenBuilderArgs: unknown[] | null = null;

  RtcTokenBuilder.buildTokenWithRtm = ((...args: unknown[]) => {
    tokenBuilderArgs = args;
    return 'mock-rtc-rtm-token';
  }) as typeof RtcTokenBuilder.buildTokenWithRtm;

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/generate-agora-token?uid=4321&channel=test-channel',
    );
    const response = await generateAgoraToken(request);
    const body = await getJson(response);

    assert(
      response.status === 200,
      'GET /api/generate-agora-token should return 200',
    );
    assert(
      body.token === 'mock-rtc-rtm-token',
      'GET /api/generate-agora-token should return the built token',
    );
    assert(
      body.uid === '4321',
      'GET /api/generate-agora-token should preserve the requested uid',
    );
    assert(
      body.channel === 'test-channel',
      'GET /api/generate-agora-token should preserve the requested channel',
    );

    assert(
      Array.isArray(tokenBuilderArgs),
      'GET /api/generate-agora-token should call buildTokenWithRtm',
    );
    assert(
      tokenBuilderArgs?.[2] === 'test-channel',
      'buildTokenWithRtm should use the requested channel',
    );
    assert(
      tokenBuilderArgs?.[3] === '4321',
      'buildTokenWithRtm should receive the requested uid as account string',
    );
  } finally {
    RtcTokenBuilder.buildTokenWithRtm = originalBuildTokenWithRtm;
  }
}

async function verifyGenerateAgoraTokenReplacesZeroUid() {
  const { GET: generateAgoraToken } =
    await import('../app/api/generate-agora-token/route');
  const originalBuildTokenWithRtm = RtcTokenBuilder.buildTokenWithRtm;
  let tokenBuilderArgs: unknown[] | null = null;

  RtcTokenBuilder.buildTokenWithRtm = ((...args: unknown[]) => {
    tokenBuilderArgs = args;
    return 'mock-rtc-rtm-token';
  }) as typeof RtcTokenBuilder.buildTokenWithRtm;

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/generate-agora-token?uid=0&channel=test-channel',
    );
    const response = await generateAgoraToken(request);
    const body = await getJson(response);

    assert(
      response.status === 200,
      'GET /api/generate-agora-token?uid=0 should return 200',
    );
    assert(
      typeof body.uid === 'string' && body.uid !== '0',
      'GET /api/generate-agora-token?uid=0 should generate an RTM-safe uid',
    );
    assert(
      Array.isArray(tokenBuilderArgs) && tokenBuilderArgs[3] === body.uid,
      'buildTokenWithRtm should mint the token for the generated uid',
    );
  } finally {
    RtcTokenBuilder.buildTokenWithRtm = originalBuildTokenWithRtm;
  }
}

async function verifyChatCompletionsMissingEnv() {
  const { createChatCompletionsHandler } =
    await import('../lib/chat-completions-handler');
  const originalApiKey = process.env.NEXT_LLM_API_KEY;
  const originalUrl = process.env.NEXT_LLM_URL;

  delete process.env.NEXT_LLM_API_KEY;
  delete process.env.NEXT_LLM_URL;

  const handler = createChatCompletionsHandler({
    createOpenAIClient: (() => {
      throw new Error('createOpenAI should not be called when env is missing');
    }) as never,
    streamTextImpl: (() => {
      throw new Error('streamText should not be called when env is missing');
    }) as never,
  });

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/chat/completions',
      {
        body: JSON.stringify({ messages: [] }),
        method: 'POST',
      },
    );
    const response = await handler(request);
    const body = await getJson(response);

    assert(
      response.status === 500,
      'POST /api/chat/completions should reject missing LLM env',
    );
    assert(
      body.error === 'NEXT_LLM_API_KEY and NEXT_LLM_URL must be set',
      'POST /api/chat/completions should explain missing LLM env',
    );
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.NEXT_LLM_API_KEY;
    } else {
      process.env.NEXT_LLM_API_KEY = originalApiKey;
    }
    if (originalUrl === undefined) {
      delete process.env.NEXT_LLM_URL;
    } else {
      process.env.NEXT_LLM_URL = originalUrl;
    }
  }
}

async function verifyChatCompletionsInvalidJson() {
  const { createChatCompletionsHandler } =
    await import('../lib/chat-completions-handler');
  const originalApiKey = process.env.NEXT_LLM_API_KEY;
  const originalUrl = process.env.NEXT_LLM_URL;
  process.env.NEXT_LLM_API_KEY = 'test-key';
  process.env.NEXT_LLM_URL = 'https://example.test/v1/chat/completions';

  const handler = createChatCompletionsHandler({
    createOpenAIClient: (() => {
      throw new Error('createOpenAI should not be called for invalid JSON');
    }) as never,
    streamTextImpl: (() => {
      throw new Error('streamText should not be called for invalid JSON');
    }) as never,
  });

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/chat/completions',
      {
        body: '{not json',
        method: 'POST',
      },
    );
    const response = await handler(request);
    const body = await getJson(response);

    assert(
      response.status === 400,
      'POST /api/chat/completions should reject invalid JSON',
    );
    assert(
      body.error === 'Invalid JSON body',
      'POST /api/chat/completions should explain invalid JSON',
    );
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.NEXT_LLM_API_KEY;
    } else {
      process.env.NEXT_LLM_API_KEY = originalApiKey;
    }
    if (originalUrl === undefined) {
      delete process.env.NEXT_LLM_URL;
    } else {
      process.env.NEXT_LLM_URL = originalUrl;
    }
  }
}

async function verifyChatCompletionsSseDone() {
  const { createChatCompletionsHandler } =
    await import('../lib/chat-completions-handler');
  const originalApiKey = process.env.NEXT_LLM_API_KEY;
  const originalUrl = process.env.NEXT_LLM_URL;
  process.env.NEXT_LLM_API_KEY = 'test-key';
  process.env.NEXT_LLM_URL = 'https://example.test/v1/chat/completions';

  let capturedBaseUrl: string | undefined;
  let capturedModelId: string | undefined;
  let capturedMessages: unknown;

  const handler = createChatCompletionsHandler({
    createOpenAIClient: ((options: { baseURL?: string }) => {
      capturedBaseUrl = options.baseURL;
      return (modelId: string) => {
        capturedModelId = modelId;
        return { modelId };
      };
    }) as never,
    streamTextImpl: ((options: { messages?: unknown }) => {
      capturedMessages = options.messages;
      return {
        textStream: (async function* () {
          yield 'hello';
          yield ' world';
        })(),
      };
    }) as never,
  });

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/chat/completions',
      {
        body: JSON.stringify({
          model: 'caller-model-ignored-for-routing',
          messages: [{ role: 'user', content: 'Hi' }],
        }),
        method: 'POST',
      },
    );
    const response = await handler(request);
    const text = await response.text();

    assert(
      response.status === 200,
      'POST /api/chat/completions should return 200 for a valid request',
    );
    assert(
      response.headers.get('content-type') === 'text/event-stream',
      'POST /api/chat/completions should return SSE content type',
    );
    assert(
      capturedBaseUrl === 'https://example.test/v1',
      'POST /api/chat/completions should pass base URL without /chat/completions',
    );
    assert(
      capturedModelId === 'gpt-4o',
      'POST /api/chat/completions should route to the pinned server model',
    );
    assert(
      JSON.stringify(capturedMessages) ===
        JSON.stringify([{ role: 'user', content: 'Hi' }]),
      'POST /api/chat/completions should pass request messages to streamText',
    );
    assert(
      text.includes('data: [DONE]'),
      'POST /api/chat/completions should terminate with [DONE]',
    );
    assert(
      text.includes('"content":"hello"') && text.includes('"content":" world"'),
      'POST /api/chat/completions should stream text chunks as OpenAI-compatible deltas',
    );
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.NEXT_LLM_API_KEY;
    } else {
      process.env.NEXT_LLM_API_KEY = originalApiKey;
    }
    if (originalUrl === undefined) {
      delete process.env.NEXT_LLM_URL;
    } else {
      process.env.NEXT_LLM_URL = originalUrl;
    }
  }
}

async function verifyInviteAgentValidation() {
  const { POST: inviteAgent } = await import('../app/api/invite-agent/route');
  const request = new NextRequest('http://localhost:3000/api/invite-agent', {
    body: JSON.stringify({ channel_name: 'missing-requester' }),
    method: 'POST',
  });
  const response = await inviteAgent(request);
  const body = await getJson(response);

  assert(
    response.status === 400,
    'POST /api/invite-agent should reject missing fields',
  );
  assert(
    body.error === 'channel_name and requester_id are required',
    'POST /api/invite-agent should explain validation failure',
  );
}

async function verifyInviteAgentSuccess() {
  const { POST: inviteAgent } = await import('../app/api/invite-agent/route');
  const originalCreateSession = Agent.prototype.createSession;
  let capturedSessionConfig: {
    channel?: string;
    agentUid?: string;
    remoteUids?: string[];
  } | null = null;

  Agent.prototype.createSession = ((sessionConfig: unknown) => {
    capturedSessionConfig = sessionConfig as {
      channel?: string;
      agentUid?: string;
      remoteUids?: string[];
    };
    return {
      start: async () => 'mock-agent-id',
    };
  }) as unknown as typeof Agent.prototype.createSession;

  try {
    const request = new NextRequest('http://localhost:3000/api/invite-agent', {
      body: JSON.stringify({
        requester_id: 'user-4321',
        channel_name: 'test-channel',
      }),
      method: 'POST',
    });
    const response = await inviteAgent(request);
    const body = await getJson(response);

    assert(
      response.status === 200,
      'POST /api/invite-agent should return 200 on success',
    );
    assert(
      body.agent_id === 'mock-agent-id',
      'POST /api/invite-agent should return the started agent id',
    );
    assert(
      body.state === 'RUNNING',
      'POST /api/invite-agent should return RUNNING state',
    );
    assert(
      capturedSessionConfig !== null,
      'POST /api/invite-agent should call createSession',
    );
    const sessionConfig = capturedSessionConfig as {
      channel?: string;
      agentUid?: string;
      remoteUids?: string[];
    };

    assert(
      sessionConfig.channel === 'test-channel',
      'POST /api/invite-agent should pass the requested channel to createSession',
    );
    assert(
      sessionConfig.agentUid === '123456',
      'POST /api/invite-agent should use the shared default agent UID',
    );
    assert(
      JSON.stringify(sessionConfig.remoteUids) ===
        JSON.stringify(['user-4321']),
      'POST /api/invite-agent should scope the session to the requesting user',
    );
  } finally {
    Agent.prototype.createSession = originalCreateSession;
  }
}

async function verifyStopConversationValidation() {
  const { POST: stopConversation } =
    await import('../app/api/stop-conversation/route');
  const request = new NextRequest(
    'http://localhost:3000/api/stop-conversation',
    {
      body: JSON.stringify({}),
      method: 'POST',
    },
  );
  const response = await stopConversation(request);
  const body = await getJson(response);

  assert(
    response.status === 400,
    'POST /api/stop-conversation should reject missing agent_id',
  );
  assert(
    body.error === 'agent_id is required',
    'POST /api/stop-conversation should explain validation failure',
  );
}

async function verifyStopConversationSuccess() {
  const { POST: stopConversation } =
    await import('../app/api/stop-conversation/route');
  const originalStopAgent = AgoraClient.prototype.stopAgent;
  let stoppedAgentId: string | null = null;

  AgoraClient.prototype.stopAgent = async function (
    this: AgoraClient,
    agentId: string,
  ) {
    stoppedAgentId = agentId;
  } as typeof AgoraClient.prototype.stopAgent;

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/stop-conversation',
      {
        body: JSON.stringify({ agent_id: 'mock-agent-id' }),
        method: 'POST',
      },
    );
    const response = await stopConversation(request);
    const body = await getJson(response);

    assert(
      response.status === 200,
      'POST /api/stop-conversation should return 200 on success',
    );
    assert(
      body.success === true,
      'POST /api/stop-conversation should return success',
    );
    assert(
      stoppedAgentId === 'mock-agent-id',
      'POST /api/stop-conversation should call stopAgent with the requested agent id',
    );
  } finally {
    AgoraClient.prototype.stopAgent = originalStopAgent;
  }
}

async function verifyInviteAgentMultilingual() {
  const { POST: inviteAgent } = await import('../app/api/invite-agent/route');
  const originalCreateSession = Agent.prototype.createSession;

  Agent.prototype.createSession = (() => {
    return {
      start: async () => 'mock-agent-id',
    };
  }) as unknown as typeof Agent.prototype.createSession;

  const languages = ['en', 'ta', 'hi', 'ml', 'kn', 'te', 'auto'] as const;

  try {
    for (const lang of languages) {
      const request = new NextRequest('http://localhost:3000/api/invite-agent', {
        body: JSON.stringify({
          requester_id: 'user-4321',
          channel_name: `test-channel-${lang}`,
          language: lang,
        }),
        method: 'POST',
      });
      const response = await inviteAgent(request);
      const body = await getJson(response);

      assert(
        response.status === 200,
        `POST /api/invite-agent should return 200 for language: ${lang}`,
      );
      assert(
        body.agent_id === 'mock-agent-id',
        `POST /api/invite-agent should return agent_id for language: ${lang}`,
      );
      assert(
        body.state === 'RUNNING',
        `POST /api/invite-agent should return RUNNING state for language: ${lang}`,
      );
    }
  } finally {
    Agent.prototype.createSession = originalCreateSession;
  }
}

async function verifyLegalAndKnowledgeAssistant() {
  const { classifyUtteranceHeuristic } = await import('../lib/agents/router');
  const { buildMasterSystemPrompt, MULTILINGUAL_GREETINGS } = await import('../lib/agents/system-prompt');
  const { generateActionPlanForCategory } = await import('../lib/legal/complaint-workflow');
  const { LEGAL_CATEGORIES_METADATA } = await import('../lib/legal/knowledge');
  const { defaultKnowledgeRetriever } = await import('../lib/legal/sources');

  // 1. Verify Intent Classification
  assert(
    classifyUtteranceHeuristic('What is machine learning?') === 'general_knowledge',
    'General query should route to general_knowledge',
  );
  assert(
    classifyUtteranceHeuristic('What is an FIR?') === 'legal_question',
    'Legal definition query should route to legal_question',
  );
  assert(
    classifyUtteranceHeuristic('My employer has not paid my salary for 2 months.') === 'legal_complaint',
    'Salary grievance should route to legal_complaint',
  );
  assert(
    classifyUtteranceHeuristic('My landlord is refusing to return my security deposit.') === 'legal_complaint',
    'Tenancy deposit grievance should route to legal_complaint',
  );
  assert(
    classifyUtteranceHeuristic('Yes, I have the appointment letter.', true) === 'follow_up',
    'Follow up statement should route to follow_up in active complaint context',
  );

  // 2. Verify Action Plan Generation
  const salaryPlan = generateActionPlanForCategory('employment_salary');
  assert(salaryPlan.length >= 4, 'Employment salary action plan should have at least 4 steps');
  assert(salaryPlan[0].isImmediate === true, 'Step 1 of action plan should be immediate');

  const cyberPlan = generateActionPlanForCategory('cybercrime_fraud');
  assert(cyberPlan[0].action.includes('1930'), 'Cybercrime action plan should include 1930 helpline');

  // 3. Verify Knowledge Retriever & Categories
  assert(
    LEGAL_CATEGORIES_METADATA.consumer_complaint.primaryActs.includes('Consumer Protection Act, 2019'),
    'Consumer category should link to Consumer Protection Act 2019',
  );
  const retrievedSources = await defaultKnowledgeRetriever.retrieve('consumer issue', 'consumer_complaint');
  assert(retrievedSources.length > 0, 'Knowledge retriever should return authoritative source for consumer category');
  assert(retrievedSources[0].isOfficial === true, 'Retrieved source should be marked official');

  // 4. Verify Master System Prompt Constraints & English Script Isolation
  const prompt = buildMasterSystemPrompt();
  assert(prompt.includes('English (en)'), 'Master prompt must specify English rules');
  assert(prompt.includes('standard English Latin alphabet ONLY'), 'Master prompt must strictly enforce English Latin characters ONLY');
  assert(prompt.includes('NEVER convert, translate, or transliterate English speech'), 'Master prompt must forbid converting English speech to Indian scripts');
  assert(prompt.includes('NO Romanized Tamil / Tanglish'), 'Master prompt must forbid Tanglish');
  assert(prompt.includes('NO Romanized Hindi / Hinglish'), 'Master prompt must forbid Hinglish');
  assert(prompt.includes('NO Romanized Malayalam / Manglish'), 'Master prompt must forbid Manglish');
  assert(prompt.includes('NO Romanized Kannada / Kanglish'), 'Master prompt must forbid Kanglish');
  assert(prompt.includes('NEVER FABRICATE LAWS'), 'Master prompt must strictly forbid fabricating laws');
  assert(prompt.includes('Never assume Tamil Nadu'), 'Master prompt must enforce jurisdictional neutrality');

  // 5. Verify Multilingual Greetings
  assert(MULTILINGUAL_GREETINGS.en.includes('Hello'), 'English greeting valid');
  assert(MULTILINGUAL_GREETINGS.ta.includes('வணக்கம்'), 'Tamil greeting contains native Tamil script');
  assert(MULTILINGUAL_GREETINGS.hi.includes('नमस्ते'), 'Hindi greeting contains Devanagari script');
  assert(MULTILINGUAL_GREETINGS.ml.includes('നമസ്കാരം'), 'Malayalam greeting contains Malayalam script');
  assert(MULTILINGUAL_GREETINGS.kn.includes('ನಮಸ್ಕಾರ'), 'Kannada greeting contains Kannada script');
  assert(MULTILINGUAL_GREETINGS.te.includes('నమస్కారం'), 'Telugu greeting contains Telugu script');
}

async function verifyGeneralPurposeAndCurrentKnowledge() {
  const { classifyIntentAndFreshness, detectTimeSensitivity } = await import('../lib/agents/router');
  const { knowledgeRetriever } = await import('../lib/knowledge/retriever');
  const { determineAuthorityTier, rankSources } = await import('../lib/knowledge/source-ranking');

  // Test Case 1: "What is artificial intelligence?" -> general_knowledge, no mandatory retrieval
  const tc1 = classifyIntentAndFreshness('What is artificial intelligence?');
  assert(tc1.intent === 'general_knowledge', 'TC1 intent must be general_knowledge');
  assert(tc1.needsFreshInformation === false, 'TC1 needsFreshInformation must be false');

  // Test Case 2: "Explain Python functions." -> technology / general_knowledge
  const tc2 = classifyIntentAndFreshness('Explain Python functions.');
  assert(tc2.intent === 'technology' || tc2.intent === 'general_knowledge', 'TC2 intent must be technology/general');
  assert(tc2.needsFreshInformation === false, 'TC2 needsFreshInformation must be false');

  // Test Case 3: "Who is the current Chief Minister of Tamil Nadu?" -> current_information + retrieval
  const tc3 = classifyIntentAndFreshness('Who is the current Chief Minister of Tamil Nadu?');
  assert(tc3.intent === 'current_information', 'TC3 intent must be current_information');
  assert(tc3.needsFreshInformation === true, 'TC3 needsFreshInformation must be true');

  // Test Case 4: "Who is the current Prime Minister of India?" -> current_information + retrieval
  const tc4 = classifyIntentAndFreshness('Who is the current Prime Minister of India?');
  assert(tc4.intent === 'current_information', 'TC4 intent must be current_information');
  assert(tc4.needsFreshInformation === true, 'TC4 needsFreshInformation must be true');

  // Test Case 5: "What is the latest Python version?" -> current_information + retrieval
  const tc5 = classifyIntentAndFreshness('What is the latest Python version?');
  assert(tc5.intent === 'current_information', 'TC5 intent must be current_information');
  assert(tc5.needsFreshInformation === true, 'TC5 needsFreshInformation must be true');

  // Test Case 6: "What is photosynthesis?" -> general_knowledge, no mandatory retrieval
  const tc6 = classifyIntentAndFreshness('What is photosynthesis?');
  assert(tc6.intent === 'general_knowledge', 'TC6 intent must be general_knowledge');
  assert(tc6.needsFreshInformation === false, 'TC6 needsFreshInformation must be false');

  // Test Case 7: "How do I apply for a government service?" -> government_service + retrieval
  const tc7 = classifyIntentAndFreshness('How do I apply for a government service?');
  assert(tc7.intent === 'government_service', 'TC7 intent must be government_service');
  assert(tc7.needsFreshInformation === true, 'TC7 needsFreshInformation must be true');

  // Test Case 8: "My landlord refuses to return my deposit." -> legal_complaint
  const tc8 = classifyIntentAndFreshness('My landlord refuses to return my deposit.');
  assert(tc8.intent === 'legal_complaint', 'TC8 intent must be legal_complaint');

  // Test Case 9: "My employer has not paid my salary." -> legal_complaint
  const tc9 = classifyIntentAndFreshness('My employer has not paid my salary.');
  assert(tc9.intent === 'legal_complaint', 'TC9 intent must be legal_complaint');

  // Test User Correction Detection (Step 9)
  const { detectUserCorrection } = await import('../lib/agents/router');
  const correctionTest = detectUserCorrection('See, the current chief minister name is C Joseph. Why do you tell me?');
  assert(correctionTest.isCorrection === true, 'Factual challenge must be detected as user correction');

  const correctionClassification = classifyIntentAndFreshness('See, the current chief minister name is C Joseph. Why do you tell me?');
  assert(correctionClassification.needsFreshInformation === true, 'User correction must force needsFreshInformation = true');

  // Test Time-Sensitivity Detection
  assert(detectTimeSensitivity('who is the current CM of TN').needsFresh === true, 'Leadership query must be time sensitive');
  assert(detectTimeSensitivity('What is gravity?').needsFresh === false, 'Physics concept must not be time sensitive');

  // Test Knowledge Retriever & Source Ranking
  // Test Knowledge Retriever & Source Ranking (Dynamic Official Portals without hardcoding)
  const cmSources = await knowledgeRetriever.getCurrentInformation('Who is the current Chief Minister of Tamil Nadu?');
  assert(cmSources.length > 0, 'Knowledge retriever should return sources for CM query');
  assert(cmSources[0].snippet.includes('Stalin') || cmSources[0].snippet.includes('Tamil Nadu'), 'CM query should return accurate leadership data');
  assert(cmSources[0].url.includes('tn.gov.in') || cmSources[0].url.includes('wikipedia'), 'CM query should return official/authoritative reference');
  assert(cmSources[0].isOfficial === true || (cmSources[0].authorityTier ?? 5) <= 4, 'CM source should be high authority');

  const sourcesList = await knowledgeRetriever.getSources();
  assert(sourcesList.length >= 5, 'Knowledge retriever should list authoritative source directories');

  // Test Authority Tier Classification
  const govTier = determineAuthorityTier('https://www.tn.gov.in/government/cm');
  assert(govTier.tier === 1, 'tn.gov.in should be Tier 1');
  assert(govTier.isOfficial === true, 'tn.gov.in should be marked official');

  const pyTier = determineAuthorityTier('https://www.python.org/downloads');
  assert(pyTier.tier === 2, 'python.org should be Tier 2');
}

async function main() {
  await verifyGenerateAgoraTokenRoute();
  await verifyGenerateAgoraTokenReplacesZeroUid();
  await verifyChatCompletionsMissingEnv();
  await verifyChatCompletionsInvalidJson();
  await verifyChatCompletionsSseDone();
  await verifyInviteAgentValidation();
  await verifyInviteAgentSuccess();
  await verifyInviteAgentMultilingual();
  await verifyLegalAndKnowledgeAssistant();
  await verifyGeneralPurposeAndCurrentKnowledge();
  await verifyStopConversationValidation();
  await verifyStopConversationSuccess();

  console.log('API contract checks passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
