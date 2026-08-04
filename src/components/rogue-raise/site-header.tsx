import Link from "next/link";

import { cn } from "@/lib/utils";
import { MobileNav, type SiteNavItem } from "./mobile-nav";
import { Wordmark } from "./wordmark";

/**
 * SiteHeader — the `banner` landmark for the PUBLIC tier only.
 *
 * WHERE IT IS RENDERED, AND WHY THAT IS THREE PLACES
 * --------------------------------------------------
 * `(rogue-raise)/rogue-raise/layout.tsx`, `(rogue-raise)/events/layout.tsx`
 * and `(rogue-raise)/sponsor/(apply)/layout.tsx`. It is deliberately NOT
 * rendered by the shared `(rogue-raise)/layout.tsx`, because that layout also
 * covers the five magic-link surfaces (intake, judge, submit, portal, review),
 * and those must never be offered a way out of their flow — see
 * `scoped-top-bar.tsx`.
 *
 * The three-way split is also what makes `activeKey` correct without a client
 * component. Next.js does not re-render a layout that is SHARED across a
 * navigation — that is precisely why `useSelectedLayoutSegment` is a client
 * hook. A header rendered once in a common ancestor would therefore keep
 * whatever active state it computed on first paint, and go stale the moment the
 * user moved between sections. A header rendered by each SEGMENT's own layout
 * re-renders whenever the user crosses into that segment, which is exactly when
 * the answer changes. So the active key is a per-segment constant, passed down,
 * and the whole tier stays a Server Component.
 *
 * TWO ITEMS. THAT IS THE ENTIRE PUBLIC SURFACE.
 * ---------------------------------------------
 * "Raises" and "Sponsor a raise" are every public destination this product has.
 * There is no About, no FAQ, no Contact — inventing one would be a link to a
 * 404 dressed as a site. `/events/[slug]` lives UNDER "Raises" rather than
 * beside it, which is why the events segment passes `activeKey="raises"`.
 *
 * ACTIVE STATE IS NOT COLOUR-ONLY
 * -------------------------------
 * Filled AND bold AND underlined, plus `aria-current="page"` — the same idiom
 * as `filter-chip-nav.tsx`. A fill alone says nothing to anyone who cannot
 * separate the two hues; `aria-current` alone says nothing to anyone who can.
 *
 * NO OLIVE FILL — THIS IS LOAD-BEARING
 * ------------------------------------
 * globals.css records that ink on olive is 2.70:1, under the 3:1 non-text
 * minimum, so an olive band would make the global ink focus outline invisible
 * on every link in this bar and on the skip link that parks over it. The band
 * is paper with an olive BORDER instead. Do not "brand" it by filling it olive
 * without also overriding the focus indicator to paper (5.98:1 on olive).
 *
 * NO `<h1>` HERE. The page owns its one `<h1>`; chrome never emits a heading.
 */

/** The two public destinations. Adding a third is a product decision. */
const NAV_ITEMS: readonly SiteNavItem[] = [
  { key: "raises", label: "Raises", href: "/rogue-raise" },
  { key: "sponsor", label: "Sponsor a raise", href: "/sponsor" },
];

/** The section keys a public segment layout may declare. */
export type SiteNavKey = (typeof NAV_ITEMS)[number]["key"];

export function SiteHeader({ activeKey }: { activeKey: SiteNavKey }) {
  return (
    <header className="sticky top-0 z-40 border-b border-wr-olive-green/20 bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-reading items-center justify-between gap-4 px-6 py-3">
        <Wordmark linked />

        {/*
         * ONE navigation landmark. "Main" rather than "Navigation": screen
         * readers already announce the role, so "Navigation navigation" is
         * noise. It must also stay distinct from the other labelled navs in the
         * product ("Filter applications by status", "Breadcrumb",
         * "Console sections").
         */}
        <nav aria-label="Main">
          <ul className="hidden items-center gap-2 sm:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === activeKey;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm transition-colors",
                      isActive
                        ? "border-ink bg-ink font-semibold text-background underline underline-offset-4"
                        : "border-wr-olive-green/40 text-ink hover:bg-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <MobileNav items={NAV_ITEMS} activeKey={activeKey} className="sm:hidden" />
        </nav>
      </div>
    </header>
  );
}
