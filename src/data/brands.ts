// Brand sample data for Design Crit Mode (Atelier).
//
// Lifted verbatim from the data block in design-reference/Atelier.dc.html
// (palettes, paletteOptions, brands). Two intentional changes per the build
// rules:
//   1. The hardcoded pixel coordinates (top/left/popTop/popLeft) are omitted;
//      pins and popovers are placed from bounding boxes later (M5/M7).
//   2. Strings are kept faithful to the prototype, including the em dashes it
//      contains. The em-dash scrub (clean()) runs at render time (M10), per
//      guardrail 4 in CLAUDE.md, so the source of truth stays unmodified here.

import type { Brand, BrandKey, Dot, Option, Palette, PaletteKey } from '../types'
import { derivePalette } from '../utils/palette.js'

export const palettes: Record<PaletteKey, Palette> = {
  warmEarthy: { bg: '#f3e9dc', surface: '#fbf6ee', ink: '#2a1c12', sub: '#6f5743', accent: '#a9521f', accentInk: '#fbf6ee', line: '#e6d7c4', hero: '#e7d2b8', display: '"Newsreader", Georgia, serif', dispWeight: 500, dispLs: '-0.6px' },
  bold: { bg: '#ffffff', surface: '#ffffff', ink: '#0d0d0f', sub: '#56565e', accent: '#ea5a16', accentInk: '#ffffff', line: '#ececef', hero: '#1b1b1f', display: '"Manrope", sans-serif', dispWeight: 800, dispLs: '-1.6px' },
  cream: { bg: '#faf7f1', surface: '#ffffff', ink: '#1f1b16', sub: '#7c756a', accent: '#3f3a33', accentInk: '#faf7f1', line: '#ece7dd', hero: '#efeae1', display: '"Newsreader", Georgia, serif', dispWeight: 400, dispLs: '-0.3px' },
  cadence: { bg: '#ffffff', surface: '#f7f8fc', ink: '#0a2540', sub: '#516079', accent: '#635bff', accentInk: '#ffffff', line: '#e7e9f2', hero: '#0a2540', display: '"Manrope", sans-serif', dispWeight: 800, dispLs: '-1.6px' },
  maren: { bg: '#f1efe8', surface: '#fbfaf5', ink: '#27261f', sub: '#6f6d62', accent: '#46503a', accentInk: '#fbfaf5', line: '#e4e0d5', hero: '#e3e6d8', display: '"Newsreader", Georgia, serif', dispWeight: 400, dispLs: '-0.4px' },
}

// Generic three-theme set (the prototype's). Kept as the server's last-resort
// fallback; the brands themselves use the brand-specific moods below.
export const paletteOptions: Option[] = [
  { id: 'warmEarthy', value: 'warmEarthy', vibe: 'Warm earthy', tag: 'Warm, earthy palette', swatch: ['#a9521f', '#e7d2b8', '#2a1c12'] },
  { id: 'bold', value: 'bold', vibe: 'Bold high-contrast', tag: 'Bold high-contrast', swatch: ['#ea5a16', '#1b1b1f', '#ffffff'] },
  { id: 'cream', value: 'cream', vibe: 'Minimal cream', tag: 'Minimal, restrained color', swatch: ['#3f3a33', '#efeae1', '#1f1b16'] },
]

// A brand-specific color mood: full token set derived from a few base colors,
// applied as a paletteTokens patch (same mechanism as the LLM dynamic moods).
// swatch previews accent / hero / ink.
function mood(id: string, vibe: string, tag: string, bg: string, ink: string, accent: string, hero: string, serif: boolean): Option {
  const tokens = derivePalette(bg, ink, accent, hero, serif)
  return { id, value: id, vibe, tag, swatch: [accent, hero, ink], patch: { paletteTokens: tokens } }
}

// Brand-appropriate moods so the palette options always read as THIS brand,
// even offline (guardrail 3). The LLM can still override these live.
const emberMoods: Option[] = [
  mood('warm', 'Warm earthy', 'Warm, earthy roast', '#f3e9dc', '#2a1c12', '#a9521f', '#e7d2b8', true),
  mood('roast', 'Dark roast', 'Deep, roasted, moody', '#211915', '#f3e7d8', '#d2873f', '#3a2a20', true),
  mood('cream', 'Soft cream', 'Pale, restrained, calm', '#faf7f1', '#1f1b16', '#6b4a2f', '#efeae1', true),
]
const cadenceMoods: Option[] = [
  mood('indigo', 'Indigo tech', 'Crisp, indigo, modern', '#ffffff', '#0a2540', '#635bff', '#0a2540', false),
  mood('night', 'Bold dark', 'High-contrast dark mode', '#0d0d12', '#f4f4f8', '#6d6bff', '#1b1b24', false),
  mood('slate', 'Calm slate', 'Soft, slate, focused', '#f6f7fb', '#1f2937', '#2563eb', '#dbe3f4', false),
]
const marenMoods: Option[] = [
  mood('botanical', 'Botanical green', 'Earthy, green, natural', '#f1efe8', '#27261f', '#46503a', '#d8e0cf', true),
  mood('sage', 'Sage & clay', 'Soft sage, herbal', '#eef0e8', '#2b2f24', '#6b7d52', '#dce3cf', true),
  mood('blush', 'Warm blush', 'Quiet, warm, skin-toned', '#f6efe9', '#2e2622', '#a86b5a', '#ecdbd0', true),
]

