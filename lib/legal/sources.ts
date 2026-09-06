import { LegalCategory, LegalSourceInfo, OfficialPortal } from './types';

/**
 * Official Authoritative Indian Legal Sources Registry.
 *
 * Provides verified metadata for central and state legal portals,
 * statutory repositories, and dispute resolution helplines.
 */
export const OFFICIAL_LEGAL_PORTALS: OfficialPortal[] = [
  {
    name: 'National Consumer Helpline (NCH)',
    category: 'consumer_complaint',
    url: 'https://consumerhelpline.gov.in',
    helpline: '1915',
    description: 'Central portal and toll-free helpline for pre-litigation consumer grievance registration across India.',
    jurisdiction: 'India (National)',
  },
  {
    name: 'e-Daakhil Portal',
    category: 'consumer_complaint',
    url: 'https://edaakhil.nic.in',
    description: 'Official portal for filing consumer complaints online before District, State, and National Consumer Commissions under Consumer Protection Act 2019.',
    jurisdiction: 'India (National)',
  },
  {
    name: 'National Cyber Crime Reporting Portal',
    category: 'cybercrime_fraud',
    url: 'https://cybercrime.gov.in',
    helpline: '1930',
    description: 'Ministry of Home Affairs portal for reporting cyber financial fraud, online harassment, and digital crimes.',
    jurisdiction: 'India (National)',
  },
  {
    name: 'Samadhan Portal (Ministry of Labour & Employment)',
    category: 'employment_salary',
    url: 'https://samadhan.labour.gov.in',
    description: 'Online conciliation and dispute resolution portal for industrial and wage disputes under Central Sphere.',
    jurisdiction: 'India (Central Sphere)',
  },
  {
    name: 'eCourts Services Portal',
    category: 'civil_dispute',
    url: 'https://ecourts.gov.in',
    description: 'National eCourts portal for case status tracking, cause lists, and electronic filing in District and High Courts.',
    jurisdiction: 'India (National)',
  },
  {
    name: 'India Code (Legislative Department)',
    category: 'other',
    url: 'https://www.indiacode.nic.in',
    description: 'Digital repository of all Central and State Acts, statutory rules, regulations, and notifications.',
    jurisdiction: 'India (National)',
  },
  {
    name: 'Emergency Response Support System (ERSS)',
    category: 'police_criminal',
    url: 'https://112.gov.in',
    helpline: '112',
    description: 'All-in-one nationwide emergency service number for Police, Fire, and Ambulance emergencies.',
    jurisdiction: 'India (National)',
  },
  {
    name: 'National Women Helpline',
    category: 'family_domestic',
    url: 'http://ncw.nic.in',
    helpline: '1091 / 181',
    description: '24x7 emergency and support helpline for women in distress, domestic violence, or harassment.',
    jurisdiction: 'India (National)',
  },
  {
    name: 'RBI Sachet Portal & CMS (Consumer Grievances)',
    category: 'banking_financial',
    url: 'https://cms.rbi.org.in',
    helpline: '14448',
    description: 'Reserve Bank of India portal for filing complaints against regulated banks, NBFCs, and payment systems.',
    jurisdiction: 'India (National)',
  },
];

/**
 * Interface for pluggable Legal Knowledge / RAG Retrieval Provider.
 * Allows seamless integration of vector databases (Qdrant, Pinecone, Chroma)
 * or live statutory API search engines.
 */
export interface LegalKnowledgeRetriever {
  retrieve(query: string, category?: LegalCategory, jurisdiction?: string): Promise<LegalSourceInfo[]>;
}

/**
 * In-memory fallback retriever adhering to authoritative facts.
 * Avoids any hallucinated sections and provides verified statutory pointers.
 */
export class AuthoritativeKnowledgeRetriever implements LegalKnowledgeRetriever {
  async retrieve(
    query: string,
    category?: LegalCategory,
    jurisdiction: string = 'India',
  ): Promise<LegalSourceInfo[]> {
    const timestamp = new Date().toISOString();
    const sources: LegalSourceInfo[] = [];

    if (category === 'consumer_complaint') {
      sources.push({
        sourceName: 'Consumer Protection Act, 2019',
        sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15256',
        act: 'Consumer Protection Act, 2019 (Act No. 35 of 2019)',
        section: 'Sections 2(7), 35 (District Commission), Section 38 (Procedure)',
        jurisdiction: 'India (National)',
        effectiveDate: '2020-07-20',
        retrievedAt: timestamp,
        isOfficial: true,
      });
    } else if (category === 'cybercrime_fraud') {
      sources.push({
        sourceName: 'Information Technology Act, 2000 & Bharatiya Nyaya Sanhita, 2023',
        sourceUrl: 'https://cybercrime.gov.in',
        act: 'IT Act, 2000 & BNS, 2023',
        section: 'IT Act Section 66D (Cheating by personation using computer resource), Section 43',
        jurisdiction: 'India (National)',
        effectiveDate: '2000-10-17',
        retrievedAt: timestamp,
        isOfficial: true,
      });
    } else if (category === 'employment_salary') {
      sources.push({
        sourceName: 'Payment of Wages Act, 1936 / Industrial Disputes Act, 1947 / State Shops & Establishments Act',
        sourceUrl: 'https://samadhan.labour.gov.in',
        act: 'Payment of Wages Act, 1936 & State Shops & Commercial Establishments Acts',
        section: 'Section 15 (Claims arising out of deductions from wages or delay in payment)',
        jurisdiction: jurisdiction,
        effectiveDate: '1936-04-23',
        retrievedAt: timestamp,
        isOfficial: true,
      });
    } else if (category === 'rental_landlord') {
      sources.push({
        sourceName: 'State Rent Control / Tenancy Act & Transfer of Property Act, 1882',
        sourceUrl: 'https://www.indiacode.nic.in',
        act: 'State Specific Tenancy Act (e.g., Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017 / Karnataka Rent Control Act / Delhi Rent Control Act)',
        section: 'Provisions governing security deposits and Rent Court adjudication',
        jurisdiction: jurisdiction,
        effectiveDate: 'Varies by State',
        retrievedAt: timestamp,
        isOfficial: true,
      });
    } else if (category === 'banking_financial') {
      sources.push({
        sourceName: 'RBI Integrated Ombudsman Scheme, 2021 & Banking Regulation Act, 1949',
        sourceUrl: 'https://cms.rbi.org.in',
        act: 'Reserve Bank of India Integrated Ombudsman Scheme, 2021',
        jurisdiction: 'India (National)',
        effectiveDate: '2021-11-12',
        retrievedAt: timestamp,
        isOfficial: true,
      });
    }

    return sources;
  }
}

export const defaultKnowledgeRetriever = new AuthoritativeKnowledgeRetriever();

