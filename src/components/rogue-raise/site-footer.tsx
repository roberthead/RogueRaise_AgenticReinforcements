import { Wordmark } from "./wordmark";

/**
 * SiteFooter — the `contentinfo` landmark for the PUBLIC tier only.
 *
 * WHAT IS DELIBERATELY ABSENT
 * ---------------------------
 * Social icons, a newsletter box, a sitemap column, a copyright line naming a
 * legal entity we have not checked. Every one of those is a footer convention
 * rather than a thing this product can actually do, and a footer that implies
 * functionality we do not have is a promise the user discovers is false. The
 * brand guide's Truth commitment is the standard here: only what is true and
 * grounded. So: the mark, and the one real destination — White Rabbit itself.
 *
 * "Follow the white rabbit." is WR's own line (BRAND_VOICE.md §4), which makes
 * it both the invitation and the link text. Its accessible name is its visible
 * text, so a speech-input user saying what they see activates it (WCAG 2.5.3).
 *
 * ONE ROW. It sits under content of wildly different lengths — a two-line
 * "thanks" page and a long event page — and anything taller reads as a second
 * page rather than a close.
 *
 * The wordmark here is UNLINKED. The header's is the one link home; a second
 * one to the same place is just an extra tab stop.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-wr-olive-green/20">
      <div className="mx-auto flex w-full max-w-reading flex-wrap items-center justify-between gap-4 px-6 py-8">
        <Wordmark size="sm" />
        <p className="text-sm text-ink/70">
          {/* `inline-flex` so the 44px target floor actually applies — `min-h-*`
              is ignored on an inline box (WCAG 2.5.8 Target Size). */}
          <a
            href="https://whiterabbitashland.com"
            className="inline-flex min-h-11 items-center text-ink underline underline-offset-4"
          >
            Follow the white rabbit.
          </a>
        </p>
      </div>
    </footer>
  );
}
