import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * DataTable — a THIN wrapper whose entire job is making the accessible parts
 * non-optional.
 *
 * WHY IT EXISTS
 * -------------
 * The sponsor queue table is genuinely well built: it has an `sr-only`
 * `<caption>` naming the filtered view AND its sort order, `scope="col"` on
 * every header, `scope="row"` on the organisation cell, `aria-sort` on the
 * sorted column, and exactly one anchor per row. Every one of those is a
 * decision someone made once and could forget next time — and the second table
 * in the app already forgot most of them.
 *
 * This wrapper does almost no styling. It exists so that the next queue cannot
 * be built without a caption, and so the ROW HEADER cannot be modelled as an
 * ordinary column. That is why `rowHeader` is a separate required prop rather
 * than a flag on `columns[0]`: it guarantees exactly one `scope="row"` cell per
 * row and guarantees it is the first one.
 *
 * WHY NOT shadcn's `Table`
 * ------------------------
 * It emits no `<caption>`, no `scope` on anything, and no `aria-sort` — it is
 * eight styled `data-slot` wrappers around the bare HTML elements. Adopting it
 * would mean deleting the accessibility work above and reimplementing it on top,
 * which is a strange way to spend a refactor.
 *
 * ONE TAB STOP PER ROW
 * --------------------
 * `rowHeader.href` renders the row-identifying cell as a stretched link
 * (`after:absolute after:inset-0` against the `relative` `<tr>`), so the whole
 * row is clickable while the keyboard sees a single stop. A 50-row queue is 50
 * tab stops instead of 250. That only holds if the other cells stay inert:
 * `columns[].cell` MUST NOT return a link or a button. If a row genuinely needs
 * a second action, the stretched link is the wrong pattern for that table and
 * the right fix is an explicit actions column with the stretch removed — not a
 * second anchor sitting under an invisible overlay.
 *
 * RESPONSIVE
 * ----------
 * Deliberately not handled here. The existing pages pair
 * `className="hidden md:table"` with an `md:hidden` card list, and absorbing
 * that duplication is Phase 3 work with the real call sites in view. A wrapper
 * that hid itself below `md` would silently drop the table on any page that had
 * not yet built the card list.
 */

/** Matches the `aria-sort` token set. Never a bare "asc"/"desc". */
export type SortDirection = "ascending" | "descending";

export interface DataTableColumn<Row> {
  /** Stable React key for the column. */
  key: string;
  header: React.ReactNode;
  /** Set ONLY on the column the view is actually sorted by. */
  sort?: SortDirection;
  cell: (row: Row) => React.ReactNode;
  /** Utilities applied to this column's header and body cells alike. */
  className?: string;
}

export interface DataTableRowHeader<Row> {
  header: React.ReactNode;
  sort?: SortDirection;
  /** The value identifying the row — the org name, the team name. */
  cell: (row: Row) => React.ReactNode;
  /**
   * Utilities for the `scope="row"` cell, mirroring `DataTableColumn.className`.
   * Without this the row-identifying cell was the ONLY cell in the table that
   * could not be styled, which is backwards — it is the one carrying the name.
   */
  className?: string;
  /**
   * Makes the row-identifying cell a stretched link to this destination. Omit
   * for a table whose rows do not open anything.
   */
  href?: (row: Row) => string;
}

export interface DataTableProps<Row> {
  /**
   * REQUIRED, rendered `sr-only`. Name the FILTERED VIEW and the SORT ORDER,
   * e.g. "Under review applications, sorted by submission date, newest first."
   * A sighted user reads that off the active filter chip and the column
   * headers; without a caption nobody else can.
   */
  caption: React.ReactNode;
  /** The single `scope="row"` cell. Always rendered first. */
  rowHeader: DataTableRowHeader<Row>;
  /** The remaining `scope="col"` columns, in order. */
  columns: readonly DataTableColumn<Row>[];
  rows: readonly Row[];
  rowKey: (row: Row) => string;
  /** Layout nudges — commonly `hidden md:table`. See RESPONSIVE above. */
  className?: string;
}

export function DataTable<Row>({
  caption,
  rowHeader,
  columns,
  rows,
  rowKey,
  className,
}: DataTableProps<Row>) {
  return (
    <table
      className={cn("w-full border-collapse text-left text-sm", className)}
    >
      <caption className="sr-only">{caption}</caption>

      <thead>
        <tr className="border-b border-wr-olive-green/30 text-xs uppercase tracking-wide text-ink/70">
          <th
            scope="col"
            aria-sort={rowHeader.sort}
            className="py-3 pr-4 font-medium"
          >
            {rowHeader.header}
          </th>
          {columns.map((column, index) => (
            <th
              key={column.key}
              scope="col"
              aria-sort={column.sort}
              className={cn(
                "py-3 font-medium",
                index === columns.length - 1 ? "" : "pr-4",
                column.className,
              )}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            className={cn(
              "border-b border-wr-olive-green/15",
              // Row chrome ONLY when the row actually opens something. `relative`
              // exists to anchor the stretched link, and a hover wash is a
              // promise of interaction — putting either on a table whose rows go
              // nowhere advertises an affordance that does not exist, which is
              // worse than a flat row. Conditional on the same prop that decides
              // whether a link is rendered at all, so the two can never disagree.
              rowHeader.href &&
                "relative transition-colors hover:bg-muted/60",
            )}
          >
            <th
              scope="row"
              className={cn(
                "py-3 pr-4 align-top font-medium",
                rowHeader.className,
              )}
            >
              {rowHeader.href ? (
                <Link
                  href={rowHeader.href(row)}
                  className="text-ink underline-offset-4 after:absolute after:inset-0 after:content-[''] hover:underline"
                >
                  {rowHeader.cell(row)}
                </Link>
              ) : (
                rowHeader.cell(row)
              )}
            </th>
            {columns.map((column, index) => (
              <td
                key={column.key}
                className={cn(
                  "py-3 align-top text-ink/80",
                  index === columns.length - 1 ? "" : "pr-4",
                  column.className,
                )}
              >
                {column.cell(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
