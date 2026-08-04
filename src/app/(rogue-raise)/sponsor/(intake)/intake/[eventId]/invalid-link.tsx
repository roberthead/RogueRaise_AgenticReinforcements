import Link from "next/link";

import { PageShell } from "@/components/rogue-raise/page-shell";
import { Button } from "@/components/ui/button";
import { intakeAccessMessage } from "@/lib/rogue-raise/intake/form-state";

/**
 * Shown when a magic link doesn't open this intake. The copy differs by reason
 * (expired reads differently from wrong-event), but every reason that could be
 * reached WITHOUT a genuine token has already collapsed into `invalid` upstream
 * in `redeemIntakeToken` — so nothing here tells a stranger anything.
 *
 * Not a `page.tsx`, but it renders a whole page: `page.tsx` returns this INSTEAD
 * of its own shell, so this file owns the PageShell for that branch and carries
 * the same centred single-message layout as the tier's other dead ends.
 */
export function InvalidLink({ reason }: { reason: string }) {
  return (
    <PageShell width="form" density="comfortable" align="center">
      <p className="eyebrow">White Rabbit · Ashland, OR</p>
      <h1 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">
        We couldn&rsquo;t open your intake form
      </h1>
      <p className="max-w-prose text-lg text-ink/80">{intakeAccessMessage(reason)}</p>
      <p className="max-w-prose text-ink/70">
        Nothing you&rsquo;ve already filled in is lost &mdash; it&rsquo;s saved
        against your Rogue Raise and will be waiting when you&rsquo;re back in.
      </p>
      <div>
        <Button asChild variant="outline" size="touch">
          <Link href="/rogue-raise">Back to Rogue Raise</Link>
        </Button>
      </div>
    </PageShell>
  );
}
