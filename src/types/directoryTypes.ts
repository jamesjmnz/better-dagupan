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

/**
 * An alternative name the city uses for the same office on its own pages, kept
 * with the id of the source that uses it so a reader searching the name they
 * saw elsewhere still finds the office.
 */
export interface OfficeNameVariant {
  name: string;
  source: string;
}

/**
 * Why an office has no published head.
 *
 * The absence of a name never means the office has no head, so the reason is
 * recorded rather than left to be inferred from a null. `conflicting_sources`
 * means official pages name different people and nothing establishes which is
 * current; `uncorroborated` means fewer than two independent page families
 * name anyone at all.
 */
export type DepartmentHeadStatus =
  | 'published'
  | 'conflicting_sources'
  | 'uncorroborated';

export interface DepartmentHead {
  name: string;
  /** The position as published, e.g. "City Legal Officer", "Officer-in-charge". */
  title: string;
  contact: string | null;
  email: string | null;
  /**
   * Civic-source ids naming this person in this post. At least two, from at
   * least two independent page families: a single page is not enough to
   * establish that a head is current, and the city's Directory and
   * Officials-section rosters are near-clones of each other rather than
   * independent statements. The schema enforces the count; the provenance
   * test enforces the independence.
   */
  sources: string[];
}

export interface Department {
  slug: string;
  /**
   * The office name as published, stored ready to render. Do not pass this
   * through toTitleCase() or formatGovName(): both lowercase a whole word
   * before recapitalising it, which mangles the acronyms these names carry.
   */
  office_name: string;
  name_variants: OfficeNameVariant[];
  /** null until an authoritative address is sourced. */
  address: string | null;
  /** Empty until an authoritative contact number is sourced. */
  trunkline: string[];
  /** null until an authoritative page is sourced. */
  website: string | null;
  /** null until an authoritative address is sourced. */
  email: string | null;
  department_head_status: DepartmentHeadStatus;
  /** null unless the head is established. Never filled from one page alone. */
  department_head: DepartmentHead | null;
  /** Civic-source ids backing the office. At least one, enforced by tests. */
  sources: string[];
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
