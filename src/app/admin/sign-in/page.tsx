import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/rogue-raise/page-header";
import { PageShell } from "@/components/rogue-raise/page-shell";
import { checkAdmin } from "@/lib/rogue-raise/admin/guard";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in · Rogue Raise",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function safeNext(raw: string | undefined): string {
  return raw && raw.startsWith("/admin") && !raw.startsWith("//")
    ? raw
    : "/admin/events";
}

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const target = safeNext(Array.isArray(next) ? next[0] : next);

  // Already signed in — don't make staff look at a form they don't need.
  const check = await checkAdmin();
  if (check.ok) redirect(target);

  return (
    <PageShell width="auth" density="compact" align="center">
      <PageHeader
        eyebrow="WR Admin"
        title="Sign in"
        lede="The Rogue Raise console. Accounts are created by White Rabbit — there’s no sign-up here."
      />

      <SignInForm next={target} />

      {check.reason === "unconfigured" ? (
        <p className="rounded-lg border border-wr-olive-green/40 bg-muted p-3 text-sm text-ink/80">
          Authentication isn&rsquo;t configured in this environment. Set{" "}
          <code className="font-mono text-xs">BETTER_AUTH_SECRET</code> and{" "}
          <code className="font-mono text-xs">BETTER_AUTH_URL</code>, then run{" "}
          <code className="font-mono text-xs">npm run db:auth-migrate</code>.
        </p>
      ) : null}
    </PageShell>
  );
}
