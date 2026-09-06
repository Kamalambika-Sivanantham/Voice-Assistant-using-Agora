import { LegalCategory, LegalComplaintState, LegalActionStep } from './types';
import { LEGAL_CATEGORIES_METADATA } from './knowledge';
import { OFFICIAL_LEGAL_PORTALS } from './sources';

/**
 * Creates an initial clean LegalComplaintState
 */
export function createInitialComplaintState(country: string = 'India'): LegalComplaintState {
  return {
    jurisdiction: { country },
    userFacts: [],
    missingFacts: [],
    evidenceAvailable: [],
    recommendedActions: [],
    currentStep: 1,
    status: 'initial',
  };
}

/**
 * Derives practical step-by-step action plan for any legal complaint category.
 */
export function generateActionPlanForCategory(
  category: LegalCategory,
  state?: string,
): LegalActionStep[] {
  const metadata = LEGAL_CATEGORIES_METADATA[category] || LEGAL_CATEGORIES_METADATA.other;
  const portal = OFFICIAL_LEGAL_PORTALS.find((p) => p.category === category);

  const steps: LegalActionStep[] = [];

  switch (category) {
    case 'cybercrime_fraud':
      steps.push(
        {
          stepNumber: 1,
          title: 'Immediate Action: Freeze Accounts & Call 1930',
          action: 'Immediately call the National Cyber Fraud Helpline at 1930 within the golden hour to freeze the beneficiary account, and block your debit/credit card or netbanking access.',
          isImmediate: true,
          timeline: 'Immediately (within 2-4 hours)',
          forumOrAuthority: 'Helpline 1930 / Bank Customer Care',
        },
        {
          stepNumber: 2,
          title: 'File Online Cybercrime Report',
          action: 'Register an official financial fraud complaint on the National Cyber Crime Reporting Portal (cybercrime.gov.in) with transaction reference numbers and SMS screenshots.',
          isImmediate: false,
          timeline: 'Within 24 hours',
          forumOrAuthority: 'cybercrime.gov.in',
        },
        {
          stepNumber: 3,
          title: 'Submit Formal Written Intimation to Home Branch',
          action: 'Submit a written letter along with the cyber complaint acknowledgment to your home bank branch within 72 hours to claim zero customer liability under RBI guidelines.',
          isImmediate: false,
          timeline: 'Within 3 days',
          forumOrAuthority: 'Home Bank Branch Manager',
        },
        {
          stepNumber: 4,
          title: 'Escalation to RBI Ombudsman',
          action: 'If the bank fails to resolve or reimburse unauthorized debits within 30 days, file an escalation on the RBI Complaint Management System (cms.rbi.org.in).',
          isImmediate: false,
          timeline: 'After 30 days',
          forumOrAuthority: 'RBI Ombudsman',
        },
      );
      break;

    case 'rental_landlord':
      steps.push(
        {
          stepNumber: 1,
          title: 'Consolidate Rental Documents & Move-Out Evidence',
          action: 'Organize your signed rental agreement, security deposit payment receipts, written notice to vacate, and photographs or video showing the clean condition of the property at handover.',
          isImmediate: true,
          timeline: 'Immediately',
          forumOrAuthority: 'Self-Documentation',
        },
        {
          stepNumber: 2,
          title: 'Send a Formal Written Demand Notice',
          action: 'Send a formal email or registered letter to the landlord demanding the refund of the deposit within 7 to 15 days, referencing the agreement clauses and handover date.',
          isImmediate: false,
          timeline: '1-2 Days',
          forumOrAuthority: 'Landlord / Written Record',
        },
        {
          stepNumber: 3,
          title: 'Approach State Rent Authority or Consumer Forum',
          action: state
            ? `Approach the local Rent Authority under the ${state} Tenancy Act or file a complaint before the District Consumer Commission / Small Causes Court.`
            : 'Approach the local Rent Authority under your State Tenancy Act or issue a formal advocate notice for recovery of money with interest.',
          isImmediate: false,
          timeline: 'If unresolved after notice',
          forumOrAuthority: metadata.defaultForum,
        },
        {
          stepNumber: 4,
          title: 'Legal Notice & Legal Aid / Counsel',
          action: 'If the landlord still refuses, consult a local legal aid clinic (DLSA) or qualified advocate to issue a statutory legal demand notice.',
          isImmediate: false,
          timeline: 'As needed',
          forumOrAuthority: 'District Legal Services Authority (DLSA) / Legal Counsel',
        },
      );
      break;

    case 'employment_salary':
      steps.push(
        {
          stepNumber: 1,
          title: 'Collect Employment Proof & Unpaid Records',
          action: 'Secure your appointment letter, monthly pay slips, bank credit statements, attendance logs, and all written correspondence regarding unpaid remuneration.',
          isImmediate: true,
          timeline: 'Immediately',
          forumOrAuthority: 'Self-Documentation',
        },
        {
          stepNumber: 2,
          title: 'Submit Formal Written Demand to HR / Management',
          action: 'Send a clear, professional email or registered demand letter to HR and Director specifying the exact unpaid period, calculated amount, and a 7-day payment deadline.',
          isImmediate: false,
          timeline: '1-2 Days',
          forumOrAuthority: 'Employer HR / Management',
        },
        {
          stepNumber: 3,
          title: 'File Grievance on Labour Portal / Labour Commissioner',
          action: 'Register an online conciliation petition on the Samadhan Portal (samadhan.labour.gov.in) or file a complaint before the local Labour Officer / Conciliation Officer.',
          isImmediate: false,
          timeline: 'After deadline expires',
          forumOrAuthority: 'Samadhan Portal / Labour Commissioner',
        },
        {
          stepNumber: 4,
          title: 'Legal Recourse under Payment of Wages / NCLT / Civil Court',
          action: 'If unresolved through conciliation, file a claim under Section 15 of Payment of Wages Act or issue a statutory demand notice through an employment advocate.',
          isImmediate: false,
          timeline: 'As needed',
          forumOrAuthority: 'Labour Court / Advocate',
        },
      );
      break;

    case 'consumer_complaint':
      steps.push(
        {
          stepNumber: 1,
          title: 'Organize Invoice & Evidence of Defect',
          action: 'Keep your purchase tax invoice, warranty card, payment proof, service center job sheets, and photos/videos of the defect or deficiency.',
          isImmediate: true,
          timeline: 'Immediately',
          forumOrAuthority: 'Self-Documentation',
        },
        {
          stepNumber: 2,
          title: 'Send Written Grievance & Register on NCH',
          action: 'Send a final written grievance to the merchant grievance officer and simultaneously register a consumer grievance on National Consumer Helpline (consumerhelpline.gov.in / dial 1915).',
          isImmediate: false,
          timeline: '1-3 Days',
          forumOrAuthority: 'National Consumer Helpline (1915)',
        },
        {
          stepNumber: 3,
          title: 'File Online Consumer Complaint on e-Daakhil',
          action: 'If the merchant does not resolve within 15-30 days, file a formal complaint online on the e-Daakhil portal (edaakhil.nic.in) before the District Consumer Commission.',
          isImmediate: false,
          timeline: 'After 15-30 days',
          forumOrAuthority: 'District Consumer Disputes Redressal Commission (e-Daakhil)',
        },
        {
          stepNumber: 4,
          title: 'Claim Replacement, Refund & Compensation',
          action: 'In the consumer petition, claim refund with interest, replacement, and compensation for mental agony and litigation costs.',
          isImmediate: false,
          timeline: 'During Hearing',
          forumOrAuthority: 'Consumer Forum / Self-Representation or Advocate',
        },
      );
      break;

    default:
      steps.push(
        {
          stepNumber: 1,
          title: 'Document Facts & Gather Written Evidence',
          action: 'Compile all agreements, payment receipts, photos, timestamps, and communications (emails, messages) related to your dispute.',
          isImmediate: true,
          timeline: 'Immediately',
          forumOrAuthority: 'Self-Documentation',
        },
        {
          stepNumber: 2,
          title: 'Send Formal Written Communication',
          action: 'Send a formal written communication stating the facts, your requested remedy, and a reasonable response window (e.g. 7-15 days).',
          isImmediate: false,
          timeline: '1-3 Days',
          forumOrAuthority: 'Opposite Party',
        },
        {
          stepNumber: 3,
          title: 'Approach Designated Statutory Authority or Portal',
          action: `If unresolved, approach the designated statutory forum (${metadata.defaultForum}${portal ? ` / ${portal.url}` : ''}).`,
          isImmediate: false,
          timeline: 'After deadline',
          forumOrAuthority: metadata.defaultForum,
        },
        {
          stepNumber: 4,
          title: 'Consult Qualified Advocate or Legal Aid',
          action: 'If the matter requires litigation or statutory notices, consult the District Legal Services Authority (for free legal aid) or a qualified advocate.',
          isImmediate: false,
          timeline: 'As appropriate',
          forumOrAuthority: 'DLSA / Legal Counsel',
        },
      );
      break;
  }

  return steps;
}

