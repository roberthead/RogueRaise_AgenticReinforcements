import Link from "next/link";

import { Card } from "@/components/rogue-raise/card";
import { EmptyState } from "@/components/rogue-raise/empty-state";
import { FilterChipNav } from "@/components/rogue-raise/filter-chip-nav";
import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";
import {
  countAdminEventsByStatus,
  listAdminEvents,
} from "@/lib/rogue-raise/events/queries";
import { isPublicEvent } from "@/lib/rogue-raise/events/landing";
import { eventStatusLabel } from "@/lib/rogue-raise/events/status";
import { formatWeekendLabel } from "@/lib/rogue-raise/intake/schedule";

export const metadata = {
  title: "Events · Rogue Raise",
};

// Statuses and intake progress change under us constantly — never cached.
export const dynamic = "force-dynamic";

/**
 * A curated subset of `event_status`, not all fifteen: these are the phases a
 * staff member actually filters by day to day. "All" is the default so nothing
 * is ever hidden by a filter the user didn't choose.
 */
const FILTERS = [
  { key: "all", label: "All" },
  { key: "intake_pending", label: "Intake pending" },
  { key: "intake_complete", label: "Intake complete" },
  { key: "registration_open", label: "Registration open" },
  { key: "live", label: "Live" },
  { key: "completed", label: "Completed" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function parseStatus(raw: string | string[] | undefined): FilterKey {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const match = FILTERS.find((f) => f.key === value);
  return match ? match.key : "all";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { status } = await searchParams;
  const active = parseStatus(status);

  const [rows, counts] = await Promise.all([
    listAdminEvents(active === "all" ? undefined : active),
    countAdminEventsByStatus(),
  ]);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const countFor = (key: FilterKey) => (key === "all" ? total : (counts[key] ?? 0));

  return (
    <PageShell width="wide" density="compact">
      <PageHeader
        eyebrow="WR Admin"
        title="Events"
        lede="Every Rogue Raise and where it stands. Open one to read the sponsor’s intake and lock in the weekend."
      />

      {/* Status filter — query-param links with live count badges. */}
      <FilterChipNav
        label="Filter events by status"
        activeKey={active}
        chips={FILTERS.map((f) => ({
          key: f.key,
          label: f.label,
          href: `/admin/events?status=${f.key}`,
          count: countFor(f.key),
        }))}
      />

      <section aria-labelledby="events-heading">
        <h2 id="events-heading" className="sr-only">
          {active === "all" ? "All events" : eventStatusLabel(active)}
        </h2>

        {rows.length === 0 ? (
          // "There are no events" and "no events match THIS filter" are
          // different claims — the second one owes the user a way back out.
          total === 0 ? (
            <EmptyState
              variant="empty"
              title="No events yet — approving a sponsor application creates one."
            />
          ) : (
            <EmptyState
              variant="filtered"
              title="No events in this phase right now."
              action={
                <Link
                  href="/admin/events?status=all"
                  className="font-medium text-ink underline underline-offset-4"
                >
                  View all events
                </Link>
              }
            />
          )
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => {
              const missing = row.completeness.required.filter((r) => !r.met);
              return (
                <Card as="li" key={row.id} interactive>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    {/* One tab stop per row: the title is a stretched link. */}
                    <Link
                      href={`/admin/events/${row.id}`}
                      className="font-serif text-lg font-semibold text-ink underline-offset-4 after:absolute after:inset-0 after:content-[''] hover:underline"
                    >
                      {row.organizationName}
                    </Link>
                    <span className="rounded-full border border-wr-olive-green/50 px-3 py-0.5 font-mono text-xs uppercase tracking-wide text-ink/80">
                      {eventStatusLabel(row.status)}
                    </span>
                  </div>

                  <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
                    <dt className="text-ink/60">Event</dt>
                    <dd className="text-ink/90">{row.title}</dd>

                    <dt className="text-ink/60">Weekend</dt>
                    <dd className="text-ink/90">
                      {row.confirmedFridayKickoffAt ? (
                        <>
                          {formatWeekendLabel(new Date(row.confirmedFridayKickoffAt))}{" "}
                          <span className="text-ink/60">(confirmed)</span>
                        </>
                      ) : (
                        "Not confirmed"
                      )}
                    </dd>

                    <dt className="text-ink/60">Intake</dt>
                    <dd className="text-ink/90">
                      {row.completeness.complete ? (
                        "Complete"
                      ) : (
                        <>
                          {row.completeness.requiredMetCount} of{" "}
                          {row.completeness.requiredTotal} vital sections
                          {missing.length > 0 ? (
                            <span className="text-ink/60">
                              {" "}
                              — still needs {missing.map((m) => m.label).join(", ")}
                            </span>
                          ) : null}
                        </>
                      )}
                    </dd>

                    {isPublicEvent(row.status) ? (
                      <>
                        <dt className="text-ink/60">Registered</dt>
                        <dd className="text-ink/90">
                          {row.participantCount} builder
                          {row.participantCount === 1 ? "" : "s"} ·{" "}
                          <Link
                            href={`/events/${row.slug}`}
                            className="underline underline-offset-4"
                          >
                            public page
                          </Link>
                        </dd>
                      </>
                    ) : null}

                    <dt className="text-ink/60">Created</dt>
                    <dd className="text-ink/90">
                      <time dateTime={row.createdAt}>{formatDate(row.createdAt)}</time>
                    </dd>
                  </dl>
                </Card>
              );
            })}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
