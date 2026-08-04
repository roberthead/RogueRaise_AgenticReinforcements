/**
 * Structural guardrails for the design system (redesign-ui story, step 1.5).
 *
 * The failure this story exists to fix was not that any one page looked wrong.
 * It was that 32 files each invented their own root container, drifting to five
 * widths and four vertical rhythms, and nobody noticed for ten milestones. A
 * redesign that ships components without installing a MECHANISM just resets the
 * clock — the same drift returns as soon as the next feature lands.
 *
 * So this file is modelled on `src/lib/rogue-raise/admin/coverage.test.ts`, and
 * the part worth copying is not the grep. It is the written-down allow-list with
 * a reason per entry, plus a staleness check that makes the list SHRINK over
 * time instead of becoming a junk drawer. Adding an entry should feel like a
 * decision; leaving a stale one is a test failure.
 *
 * The allow-list below is currently seeded with every file awaiting the step 1.7
 * migration. Each one is removed as it is migrated, and when the list is empty
 * the rule stands on its own. That is deliberately visible: the size of this
 * list is the honest measure of how much of the sweep is left.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const APP = join(ROOT, "src/app");

/**
 * Files under `src/app` that still render their own `<main>`, pending the step
 * 1.7 migration to `<PageShell>`. DELETE an entry as you migrate its file —
 * the staleness test below fails if you don't.
 */
const PENDING_SHELL_MIGRATION: Record<string, string> = {
  // Admin console
  "admin/(console)/page.tsx": "pending 1.7",
  "admin/(console)/events/page.tsx": "pending 1.7",
  "admin/(console)/events/loading.tsx": "pending 1.7",
  "admin/(console)/events/[id]/page.tsx": "pending 1.7",
  "admin/(console)/events/[id]/loading.tsx": "pending 1.7",
  "admin/(console)/events/[id]/agents/page.tsx": "pending 1.7",
  "admin/(console)/events/[id]/agents/loading.tsx": "pending 1.7",
  "admin/(console)/events/[id]/assets/[assetId]/page.tsx": "pending 1.7",
  "admin/(console)/events/[id]/assets/[assetId]/loading.tsx": "pending 1.7",
  "admin/(console)/events/[id]/repo-review/page.tsx": "pending 1.7",
  "admin/(console)/events/[id]/repo-review/loading.tsx": "pending 1.7",
  "admin/(console)/events/[id]/results/page.tsx": "pending 1.7",
  "admin/(console)/events/[id]/submissions/page.tsx": "pending 1.7",
  "admin/(console)/sponsors/page.tsx": "pending 1.7",
  "admin/(console)/sponsors/loading.tsx": "pending 1.7",
  "admin/(console)/sponsors/[id]/page.tsx": "pending 1.7",
  "admin/sign-in/page.tsx": "pending 1.7",
};

/** Every `.tsx` under `src/app`, keyed by its path relative to `src/app`. */
function appFiles(dir: string = APP): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return appFiles(full);
    return full.endsWith(".tsx") ? [full] : [];
  });
}

const key = (file: string) => file.slice(APP.length + 1);

/**
 * Strip comments before scanning, so prose ABOUT `<main>` is not mistaken for a
 * `<main>`. Without this, documenting the rule in a docblock trips the rule —
 * which happened, and is a bad property for a test whose whole job is to be
 * explained in comments.
 */
function stripComments(source: string): string {
  return (
    source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // `(?<!:)` keeps `https://…` intact — without it, stripping trailing
      // comments would also truncate every URL in the file.
      .replace(/(?<!:)\/\/.*$/gm, "")
  );
}

/** Does this file render a literal `<main>` element? */
function rendersOwnMain(file: string): boolean {
  return /<main[\s>]/.test(stripComments(readFileSync(file, "utf8")));
}

