/**
 * Shapes for the local-history datasets in src/data/about/.
 *
 * Both are cited civic records, held to docs/civic-data-verification.md: every
 * entry names the civic sources (src/data/sources/civic-sources.json) that
 * state it. Mirrors the schemas in src/data/about/schema/.
 */

export interface HistoryMilestone {
  /** Stable identifier, unique in the file. */
  slug: string;
  /**
   * When it happened, only as precisely as the source states it: YYYY,
   * YYYY-MM or YYYY-MM-DD. A year must never be padded into a day.
   */
  date: string;
  /** The legal instrument the entry rests on, as cited, or null for none. */
  instrument: string | null;
  title: string;
  description: string;
  /** Civic-source ids of the documents that state this milestone. */
  sources: string[];
}

export interface HistoryHighlight {
  /** Stable identifier, unique in the file. */
  slug: string;
  title: string;
  description: string;
  /** Key into the component's local icon map. */
  icon: string;
  /** Civic-source ids of the documents that state this fact. */
  sources: string[];
}
