import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";
import { Button } from "@/components/ui/button";
import {
  participantAccessMessage,
  redeemParticipantToken,
} from "@/lib/rogue-raise/participants/access";
import { isSubmissionWindowOpen } from "@/lib/rogue-raise/submissions/invite";

import { SubmissionForm } from "./submission-form";

/**
 * Project submission (PRD §7.1), opened by the magic link in the submission
 * email. Same token-in-URL posture as the other external forms.
 */
export const metadata: Metadata = {
  title: "Submit your project",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PageShell width="form" density="comfortable" align="center">
      <p className="eyebrow">White Rabbit · Ashland, OR</p>
      <h1 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">
        {title}
      </h1>
      {children}
      <div>
        <Button asChild variant="outline" size="touch">
          <Link href="/rogue-raise">Back to Rogue Raise</Link>
        </Button>
      </div>
    </PageShell>
  );
}

export default async function SubmitPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";

  const access = await redeemParticipantToken({ rawToken: token, eventId });
  if (!access.ok) {
    return (
      <Shell title="We couldn&rsquo;t open the submission form">
        <p className="max-w-prose text-lg text-ink/80">
          {participantAccessMessage(access.reason)}
        </p>
      </Shell>
    );
  }

  const { participant, event } = access.access;

  if (!isSubmissionWindowOpen(event.status)) {
    return (
      <Shell title="Submissions are closed">
        <p className="max-w-prose text-lg text-ink/80">
          {/*
           * One template literal rather than JSX text around an expression:
           * a multi-line JSX text node that begins right after `{...}` loses
           * its leading space at compile time, which reads as a typo.
           */}
          {`The submission window for ${event.title} isn’t open. If you think that’s wrong, find an organizer — don’t just walk away.`}
        </p>
      </Shell>
    );
  }

  return (
    <PageShell width="form" density="comfortable">
      <PageHeader
        size="display"
        eyebrow={event.organizationName}
        title="Submit your project"
        lede="One submission per team. Whoever fills this in lists the rest of the team, so everyone gets called up and credited."
      />

      <SubmissionForm
        eventId={eventId}
        token={token}
        submitter={{
          firstName: participant.firstName,
          lastName: participant.lastName,
          email: participant.email,
        }}
      />
    </PageShell>
  );
}
