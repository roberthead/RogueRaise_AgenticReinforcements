import Link from "next/link";

import { signOutAdmin } from "@/lib/rogue-raise/admin/sign-in-actions";

/**
 * ConsoleHeader — the `banner` landmark for the WR Admin console.
 *
 * This is the header JSX lifted verbatim out of `admin/(console)/layout.tsx`.
 * The lift is the ONLY thing that changed in that file: the `checkAdmin()`
 * call, its `redirect("/admin/sign-in")` and its `export const dynamic =
 * "force-dynamic"` all stay exactly where they were. Route-segment config is
 * read only from `layout.tsx`/`page.tsx` files and does NOT travel into a
 * component, so moving the export here would silently un-force dynamic
 * rendering across the console; and the gate is one of three independent checks
 * (middleware is Edge-only and layouts do not render for Server Actions), so
 * moving it would weaken the boundary. Nothing about this component is a
 * security surface — it renders an identity that the layout above it has
 * already verified.
 *
 * The admin email, the sign-out form and the loud red `Dev-open · no sign-in`
 * badge are unchanged, down to the classes. The badge is loud on purpose: it
 * should be impossible to mistake a dev-open console for a real one.
 *
 * WHY THE SECTION NAV IS NOT IN HERE
 * ----------------------------------
 * It is in `console-nav.tsx`, rendered by each section's own layout directly
 * beneath this bar and styled to continue the same band. That is not a layout
 * whim — it is the only way to get a correct active item without a client
 * component.
 *
 * Next.js does not re-render a layout that is SHARED across a navigation; that
 * is exactly why `useSelectedLayoutSegment` is a client hook. This header lives
 * in `(console)/layout.tsx`, which is shared by every console route, so a nav
 * rendered here would compute its active item once and then be WRONG for every
 * subsequent move between Sponsors and Events — a stale `aria-current="page"`,
 * which is worse than none, since it actively misinforms. Rendering the nav at
 * the segment boundary means it re-renders precisely when the answer changes.
 * The alternatives were `"use client"` + `usePathname` (forbidden for this
 * work, and a client bundle on every admin page) or calling `checkAdmin()` a
 * second time inside a per-segment header (a duplicated auth call, for chrome).
 */
export function ConsoleHeader({
  email,
  isDev,
}: {
  email: string;
  isDev: boolean;
}) {
  return (
    <header className="border-b border-wr-olive-green/20 bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-2 text-sm">
        <Link
          href="/admin/events"
          className="font-mono text-xs uppercase tracking-widest text-wr-olive-green underline-offset-4 hover:underline"
        >
          Rogue Raise admin
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          {isDev ? (
            <span className="rounded-full border border-destructive px-3 py-0.5 font-mono text-xs uppercase tracking-wide text-destructive">
              Dev-open · no sign-in
            </span>
          ) : (
            <>
              <span className="text-ink/70">{email}</span>
              <form action={signOutAdmin}>
                <button
                  type="submit"
                  className="min-h-11 font-medium text-ink underline underline-offset-4"
                >
                  Sign out
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
