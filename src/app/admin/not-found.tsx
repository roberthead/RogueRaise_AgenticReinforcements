import Link from "next/link";

import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";
import { Button } from "@/components/ui/button";

/**
 * The 404 for the admin tier.
 *
 * Every `notFound()` in the console — a malformed uuid, an event that is gone,
 * an asset id that belongs to a DIFFERENT event — landed on Next's unstyled
 * default until this file existed. The last of those is the interesting one:
 * `events/[id]/assets/[assetId]/page.tsx` calls `notFound()` when an asset does
 * not belong to the event in the URL, and that is a cross-event access refusal
 * wearing a 404. So this page says only that the page is not here. It names no
 * id, no reason, and does not distinguish "gone" from "never yours".
 *
 * It sits at `admin/`, not `admin/(console)/`, so it also catches unmatched
 * `/admin/*` URLs that never reach the console. That places it OUTSIDE the
 * `checkAdmin()` gate, which is safe precisely because it renders no data —
 * and anyone unauthenticated is redirected to sign-in by middleware before
 * they get here anyway.
 */
export const metadata = {
  title: "Not found · Rogue Raise admin",
};

export default function AdminNotFound() {
  return (
    <PageShell width="form" density="compact" align="center">
      <PageHeader
        eyebrow="WR Admin"
        title="Nothing here"
        lede="That page isn't in the console. The link may be stale, or whatever it pointed at is no longer around."
      />
      <div>
        <Button asChild variant="outline" size="touch">
          <Link href="/admin">Back to the console</Link>
        </Button>
      </div>
    </PageShell>
  );
}
