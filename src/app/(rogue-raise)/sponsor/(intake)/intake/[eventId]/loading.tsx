import { Bone, LoadingShell } from "@/components/rogue-raise/skeleton";

/**
 * Route-level loading skeleton for the intake form. The visual bones are
 * `aria-hidden`; a single polite live region announces the load to AT.
 *
 * Width and density MUST match `page.tsx`'s editable branch — `LoadingShell`
 * takes the identical prop type so a mismatch is visible at the call site, and
 * `design-system.test.ts` asserts the two agree.
 */
export default function Loading() {
  return (
    <LoadingShell
      width="reading"
      density="comfortable"
      label="Loading your intake form…"
    >
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Bone className="h-3 w-32" />
        <Bone className="h-10 w-80 max-w-full" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-2/3" />
      </div>

      {/* Progress panel */}
      <Bone className="h-40 w-full rounded-lg" />

      {/* Sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Bone className="h-7 w-56" />
          <Bone className="h-24 w-full rounded-lg" />
        </div>
      ))}
    </LoadingShell>
  );
}
