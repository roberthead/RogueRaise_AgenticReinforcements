import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  eventStatusLabel,
  hasReachedStatus,
  type LifecycleStatus,
} from "@/lib/rogue-raise/events/status";

/**
 * EventSubNav — the five phases of one event, on every page of that event.
 *
 * WHY IT EXISTS
 * -------------
 * The five phase pages under `/admin/events/[id]` were connected by ad-hoc
 * one-way links: the overview carried all four siblings, repo review carried
 * one ("Agents & drafts →"), submissions carried one ("Results & awards →"),
 * and agents and results carried none. A staff member deep in Submissions had
 * no way to reach Results except by going back up to the event and down again.
 * The asymmetry was the bug — the links themselves were fine.
 *
 * Those ad-hoc rows are removed where this replaces them. Links that are NOT a
 * sibling phase stay exactly where they are: the attachment links on the
 * overview, "Edit the draft →" on repo review, the public event page link.
 *
 * STATUS AWARENESS: RENDERED, NOT HIDDEN
 * --------------------------------------
 * `Event.status` gates what is reachable (PRD §4 — every UI action checks it),
 * so a phase whose work has not begun is not a link. But it is still RENDERED.
 * Hiding it would make the nav change shape underneath a user as an event
 * advances, and in a fourteen-state lifecycle the thing a staff member most
 * needs from this row is a sense of WHERE THEY ARE in it. A row of five that
 * quietly becomes a row of two answers a question nobody asked.
 *
 * An unavailable phase is therefore:
 *   - `role="link"` + `aria-disabled="true"` — announced as a link that exists
 *     and is currently unavailable, rather than as unexplained plain text.
 *     `role="link"` also gives it name-from-content; a bare focusable `<span>`
 *     has role `generic`, which does not.
 *   - `tabIndex={0}` — focusable ON PURPOSE. A keyboard user who cannot reach
 *     it cannot discover that the phase exists or why it is closed, which is
 *     the whole point of rendering it. (This is NOT the "never disable a
 *     control the user is operating" case from CLAUDE.md: nothing here was ever
 *     enabled, no focus is stolen, and nothing commits on arrow keys.)
 *   - `aria-describedby` pointing at an `sr-only` sibling that says WHY, in
 *     terms of the event's actual status: "Available once the context repo has
 *     been generated. This event is Intake pending." The sibling sits OUTSIDE
 *     the item so it is a description, not part of the name.
 *   - dashed-bordered rather than merely dimmed. The dashed border is the
 *     non-colour cue, and it is the same signal `Card variant="dashed"` already
 *     carries in this product: an outline waiting to be filled.
 *
 * ACTIVE STATE COMES IN AS A PROP
 * -------------------------------
 * `activeKey` is passed by each page, exactly as `ConsoleNav` takes it from
 * each section layout, and for the same reason: `usePathname` would make this a
 * Client Component, and a nav that computes its active item from a layout that
 * Next does not re-render across a navigation emits a stale `aria-current`
 * forever. Each page knows which phase it is at build time. That is the whole
 * derivation — a per-page constant, no client JS.
 *
 * Active is filled AND bold AND underlined AND `aria-current="page"` — the
 * `filter-chip-nav.tsx` / `console-nav.tsx` idiom, never colour alone.
 *
 * `aria-label="Event phases"` is distinct from every other labelled nav in the
 * product: "Main", "Console sections", "Breadcrumb", "Filter applications by
 * status", "Filter events by status". It shares a page with two of those.
 *
 * NOTE ON HEADINGS: this emits none. The page's `<h1>` is `PageHeader`'s.
 */

export type EventPhaseKey =
  | "overview"
  | "agents"
  | "repo-review"
  | "submissions"
  | "results";

interface EventPhaseBase {
  key: EventPhaseKey;
  label: string;
  /** Appended to `/admin/events/{id}`. Empty string for the overview itself. */
  segment: string;
}

/**
 * A gate and its explanation are one decision, so the type keeps them together:
 * a phase that can be closed MUST say why, and a phase that never closes cannot
 * carry a reason nobody will read. (Same discipline as `EmptyState`'s
 * `filtered` variant requiring an `action`.)
 */
