import { cn } from "@/lib/utils";

/**
 * Shared presenters for the sponsor curation queue + detail views. Kept in one
 * module so the table, the mobile card list, and the detail header all render
 * status and financial values identically.
 */

/** The four `sponsor_app_status` values the admin UI reasons about. */
export type QueueStatus = "submitted" | "under_review" | "approved" | "rejected";

/**
 * Status → label + pill colours. Every pill is ALWAYS text-labelled (never
 * colour-only) and honours the globals.css contrast contract.
 *
 * Ratios below are measured on the ACTUAL pill background (not on paper) at
 * `text-xs`, so the AA small-text threshold of 4.5:1 applies to every row.
 * Recomputed 2026-08-03 against the corrected palette — see globals.css:
 *   - submitted     → ink on `secondary`      — 14.45:1 ✓
 *   - under review  → muted-fg on `muted`     —  4.65:1 ✓ (tightest; a darker
 *                                                 `muted` or lighter text would
 *                                                 drop it below AA)
 *   - approved      → white on `primary`      —  6.46:1 ✓
 *   - rejected      → white on `destructive`  —  6.47:1 ✓
 *
 * The former rule "never white text on the base olive" is SUPERSEDED. It was an
 * artifact of the wrong vendored olive (#6f7d3f), against which white measured
 * 4.49:1 and failed. `--color-primary` no longer holds a separately deepened
 * olive (#697939); it is now the corrected brand olive #3d6928, on which white
 * measures 6.46:1. The `approved` pill IS white on base olive, and that is fine.
 *
 * The invariant that survives: every pill is always text-labelled. That was
 * never about ratios and is unaffected by the correction.
 */
export const STATUS_META: Record<QueueStatus, { label: string; pill: string }> = {
  submitted: {
    label: "Submitted",
    pill: "bg-secondary text-secondary-foreground",
  },
  under_review: {
    label: "Under review",
    pill: "bg-muted text-muted-foreground",
  },
  approved: {
    label: "Approved",
    pill: "bg-primary text-primary-foreground",
  },
  rejected: {
    label: "Rejected",
    pill: "bg-destructive text-destructive-foreground",
  },
};

export function StatusPill({
  status,
  className,
}: {
  status: QueueStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        meta.pill,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

/**
 * Financial commitment from the stored `numeric(12,2)` string.
 *   - `toDiscuss` → "To discuss"
 *   - `null`      → "—"
 *   - otherwise USD, dropping trailing `.00` for whole dollars.
 * Parsed with `Number` only for formatting — the string stays the source of
 * truth so no float precision is ever persisted.
 */
export function formatFinancial(
  amount: string | null,
  toDiscuss: boolean,
): string {
  if (toDiscuss) return "To discuss";
  if (amount === null) return "—";
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  // Whole dollars drop ".00"; any cents render as exactly two digits
  // (min 0 / max 2 would show "5000.50" as "$5,000.5").
  const whole = Number.isInteger(n);
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Human date, e.g. "Jul 7, 2026". `null` → "—". */
export function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
