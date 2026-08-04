import { SkipLink } from "@/components/rogue-raise/skip-link";

/**
 * The skip link for the admin tier — and NOTHING else.
 *
 * ⚠️  THIS LAYOUT MUST NOT DO AUTH WORK. The gate is
 * `admin/(console)/layout.tsx`, one level down, and it has to stay there: this
 * layout also wraps `/admin/sign-in`, which deliberately sits OUTSIDE the
 * `(console)` route group because a guarded sign-in page redirects to itself
 * forever. Anything authorization-shaped added here locks staff out of the only
 * door.
 *
 * It exists so `/admin/sign-in` and `admin/not-found.tsx` — the two admin
 * routes that render outside `(console)` — still get a bypass link. Route
 * groups do not affect URLs, so the whole console remains one movable
 * `app/admin/*` segment (CLAUDE.md).
 *
 * No `export const dynamic` here either: the console's `force-dynamic` belongs
 * to the layout that reads the session, and route-segment config does not
 * inherit upward.
 */
export default function AdminTierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      {children}
    </>
  );
}
