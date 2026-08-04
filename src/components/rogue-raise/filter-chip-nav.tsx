import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * FilterChipNav — the query-param filter row with live count badges.
 *
 * WHY IT EXISTS
 * -------------
 * `src/app/admin/(console)/sponsors/page.tsx` and
 * `src/app/admin/(console)/events/page.tsx` contain this block byte-for-byte
 * identically, down to the `min-w-5` on the badge. Two copies is where a
 * pattern starts drifting, and one of them already carries a comment the other
 * lost.
 *
 * THE ACTIVE STATE IS NOT COLOUR-ONLY
 * -----------------------------------
 * The active chip is filled AND bold AND underlined, plus `aria-current="page"`.
 * That combination is deliberate and is the part of this component most likely
 * to be "simplified" later: a filled background alone communicates nothing to
 * anyone who cannot separate the two hues, and `aria-current` alone
 * communicates nothing to anyone who can see. Both, always.
 *
 * NAVIGATION, NOT A CONTROL
 * -------------------------
 * These are links, not buttons or a radio group. Each filter is a real URL that
 * can be bookmarked, shared and back-buttoned, and the whole row works as a
 * Server Component with no client JS. `aria-current="page"` is the correct
 * marker for that (rather than `aria-pressed`, which would claim these are
 * toggles).
 *
 * The row is a `<nav>` with a required `label`, because a page can hold more
 * than one navigation landmark and an unlabelled one is indistinguishable from
 * the others in a landmark list.
 *
 * COUNTS: ABSENT IS NOT ZERO
 * --------------------------
 * `count` is optional and `0` renders as "0". Omitting it renders NO badge.
 * Those mean different things — "this filter matches nothing" versus "we did
 * not count" — and this codebase has already ruled that absence must never be
 * rendered as zero (see `EmptyState` and
 * `src/lib/rogue-raise/integrations/github.ts`). Do not default the prop to 0.
 */

export interface FilterChip {
  /** Stable identity, compared against `activeKey`. */
  key: string;
  label: string;
  /** Full destination including the query string. */
  href: string;
  /** Live count. Omit entirely when unknown — see above. */
  count?: number;
}

export interface FilterChipNavProps {
  /**
   * The `<nav>`'s accessible name, e.g. "Filter applications by status".
   * Required: an unlabelled navigation landmark is unusable in a landmark list.
   */
  label: string;
  chips: readonly FilterChip[];
  /** The `key` of the currently applied filter. */
  activeKey: string;
  className?: string;
}

export function FilterChipNav({
  label,
  chips,
  activeKey,
  className,
}: FilterChipNavProps) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isActive = chip.key === activeKey;
          return (
            <li key={chip.key}>
              <Link
                href={chip.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors",
                  isActive
                    ? "border-ink bg-ink font-semibold text-background underline underline-offset-4"
                    : "border-wr-olive-green/40 text-ink hover:bg-muted",
                )}
              >
                {chip.label}
                {chip.count === undefined ? null : (
                  <span
                    className={cn(
                      "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 font-mono text-xs font-semibold",
                      isActive
                        ? "bg-background/20 text-background"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {chip.count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
