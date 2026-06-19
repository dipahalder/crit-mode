# BUILD_PLAN.md - Design Crit Mode, incremental build

Build this one milestone at a time. Hand a single milestone to Claude Code, let
it implement only that milestone, run the "Done when" check together, commit, and
only then move to the next. Do not skip ahead, and do not let it implement two
milestones in one pass. The order is deliberate: the whole thing is demoable from
M2 onward, and the LLM is added last so reliability never depends on it.

## How to drive Claude Code
1. Put `CLAUDE.md` at the repo root and `README.md` + `Atelier.dc.html` in
   `design-reference/`. Claude Code reads `CLAUDE.md` automatically each turn.
2. For each milestone, paste the milestone text and add: "Implement only this
   milestone. When done, run the Done-when check, tell me the result, and stop."
3. After it confirms the check passes, commit with the suggested message, then
   start the next milestone in a fresh message.

## Suggested repo layout
```
atelier-crit-mode/
  CLAUDE.md
  design-reference/   README.md, Atelier.dc.html
  src/                the React app
  server/             added at M11 (the /critique proxy)
  .env                ANTHROPIC_API_KEY (never commit)
```

---

## M0 - Scaffold and run
- **Goal:** an empty app that runs.
- **Build:** Vite + React + TypeScript. Load Manrope and Newsreader from Google
  Fonts. App background `#f3f3f6`, base font Manrope.
- **Done when:** `npm run dev` serves a blank styled page at localhost and both
  fonts are loading (check the network tab).
- **Commit:** `chore: scaffold vite react ts app`

## M1 - Types and sample data
- **Goal:** the data model exists and the three brands load.
- **Build:** TypeScript types for `page`, `dot`, `option`, `version`, and `state`
  from CLAUDE.md. Port the three brands (ember, cadence, maren) with their
  defaults, sections, and six `dots` each, lifted from `Atelier.dc.html` into a
  `src/data/brands.ts`. Port the `palettes` map too. Do not lift the hardcoded
  `top/left/popTop/popLeft` pixel values; omit them.
- **Done when:** the project type-checks and you can `console.log` all three
  brands with six dots each and their options.
- **Commit:** `feat: data model and brand sample data`

## M2 - Render one page from data (Ember)
- **Goal:** a real landing page renders from the `page` object.
- **Build:** the page frame (920px, radius 13px, the 38px browser-chrome bar with
  three dots and a URL pill, the frame shadow) and Ember's full layout from the
  prototype: split hero, how-it-works steps, featured items, testimonial, footer.
  Use placeholder image blocks (diagonal stripes + a mono caption) exactly as the
  prototype does. No pins yet.
- **Done when:** Ember renders and visually matches the Ember page in
  `Atelier.dc.html`, driven entirely by the `page` fields and brand data.
- **Commit:** `feat: render ember page from data`

## M3 - Palette theming
- **Goal:** the whole page recolors from one field.
- **Build:** apply each palette as CSS custom properties on the frame
  (`--bg --surface --ink --sub --accent --accentInk --line --hero --display ...`),
  with a `background .45s ease, color .45s ease` transition.
- **Done when:** changing `page.palette` between `warmEarthy`, `bold`, and `cream`
  recolors the entire frame smoothly.
- **Commit:** `feat: palette custom properties and recolor`

## M4 - Start screen (the picker)
- **Goal:** pick a brand, land in the workspace.
- **Build:** the "React, don't describe." picker: eyebrow, H1, subhead, and a
  three-column grid of brand cards (190px thumbnail miniature of each page, name,
  category). Selecting a card runs `chooseBrand` and switches `screen` to
  `workspace`. Add the top bar with the brand pill and a "Switch brand" button
  that returns to start. Render Cadence and Maren layouts here too so all three
  cards and pages are real.
- **Done when:** clicking each of the three cards renders that brand's page in the
  workspace, and "Switch brand" returns to the picker. Scrub em dashes from the
  picker subhead and any chrome copy.
- **Commit:** `feat: start screen picker and brand switching`

## M5 - Pins from bounding boxes
- **Goal:** pins sit on regions and stay anchored. This is the part you flagged.
- **Build:** give each critiqued element a ref. Render pins in an overlay layer
  whose positions are computed from each target element's bounding box in a layout
  effect, recomputed on resize and on canvas scroll via a ResizeObserver and a
  scroll listener. Pin style from the README (27px indigo circle, white border,
  numbered). The headline pin pulses (`ate-ping`) when no note is open.
- **Done when:** pins render on their regions, stay correctly anchored when you
  resize the window and scroll the canvas, and the headline pin pulses at rest.
  No hardcoded pixel coordinates anywhere.
- **Commit:** `feat: bounding-box anchored pins`

## M6 - Comments rail
- **Goal:** the right rail mirrors the pins.
- **Build:** the 320px rail: header with a `resolved / total` pill, one row per
  dot sorted by number, each with a numbered badge, region name, status pill, and
  the critique clamped to two lines. Active row gets the indigo left border and
  tint. Clicking a row opens that dot and scrolls the canvas to its pin; opening a
  pin highlights its row.
