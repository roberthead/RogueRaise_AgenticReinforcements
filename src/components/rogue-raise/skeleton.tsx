import * as React from "react";

import { cn } from "@/lib/utils";
import {
  PageShell,
  pageShellGap,
  type PageShellLayout,
} from "@/components/rogue-raise/page-shell";

/**
 * Skeleton — loading bones, and the shell that holds them.
 *
 * WHY IT EXISTS
 * -------------
 * Seven `loading.tsx` files each hand-roll the same two things: a `<main>` with
 * a container, and a grid of `animate-pulse rounded bg-muted` blocks. They also
 * each hand-roll the container's WIDTH — which is how a loading state ends up
 * 3xl while the page it stands in for is 5xl, so the layout visibly jumps at
 * the exact moment the content arrives. That reads as a broken page rather than
 * a fast one, and no test could see it because both files were "correct".
 *
 * `LoadingShell` takes the IDENTICAL prop type as `PageShell`, so a skeleton
 * cannot describe a different page than its sibling without a type error at the
 * call site being obvious. `design-system.test.ts` (step 1.5) asserts the props
 * actually match between each `page.tsx` and its `loading.tsx`.
 *
 * THE ANNOUNCEMENT PATTERN, PRESERVED
 * -----------------------------------
 * This follows the house pattern already in
 * `src/app/admin/(console)/events/loading.tsx`: the visual bones are
 * `aria-hidden`, and ONE polite `role="status"` `sr-only` paragraph announces
 * the load. The bones are decoration — a screen reader reading out a dozen
 * empty boxes is noise, and announcing each one is worse. The single live line
 * is the whole accessible content of a loading state.
 */

export interface BoneProps {
  /** Size and shape utilities — `h-4 w-48`, `h-32 w-full`, `rounded-full`. */
  className?: string;
}

/**
 * One pulsing placeholder block.
 *
 * `aria-hidden` even though `LoadingShell` already hides the whole wrapper:
 * nesting it is harmless, and a `<Bone>` used outside a `LoadingShell` still
 * needs to be invisible to assistive tech.
 */
export function Bone({ className }: BoneProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded bg-muted", className)}
    />
  );
}

export interface LoadingShellProps extends PageShellLayout {
  /**
   * What is loading, as a sentence fragment a screen reader can announce —
   * "Loading events…", not "Loading". Required, so no loading state ships
   * silently.
   */
  label: string;
  className?: string;
  /** The bones. */
  children: React.ReactNode;
}

export function LoadingShell({
  width,
  density,
  align,
  label,
  className,
  children,
}: LoadingShellProps) {
  return (
    <PageShell width={width} density={density} align={align} className={className}>
      <p role="status" className="sr-only">
        {label}
      </p>

      {/*
       * The bones sit in one `aria-hidden` wrapper. That wrapper has to restate
       * the shell's gap: as the only child of `<main>`, it collapses the
       * shell's own `gap-*` to nothing, so `pageShellGap` hands back the exact
       * rhythm the real page will have.
       */}
      <div
        aria-hidden="true"
        className={cn(
          "flex flex-1 flex-col",
          pageShellGap({ width, density, align }),
        )}
      >
        {children}
      </div>
    </PageShell>
  );
}
