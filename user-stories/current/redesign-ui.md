<!--
metadata:
  created_at:   2026-08-03T17:12:01-07:00
  activated_at: 2026-08-03T17:27:02-07:00
  planned_at:   2026-08-03T17:57:13-07:00
  finished_at:
  updated_at:   2026-08-03T18:39:04-07:00
-->

# Story: Redesign UI

## Summary

AS a visitor or user on the site
I WANT to have a White Rabbit user experience
SO THAT the navigation is clear and beautiful and
  consistent with our White Rabbit branding and look-and-feel

## Acceptance Criteria

- clear, consistent navigation
- beautiful, consistent design

## Notes

Reference site:
https://whiterabbitashland.com/
(nav through the whole site for look-and-feel)

### Brand references in-repo

- `brand/BRAND_VOICE.md` — WR voice guide, pulled onto this branch from
  `origin/main`. Covers **verbal** identity only: tone attributes, signature
  moves, vocabulary to lean toward/avoid, per-channel notes, and a 5-question
  litmus test. Governs headings, microcopy, empty states, and button labels.
  Marked "tentative / derived from site copy" — not a formal WR brand guide.
- `src/app/globals.css` — the **visual** tokens. Its own header warns the hex
  values are *approximations* of the observed WR palette and should be
  confirmed against the live site. They were — see the palette table below.
- `src/app/layout.tsx` — Fraunces (serif display) + JetBrains Mono, body
  `font-sans antialiased`.

**Gap:** there is no visual identity guide — nothing documents spacing, layout,
component styling, imagery, or navigation patterns. `brand/VISUAL_IDENTITY.md`
is authored in Phase 5.

### Scope decisions (settled 2026-08-03)

"The whole site" spans three audiences that should not converge on one
treatment. Decisions:

**1. Scope — all three tiers, phased.** Each phase ships independently and the
work can stop at any boundary with a coherent result.

1. **Public marketing** — `/rogue-raise` hub, `/events/[slug]`,
   `/events/[slug]/register`, `/events/[slug]/registered`, `/sponsor`,
   `/sponsor/thanks`
2. **External magic-link surfaces** — `/sponsor/intake/[eventId]`,
   `/judge/background/[eventId]`, `/judge/score/[eventId]`,
   `/submit/[eventId]`, `/submit/[eventId]/done`, `/portal/[eventId]`,
   `/review/[eventId]`
3. **Admin console** — `/admin/*` (staff tooling, density over polish)

**2. Ambition — structure first, visual second.** Phase 1 is structural:
shared navigation, one layout shell, extracted shared components, a unified
container/spacing scale — keeping today's olive/paper/Fraunces visual
language. A new visual direction is a later phase on top of that foundation.
The subjective "beautiful" half of the acceptance criteria is deliberately
deferred; Phase 1's criteria must be objective and checkable.

**3. Brand source — derive from the live site.** Capture
whiterabbitashland.com's real navigation structure, type scale, spacing
rhythm, and exact colors, then correct `globals.css`'s approximate hexes.
Every color change ships with its measured WCAG contrast ratio — matching the
discipline already documented in `globals.css`.

**4. External surface chrome — branded header, no nav links.** WR wordmark
plus the event name for orientation; nothing clickable that leads elsewhere.
These users hold a token scoped to one event and one role, so any nav link
would offer destinations that refuse them. Per-role scoped links were
explicitly declined. The event name must reach the header without widening any
data query or weakening the token scoping in
`src/lib/rogue-raise/intake/access.ts`.

**5. Palette correction — Phase 0, ahead of the structural work.** This
overrides decision 2's "palette is visual work" sequencing, on new evidence:
it is an accessibility fix, not a visual one. See the measured table below.

**6. Body typeface — Geist stays, documented as a stand-in.** WR's real body
face is **Pangram Sans Rounded** (commercial, self-hosted). We do not
self-host it here; it is recorded as the known visual divergence and belongs
on the merge checklist for WR. This retires the highest-CLS-risk edit in the
story. Fraunces and JetBrains Mono are confirmed correct.

**7. Post-merge navigation — this app owns its own chrome.** WR's global nav
will *not* wrap these routes after the merge. `SiteHeader` is therefore
permanent rather than scaffolding, and Phase 1's navigation work is the
durable centrepiece of the story.

**8. Palette hexes — confirmed by the project owner, 2026-08-03.** `#3d6928`
olive and `#f8f6f1` paper are confirmed as read from whiterabbitashland.com's
compiled CSS. Record them with their source and confirmation date — explicitly
**not** as sourced from a formal WR brand guide, which still does not exist.
WR tech staff need that distinction at merge.

