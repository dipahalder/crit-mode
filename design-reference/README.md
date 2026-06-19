# Handoff: Design Crit Mode

## Overview
**Design Crit Mode** is a focused, single-purpose tool that helps people iterate on landing-page designs by **reacting, not prompting**. Instead of asking the user to describe changes, the tool surfaces in-context critique pinned to specific regions of a rendered landing page, and offers concrete, *taste-different* alternatives the user can try on and accept inline. Iteration happens live, with zero prompt-writing.

The core thesis: *you don't know what you want until you see it.* The product's value is **discernment** — the user reacts to material, the tool reads those reactions, and the design evolves.

The signature interaction: numbered feedback pins sit ON regions of a rendered landing page (headline, CTA, hero image, color/mood, a section, the type). Tapping a pin opens a comment popover anchored to that spot containing (1) a short critique framed as a **taste position**, not a correction, and (2) a **fan-out** of 2–4 concrete alternatives. Tapping an alternative previews it live on the page; Accept commits it.

## About the Design Files
The file in this bundle (`Atelier.dc.html`) is a **design reference created in HTML** — a working prototype showing intended look and behavior, **not production code to copy directly**. It is authored as a "Design Component" (a self-contained HTML file with an inline template + a small `Component` logic class); it needs a runtime (`support.js`) to execute, which is **not** included because you are not meant to run it as-is.

Your task is to **recreate this design in your target codebase's existing environment** (React, Vue, SwiftUI, native, etc.) using its established patterns, component library, and design system. If no environment exists yet, choose the most appropriate framework and implement there. Treat the HTML as the source of truth for *look and interaction*, and wire it to your real server-side logic (see **Server-Side Boundary** below).

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions are all specified below and present in the prototype. Recreate the UI faithfully using your codebase's libraries, then replace the hardcoded sample data with live data + LLM calls.

---

## Screens / Views

