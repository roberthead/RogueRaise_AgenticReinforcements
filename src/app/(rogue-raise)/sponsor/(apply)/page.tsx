import type { Metadata } from "next";

import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";
import { getSpamGuard } from "@/lib/rogue-raise/integrations/spam";

import { SponsorForm } from "./sponsor-form";

export const metadata: Metadata = {
  title: "Sponsor a Rogue Raise",
  description:
    "Tell White Rabbit about your organization and the problem you'd like a Rogue Raise to help solve.",
};

// The signed spam challenge is minted per request, so this page must not be
// statically cached (a stale challenge would fail the min-elapsed check).
export const dynamic = "force-dynamic";

export default function SponsorSignUpPage() {
  // Mint the honeypot + signed-timestamp challenge server-side; the form echoes
  // `renderedAt`/`sig` back as hidden inputs for `getSpamGuard().verify(...)`.
  const challenge = getSpamGuard().issueChallenge();

  return (
    <PageShell width="form" density="comfortable">
      <PageHeader
        size="display"
        eyebrow="White Rabbit · Ashland, OR"
        title="Sponsor a Rogue Raise"
        lede="Rogue Raise is a community build event modeled on a barn raise. Tell us about your organization and the problem you’re facing, and we’ll review your interest and reach out about standing up a Rogue Raise for you."
      >
        <p className="max-w-prose text-sm text-ink/60">
          {`Fields marked `}
          <span className="font-medium text-ink">(required)</span>
          {` must be filled in. This form takes about five minutes.`}
        </p>
      </PageHeader>

      <SponsorForm
        challengeTs={challenge.renderedAt}
        challengeSig={challenge.sig}
      />
    </PageShell>
  );
}
