/**
 * Design-token guardrails (redesign-ui story, Phase 0 step 0.6).
 *
 * `globals.css` documents a measured WCAG contrast ratio for every colour it
 * defines. That discipline is a genuine project asset, but a comment is only a
 * promise — this file makes it executable, in the same spirit as
 * `src/lib/rogue-raise/admin/coverage.test.ts`: read the source, assert the
 * convention, fail the build when it drifts.
 *
 * Three things are enforced:
 *   1. Every role pairing that renders text clears its WCAG 2.2 AA threshold.
 *   2. The ratios still equal what the story recorded. This is the regression
 *      guard — it catches a hex being "tidied" without anyone recomputing.
 *   3. `:focus-visible` stays UNLAYERED. See the long comment on that test.
 *   4. No raw hex escapes `globals.css` into a component.
 *
 * Deliberately NOT enforced yet: that every `:root` token has a `.dark`
 * counterpart. The dark palette is intentionally incomplete until Phase 4
 * (step 4.4 replaces this note with that assertion).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Every source file under `dir`, skipping tests. Mirrors `coverage.test.ts`. */
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(full) && !/\.test\.tsx?$/.test(full) ? [full] : [];
  });
}

const ROOT = process.cwd();
const GLOBALS = join(ROOT, "src/app/globals.css");

const css = readFileSync(GLOBALS, "utf8");

/* ------------------------------------------------------------------ parsing */

/** Strip `/* … *\/` blocks so documented hexes are never mistaken for code. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Pull one top-level `selector { … }` block out of the stylesheet. */
function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`No \`${selector}\` block in globals.css`);
  const end = css.indexOf("\n}", start);
  return css.slice(start, end);
}

/** `--name: value;` pairs from a block, comments removed. */
function declarations(selector: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of stripComments(block(selector)).split("\n")) {
    const match = line.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);/);
    if (match) out.set(match[1], match[2].trim());
  }
  return out;
}

const rootVars = declarations(":root");
const darkVars = declarations(".dark");

/**
 * Resolve a token to a literal hex, following `var(--x)` aliases.
 *
 * `scope` is consulted first so `.dark` overrides win, falling back to `:root`
 * for anything dark does not redefine — which mirrors how the cascade actually
 * resolves these on an element inside `.dark`.
 */
function resolve(name: string, scope: Map<string, string> = rootVars): string {
  const seen = new Set<string>();
  let value = scope.get(name) ?? rootVars.get(name);

  while (value?.startsWith("var(")) {
    const next = value.slice(4, -1).trim();
    if (seen.has(next)) throw new Error(`Circular token alias at ${next}`);
    seen.add(next);
    value = scope.get(next) ?? rootVars.get(next);
  }

  if (!value || !/^#[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`Token ${name} did not resolve to a 6-digit hex (got ${value})`);
  }
  return value.toLowerCase();
}

/* ----------------------------------------------------------------- contrast */

/** WCAG 2.x relative luminance. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, rounded to the 2dp the story records. */
function ratio(fg: string, bg: string): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

const AA_TEXT = 4.5; // small text
const AA_NON_TEXT = 3; // UI boundaries, focus indicators, graphical objects

/* -------------------------------------------------------------------- specs */

/** Every pairing that renders TEXT, with the ratio the story recorded. */
const TEXT_PAIRS: Array<{ label: string; fg: string; bg: string; expected: number }> = [
  { label: "ink on paper", fg: "--ink", bg: "--background", expected: 16.15 },
  { label: "olive on paper", fg: "--wr-olive-green", bg: "--background", expected: 5.98 },
  { label: "muted-foreground on paper", fg: "--muted-foreground", bg: "--background", expected: 4.97 },
  { label: "destructive on paper", fg: "--destructive", bg: "--background", expected: 5.99 },
  { label: "white on primary (approved pill)", fg: "--primary-foreground", bg: "--primary", expected: 6.46 },
  { label: "white on destructive (rejected pill)", fg: "--destructive-foreground", bg: "--destructive", expected: 6.47 },
  { label: "ink on secondary (submitted pill)", fg: "--secondary-foreground", bg: "--secondary", expected: 14.45 },
  { label: "muted-foreground on muted (under-review pill)", fg: "--muted-foreground", bg: "--muted", expected: 4.65 },
];

/**
 * Pairings that legitimately FAIL, locked in so nobody reaches for them as
 * text. If one of these starts passing, a brand token changed — that may be
 * correct, but it needs a deliberate update here, in globals.css, and in the
 * story's palette table rather than passing silently.
 */
const DOCUMENTED_FAILURES: Array<{ label: string; fg: string; bg: string; expected: number; why: string }> = [
  {
    label: "sage on paper",
    fg: "--wr-sage",
    bg: "--background",
    expected: 2.13,
    why: "wr-sage is a DARK-surface accent. It is the dark-mode olive, never light-surface text.",
  },
  {
    label: "amber on paper",
    fg: "--wr-amber",
    bg: "--background",
    expected: 2.18,
    why: "wr-amber is a DARK-surface accent only.",
  },
  {
    label: "ink on olive",
    fg: "--ink",
    bg: "--wr-olive-green",
    expected: 2.7,
    why:
      "An olive band BREAKS the global ink focus outline (needs 3:1). Any olive " +
      "surface must switch its focus indicator to paper, which measures 5.98:1.",
  },
];

