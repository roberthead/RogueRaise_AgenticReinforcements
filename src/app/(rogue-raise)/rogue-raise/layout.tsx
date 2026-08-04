import { SiteFooter } from "@/components/rogue-raise/site-footer";
import { SiteHeader } from "@/components/rogue-raise/site-header";

/**
 * Public chrome for the hub. `activeKey` is a per-segment CONSTANT — see
 * `site-header.tsx` for why that, rather than a pathname, is what keeps the
 * active nav item correct in a Server Component.
 *
 * Sibling route groups do not compose, so the public tier's chrome is declared
 * by each public segment (`rogue-raise`, `events`, `sponsor/(apply)`) rather
 * than once in `(rogue-raise)/layout.tsx` — that layout also covers the
 * magic-link segments, which must get no navigation at all.
 */
export default function PublicHubLayout({
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
