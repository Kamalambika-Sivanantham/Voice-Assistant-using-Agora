import { KnowledgeRetrievalOptions, KnowledgeRetriever, RetrievedSource } from './types';
import { executeWebSearch } from './web-retriever';

/**
 * Unified Knowledge Retriever providing live, authoritative, and cached information retrieval.
 */
export class DefaultKnowledgeRetriever implements KnowledgeRetriever {
  private cache = new Map<string, { timestamp: number; results: RetrievedSource[] }>();
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute cache for voice turn consistency

  async search(query: string, options: KnowledgeRetrievalOptions = {}): Promise<RetrievedSource[]> {
    const cacheKey = `${query.toLowerCase().trim()}_${options.category || 'all'}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.results;
    }

    const results = await executeWebSearch(query, options);
    this.cache.set(cacheKey, { timestamp: Date.now(), results });
    return results;
  }

  async retrieve(query: string, options: KnowledgeRetrievalOptions = {}): Promise<RetrievedSource[]> {
    return this.search(query, options);
  }

  async getSources(): Promise<string[]> {
    return [
      'Official Government of India Portals (*.gov.in, *.nic.in)',
      'State Government Portals (tn.gov.in, karnataka.gov.in, etc.)',
      'National Consumer Helpline (consumerhelpline.gov.in / 1915)',
      'National Cyber Crime Reporting Portal (cybercrime.gov.in / 1930)',
      'India Code Legislative Repository (indiacode.nic.in)',
      'eCourts & Supreme Court of India (ecourts.gov.in, sci.gov.in)',
      'Official Project & Language Foundations (python.org, w3.org, nodejs.org)',
      'Verified Encyclopedia & Knowledge Graphs (Wikipedia Open Knowledge API)',
    ];
  }

  async getCurrentInformation(query: string, category?: string): Promise<RetrievedSource[]> {
    return this.search(query, { category, timeSensitive: true, prioritizeOfficial: true });
  }
}

export const knowledgeRetriever = new DefaultKnowledgeRetriever();