// The palette dot: n:2, region 'Color & mood', field 'palette'. Options are the
// brand's own moods so the choices reflect the brand by default.
function paletteDot(critique: string, options: Option[], byPersona?: Dot['byPersona']): Dot {
  return { id: 'palette', n: 2, kind: 'palette', region: 'Color & mood', field: 'palette', critique, prompt: 'Recolor the whole page:', options, ...(byPersona ? { byPersona } : {}) }
}

// The hero-layout dot (M12): a second structural reorganizer, independent of the
// page concept. Each option patches `heroLayout` (hero geometry) only. Default
// options are the three geometries; brands with fewer meaningful arrangements
// (Maren) pass their own subset.
const heroLayoutOptions: Option[] = [
  { id: 'split', value: 'split', vibe: 'Side-by-side', tag: 'Split hero', patch: { heroLayout: 'split' } },
  { id: 'centered', value: 'centered', vibe: 'Centered', tag: 'Centered hero', patch: { heroLayout: 'centered' } },
  { id: 'imageFirst', value: 'imageFirst', vibe: 'Image-first', tag: 'Image-first hero', patch: { heroLayout: 'imageFirst' } },
]
function heroLayoutDot(critique: string, byPersona?: Dot['byPersona'], options: Option[] = heroLayoutOptions): Dot {
  return { id: 'heroLayout', n: 8, kind: 'concept', region: 'Hero layout', field: 'heroLayout', critique, prompt: 'Recompose the hero:', options, ...(byPersona ? { byPersona } : {}) }
}

