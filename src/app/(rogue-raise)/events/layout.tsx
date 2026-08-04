import { SiteFooter } from "@/components/rogue-raise/site-footer";
import { SiteHeader } from "@/components/rogue-raise/site-header";

/**
 * Public chrome for event landing, registration and the registered
 * confirmation.
 *
 * `activeKey="raises"` and not an "Events" item of its own: an event page is a
 * child of the hub's "Raises" list, not a fourth top-level destination. The
 * public nav has exactly two items and this segment is inside the first of
 * them, so that is the one that should read as current.
 */
export default function PublicEventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader activeKey="raises" />
      {children}
      <SiteFooter />
    </>
  );
}
