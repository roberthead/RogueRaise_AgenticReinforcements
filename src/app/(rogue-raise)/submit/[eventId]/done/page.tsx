import Link from "next/link";

import { PageShell } from "@/components/rogue-raise/page-shell";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Submitted · Rogue Raise" };

export default function SubmittedPage() {
  return (
    <PageShell width="form" density="comfortable" align="center">
      <p className="eyebrow">White Rabbit · Ashland, OR</p>
      <h1 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">
        That&rsquo;s in
      </h1>
      <p className="max-w-prose text-lg text-ink/80">
        Your project is with the judges. Pitches are at 4:00 PM — five minutes,
        and they&rsquo;ve already read your summary. Results at 6:00.
      </p>
      <p className="max-w-prose text-ink/70">
        Go get a drink of water. You&rsquo;ve earned it.
      </p>
      <div>
        <Button asChild variant="outline" size="touch">
          <Link href="/rogue-raise">Back to Rogue Raise</Link>
        </Button>
      </div>
    </PageShell>
  );
}
