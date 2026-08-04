import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Breadcrumbs — the retrace trail for admin DETAIL pages.
 *
 * WHY THESE PAGES NEED ONE
 * ------------------------
 * `/admin/events/[id]/assets/[assetId]` is four levels deep and reachable only
 * by drilling: Events → an event → its agents → one draft. Before this, each
 * page hand-rolled a single "← {something}" link, and the something differed
 * per page (`← All events`, `← Back to queue`, `← {org name}`, `← Agents for
 * {org name}`), so the way out was a different shape and a different label on
 * every screen and only ever went up ONE level. The trail states the whole path
 * and makes every ancestor directly clickable.
 *
 * Those single back-links are removed where this replaces them. The lateral
 * "Agents & drafts →", "Repo review →", "Submissions →", "Results & awards →"
 * links are NOT breadcrumbs — they are sibling navigation within an event — and
 * they stay exactly where they are.
 *
 * SEPARATORS ARE NEVER TEXT
 * -------------------------
 * A literal "/" in a text node is read aloud — "Events slash The Unhoused
 * slash Agents" — which is why the separator here is an `aria-hidden` span,
 * absent from the accessibility tree entirely. (`::before` content would work
 * equally; an explicit element is easier to see in review, and Tailwind's
 * arbitrary `content-['/']` collides with the opacity-modifier slash syntax.)
 * With it hidden, the trail is announced as the list of links it is.
 *
 * THE CURRENT PAGE IS NOT A LINK
 * ------------------------------
 * The last crumb is the page you are already on. It carries
 * `aria-current="page"` and is plain text: a link to the current URL is a tab
 * stop that does nothing, and following it looks to the user like the page
 * failed to respond.
 *
 * `aria-label="Breadcrumb"` is the ARIA Authoring Practices name for this
 * pattern and stays distinct from the product's other navs ("Main", "Console
 * sections", "Filter applications by status").
 *
 * NOTE ON HEADINGS: this emits none. The page's `<h1>` is `PageHeader`'s.
 */

export interface Crumb {
  label: string;
  /**
   * Omit on the LAST crumb only — that is what marks it as the current page.
   * An ancestor without an href is unreachable and is a bug, not a style.
   */
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: readonly Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center text-sm text-ink/70">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center">
              {index > 0 ? (
                <span aria-hidden="true" className="mx-2 text-wr-olive-green/60">
                  /
                </span>
              ) : null}

              {isLast || !crumb.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn("font-medium", isLast && "text-ink")}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="inline-flex min-h-9 items-center text-ink underline-offset-4 hover:underline"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
