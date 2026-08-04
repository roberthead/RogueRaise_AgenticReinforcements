import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Pill — a small text-labelled status or tag chip.
 *
 * WHY IT EXISTS
 * -------------
 * Generalised from `src/app/admin/(console)/sponsors/status-pill.tsx`, which
 * solved this correctly but only for the four `sponsor_app_status` values. The
 * same shape then reappeared, hand-rolled, for event statuses, submission
 * categories and award labels — with its own padding and its own opacity on the
 * border each time. This is that component with the sponsor-specific enum
 * lifted out and the measured contrast discipline kept.
 *
 * THE INVARIANT: EVERY PILL IS ALWAYS TEXT-LABELLED
 * -------------------------------------------------
 * `children` is required and there is deliberately NO icon-only or dot-only
 * variant. A coloured dot conveys its meaning through hue alone, which fails
 * WCAG 1.4.1 Use of Colour outright and is illegible to roughly one reader in
 * twelve. This rule predates the palette correction and survived it untouched —
 * it was never about ratios. If a future design wants a compact indicator, the
 * answer is a shorter LABEL, not the removal of the label.
 *
 * A consequence worth stating: because the text carries the meaning, the border
 * on the `outline` and `accent` tones is DECORATIVE. `border-wr-olive-green/50`
 * measures 2.16:1 against paper, under the 3:1 non-text minimum — which is fine
 * precisely because nothing depends on perceiving that boundary. Do not build a
 * variant where the border is the only thing distinguishing two states.
 *
 * MEASURED RATIOS
 * ---------------
 * Ratios are measured on the ACTUAL pill background (not on paper) at
 * `text-xs`, so the AA small-text threshold of 4.5:1 applies to every row.
 * Recomputed against the corrected palette in globals.css:
 *
 *   neutral   ink on `secondary`               14.45:1 ✓
 *   muted     muted-fg on `muted`               4.65:1 ✓  (TIGHTEST — a darker
 *                                                          `muted` or a lighter
 *                                                          text token drops this
 *                                                          below AA)
 *   positive  white on `primary`                6.46:1 ✓
 *   negative  white on `destructive`            6.47:1 ✓
 *   outline   ink/80 on paper                   8.74:1 ✓
 *   accent    ink on olive/10 over paper       14.05:1 ✓
 *
 * The last two are alpha composites and are therefore measured ON PAPER. Placed
 * on a `muted` or olive surface they resolve differently — remeasure before
 * moving them.
 *
 * SUPERSEDED RULE, RECORDED SO IT IS NOT REINSTATED: "never white text on the
 * base olive" was an artifact of the wrong vendored olive, against which white
 * measured 4.49:1 and failed. `--primary` no longer holds a separately deepened
 * olive; it is the corrected brand olive, on which white measures 6.46:1. The
 * `positive` pill IS white on base olive, and that is correct.
 */

const pillVariants = cva(
  "inline-flex items-center rounded-full whitespace-nowrap text-xs",
  {
    variants: {
      tone: {
        /** No judgement attached — "Submitted", "Draft", a plain category. */
        neutral: "bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground",
        /** In progress / de-emphasised — "Under review", "Pending". */
        muted: "bg-muted px-2.5 py-0.5 font-medium text-muted-foreground",
        /** A good terminal state — "Approved", "Complete", "Winner". */
        positive: "bg-primary px-2.5 py-0.5 font-medium text-primary-foreground",
        /** A bad terminal state — "Rejected", "Failed", "Expired". */
        negative:
          "bg-destructive px-2.5 py-0.5 font-medium text-destructive-foreground",
        /**
         * Machine-ish metadata rather than a status: an event phase, a repo
         * language, a lifecycle enum. Mono and uppercase because it labels a
         * value from a fixed set rather than describing a state in prose.
         */
        outline:
          "border border-wr-olive-green/50 px-3 py-0.5 font-mono uppercase tracking-wide text-ink/80",
        /** The same metadata shape, promoted — the currently selected value. */
        accent:
          "border border-wr-olive-green bg-wr-olive-green/10 px-3 py-0.5 font-mono uppercase tracking-wide text-ink",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export type PillTone = NonNullable<VariantProps<typeof pillVariants>["tone"]>;

export interface PillProps extends VariantProps<typeof pillVariants> {
  className?: string;
  /** The label. REQUIRED — see the invariant above. Never empty, never an icon. */
  children: React.ReactNode;
}

export function Pill({ tone, className, children }: PillProps) {
  return <span className={cn(pillVariants({ tone }), className)}>{children}</span>;
}

export { pillVariants };
