import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";
import { Button } from "@/components/ui/button";
import { judgeAccessMessage, redeemJudgeToken } from "@/lib/rogue-raise/judges/access";

import { JudgeForm } from "./judge-form";

/**
 * The judge background form (PRD §5.3.4), opened by the magic link in the
 * invitation email.
 *
 * Same token-in-URL posture as the sponsor intake, and the same mitigations:
 * `referrer: no-referrer`, `robots: noindex`, the token never logged or echoed,
 * and every write re-verifying it server-side.
 */
export const metadata: Metadata = {
  title: "Judging a Rogue Raise",
  description: "Tell us how to introduce you, and ask anything about the criteria.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function JudgeBackgroundPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { eventId } = await params;
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";

  const access = await redeemJudgeToken({ rawToken: token, eventId });
  if (!access.ok) {
    return (
      <PageShell width="form" density="comfortable" align="center">
        <p className="eyebrow">White Rabbit · Ashland, OR</p>
        <h1 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">
          We couldn&rsquo;t open your judge form
        </h1>
        <p className="max-w-prose text-lg text-ink/80">
          {judgeAccessMessage(access.reason)}
        </p>
        <div>
          <Button asChild variant="outline" size="touch">
            <Link href="/rogue-raise">Back to Rogue Raise</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const { judge, event } = access.access;

  return (
    <PageShell width="form" density="comfortable">
      <PageHeader
        size="display"
        eyebrow={event.organizationName}
        title="Thanks for judging"
        lede={
          <>
            {`You’re judging `}
            <strong>{event.title}</strong>
            {`. Two things: tell us how you’d like to be introduced at kickoff, and ask anything you want about how the work will be judged.`}
          </>
        }
      >
        <p className="max-w-prose text-sm text-ink/60">
          This takes about three minutes. You can come back to this link and
          change anything until the event.
        </p>
      </PageHeader>

      <JudgeForm
        eventId={eventId}
        token={token}
        organizationName={event.organizationName}
        initial={{
          name: judge.name,
          title: judge.title ?? "",
          bio: judge.bio ?? "",
          expertiseTags: judge.expertiseTags,
          introPreference: judge.introPreference ?? "",
          criteriaQuestions: judge.criteriaQuestions ?? "",
          complete: judge.backgroundCompletedAt !== null,
        }}
      />
    </PageShell>
  );
}
