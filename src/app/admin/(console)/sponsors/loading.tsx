import { Bone, LoadingShell } from "@/components/rogue-raise/skeleton";

/**
 * Route-level loading skeleton for the curation queue. The visual bones are
 * `aria-hidden`; a single polite live region announces the load to AT.
 *
 * Width and density MUST match `page.tsx` — `LoadingShell` takes the identical
 * prop type, and `design-system.test.ts` asserts the two agree.
 */
export default function Loading() {
  return (
    <LoadingShell
      width="wide"
      density="compact"
      label="Loading sponsor applications…"
    >
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Bone className="h-3 w-20" />
        <Bone className="h-9 w-72" />
        <Bone className="h-4 w-96 max-w-full" />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Bone key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-3">
        <Bone className="hidden h-8 w-full md:block" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Bone key={i} className="h-16 w-full rounded-lg md:h-12" />
        ))}
      </div>
    </LoadingShell>
  );
}
