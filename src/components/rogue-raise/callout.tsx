import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Callout — the success / error / info banner, and the focusable region that
 * holds one after a server action settles.
 *
 * WHY IT EXISTS
 * -------------
 * `rounded-lg border border-destructive bg-destructive/5 p-4 text-sm text-ink`
 * ships six times, its `p-3` twin three more, and the olive success twin twice.
 * Every one of them is the same banner. Consolidating them also consolidates
 * the `role` they carry, which is the part that was drifting: the same server
 * error is announced assertively in one form and politely in another.
 *
 * ============================================================================
 * READ THIS BEFORE YOU PLACE ONE: LIVE REGIONS GO *OUTSIDE* THE KEYED `<form>`
 * ============================================================================
 * Eight client forms in this app key the `<form>` on the action result's
 * version (`key={state.version}`). They have to: React calls `form.reset()`
 * once an action settles, and because the rendered value is unchanged the
 * reconciler writes nothing back, so controlled inputs keep the reset value.
 * Remounting the form is the fix.
 *
 * The cost of that fix is that EVERYTHING inside the keyed subtree is destroyed
 * and rebuilt on every submit. A live region in there is remounted already
 * populated — which assistive tech may not announce at all — and any focus
 * inside it drops to `<body>`. The error is then both silent and invisible to
 * someone zoomed past it.
 *
 * So the shape is always:
 *
 *   const resultRef = useActionFocus<HTMLDivElement>(state.version);
 *   return (
 *     <>
 *       <CalloutRegion ref={resultRef}>          {/* OUTSIDE *\/}
 *         {state.formError ? (
 *           <Callout tone="error" live="alert">{state.formError}</Callout>
 *         ) : null}
 *       </CalloutRegion>
 *       <form key={state.version} action={formAction}>…</form>
 *     </>
 *   );
 *
 * `<CalloutRegion>` exists to make that placement the obvious default rather
 * than a rule in a comment. It is a sibling of the form by construction: it
 * takes no form-ish props, holds the ref `useActionFocus` returns, and reads
 * wrong anywhere else. Wrapping the whole form in a `<Card>` is safe; inserting
 * ANY wrapper between the region and the form is not.
 *
 * WHY `CalloutRegion` SUPPRESSES ITS OWN FOCUS OUTLINE (AND `<main>` DOES NOT)
 * ---------------------------------------------------------------------------
 * It is a programmatic-only focus target: nothing tabs to it, it is focused by
 * script so the message gets announced. Submitting a form with Enter leaves the
 * browser in keyboard-interaction mode, so `:focus-visible` would match and
 * draw a ring around a wrapper the user never navigated to. `<main>` in
 * `page-shell.tsx` is the opposite case — a real skip-link destination — and
 * deliberately keeps its outline.
 *
 * COLOUR IS NEVER THE MESSAGE
 * ---------------------------
 * `tone` is decoration. The text inside must say what happened ("Saved.",
 * "Two things need fixing before this can go in:"), because a red border is
 * invisible to a screen reader and ambiguous to anyone who cannot separate the
 * hue. There is deliberately no icon-only form.
 */

const calloutVariants = cva("rounded-lg border p-4 text-sm text-ink", {
  variants: {
    tone: {
      /** A completed action. Olive, matching the two existing success banners. */
      success: "border-wr-olive-green bg-wr-olive-green/10",
      /** A failed action or a validation summary. */
      error: "border-destructive bg-destructive/5",
      /** Context the user did not ask for and cannot act on. */
      info: "border-wr-olive-green/40 bg-muted",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

export type CalloutTone = NonNullable<
  VariantProps<typeof calloutVariants>["tone"]
>;

export interface CalloutProps extends VariantProps<typeof calloutVariants> {
  /**
   * Announcement politeness, and therefore the ARIA role:
   *
   *   "alert"  → `role="alert"`, assertive. For something that FAILED and
   *              blocks the user. Interrupts whatever is being read.
   *   "status" → `role="status"`, polite. For something that succeeded, or
   *              progress. Waits its turn.
   *   omitted  → no role at all. For a banner that is part of the page on first
   *              paint. Marking static page furniture as live makes every real
   *              announcement compete with it.
   */
  live?: "alert" | "status";
  /** Optional bolded first line — a summary above a list of specifics. */
  title?: React.ReactNode;
  className?: string;
  id?: string;
  /** The message. Required, and it must carry the meaning by itself. */
  children: React.ReactNode;
}

export function Callout({
  tone,
  live,
  title,
  className,
  id,
  children,
}: CalloutProps) {
  return (
    <div
      id={id}
      role={live}
      className={cn(calloutVariants({ tone }), className)}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      {title ? <div className="mt-2">{children}</div> : children}
    </div>
  );
}

export interface CalloutRegionProps {
  /**
   * The ref from `useActionFocus(state.version)`. Focus moves here when a new
   * action result arrives, which is what actually gets the message announced —
   * more reliably than a live region that was mounted already populated.
   */
  ref?: React.Ref<HTMLDivElement>;
  /** Usually one `<Callout>`, or nothing at all before the first submit. */
  children: React.ReactNode;
  /** Spacing only. Typically the margin separating the region from the form. */
  className?: string;
}

export function CalloutRegion({ ref, children, className }: CalloutRegionProps) {
  return (
    <div ref={ref} tabIndex={-1} className={cn("outline-none", className)}>
      {children}
    </div>
  );
}

export { calloutVariants };
