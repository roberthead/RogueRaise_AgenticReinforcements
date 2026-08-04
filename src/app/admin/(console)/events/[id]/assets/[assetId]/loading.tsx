import { Bone, LoadingShell } from "@/components/rogue-raise/skeleton";

/**
 * Route-level loading skeleton for one generated draft. Width and density MUST
 * match `page.tsx`; `design-system.test.ts` asserts the two agree.
 */
export default function Loading() {
  return (
    <LoadingShell width="reading" density="compact" label="Loading this draft…">
      <Bone className="h-4 w-40" />
      <div className="flex flex-col gap-3">
        <Bone className="h-3 w-24" />
        <Bone className="h-9 w-80 max-w-full" />
        <Bone className="h-4 w-64" />
      </div>
      <Bone className="h-12 w-full" />
      <Bone className="h-96 w-full rounded-lg" />
    </LoadingShell>
  );
}
