import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * ConsoleNav — the WR Admin primary navigation.
 *
 * Three destinations, which is the whole console: the dashboard, the sponsor
 * curation queue, and events. Everything else in `/admin` hangs off an event or
 * an application and is reached from those two lists (and, from this step
 * onward, is retraceable with `<Breadcrumbs>`).
 *
 * WHY IT IS A SIBLING OF THE HEADER RATHER THAN INSIDE IT
 * ------------------------------------------------------
 * `console-header.tsx` carries the long version. In one line: `ConsoleHeader`
 * lives in `(console)/layout.tsx`, which is SHARED by every console route and
 * therefore is not re-rendered when the user moves between sections, so an
 * active item computed there would go stale and lie via `aria-current`. This
 * component is rendered by each section's own layout, which re-renders on entry
 * to that section, so `activeKey` is a per-segment constant that is always
 * right — with no client component anywhere.
 *
 * It is styled to continue the header's band (same muted fill, same olive
 * hairline) so the two read as one piece of chrome, which is what they are.
 *
 * `aria-label="Console sections"` — distinct from every other labelled nav in
 * the product ("Main", "Breadcrumb", "Filter applications by status" on
 * `admin/(console)/sponsors/page.tsx`, which shares a page with this one).
 * Never "Navigation": the role is already announced.
 *
 * Active state is filled AND bold AND underlined AND `aria-current="page"` —
 * the `filter-chip-nav.tsx` idiom, never colour alone.
 *
 * The 36px (`min-h-9`) target floor is the console's recorded exception to the
 * 44px rule: dense staff tooling on pointer devices, seen by about three people
 * (see the `touch`/`cta` note in `src/components/ui/button.tsx`).
 */

interface ConsoleNavItem {
  key: string;
  label: string;
  href: string;
}

const ITEMS: readonly ConsoleNavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "sponsors", label: "Sponsors", href: "/admin/sponsors" },
  { key: "events", label: "Events", href: "/admin/events" },
];

/** The section keys a console segment layout may declare. */
export type ConsoleNavKey = (typeof ITEMS)[number]["key"];

export function ConsoleNav({ activeKey }: { activeKey: ConsoleNavKey }) {
  return (
    <nav
      aria-label="Console sections"
      className="border-b border-wr-olive-green/20 bg-muted/40"
    >
      <ul className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-6 py-2">
        {ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center rounded-full border px-4 py-1.5 text-sm transition-colors",
                  isActive
                    ? "border-ink bg-ink font-semibold text-background underline underline-offset-4"
                    : "border-wr-olive-green/40 text-ink hover:bg-background",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
