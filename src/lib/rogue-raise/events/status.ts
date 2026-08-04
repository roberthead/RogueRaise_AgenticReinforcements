/**
 * Event-phase gates for the admin console. Pure and DB-free so both the server
 * actions and the UI can ask the same questions and never disagree about what
 * is allowed right now.
 *
 * `Event.status` is the single source of truth for what is unlocked (PRD §4), so
 * every one of these is a list of statuses rather than an ad-hoc boolean.
 */

/**
 * When confirming a weekend is meaningful: from the moment an intake exists
 * until registration has opened. Before `intake_pending` there are no date
 * options to choose from; from `live` onward the weekend is already happening.
 */
export const CONFIRMABLE_STATUSES = [
  "intake_pending",
  "intake_complete",
  "repo_generating",
  "repo_review",
  "repo_approved",
  "registration_open",
] as const;

/**
 * Confirming here is allowed but consequential — participants have already been
 * shown dates, so the UI warns before the action rather than silently moving them.
 */
export const LATE_CONFIRM_STATUSES = ["registration_open"] as const;

/** When reissuing the sponsor's intake link still makes sense. */
export const REISSUABLE_STATUSES = ["intake_pending", "intake_complete"] as const;

export function canConfirmWeekend(status: string): boolean {
  return (CONFIRMABLE_STATUSES as readonly string[]).includes(status);
}

export function isLateConfirm(status: string): boolean {
  return (LATE_CONFIRM_STATUSES as readonly string[]).includes(status);
}

export function canReissueIntakeInvite(status: string): boolean {
  return (REISSUABLE_STATUSES as readonly string[]).includes(status);
}

/**
 * The lifecycle in order, mirroring the `event_status` enum in
 * `src/lib/rogue-raise/db/schema.ts` exactly — including the position of
 * `rejected`, which the enum places between `approved` and `intake_pending`.
 *
 * The gates above answer "may this happen NOW?". This answers a different
 * question — "has this event got this far?" — which is what a phase navigation
 * needs: submissions stay reachable during `judging` and `completed`, not only
 * while the window is open. Writing that as `["live","judging","completed",
 * "archived"]` per phase is the same fact stated four times, and it silently
 * omits any status added later.
 *
 * `rejected` is terminal and off the main line. Its enum position means an
 * event that was rejected has "reached" nothing past `approved`, which is the
 * behaviour we want: a rejected application never runs a phase. That is a
 * consequence of the order, not an accident of it — keep the two lists in sync.
 */
export const LIFECYCLE_ORDER = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "intake_pending",
  "intake_complete",
  "repo_generating",
  "repo_review",
  "repo_approved",
  "registration_open",
  "live",
  "judging",
  "completed",
  "archived",
] as const;

export type LifecycleStatus = (typeof LIFECYCLE_ORDER)[number];

/**
 * True when `status` is `target` or later in the lifecycle.
 *
 * An unrecognised `status` returns `false` for every target — the safe answer
 * for a value we cannot place, since the caller uses this to decide what to
 * unlock.
 */
export function hasReachedStatus(
  status: string,
  target: LifecycleStatus,
): boolean {
  const at = (LIFECYCLE_ORDER as readonly string[]).indexOf(status);
  if (at === -1) return false;
  return at >= (LIFECYCLE_ORDER as readonly string[]).indexOf(target);
}

/** Human label for an `event_status` value — used in the queue and detail views. */
export const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  intake_pending: "Intake pending",
  intake_complete: "Intake complete",
  repo_generating: "Repo generating",
  repo_review: "Repo review",
  repo_approved: "Repo approved",
  registration_open: "Registration open",
  live: "Live",
  judging: "Judging",
  completed: "Completed",
  archived: "Archived",
};

export function eventStatusLabel(status: string): string {
  return EVENT_STATUS_LABELS[status] ?? status;
}
