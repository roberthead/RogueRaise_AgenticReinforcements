import Link from "next/link";
import { count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/rogue-raise/db";
import { organizations, sponsorApplications } from "@/lib/rogue-raise/db/schema";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/rogue-raise/data-table";
import { EmptyState } from "@/components/rogue-raise/empty-state";
import { FilterChipNav } from "@/components/rogue-raise/filter-chip-nav";
import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";

import {
  formatDate,
  formatFinancial,
  StatusPill,
  STATUS_META,
  type QueueStatus,
} from "./status-pill";

export const metadata = {
  title: "Sponsor curation queue · Rogue Raise",
};

// Counts + rows must reflect every decision immediately — never statically cached.
export const dynamic = "force-dynamic";

const STATUS_VALUES: readonly QueueStatus[] = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
];

/** Filter key = a concrete status or the pseudo-"all". */
type FilterKey = QueueStatus | "all";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

/** Validate `?status=` against the enum; anything else falls back to `submitted`. */
function parseStatus(raw: string | string[] | undefined): FilterKey {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "all") return "all";
  if (value && (STATUS_VALUES as readonly string[]).includes(value)) {
    return value as QueueStatus;
  }
  return "submitted";
}

export default async function SponsorQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { status } = await searchParams;
  const active = parseStatus(status);

  // One grouped count query powers every filter badge (never findMany().length).
  const grouped = await db
    .select({ status: sponsorApplications.status, value: count() })
    .from(sponsorApplications)
    .groupBy(sponsorApplications.status);

  const counts = new Map<string, number>();
  let total = 0;
  for (const g of grouped) {
    counts.set(g.status, g.value);
    total += g.value;
  }
  const countFor = (key: FilterKey) =>
    key === "all" ? total : (counts.get(key) ?? 0);

  const rows = await db
    .select({
      id: sponsorApplications.id,
      orgName: organizations.name,
      pocName: sponsorApplications.pocName,
      amount: sponsorApplications.financialCommitmentAmount,
      toDiscuss: sponsorApplications.financialCommitmentToDiscuss,
      submittedAt: sponsorApplications.submittedAt,
      status: sponsorApplications.status,
    })
    .from(sponsorApplications)
    .innerJoin(
      organizations,
      eq(sponsorApplications.orgId, organizations.id),
    )
    .where(active === "all" ? undefined : eq(sponsorApplications.status, active))
    .orderBy(
      // Newest submissions first; unsubmitted (null) sink to the bottom, then a
      // stable created_at tiebreak disambiguates same-second / same-name orgs.
      sql`${sponsorApplications.submittedAt} desc nulls last`,
      desc(sponsorApplications.createdAt),
    );

  const activeLabel =
    active === "all" ? "All applications" : STATUS_META[active].label;

  /** The shape one queue row carries — inferred from the query, never restated. */
  type QueueRow = (typeof rows)[number];

  // `Submitted` is the only sorted column (see the ORDER BY above), so it is the
  // only one that may carry `aria-sort`. The org name is NOT here: it is the
  // `rowHeader`, which `DataTable` renders as the single `<th scope="row">` and
  // the single stretched link in the row.
  const columns: DataTableColumn<QueueRow>[] = [
    {
      key: "poc",
      header: "Primary contact",
      cell: (r) => r.pocName,
    },
    {
      key: "financial",
      header: "Financial commitment",
      cell: (r) => formatFinancial(r.amount, r.toDiscuss),
    },
    {
      key: "submitted",
      header: "Submitted",
      sort: "descending",
      cell: (r) =>
        r.submittedAt ? (
          <time dateTime={r.submittedAt.toISOString()}>
            {formatDate(r.submittedAt)}
          </time>
        ) : (
          // Never submitted is a different claim from submitted-with-no-date.
          "—"
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusPill status={r.status} />,
    },
  ];

  return (
    <PageShell width="wide" density="compact">
      <PageHeader
        eyebrow="WR Admin"
        title="Sponsor curation queue"
        lede="Review sponsorship applications and decide which Rogue Raises advance to intake. Newest submissions first."
      />

      {/* Status filter — query-param links with live count badges. The active
          chip's non-colour cue (filled + bold + underline) lives in the
          component now; see its docblock for why all three, always. */}
      <FilterChipNav
        label="Filter applications by status"
        activeKey={active}
        chips={FILTERS.map((f) => ({
          key: f.key,
          label: f.label,
          href: `/admin/sponsors?status=${f.key}`,
          count: countFor(f.key),
        }))}
      />

      <section aria-labelledby="queue-heading">
        <h2 id="queue-heading" className="sr-only">
          {activeLabel}
        </h2>

        {rows.length === 0 ? (
          <QueueEmptyState active={active} total={total} />
        ) : (
          <>
            {/* Desktop: semantic table. The caption names the FILTERED view and
                its sort order — a sighted user reads that off the active chip
                and the headers; nobody else can. */}
            <DataTable
              className="hidden md:table"
              caption={`${activeLabel}, sorted by submission date, newest first.`}
              rows={rows}
              rowKey={(r) => r.id}
              rowHeader={{
                header: "Organization",
                cell: (r) => r.orgName,
                // Single tab stop per row: the org name is the stretched link.
                href: (r) => `/admin/sponsors/${r.id}`,
              }}
              columns={columns}
            />

            {/* Mobile: card list mirroring the same one-link-per-row rule. NOT a
                table, and deliberately not folded into one — see DataTable's
                RESPONSIVE note. */}
            <ul className="flex flex-col gap-3 md:hidden">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="relative rounded-lg border border-wr-olive-green/25 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/admin/sponsors/${r.id}`}
                      className="font-serif text-lg font-semibold text-ink underline-offset-4 after:absolute after:inset-0 after:content-[''] hover:underline"
                    >
                      {r.orgName}
                    </Link>
                    <StatusPill status={r.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt className="text-ink/60">Contact</dt>
                    <dd className="text-ink/90">{r.pocName}</dd>
                    <dt className="text-ink/60">Commitment</dt>
                    <dd className="text-ink/90">
                      {formatFinancial(r.amount, r.toDiscuss)}
                    </dd>
                    <dt className="text-ink/60">Submitted</dt>
                    <dd className="text-ink/90">
                      {r.submittedAt ? (
                        <time dateTime={r.submittedAt.toISOString()}>
                          {formatDate(r.submittedAt)}
                        </time>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </PageShell>
  );
}

function QueueEmptyState({
  active,
  total,
}: {
  active: FilterKey;
  total: number;
}) {
  // Whole queue empty vs. a filter with no matches get different, honest copy —
  // which is the distinction `<EmptyState>`'s two variants make structural.
  if (total === 0) {
    return (
      <EmptyState
        variant="empty"
        title="No sponsor applications yet."
        description="New submissions from the sponsor sign-up form will appear here."
      />
    );
  }

  const label =
    active === "all"
      ? "applications"
      : `${STATUS_META[active as QueueStatus].label.toLowerCase()} applications`;
  return (
    <EmptyState
      variant="filtered"
      title={`No ${label} right now.`}
      action={
        <Link
          href="/admin/sponsors?status=all"
          className="font-medium text-ink underline underline-offset-4"
        >
          View all applications
        </Link>
      }
    />
  );
}
