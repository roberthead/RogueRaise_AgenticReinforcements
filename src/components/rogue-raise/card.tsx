import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Card — the bordered content block this app already had, minus the drift.
 *
 * WHY IT EXISTS
 * -------------
 * `rounded-lg border border-wr-olive-green/25 p-4` ships 10 times verbatim, and
 * a grep for `rounded-lg border…` across `src/app` returns 23 DISTINCT class
 * strings for what is visually one idea. The variation is not design intent —
 * it is `/15` vs `/25` vs `/30` vs `/40` vs `/50` on the same border, and
 * `p-3`/`p-4`/`p-5`/`p-8` on the same block. Four of those strings are real,
 * repeated shapes; the rest are copies that drifted. This component keeps the
 * four and retires the rest.
 *
 * WHY NOT shadcn's `Card`
 * -----------------------
 * shadcn's Card is six `data-slot` divs (Card / Header / Title / Description /
 * Content / Footer) built around a shadow-and-elevation aesthetic. Nothing in
 * this product uses a shadow on a card, nothing needs a six-part API for a
 * bordered `<div>`, and adopting it would mean rewriting 25 call sites into a
 * structure they do not want. It is also a `components/ui/*` file, which at
 * merge time collides with WR's own shadcn install — the exact reason the
 * shared layer lives under `components/rogue-raise/` instead.
 *
 * POLYMORPHIC BY UNION, NOT BY `asChild`
 * --------------------------------------
 * Cards appear as `<li>` (queue rows), `<div>` and `<section>`. Radix `Slot`
 * would work but wants a single element child, which fights a card that holds a
 * link, a pill and a `<dl>`. A four-value `as` union is typed, obvious and has
 * no runtime cost.
 */

const cardVariants = cva("rounded-lg border", {
  variants: {
    variant: {
      /** The default block: a quiet olive hairline on paper. 10 sites today. */
      outline: "border-wr-olive-green/25",
      /** Secondary information that should recede — notes, side panels. */
      muted: "border-wr-olive-green/30 bg-muted/40",
      /**
       * "Nothing is here." Reserved for empty states, which is why the dashed
       * border reads as an outline waiting to be filled rather than a box.
       * Prefer `<EmptyState>` over reaching for this directly.
       */
      dashed: "border-dashed border-wr-olive-green/40",
      /**
       * The one card on a page that outranks the others — a confirmed winner, a
       * selected asset. Doubled ink border rather than a colour change, so the
       * emphasis survives for anyone who cannot distinguish the hue.
       */
      emphasis: "border-2 border-ink bg-muted/60",
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-5",
      xl: "p-8",
    },
    /**
     * For a card whose whole area is one link. Adds the `relative` that the
     * stretched-link idiom (`after:absolute after:inset-0` on the anchor)
     * needs to anchor against, plus the hover wash. Keeping `relative` here
     * rather than in the page is what makes the pattern hard to get half-right:
     * a stretched link with no positioned ancestor silently covers the whole
     * viewport.
     */
    interactive: {
      true: "relative transition-colors hover:bg-muted/60",
      false: "",
    },
  },
  defaultVariants: {
    variant: "outline",
    padding: "md",
    interactive: false,
  },
});

export interface CardProps
  extends Omit<VariantProps<typeof cardVariants>, "interactive"> {
  /** Element to render. `li` for list rows, `section` when it carries a heading. */
  as?: "div" | "li" | "section" | "article";
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
  /** For `as="section"`, pointing at the heading that names it. */
  "aria-labelledby"?: string;
}

export function Card({
  as: Comp = "div",
  variant,
  padding,
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Comp
      className={cn(cardVariants({ variant, padding, interactive }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { cardVariants };