**9. Logo — no SVG exists.** Verified: there is no logo asset anywhere in this
repo; `public/` holds only the five Next.js starter SVGs. `<Wordmark>` ships as
a **Fraunces text lockup** (display weight, olive, with a mono "Rogue Raise"
eyebrow) — resolution-independent, on-brand, no licence. `SiteHeader`,
`ScopedTopBar`, `/admin/sign-in`, and the footer all consume `<Wordmark>` and
none reference an asset path, so a real mark later is a one-file swap.

**10. Dark mode — IN SCOPE.** Full token pairs, a `.dark` class strategy, and
contrast ratios measured on **both** surfaces. Consequences: the 8 stray
`dark:` utilities are triaged per-utility rather than deleted; `@theme` vs
`@theme inline` becomes load-bearing (build-time resolution would silently
ignore a runtime override); `wr-sage` and `wr-amber` become part of a real dark
palette rather than dark-band-only accents. **The reference site gives us no
dark palette to derive from — our dark surface is an original design decision,
not observed WR fact, and needs WR review in a way the light palette no longer
does.**

**11. CI — add it, first step of Phase 0.** Verified: there is no `.github`
directory and no workflow of any kind. A minimal GitHub Actions run of
`lint && typecheck && test` on every PR; no database needed (all 38 test files
are pure-logic). Without it every guardrail test in this plan is decoration.

### The palette is wrong, and it fails WCAG today

Verified by recomputing every ratio (WCAG 2.x relative luminance). The live
site values were read from WR's compiled CSS and confirmed by the project
owner — **not** taken from a formal WR brand guide, which does not exist.

| Pair | Current | Ratio | Corrected | Ratio |
|---|---|---|---|---|
| olive on paper (small text) | `#6f7d3f` on `#fbfaf6` | **4.30:1 ✗ AA** | `#3d6928` on `#f8f6f1` | **5.98:1 ✓** |
| white on olive | on `#6f7d3f` | **4.49:1 ✗ AA** | on `#3d6928` | **6.46:1 ✓** |
| white on deepened primary | on `#697939` | 4.78:1 ✓ | — | token retired |

Consequences:

- The `.eyebrow` label renders olive at `text-xs` across the app — that is a
  live AA failure in the shipped product.
- `--color-primary #697939` exists *only* to compensate for the wrong olive.
  With the hex corrected it retires to `var(--color-wr-olive-green)`.
- `.eyebrow` becomes a defined `@utility` (mono, uppercase, `0.22em`
  tracking — WR measures `0.25em`; `tracking-widest` is only `0.1em`) rather
  than being recoloured. The trailing utilities must be stripped at every call
  site in the same commit or they override the new utility.
- Two rules recorded in done-stories become obsolete artifacts of the wrong
  hex — "never white on base olive" and "olive for headings ≥24px only", in
  `admin-sponsor-curation-queue.md` and `public-sponsor-sign-up.md`. Overturn
  them **explicitly, with new measured ratios**, never silently.
- Also corrected: paper `#fbfaf6` → `#f8f6f1`; what this repo calls `ink`
  (`#1a1a17`) is actually WR's **`deep`** (`#1a1816`) — WR's true `ink` is
  `#0a0a0a`.

### Do not copy the reference site wholesale

- WR's `#8cb76d` CTA with white text measures **2.31:1** — a real AA failure
  on their own site. Do not reproduce it.
- WR's site has no `<main>` and no skip link, exposing only NAV and FOOTER
  landmarks. This codebase is *more* accessible than its reference: match the
  look, keep our landmark model.

## Implementation Plan

### Scope and ambition

Five phases plus a merge step: **palette and token architecture → structure and
navigation → external tier → admin tier → dark mode → visual direction**. Each
is independently shippable with a coherent stop point.

**Phase 1 is structural, not visual.** Shared navigation, one layout shell,
extracted components, a unified container scale — retaining today's visual
language. The subjective "beautiful, consistent design" half of the story is
deferred to Phase 5, judged by a human.

**Phase 0 is an accessibility fix plus enabling architecture.** The vendored
olive is wrong; correcting it resolves two live AA failures. Dark mode's *token
architecture* also lands here, because retrofitting it later means rewriting
`globals.css` twice.

**Dark mode is its own phase, not a fold-in.** It roughly doubles the token
surface and requires every component verified on two surfaces. It is placed
*before* the visual phase so that Phase 5 designs on both surfaces from the
start rather than retrofitting bands and imagery.

**This app owns its own chrome permanently.** WR's global nav will not wrap
these routes; `SiteHeader` is a durable centrepiece.

### A note on counts