- **Done when:** the rail and canvas stay in sync both directions, and the
  resolved counter reads `0 / 6`.
- **Commit:** `feat: comments rail synced with pins`

## M7 - Popover open and placement
- **Goal:** the note opens on the right side of the pin.
- **Build:** clicking a pin or row opens the popover (334px, the README's radius,
  border, shadow, and `ate-pop` entrance). Header with pin chip, region, and close.
  Critique and prompt text. Footer hint. Compute placement from the target's
  bounding box per the placement rule (left copy opens right, hero image opens
  left, centered opens below). Closing clears `openDot`.
- **Done when:** the popover opens on the correct side for the headline (right),
  the hero image (left), and a centered headline (below), and never covers the
  element it edits.
- **Commit:** `feat: popover with bbox placement`

## M8 - Fan-out and live try-on
- **Goal:** previewing an option changes the page live, without committing.
- **Build:** render option cards (text options show value + vibe; palette options
  show three swatches + name). Clicking a card sets `preview` and the page renders
  from the derived `view`, so the change is visible. Show the PREVIEWING tag and
  the "Trying it on live" banner. Clicking the same card again, opening another
  note, or closing clears the preview and reverts. The option matching the current
  value shows a muted "Current" label and is not clickable.
- **Done when:** previewing a headline live-swaps the text, previewing a palette
  recolors the whole page live, and closing or switching reverts to the committed
  state every time.
- **Commit:** `feat: fan-out options and live preview`

## M9 - Accept, resolve, lineage
- **Goal:** committing a change and seeing the history grow.
- **Build:** each non-current card gets an Accept button. Accept runs the
  transition: write `page[field]`, set `resolvedDots[id]` to the chosen value,
  push a `version`, clear `openDot` and `preview`. The rail row flips to resolved
  (green badge, check, chosen value, dimmed) and the counter increments. Build the
  read-only lineage strip below the body (120px thumbs, palette background, serif
  headline, version number, the region that changed; current version has the
  indigo border). Add a cross-fade on the changed region.
- **Done when:** accepting an option persists it for the session, marks the note
  resolved, increments the counter, and appends a thumbnail to the lineage. The
  color/mood accept visibly recolors the whole page and records a new version.
- **Commit:** `feat: accept, resolved state, version lineage`

## M10 - Voice and em-dash scrub pass
- **Goal:** every rendered string honors the rules.
- **Build:** route all critique, prompt, option, and chrome strings through
  `clean()`. Spot-check the tone against the staff-voice examples; the prototype's
  copy is already close, so this is mostly the dash scrub plus a read-through.
- **Done when:** searching the rendered DOM for `—` and `–` returns nothing, and
  the critiques read as taste positions ending in a question.
- **Commit:** `chore: voice pass and em-dash scrub`

You now have a complete, reliable demo running entirely on static data. Everything
below is additive. If you run out of time here, you still have a full product.

## M11 - LLM layer (hybrid, additive)
- **Goal:** critiques are generated live, with the static set as the safety net.
- **Build:** add `server/` with one endpoint, `POST /critique`, using the contract
  and system prompt in CLAUDE.md. It holds `ANTHROPIC_API_KEY`, calls the messages
  API, strips fences, parses, validates `region` and each option `value`, runs
  `clean()`, and returns the static `dots` for that region as FALLBACK on any
  failure. Wire the client to fetch critiques on brand-pick and after each Accept
  (debounced), show a "thinking" pulse on pins while loading, and use the static
  `dots` if the fetch fails or is slow.
- **Done when:** `curl` against `/critique` returns valid JSON; removing the API
  key makes it return the fallback; with the server stopped, the app still works
  fully on static data; and after an Accept, the next round of critiques reflects
  the changed page.
- **Commit:** `feat: critique proxy endpoint and live generation with fallback`

## M12 - One real page-level move (beyond the prototype)
- **Goal:** at least one critique reorganizes the page, not just a field, so this
  reads as leverage rather than tweaks.
- **Build:** extend `page` with one structural field, for example
  `concept: 'product-led'|'ritual-led'|'origin-led'` or a `sectionOrder` array,
  and make the renderer honor it (reorder sections, swap the hero treatment). Add
  one page-scope critique whose options are coordinated multi-field patches that
  reflow the page on Accept. This is the single intended extension past the
  delivered prototype; keep it last so the core stays faithful.
- **Done when:** accepting the page-level option visibly restructures the page and
  records a version, and the element-level critiques still work unchanged.
- **Commit:** `feat: page-level concept critique that reflows the layout`

---

## Verification mindset
Each milestone ends in a running app you can click. If a "Done when" check fails,
fix it before moving on rather than stacking the next milestone on a broken base.
The two highest-risk milestones are M5 (bbox pins) and M8 (live preview from the
derived view); give those their own focused sessions.
