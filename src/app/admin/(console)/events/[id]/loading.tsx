import { Bone, LoadingShell } from "@/components/rogue-raise/skeleton";

/**
 * Route-level loading skeleton for one event. Visual bones are `aria-hidden`;
 * one polite live region announces the load.
 *
 * Width and density MUST match `page.tsx` — `LoadingShell` takes the identical
 * prop type, and `design-system.test.ts` asserts the two agree.
 */
export default function Loading() {
  return (
    <LoadingShell width="reading" density="compact" label="Loading this event…">
      <Bone className="h-4 w-24" />
      <div className="flex flex-col gap-3">
        <Bone className="h-3 w-20" />
        <Bone className="h-10 w-80 max-w-full" />
        <Bone className="h-5 w-56" />
      </div>
      <Bone className="h-44 w-full rounded-lg" />
      <Bone className="h-56 w-full rounded-lg" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Bone className="h-7 w-48" />
          <Bone className="h-16 w-full" />
        </div>
      ))}
    </LoadingShell>
  );
}