Every occurrence count in this plan (32 eyebrow sites, 15 link-buttons, 39
containers, 25 card sites, 69 `text-ink/60`) is **indicative, not a target**.
They did not all reproduce under independent spot-checks — a different grep
predicate measured 31 container files and 12 link-button files. Implementers
must **re-derive each count with their own predicate** before starting a sweep,
and treat the guardrail tests, not these numbers, as the definition of complete.

### Rewritten acceptance criteria

Proposed replacement for "clear, consistent navigation" / "beautiful,
consistent design". Liftable verbatim into the Acceptance Criteria section.

```markdown
### Phase 0 — palette correctness and token architecture

1. `--color-wr-olive-green` is `#3d6928`, labelled with its source and
   confirmation date: confirmed by the project owner 2026-08-03, derived from
   whiterabbitashland.com's compiled CSS — explicitly NOT sourced from a formal
   WR brand guide, which does not exist.
2. `--color-primary` is retired to `var(--color-wr-olive-green)`.
3. Colour tokens are restructured into three layers: raw values in `:root` and
   `.dark` blocks OUTSIDE `@theme`, mapped by `@theme inline`. Non-colour tokens
   (radii, fonts, containers) stay in plain `@theme`.
4. `@custom-variant dark (&:where(.dark, .dark *));` is declared. Tailwind v4's
   default `dark` variant is `prefers-color-scheme`; a class strategy requires
   this and it is now load-bearing, not neutralising.
5. Every token carries a ratio recomputed against corrected paper `#f8f6f1`.
6. The two done-story rules invalidated by the correction are overturned in
   writing, with new ratios, in their source files — not silently.
7. `npm run lint && npm run typecheck && npm run test` runs on every PR.

### Phase 1 — structure

8. Two shell components own every container. No `page.tsx` or `loading.tsx`
   declares `mx-auto`, `min-h-full`, `max-w-*`, or `py-*` on its root element.
9. Width scale is exactly four values: `form` 42rem, `reading` 48rem,
   `wide` 64rem, `auth` 24rem. `max-w-4xl` is deleted, five users redistributed.
10. Vertical rhythm is exactly two values: `comfortable` (public + external) and
    `compact` (admin).
11. `max-w-prose` remains permitted inside content blocks — content scoping, not
    layout. Exempted by rule, not allow-list.
12. Every `loading.tsx` imports the same shell with identical props as its
    `page.tsx` sibling, enforced by test.
13. `.eyebrow` is defined as an `@utility` (mono, uppercase, 0.22em tracking) and
    the trailing utilities are stripped at every call site in the same commit.
14. `Button` gains `touch` (`min-h-11`) and `cta` sizes; every hand-rolled
    link-button becomes `<Button asChild size="touch">`.
15. Every shared idiom has one implementation: `Card`, `Pill`, `EmptyState`,
    `Callout`, `PageHeader`, `DataTable`, `Skeleton`, `Wordmark`.
16. `not-found.tsx` exists per tier. There are zero `not-found.tsx` / `error.tsx`
    files today, so every `notFound()` renders Next's unstyled default.
17. The `npm run build` route table is identical to the pre-refactor run.

### Phases 1–3 — navigation

18. **Public** shares one header + footer. Two nav items only. Active link
    carries `aria-current="page"` plus a non-colour-only cue.
19. **External magic-link** (7 surfaces) gets a **static, non-sticky** bar with a
    wordmark rendered as text/mark (not an anchor) and a role label. No `<nav>`,
    no links. A test asserts no `<a>`/`<Link>` outside the current flow.
20. **Admin** gains primary nav, breadcrumbs, and a status-aware event sub-nav —
    unavailable phases render disabled with a focusable reason, never hidden.
21. `/admin/sign-in` stays outside `(console)`, gets skip link + wordmark only.
22. A skip link is the first focusable element on every rendered page.

### Phase 4 — dark mode

23. Every `--color-*` token in `:root` has a counterpart in `.dark`. Enforced by
    test; no dark token ships without a measured ratio comment.
24. Olive `#3d6928` is NEVER text on a dark surface (2.74:1). The dark-surface
    olive role is filled by `wr-sage`.
25. The theme toggle does not flash on load, and the choice survives SSR.
26. Every component in the Phase 1 inventory is verified on BOTH surfaces.
27. The dark palette is documented as an ORIGINAL DESIGN DECISION, not observed
    WR fact — the reference site has dark bands but no dark mode.

### Phase 5 — visual direction (NOT satisfied by Phases 0–4)

28. Band system, display type, imagery, hero treatment, on both surfaces.
    "Beautiful" is judged here, by a human, against `brand/VISUAL_IDENTITY.md`.
