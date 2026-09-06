import { ExtendedIntent, IntentClassificationResult } from '@/lib/knowledge/types';
import { LegalIntent } from '@/lib/legal/types';

/**
 * Contextual Intent Router Guidelines for the LLM.
 *
 * Directs the voice assistant to classify each incoming speech turn
 * into one of the specialized operational modes based on message content,
 * time sensitivity, and prior conversation history.
 */
export const INTENT_ROUTER_GUIDELINES = `
# MULTI-AGENT INTENT ROUTING & KNOWLEDGE DECISION ARCHITECTURE

You dynamically route every user speech turn into the appropriate specialist mode and determine whether fresh live knowledge retrieval is required:

## 1. Intent Classification Categories:
1. **general_knowledge / education / technology / science / math / how_to**:
   - Stable concepts, academic subjects, explanations, code walkthroughs, historical facts, scientific principles.
   - *Examples*: "What is photosynthesis?", "What is artificial intelligence?", "Explain Python functions", "How does gravity work?", "Who was Aryabhata?"
   - *Decision*: **needsFreshInformation = false**. Answer directly from model knowledge in 1 to 4 clear conversational sentences.

2. **current_information / news / leadership / real-time status**:
   - Questions involving current officials, latest software versions, today's news, current prices, current government policies/ministers, or live status.
   - *Key trigger concepts*: "current", "latest", "today", "now", "recently", "this year", "this month", "present", "who is currently", "latest news", "latest version", "current minister", "current Chief Minister", "current Prime Minister", "current President", "current CEO", "current rules", "current scheme", "current status".
   - *Examples*: "Who is the current Chief Minister of Tamil Nadu?", "Who is the current Prime Minister of India?", "What is the latest Python version?", "What is today's headline news?"
   - *Decision*: **needsFreshInformation = true**. Rely strictly on verified, authoritative retrieved information. Never guess or rely on outdated memory.

3. **user_correction / factual_challenge**:
   - When the user questions, corrects, or challenges a factual or current statement (e.g. "No, the current CM is...", "Why do you tell me X?", "Actually, it is Y").
   - *Decision*: **needsFreshInformation = true**. Re-verify and acknowledge that current leadership and rules change over time. Never obstinately defend stale memory against user updates.

4. **government_service**:
   - Applying for passports, Aadhaar, PAN card, driving licenses, voter IDs, or public utility services.
   - *Examples*: "How do I apply for a passport?", "How to update address on Aadhaar?", "How to file an RTI?"
   - *Decision*: **needsFreshInformation = true** (if rules/portals may have updated). Provide exact official portal names (*passportindia.gov.in, uidai.gov.in*) and clear procedural steps.

5. **legal_question**:
   - Informational queries regarding statutory concepts, legal definitions, Acts, or theoretical legal procedures.
   - *Examples*: "What is an FIR?", "What is Section 420?", "How does bail work in India?", "What is Consumer Protection Act?"
   - *Decision*: Route to Legal Agent (Informational mode). Provide an accurate, factual summary without inventing sections.

6. **legal_complaint**:
   - Real-world grievances, disputes, financial fraud, tenancy problems, salary non-payment, consumer defects, or harassment where the user is experiencing an active issue.
   - *Examples*: "My employer has not paid my salary for 2 months.", "My landlord is refusing to return my security deposit.", "Someone took 50,000 rupees from my bank account."
   - *Decision*: Route to Legal Agent (Complaint Resolution mode). Acknowledge grievance, extract missing facts (ask 1-2 focused questions), map to legal category, identify necessary evidence, and construct a step-by-step action plan.

7. **follow_up**:
   - Direct answers to previously asked clarification questions within an ongoing complaint or conversation.
   - *Examples*: "Yes, I have the appointment letter.", "I am located in Bangalore, Karnataka.", "No, they did not give any reason."
   - *Decision*: Maintain conversation context. Progress to the next step without repeating previously asked questions.

8. **unclear / ambiguous**:
   - Vague utterances (e.g. "I want to file a case", "Help me with a problem").
   - *Decision*: Ask one polite, focused question asking what kind of issue or question they have.

## 2. Conversation Continuity & Context Memory:
- Always preserve facts already provided in earlier turns (e.g. city, employer status, agreement existence).
- Never repeatedly ask for information the user already shared.
- Transition seamlessly between general knowledge, current facts, and legal assistance.

## 3. Handling User Corrections & Fact Challenges (CRITICAL):
- If the user corrects or challenges a current fact (e.g. "See, the current CM is..."):
  - DO NOT stubbornly defend your past response.
  - State respectfully that positions change over time, explain that official government records on official state portals (*tn.gov.in, pmindia.gov.in*) provide real-time gazette updates, and accept the user's updated context gracefully.
`;

