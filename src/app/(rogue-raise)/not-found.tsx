import Link from "next/link";

import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";
import { Button } from "@/components/ui/button";

/**
 * The 404 for everything in the public and external tiers.
 *
 * Until this file existed there were ZERO `not-found.tsx` files in the repo, so
 * every `notFound()` call rendered Next's unstyled default — including the one
 * on the PUBLIC `/events/[slug]`, which is the single most linkable URL in the
 * product. A mistyped or expired raise link dropped a member of the public onto
 * a black-and-white system page with no way back.
 *
 * IT SAYS NOTHING ABOUT WHY
 * -------------------------
 * "Not found" here covers a typo, a raise that was never published, a raise
 * that has been archived, and a slug that exists but is not public yet. Naming
 * which one confirms the existence of resources to someone who has no business
 * knowing they exist — the same reason `stakeholderAccessMessage` refuses to
 * distinguish an expired token from a wrong one. One message, no signal.
 *
 * Whimsy budget: one line, per BRAND_VOICE.md §5 ("one light touch per piece,
 * max"). The rabbit hole is the touch; the rest is plainspoken and offers a
 * real way onward rather than an apology.
 *
 * This renders at the tier boundary, so it is wrapped by
 * `(rogue-raise)/layout.tsx` (the skip link) but by none of the segment
 * layouts — a 404 has no section, so it carries no section header.
 */
export const metadata = {
  title: "Page not found · Rogue Raise",
};

export default function RogueRaiseNotFound() {
  return (
    <PageShell width="form" density="comfortable" align="center">
      <PageHeader
        size="display"
        eyebrow="White Rabbit · Ashland, OR"
        title="This one went down a different hole"
        lede="We can't find that page. The link may be out of date, or a character may have gone missing on its way here."
      />
      <div>
        <Button asChild variant="outline" size="touch">
          <Link href="/rogue-raise">See the raises</Link>
        </Button>
      </div>
    </PageShell>
  );
}
