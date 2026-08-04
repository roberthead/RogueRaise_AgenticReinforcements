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
  // Public marketing tier
  "(rogue-raise)/rogue-raise/page.tsx": "pending 1.7",
  "(rogue-raise)/events/[slug]/page.tsx": "pending 1.7",
  "(rogue-raise)/events/[slug]/register/page.tsx": "pending 1.7",
  "(rogue-raise)/events/[slug]/registered/page.tsx": "pending 1.7",
  "(rogue-raise)/sponsor/(apply)/page.tsx": "pending 1.7",
  "(rogue-raise)/sponsor/(apply)/thanks/page.tsx": "pending 1.7",

  // External magic-link tier
  "(rogue-raise)/sponsor/(intake)/intake/[eventId]/page.tsx": "pending 1.7",
  "(rogue-raise)/sponsor/(intake)/intake/[eventId]/loading.tsx": "pending 1.7",
  "(rogue-raise)/sponsor/(intake)/intake/[eventId]/invalid-link.tsx":
    "pending 1.7 — a non-page file that renders a full-page shell of its own",
  "(rogue-raise)/judge/background/[eventId]/page.tsx": "pending 1.7",
  "(rogue-raise)/judge/score/[eventId]/page.tsx": "pending 1.7",
  "(rogue-raise)/submit/[eventId]/page.tsx": "pending 1.7",
  "(rogue-raise)/submit/[eventId]/done/page.tsx": "pending 1.7",
  "(rogue-raise)/portal/[eventId]/page.tsx": "pending 1.7",
  "(rogue-raise)/review/[eventId]/page.tsx": "pending 1.7",

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

/** Does this file render a literal `<main>` element? */
function rendersOwnMain(file: string): boolean {
  return /<main[\s>]/.test(readFileSync(file, "utf8"));
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
  const shellProps = (source: string) => ({
    width: source.match(/width=["{]"?(\w+)"?/)?.[1],
    density: source.match(/density=["{]"?(\w+)"?/)?.[1],
    align: source.match(/align=["{]"?(\w+)"?/)?.[1] ?? "top",
  });

  it("declare the same width, density and align as the page they stand in for", () => {
    const mismatches: string[] = [];

    for (const loading of appFiles().filter((f) => f.endsWith("loading.tsx"))) {
      const page = loading.replace(/loading\.tsx$/, "page.tsx");
      let pageSource: string;
      try {
        pageSource = readFileSync(page, "utf8");
      } catch {
        continue; // A skeleton with no sibling page has nothing to match.
      }

      const loadingSource = readFileSync(loading, "utf8");
      const bothMigrated =
        /LoadingShell|PageShell/.test(loadingSource) && /PageShell/.test(pageSource);
      if (!bothMigrated) continue;

      const a = shellProps(pageSource);
      const b = shellProps(loadingSource);
      if (a.width !== b.width || a.density !== b.density || a.align !== b.align) {
        mismatches.push(
          `${key(loading)}: page(${a.width}/${a.density}/${a.align}) ` +
            `vs loading(${b.width}/${b.density}/${b.align})`,
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