```

### Token architecture

Restructure `globals.css` into three layers. This is the canonical Tailwind v4 +
shadcn pattern and it is what makes a runtime theme work at all:

```
:root        { raw palette values }          ← outside @theme
.dark        { raw palette overrides }       ← outside @theme
@theme inline{ --color-* : var(--raw-*) }    ← maps utilities to raw vars
@theme       { radii, fonts, containers }    ← non-themed, plain @theme
@custom-variant dark (&:where(.dark, .dark *));
```

**Which aliases must move, and why.** Every colour token moves to this
structure. The concrete failure otherwise: with plain `@theme`, Tailwind emits
both a `:root` variable *and* a utility referencing it, creating an indirection
layer that can serve a stale light value under `.dark` in contexts where the raw
variable isn't inherited as expected. `@theme inline` emits
`.bg-background { background-color: var(--background) }` directly, so the `.dark`
override is the only thing that resolves. The specific tokens this bites hardest
are the current self-referencing aliases — `--color-foreground: var(--color-ink)`,
and `--color-border` / `--color-input` / `--color-ring` all aliased to olive.
Radii, font families, and container widths do **not** change per theme and stay
in plain `@theme`.

#### Light palette — confirmed 2026-08-03

Source: observation of whiterabbitashland.com's compiled CSS, confirmed by the
project owner. **Not** from a formal WR brand guide. Ratios against corrected
paper `#f8f6f1`.

| Token | Current | Corrected | Ratio | Verdict |
|---|---|---|---|---|
| `wr-olive-green` | `#6f7d3f` | **`#3d6928`** | **5.98:1** | passes AA small text — was 4.30:1, failing |
| `background` (paper) | `#fbfaf6` | **`#f8f6f1`** | — | — |
| `ink` | `#1a1a17` | keep | **16.15:1** | this is WR's `deep` (`#1a1816`), not their `ink` (`#0a0a0a`) |
| `primary` | `#697939` | **retire** → olive | white on it **6.46:1** | its reason disappears |
| `muted-foreground` | `#6b6b63` | keep | **4.97:1** | passes; drops from 5.14:1 |
| `destructive` | `#b91c1c` | keep | **5.99:1** | passes |
| `secondary` | `#eceadf` | keep | ink **14.45:1** | passes |
| `muted` | `#f0efe6` | keep | ink **15.11:1** | passes |
| `wr-sage` | — | `#8cb76d` | **2.13:1 FAILS** | never text on light |
| `wr-amber` | — | `#d4a04a` | **2.18:1 FAILS** | never text on light |

**Derived constraint:** ink on olive is **2.70:1**, below the 3:1 non-text
minimum — an olive band breaks the global ink focus outline, which must switch
to paper (5.98:1) on that surface. Do not copy WR's own `#8cb76d` CTA: white on
it is 2.31:1, a real AA failure on their live site.

#### Dark palette — ORIGINAL DESIGN, needs WR review

**The reference site has no dark mode.** It has dark *bands* (`#0a0a0a`,
`#1a1816`) with sage and amber accents, which is the seed — but a full dark
surface is our invention. Unlike the light palette, this cannot be confirmed by
observation and **must go to WR for review**.

Anchors computed:

| Role | Value | On `#1a1816` | Note |
|---|---|---|---|
| `background` | `#1a1816` (WR `deep`) | — | observed as a WR band colour |
| `foreground` | `#faf8f3` (WR `cream`) | **16.68:1** | observed |
| olive role | **`#8cb76d`** (`wr-sage`) | **7.68:1** | olive `#3d6928` is 2.74:1 and unusable |
| accent | `#d4a04a` (`wr-amber`) | **7.53:1** | observed |
| `destructive` | `#f87171` *(candidate)* | **6.40:1** | `#b91c1c` is 2.74:1 and unusable |

`muted`, `secondary`, `muted-foreground`, and the border/ring tokens have **no
derived dark counterparts yet**. They must be designed in Phase 4 and each ships
with a measured ratio — deliberately not invented here.

The important structural finding: **sage is not a decorative accent, it is the
dark-mode olive.** That is what makes a coherent dark palette possible from
observed WR values rather than invented ones.

### Container scale and the `max-w-4xl` redistribution

Tokens in plain `@theme` (Tailwind v4 generates `max-w-*` from `--container-*`,
no config file).

| Variant | Width | For |
|---|---|---|
| `form` | 42rem | sponsor, register, submit, judge background, sign-up — matches WR's measured 672px body column |
| `reading` | 48rem | `/events/[slug]`, intake, review, portal, admin detail/asset — matches WR's 768px prose column |
| `wide` | 64rem | admin queues, events list, agents, submissions, results, repo-review |
| `auth` | 24rem | `/admin/sign-in` only |

**`max-w-4xl` is deleted.** Its five users:

