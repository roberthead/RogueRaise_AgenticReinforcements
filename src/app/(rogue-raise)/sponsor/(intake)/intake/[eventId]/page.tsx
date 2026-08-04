import type { Metadata } from "next";

import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";
import { canEditIntake, redeemIntakeToken } from "@/lib/rogue-raise/intake/access";
import { loadIntake } from "@/lib/rogue-raise/intake/queries";

import { IntakeClosed } from "./intake-closed";
import { IntakeForm } from "./intake-form";
import { InvalidLink } from "./invalid-link";

/**
 * The sponsor's secondary intake form (PRD §5.2.2), opened by the magic link in
 * the approval email.
 *
 * The raw token stays in the query string: a cookie can't be set during a Server
 * Component render, and the emailed URL shape shipped with the approve action.
 * The exposure is contained rather than ignored —
 *   - `referrer: "no-referrer"` stops the token leaking through the Referer
 *     header on any outbound click,
 *   - `robots: noindex, nofollow` keeps the URL out of search indexes,
 *   - the token is never logged, audited, or echoed into an email body,
 *   - every write re-verifies it server-side, so a stale copy of the URL grants
 *     nothing beyond its 14-day expiry.
 * Better Auth's `magicLink` plugin replaces this seam wholesale.
 */
export const metadata: Metadata = {
  title: "Your Rogue Raise intake",
  description:
    "Tell us what your Rogue Raise needs — weekends that work, supporting context, and your technical stack.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

// Token-gated and per-visitor: never statically cached.
export const dynamic = "force-dynamic";

export default async function SponsorIntakePage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";

  const access = await redeemIntakeToken({ eventId, rawToken: token });
  if (!access.ok) return <InvalidLink reason={access.reason} />;

  const { event, organizationName } = access.access;

  if (!canEditIntake(event.status)) {
    return <IntakeClosed organizationName={organizationName} />;
  }

  const intake = await loadIntake(eventId);

  return (
    <PageShell width="reading" density="comfortable">
      <PageHeader
        size="display"
        eyebrow={organizationName}
        title="Shape your Rogue Raise"
        lede={
          <>
            {`A few details turn your approved Rogue Raise into a real weekend. Three sections are `}
            <span className="font-medium text-ink">vital</span>
            {` — they’re what we need before the build can be scheduled and stood up. The rest helps, and can come later.`}
          </>
        }
      >
        <p className="max-w-prose text-sm text-ink/60">
          Everything saves as you type. You can close this page and come back to
          the same link whenever you like &mdash; there&rsquo;s no need to finish
          in one sitting.
        </p>
      </PageHeader>

      <IntakeForm
        eventId={eventId}
        token={token}
        initialDraft={intake.draft}
        initialAttachments={intake.attachments}
      />
    </PageShell>
  );
}
