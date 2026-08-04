import { ConsoleNav } from "@/components/rogue-raise/console-nav";

/**
 * The console dashboard's own segment, purely so `/admin` can declare its nav
 * position.
 *
 * `(dashboard)` is a ROUTE GROUP, so the URL is untouched — `page.tsx` still
 * serves `/admin`, and the build's route table is unchanged. The move exists
 * because a nav rendered in the SHARED `(console)/layout.tsx` cannot know which
 * section is current and would not re-render when the user moved between
 * sections (see `console-nav.tsx`). Giving the dashboard a segment of its own
 * puts all three console sections on the same footing.
 *
 * No auth here: `(console)/layout.tsx` above it already gated this subtree, and
 * duplicating `checkAdmin()` for chrome would be a second session round trip
 * per request.
 */
export default function ConsoleDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ConsoleNav activeKey="dashboard" />
      {children}
    </>
  );
}