1. `src/app/admin/(console)/events/[id]/agents/page.tsx` → `wide`
2. `src/app/admin/(console)/events/[id]/results/page.tsx` → `wide`
3. `src/app/admin/(console)/events/[id]/repo-review/page.tsx` → `wide`
4. `src/app/admin/(console)/events/[id]/submissions/page.tsx` → `wide`
5. `src/app/portal/[eventId]/page.tsx` → **`reading`** — external and prose-led;
   HANDOFF calls it "the deliverable", not a console

Two `loading.tsx` siblings carry `max-w-4xl` and move with their pages:
`events/[id]/agents/loading.tsx`, `events/[id]/repo-review/loading.tsx`.

`align="center"` collapses the copies of `justify-center gap-6 px-6 py-24`,
including the local `Shell` components in `submit`, `judge/score`, `review`,
`portal`, and `sponsor/intake/invalid-link.tsx`.

### Navigation architecture per tier

**Public marketing** — sticky header (`sticky`, not `fixed`: no content jump, no
scroll-margin math), `<nav aria-label="Main">` with a flat list, Server
Component. Two items only: Raises → `/rogue-raise`, Sponsor a raise →
`/sponsor`. That is the entire public surface. Mobile uses a native `<details>`
disclosure — zero client JS, Escape for free, correct tab-order removal when
closed (a CSS-only `max-h-0` collapse leaves links focusable while invisible).
Footer: wordmark, "Follow the white rabbit." linking to whiterabbitashland.com,
socials, Code of Conduct + Privacy.

**External magic-link — static, not sticky.** Deliberate: the intake form
already has a sticky save bar with a hand-tuned `scroll-mt-28`, and a second
sticky bar stacks with it on mobile. Static avoids the collision rather than
re-tuning. Contents: wordmark as text/mark (**not** an anchor) plus a role
label. No `<nav>`, no footer link menu, no breadcrumb. The wordmark is unlinked
even though `/rogue-raise` is reachable — these users arrived from a one-way
email link, so navigating them off-task strands them. The escape hatch is one
line: "Questions about this form? Reply to the email that brought you here."

**How the event name reaches the bar without widening any query.** Verified in
source: `redeemMagicToken` (`src/lib/rogue-raise/access/redeem.ts`) already
returns `event: { id, title, slug, status, orgId, organizationName }`, and
`IntakeAccess` (`src/lib/rogue-raise/intake/access.ts`) carries both. The name
is already in hand on all 7 routes *after authorization passes*. Therefore:

> `<ScopedTopBar>` accepts `event: RedeemedToken["event"]` as a prop. It never
> accepts an `eventId` and never queries. Typing it to the redemption result
> makes "you must have redeemed a token to hold one of these" a compile-time
> property.

A bar taking an `eventId` and fetching for itself would be exactly the
cross-event read the token scoping prevents. The event name also stays in the
existing page `eyebrow` + `h1`; do not duplicate it into the bar.

**Admin console** — extend `(console)/layout.tsx`, don't replace it. Primary
nav; breadcrumbs replacing six ad-hoc back-link rows using four different markup
shapes; and an event sub-nav promoting the flat five-link row at
`events/[id]/page.tsx` to a tab strip rendered on the event *and its children*.
Unavailable phases render `aria-disabled` with a focusable `sr-only` reason.

### Where the shared chrome lives

**1. Wrap all non-admin feature routes in `src/app/(rogue-raise)/`.** Move
`rogue-raise/`, `events/`, `sponsor/`, `judge/`, `portal/`, `submit/`, `review/`
in wholesale. Route groups are URL-invisible; `@/`-aliased imports unaffected;
whole-directory moves preserve relative imports. `(console)` already proves the
pattern. This converts six scattered segments into **one** movable directory.
CLAUDE.md's `app/rogue-raise/*` phrasing was aspirational — the PRD hedges it
with "e.g." and separately sanctions `/events/[slug]`, `/sponsor`, `/judge` as
*URLs*. Only the directory layout violated the contract.

**Hazard:** two sibling route groups must never claim the same URL. `/sponsor`
is the only tier-split segment. Split *inside* it — `sponsor/(apply)/` and
`sponsor/(intake)/` — mirroring `admin/(console)`. Do **not** create
`(public)/sponsor/` and `(external)/sponsor/`.

**2. The root layout keeps almost nothing** — `<html>`/`<body>`, three
`next/font` declarations, `import "./globals.css"`, base metadata, plus
`<body className="flex min-h-dvh flex-col">`. Dark mode adds one exception,
noted in Phase 4.

**3. Skip link in the tier layouts**, plus a thin new `src/app/admin/layout.tsx`
covering `/admin/sign-in`, which sits outside `(console)`.

