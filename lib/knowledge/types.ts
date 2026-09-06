export type AuthorityTier = 1 | 2 | 3 | 4 | 5;

export type RetrievedSource = {
  title: string;
  url: string;
  sourceName: string;
  snippet: string;
  retrievedAt: string;
  publishedAt?: string;
  relevance: number;
  isOfficial?: boolean;
  authorityTier?: AuthorityTier;
  category?: string;
  jurisdiction?: string;
};

export type KnowledgeRetrievalOptions = {
  maxResults?: number;
  prioritizeOfficial?: boolean;
  category?: string;
  jurisdiction?: string;
  timeSensitive?: boolean;
  timeoutMs?: number;
};

export interface KnowledgeRetriever {
  search(query: string, options?: KnowledgeRetrievalOptions): Promise<RetrievedSource[]>;
  retrieve(query: string, options?: KnowledgeRetrievalOptions): Promise<RetrievedSource[]>;
  getSources(): Promise<string[]>;
  getCurrentInformation(query: string, category?: string): Promise<RetrievedSource[]>;
}

export type ExtendedIntent =
  | 'general_knowledge'
  | 'current_information'
  | 'legal_question'
  | 'legal_complaint'
  | 'how_to'
  | 'education'
  | 'technology'
  | 'news'
  | 'government_service'
  | 'follow_up'
  | 'unclear';

export type IntentClassificationResult = {
  intent: ExtendedIntent;
  category: string;
  needsFreshInformation: boolean;
  query: string;
  timeSensitivityReason?: string;
  confidence: number;
};

