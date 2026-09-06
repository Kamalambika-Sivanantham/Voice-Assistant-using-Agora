export type LegalIntent =
  | 'general_knowledge'
  | 'legal_question'
  | 'legal_complaint'
  | 'follow_up'
  | 'unclear';

export type LegalCategory =
  | 'consumer_complaint'
  | 'cybercrime_fraud'
  | 'employment_salary'
  | 'rental_landlord'
  | 'property_dispute'
  | 'family_domestic'
  | 'banking_financial'
  | 'police_criminal'
  | 'online_harassment'
  | 'education_dispute'
  | 'government_services'
  | 'traffic_motor_vehicle'
  | 'contract_commercial'
  | 'civil_dispute'
  | 'other';

export type Jurisdiction = {
  country: string;
  state?: string;
  cityOrDistrict?: string;
};

export type LegalSourceInfo = {
  sourceName: string;
  sourceUrl?: string;
  act?: string;
  section?: string;
  rule?: string;
  jurisdiction?: string;
  effectiveDate?: string;
  retrievedAt?: string;
  isOfficial: boolean;
};

export type EvidenceItem = {
  name: string;
  description: string;
  mandatory: boolean;
  category: string;
};

export type LegalActionStep = {
  stepNumber: number;
  title: string;
  action: string;
  timeline?: string;
  forumOrAuthority?: string;
  isImmediate: boolean;
};

export type LegalComplaintState = {
  complaintType?: LegalCategory;
  jurisdiction: Jurisdiction;
  userFacts: string[];
  missingFacts: string[];
  evidenceAvailable: string[];
  possibleLegalArea?: string;
  relevantLaw?: LegalSourceInfo[];
  recommendedActions: LegalActionStep[];
  currentStep: number;
  status: 'initial' | 'gathering_facts' | 'analyzing' | 'action_plan' | 'escalated';
};

export type OfficialPortal = {
  name: string;
  category: LegalCategory;
  url: string;
  helpline?: string;
  description: string;
  jurisdiction: string;
};

