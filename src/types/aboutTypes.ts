/**
 * Shapes for the local-history datasets in src/data/about/.
 *
 * Both are emptied until verified Dagupan history is sourced, so their arrays
 * infer as never[] and consumers must state the element type.
 */

export interface HistoryMilestone {
  year: string;
  title: string;
  description: string;
}

export interface HistoryHighlight {
  title: string;
  description: string;
  /** Kapwa colour theme key, e.g. "slate" | "orange". */
  theme: string;
  /** Key into the component's local icon map. */
  icon: string;
}
