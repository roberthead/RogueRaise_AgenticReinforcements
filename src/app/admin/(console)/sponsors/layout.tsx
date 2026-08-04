import { ConsoleNav } from "@/components/rogue-raise/console-nav";

/**
 * Section chrome for the sponsor curation queue and application detail pages.
 *
 * `activeKey` is a per-segment constant. This layout re-renders when the user
 * enters `/admin/sponsors/*` and not otherwise, which is exactly when the
 * answer changes — the reason the nav sits here rather than in the shared
 * console layout (see `console-nav.tsx`).
 *
 * Its `<nav aria-label="Console sections">` shares pages with the queue's own
 * `<nav aria-label="Filter applications by status">`; the two labels are
 * deliberately distinct so a landmark list can tell them apart.
 */
export default function ConsoleSponsorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ConsoleNav activeKey="sponsors" />
      {children}
    </>
  );
}
