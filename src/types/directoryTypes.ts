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

export interface Barangay {
  slug: string;
  barangay_name: string;
  /** Required by src/data/directory/schema/barangays.schema.json. */
  address: string;
  trunkline: string[];
  website: string | null;
  officials: DirectoryOfficial[];
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