/**
 * Detects whether an utterance is a user correction or challenge to a previous statement.
 */
export function detectUserCorrection(utterance: string): { isCorrection: boolean; reason?: string } {
  const text = utterance.toLowerCase();
  const correctionTriggers = [
    /\b(no,|no\b.*(current|name is|it is|actually))/i,
    /\b(see,|see\b.*(current|name is|chief minister|prime minister|actually))/i,
    /\b(why do you (tell|say)|why did you (tell|say))\b/i,
    /\b(actually,|that is wrong|that is incorrect|you are wrong|not true|is not the current)\b/i,
    /\b(name is\b.*(not|current|actually))/i,
    /\b(are you sure\b)/i,
  ];

  for (const trigger of correctionTriggers) {
    if (trigger.test(text)) {
      return { isCorrection: true, reason: 'User factual correction/challenge - re-verification triggered' };
    }
  }

  return { isCorrection: false };
}

/**
 * Detects whether an utterance requires fresh/live knowledge retrieval.
 */
export function detectTimeSensitivity(utterance: string): { needsFresh: boolean; reason?: string } {
  const text = utterance.toLowerCase();

  // First check if user is correcting/challenging
  const correction = detectUserCorrection(utterance);
  if (correction.isCorrection) {
    return { needsFresh: true, reason: correction.reason };
  }

  const timeSensitiveTriggers = [
    { pattern: /\b(who is (the )?(current|present)|current (chief minister|cm|prime minister|pm|president|minister|ceo|governor|director))\b/i, reason: 'Current leadership/official query' },
    { pattern: /\b(latest (version|release|update|news|edition|model))\b/i, reason: 'Latest version/release query' },
    { pattern: /\b(today|now|recently|this year|this month|currently|at present|latest)\b/i, reason: 'Explicit temporal marker' },
    { pattern: /\b(current (price|rate|status|rule|rules|law|laws|scheme|guideline|guidelines))\b/i, reason: 'Current rule/status query' },
    { pattern: /\b(chief minister of|prime minister of|president of)\b/i, reason: 'Official leadership query' },
    { pattern: /\b(apply for (a )?(passport|aadhaar|pan card|driving license|voter id))\b/i, reason: 'Government portal procedure query' },
  ];

  for (const trigger of timeSensitiveTriggers) {
    if (trigger.pattern.test(text)) {
      return { needsFresh: true, reason: trigger.reason };
    }
  }

  return { needsFresh: false };
}

/**
 * Comprehensive intent and freshness classifier.
 */
