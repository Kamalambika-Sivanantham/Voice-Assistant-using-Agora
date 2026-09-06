import { LEGAL_SYSTEM_PROMPT_GUIDELINES } from '@/lib/legal/prompts';
import { LEGAL_CATEGORIES_METADATA, JURISDICTION_GUIDELINES } from '@/lib/legal/knowledge';
import { OFFICIAL_LEGAL_PORTALS } from '@/lib/legal/sources';

/**
 * Builds the complete domain knowledge and operational guidelines for the Legal Agent.
 */
export function getLegalAgentInstructions(): string {
  const categorySummaries = Object.values(LEGAL_CATEGORIES_METADATA)
    .map(
      (cat) =>
        `- **${cat.name}** (${cat.id}): Relevant Acts: ${cat.primaryActs.join(', ')}. Typical Forum: ${cat.defaultForum}.${cat.officialHelpline ? ` Helpline: ${cat.officialHelpline}.` : ''}`,
    )
    .join('\n');

  const portalSummaries = OFFICIAL_LEGAL_PORTALS.map(
    (p) => `- **${p.name}** (${p.jurisdiction}): ${p.url} ${p.helpline ? `(Helpline: ${p.helpline})` : ''} — ${p.description}`,
  ).join('\n');

  return `
${LEGAL_SYSTEM_PROMPT_GUIDELINES}

${JURISDICTION_GUIDELINES}

## VERIFIED STATUTORY CATEGORIES & FORUMS IN INDIA:
${categorySummaries}

## OFFICIAL GOVERNMENT COMPLAINT PORTALS & HELPLINES:
${portalSummaries}
`;
}

