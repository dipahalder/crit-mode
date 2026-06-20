# Design Crit Mode (Atelier)

A focused tool for iterating on a landing page by **reacting, not prompting**.
Numbered feedback pins sit on regions of a rendered page. Tapping a pin opens a
popover with a staff-level design critique plus a fan-out of 2 to 4 genuinely
different alternatives. Tapping an option previews it live on the page; Accept
commits it and appends a version to a read-only lineage.

Core thesis: you do not know what you want until you see it, so the value is
discernment, not a generate button.

Live: https://crit-mode.vercel.app

---

## Stack

- **Vite + React 18 + TypeScript** (strict) for the app. Styling is inline styles
  plus CSS custom properties for palette theming. No UI kit.
- **Express** (`server/`) for the local critique proxy, and a **Vercel
  serverless function** (`api/`) for the same endpoint in production. Both import
  one shared core (`server/core.ts`), so there is a single implementation.
- **Anthropic SDK** (`@anthropic-ai/sdk`), model `claude-sonnet-4-6` by default
  (override with `ANTHROPIC_MODEL`).
- Fonts: Manrope (chrome) and Newsreader (brand page serif).

## Quick start

```bash
npm install
cp .env.example .env        # add ANTHROPIC_API_KEY (optional; see Reliability)
npm run dev:full            # Vite (5173) + critique proxy (8787) together
```

Other scripts: `npm run dev` (client only), `npm run server` (proxy only),
`npm run build` (`tsc -b && vite build`), `npm run preview`.

The app is fully usable with **no API key**. Critiques then come from the
authored static data; the LLM is purely additive.

---

## Architecture

```
                         browser (Vite/React SPA)
   StartScreen ──pick brand──> Workspace
        │                          │  page-as-data: page model + derived view
        │                          ├─ PageFrame + Brand layout (Ember/Cadence/Maren)
        │                          ├─ Pin overlay (positions from bounding boxes)
        │                          ├─ Popover (critique + options + live preview)
        │                          └─ CommentsRail (persona switcher + rows)
        │
        └── POST /critiques ───────────────────────────────────────────────┐
                                                                            ▼
  local dev:    Vite proxy ───────────> Express (server/index.ts) ──┐
  production:   /critiques rewrite ───> Vercel fn (api/critiques.ts) ┤
                                                                     ▼
                                                          server/core.ts
                                                 (Anthropic calls + validation
                                                  + static fallback)
```

The client talks to a single relative URL, `POST /critiques`. Locally the Vite
dev server proxies it to Express on `:8787`; in production `vercel.json` rewrites
it to the serverless function. The Anthropic key never reaches the client.

---

## Data model (`src/types.ts`)

```
page    : { headline, subhead, cta, heroImg, social, palette, concept,
            heroLayout, paletteTokens? }
dot     : { id, n, kind:'text'|'palette'|'concept', region, field, critique,
            prompt, options, byPersona? }
option  : { id, value, vibe, tag, swatch?, patch? }   // patch = multi-field change
version : { n, palette, paletteTokens?, headline, note }
preview : { dotId, optId, field, value, patch? } | null
```

Guardrails that shape the model:

- **Page as data.** The page under critique is a `page` object. Options are
  patches to `page` fields; Accept is a merge. During a try-on the app renders
  from a derived `view = { ...page, ...patch }`, never from the committed `page`,
  so the preview is visible without committing.
- **Pins are measured, not hardcoded.** Each critiqued element is registered with
  a ref; a layout effect plus a ResizeObserver measure its bounding box in canvas
  coordinates and recompute on resize and scroll. Popovers open on the side
  opposite the element they change so the change stays visible.
- **No em or en dashes** in any rendered text. `clean()` (`src/utils/clean.ts`)
  scrubs them from every critique, prompt, label, and piece of chrome copy.

---

## Critique pipeline

A "round" is one set of critiques for the current brand and persona.

1. The client effect (`src/App.tsx`) fires on **brand pick** and **persona
   switch** (not on Accept, see Performance). It sends
   `{ brand, pageModel, persona, inventory, targets }` to `POST /critiques`,
   debounced 250ms, abortable, and generation-tagged so only the latest round
   applies.
2. `targets` is the persona's editable focus regions (see Personas). With targets
   pinned, `server/core.ts` skips region selection and **generates each region in
   parallel** (`generateOne` per region), then returns
   `{ critiques: [{ targetId, critique, prompt, options }], source: 'live' }`.
3. The client merges each live critique onto its dot for the active persona
   (`mergeDot`): live critique and options win; otherwise the authored
   per-persona copy (`dot.byPersona`) is used.

If anything fails (no key, API error, invalid JSON, validation), the endpoint
returns the static dots with `source: 'fallback'` and the UI is unaffected.