describe("page containers", () => {
  /**
   * `<PageShell>` renders the ONE `<main>` in the product, so nothing under
   * `src/app` should render its own. That single rule subsumes the whole
   * container scale: the width, the vertical rhythm, `id="main"` for the skip
   * link, and the `tabIndex={-1}` that makes the skip link actually move focus
   * in Safari all live on the shell. A page that hand-rolls `<main>` silently
   * opts out of all four.
   */
  it("are owned by PageShell, never hand-rolled in a page", () => {
    const offenders = appFiles()
      .filter(rendersOwnMain)
      .map(key)
      .filter((k) => !(k in PENDING_SHELL_MIGRATION));

    expect(
      offenders,
      `These files render their own <main>. Use <PageShell width=… density=…> ` +
        `from @/components/rogue-raise/page-shell instead — it carries id="main", ` +
        `tabIndex={-1}, and the container scale.\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  /**
   * The mechanism that makes the allow-list temporary rather than permanent.
   * Migrate a file and forget to delete its entry, and this fails — so the list
   * can only ever get shorter.
   */
  it("have no stale allow-list entries", () => {
    const stillHandRolled = new Set(appFiles().filter(rendersOwnMain).map(key));
    const stale = Object.keys(PENDING_SHELL_MIGRATION).filter(
      (k) => !stillHandRolled.has(k),
    );

    expect(
      stale,
      `These files no longer render their own <main>, so delete their entries ` +
        `from PENDING_SHELL_MIGRATION in this file:\n${stale.join("\n")}`,
    ).toEqual([]);
  });
});

describe("loading skeletons", () => {
  /**
   * A `loading.tsx` whose container disagrees with its `page.tsx` produces a
   * width or rhythm jump at the exact moment real content arrives, which reads
   * as a broken page rather than a fast one. The two were in sync by hand
   * before this; that is not a property hand-maintenance preserves.
   *
   * Only checked once BOTH siblings are migrated — comparing a migrated page to
   * an un-migrated skeleton would report a mismatch that step 1.7 is already
   * about to fix.
   */
  /**
   * EVERY shell in a file, not just the first.
   *
   * A page routinely declares more than one: an early-return guard (an expired
   * link, a closed form) above the real content branch. Reading only the first
   * match compares the skeleton against the guard, which is the wrong branch —
   * it false-FAILS when the two legitimately differ, and worse, it can silently
   * PASS when a guard happens to share the skeleton's props while the content
   * branch has drifted. The second failure mode is the dangerous one, because
   * a green test is indistinguishable from a correct one.
   *
   * So: collect them all, and require the skeleton's layout to match one of
   * them. A skeleton stands in for whichever branch renders, so matching any
   * declared layout is the honest rule.
   */
  const shellLayouts = (source: string): string[] =>
    [...stripComments(source).matchAll(/<(?:PageShell|LoadingShell)\b([^>]*)>/g)].map(
      ([, attrs]) => {
        const width = attrs.match(/width="(\w+)"/)?.[1] ?? "?";
        const density = attrs.match(/density="(\w+)"/)?.[1] ?? "?";
        const align = attrs.match(/align="(\w+)"/)?.[1] ?? "top";
        return `${width}/${density}/${align}`;
      },
    );

  it("declare a width, density and align the page also declares", () => {
    const mismatches: string[] = [];

    for (const loading of appFiles().filter((f) => f.endsWith("loading.tsx"))) {
      const page = loading.replace(/loading\.tsx$/, "page.tsx");
      let pageSource: string;
      try {
        pageSource = readFileSync(page, "utf8");
      } catch {
        continue; // A skeleton with no sibling page has nothing to match.
      }

      const pageLayouts = shellLayouts(pageSource);
      const loadingLayouts = shellLayouts(readFileSync(loading, "utf8"));
      if (pageLayouts.length === 0 || loadingLayouts.length === 0) continue;

      const orphans = loadingLayouts.filter((l) => !pageLayouts.includes(l));
      if (orphans.length > 0) {
        mismatches.push(
          `${key(loading)}: skeleton declares ${orphans.join(", ")}, ` +
            `but its page only declares ${pageLayouts.join(", ")}`,
        );
      }
    }

    expect(mismatches, mismatches.join("\n")).toEqual([]);
  });
});

describe("server actions", () => {
  /**
   * Closes a latent hole in `admin/coverage.test.ts`, which walks only
   * `src/lib/rogue-raise` and so cannot see an action defined under `src/app`.
   * Today that is airtight because no such action exists — but a redesign is
   * exactly the change that tempts an inline one (a nav preference, a density
   * toggle) written next to the component that uses it. It would ship
   * unguarded, with a green suite.
   *
   * Forcing every action into `src/lib/rogue-raise` also serves mergeability:
   * that directory is a declared movable segment and inline app-dir actions
   * are not.
   */
  it("live in src/lib/rogue-raise, never inline under src/app", () => {
    const offenders = appFiles()
      .filter((f) => /^["']use server["']/m.test(readFileSync(f, "utf8")))
      .map(key);

    expect(
      offenders,
      `Server actions belong in src/lib/rogue-raise so admin/coverage.test.ts ` +
        `can prove they authorize themselves:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
