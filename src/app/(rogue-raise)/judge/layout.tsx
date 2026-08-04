import {
  ScopedFooter,
  ScopedTopBar,
} from "@/components/rogue-raise/scoped-top-bar";

/**
 * Chrome for the judge surfaces: background questionnaire and scorecard.
 *
 * The role is a per-segment constant because a layout cannot receive props from
 * the page beneath it — and because `ScopedTopBar` must never take an
 * `eventId` or run a query of its own. See `scoped-top-bar.tsx`: no nav, no
 * links, nothing that leaves the flow, and no event name (the page's
 * `PageHeader` eyebrow already carries it, behind the token check).
 */
export default function ScopedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScopedTopBar role="Judge" />
      {children}
      <ScopedFooter />
    </>
  );
}
