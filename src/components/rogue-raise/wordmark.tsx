import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Wordmark — the White Rabbit / Rogue Raise lockup, as TEXT.
 *
 * WHY IT IS TEXT AND NOT AN IMAGE
 * -------------------------------
 * Because there is no image. Verified: this repo contains no logo asset of any
 * kind — `public/` holds the five Next.js starter SVGs and nothing else. Rather
 * than block the header work on an asset nobody has, the mark is a Fraunces
 * lockup: resolution-independent, correct in both themes without a second file,
 * subject to no licence, and free of any layout shift while a font loads (it
 * is the same `next/font` already driving every heading).
 *
 * WHY IT IS A COMPONENT AT ALL
 * ----------------------------
 * It is the single swap point for a real mark later. The public header, the
 * external `ScopedTopBar`, `/admin/sign-in` and the footer all render this and
 * NONE of them may reference an asset path. When WR supplies an SVG, this one
 * file changes and four surfaces update; the moment a consumer inlines
 * `/logo.svg` instead, that stops being true.
 *
 * WHY `linked` DEFAULTS TO FALSE
 * ------------------------------
 * The unlinked form is the safe one, so it is the default. The seven external
 * magic-link surfaces render the mark UNLINKED on purpose: those users arrived
 * from a one-way email link holding a token scoped to one event and one role.
 * A wordmark that navigates them to `/rogue-raise` strands them — the token is
 * not in the URL they would come back to, and every other destination refuses
 * them. Only the public marketing header opts in with `linked`.
 *
 * ACCESSIBLE NAME
 * ---------------
 * The linked form gets no `aria-label`. Its accessible name is its visible text
 * ("White Rabbit Rogue Raise"), which is what WCAG 2.5.3 Label in Name wants —
 * a speech-input user saying what they see actually activates it. Do not "tidy"
 * this into `aria-label="Home"`.
 *
 * FOCUS TRAP TO KNOW ABOUT
 * ------------------------
 * globals.css warns that ink on olive measures 2.70:1, below the 3:1 non-text
 * minimum, so the global ink focus outline is INVISIBLE on an olive band. If
 * this mark is ever placed on an olive header, that surface must override its
 * focus indicator to paper (5.98:1 on olive). This component does not do that
 * itself, because it does not know what it is sitting on.
 */

export interface WordmarkProps {
  /**
   * Render as a link to `href`. Off by default — see the note above about the
   * external tier, where linking it is a real usability failure rather than a
   * missing nicety.
   */
  linked?: boolean;

  /** Destination when `linked`. The public hub, unless a caller knows better. */
  href?: string;

  /** `sm` for the compact bars (external tier, admin console), `md` elsewhere. */
  size?: "sm" | "md";

  className?: string;
}

export function Wordmark({
  linked = false,
  href = "/rogue-raise",
  size = "md",
  className,
}: WordmarkProps) {
  const lockup = (
    <span className="flex flex-col gap-0.5">
      <span
        className={cn(
          "font-serif font-semibold leading-none text-wr-olive-green",
          size === "sm" ? "text-lg" : "text-xl",
        )}
      >
        White Rabbit
      </span>
      {/*
       * `eyebrow` stands alone, with NO trailing utilities. It already supplies
       * mono, uppercase, size, tracking, leading and the olive colour, and any
       * utility added beside it overrides the very class this is meant to
       * standardise — which is exactly how the previous dead `eyebrow` class
       * went unnoticed across 32 call sites for ten milestones.
       */}
      <span className="eyebrow">Rogue Raise</span>
    </span>
  );

  if (!linked) {
    return <span className={cn("inline-flex", className)}>{lockup}</span>;
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex rounded-sm underline-offset-4 hover:underline",
        className,
      )}
    >
      {lockup}
    </Link>
  );
}
