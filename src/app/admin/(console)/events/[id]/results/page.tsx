import Link from "next/link";
import { notFound } from "next/navigation";

import { loadResults } from "@/lib/rogue-raise/judging/queries";
import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";

import { ResultsConsole } from "./results-console";

export const metadata = { title: "Results · Rogue Raise" };

// Scores land while this page is open — never cached.
export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const results = await loadResults(id);
  if (!results) notFound();

  return (
    <PageShell width="wide" density="compact">
      <PageHeader
        eyebrow="WR Admin"
        title={results.event.title}
        lede="Scores, ties, and awards. Nothing here decides a winner for you."
      >
        <p className="text-sm">
          <Link
            href={`/admin/events/${id}`}
            className="font-medium text-ink underline underline-offset-4"
          >
            ← Back to the event
          </Link>
        </p>
      </PageHeader>

      <ResultsConsole results={results} />
    </PageShell>
  );
}
