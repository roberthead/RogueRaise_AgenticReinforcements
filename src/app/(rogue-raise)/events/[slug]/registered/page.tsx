import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/rogue-raise/page-shell";
import { Button } from "@/components/ui/button";
import { isPublicEvent, loadLandingPage } from "@/lib/rogue-raise/events/landing";

export const metadata = { title: "You're registered · Rogue Raise" };
export const dynamic = "force-dynamic";

export default async function RegisteredPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await loadLandingPage(slug);
  if (!event || !isPublicEvent(event.status)) notFound();

  return (
    <PageShell width="form" density="comfortable" align="center">
      <p className="eyebrow">{event.organizationName}</p>
      <h1 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">
        You&rsquo;re in
      </h1>
      <p className="max-w-prose text-lg text-ink/80">
        We&rsquo;ve emailed your confirmation, including the rules and what to
        bring. {event.weekendLabel ? `See you ${event.weekendLabel}.` : ""}
      </p>
      <p className="max-w-prose text-ink/70">
        If it doesn&rsquo;t arrive in a few minutes, check your spam folder — and
        if it&rsquo;s not there either, reply to any White Rabbit email and
        we&rsquo;ll sort it out.
      </p>
      <div>
        <Button asChild variant="outline" size="touch">
          <Link href={`/events/${event.slug}`}>Back to the event</Link>
        </Button>
      </div>
    </PageShell>
  );
}
