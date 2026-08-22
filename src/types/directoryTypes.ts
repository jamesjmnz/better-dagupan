/**
 * Shapes for the LGU directory datasets in src/data/directory/.
 *
 * These datasets are emptied until verified Dagupan records are sourced, so the
 * JSON files infer as never[] and every consumer has to state the element type
 * explicitly. Keeping the shapes here means the record structure survives the
 * empty period in one reviewable place, and matches
 * src/data/directory/schema/*.schema.json.
 */

export interface DirectoryOfficial {
  role: string;
  name: string;
  website?: string;
  personId?: string;
}

/**
 * An alternative spelling of a barangay name observed on another authoritative
 * source, kept with the id of the source that spells it that way so the
 * disagreement stays attributable instead of being silently resolved.
 */
export interface BarangayNameVariant {
  name: string;
  /** Civic-source id, see src/data/sources/civic-sources.json. */
  source: string;
}

/**
 * A barangay of the city.
 *
 * Every field here is either verified against a civic source or explicitly
 * unset. `null` and `[]` mean "not verified yet", never "does not exist" - the
 * barangays all have addresses, phone numbers and elected officials, we just
 * have no authoritative source for them yet, and the interface has to say so
 * rather than imply the information is absent.
 */
export interface Barangay {
  slug: string;
  /**
   * The official name as published in the PSGC, stored ready to render.
   * Do not pass this through toTitleCase(): it lowercases Roman numerals, so
   * "Barangay II" would reach the screen as "Barangay Ii".
   */
  barangay_name: string;
  name_variants: BarangayNameVariant[];
  /** PSGC 10-digit code, e.g. "0105518009". */
  psgc_10_digit_code: string;
  /** PSGC correspondence code, e.g. "015518009". */
  psgc_correspondence_code: string;
  urban_rural: 'urban' | 'rural';
  /** 2024 Census of Population, as published by the PSA. */
  population_2024_popcen: number;
  /** null until an authoritative address is sourced. */
  address: string | null;
  /** Empty until an authoritative contact number is sourced. */
  trunkline: string[];
  /** null until an authoritative page is sourced. */
  website: string | null;
  /** Empty until a current roster is sourced. Never populated from a stale one. */
  officials: DirectoryOfficial[];
  /** Civic-source ids backing this record. At least one, enforced by tests. */
  sources: string[];
}

export interface DepartmentHead {
  name: string | null;
  contact: string | null;
  email: string | null;
}

export interface Department {
  slug: string;
  office_name: string;
  address: string | null;
  trunkline: string[];
  website: string | null;
  email: string | null;
  department_head: DepartmentHead;
}

export interface ExecutiveOfficial {
  slug: string;
  name: string;
  role: string;
  office?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isElected?: boolean;
  personId?: string;
}

export interface CommitteeMember {
  name: string;
  role: string;
}

export interface PermanentCommittee {
  committee: string;
  chairperson: string;
  members: CommitteeMember[];
}

export interface LegislativeChamber {
  slug: string;
  branch: string;
  chamber: string;
  address: string | null;
  trunkline: string | null;
  website: string | null;
  email: string | null;
  officials: DirectoryOfficial[];
  permanent_committees: PermanentCommittee[];
}