/** The four verified dark anchors. Completeness is Phase 4, not this test. */
const DARK_PAIRS: Array<{ label: string; fg: string; bg: string; expected: number }> = [
  { label: "dark foreground on dark paper", fg: "--ink", bg: "--background", expected: 16.68 },
  { label: "dark olive role (sage) on dark paper", fg: "--wr-olive-green", bg: "--background", expected: 7.68 },
  { label: "dark destructive on dark paper", fg: "--destructive", bg: "--background", expected: 6.4 },
];

/* -------------------------------------------------------------------- tests */

describe("light palette", () => {
  it.each(TEXT_PAIRS)("$label clears AA for small text", ({ fg, bg }) => {
    expect(ratio(resolve(fg), resolve(bg))).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each(TEXT_PAIRS)("$label still measures the recorded ratio", ({ fg, bg, expected }) => {
    // Tolerance absorbs 2dp rounding only — a real hex change moves this far more.
    expect(ratio(resolve(fg), resolve(bg))).toBeCloseTo(expected, 1);
  });

  it.each(DOCUMENTED_FAILURES)("$label stays below AA on purpose — $why", ({ fg, bg, expected }) => {
    const measured = ratio(resolve(fg), resolve(bg));
    expect(measured).toBeCloseTo(expected, 1);
    expect(measured).toBeLessThan(AA_TEXT);
  });

  it("ink on olive is below the non-text minimum, which is why olive bands need a paper focus ring", () => {
    expect(ratio(resolve("--ink"), resolve("--wr-olive-green"))).toBeLessThan(AA_NON_TEXT);
    expect(ratio(resolve("--background"), resolve("--wr-olive-green"))).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  it("has retired the separately deepened primary onto the brand olive", () => {
    expect(resolve("--primary")).toBe(resolve("--wr-olive-green"));
  });
});

describe("dark palette (anchors only — completeness lands in Phase 4)", () => {
  it.each(DARK_PAIRS)("$label clears AA for small text", ({ fg, bg }) => {
    expect(ratio(resolve(fg, darkVars), resolve(bg, darkVars))).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each(DARK_PAIRS)("$label still measures the recorded ratio", ({ fg, bg, expected }) => {
    expect(ratio(resolve(fg, darkVars), resolve(bg, darkVars))).toBeCloseTo(expected, 1);
  });

  it("routes the dark olive role to sage, because brand olive is unusable on dark", () => {
    expect(resolve("--wr-olive-green", darkVars)).toBe(resolve("--wr-sage"));
    // The reason, asserted rather than trusted:
    expect(ratio(resolve("--wr-olive-green"), resolve("--background", darkVars))).toBeLessThan(AA_NON_TEXT);
  });
});

describe("stylesheet structure", () => {
  /**
   * `:focus-visible` MUST stay outside `@layer`.
   *
   * Tailwind v4 declares `@layer theme, base, components, utilities`, and in the
   * cascade UNLAYERED rules beat every layered one. `src/components/ui/button.tsx`
   * ships `outline-none` in its base class string, and the ring meant to replace
   * it is `ring-ring/50` — far under the 3:1 focus minimum. So this single
   * unlayered rule is what actually carries keyboard focus on every button in
   * the product.
   *
   * Wrapping globals.css in `@layer base` is the most natural "tidy-up" during a
   * design-system pass, and it would silently kill focus visibility app-wide —
   * with no test failure, and no visible diff in a screenshot, because
   * screenshots do not capture `:focus-visible`. Hence this test.
   */
  it("keeps :focus-visible unlayered so it outranks button.tsx's outline-none", () => {
    const code = stripComments(css);
    expect(code).toMatch(/:focus-visible\s*\{/);
    expect(code).not.toMatch(/@layer\s+[\w\s,]*\{/);
  });

  it("keeps the reduced-motion and honeypot rules present", () => {
    const code = stripComments(css);
    expect(code).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    // Never `display:none` — bots must still see and fill it.
    expect(code).toMatch(/\.rr-honeypot\s*\{/);
    expect(code).not.toMatch(/\.rr-honeypot\s*\{[^}]*display:\s*none/);
  });

  it("is the only place a raw hex colour is allowed to live", () => {
    // Comments are stripped first: documenting a measured ratio next to the hex
    // it describes is exactly the discipline we want to keep (see
    // `sponsors/status-pill.tsx`), so only executable hexes are a violation.
    const offenders: string[] = [];

    for (const file of walk(join(ROOT, "src"))) {
      if (!/\.(ts|tsx)$/.test(file)) continue;
      const found = stripComments(readFileSync(file, "utf8")).match(/#[0-9a-fA-F]{6}\b/g);
      if (found) offenders.push(`${file.slice(ROOT.length + 1)} → ${found.join(", ")}`);
    }

    expect(
      offenders,
      `Raw hex colours belong in src/app/globals.css, where they are defined once ` +
        `with a measured contrast ratio. Use a token utility instead:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("declares the dark variant as a class strategy, not prefers-color-scheme", () => {
    // Tailwind v4's default `dark` variant is a media query. Without this line
    // the `dark:` utilities in the shadcn primitives fire on any OS-dark device,
    // over a hard-coded light background.
    expect(stripComments(css)).toMatch(/@custom-variant\s+dark\s+\(&:where\(\.dark, \.dark \*\)\)/);
  });
});
