import { EvidenceItem, LegalCategory } from './types';
import { OFFICIAL_LEGAL_PORTALS } from './sources';

export type CategoryMetadata = {
  id: LegalCategory;
  name: string;
  description: string;
  primaryActs: string[];
  keyEvidence: EvidenceItem[];
  defaultForum: string;
  officialHelpline?: string;
  initialQuestionPrompt: string;
};

/**
 * Stable, structured category taxonomy for Indian Law and complaints.
 * Acts and procedures are linked to authoritative official repositories.
 */
export const LEGAL_CATEGORIES_METADATA: Record<LegalCategory, CategoryMetadata> = {
  consumer_complaint: {
    id: 'consumer_complaint',
    name: 'Consumer Dispute / Defective Goods or Services',
    description: 'Disputes with sellers, e-commerce platforms, service providers, or manufacturers regarding defective products, refund denial, or deficiency in service.',
    primaryActs: ['Consumer Protection Act, 2019'],
    defaultForum: 'District Consumer Disputes Redressal Commission / e-Daakhil / National Consumer Helpline (1915)',
    officialHelpline: '1915 (NCH)',
    initialQuestionPrompt: 'Did you purchase this product or service for personal use, and do you have the invoice and written communication with the seller?',
    keyEvidence: [
      { name: 'Purchase Invoice / Tax Bill', description: 'Proof of transaction and date of purchase', mandatory: true, category: 'Transaction' },
      { name: 'Payment Receipt / Bank Statement', description: 'Proof of payment to the merchant', mandatory: true, category: 'Payment' },
      { name: 'Written Grievance Email / Tickets', description: 'Copies of emails, support tickets, or registered letters sent to customer care', mandatory: true, category: 'Communication' },
      { name: 'Photographs / Service Report', description: 'Visual or technical proof of defect or incomplete service', mandatory: false, category: 'Product' },
    ],
  },
  cybercrime_fraud: {
    id: 'cybercrime_fraud',
    name: 'Cybercrime / Online Financial Fraud / Identity Theft',
    description: 'Unauthorized bank withdrawals, UPI fraud, phishing, identity theft, unauthorized SIM swaps, or cyber blackmail.',
    primaryActs: ['Information Technology Act, 2000', 'Bharatiya Nyaya Sanhita, 2023 (or IPC)'],
    defaultForum: 'National Cyber Crime Reporting Portal (cybercrime.gov.in) & Local Cyber Police Station',
    officialHelpline: '1930 (Cyber Fraud Helpline)',
    initialQuestionPrompt: 'When did this unauthorized transaction happen, and have you already notified your bank and called 1930 to freeze the funds?',
    keyEvidence: [
      { name: 'Bank Statement / UPI Debit Alerts', description: 'Transaction reference numbers, recipient UPI IDs/accounts, and timestamps', mandatory: true, category: 'Financial' },
      { name: 'Fraudulent Messages / Links', description: 'Screenshots of SMS, WhatsApp messages, deceptive web links, or caller numbers', mandatory: true, category: 'Digital Evidence' },
      { name: 'Bank Intimation Acknowledgment', description: 'Proof of prompt notification to the bank within the golden hour / 72 hours', mandatory: true, category: 'Communication' },
    ],
  },
  employment_salary: {
    id: 'employment_salary',
    name: 'Employment / Unpaid Salary / Wrongful Termination',
    description: 'Withholding of earned wages, non-payment of full-and-final settlement, wrongful dismissal, or provident fund disputes.',
    primaryActs: ['Payment of Wages Act, 1936', 'Industrial Disputes Act, 1947', 'State Shops & Commercial Establishments Act'],
    defaultForum: 'Conciliation Officer / Labour Commissioner / Labour Court / Samadhan Portal',
    officialHelpline: 'Samadhan Portal (samadhan.labour.gov.in)',
    initialQuestionPrompt: 'Are you currently working there or have you resigned, and do you have an appointment letter or salary slips?',
    keyEvidence: [
      { name: 'Appointment Letter / Employment Contract', description: 'Shows terms of service, designation, and agreed remuneration', mandatory: true, category: 'Employment' },
      { name: 'Salary Slips / Bank Credit Statements', description: 'Records of past salary credits demonstrating employment and compensation history', mandatory: true, category: 'Financial' },
      { name: 'Written Resignation & Demand Emails', description: 'Formal written demand for release of unpaid wages or full-and-final dues', mandatory: true, category: 'Communication' },
      { name: 'Timesheets / Attendance Records', description: 'Proof of work done during the period of unpaid salary', mandatory: false, category: 'Employment' },
    ],
  },
  rental_landlord: {
    id: 'rental_landlord',
    name: 'Tenancy / Landlord-Tenant / Security Deposit Dispute',
    description: 'Refusal to refund security deposit upon vacating, arbitrary rent hikes, unlawful eviction, or property maintenance conflicts.',
    primaryActs: ['State Tenancy / Rent Control Act', 'Transfer of Property Act, 1882'],
    defaultForum: 'Rent Authority / Rent Court / Small Causes Court / Legal Notice',
    initialQuestionPrompt: 'Do you have a written rental agreement, and what reasons did the landlord give for withholding the deposit?',
    keyEvidence: [
      { name: 'Rental Agreement / Lease Deed', description: 'Stamped agreement outlining deposit amount, notice period, and refund terms', mandatory: true, category: 'Contract' },
      { name: 'Security Deposit Payment Proof', description: 'Bank transfer receipt, cheque record, or acknowledgement of deposit payment', mandatory: true, category: 'Payment' },
      { name: 'Notice to Vacate & Key Handover Proof', description: 'Written notice given to landlord and proof that possession was handed over peacefully', mandatory: true, category: 'Communication' },
      { name: 'Property Condition Photos / Videos', description: 'Proof of the state of the property at time of vacating to counter false damage deductions', mandatory: false, category: 'Evidence' },
    ],
  },
  banking_financial: {
    id: 'banking_financial',
    name: 'Banking / Loan / Credit Card / Unfair Recovery Practices',
    description: 'Unfair interest rate calculations, harassment by loan recovery agents, uncredited refunds, or unauthorized insurance deductions.',
    primaryActs: ['Banking Regulation Act, 1949', 'RBI Integrated Ombudsman Scheme, 2021'],
    defaultForum: 'Bank Internal Grievance Officer / Principal Nodal Officer / RBI Ombudsman (cms.rbi.org.in)',
    officialHelpline: '14448 (RBI CMS Helpline)',
    initialQuestionPrompt: 'Have you raised a formal complaint with the bank\'s grievance department, and has 30 days passed without a resolution?',
    keyEvidence: [
      { name: 'Loan Account / Credit Card Statement', description: 'Statements demonstrating disputed charge, interest levy, or fee', mandatory: true, category: 'Financial' },
      { name: 'Bank Complaint Reference Number', description: 'Proof of initial written complaint filed with branch or grievance officer', mandatory: true, category: 'Communication' },
      { name: 'Record of Agent Harassment', description: 'Call recordings, timestamped call logs, or messages from aggressive recovery agents', mandatory: false, category: 'Evidence' },
    ],
  },
  property_dispute: {
    id: 'property_dispute',
    name: 'Real Estate / Builder Delay / Property Ownership Dispute',
    description: 'Delayed possession of apartment/flat, unauthorized construction, title encroachment, or failure to register sale deed.',
    primaryActs: ['Real Estate (Regulation and Development) Act, 2016 (RERA)', 'Specific Relief Act, 1963'],
    defaultForum: 'State Real Estate Regulatory Authority (State RERA) / Civil Court',
    initialQuestionPrompt: 'Is the property project registered under State RERA, and what is the promised handover date in your agreement?',
    keyEvidence: [
      { name: 'Builder-Buyer Agreement / Allotment Letter', description: 'Stamped contract detailing milestone payments and possession timeline', mandatory: true, category: 'Contract' },
      { name: 'Payment Receipts / Demand Letters', description: 'Proof of all instalments paid to the builder', mandatory: true, category: 'Payment' },
      { name: 'RERA Registration Details', description: 'RERA project registration number and declared completion date', mandatory: true, category: 'Registration' },
    ],
  },
  family_domestic: {
    id: 'family_domestic',
    name: 'Family Law / Domestic Grievance / Maintenance',
    description: 'Marital disputes, maintenance claims, domestic violence protection, custody, or elder care.',
    primaryActs: ['Protection of Women from Domestic Violence Act, 2005', 'Hindu Marriage Act / Special Marriage Act / Relevant Personal Law', 'Maintenance and Welfare of Parents and Senior Citizens Act, 2007'],
    defaultForum: 'Protection Officer / Magistrate Court / Family Court / DLSA Free Legal Aid',
    officialHelpline: '1091 (Women Helpline) / 181',
    initialQuestionPrompt: 'Are you or anyone in immediate physical danger? If so, please reach out to emergency services immediately.',
    keyEvidence: [
      { name: 'Marriage Certificate / Proof of Relationship', description: 'Official record of marriage or domestic relationship', mandatory: false, category: 'Legal Status' },
      { name: 'Medical Records / Photographs', description: 'Records of injury or treatment if physical harm is involved', mandatory: false, category: 'Evidence' },
      { name: 'Financial Records of Parties', description: 'Income tax returns, salary slips, or bank statements for maintenance calculation', mandatory: false, category: 'Financial' },
    ],
  },
  police_criminal: {
    id: 'police_criminal',
    name: 'Police Grievance / First Information Report (FIR) / Criminal Complaint',
    description: 'Filing an FIR, refusal of police station to register complaint, cognizable offences, theft, or assault.',
    primaryActs: ['Bharatiya Nagarik Suraksha Sanhita, 2023 (or Code of Criminal Procedure, 1973)', 'Bharatiya Nyaya Sanhita, 2023 (or IPC)'],
    defaultForum: 'Station House Officer (SHO) / Superintendent of Police (SP/DCP) / Judicial Magistrate under Section 175 BNSS / 156(3) CrPC',
    officialHelpline: '112 (Emergency)',
    initialQuestionPrompt: 'Did you visit the local police station to submit a written complaint, and did they provide an acknowledgment or CSR/Zero FIR?',
    keyEvidence: [
      { name: 'Written Complaint Copy', description: 'Signed and dated complaint describing date, time, place, and persons involved', mandatory: true, category: 'Complaint' },
      { name: 'Station Acknowledgment / Postal Slip', description: 'Stamp of receipt from police station or registered post acknowledgment to SP', mandatory: true, category: 'Procedural' },
      { name: 'Supporting Evidence / Witnesses', description: 'CCTV footage, medical MLC report, eyewitness contact, or digital records', mandatory: false, category: 'Evidence' },
    ],
  },
  online_harassment: {
    id: 'online_harassment',
    name: 'Online Harassment / Defamation / Cyber Stalking',
    description: 'Abusive messages, non-consensual image sharing, digital stalking, or public defamation across social platforms.',
    primaryActs: ['Information Technology Act, 2000', 'Bharatiya Nyaya Sanhita, 2023'],
    defaultForum: 'National Cyber Crime Portal / Social Media Grievance Officer / Cyber Police',
    officialHelpline: '1930 / 112',
    initialQuestionPrompt: 'Have you taken high-resolution screenshots and preserved the profile URLs and message links before blocking the sender?',
    keyEvidence: [
      { name: 'Screenshots with Timestamps & URLs', description: 'Clear images showing handle/URL, date, time, and full content of abuse', mandatory: true, category: 'Digital Evidence' },
      { name: 'Platform Report Reference', description: 'Confirmation of report submitted to platform grievance officer', mandatory: false, category: 'Communication' },
    ],
  },
  education_dispute: {
    id: 'education_dispute',
    name: 'Education / School or University Fee Dispute / Certificate Withholding',
    description: 'Institutions refusing to return original certificates, denying valid fee refunds upon withdrawal, or UGC regulation violations.',
    primaryActs: ['UGC (Redressal of Grievances of Students) Regulations', 'State Educational Institutions Act'],
    defaultForum: 'Student Grievance Redressal Committee (SGRC) / State Education Department / Consumer Forum',
    initialQuestionPrompt: 'Did you submit a written withdrawal request, and what regulation does the institution cite for withholding fees or certificates?',
    keyEvidence: [
      { name: 'Admission Receipt & Prospectus', description: 'Proof of fees paid and terms regarding refund published in brochure', mandatory: true, category: 'Financial' },
      { name: 'Written Request for Certificate Return', description: 'Formal request sent with acknowledgment from institution management', mandatory: true, category: 'Communication' },
    ],
  },
  government_services: {
    id: 'government_services',
    name: 'Government Services / Right to Information (RTI) / Citizen Charter Delay',
    description: 'Undue delay in issuing caste/income certificates, passport issues, municipal delays, or obtaining official information.',
    primaryActs: ['Right to Information Act, 2005', 'State Right to Public Services Acts'],
    defaultForum: 'Public Information Officer (PIO) / First Appellate Authority / State RTI Commission / CM Helpline',
    initialQuestionPrompt: 'Have you filed an application with an acknowledgment number, or do you need to submit an RTI query?',
    keyEvidence: [
      { name: 'Application Form & Receipt Number', description: 'Proof of submission and official tracking ID', mandatory: true, category: 'Government Record' },
      { name: 'Citizen Charter / Service Timeline', description: 'Prescribed government SLA for the service delivery', mandatory: false, category: 'Statutory' },
    ],
  },
  traffic_motor_vehicle: {
    id: 'traffic_motor_vehicle',
    name: 'Traffic / Motor Vehicle / Accident & Insurance Claim',
    description: 'Wrongful e-challan, third-party motor accident claims, vehicle insurance repudiation.',
    primaryActs: ['Motor Vehicles (Amendment) Act, 2019', 'Insurance Act, 1938'],
    defaultForum: 'Traffic Virtual Court / Motor Accident Claims Tribunal (MACT) / Insurance Ombudsman',
    initialQuestionPrompt: 'Is this regarding an incorrect traffic challan or a vehicle insurance claim?',
    keyEvidence: [
      { name: 'E-challan Notice / Vehicle RC & Insurance', description: 'Challan photo, vehicle registration and valid policy copy', mandatory: true, category: 'Vehicle' },
      { name: 'FIR / Spot Inspection Report', description: 'Required for accident/third-party claim settlements', mandatory: false, category: 'Police' },
    ],
  },
  contract_commercial: {
    id: 'contract_commercial',
    name: 'Contract / Freelancer Dues / Breach of Agreement',
    description: 'Client refusing payment for completed freelance work, breach of service contracts, or vendor disputes.',
    primaryActs: ['Indian Contract Act, 1872', 'Micro, Small and Medium Enterprises Development (MSMED) Act, 2006 (Samadhaan)'],
    defaultForum: 'MSME Facilitation Council (if registered) / Civil Court / Commercial Court / Mediation',
    initialQuestionPrompt: 'Do you have a signed agreement or email work orders with approval of the delivered deliverables?',
    keyEvidence: [
      { name: 'Contract / Work Order / Email Agreement', description: 'Signed terms specifying scope, milestone fees, and delivery sign-offs', mandatory: true, category: 'Contract' },
      { name: 'Invoices & Delivery Proof', description: 'Submitted deliverables, git commits, or client approval emails', mandatory: true, category: 'Delivery' },
      { name: 'Formal Demand Notice', description: 'Notice calling upon counterparty to clear outstanding within 15-30 days', mandatory: true, category: 'Legal Notice' },
    ],
  },
  civil_dispute: {
    id: 'civil_dispute',
    name: 'General Civil Dispute / Monetary Recovery',
    description: 'Recovery of personal loans given on promissory note, boundary disputes, or civil damages.',
    primaryActs: ['Code of Civil Procedure, 1908', 'Specific Relief Act, 1963', 'Negotiable Instruments Act, 1881 (Sec 138 for bounced cheque)'],
    defaultForum: 'District Legal Services Authority (DLSA) / Lok Adalat / Civil Court / Judicial Magistrate (for 138 NI Act)',
    initialQuestionPrompt: 'Is there a cheque bounce, promissory note, or written agreement showing the debt obligation?',
    keyEvidence: [
      { name: 'Cheque / Promissory Note / Written Deed', description: 'Original instrument showing debt and signatures', mandatory: true, category: 'Instrument' },
      { name: 'Bank Return Memo', description: 'For bounced cheques: memo showing "Funds Insufficient" within statutory timeline', mandatory: false, category: 'Banking' },
    ],
  },
  other: {
    id: 'other',
    name: 'General Legal Query / Miscellaneous Legal Matter',
    description: 'Any legal query or problem not fitting the specific standard categories above.',
    primaryActs: ['Constitution of India', 'Applicable Central & State Laws'],
    defaultForum: 'District Legal Services Authority (DLSA) / Appropriate Statutory Authority',
    initialQuestionPrompt: 'Please share the key facts of what happened, when it occurred, and what state you are located in.',
    keyEvidence: [
      { name: 'All Relevant Written Communications & Receipts', description: 'Comprehensive documentary trail of the dispute', mandatory: true, category: 'General' },
    ],
  },
};

/**
 * Common state identification helper.
 * Ensures the assistant NEVER assumes Tamil Nadu or any single state
 * unless the user specifies it.
 */
export const JURISDICTION_GUIDELINES = `
- **Jurisdiction Awareness**: In India, tenancy, police procedure, shops/establishments, land revenue, and municipal rules vary significantly by State.
- **Never Assume State**: Never assume Tamil Nadu or Delhi by default. If the dispute depends on state law (like rental laws, shops & establishments, police circulars), always ask the user for their state/city.
`;

