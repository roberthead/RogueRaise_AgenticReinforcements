import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * PageHeader — the eyebrow / `<h1>` / lede block that opens every page.
 *
 * WHY IT EXISTS
 * -------------
 * This block shipped 32 times across 25 files, and the eyebrow inside it shipped
 * as the literal string `eyebrow font-mono text-xs uppercase tracking-widest
 * text-wr-olive-green` — where `eyebrow` matched nothing in any stylesheet. It
 * is now a real `@utility` in globals.css, and it is applied here, once, so no
 * future page can reintroduce the five trailing utilities that used to override
 * it. (A call site that keeps those utilities silently defeats the class; that
 * is the whole reason for centralising this.)
 *
 * WHY `title` IS A PROP AND EVERYTHING ELSE IS A SLOT
 * ---------------------------------------------------
 * Every one of the 32 pages has exactly one `<h1>` today, and keeping that
 * property is the point of this component rather than an aspiration of it. So
 * PageHeader ALWAYS renders exactly one `<h1>`, from a required `title` prop.
 * There is no way to get zero (the prop is required) and no way to get two
 * (nothing else here emits a heading, and consumers never write `<h1>`
 * themselves). No `PageTitle` sub-component is exported, deliberately — that is
 * exactly the escape hatch that would let a page grow a second one.
 *
 * Everything ELSE is a slot taking arbitrary nodes, because the alternative was
 * demonstrably worse. The cautionary case is
 * `src/app/admin/(console)/events/[id]/page.tsx`, whose header carries an
 * eyebrow, an org name, an event title, a status pill, a weekend line, a repo
 * link and a row of phase links. Modelled as props that is eight of them, half
 * boolean, and every new page shape adds a ninth. Modelled as `children` it is
 * just markup, in the page, where it belongs.
 *
 * So: four named slots for the shapes that genuinely recur (`eyebrow`, `lede`,
 * `actions`) plus `children` for everything that does not.
 */

export interface PageHeaderProps {
  /**
   * The page's `<h1>`. Required, because a page with no first-level heading is
   * a defect and this is where that is guaranteed rather than reviewed.
   */
  title: React.ReactNode;

  /**
   * Small mono label above the title — the tier or context marker
   * ("WR Admin", "White Rabbit · Ashland, OR"). Pass the text only: the
   * `eyebrow` utility supplies font, size, case, tracking and colour, and any
   * utility passed alongside it here would override the class it is meant to
   * apply.
   */
  eyebrow?: React.ReactNode;

  /** One paragraph under the title. Constrained to `max-w-prose` for measure. */
  lede?: React.ReactNode;

  /**
   * Page-level controls, laid out beside the title on wide viewports and
   * beneath it when they no longer fit. Buttons belong here; navigation does
   * not (that is the tier header's job, step 1.8).
   */
  actions?: React.ReactNode;

  /**
   * `default` matches the 4xl heading used by 30 of the 32 pages. `display` is
   * the public marketing scale. Note `display` is responsive where the old
   * hand-rolled hub heading was a flat `text-5xl` — a flat 5xl overflows at
   * 320px, and the portal shell already stepped it the same way.
   */
  size?: "default" | "display";

  /** Spacing nudges only. The type scale is the `size` variant. */
  className?: string;

  /**
   * Anything else that belongs in the header block: status pills, a definition
   * list of metadata, a repo link. Rendered after the lede.
   */
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  eyebrow,
  lede,
  actions,
  size = "default",
  className,
  children,
}: PageHeaderProps) {
  const heading = (
    <div className="flex flex-col gap-3">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1
        className={cn(
          "font-serif font-semibold text-ink",
          size === "display" ? "text-4xl sm:text-5xl" : "text-4xl",
        )}
      >
        {title}
      </h1>
    </div>
  );

  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {actions ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          {heading}
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        </div>
      ) : (
        heading
      )}

      {lede ? <p className="max-w-prose text-ink/80">{lede}</p> : null}

      {children}
    </header>
  );
}
