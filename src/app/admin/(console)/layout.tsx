import { redirect } from "next/navigation";

import { ConsoleHeader } from "@/components/rogue-raise/console-header";
import { checkAdmin } from "@/lib/rogue-raise/admin/guard";

/**
 * Server-side gate for every admin page (PRD §9, §12).
 *
 * A layout is the right place for the *page* check: it runs on the server for
 * every route beneath it, and unlike the middleware it can reach the database
 * and read the role. It is still not the whole boundary — Server Actions don't
 * render layouts — which is why each privileged action calls `requireAdmin()`
 * for itself.
 *
 * The console lives in a `(console)` route group so this guard covers every
 * page beneath it WITHOUT covering `/admin/sign-in` — a guarded sign-in page
 * redirects to itself forever. Route groups don't affect URLs, so every admin
 * route still lives under one movable `app/admin/*` directory (CLAUDE.md).
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const check = await checkAdmin();

  if (!check.ok) {
    // The middleware already redirects most of these; this catches the rest
    // (a stale cookie, a revoked account, a non-admin user with a session).
    redirect("/admin/sign-in");
  }

  const isDev = check.admin.userId === "dev";

  return (
    <>
      {/* A landmark, so the sign-out control is reachable by landmark
          navigation rather than only by tabbing from the top. The section nav
          that continues this band is rendered by each section's own layout —
          see `console-nav.tsx` for why it cannot live in this shared one. */}
      <ConsoleHeader email={check.admin.email} isDev={isDev} />
      {children}
    </>
  );
}
