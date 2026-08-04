import { SiteFooter } from "@/components/rogue-raise/site-footer";
import { SiteHeader } from "@/components/rogue-raise/site-header";

/**
 * Public chrome for the sponsor application and its thanks page.
 *
 * Scoped to the `(apply)` route group ON PURPOSE. Its sibling group,
 * `(intake)`, serves the same `/sponsor/*` URL space but is magic-link gated,
 * and gets `ScopedTopBar` with no navigation instead. Route groups are what
 * keep those two apart without a `sponsor/layout.tsx` that would wrap both.
 */
export default function SponsorApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader activeKey="sponsor" />
      {children}
      <SiteFooter />
    </>
  );
}