const ember: Brand = {
  key: 'ember', name: 'Ember', category: 'Coffee subscription', url: 'ember.coffee', signup: 'Sign up', palKey: 'warmEarthy',
  desc: 'Warm split-hero magazine — earthy tones, big serif, full-bleed imagery.',
  nav: ['Beans', 'How it works', 'Story'], eyebrow: 'SINGLE-ORIGIN SUBSCRIPTION', ctaSecondary: "See this month's beans",
  defaults: { headline: 'Coffee, delivered.', subhead: 'Single-origin coffee from independent farms, delivered to your door on your schedule.', cta: 'Start your subscription', heroImg: 'Flat-lay of fresh beans', social: 'Trusted by 12,000 home baristas' },
  proof: ['STANDART', 'SPRUDGE', 'KINFOLK'], howLabel: 'THE RITUAL',
  how: [
    { t: 'Pick your roast', d: 'Light, medium, or dark. Change it any time without missing a delivery.' },
    { t: 'We roast to order', d: 'Beans roast the morning they ship. Nothing in your bag is older than 48 hours.' },
    { t: 'Brew & repeat', d: 'Arrives on your schedule. Pause, skip, or speed it up whenever you like.' },
  ],
  featLabel: "THIS MONTH'S SELECTION", featImg: 'bean shot',
  feats: [
    { name: 'Ethiopia Guji', meta: 'Jasmine · peach · honey · Light', tag: '$19' },
    { name: 'Colombia Huila', meta: 'Cocoa · red apple · caramel · Medium', tag: '$18' },
    { name: 'Sumatra Lintong', meta: 'Cedar · dark chocolate · spice · Dark', tag: '$20' },
  ],
  quote: '"I cancelled three subscriptions for this one. The first cup actually tasted like the notes on the bag."', quoteBy: 'Mara K. · subscriber since 2023',
  footBlurb: 'Roasted to order in small batches. Shipped fresh, brewed by you.',
  footCols: [
    { h: 'SHOP', links: ['Subscriptions', 'Single bags', 'Gift cards'] },
    { h: 'COMPANY', links: ['Our farms', 'Roasting', 'Journal'] },
  ],
  dots: [
    {
      id: 'headline', n: 1, kind: 'text', region: 'Hero headline', field: 'headline',
      critique: '"Coffee, delivered." sells the logistics, not the ritual. Lead with mood instead?', prompt: 'Pick a headline direction:',
      byPersona: {
        cd: { critique: 'Every coffee brand can say "delivered." Where is the line only Ember could write?', prompt: 'Find the braver headline:' },
        ceo: { critique: '"Coffee, delivered." could sit on any subscription site. What does this headline claim that rivals cannot?', prompt: 'Stake out a position:' },
        user: { critique: 'I read "Coffee, delivered." and still do not know why this one. What should I take away first?', prompt: 'Say it plainer:' },
      },
      options: [
        { id: 'ritual', value: 'Your best morning, on repeat.', vibe: 'Warm · ritual', tag: 'Warm, ritual-led headlines' },
        { id: 'blunt', value: 'Single-origin. Stupidly fresh.', vibe: 'Playful · blunt', tag: 'Playful, blunt copy' },
        { id: 'premium', value: "The last coffee decision you'll make.", vibe: 'Confident · premium', tag: 'Confident, premium tone' },
      ],
    },
    {
      id: 'subhead', n: 5, kind: 'text', region: 'Subhead voice', field: 'subhead',
      critique: 'The subhead just explains the product. What tone could it set instead?', prompt: 'Rewrite the subhead voice:',
      byPersona: {
        cd: { critique: 'The subhead lists facts where it could set a feeling. What is the line under the line?', prompt: 'Set the tone:' },
        ceo: { critique: 'The subhead describes the product, not why us. What belief should it plant?', prompt: 'Say why us:' },
        user: { critique: 'The subhead mostly repeats the headline in longer words. What would actually tell me more?', prompt: 'Add real detail:' },
      },
      options: [
        { id: 'sensory', value: 'Roasted to order, shipped within a day, and tuned to how you actually brew.', vibe: 'Sensory · specific', tag: 'Sensory, specific copy' },
        { id: 'warm', value: 'A standing invitation to slow down for ten good minutes every morning.', vibe: 'Warm · unhurried', tag: 'Warm, unhurried voice' },
        { id: 'plain', value: 'Great single-origin coffee, on a schedule that suits you. No app required.', vibe: 'Plain · honest', tag: 'Plain-spoken honesty' },
      ],
    },
    {
      id: 'cta', n: 3, kind: 'text', region: 'Primary CTA', field: 'cta',
      critique: '"Start your subscription" is a commitment ask up front. Lower the stakes?', prompt: 'Try a different invitation:',
      byPersona: {
        cd: { critique: '"Start your subscription" is a transaction, not an invitation. What would make the first step feel like a moment?', prompt: 'Reframe the invitation:' },
        ceo: { critique: 'Leading with "subscription" foregrounds commitment over value. What first step fits how people actually decide?', prompt: 'Lower the first step:' },
        user: { critique: '"Start your subscription" feels like signing up for a bill. What could I do that feels lower risk?', prompt: 'Make it feel easy:' },
      },
      options: [
        { id: 'taste', value: "Taste this month's roast", vibe: 'Low-stakes · sensory', tag: 'Low-commitment CTAs' },
        { id: 'ritual', value: 'Build my morning ritual', vibe: 'Aspirational', tag: 'Aspirational CTAs' },
        { id: 'direct', value: 'Start with one bag', vibe: 'Concrete · direct', tag: 'Concrete, direct CTAs' },
      ],
    },
    {
      id: 'image', n: 4, kind: 'text', region: 'Hero image', field: 'heroImg',
      critique: 'A flat-lay of beans is the expected shot. What story should the image tell?', prompt: 'Swap the hero image direction:',
      byPersona: {
        cd: { critique: 'A flat-lay of beans is the stock-photo default. What single image would only make sense for Ember?', prompt: 'Find the one true image:' },
        ceo: { critique: 'The hero image reads as generic specialty coffee. What picture proves our difference at a glance?', prompt: 'Show the difference:' },
        user: { critique: 'I cannot tell what I am buying from a beans flat-lay. What image would show me what I get?', prompt: 'Show me the product:' },
      },
      options: [
        { id: 'pour', value: 'Pour-over in morning light', vibe: 'Ritual moment', tag: 'Lifestyle, in-use imagery' },
        { id: 'farm', value: 'Hands at the origin farm', vibe: 'Provenance', tag: 'Provenance, origin imagery' },
        { id: 'macro', value: 'Macro of a single roasted bean', vibe: 'Craft · macro', tag: 'Product macro imagery' },
      ],
    },
    paletteDot('The mood reads safe and roastery-default. What feeling should the page lead with?', emberMoods, {
      cd: { critique: 'The palette is the expected roastery brown. What mood would feel like Ember and no one else?', prompt: 'Choose a braver mood:' },
      ceo: { critique: 'These colors look like every specialty roaster. What palette signals where we sit in the market?', prompt: 'Set the brand mood:' },
      user: { critique: 'The colors feel calm but generic. What mood would make me trust this at a glance?', prompt: 'Pick the feeling:' },
    }),
    {
      id: 'social', n: 6, kind: 'text', region: 'Social proof', field: 'social',
      critique: '"12,000 home baristas" is a vanity number. Could the proof be quieter and truer?', prompt: 'Choose what to prove:',
      byPersona: {
        cd: { critique: '"12,000 home baristas" is a number everyone claims. What proof would feel distinctly Ember?', prompt: 'Prove it with character:' },
        ceo: { critique: 'A headcount is easy to copy. What proof point reinforces our positioning?', prompt: 'Pick the strategic proof:' },
        user: { critique: 'A big number does not tell me if it is any good. What would make me trust the quality?', prompt: 'Earn my trust:' },
      },
      options: [
        { id: 'press', value: 'Featured in Standart, Sprudge & Monocle', vibe: 'Editorial', tag: 'Editorial credibility' },
        { id: 'rating', value: '4.9 average across 2,300 reviews', vibe: 'Earned · specific', tag: 'Specific, earned proof' },
        { id: 'origin', value: 'Sourced from 9 farms we visit each harvest', vibe: 'Provenance', tag: 'Provenance as proof' },
      ],
    },
    // Page-level concept (M12): each option is a coordinated multi-field patch
    // that reflows the whole page (hero treatment + section order + copy), not a
    // single field. Ember-only, to keep the other brands faithful to the spec.
    {
      id: 'concept', n: 7, kind: 'concept', region: 'Page concept', field: 'concept',
      critique: 'The page is built product-first, but Ember\'s real pull is the ritual and the origins. Should the whole page lead with a different story?',
      prompt: 'Reorganize the page around one idea:',
      byPersona: {
        cd: { critique: 'The page is organized like a catalog. What single idea could the whole layout be built around?', prompt: 'Pick the big idea:' },
        ceo: { critique: 'The structure leads with product, not story. Which narrative best positions Ember?', prompt: 'Lead with the right story:' },
        user: { critique: 'The page jumps between things. What one idea should the whole page be about?', prompt: 'Make it about one thing:' },
      },
      options: [
        {
          id: 'product', value: 'product-led', vibe: 'Product-led', tag: 'Product-led layout',
          patch: { concept: 'product-led', heroLayout: 'split', headline: 'This month, three fresh roasts.', subhead: 'A rotating selection of single-origin coffees, picked and roasted to order.', heroImg: "This month's lineup", social: '4.9 average across 2,300 reviews' },
        },
        {
          id: 'ritual', value: 'ritual-led', vibe: 'Ritual-led', tag: 'Ritual-led layout',
          patch: { concept: 'ritual-led', heroLayout: 'centered', headline: 'Your best morning, on repeat.', subhead: 'A standing invitation to slow down for ten good minutes every day.', heroImg: 'Pour-over in morning light', social: 'Trusted by 12,000 home baristas' },
        },
        {
          id: 'origin', value: 'origin-led', vibe: 'Origin-led', tag: 'Origin-led layout',
          patch: { concept: 'origin-led', heroLayout: 'imageFirst', headline: 'A farm behind every bag.', subhead: 'Sourced from nine farms we visit each harvest, roasted the morning it ships.', heroImg: 'Hands at the origin farm', social: 'Sourced from 9 farms we visit each harvest' },
        },
      ],
    },
    heroLayoutDot(
      'The hero runs copy beside an image, but the beans are the draw. Should the image carry more of the hero?',
      {
        cd: { critique: 'The hero splits attention evenly between words and image. Which composition should lead the eye?', prompt: 'Recompose the hero:' },
        ceo: { critique: 'The hero treatment is conventional. Which arrangement makes the strongest first impression?', prompt: 'Set the hero composition:' },
        user: { critique: 'The top of the page is a bit flat. How should the hero be laid out?', prompt: 'Lay out the hero:' },
      },
    ),
  ],
}

