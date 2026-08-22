/**
 * Shape of the civic-source citations in src/data/sources/civic-sources.json.
 *
 * A "civic source" is a published government document or page that a record in
 * this repository was verified against. It is deliberately NOT one of the
 * OpenLGU terms defined in CONTEXT.md: a *source record* there is a raw
 * observation captured by the legislative pipeline and reconciled through
 * staging and promotion in D1. These citations are hand-curated references to
 * published documents, checked by a person, with no pipeline behind them. The
 * two must not be conflated, so they do not share a name.
 *
 * Mirrors src/data/sources/schema/civic-sources.schema.json.
 */

export interface CivicSource {
  /** Stable identifier referenced by civic records. Never reused. */
  id: string;
  /** Government body that published the document. */
  agency: string;
  /** Title of the document or page as published. */
  title: string;
  /** Exact URL the data was read from. */
  url: string;
  /**
   * Date the publisher released this edition, or null when it states none.
   * Distinct from `data_as_of`: the 2Q 2026 PSGC was released on 2026-07-13
   * but describes the classification as of 2026-06-30.
   */
  published: string | null;
  /** Reference date the content describes, as stated by the publisher. */
  data_as_of: string | null;
  /**
   * Period the content covers, for documents describing a span rather than a
   * single date. Used to label historical content as historical in the UI.
   */
  coverage: string | null;
  /** ISO date this source was read. */
  retrieved: string;
  /** ISO date the citing records were last checked against it. */
  verified: string;
  /** Reuse terms stated by the publisher. Null when it states none. */
  licence: string | null;
  /**
   * What this source establishes, and any limits on it.
   *
   * The only optional field on this interface, and the only one the JSON
   * schema does not require: a source with nothing to qualify needs no note,
   * whereas every other field must be stated even when the answer is null.
   */
  notes?: string;
  /**
   * Id of the authoritative source this document redistributes.
   *
   * A derivative source corroborates that data is being published, not the
   * facts themselves, so it must never be the sole citation for a field.
   *
   * Required, not optional: a missing key would be indistinguishable from an
   * unreviewed one, so an authoritative source states null explicitly.
   */
  derives_from: string | null;
}
