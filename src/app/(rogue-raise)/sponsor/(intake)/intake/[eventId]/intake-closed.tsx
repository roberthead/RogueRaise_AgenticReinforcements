import Link from "next/link";

import { PageShell } from "@/components/rogue-raise/page-shell";
import { Button } from "@/components/ui/button";

/**
 * Shown when the token is good but the event has moved past the window in which
 * the sponsor may still edit their intake. Sibling in shape to `InvalidLink`:
 * `page.tsx` returns this INSTEAD of its own shell, so this file owns the
 * PageShell for that branch.
 *
 * WHY THIS LIVES IN ITS OWN FILE
 * ------------------------------
 * It was inline in `page.tsx` until the step 1.7 migration. Extracting it leaves
 * `page.tsx` with exactly ONE `<PageShell>`, which is what
 * `design-system.test.ts`'s loading/page parity check assumes: that check reads
 * the FIRST `width=` in the page source, so an early-return shell sitting above
 * the content shell makes it compare `loading.tsx` against the wrong branch.
 * Keeping the guard branches in their own files is the fix that does not weaken
 * the guardrail — and it matches what `invalid-link.tsx` already does here.
 */
export function IntakeClosed({ organizationName }: { organizationName: string }) {
  return (
    <PageShell width="form" density="comfortable" align="center">
      <p className="eyebrow">{organizationName}</p>
      <h1 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">
        Your intake is with us
      </h1>
      <p className="max-w-prose text-lg text-ink/80">
        Thank you &mdash; we have everything we need for now, and your Rogue Raise
        has moved on to the next stage. This form is closed to edits.
      </p>
      <p className="max-w-prose text-ink/70">
        If something needs to change, reply to any email from us and we&rsquo;ll
        take care of it.
      </p>
      <div>
        <Button asChild variant="outline" size="touch">
          <Link href="/rogue-raise">Back to Rogue Raise</Link>
        </Button>
      </div>
    </PageShell>
  );
}
