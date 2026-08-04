import { Bone, LoadingShell } from "@/components/rogue-raise/skeleton";

/**
 * Route-level loading skeleton for the agents page. Width and density MUST
 * match `page.tsx`; `design-system.test.ts` asserts the two agree.
 */
export default function Loading() {
  return (
    <LoadingShell width="wide" density="compact" label="Loading agents…">
      <Bone className="h-4 w-32" />
      <div className="flex flex-col gap-3">
        <Bone className="h-3 w-20" />
        <Bone className="h-10 w-48" />
        <Bone className="h-4 w-96 max-w-full" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Bone key={i} className="h-36 w-full rounded-lg" />
      ))}
    </LoadingShell>
  );
}