### 1. START — "Pick a starting point"
- **Purpose:** The user picks one of three landing pages to critique. (In the prototype these are three sample brands; in production this is wherever the user's page comes from.)
- **Layout:** Centered column, `max-width: 1080px`, padding `56px 28px 64px`. A header block, then a 3-column CSS grid (`repeat(3,1fr)`, `gap: 22px`).
- **Components:**
  - **Eyebrow:** `DESIGN CRIT MODE`, 11.5px / 700 / letter-spacing 1.6px / color `#4f46e5`.
  - **H1:** "React, don't describe." — 46px / 800 / letter-spacing −1.8px / color `#18181b`, max-width 660px.
  - **Subhead:** 17px / line-height 1.55 / `#52525b`, max-width 600px.
  - **Brand cards (×3):** Figma-file-browser style — a 190px-tall **thumbnail** (rounded 12px, 1px border `#e2e2e8`, shadow `0 1px 3px rgba(0,0,0,.05)`; hover: border `#c2c2cc`, shadow `0 16px 36px -16px rgba(20,16,10,.32)`, card lifts `translateY(-3px)`) showing a miniature of that brand's page, with the **name** (14.5px / 700) and **category** (11.5px / 500 / `#a1a1aa`) on a row underneath. The whole card is a button.

### 2. WORKSPACE
- **Purpose:** The chosen landing page is rendered large on a canvas with numbered feedback pins; the user reacts to critique and accepts alternatives.
- **Layout:** Full-viewport column.
  - **Top bar** (height 53px, `#fff`, border-bottom `#ececf0`): left = app mark (25px indigo rounded square) + "Design Crit Mode" wordmark + muted tagline "react, don't describe". Right (workspace only) = "Critiquing" label + brand pill (`Brand · Category`) + "Switch brand" button.
  - **Body row** (`flex: 1`): **Canvas** (`flex: 1`, scrollable) + **Comments rail** (fixed `320px`).
  - **Lineage strip** (full width, height 112px) pinned below the body row.
- **Canvas:**
  - Dotted background: `background-image: radial-gradient(#e1e1e8 1.1px, transparent 1.1px); background-size: 17px 17px; background-color: #f3f3f6;` padding 40px.
  - A sticky coachmark pill at top: dark `rgba(24,24,27,.9)`, white text, "Tap a pin, or a note on the right — each is a taste-different critique you can accept inline."
  - **The page frame** (the rendered landing page being critiqued): `width: 920px`, centered, `border-radius: 13px`, `border: 1px solid rgba(0,0,0,.09)`, `box-shadow: 0 22px 60px -20px rgba(20,16,10,.32)`, `overflow: hidden`. Topped by a 38px browser-chrome bar (3 dots + a centered URL pill). The page content recolors via CSS custom properties (see palettes).
  - **Pins:** 27px circles, `background #4f46e5` (open state `#3730a3`), `border: 2.5px solid #fff`, white number 12.5px/800, `box-shadow: 0 2px 6px rgba(0,0,0,.32)` (open adds a `0 0 0 5px rgba(79,70,229,.22)` ring). The headline pin gently pulses (`ate-ping`, 1.9s loop) when nothing is open, to invite the first click.
  - **Comment popover** (see Interactions).
- **Comments rail** (`320px`, `#fff`, border-left `#ececf0`):
  - Sticky header: "Comments" (15px/700) + a pill showing `<resolved> / <total> resolved`; subtitle "Atelier's critique, pinned to the page. Click a note to open it on the design."
  - One **row per pin**, sorted by pin number: a numbered badge (23px circle; open→indigo fill, resolved→green `#e7f3ec`/`#3f8f5f` with ✓), the **region** name (12.5px/700) + a status pill (`Open` grey / `Resolved` green), and the critique clamped to 2 lines (12px / `#71717a`). Resolved rows show `→ <chosen value>` and dim to 0.78 opacity. The active row gets a 3px indigo left border + `#f6f6ff` background. Clicking a row opens that pin's popover on the canvas and scrolls the canvas to it.
- **Lineage strip** (read-only): "VERSION LINEAGE" label + horizontally-scrolling thumbnails `v1 → v2 → v3 …`. Each thumb (120px) shows the version's palette background, its headline in serif, the version number, and a short note (the region that changed). The current version has a 2px indigo border.

---

## The Signature Interaction (build this most carefully)

1. **Open a note.** Click a pin on the canvas **or** a row in the comments rail. → The pin enters its open state, the rail row highlights, the canvas smooth-scrolls so the pin is in view, and a **popover** opens anchored near the pin.
2. **Popover contents** (width 334px, radius 14px, border `#e6e6ec`, shadow `0 24px 60px -16px rgba(20,16,30,.34)`, enters with `ate-pop` 0.2s):
   - Header: pin number chip + **region** label (e.g. "Hero headline") + a `×` close button.
   - **Critique** (14.5px / 500 / `#27272a`) — framed as a *taste position*, e.g. *"'Coffee, delivered.' sells the logistics, not the ritual. Lead with mood instead?"*
   - **Prompt** (11.5px / 600 / `#a1a1aa`), e.g. "Pick a headline direction:".
   - **Fan-out** of 2–4 **option cards**. Each card shows the alternative `value` (13.5px / 600) and a `vibe` descriptor (11px / `#a1a1aa`, e.g. "Warm · ritual"). Palette options instead show a row of 3 color swatches + the palette name.
   - Footer hint: "Tap an option to try it on live. Accept to keep it."
3. **Try it on (preview).** **Click anywhere on an option card** → the option is applied **live** to the page (text swaps for copy regions; the whole page recolors for the color/mood region) **without committing**. The card highlights (`#eef0ff`, border `#9aa0f5`) and shows a `PREVIEWING` tag; a banner appears in the popover: "Trying it on live — Accept to keep, or close to revert." There is **no separate Preview button** — the card itself is the preview affordance.
4. **Accept.** Each non-current card has one **Accept** button (indigo `#4f46e5`, hover `#4338ca`). Accept commits the option: the page field updates permanently, the comment is marked **Resolved** (with the chosen value), a **new version is appended to the lineage**, the popover closes, and any preview state clears.
5. **Revert.** Closing the popover (`×`), opening a different note, or switching brand clears the un-accepted preview and the page returns to its last committed state.
6. **Current.** The option matching the currently-committed value shows a muted "Current" label instead of Accept and is not clickable.

**Alternatives must be genuinely different aesthetic directions, never "the better version."** That is what keeps this a taste tool rather than an optimizer. Do not rank them.

### Popover placement rule (important)
The popover is positioned to open on the side of the pin **opposite the element it changes**, so the change stays visible while the note is open:
- Left-aligned copy (headline/subhead/CTA) → popover opens to the **right** (over neutral/hero-image space).
- The hero image/right column → popover opens to the **left**.
- Centered content (e.g. Maren's centered headline) → popover opens **below** the element.
- Color/mood (recolors the whole page) → placement is flexible.

In the prototype this is encoded as fixed `popTop`/`popLeft` pixel coordinates per pin (tuned against the 920px frame). **In production, compute placement from the target element's bounding box** at open time: pick the side with the most room that does not overlap the element being changed.

---

## Data Model

### Editable page fields (`page`)
The live, editable content of the page under critique. Each feedback pin targets exactly one field:

| field      | meaning                  | example (Ember default) |
|------------|--------------------------|-------------------------|
| `headline` | hero headline text       | "Coffee, delivered." |
| `subhead`  | hero subhead text        | "Single-origin coffee from independent farms…" |
| `cta`      | primary CTA label        | "Start your subscription" |
| `heroImg`  | hero image direction (caption/placeholder) | "Flat-lay of fresh beans" |
| `social`   | social-proof line        | "Trusted by 12,000 home baristas" |
| `palette`  | theme key (recolors page)| "warmEarthy" |

### Feedback pin / critique (`dot`)
```
{
  id: 'headline',            // unique within a brand
  n: 1,                      // display number on the pin
  kind: 'text' | 'palette',  // 'palette' renders swatches + recolors the page
  region: 'Hero headline',   // shown in popover + rail
  field: 'headline',         // which page field it edits
  critique: '…taste-position critique…',
  prompt: 'Pick a headline direction:',
  top, left,                 // pin position (px, relative to the 920px frame)  ← derive from element bbox in prod
  popTop, popLeft,           // popover position (px)                            ← derive from element bbox in prod
  options: [ Option, … ]     // the fan-out (2–4)
}
```

### Option (fan-out alternative)
```
// text option
{ id:'ritual', value:'Your best morning, on repeat.', vibe:'Warm · ritual', tag:'Warm, ritual-led headlines' }
// palette option (kind:'palette')
{ id:'warmEarthy', value:'warmEarthy', vibe:'Warm earthy', tag:'Warm, earthy palette', swatch:['#a9521f','#e7d2b8','#2a1c12'] }
```
- `value` is what gets written to the page field on Accept.
- `vibe` is the short descriptor shown under the option.
- `tag` is a human-readable label for "what taste this represents" (used by the resolved summary; reserved for a future taste-profile feature).

### Version (lineage entry)
```
{ n: 2, palette: 'warmEarthy', headline: 'Your best morning, on repeat.', note: 'Hero headline' }
```
A new entry is pushed on every Accept. `note` is the region that changed; the thumbnail renders from `palette` + `headline`.

### Sample content baked into the prototype
Three sample brands, each a **distinct page layout** with its own palette and six critiques:
- **Ember** — single-origin coffee subscription. Warm split-hero magazine layout. Palette `warmEarthy`.
- **Cadence** — productivity/SaaS app. Stripe-like layout: gradient hero + a floating product-UI mock + feature grid + stats. Palette `cadence`.
- **Maren** — botanical skincare. Versed-like airy centered editorial layout. Palette `maren`.

Each brand defines: nav links, eyebrow, defaults for the 6 editable fields, social proof, a "how it works"/steps block, a featured-items block, a testimonial, footer, and the six `dot` critiques (headline, subhead, CTA, hero image, color/mood, social proof) with their fan-out options. Read `Atelier.dc.html` for the full sample copy.

---

## State Management

```
{
  screen: 'start' | 'workspace',
  activeBrand: 'ember' | 'cadence' | 'maren',   // → the page under critique
  openDot: <dotId> | null,                      // which note is open
  page: { headline, subhead, cta, heroImg, social, palette },  // committed content
  preview: { dotId, optId, field, value } | null,              // un-committed try-on
  resolvedDots: { [dotId]: '<chosen value or palette name>' },  // resolved notes
  versions: [ Version, … ],                     // lineage (v1 = starting point)
}
```
**Derived for render:** `view = { ...page, [preview.field]: preview.value }` when a preview is active — the page renders from `view`, not `page`, so the try-on is visible without mutating committed state.

**Transitions:**
- `chooseBrand` → set `activeBrand`, reset `page` to that brand's defaults, `openDot=null`, `preview=null`, `versions=[v1]`, scroll canvas to top.
- `openNote(dotId)` → toggle `openDot`, clear `preview`, scroll canvas to the pin.
- `previewOption(dotId, optId)` → set/clear `preview` (toggles off if the same option is tapped again).
- `accept(dotId, optId)` → write `page[field]`, set `resolvedDots[dotId]`, push a `version`, clear `openDot` + `preview`.
- `close` / `switchBrand` → clear `openDot` + `preview`.

---

## Server-Side Boundary (what you're building)

In the prototype, **all critiques and fan-out options are hardcoded sample data**. In production these are generated. The clean seams:

1. **The page under critique.** Replace the three sample brand pages with the user's actual rendered landing page (their live page, an import, or a generated draft). You need a structured model of its editable regions (the `page` fields above) plus a way to render it.
2. **Critique generation (the core LLM call).** For a given region of the page, generate:
   - one **critique** phrased as a *taste position* (not a correction), and
   - **2–4 fan-out options** that are *genuinely different aesthetic directions* (not ranked, not "the better version"), each with a short `vibe` descriptor and the concrete `value` to apply.
   - Suggested contract: `POST /critique { pageModel, region, persona? } → { critique, prompt, options:[{value, vibe, tag}] }`. (`persona` is a future hook — e.g. brand designer / conversion strategist / skeptical first-time visitor — that changes what the same pin says.)
   - Keep generation **diverse**: prompt the model explicitly for taste-different directions, and de-dupe against already-accepted/dismissed tags so it doesn't converge on one house style.
3. **Pin placement.** Map each critiqued region to coordinates from the rendered DOM's bounding box (the prototype hardcodes them). Apply the **placement rule** above for the popover.
4. **Apply / Accept.** On Accept, write the option `value` into the canonical page model and **persist a version** (lineage). Color/mood options apply a theme (the prototype swaps a set of CSS custom properties — see palettes).
5. **Persistence.** Store `page`, `versions` (lineage), and `resolvedDots`. The "no pile" (dismissed options/tags) is captured in the data model as signal for a future taste-profile feature, even though the current UI doesn't surface a taste panel.

---

## Design Tokens

### Colors — tool chrome
| token | hex |
|---|---|
| App background | `#f3f3f6` |
| Surface / panels | `#ffffff` |
| Hairline border (strong) | `#ececf0` |
| Hairline border (soft) | `#f4f4f6` |
| Ink (primary text) | `#18181b` / `#27272a` |
| Sub text | `#71717a` / `#8e8e98` |
| Muted text | `#a1a1aa` / `#b4b4bc` |
| **Accent (indigo)** | `#4f46e5` |
| Accent hover | `#4338ca` |
| Accent on dark / pin-open | `#3730a3` |
| Accent tint (chips/active) | `#eef0ff` / `#f6f6ff` |
| Accent tint border | `#e0e2ff` / `#dcdcff` / `#9aa0f5` |
| Resolved green (text / bg) | `#3f8f5f` / `#e7f3ec` |
| Canvas dot grid | `#e1e1e8` |

### Colors — page palettes (CSS custom properties applied to the frame)
Each palette sets: `--bg --surface --ink --sub --accent --accentInk --line --hero --display --dispWeight --dispLs`.

| palette | bg | ink | accent | hero | display font |
|---|---|---|---|---|---|
| `warmEarthy` | `#f3e9dc` | `#2a1c12` | `#a9521f` | `#e7d2b8` | Newsreader serif, 500 |
| `bold` | `#ffffff` | `#0d0d0f` | `#ea5a16` | `#1b1b1f` | Manrope 800 |
| `cream` | `#faf7f1` | `#1f1b16` | `#3f3a33` | `#efeae1` | Newsreader serif, 400 |
| `cadence` | `#ffffff` | `#0a2540` | `#635bff` | `#0a2540` | Manrope 800 |
| `maren` | `#f1efe8` | `#27261f` | `#46503a` | `#e3e6d8` | Newsreader serif, 400 |
(Cadence's hero band additionally uses a fixed gradient: `radial-gradient(135% 130% at 8% 4%, #7b78ff, #635bff 30%, #3b2f8f 70%, #1b1540)`.) Full sub/line/accentInk values are in `Atelier.dc.html`.

The first three (`warmEarthy`, `bold`, `cream`) are the **color/mood fan-out options** offered on the palette pin, so any page can be recolored to any of them.

### Typography
- **Tool chrome + UI:** `Manrope` (400/500/600/700/800).
- **Brand page display (serif):** `Newsreader` (400/500/600, + italic for testimonials).
- Both loaded from Google Fonts.
- Representative sizes: page H1 47–58px; popover critique 14.5px; option value 13.5px; rail region 12.5px; rail critique 12px; eyebrows 11px / letter-spacing 1.5–1.6px.

### Spacing / radius / shadow
- Frame radius 13px; popover radius 14px; option cards 10px; pins/badges full-round; chips/pills 999px.
- Pin 27px; rail badge 23px; popover width 334px; rail width 320px; frame width 920px.
- Shadows: frame `0 22px 60px -20px rgba(20,16,10,.32)`; popover `0 24px 60px -16px rgba(20,16,30,.34), 0 2px 8px rgba(0,0,0,.08)`; card hover `0 16px 36px -16px rgba(20,16,10,.32)`.
- Keyframes: `ate-pop` (popover in), `ate-chip` (chip in), `ate-ping` (pin pulse). Color/recolor transitions on the frame: `background .45s ease, color .45s ease`.

## Assets
- **Fonts:** Manrope + Newsreader (Google Fonts) — swap for your codebase's equivalents.
- **Imagery:** none shipped. All images are **placeholders** — diagonally-striped blocks with a monospace caption describing the intended shot (e.g. "Pour-over in morning light"). Replace with real assets.
- **Icons:** none external; the few glyphs are CSS shapes / Unicode (`×`, `→`, `✓`).
- No Anthropic brand assets are used.

## Files
- `Atelier.dc.html` — the complete hifi prototype (template + `Component` logic class). This is the source of truth for layout, copy, palettes, the three sample brand pages, all critique/option sample data, and the full interaction model. It is a Design Component; it will not run without its `support.js` runtime (intentionally omitted — read it as a reference, recreate in your stack).