**4. Shared UI in `src/components/rogue-raise/`** — a fourth movable segment.
Not `src/components/ui/` (shadcn-owned, collides with WR's at merge). Not
`src/lib/rogue-raise/ui/` (server logic, walked by `coverage.test.ts`).

### Phases and steps

#### Phase 0 — CI, palette, token architecture *(frontend dev)*

*Goal:* correct, AA-clean, theme-ready tokens. *Safe stop:* more on-brand and
more accessible than today, zero layout change.

| # | Step | Files | Verify |
|---|---|---|---|
| 0.1 | Add CI running `lint`, `typecheck`, `test` on every PR. **No `.github` directory exists.** No database needed — all 38 test files are pure-logic, ~3.2s | `.github/workflows/ci.yml` | open a throwaway PR violating a guardrail; confirm red |
| 0.2 | Restructure into `:root` / `.dark` / `@theme inline` / `@theme`; add `@custom-variant dark` | `src/app/globals.css` | `npm run build`; confirm utilities still resolve |
| 0.3 | Correct olive → `#3d6928`, paper → `#f8f6f1`; retire `--color-primary`; add `wr-sage`, `wr-amber` | `src/app/globals.css` | browser diff `/rogue-raise` |
| 0.4 | Rewrite the contrast block with ratios recomputed against corrected paper; record source + confirmation date | `src/app/globals.css` | review against the table above |
| 0.5 | Overturn the two obsolete done-story rules in writing, with new ratios | `user-stories/done/admin-sponsor-curation-queue.md`, `user-stories/done/public-sponsor-sign-up.md` | see Risks |
| 0.6 | Token guardrail test: ratios, `:focus-visible` unlayered, no raw hex outside `globals.css` | `src/components/rogue-raise/tokens.test.ts` | `npm run test` |

*0.1 first — every later guardrail is decoration without it.*

#### Phase 1 — Structure and navigation *(frontend dev + a11y reviewer)*

*Goal:* one shell, one scale, one component per idiom, permanent chrome.
*Safe stop:* "consistent" is met and navigation exists.

| # | Step | Files | Verify |
|---|---|---|---|
| 1.1 | Container tokens, `.eyebrow` `@utility`, type scale | `src/app/globals.css` | `npm run build` |
| 1.2 | `PageShell` (`width` × `density` × `align`, emitting `<main id="main" tabIndex={-1}>`), `PageHeader`, `Wordmark` (Fraunces text lockup — **no logo asset exists**; this is the single swap point for a future SVG, and no consumer references an asset path) | `src/components/rogue-raise/*` | `npm run test` |
| 1.3 | `Card`, `Pill`, `EmptyState`, `Callout`, `Skeleton`, `DataTable`, `FilterChipNav` | `src/components/rogue-raise/*` | `npm run test` |
| 1.4 | `Button` `touch`/`cta` sizes | `src/components/ui/button.tsx` | typecheck |
| 1.5 | Guardrail tests: containers, shell-prop parity, no `"use server"` under `src/app` | `src/components/rogue-raise/design-system.test.ts` | must fail before 1.7, pass after |
| 1.6 | `git mv` seven segments into `(rogue-raise)/`; split `sponsor/` | route dirs | diff `npm run build` route tables — identical |
| 1.7 | Migrate containers; strip trailing eyebrow utilities; retire hand-rolled link-buttons. **Re-derive counts first** | all `page.tsx` + 7 `loading.tsx` | guardrail tests green |
| 1.8 | Tier layouts + skip link; `SiteHeader`, `SiteFooter`, `mobile-nav` | `(rogue-raise)/layout.tsx`, per-segment layouts, new `src/app/admin/layout.tsx` | keyboard pass |
| 1.9 | `not-found.tsx` per tier | `(rogue-raise)/not-found.tsx`, `admin/not-found.tsx` | visit a bad slug |

*1.5 must be written and failing before 1.7, or the migration's completeness is
unverifiable.*

#### Phase 2 — External magic-link tier *(frontend dev)*

*Goal:* 7 token-scoped surfaces get consistent branded chrome. *Safe stop:*
sponsors, judges, stakeholders see a coherent product. `ScopedTopBar` (static)
wired via per-segment layouts, each passing the already-authorized `event` prop.
Generalize the existing `border-t border-wr-olive-green/20 pt-6` footers at
`portal/[eventId]/page.tsx` and `review/[eventId]/page.tsx`. **Every file here
with a `<form>` is a form-reset-desync site** — see Risks.

#### Phase 3 — Admin console *(frontend dev)*

*Goal:* wayfinding for 11 deep-nested pages. *Safe stop:* staff navigation
fixed — the phase that moves the primary metric. `ConsoleHeader` extracted,
**leaving `checkAdmin()`, `redirect()`, and `dynamic = "force-dynamic"` in the
layout file.** Add `Breadcrumbs`, `EventSubNav`, `DataTable` absorbing the table
+ `md:hidden` card-list duplication. Verify: signed-out `GET /admin/events`
still 307s; `guard.test.ts` and `coverage.test.ts` green.

#### Phase 4 — Dark mode *(design + frontend dev + a11y reviewer)*

*Goal:* a real dark surface. *Safe stop:* both themes ship complete. Placed here
deliberately — after component consolidation, so there is one `Card` and one
`Pill` to theme rather than a hundred hand-rolled sites, and before the visual
phase so Phase 5 designs on both surfaces.

| # | Step | Files | Verify |
|---|---|---|---|
| 4.1 | Design the remaining dark tokens (`muted`, `secondary`, `muted-foreground`, borders/rings); every value ships with a measured ratio | `src/app/globals.css` | ratio review |
| 4.2 | Audit the 8 `dark:` utilities **per-utility** — keep, fix, or drop each against our palette. These are shadcn's own dark handling, not noise | `button.tsx`, `input.tsx`, `textarea.tsx`, `radio-group.tsx` | both surfaces in browser |
| 4.3 | Theme toggle + SSR persistence without flash | `src/components/rogue-raise/theme-toggle.tsx`, root layout | no FOUC on hard reload |
| 4.4 | Replace guardrail #3: assert every `:root` colour token has a `.dark` counterpart, and no dark token lacks a measured ratio | `tokens.test.ts` | `npm run test` |
| 4.5 | Re-verify every Phase 1 component on both surfaces, including focus indicators | — | browser pass |

*Note:* 4.3 is the one place dark mode touches the root layout — an SSR theme
read is needed to avoid a flash. Keep it to a cookie read plus a `className` on
`<html>`; document it as a root-layout seam in HANDOFF.

#### Phase 5 — Visual direction *(design + frontend dev)*

Author `brand/VISUAL_IDENTITY.md`; band system, display type, hero, imagery,
Fraunces `WONK` on public `h1` only. **On both surfaces.** "Beautiful" is judged
here, by a human.

#### Phase 6 — Merge contract *(frontend dev)*

Update `HANDOFF.md`: the portability-seams bullet (currently claims
`src/app/rogue-raise/*` holds "public hub + event surfaces" — it does not), the
merge-checklist Lift line, a root-layout-seam bullet covering fonts and the
theme cookie, `src/components/rogue-raise/*` as a fourth movable segment, a note
that `src/components/ui/field.tsx` is hand-written and must not be replaced by
WR's shadcn `Field`, **Geist recorded as a documented stand-in for WR's Pangram
Sans Rounded**, and **the dark palette flagged as original design needing WR
sign-off**.

### Testing strategy

**No jsdom, no Testing Library, no axe.** The deliverables are Server Components
and class strings; RTL assertions against class names are tautological; it adds
devDeps and a second vitest environment to the merge surface; and axe would
catch approximately none of the ranked risks — they are contrast values,
cascade-order, and focus behaviours a static scan misses. The repo's retros
record that the browser found what unit tests could not.

Source-grep tests in the idiom of `src/lib/rogue-raise/admin/coverage.test.ts`,
whose genuinely good part is the **stale-entry check** forcing the allow-list to
shrink:

1. No `page.tsx`/`loading.tsx` declares its own container; anything rendering
   `<main` imports the shell.
2. No raw hex outside `globals.css` (strip comments first, or
   `status-pill.tsx`'s documented ratios fail spuriously).
3. **Every `:root` colour token has a `.dark` counterpart; no dark token ships
   without a measured ratio.** *(replaces the now-wrong "no `dark:` utilities"
   rule)*
4. Shell props match between each page and its `loading.tsx`.
5. Token ratios on **both** surfaces; `:focus-visible` unlayered.
6. No `"use server"` under `src/app`, closing the latent `coverage.test.ts` hole.

**Browser verification** (Playwright MCP, recorded in the story's Review
section) at 320/375/1280 and 400% zoom, **on both themes** from Phase 4 on: skip
link is first tab stop and focus lands on `<main>` (assert
`document.activeElement.id`); focus ring visible on nav links; `<details>`
closes on Escape; centred pages show no scrollbar with chrome present; one form
per tier submitted with an error.

### Risks and regressions

**1. Overturning the obsolete done-story rules — explicitly.** Two recorded
rules were artifacts of the wrong hex:

- `admin-sponsor-curation-queue.md` — *"never white on base olive"*. White on
  `#3d6928` is **6.46:1**. Append a dated note: the rule was correct against
  `#6f7d3f` (4.49:1) and is superseded; state the new ratio.
- `public-sponsor-sign-up.md` — *"Olive fails AA for small text (~4.26:1) —
  headings ≥24px only"*. Olive on corrected paper is **5.98:1**. Same treatment.

The invariant that survives: **every pill is always text-labelled, never
colour-only.**

**2. `:focus-visible` is unlayered, and that is the only reason focus works.**
`globals.css` has no `@layer`; Tailwind v4 declares
`@layer theme, base, components, utilities`, and unlayered CSS beats every
layered rule. `button.tsx` ships `outline-none` and its replacement ring is well
under 3:1. A "tidy globals.css into `@layer base`" refactor kills focus app-wide
with no test failure and no screenshot diff. Guardrail 5 exists for this. **The
Phase 0 restructure is exactly when this is most likely to happen** — the
`:root`/`.dark` blocks go *around* the existing rules, never inside a layer.

**3. Olive is unusable as dark-surface text (2.74:1) and breaks the ink focus
outline on an olive band (2.70:1).** Sage fills the dark olive role; paper fills
the focus role on olive.

**4. The 8 `dark:` utilities need per-utility judgement, not deletion.** They
are shadcn's own dark handling. Until Phase 4 they fire on OS-dark devices via
Tailwind's default `prefers-color-scheme` variant — declaring
`@custom-variant dark` in Phase 0 switches them to the class strategy, which
*stops* the stray firing without deleting anything.

**5. `min-h-full` + a header = a scrollbar on the centred pages.** Fixed once at
the shell.

**6. Form-reset desync — highest-value risk in Phase 2.** **Exactly three**
client forms depend on `key={version}` plus a `useActionFocus` ref region that
must live **outside** the keyed subtree:
`(rogue-raise)/submit/[eventId]/submission-form.tsx`,
`(rogue-raise)/judge/score/[eventId]/scorecard.tsx`, and
`(rogue-raise)/review/[eventId]/review-form.tsx`. Wrapping a form in `<Card>` is
safe; inserting a wrapper *between* the region and the form breaks
focus-after-error. `Callout`'s API must make outside-the-form placement the
default.

*Corrected 2026-08-03.* This risk was first written as "eight client forms",
derived from a grep for `key={` that mostly matched ordinary React list keys.
The real marker is `useActionFocus`, and only three files import it. Two things
follow, and the second is the useful one: the public tier was never exposed to
this at all, and **all three genuinely-keyed forms sit in the external
magic-link tier** — so the risk is concentrated in one batch rather than spread
across the sweep. `(rogue-raise)/events/[slug]/register/registration-form.tsx`
was specifically named as at-risk and is not: it has no `key`, uses uncontrolled
`defaultValue` inputs, and keeps its `role="alert"` region *inside* the form.
That is harmless today because nothing remounts it, but it means that form does
not follow the `CalloutRegion` contract and should not be cited as an example of
one that does.

**7. Do not weaken the admin gate.** `(console)/layout.tsx` is simultaneously
chrome, the server-side gate, and the `dynamic` declaration. Route-segment
config is read only from layout/page files and does not travel with an extracted
component.

**8. Card consolidation eating table semantics** — `<caption class="sr-only">`,
`scope="row"`, `aria-sort`, and the one-`<a>`-per-row stretched link.

**9. `shadcn add` injecting its own `.dark` block is now a merge hazard**, not
inert noise — it would collide with a dark palette we actively maintain. Run on
a clean tree, `git diff`, revert any CSS hunk. Given the `<details>` and
build-local decisions, no `shadcn add` is required.

**10. Risk retired.** Swapping the body typeface was the highest-CLS-risk edit;
Geist stays as a documented stand-in.

### Open questions

All arise from dark mode entering scope. **Unresolved — these need the project
owner.**

1. **Who reviews the dark palette with WR, and when?** Unlike the light palette,
   it cannot be confirmed by observation — the reference site has dark bands but
   no dark mode. It is our original design and needs sign-off in a way the light
   palette no longer does.
2. **Toggle behaviour:** follow system preference, manual toggle, or both? Where
   is the choice persisted, and does it apply per-device or per-account?
3. **Does dark mode apply to all three tiers, or only public?** Admin is
   density-first staff tooling seen by ~3 people; the external tier is visited
   once per user from an email. Full coverage roughly triples the Phase 4
   verification surface.
4. **Is a root-layout theme read acceptable?** Avoiding a flash needs an SSR
   cookie read plus a `className` on `<html>` — the one place dark mode touches
   the least-portable file in the repo, against the rule that the root layout
   stays minimal for merge.

### Verification note

All 13 contrast ratios in this plan — light and dark — were independently
recomputed against the WCAG 2.x relative-luminance formula and match exactly.
The light-palette hexes are confirmed by the project owner as read from WR's
compiled CSS; the dark-palette values are original design and are not confirmed
by anyone yet.