export function classifyIntentAndFreshness(
  utterance: string,
  hasActiveLegalComplaint: boolean = false,
): IntentClassificationResult {
  const text = utterance.toLowerCase().trim();
  const { needsFresh, reason } = detectTimeSensitivity(utterance);
  const correction = detectUserCorrection(utterance);

  let result: IntentClassificationResult;

  // 1. User correction / challenge
  if (correction.isCorrection) {
    result = {
      intent: 'current_information',
      category: 'user_correction_reverification',
      needsFreshInformation: true,
      query: utterance,
      timeSensitivityReason: correction.reason,
      confidence: 0.95,
    };
  }
  // 2. Follow-up detection in active legal complaint
  else if (
    hasActiveLegalComplaint &&
    (text.startsWith('yes') ||
      text.startsWith('no') ||
      text.includes('agreement') ||
      text.includes('bank') ||
      text.includes('slip') ||
      text.includes('karnataka') ||
      text.includes('tamil nadu') ||
      text.includes('delhi') ||
      text.includes('mumbai') ||
      text.length < 50)
  ) {
    result = {
      intent: 'follow_up',
      category: 'complaint_follow_up',
      needsFreshInformation: false,
      query: utterance,
      confidence: 0.95,
    };
  }
  // 3. Legal complaint patterns
  else if (
    [
      'refusing to return',
      'not paid',
      "haven't paid",
      'has not paid',
      'stole',
      'scam',
      'fraud',
      'cheated',
      'hacked',
      'landlord',
      'deposit',
      'salary',
      'harassment',
      'defective',
      'unauthorized transaction',
      'bounced cheque',
      'evict',
    ].some((kw) => text.includes(kw))
  ) {
    result = {
      intent: 'legal_complaint',
      category: 'legal_complaint',
      needsFreshInformation: false,
      query: utterance,
      confidence: 0.95,
    };
  }
  // 4. Legal informational question patterns
  else if (
    [
      'what is an fir',
      'what is section',
      'what is bns',
      'what is crpc',
      'how to file a consumer complaint',
      'what is bail',
      'what is rti',
      'what is rera',
    ].some((kw) => text.includes(kw))
  ) {
    result = {
      intent: 'legal_question',
      category: 'legal_information',
      needsFreshInformation: false,
      query: utterance,
      confidence: 0.9,
    };
  }
  // 5. Government service queries
  else if (
    text.includes('passport') ||
    text.includes('aadhaar') ||
    text.includes('pan card') ||
    text.includes('driving license') ||
    text.includes('government service')
  ) {
    result = {
      intent: 'government_service',
      category: 'government_service',
      needsFreshInformation: true,
      query: utterance,
      timeSensitivityReason: reason || 'Government service procedure',
      confidence: 0.9,
    };
  }
  // 6. Current information queries
  else if (needsFresh) {
    result = {
      intent: 'current_information',
      category: 'current_affairs_leadership',
      needsFreshInformation: true,
      query: utterance,
      timeSensitivityReason: reason,
      confidence: 0.95,
    };
  }
  // 7. Technology & programming queries
  else if (
    text.includes('python') ||
    text.includes('javascript') ||
    text.includes('function') ||
    text.includes('recursion') ||
    text.includes('code') ||
    text.includes('algorithm')
  ) {
    result = {
      intent: 'technology',
      category: 'technology',
      needsFreshInformation: false,
      query: utterance,
      confidence: 0.9,
    };
  }
  // 8. General knowledge / Education
  else {
    result = {
      intent: 'general_knowledge',
      category: 'general_knowledge',
      needsFreshInformation: false,
      query: utterance,
      confidence: 0.85,
    };
  }

  console.log(
    `[ROUTER] query: "${utterance}" | intent: ${result.intent} | needsFreshInformation: ${result.needsFreshInformation} | reason: ${result.timeSensitivityReason || 'N/A'}`,
  );
  return result;
}

/**
 * Backward-compatible helper for legacy tests and callers.
 */
export function classifyUtteranceHeuristic(
  utterance: string,
  hasActiveLegalComplaint: boolean = false,
): LegalIntent {
  const res = classifyIntentAndFreshness(utterance, hasActiveLegalComplaint);
  if (res.intent === 'legal_complaint') return 'legal_complaint';
  if (res.intent === 'legal_question') return 'legal_question';
  if (res.intent === 'follow_up') return 'follow_up';
  if (res.intent === 'unclear') return 'unclear';
  return 'general_knowledge';
}

