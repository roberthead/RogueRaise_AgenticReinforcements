import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";
import { isPublicEvent, loadLandingPage } from "@/lib/rogue-raise/events/landing";

/**
 * Public event landing page (PRD §6.1).
 *
 * The date, schedule, and location render from the EVENT record — the marketing
 * agent is deliberately told not to write them, so they can never go stale here.
 * Only approved copy is shown; with none, the page falls back to what the
 * sponsor themselves wrote, which is honest rather than empty.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadLandingPage(slug);
  if (!event || !isPublicEvent(event.status)) return { title: "Rogue Raise" };
  return {
    title: `${event.title} · Rogue Raise`,
    description: event.summary.slice(0, 200),
  };
}

export default async function EventLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await loadLandingPage(slug);
  // An event that hasn't reached registration has no public page yet.
  if (!event || !isPublicEvent(event.status)) notFound();

  const location = [event.locationName, event.locationAddress]
    .filter(Boolean)
    .join(", ");

  return (
    <PageShell width="reading" density="comfortable">
      <PageHeader
        size="display"
        eyebrow={`White Rabbit · Ashland, OR · with ${event.organizationName}`}
        title={event.headline}
      >
        {event.summary ? (
          <p className="max-w-prose whitespace-pre-wrap text-lg text-ink/80">
            {event.summary}
          </p>
        ) : null}

        <dl className="grid gap-x-4 gap-y-1 text-base sm:grid-cols-[auto_1fr]">
          <dt className="text-ink/60">When</dt>
          <dd className="text-ink/90">
            {event.weekendLabel ?? "Dates are being confirmed"}
          </dd>
          {location ? (
            <>
              <dt className="text-ink/60">Where</dt>
              <dd className="text-ink/90">{location}</dd>
            </>
          ) : null}
        </dl>

        {event.registrationOpen ? (
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/events/${event.slug}/register`}
              className="inline-flex min-h-12 items-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
            >
              Register to build
            </Link>
            {event.participantCount > 0 ? (
              <span className="text-sm text-ink/60">
                {event.participantCount} builder
                {event.participantCount === 1 ? "" : "s"} signed up
              </span>
            ) : null}
          </div>
        ) : (
          // `registrationOpen` IS `status === "registration_open"` (see
          // `isRegistrationOpen` in events/landing.ts), so reaching this branch
          // already proves the status is something else. The test that used to
          // sit here was dead, and it read as though an empty notice were a
          // real state.
          <p className="rounded-md border border-input bg-muted/40 p-4 text-sm text-ink/80">
            Registration for this Rogue Raise is closed.
          </p>
        )}
      </PageHeader>

      {event.scheduleLines.length > 0 ? (
        <section aria-labelledby="schedule" className="flex flex-col gap-3">
          <h2
            id="schedule"
            className="font-serif text-2xl font-semibold text-wr-olive-green"
          >
            The weekend
          </h2>
          <ul className="flex flex-col gap-1 text-ink/90">
            {event.scheduleLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {event.sections.map((section) => (
        <section
          key={section.heading}
          aria-labelledby={`s-${section.heading}`}
          className="flex flex-col gap-3"
        >
          <h2
            id={`s-${section.heading}`}
            className="font-serif text-2xl font-semibold text-wr-olive-green"
          >
            {section.heading}
          </h2>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-ink/90">
            {section.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>
      ))}

      {event.faq.length > 0 ? (
        <section aria-labelledby="faq" className="flex flex-col gap-4">
          <h2 id="faq" className="font-serif text-2xl font-semibold text-wr-olive-green">
            Questions
          </h2>
          <dl className="flex flex-col gap-4">
            {event.faq.map((entry) => (
              <div key={entry.question}>
                <dt className="font-medium text-ink">{entry.question}</dt>
                <dd className="mt-1 max-w-prose whitespace-pre-wrap text-ink/80">
                  {entry.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {event.registrationOpen ? (
        <div>
          <Link
            href={`/events/${event.slug}/register`}
            className="inline-flex min-h-12 items-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
          >
            Register to build
          </Link>
        </div>
      ) : null}
    </PageShell>
  );
}