const cadence: Brand = {
  key: 'cadence', name: 'Cadence', category: 'Productivity app', url: 'cadence.app', signup: 'Start free', palKey: 'cadence',
  desc: 'Stripe-like tech page — gradient hero, a floating product UI, structured grid.',
  nav: ['Product', 'Solutions', 'Pricing'], eyebrow: 'FOCUS, PLANNED FOR YOU', ctaSecondary: 'Watch the tour',
  defaults: { headline: 'Plan less. Do more.', subhead: "Cadence turns scattered tasks into one calm timeline you'll actually follow — no setup, no clutter.", cta: 'Start free', heroImg: 'timeline', social: 'Powering focused teams at' },
  proof: ['VERSAL', 'NIMBUS', 'OUTSET', 'LATTICE'], howLabel: 'FEATURES',
  how: [], featLabel: 'FEATURES', featImg: 'screen',
  feats: [
    { name: 'Auto timeboxing', meta: 'Every task gets a slot that fits your real calendar — no dragging required.', tag: 'Core' },
    { name: 'Focus mode', meta: 'Hides everything but the one thing you are meant to be doing right now.', tag: 'Core' },
    { name: 'Weekly review', meta: 'A two-minute recap that quietly tunes next week around how you actually work.', tag: 'Pro' },
  ],
  stats: [
    { v: '6 hrs', k: 'reclaimed every week, on average' },
    { v: '40,000', k: 'teams plan their week in Cadence' },
    { v: '4.8★', k: 'across 2,300 reviews' },
  ],
  quote: '"I stopped dreading Mondays. The week just… runs now."', quoteBy: 'Dev S. · engineering lead',
  footBlurb: 'The calm operating system for your week. Made for people with too much to do.',
  footCols: [
    { h: 'PRODUCT', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
    { h: 'COMPANY', links: ['About', 'Careers', 'Blog'] },
  ],
  dots: [
    {
      id: 'headline', n: 1, kind: 'text', region: 'Hero headline', field: 'headline',
      critique: '"Plan less. Do more." is a productivity cliché. Say what is actually different?', prompt: 'Pick a headline direction:',
      byPersona: {
        cd: { critique: '"Plan less. Do more." is the category cliche. Where is the line only Cadence could own?', prompt: 'Find the braver headline:' },
        ceo: { critique: '"Plan less. Do more." could be any productivity app. What does this claim that rivals cannot?', prompt: 'Stake out a position:' },
        user: { critique: 'I have seen "Plan less. Do more." everywhere. What would tell me what this actually does?', prompt: 'Say it plainer:' },
      },
      options: [
        { id: 'outcome', value: 'Your week, already planned.', vibe: 'Outcome · calm', tag: 'Outcome-led headlines' },
        { id: 'contra', value: 'Stop managing tasks. Start finishing them.', vibe: 'Contrarian', tag: 'Contrarian, punchy copy' },
        { id: 'cat', value: 'The to-do list that plans itself.', vibe: 'Concrete · category', tag: 'Category-defining lines' },
      ],
    },
    {
      id: 'subhead', n: 5, kind: 'text', region: 'Subhead voice', field: 'subhead',
      critique: 'The subhead lists features. Could it promise a feeling?', prompt: 'Rewrite the subhead voice:',
      byPersona: {
        cd: { critique: 'The subhead lists mechanics where it could promise relief. What is the feeling under the feature?', prompt: 'Set the tone:' },
        ceo: { critique: 'The subhead explains how, not why us. What outcome should it own?', prompt: 'Lead with the outcome:' },
        user: { critique: 'The subhead tells me how it works before I know why I would care. What is in it for me?', prompt: 'Tell me the payoff:' },
      },
      options: [
        { id: 'vivid', value: 'Open Cadence and your whole week is already laid out, hour by hour.', vibe: 'Concrete · vivid', tag: 'Concrete, vivid copy' },
        { id: 'benefit', value: 'Less time deciding what to do, more time actually doing it.', vibe: 'Benefit-led', tag: 'Benefit-led voice' },
        { id: 'mech', value: 'It reads your calendar, ranks your work, and tells you what is next.', vibe: 'Mechanism · plain', tag: 'Plain mechanism copy' },
      ],
    },
    {
      id: 'cta', n: 3, kind: 'text', region: 'Primary CTA', field: 'cta',
      critique: '"Start free" is on every SaaS site. Make the first step feel lighter?', prompt: 'Try a different invitation:',
      byPersona: {
        cd: { critique: '"Start free" is the SaaS default. What first step would feel like Cadence, not a signup?', prompt: 'Reframe the invitation:' },
        ceo: { critique: '"Start free" competes on price, not value. What first step signals the outcome?', prompt: 'Lower the first step:' },
        user: { critique: '"Start free" makes me wonder what is not free. What could I try with no strings?', prompt: 'Make it feel easy:' },
      },
      options: [
        { id: 'plan', value: 'Plan my week', vibe: 'Action · concrete', tag: 'Action-oriented CTAs' },
        { id: 'see', value: 'See my day in Cadence', vibe: 'Show-me', tag: 'Show-me CTAs' },
        { id: 'today', value: "Try it on today's tasks", vibe: 'Low-stakes', tag: 'Low-stakes CTAs' },
      ],
    },
    {
      id: 'image', n: 4, kind: 'text', region: 'Hero product UI', field: 'heroImg',
      critique: 'The mock shows a generic timeline. What view would prove the value fastest?', prompt: 'Swap the hero UI focus:',
      byPersona: {
        cd: { critique: 'A generic timeline mock looks like every planner. What one view feels unmistakably Cadence?', prompt: 'Find the one true view:' },
        ceo: { critique: 'The mock could be any calendar app. What screen proves our difference at a glance?', prompt: 'Show the difference:' },
        user: { critique: 'I cannot tell what the app does from this mock. What view would show me the point?', prompt: 'Show me it working:' },
      },
      options: [
        { id: 'timeline', value: 'timeline', vibe: 'Day timeline', tag: 'Timeline-first UI' },
        { id: 'focus', value: 'focus mode', vibe: 'One task, in focus', tag: 'Focus-mode UI' },
        { id: 'review', value: 'weekly review', vibe: 'Weekly recap', tag: 'Review-first UI' },
      ],
    },
    paletteDot('It reads like every other dev tool — deep indigo and techy. Lead with a different feeling?', cadenceMoods, {
      cd: { critique: 'Deep indigo reads like every dev tool. What mood would make Cadence feel calmer than the rest?', prompt: 'Choose a braver mood:' },
      ceo: { critique: 'The palette looks like generic SaaS. What colors signal a calmer category?', prompt: 'Set the brand mood:' },
      user: { critique: 'The colors feel techy and cold. What mood would make this feel calm to use?', prompt: 'Pick the feeling:' },
    }),
    {
      id: 'social', n: 6, kind: 'text', region: 'Social proof', field: 'social',
      critique: 'A logo wall says nothing specific. Prove the outcome instead?', prompt: 'Choose what to prove:',
      byPersona: {
        cd: { critique: 'A logo wall is the trust cliche. What proof would feel specific to Cadence?', prompt: 'Prove it with character:' },
        ceo: { critique: 'Logos borrow other companies trust. What proof point reinforces our positioning?', prompt: 'Pick the strategic proof:' },
        user: { critique: 'Logos do not tell me it works for me. What would make me trust it?', prompt: 'Earn my trust:' },
      },
      options: [
        { id: 'press', value: 'As featured in The Verge & Sifted', vibe: 'Editorial', tag: 'Editorial credibility' },
        { id: 'hours', value: 'Members reclaim 6 hours a week', vibe: 'Outcome · specific', tag: 'Specific outcome proof' },
        { id: 'team', value: 'Built by the team behind tools you use daily', vibe: 'Credibility', tag: 'Maker credibility' },
      ],
    },
    // Page-level concept (M12): reflows the hero treatment + feature/stats order.
    {
      id: 'concept', n: 7, kind: 'concept', region: 'Page concept', field: 'concept',
      critique: 'The page leads with features, but Cadence sells a calmer week. Should it lead with the outcome or the makers instead?',
      prompt: 'Reframe the whole page:',
      byPersona: {
        cd: { critique: 'The page is built like a feature list. What single idea could the layout be built around?', prompt: 'Pick the big idea:' },
        ceo: { critique: 'The structure leads with features, not the outcome. Which story best positions Cadence?', prompt: 'Lead with the right story:' },
        user: { critique: 'The page lists a lot of features. What one idea should it be about?', prompt: 'Make it about one thing:' },
      },
      options: [
        { id: 'feature', value: 'product-led', vibe: 'Feature-led', tag: 'Feature-led layout', patch: { concept: 'product-led', heroLayout: 'split', headline: 'Plan less. Do more.', subhead: 'Cadence turns scattered tasks into one calm timeline you will actually follow.', heroImg: 'timeline', social: 'Powering focused teams at' } },
        { id: 'outcome', value: 'ritual-led', vibe: 'Outcome-led', tag: 'Outcome-led layout', patch: { concept: 'ritual-led', heroLayout: 'centered', headline: 'Get six hours back every week.', subhead: 'Let Cadence plan the week around you, and reclaim the time you spend deciding.', heroImg: 'weekly review', social: 'Members reclaim 6 hours a week' } },
        { id: 'maker', value: 'origin-led', vibe: 'Maker-led', tag: 'Maker-led layout', patch: { concept: 'origin-led', heroLayout: 'imageFirst', headline: 'Built by people with too much to do.', subhead: 'Made by a small team who needed a calmer week, then shipped the tool that gave it.', heroImg: 'focus mode', social: 'Built by the team behind tools you use daily' } },
      ],
    },
    heroLayoutDot(
      'The hero puts the product mock beside the pitch. Should the screenshot lead, or the page center on the promise?',
      {
        cd: { critique: 'The hero balances copy and the product shot evenly. Which composition should command the fold?', prompt: 'Recompose the hero:' },
        ceo: { critique: 'The hero treatment is the default SaaS split. Which arrangement sells the product fastest?', prompt: 'Set the hero composition:' },
        user: { critique: 'It is not obvious where to look first up top. How should the hero be arranged?', prompt: 'Lay out the hero:' },
      },
    ),
  ],
}

const maren: Brand = {
  key: 'maren', name: 'Maren', nameCaps: 'MAREN', category: 'Botanical skincare', url: 'maren.co', signup: 'Shop', palKey: 'maren',
  desc: 'Versed-like editorial — airy cream, centered serif, a big full-bleed image.',
  nav: ['Shop', 'Ingredients', 'Journal'], eyebrow: 'CLINICAL BOTANICAL SKINCARE', ctaSecondary: 'Take the skin quiz',
  defaults: { headline: 'Skincare, quietly effective.', subhead: "Five essentials, nothing you don't need — formulated with clinicians and made in small batches.", cta: 'Build your routine', heroImg: 'Product still life', social: 'Recommended by 200+ dermatologists' },
  proof: ['VOGUE', 'BYRDIE', 'GOOP'], howLabel: 'THE ROUTINE',
  how: [
    { t: 'Cleanse', d: 'A gentle gel that respects your barrier and rinses completely clean.' },
    { t: 'Treat', d: 'One serum, chosen for your skin — not a shelf of half-used bottles.' },
    { t: 'Protect', d: 'A weightless moisturiser and SPF that actually feels like nothing.' },
  ],
  featLabel: 'THE ESSENTIALS', featImg: 'product',
  feats: [
    { name: 'The Cleanser', meta: 'Amino-acid gel · all skin types', tag: '$28' },
    { name: 'The Serum', meta: 'Niacinamide + bakuchiol', tag: '$46' },
    { name: 'The Cream', meta: 'Squalane + oat barrier repair', tag: '$38' },
  ],
  quote: '"My routine went from twelve steps to five — and my skin has never looked better."', quoteBy: 'Priya N. · customer since 2022',
  footFlat: ['© Maren', 'Ingredients', 'Sustainability', 'Stockists', 'Contact'],
  dots: [
    {
      id: 'headline', n: 1, kind: 'text', region: 'Hero headline', field: 'headline',
      critique: '"Skincare, quietly effective." is pretty but vague. Anchor it in a benefit?', prompt: 'Pick a headline direction:',
      byPersona: {
        cd: { critique: '"Skincare, quietly effective." is pretty but safe. Where is the line only Maren could write?', prompt: 'Find the braver headline:' },
        ceo: { critique: '"Skincare, quietly effective." could be any clean brand. What does it claim that rivals cannot?', prompt: 'Stake out a position:' },
        user: { critique: '"Skincare, quietly effective." sounds nice but vague. What would tell me what it does for me?', prompt: 'Say it plainer:' },
      },
      options: [
        { id: 'blunt', value: 'Five products. Better skin.', vibe: 'Minimal · blunt', tag: 'Minimal, blunt headlines' },
        { id: 'relief', value: 'The whole routine, finally simplified.', vibe: 'Relief · promise', tag: 'Relief-led promise' },
        { id: 'premium', value: 'Clinically proven. Quietly luxurious.', vibe: 'Premium · proof', tag: 'Premium, proof-led tone' },
      ],
    },
    {
      id: 'subhead', n: 5, kind: 'text', region: 'Subhead voice', field: 'subhead',
      critique: 'The subhead sells simplicity. Could it sell trust?', prompt: 'Rewrite the subhead voice:',
      byPersona: {
        cd: { critique: 'The subhead sells simplicity where it could sell conviction. What is the line under the line?', prompt: 'Set the tone:' },
        ceo: { critique: 'The subhead describes the range, not why us. What belief should it plant?', prompt: 'Say why us:' },
        user: { critique: 'The subhead says simple, but I still do not know if it works. What would reassure me?', prompt: 'Add real detail:' },
      },
      options: [
        { id: 'clinical', value: 'Dermatologist-formulated, fragrance-free, and proven in independent testing.', vibe: 'Clinical · trust', tag: 'Clinical, trust-led copy' },
        { id: 'edit', value: 'The five things your skin actually needs — and nothing it does not.', vibe: 'Editing · clarity', tag: 'Clarity-led editing' },
        { id: 'craft', value: 'Made in small batches with ingredients you can pronounce.', vibe: 'Honest · craft', tag: 'Honest, craft voice' },
      ],
    },
    {
      id: 'cta', n: 3, kind: 'text', region: 'Primary CTA', field: 'cta',
      critique: '"Build your routine" sounds like work. Make it feel effortless?', prompt: 'Try a different invitation:',
      byPersona: {
        cd: { critique: '"Build your routine" sounds like effort. What first step would feel like Maren, not homework?', prompt: 'Reframe the invitation:' },
        ceo: { critique: '"Build your routine" asks for effort before trust. What first step fits how people decide?', prompt: 'Lower the first step:' },
        user: { critique: '"Build your routine" sounds like work I have to do. What could I do that feels easy?', prompt: 'Make it feel easy:' },
      },
      options: [
        { id: 'find', value: 'Find my five', vibe: 'Personal · light', tag: 'Personal, light CTAs' },
        { id: 'shop', value: 'Shop the essentials', vibe: 'Direct', tag: 'Direct CTAs' },
        { id: 'quiz', value: 'Take the 60-second quiz', vibe: 'Guided · low-effort', tag: 'Guided, low-effort CTAs' },
      ],
    },
    {
      id: 'image', n: 4, kind: 'text', region: 'Hero image', field: 'heroImg',
      critique: 'A flat still life is the beauty default. What feels more Maren?', prompt: 'Swap the hero image direction:',
      byPersona: {
        cd: { critique: 'A flat still life is the beauty default. What single image would only make sense for Maren?', prompt: 'Find the one true image:' },
        ceo: { critique: 'The still life reads as generic clean beauty. What image proves our difference at a glance?', prompt: 'Show the difference:' },
        user: { critique: 'A still life does not show me what it is like to use. What image would?', prompt: 'Show me it in use:' },
      },
      options: [
        { id: 'still', value: 'Product still life', vibe: 'Classic catalogue', tag: 'Catalogue imagery' },
        { id: 'texture', value: 'Texture macro — the cream itself', vibe: 'Sensory · tactile', tag: 'Tactile, sensory imagery' },
        { id: 'skin', value: 'On real skin, morning light', vibe: 'Honest · in-use', tag: 'Honest, in-use imagery' },
      ],
    },
    paletteDot('The palette is safe spa-beige. What mood should the brand own?', marenMoods, {
      cd: { critique: 'Spa-beige is the wellness default. What mood would feel like Maren and no one else?', prompt: 'Choose a braver mood:' },
      ceo: { critique: 'The palette looks like every clean brand. What colors signal where we sit in the market?', prompt: 'Set the brand mood:' },
      user: { critique: 'The colors feel calm but generic. What mood would make me trust this at a glance?', prompt: 'Pick the feeling:' },
    }),
    {
      id: 'social', n: 6, kind: 'text', region: 'Social proof', field: 'social',
      critique: '"200+ dermatologists" leans on authority. Is there warmer proof?', prompt: 'Choose what to prove:',
      options: [
        { id: 'reviews', value: '4.8 from 11,000 verified reviews', vibe: 'Earned · specific', tag: 'Specific review proof' },
        { id: 'result', value: '92% saw calmer skin in four weeks', vibe: 'Outcome · clinical', tag: 'Clinical outcome proof' },
        { id: 'press', value: 'As seen in Vogue, Byrdie & Goop', vibe: 'Editorial', tag: 'Editorial credibility' },
      ],
      byPersona: {
        cd: { critique: '"200+ dermatologists" is borrowed authority. What proof would feel distinctly Maren?', prompt: 'Prove it with character:' },
        ceo: { critique: 'A dermatologist count leans on authority. What proof reinforces our positioning?', prompt: 'Pick the strategic proof:' },
        user: { critique: 'A dermatologist count does not tell me it worked for someone like me. What would?', prompt: 'Earn my trust:' },
      },
    },
    // Page-level concept (M12): reflows the hero treatment + section order.
    {
      id: 'concept', n: 7, kind: 'concept', region: 'Page concept', field: 'concept',
      critique: "The page leads with the product range, but Maren's pull is the ritual and the proof. Should it lead with a different story?",
      prompt: 'Reorganize the page:',
      byPersona: {
        cd: { critique: 'The page is built like a product range. What single idea could the layout be built around?', prompt: 'Pick the big idea:' },
        ceo: { critique: 'The structure leads with products, not story. Which narrative best positions Maren?', prompt: 'Lead with the right story:' },
        user: { critique: 'The page shows a lot of products. What one idea should it be about?', prompt: 'Make it about one thing:' },
      },
      options: [
        { id: 'essentials', value: 'product-led', vibe: 'Essentials-led', tag: 'Essentials-led layout', patch: { concept: 'product-led', heroLayout: 'centered', headline: 'Five essentials. Better skin.', subhead: 'A short, considered routine of five products and nothing you do not need.', heroImg: 'Product still life', social: 'Recommended by 200+ dermatologists' } },
        { id: 'ritual', value: 'ritual-led', vibe: 'Ritual-led', tag: 'Ritual-led layout', patch: { concept: 'ritual-led', heroLayout: 'centered', headline: 'A quiet routine that works.', subhead: 'Three calm steps, morning and night, that your skin will actually keep up with.', heroImg: 'On real skin, morning light', social: '4.8 from 11,000 verified reviews' } },
        { id: 'proof', value: 'origin-led', vibe: 'Proof-led', tag: 'Proof-led layout', patch: { concept: 'origin-led', heroLayout: 'imageFirst', headline: 'Clinically proven, quietly made.', subhead: 'Dermatologist formulated, fragrance free, and proven in independent testing.', heroImg: 'Texture macro, the cream itself', social: '92% saw calmer skin in four weeks' } },
      ],
    },
    heroLayoutDot(
      'The hero stacks copy above an inset image. Should the image run edge-to-edge and lead the page instead?',
      {
        cd: { critique: 'The hero keeps the image politely contained. Would a full-bleed, image-first opening feel more editorial?', prompt: 'Recompose the hero:' },
        ceo: { critique: 'The hero is restrained to the point of quiet. Which composition best frames the brand?', prompt: 'Set the hero composition:' },
        user: { critique: 'The opening image feels small and boxed in. How should the hero be arranged?', prompt: 'Lay out the hero:' },
      },
      [
        { id: 'centered', value: 'centered', vibe: 'Centered', tag: 'Centered, inset image', patch: { heroLayout: 'centered' } },
        { id: 'imageFirst', value: 'imageFirst', vibe: 'Image-first', tag: 'Full-bleed, image-first', patch: { heroLayout: 'imageFirst' } },
      ],
    ),
  ],
}

export const brands: Record<BrandKey, Brand> = { ember, cadence, maren }

export const brandOrder: BrandKey[] = ['ember', 'cadence', 'maren']
