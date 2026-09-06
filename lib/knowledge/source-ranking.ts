import { AuthorityTier, RetrievedSource } from './types';

/**
 * Categorizes the authority tier of a URL based on its domain.
 */
export function determineAuthorityTier(urlStr: string): { tier: AuthorityTier; isOfficial: boolean; sourceName: string } {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();

    // Tier 1: Official government domains
    if (
      hostname.endsWith('.gov.in') ||
      hostname.endsWith('.nic.in') ||
      hostname.endsWith('.gov') ||
      hostname.includes('tn.gov.in') ||
      hostname.includes('karnataka.gov.in') ||
      hostname.includes('maharashtra.gov.in') ||
      hostname.includes('delhi.gov.in') ||
      hostname.includes('india.gov.in') ||
      hostname.includes('indiacode.nic.in') ||
      hostname.includes('ecourts.gov.in') ||
      hostname.includes('sci.gov.in') ||
      hostname.includes('cybercrime.gov.in') ||
      hostname.includes('consumerhelpline.gov.in') ||
      hostname.includes('samadhan.labour.gov.in') ||
      hostname.includes('rbi.org.in') ||
      hostname.includes('pib.gov.in')
    ) {
      const parts = hostname.split('.');
      const cleanName = parts.length > 2 ? parts[parts.length - 3] : parts[0];
      return {
        tier: 1,
        isOfficial: true,
        sourceName: `Official Government Portal (${cleanName.toUpperCase()})`,
      };
    }

    // Tier 2: Official standard bodies and primary project organizations
    if (
      hostname.endsWith('python.org') ||
      hostname.endsWith('w3.org') ||
      hostname.endsWith('who.int') ||
      hostname.endsWith('isro.gov.in') ||
      hostname.endsWith('un.org') ||
      hostname.endsWith('agora.io') ||
      hostname.endsWith('github.com') ||
      hostname.endsWith('nodejs.org') ||
      hostname.endsWith('react.dev') ||
      hostname.endsWith('nextjs.org')
    ) {
      return {
        tier: 2,
        isOfficial: true,
        sourceName: `Official Organization (${hostname})`,
      };
    }

    // Tier 3: Universities and educational / research institutes
    if (hostname.endsWith('.edu') || hostname.endsWith('.ac.in') || hostname.endsWith('.edu.in')) {
      return {
        tier: 3,
        isOfficial: false,
        sourceName: `Academic / Educational Institution (${hostname})`,
      };
    }

    // Tier 4: Reputable news and major reference repositories
    if (
      hostname.includes('wikipedia.org') ||
      hostname.includes('thehindu.com') ||
      hostname.includes('indianexpress.com') ||
      hostname.includes('reuters.com') ||
      hostname.includes('bbc.com') ||
      hostname.includes('ndtv.com') ||
      hostname.includes('timesofindia.indiatimes.com') ||
      hostname.includes('hindustantimes.com') ||
      hostname.includes('nature.com') ||
      hostname.includes('britannica.com')
    ) {
      return {
        tier: 4,
        isOfficial: false,
        sourceName: `Established Reference / News (${hostname})`,
      };
    }

    // Tier 5: General web source
    return {
      tier: 5,
      isOfficial: false,
      sourceName: hostname,
    };
  } catch {
    return {
      tier: 5,
      isOfficial: false,
      sourceName: 'Web Source',
    };
  }
}

/**
 * Calculates a relevance score (0 to 1) based on query keywords, title match, and snippet match.
 */
export function calculateRelevance(query: string, title: string, snippet: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (queryTerms.length === 0) return 0.5;

  let titleMatches = 0;
  let snippetMatches = 0;

  const titleLower = title.toLowerCase();
  const snippetLower = snippet.toLowerCase();

  for (const term of queryTerms) {
    if (titleLower.includes(term)) titleMatches += 1;
    if (snippetLower.includes(term)) snippetMatches += 1;
  }

  const titleScore = titleMatches / queryTerms.length;
  const snippetScore = snippetMatches / queryTerms.length;

  return Math.min(1.0, Math.max(0.1, titleScore * 0.6 + snippetScore * 0.4));
}

/**
 * Ranks and sorts retrieved sources, placing official and high-authority sources first.
 */
export function rankSources(sources: RetrievedSource[], query: string): RetrievedSource[] {
  return sources
    .map((source) => {
      const { tier, isOfficial, sourceName } = determineAuthorityTier(source.url);
      const textRelevance = calculateRelevance(query, source.title, source.snippet);

      // Authority multiplier: Tier 1 gets 2.0x, Tier 2 gets 1.6x, Tier 3 gets 1.3x, Tier 4 gets 1.1x, Tier 5 gets 0.8x
      const tierMultipliers: Record<AuthorityTier, number> = {
        1: 2.0,
        2: 1.6,
        3: 1.3,
        4: 1.1,
        5: 0.8,
      };

      const finalRelevance = Math.min(1.0, textRelevance * (tierMultipliers[tier] || 1.0));

      return {
        ...source,
        sourceName: source.sourceName || sourceName,
        isOfficial: source.isOfficial ?? isOfficial,
        authorityTier: tier,
        relevance: Number(finalRelevance.toFixed(2)),
      };
    })
    .sort((a, b) => {
      // Sort by Tier ascending (Tier 1 first)
      if ((a.authorityTier || 5) !== (b.authorityTier || 5)) {
        return (a.authorityTier || 5) - (b.authorityTier || 5);
      }
      // Then sort by relevance descending
      return b.relevance - a.relevance;
    });
}

