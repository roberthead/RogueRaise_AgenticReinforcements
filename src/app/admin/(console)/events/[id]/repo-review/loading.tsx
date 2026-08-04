import { Bone, LoadingShell } from "@/components/rogue-raise/skeleton";

/**
 * Route-level loading skeleton for repo review. Width and density MUST match
 * `page.tsx`; `design-system.test.ts` asserts the two agree.
 */
export default function Loading() {
  return (
    <LoadingShell width="wide" density="compact" label="Loading the repository…">
      <Bone className="h-4 w-40" />
      <div className="flex flex-col gap-3">
        <Bone className="h-3 w-20" />
        <Bone className="h-10 w-64" />
        <Bone className="h-4 w-96 max-w-full" />
      </div>
      <Bone className="h-12 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Bone key={i} className="h-28 w-full rounded-lg" />
      ))}
    </LoadingShell>
  );
}
