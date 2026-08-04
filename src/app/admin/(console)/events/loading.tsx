import { Bone, LoadingShell } from "@/components/rogue-raise/skeleton";

/**
 * Route-level loading skeleton for the events list. Visual bones are
 * `aria-hidden`; one polite live region announces the load.
 *
 * Width and density MUST match `page.tsx` — `LoadingShell` takes the identical
 * prop type, and `design-system.test.ts` asserts the two agree.
 */
export default function Loading() {
  return (
    <LoadingShell width="wide" density="compact" label="Loading events…">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Bone className="h-3 w-20" />
        <Bone className="h-9 w-48" />
        <Bone className="h-4 w-96 max-w-full" />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bone key={i} className="h-9 w-32 rounded-full" />
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </LoadingShell>
  );
}
