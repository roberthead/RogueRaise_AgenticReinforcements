/**
 * `LIFECYCLE_ORDER` is a hand-written copy of the `event_status` Postgres enum,
 * and `hasReachedStatus` treats its INDEX as meaningful — so the copy is only
 * correct while it matches the original in both contents and order.
 *
 * Nothing in the type system enforces that. Add a status to the enum for a new
 * milestone, forget this array, and `hasReachedStatus` silently returns `false`
 * for the new state: `EventSubNav` would render every phase as permanently
 * locked, with no error and no failing test. Insert one in the middle and every
 * gate after it shifts by one, which is worse — the console would quietly offer
 * phases that are not actually reachable yet.
 *
 * The array cannot simply BE `eventStatus.enumValues`, because that is typed
 * `string[]` rather than a literal union and `LifecycleStatus` needs the union.
 * So the duplication stays and this test is what makes it safe.
 */
import { describe, expect, it } from "vitest";

import { eventStatus } from "../db/schema";
import { LIFECYCLE_ORDER, hasReachedStatus } from "./status";

describe("LIFECYCLE_ORDER", () => {
  it("matches the event_status enum exactly, including order", () => {
    // Order matters as much as membership: `hasReachedStatus` compares indices.
    expect([...LIFECYCLE_ORDER]).toEqual([...eventStatus.enumValues]);
  });
});

describe("hasReachedStatus", () => {
  it("is true for the target itself and every later status", () => {
    expect(hasReachedStatus("live", "live")).toBe(true);
    expect(hasReachedStatus("judging", "live")).toBe(true);
    expect(hasReachedStatus("archived", "live")).toBe(true);
  });

  it("is false for statuses earlier in the lifecycle", () => {
    expect(hasReachedStatus("draft", "live")).toBe(false);
    expect(hasReachedStatus("intake_complete", "live")).toBe(false);
  });

  it("unlocks nothing beyond the earliest phases for the terminal rejected state", () => {
    // `rejected` sits at enum index 4, so an ordinal comparison lets it "reach"
    // anything before it. That is intentional and harmless — those phases are
    // approval-stage, not work-stage — but the work phases must stay shut.
    expect(hasReachedStatus("rejected", "intake_complete")).toBe(false);
    expect(hasReachedStatus("rejected", "repo_review")).toBe(false);
    expect(hasReachedStatus("rejected", "live")).toBe(false);
    expect(hasReachedStatus("rejected", "judging")).toBe(false);
  });

  it("treats an unrecognised status as having reached nothing", () => {
    // A row written by a future migration this build does not know about must
    // fail closed, never open.
    expect(hasReachedStatus("not_a_status", "live")).toBe(false);
    expect(hasReachedStatus("", "draft")).toBe(false);
  });
});
