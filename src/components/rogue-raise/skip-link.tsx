import { cn } from "@/lib/utils";

/**
 * SkipLink — the bypass control required by WCAG 2.4.1 Bypass Blocks.
 *
 * ⚠️  BEHAVIOUR CHANGE REVIEWERS MUST EXPECT
 * ------------------------------------------
 * This is now the FIRST FOCUSABLE ELEMENT ON EVERY PAGE in the product. One
 * press of Tab from a fresh page load lands here, not on the first link in the
 * header and not on the first form field. That is the entire point — but it
 * means every keyboard walkthrough, every "tab twice to reach X" note, and any
 * future end-to-end test that counts tab stops shifts by exactly one. If a
 * reviewer sees an unexpected control appear at the top-left on first Tab, this
 * is that control working correctly.
 *
 * It is rendered by the three tier layouts (`(rogue-raise)/layout.tsx`,
 * `admin/layout.tsx`) rather than by the root layout. `src/app/layout.tsx` is
 * the least portable file in the repo — it belongs to WR at merge — so it gets
 * no chrome of ours.
 *
 * WHY `#main` IS ALWAYS THERE
 * ---------------------------
 * `<PageShell>` renders the ONE `<main id="main" tabIndex={-1}>` in the product,
 * and every page renders a shell. So this link cannot point at a missing target
 * without `design-system.test.ts` failing first. The `tabIndex={-1}` on that
 * `<main>` is what makes the link actually move focus rather than only scroll
 * (Safari scrolls but does not focus otherwise) — see `page-shell.tsx`.
 *
 * WHY IT IS OFF-SCREEN RATHER THAN `sr-only`
 * ------------------------------------------
 * The usual `sr-only focus:not-sr-only focus:absolute` idiom stacks two
 * conflicting `position` utilities under the same variant and relies on
 * Tailwind's emission order to resolve them. A translate is unambiguous: the
 * element is always laid out, always in the accessibility tree, and simply
 * parked 80px above the viewport until focus slides it back. `fixed` rather
 * than `absolute` so it appears in the viewport the user is actually looking
 * at, instead of scrolling the document to the top first.
 *
 * `focus:` and not `focus-visible:`. The link is unreachable by pointer while
 * parked, so there is no mouse-click case to suppress, and revealing on plain
 * `:focus` also covers focus moved programmatically or by assistive tech.
 *
 * FOCUS CONTRAST (WCAG 1.4.11)
 * ----------------------------
 * The global `:focus-visible` indicator in globals.css is a 2px INK outline,
 * and globals.css records the trap: ink on olive measures 2.70:1, under the 3:1
 * non-text minimum. This link parks and lands over the top-left of the page
 * chrome, so no header in this product may use an olive fill — `SiteHeader`,
 * `ScopedTopBar` and `ConsoleHeader` are all paper/muted with an olive BORDER
 * for exactly this reason. Ink outline on paper is 16.15:1 and on muted 15.11:1.
 * The link also carries its own opaque paper fill and ink border (16.15:1) so
 * its own boundary is visible independently of the outline.
 */
export function SkipLink({ className }: { className?: string }) {
  return (
    <a
      href="#main"
      className={cn(
        "fixed left-4 top-4 z-50 inline-flex min-h-11 -translate-y-24 items-center",
        "rounded-md border border-ink bg-background px-4 py-2 text-sm font-semibold text-ink",
        "transition-transform focus:translate-y-0",
        className,
      )}
    >
      Skip to main content
    </a>
  );
}
