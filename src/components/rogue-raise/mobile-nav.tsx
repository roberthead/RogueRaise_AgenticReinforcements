import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * MobileNav — the narrow-viewport disclosure for the public header.
 *
 * WHY NATIVE `<details>` AND NOT A CLIENT COMPONENT
 * -------------------------------------------------
 * Not thrift, and not "no JS if we can get away with it". A disclosure has
 * exactly two properties that are easy to get wrong and that the browser gets
 * right for free:
 *
 *   1. TAB ORDER. When a `<details>` is closed the browser makes its contents
 *      genuinely inert — they leave the tab order and the accessibility tree.
 *      The idiomatic CSS-only alternative (`max-h-0 overflow-hidden`, or
 *      `opacity-0`) leaves every link focusable while invisible, so a keyboard
 *      user tabs into a menu they cannot see and a sighted keyboard user loses
 *      the focus ring off the edge of the layout. That is the classic bug in
 *      this pattern, and it is invisible in a screenshot.
 *   2. STATE AND NAMING. `<summary>` ships `role="button"` plus a correct,
 *      automatically-maintained `aria-expanded`. A hand-rolled version has to
 *      remember to toggle that attribute, and a stale `aria-expanded` is worse
 *      than none.
 *
 * A Radix or `useState` version would re-implement both, add a client bundle to
 * every public page, and buy nothing.
 *
 * WHAT `<details>` DOES NOT GIVE YOU
 * ----------------------------------
 * Escape-to-close. The HTML spec defines no key handling for `<details>` beyond
 * activating the summary, so Escape does not close this menu — the summary
 * itself is the close control, and it keeps focus while open, so the dismissal
 * gesture is "press the same button again", which is discoverable and requires
 * no learning. Adding Escape would require the client component this component
 * exists to avoid. Recorded here so nobody reports it as a regression.
 *
 * DUPLICATE LINKS ARE NOT A DUPLICATE LANDMARK
 * --------------------------------------------
 * This renders inside `SiteHeader`'s single `<nav aria-label="Main">`, beside
 * the wide-viewport list. Only one of the two is ever displayed — the other is
 * `display: none` via a breakpoint utility and therefore absent from the
 * accessibility tree — so at any viewport there is one navigation landmark
 * exposing one set of links.
 */

export interface SiteNavItem {
  /** Stable identity, compared against `activeKey`. */
  key: string;
  label: string;
  href: string;
}

export interface MobileNavProps {
  items: readonly SiteNavItem[];
  /** The `key` of the section currently being viewed. */
  activeKey: string;
  className?: string;
}

export function MobileNav({ items, activeKey, className }: MobileNavProps) {
  return (
    <details className={cn("group", className)}>
      {/*
       * `list-none` plus the WebKit pseudo-element kills the default triangle in
       * every engine. The 44px floor is a real target size (WCAG 2.5.8), not a
       * visual choice — this is the only way to reach the menu on a phone.
       */}
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-wr-olive-green/40 px-4 py-2 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
        Menu
        <span
          aria-hidden="true"
          className="font-mono text-xs text-wr-olive-green transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>

      {/*
       * Positioned against the sticky `<header>` (the nearest positioned
       * ancestor), so the panel hangs below the whole bar rather than below the
       * summary button, and spans the full width at phone sizes.
       */}
      <ul className="absolute left-0 right-0 top-full flex flex-col gap-1 border-b border-wr-olive-green/20 bg-background p-4 shadow-sm">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center rounded-md border px-4 py-2 text-base transition-colors",
                  isActive
                    ? // Filled AND bold AND underlined — never colour alone.
                      "border-ink bg-ink font-semibold text-background underline underline-offset-4"
                    : "border-transparent text-ink hover:bg-muted",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
