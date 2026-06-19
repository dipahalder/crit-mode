# CLAUDE.md - Design Crit Mode (Atelier)

This file is the standing context for this project. Read it before every change.
The detailed spec lives in `design-reference/README.md`; the visual and
interaction source of truth is `design-reference/Atelier.dc.html`. Put both of
those files in `design-reference/` at the repo root.

## What we are building
A focused, single-purpose tool that lets people iterate on a landing page by
**reacting, not prompting**. Numbered feedback pins sit on regions of a rendered
page. Tapping a pin opens a popover with a staff-level design critique plus a
fan-out of 2 to 4 taste-different alternatives. Tapping an option previews it
live on the page; Accept commits it and appends a version to a read-only lineage.
Core thesis: you do not know what you want until you see it, so the value is
discernment, not a generate button.

## Source of truth and how to use it
- `Atelier.dc.html` is a **design reference**, not runnable code. It needs a
  runtime that is intentionally not shipped. Do **not** try to run it or copy it
  verbatim. Recreate its look and interaction in our stack.
- `README.md` is the spec. All tokens, palettes, the data model, the state
  transitions, and the Server-Side Boundary are there. Pull exact values from it
  rather than guessing.

## Stack (decided)
- Vite + React + TypeScript for the app.
- Plain CSS or CSS modules using the tokens in the README. Inline styles are fine
  early since the prototype is authored that way; do not pull in a heavy UI kit.
- One small Express proxy (`server/`) added only at the LLM milestone, to keep the
  Anthropic API key off the client. If you would rather use a single framework,
  Next.js App Router with an `/app/api/critique` route is an acceptable swap; pick
  one and stay with it.
- Fonts: Manrope (chrome) and Newsreader (brand page serif) from Google Fonts.

## Non-negotiable guardrails
1. **Page as data.** The page under critique is a `page` object. Never mutate the
   DOM directly to make a change. Every option is a patch to a `page` field, and
   Accept is a merge. During preview, render from a derived
   `view = { ...page, [preview.field]: preview.value }`, never from the committed
   `page`, so try-on is visible without committing.
2. **Pin and popover positions come from bounding boxes.** The prototype hardcodes
   `top/left/popTop/popLeft` in pixels against a 920px frame. Do **not** reuse
   those numbers. Measure each target element with a ref plus a layout effect and
   a ResizeObserver, and recompute on resize and scroll. Apply the placement rule:
   open the popover on the side of the pin opposite the element it changes, so the
   change stays visible (left copy opens right, hero image opens left, centered
   content opens below, color/mood is flexible).
3. **Hybrid critiques, reliability first.** The hardcoded brand `dots` are the
   FALLBACK and must always work. The LLM is additive. The demo must never depend
   on an API call succeeding. If the call is slow, fails, or returns invalid JSON,
   fall back to the static `dots` silently.
4. **Voice and copy.** Critiques read like a staff-level product designer giving
   crit: specific about the element, tied to the brand or the user's moment, and
   ending on a real question, not a command. Alternatives are **genuinely
   different aesthetic directions, never ranked, never "the better version."**
   **Never use em dashes or en dashes** anywhere in rendered text. Run the scrub
   below on every critique, prompt, option label, and piece of chrome copy,
   including text lifted from the prototype, which contains em dashes.
   ```js
   const clean = s => s.replace(/\s*[—–]\s*/g, ", ");
   ```
5. **v1 scope.** No database, no auth, no refresh survival. All state is in memory
   and resets on reload, which is acceptable. Do not add persistence.
6. **Do not one-shot.** Implement one milestone from `BUILD_PLAN.md` at a time.
   Run it, confirm the milestone's "Done when" check, commit, then stop and wait.

## Data model (from the README, condensed)
```
page    : { headline, subhead, cta, heroImg, social, palette }
dot     : { id, n, kind:'text'|'palette', region, field, critique, prompt, options }
option  : { id, value, vibe, tag, swatch? }     // swatch only for palette options
version : { n, palette, headline, note }        // note = region that changed
state   : { screen:'start'|'workspace', activeBrand, openDot, page,
            preview:{dotId,optId,field,value}|null, resolvedDots:{[id]:chosen},
            dismissed:[{tag}], versions:[version] }
```
Transitions: `chooseBrand` resets page to brand defaults and versions to `[v1]`;
`openNote` toggles `openDot` and clears preview; `previewOption` sets or clears
preview; `accept` writes `page[field]`, sets `resolvedDots`, pushes a version,
clears `openDot` and preview; `close`/`switchBrand` clear `openDot` and preview.

## LLM contract (for the LLM milestone)
`POST /critique { pageModel, region, persona? } -> { critique, prompt, options:[{value, vibe, tag}] }`

System prompt to use on the server:
```
You are a staff-level product designer giving crit on a landing page region.
Write the critique as a taste position, not a correction. Be specific about the
element and what it is doing. Tie it to the brand's positioning or the user's
moment, never to personal taste. End on a genuine question that opens a choice,
never a command. One observation, two short sentences maximum. Bias toward the
composition and concept level, not small cosmetic nits.

Produce 2 to 4 options that are genuinely different aesthetic directions, never
ranked, never "the better version." Each option: a short vibe descriptor and the
concrete value to apply. Keep them diverse and de-dupe against tags the user has
already accepted or dismissed.

Never use em dashes or en dashes. Use periods or commas. Do not use growth
marketing language such as convert, CTR, or urgency. Return JSON only, no prose,
no markdown fences.
```
On the server: parse, strip code fences, validate `region` against the dot enum
and every option `value` against the field type, run `clean()` on all strings,
and return the static `dots` for that region as FALLBACK on any failure.

## Reference docs
Claude Code usage and configuration: https://docs.claude.com/en/docs/claude-code/overview
