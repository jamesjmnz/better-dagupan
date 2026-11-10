/**
 * Citizen's Charter Service Types
 *
 * Types for the Citizen's Charter service data transcribed from the LGU's
 * published Citizen's Charter pages.
 *
 * Every text field holds the city's wording as printed. A field the page does
 * not state is null or [], which means "not verified yet", never "does not
 * exist"; see docs/civic-data-verification.md.
 */

/**
 * A single requirement for a service
 */
export interface Requirement {
  /** Name of the requirement */
  requirement: string;
  /**
   * Source office or agency where to secure the requirement, as printed.
   * Null when the charter leaves the cell blank.
   */
  where_to_secure: string | null;
  /** Number of copies required */
  copies?: string;
  /** Optional: Link to related service page if this requirement is itself a service */
  serviceSlug?: string;
}

/**
 * A single supporting document with details
 */
export interface SupportingDocument {
  /** Name of the document */
  document: string;
  /** Source office or agency where to secure the document */
  where_to_secure: string;
  /** Number of copies required */
  copies?: string;
  /** Additional notes about the document */
  note?: string;
}

/**
 * Detailed supporting documents structure for complex requirements
 */
export interface SupportingDocumentsDetail {
  /** Main instruction for submitting documents */
  instruction: string;
  /** Optional: Mandatory requirements that must be submitted */
  mandatory_requirements?: {
    /** Instruction for mandatory requirements */
    instruction: string;
    /** List of mandatory documents */
    documents: SupportingDocument[];
  };
  /** Optional: Primary documents to choose from */
  primary_documents?: SupportingDocument[];
  /** Optional: Additional documents that may be required */
  additional_documents?: {
    /** Instruction for additional documents */
    instruction: string;
    /** List of additional documents */
    documents: SupportingDocument[];
  };
  /** Optional: Conditional requirements based on situation */
  conditional_requirements?: {
    /** Instruction for conditional requirements */
    instruction: string;
    /** List of conditional options */
    options: ConditionalRequirement[];
  };
  /** Note about processor determination */
  note?: string;
}

/**
 * A conditional requirement option (choose based on situation)
 */
export interface ConditionalRequirement {
  /** Condition when this option applies */
  condition: string;
  /** Document name */
  document: string;
  /** Source office or agency where to secure the document */
  where_to_secure: string;
  /** Number of copies required */
  copies?: string;
  /** Additional notes or business types */
  note?: string;
  /** Alternatives if this document is unavailable */
  if_unavailable?: string[];
}

/**
 * One row of the charter's agency-action column: what the office does, with
 * the fee and time printed beside it. Null where the charter leaves the cell
 * blank. The person-responsible column is deliberately not transcribed.
 */
export interface AgencyAction {
  /** The charter's own action number, e.g. "1.2", when it prints one. */
  number?: string;
  /** What the office does, as printed. */
  action: string;
  /** The fees-to-be-paid cell, as printed (e.g. "None", "Php 100.00"). */
  fees: string | null;
  /** The time cell, as printed (e.g. "3 minutes"). */
  processing_time: string | null;
}

/**
 * A step in the client service process.
 *
 * The wording is the charter's own, not a plain-language rewrite: the city
 * writes its client steps in the third person ("Submits the OR"), and changing
 * a published procedure's wording is a change to what it says.
 */
export interface ClientStep {
  /** Step number */
  step: number;
  /** What the client does, as printed */
  action: string;
  /** Optional: Sub-steps with letter labels (A, B, C, etc.) */
  sub_steps?: {
    /** Letter label for the sub-step */
    letter: string;
    /** Action description */
    action: string;
    /** Optional: Detail items with roman numerals (i, ii, iii, etc.) */
    details?: string[];
  }[];
  /** Optional: URL for online portals */
  url?: string;
  /** Optional: Processing time for this step */
  processing_time?: string;
  /** Optional: The office's actions for this step, one per charter row */
  agency_actions?: AgencyAction[];
}

/**
 * Fee information for a service
 */
export interface Fee {
  /** Fee amount (e.g., "₱50.00", "Variable", "Free") */
  amount: string;
  /** Description of the fee (e.g., "per copy", "based on property assessment") */
  description: string;
  /** Whether this fee is required (optional, defaults to true) */
  required?: boolean;
}

/**
 * Fee item for fee schedule services (e.g., Collection of Other Payments)
 */
