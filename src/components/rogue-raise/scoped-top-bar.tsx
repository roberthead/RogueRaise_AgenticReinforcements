import { Wordmark } from "./wordmark";

/**
 * ScopedTopBar / ScopedFooter — chrome for the five MAGIC-LINK surfaces:
 * sponsor intake, judge background, judge scoring, submission, stakeholder
 * portal and stakeholder asset review.
 *
 * THE DEFINING CONSTRAINT: THERE IS NOWHERE FOR THESE USERS TO GO
 * ---------------------------------------------------------------
 * Everyone who sees this bar arrived from a one-way email link carrying a token
 * scoped to ONE event and ONE role. They have no account and no session. Every
 * plausible destination — the hub, the sponsor form, another phase of their own
 * event — either refuses them or drops the token that is the only thing letting
 * them read this page, and the URL they would come back to does not contain it.
 * So a nav here would be a row of links that strand the person who clicks one.
 *
 * That is why this bar has NO `<nav>`, no links, no sign-in prompt, and nothing
 * clickable at all, and why the wordmark is rendered UNLINKED (the default —
 * see the long note in `wordmark.tsx`). The genuine way back is their inbox,
 * which `ScopedFooter` says in one line. Adding a "Home" link here would look
 * like an improvement and would be a dead end.
 *
 * STATIC, NEVER STICKY — THIS IS NOT A STYLE PREFERENCE
 * ----------------------------------------------------
 * `sponsor/(intake)/intake/[eventId]/intake-form.tsx` already carries a sticky
 * save bar, and its `scroll-mt-28` offsets are tuned to that bar's height. A
 * second sticky bar stacks with it — on a phone the two together eat most of
 * the viewport, and every anchored scroll target lands underneath them. Making
 * this bar sticky is therefore a silent regression in a file this component
 * never touches. Keep it in the flow.
 *
 * WHY THE ROLE IS A CONSTANT AND THE EVENT NAME IS ABSENT
 * ------------------------------------------------------
 * The role is passed by the SEGMENT LAYOUT, because a layout cannot receive
 * props from the page beneath it and each of these segments is exactly one
 * role. The event name is deliberately NOT here: this component must never take
 * an `eventId` or run a query. A bar that fetched its own event would be a
 * cross-event read living outside the token check that every page in these
 * segments performs — the precise thing magic-link scoping exists to prevent.
 * The event name is already rendered in each page's `PageHeader` eyebrow, where
 * it sits behind that check.
 *
 * LANDMARKS: this `<header>` is the page's one `banner` and `ScopedFooter` its
 * one `contentinfo`. `PageHeader`'s `<header>` and the stakeholder portal's own
 * `<footer>` are both INSIDE `<main>`, where neither maps to a landmark role,
 * so there is no collision. No `<h1>` here — the page owns that.
 *
 * NO OLIVE FILL: ink on olive is 2.70:1 (globals.css), which would erase the
 * global ink focus outline for the skip link parked over this bar.
 */

/** One per segment. Not a free string — these are the only roles that exist. */
export type ScopedRole = "Sponsor" | "Judge" | "Participant" | "Stakeholder";

export function ScopedTopBar({ role }: { role: ScopedRole }) {
  return (
    <header className="border-b border-wr-olive-green/20 bg-muted/40">
      <div className="mx-auto flex w-full max-w-reading flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Wordmark size="sm" />
        <p className="rounded-full border border-wr-olive-green/40 px-3 py-0.5 font-mono text-xs uppercase tracking-wide text-ink/80">
          {/* Spoken as "Your access: Judge". The visible pill alone is a bare
              noun, which is clear beside the mark and cryptic read aloud. */}
          <span className="sr-only">Your access: </span>
          {role}
        </p>
      </div>
    </header>
  );
}

/**
 * The support path, stated once. Non-navigational on purpose — see above.
 * Plain text rather than a `mailto:`, because we do not know which address
 * invited this particular person and guessing one would send them somewhere
 * nobody is reading.
 */
export function ScopedFooter() {
  return (
    <footer className="border-t border-wr-olive-green/20">
      <div className="mx-auto w-full max-w-reading px-6 py-8">
        <p className="max-w-prose text-sm text-ink/70">
          Stuck, or something looks wrong? Reply to the email that brought you
          here — it reaches a person at White Rabbit.
        </p>
      </div>
    </footer>
  );
}