### Server core (`server/core.ts`)

- `generateMany(brand, pageModel, persona, inventory, targets)` orchestrates a
  round: pinned `targets` go straight to parallel per-region generation; without
  targets it first runs a small `selectRegions` pass.
- `generateOne(brand, region, ...)` critiques one region in the persona voice and
  validates the result, throwing (and being dropped) on any malformed output.
- `staticCritiques(brand)` and `fallbackFor(brand, region)` are the always-valid
  fallbacks.
- The Anthropic client is created lazily from the environment, so a serverless
  cold start picks up `ANTHROPIC_API_KEY`.

---

## Personas (`src/data/personas.ts`)

Four critics review the same page from genuinely different points of view:
**staff designer**, **creative director**, **CEO**, and **first-time visitor**.
Each persona is a lens, not a tone: its `voice` defines what it examines and what
it ignores, and that lens (not a generic designer identity) drives the critique,
so the personas surface different *kinds* of insight.

`PERSONA_FOCUS` gives each persona a signature set of regions, so switching
perspective visibly moves the pins (different concerns, different dot positions):

| Persona | Focus regions |
| --- | --- |
| Staff designer | hero layout, palette, hero image, subhead |
| Creative director | concept, headline, hero image, palette |
| CEO | concept, headline, social proof, CTA |
| First-time visitor | headline, subhead, CTA, social proof |

Editable focus regions are critiqued live in the persona's voice; structural
regions (`concept`, `heroLayout`) render from authored per-persona copy.

---

## Dynamic palettes

For the color and mood region, the model proposes brand-appropriate color moods
as `{ value, vibe, bg, ink, accent, hero, display }`. The server validates the
hex colors and derives a full token set (`derivePalette` in `server/core.ts`,
mirrored client-side in `src/utils/palette.ts`) so any mood recolors the entire
page consistently. Each mood is applied as an `Option.patch` setting
`page.paletteTokens`. If the model does not return valid colors, the client keeps
the authored, brand-specific moods in `src/data/brands.ts`, so the choices always
read as that brand.

## Structural reorganizers

Two curated structural dots reflow the layout rather than swapping copy:

- `concept` (`product-led` | `ritual-led` | `origin-led`): content framing and
  which body sections lead.
- `heroLayout` (`split` | `centered` | `imageFirst`): hero geometry.

Their options carry coordinated multi-field `patch`es and render across all three
brand layouts.

---

## Reliability

The demo never depends on an API call succeeding (the hardcoded brand `dots` are
the fallback and always work). Every endpoint returns `source: 'fallback'` with
the static dots on any failure, silently. An in-app badge in the comments rail
header shows the current source (Live, Critiquing, or Static).

## Performance

- **Sonnet 4.6** default for faster critiques.
- **Parallel rounds.** A round critiques each region concurrently, so wall-clock
  is about the slowest single region rather than the sum (~19s to ~7s).
- **No refetch on Accept.** The fetch effect reads the page via a ref and does
  not depend on it, so committing an option resolves that one dot without
  reloading the rest.
- **Frozen rail order during preview.** Trying on an option can reflow the page,
  but the comment list order is held while a preview is active so it does not
  reshuffle.
- **Memoized brand layout.** The page (hundreds of nodes) is memoized on the
  values that change its output, so opening a note and scroll-driven re-measures
  do not re-render it (fixes interaction-to-next-paint stalls).

---

## Deployment (Vercel)

- The SPA builds with Vite; `api/critiques.ts` deploys as a serverless function.
- `vercel.json` rewrites `/critiques` to `/api/critiques`, so the client URL is
  the same in dev and prod.
- Set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) in the Vercel project
  environment for Production and Preview, then redeploy.
- **ESM note:** `package.json` is `"type": "module"`, so Vercel runs the function
  as native ESM, which requires explicit `.js` extensions on relative imports
  (e.g. `import { ... } from '../server/core.js'`). TypeScript, `tsx`, and Vite
  all still resolve these to the `.ts` files.

## Project structure

```
api/critiques.ts        Vercel serverless function (production /critiques)
server/core.ts          Shared critique logic (Anthropic calls, validation, fallback)
server/index.ts         Local Express proxy wrapping the core
src/App.tsx             State, round fetch effect, derived view, transitions
src/components/         Workspace, PageFrame, brand layouts, Popover, CommentsRail, ...
src/data/brands.ts      Brand content, dots, palette moods, structural options
src/data/personas.ts    Persona lenses and PERSONA_FOCUS
src/utils/              clean() (dash scrub), derivePalette()
src/types.ts            Data model
vercel.json             /critiques -> /api/critiques rewrite
```

## Scope

v1 has no database, no auth, and no refresh survival. All state is in memory and
resets on reload, which is acceptable for the demo.