export interface FeeItem {
  /** Name of the fee/payment */
  name: string;
  /** Fee amount (e.g., "₱50.00", "Variable", "Free") */
  amount: string;
  /** Processing time for this specific fee/payment */
  processing_time?: string;
  /** Office responsible for collecting the fee */
  office?: string;
  /** Category/group of the fee (e.g., "Business Tax", "Regulatory Fees") */
  category?: string;
  /** URL for online payment (if applicable) */
  url?: string;
}

/**
 * A complete Citizen's Charter service entry
 *
 * Core required fields (12):
 * - service_number, service_name, plain_language_name
 * - office_division, classification, type_of_transaction
 * - who_may_avail, requirements, client_steps
 * - fees, processing_time
 *
 * Optional fields:
 * - turnaround_time (for complex services with waiting/approval periods)
 * - supporting_documents_detail, website, fee_schedule
 */
export interface CitizensCharterService {
  /** Service identifier (e.g., "1.1", "5.2"). Null when the charter numbers none. */
  service_number: string | null;
  /** Full name of the service (as it appears in the Citizens Charter document) */
  service_name: string;
  /**
   * Plain language name of the service
   *
   * A simplified, user-friendly version following UK GOV.UK plain language principles:
   * - Start with an action verb: "Get", "Apply for", "Pay", "Renew"
   * - Remove bureaucratic language: "Issuance of" → "Get"
   * - Use simple words: "Certification" → "Certificate"
   * - Be specific but concise: Under 65 characters where possible
   * - Address the user directly: "Get your barangay clearance"
   *
   * Examples:
   * - "Business Registration (Renewal) - Face to Face" → "Renew your business registration in person"
   * - "Issuance of Barangay Clearance" → "Get a barangay clearance"
   * - "Request for Police Clearance" → "Apply for a police clearance"
   */
  plain_language_name?: string | null;
  /** Office or division responsible for the service, as printed */
  office_division: string;
  /** Service classification as printed, or null when not stated */
  classification: ServiceClassification | null;
  /**
   * Type of transaction as printed, e.g. "Government to Business". Null when
   * not stated.
   */
  type_of_transaction: string | null;
  /** Who may avail of the service, as printed, or null when not stated */
  who_may_avail: string | null;
  /** Array of requirements with sources */
  requirements: Requirement[];
  /** Optional: Detailed supporting documents structure for complex requirements */
  supporting_documents_detail?: SupportingDocumentsDetail;
  /** Optional: Website/portal URL for online services */
  website?: string;
  /** Step-by-step client process - actions must use imperative language */
  client_steps: ClientStep[];
  /**
   * The amount the charter states for the service, or null when it states none
   * (for example, when it refers to a separate table of taxes and fees).
   */
  fees: Fee | null;
  /** Optional: Fee schedule for services that are lists of fees (e.g., Collection of Other Payments) */
  fee_schedule?: FeeItem[];
  /**
   * In-person transaction time
   *
   * The time it takes to complete the transaction in person at the office.
   * Examples: "15 minutes", "2 hours", "4 hours"
   *
   * For simple services, this is the full service time.
   * For complex services, this excludes waiting/approval periods (see turnaround_time).
   */
  processing_time: string | null;
  /**
   * Why processing_time is null when it is. "conflicting" means the charter
   * states a total that its own step times do not add up to, so neither is
   * published as the total.
   */
  processing_time_status?: 'stated' | 'not_stated' | 'conflicting';
  /**
   * Total turnaround time (optional)
   *
   * Total time for complex services including waiting and approval periods.
   * Examples: "3-5 working days", "21-35 working days", "Varies by site inspection"
   *
   * For simple services with no waiting/approval period, this field can be empty.
   */
  turnaround_time?: string;
  /** Ids of the civic sources this record is transcribed from */
  sources: string[];
  /** Optional display category, chosen by this portal, not by the city */
  category_override?: string;
}

/** Classifications defined for Citizen's Charter services. */
export type ServiceClassification = 'Simple' | 'Complex' | 'Highly Technical';

/**
 * Citizen's Charter data structure
 */
export interface CitizensCharterData {
  /** Array of all services */
  services: CitizensCharterService[];
}

/**
 * Search/filter options for Citizen's Charter services
 */
export interface ServiceFilterOptions {
  /** Filter by office/division */
  office?: string;
  /** Filter by classification (Simple/Complex/Highly Technical) */
  classification?: ServiceClassification;
  /** Filter by transaction type (G2C/G2B) */
  type_of_transaction?: string;
  /** Search query string (searches in service name and office) */
  search?: string;
}