type EventPhase =
  | (EventPhaseBase & { unlocksAt: null })
  | (EventPhaseBase & {
      /**
       * The lifecycle status at which this phase's work begins. Each is a
       * status already recorded as a gate elsewhere in the codebase — see the
       * per-entry note.
       */
      unlocksAt: LifecycleStatus;
      /** Why it is closed. Rendered `sr-only`, followed by the current status. */
      requirement: string;
    });

const PHASES: readonly EventPhase[] = [
  {
    // The event record itself. Reachable from the moment there is an event.
    key: "overview",
    label: "Overview",
    segment: "",
    unlocksAt: null,
  },
  {
    // `intake_complete` is the earliest `triggerStatuses` value in the whole
    // catalog (the research agent — `lib/rogue-raise/agents/catalog.ts`).
    // Before it, every agent on that page is blocked and the page is a list of
    // things you cannot do.
    key: "agents",
    label: "Agents & drafts",
    segment: "/agents",
    unlocksAt: "intake_complete",
    requirement: "Available once the sponsor’s intake is complete.",
  },
  {
    // `REVIEWABLE_STATUSES` in `lib/rogue-raise/repo/review.ts` starts here.
    // Provisioning moves the event `repo_generating → repo_review`, so this is
    // the first status at which a repo actually exists to review.
    key: "repo-review",
    label: "Repo review",
    segment: "/repo-review",
    unlocksAt: "repo_review",
    requirement: "Available once the context repo has been generated.",
  },
  {
    // `isSubmissionWindowOpen` (`lib/rogue-raise/submissions/invite.ts`) is
    // `status === "live"`. Nothing can have been submitted before that.
    key: "submissions",
    label: "Submissions",
    segment: "/submissions",
    unlocksAt: "live",
    requirement: "Available once the event goes live.",
  },
  {
    // Scores exist from `judging` onward — the same status that opens the
    // statistics agent (`triggerStatuses: ["judging", "completed"]`).
    key: "results",
    label: "Results & awards",
    segment: "/results",
    unlocksAt: "judging",
    requirement: "Available once judging has opened.",
  },
];

const BASE_ITEM =
  "inline-flex min-h-9 items-center rounded-full border px-4 py-1.5 text-sm";

export function EventSubNav({
  eventId,
  status,
  activeKey,
  className,
}: {
  eventId: string;
  /** The event's current `status`. Unknown values unlock nothing. */
  status: string;
  activeKey: EventPhaseKey;
  className?: string;
}) {
  const statusLabel = eventStatusLabel(status);

  return (
    <nav aria-label="Event phases" className={className}>
      <ul className="flex flex-wrap gap-2">
        {PHASES.map((phase) => {
          const isActive = phase.key === activeKey;

          // The page you are standing on is reachable by definition — several
          // of these pages render before their phase opens and say so in their
          // own copy. Marking the current page "unavailable" would strand the
          // row with no `aria-current` at all, which is worse than either.
          if (
            !isActive &&
            phase.unlocksAt !== null &&
            !hasReachedStatus(status, phase.unlocksAt)
          ) {
            const reasonId = `event-phase-${phase.key}-reason`;
            return (
              <li key={phase.key}>
                <span
                  role="link"
                  aria-disabled="true"
                  tabIndex={0}
                  aria-describedby={reasonId}
                  className={cn(
                    BASE_ITEM,
                    // `text-ink/70` deliberately, NOT the `/60` used for
                    // secondary prose elsewhere: composited over paper that
                    // measures 4.46:1, under the 4.5:1 AA floor for text this
                    // size. `/70` measures 6.20:1. A closed phase still has to
                    // be readable — it is the label that tells you the phase
                    // exists at all.
                    "cursor-not-allowed border-dashed border-wr-olive-green/40 text-ink/70",
                  )}
                >
                  {phase.label}
                </span>
                <span id={reasonId} className="sr-only">
                  {`${phase.requirement} This event is ${statusLabel}.`}
                </span>
              </li>
            );
          }

          return (
            <li key={phase.key}>
              <Link
                href={`/admin/events/${eventId}${phase.segment}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  BASE_ITEM,
                  "transition-colors",
                  isActive
                    ? "border-ink bg-ink font-semibold text-background underline underline-offset-4"
                    : "border-wr-olive-green/40 text-ink hover:bg-muted",
                )}
              >
                {phase.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
