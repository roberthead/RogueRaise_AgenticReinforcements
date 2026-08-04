import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * PageShell — the ONE `<main>` element in this product.
 *
 * WHY IT EXISTS
 * -------------
 * Before this, 32 page files hand-rolled their own root container. The widths
 * had drifted to five values across 39 call sites (17x 2xl, 10x 3xl, 7x 4xl,
 * 4x 5xl, 1x sm) and the vertical rhythm to four, so two pages in the same tier
 * could disagree about how wide a form is and how much air sits above it. None
 * of that drift was a decision; it was copy-paste. This component makes the
 * layout a choice from a closed set instead of a string somebody typed.
 *
 * It also carries three properties that were previously left to whoever wrote
 * the page, and were therefore inconsistent:
 *
 *   1. `id="main"` — the skip link (step 1.8) targets it. Every page needs it,
 *      so no page should have to remember it.
 *   2. `tabIndex={-1}` — REQUIRED, and not optional politeness. Without it,
 *      Safari follows `#main` by scrolling but does NOT move focus, so the very
 *      next Tab press sends the user back into the header they just skipped.
 *      Deliberately NOT paired with `focus:outline-none`: `<main>` here is a
 *      real keyboard destination and the user must see where they landed. (This
 *      is the opposite of `<CalloutRegion>`, which is a programmatic-only focus
 *      target — see `callout.tsx` for why that one does suppress its outline.)
 *   3. `flex-1` instead of `min-h-full`. `min-h-full` plus a site header
 *      overflows the viewport by exactly the header's height, which is why the
 *      centred pages grew a scrollbar with nothing to scroll to. `flex-1`
 *      inside the root layout's `flex min-h-dvh flex-col` body fills the
 *      remaining space instead of the whole of it. Note that until step 1.8
 *      changes the root layout's `<body>` to a flex column, `flex-1` is simply
 *      inert — it does not regress anything in the meantime.
 *
 * WIDTH AND DENSITY ARE VARIANTS, NOT `className`
 * -----------------------------------------------
 * `cn` runs `tailwind-merge`, and `className` is merged LAST — which means a
 * caller CAN pass `max-w-4xl` or `py-32` and win. That is a bug, not a feature.
 * `className` is for spacing nudges that the scale does not cover (an extra
 * `gap-*` on one outlier, say). Reach for a different `width`/`density` before
 * reaching for `className`, and if neither of the four widths fits, that is a
 * conversation about the scale rather than a local override.
 * `design-system.test.ts` (step 1.5) enforces the same rule from the outside.
 *
 * `max-w-prose` remains fine INSIDE the shell — that is content scoping on a
 * paragraph, not a page container, and the two are unrelated concerns.
 */

/** The only four page widths. Defined as `--container-*` tokens in globals.css. */
export type PageWidth = "form" | "reading" | "wide" | "auth";

/**
 * Vertical rhythm. Exactly two values, chosen by TIER rather than by page:
 * `comfortable` for anything a member of the public or an invited guest sees,
 * `compact` for the admin console, where staff scan density beats airiness.
 */
export type PageDensity = "comfortable" | "compact";

/**
 * `center` collapses the 13 single-message screens (invalid-link, thanks, done,
 * sign-in and friends) that each hand-rolled `justify-center gap-6 px-6 py-24`
 * plus a local `Shell` component. It deliberately overrides the density gap:
 * a page holding one heading and one sentence wants tighter spacing than a page
 * holding six sections, regardless of tier.
 */
export type PageAlign = "top" | "center";

const pageShellVariants = cva("mx-auto flex w-full flex-1 flex-col px-6", {
  variants: {
    width: {
      form: "max-w-form",
      reading: "max-w-reading",
      wide: "max-w-wide",
      auth: "max-w-auth",
    },
    density: {
      comfortable: "gap-10 py-16 sm:py-24",
      compact: "gap-8 py-12 sm:py-16",
    },
    // Declared after `density` on purpose: cva emits variants in declaration
    // order, so `gap-6` lands after the density gap and tailwind-merge keeps it.
    align: {
      top: "",
      center: "justify-center gap-6",
    },
  },
  defaultVariants: {
    align: "top",
  },
});

/**
 * The layout contract, split out so `<LoadingShell>` can require the IDENTICAL
 * props (see `skeleton.tsx`). A `loading.tsx` that disagrees with its `page.tsx`
 * produces a visible width/rhythm jump at the moment the real content arrives,
 * which reads as a broken page rather than a fast one.
 */
export interface PageShellLayout {
  width: PageWidth;
  density: PageDensity;
  align?: PageAlign;
}

export interface PageShellProps extends PageShellLayout {
  /** Spacing nudges ONLY — see the note above. Never a `max-w-*` or a `py-*`. */
  className?: string;
  children: React.ReactNode;
}

/**
 * The gap each shell configuration applies, exposed so a skeleton's
 * `aria-hidden` bone wrapper can match the rhythm of the page it stands in for.
 * A single child of `<main>` collapses the shell's own `gap-*` to nothing, so
 * the wrapper has to restate it.
 */
export function pageShellGap({ density, align = "top" }: PageShellLayout): string {
  if (align === "center") return "gap-6";
  return density === "comfortable" ? "gap-10" : "gap-8";
}

export function PageShell({
  width,
  density,
  align = "top",
  className,
  children,
}: PageShellProps) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className={cn(pageShellVariants({ width, density, align }), className)}
    >
      {children}
    </main>
  );
}
