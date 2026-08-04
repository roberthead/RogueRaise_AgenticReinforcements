import { SkipLink } from "@/components/rogue-raise/skip-link";

/**
 * The one thing the public and external tiers share: a bypass link.
 *
 * They share nothing else. The public tier gets `SiteHeader`/`SiteFooter`; the
 * five magic-link segments get `ScopedTopBar`/`ScopedFooter` and no navigation
 * at all. That split is why the header is not here — it lives in each segment's
 * own layout, which is also what keeps the active nav item correct without a
 * client component (see `site-header.tsx`).
 *
 * No auth, no data, no route-segment config. Every page beneath this checks its
 * own token or is genuinely public.
 */
export default function RogueRaiseTierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      {children}
    </>
  );
}
