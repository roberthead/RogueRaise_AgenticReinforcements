import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";
import { Button } from "@/components/ui/button";
import { isPublicEvent, loadLandingPage } from "@/lib/rogue-raise/events/landing";
import { getSpamGuard } from "@/lib/rogue-raise/integrations/spam";

import { RegistrationForm } from "./registration-form";

export const metadata = { title: "Register · Rogue Raise" };

// The signed spam challenge is minted per request, so never statically cached.
export const dynamic = "force-dynamic";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await loadLandingPage(slug);
  if (!event || !isPublicEvent(event.status)) notFound();

  // Registration closed is a real state with its own page, not a 404 — the link
  // may be in an email someone opens a week late.
  if (!event.registrationOpen) {
    return (
      <PageShell width="form" density="comfortable" align="center">
        <p className="eyebrow">{event.organizationName}</p>
        <h1 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">
          Registration is closed
        </h1>
        <p className="max-w-prose text-lg text-ink/80">
          {event.title} isn&rsquo;t taking new registrations right now.
        </p>
        <div>
          <Button asChild variant="outline" size="touch">
            <Link href={`/events/${event.slug}`}>Back to the event</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const challenge = getSpamGuard().issueChallenge();

  return (
    <PageShell width="form" density="comfortable">
      <PageHeader
        size="display"
        eyebrow={event.organizationName}
        title="Register to build"
        lede={
          <>
            {event.title}
            {event.weekendLabel ? ` · ${event.weekendLabel}` : ""}
          </>
        }
      >
        <p className="max-w-prose text-sm text-ink/60">
          Four fields. We&rsquo;ll email you the rules and what to bring.
        </p>
      </PageHeader>

      <RegistrationForm
        eventSlug={event.slug}
        challengeTs={challenge.renderedAt}
        challengeSig={challenge.sig}
      />
    </PageShell>
  );
}
