import * as React from "react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/rogue-raise/card";

/**
 * EmptyState — the dashed block shown when a list has nothing in it.
 *
 * WHY IT EXISTS
 * -------------
 * Extracted from the local `EmptyState` in
 * `src/app/admin/(console)/sponsors/page.tsx` and the inline dashed block in
 * `src/app/admin/(console)/events/page.tsx`, which are the same component
 * written twice with the same logic and slightly different markup.
 *
 * THE PART THAT IS NOT A STYLE CHOICE
 * -----------------------------------
 * Both of those files distinguish TWO cases, and this component makes that
 * distinction structural instead of a conditional somebody has to remember:
 *
 *   variant="empty"    — nothing exists. There is no sponsor application in the
 *                        system at all. The honest copy explains what would
 *                        cause one to appear.
 *   variant="filtered" — things exist; none match THIS view. The honest copy
 *                        says so and offers the way back out.
 *
 * Collapsing them into one "No results" block tells a user with a full database
 * that their database is empty. That is the same failure this codebase already
 * ruled on elsewhere and wrote down: a missing line count renders "not counted"
 * and a missing value renders an em dash, never `0`, because zero is a
 * measurement and absence is not (see
 * `src/lib/rogue-raise/integrations/github.ts` and the submission categoriser).
 * "We have no data" and "the count is zero" are different claims, and a UI that
 * conflates them is lying about which one it knows.
 *
 * The type enforces the half of this that can be enforced: `filtered` REQUIRES
 * an `action`, because a filtered-empty view with no route back out is a dead
 * end the user cannot see their way out of. `empty` does not, because there may
 * genuinely be nothing to offer yet.
 */

interface EmptyStateBase {
  /** The one-line explanation. Plain prose, sentence case, no exclamation. */
  title: React.ReactNode;
  /** Optional second line — what would make something appear here. */
  description?: React.ReactNode;
  /** Padding nudges only; the dashed treatment is the point of the component. */
  className?: string;
}

export type EmptyStateProps =
  | (EmptyStateBase & {
      variant: "empty";
      /** Optional here: there may be nothing useful to offer yet. */
      action?: React.ReactNode;
    })
  | (EmptyStateBase & {
      variant: "filtered";
      /** REQUIRED: a filtered-empty view must offer the way back out. */
      action: React.ReactNode;
    });

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card
      variant="dashed"
      padding="xl"
      className={cn("text-center", className)}
    >
      <p className="text-ink/80">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-ink/60">{description}</p>
      ) : null}
      {action ? <p className="mt-1 text-sm">{action}</p> : null}
    </Card>
  );
}
