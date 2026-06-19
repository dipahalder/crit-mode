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

export const palettes: Record<PaletteKey, Palette> = {
  warmEarthy: { bg: '#f3e9dc', surface: '#fbf6ee', ink: '#2a1c12', sub: '#6f5743', accent: '#a9521f', accentInk: '#fbf6ee', line: '#e6d7c4', hero: '#e7d2b8', display: '"Newsreader", Georgia, serif', dispWeight: 500, dispLs: '-0.6px' },
  bold: { bg: '#ffffff', surface: '#ffffff', ink: '#0d0d0f', sub: '#56565e', accent: '#ea5a16', accentInk: '#ffffff', line: '#ececef', hero: '#1b1b1f', display: '"Manrope", sans-serif', dispWeight: 800, dispLs: '-1.6px' },
  cream: { bg: '#faf7f1', surface: '#ffffff', ink: '#1f1b16', sub: '#7c756a', accent: '#3f3a33', accentInk: '#faf7f1', line: '#ece7dd', hero: '#efeae1', display: '"Newsreader", Georgia, serif', dispWeight: 400, dispLs: '-0.3px' },
  cadence: { bg: '#ffffff', surface: '#f7f8fc', ink: '#0a2540', sub: '#516079', accent: '#635bff', accentInk: '#ffffff', line: '#e7e9f2', hero: '#0a2540', display: '"Manrope", sans-serif', dispWeight: 800, dispLs: '-1.6px' },
  maren: { bg: '#f1efe8', surface: '#fbfaf5', ink: '#27261f', sub: '#6f6d62', accent: '#46503a', accentInk: '#fbfaf5', line: '#e4e0d5', hero: '#e3e6d8', display: '"Newsreader", Georgia, serif', dispWeight: 400, dispLs: '-0.4px' },
}

export const paletteOptions: Option[] = [
  { id: 'warmEarthy', value: 'warmEarthy', vibe: 'Warm earthy', tag: 'Warm, earthy palette', swatch: ['#a9521f', '#e7d2b8', '#2a1c12'] },
  { id: 'bold', value: 'bold', vibe: 'Bold high-contrast', tag: 'Bold high-contrast', swatch: ['#ea5a16', '#1b1b1f', '#ffffff'] },
  { id: 'cream', value: 'cream', vibe: 'Minimal cream', tag: 'Minimal, restrained color', swatch: ['#3f3a33', '#efeae1', '#1f1b16'] },
]

// The palette dot is identical across brands except for its critique, mirroring
// mkPaletteDot() in the prototype. n:2, region 'Color & mood', field 'palette'.
function paletteDot(critique: string): Dot {
  return { id: 'palette', n: 2, kind: 'palette', region: 'Color & mood', field: 'palette', critique, prompt: 'Recolor the whole page:', options: paletteOptions }
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
      options: [
        { id: 'ritual', value: 'Your best morning, on repeat.', vibe: 'Warm · ritual', tag: 'Warm, ritual-led headlines' },
        { id: 'blunt', value: 'Single-origin. Stupidly fresh.', vibe: 'Playful · blunt', tag: 'Playful, blunt copy' },
        { id: 'premium', value: "The last coffee decision you'll make.", vibe: 'Confident · premium', tag: 'Confident, premium tone' },
      ],
    },
    {
      id: 'subhead', n: 5, kind: 'text', region: 'Subhead voice', field: 'subhead',
      critique: 'The subhead just explains the product. What tone could it set instead?', prompt: 'Rewrite the subhead voice:',
      options: [
        { id: 'sensory', value: 'Roasted to order, shipped within a day, and tuned to how you actually brew.', vibe: 'Sensory · specific', tag: 'Sensory, specific copy' },
        { id: 'warm', value: 'A standing invitation to slow down for ten good minutes every morning.', vibe: 'Warm · unhurried', tag: 'Warm, unhurried voice' },
        { id: 'plain', value: 'Great single-origin coffee, on a schedule that suits you. No app required.', vibe: 'Plain · honest', tag: 'Plain-spoken honesty' },
      ],
    },
    {
      id: 'cta', n: 3, kind: 'text', region: 'Primary CTA', field: 'cta',
      critique: '"Start your subscription" is a commitment ask up front. Lower the stakes?', prompt: 'Try a different invitation:',
      options: [
        { id: 'taste', value: "Taste this month's roast", vibe: 'Low-stakes · sensory', tag: 'Low-commitment CTAs' },
        { id: 'ritual', value: 'Build my morning ritual', vibe: 'Aspirational', tag: 'Aspirational CTAs' },
        { id: 'direct', value: 'Start with one bag', vibe: 'Concrete · direct', tag: 'Concrete, direct CTAs' },
      ],
    },
    {
      id: 'image', n: 4, kind: 'text', region: 'Hero image', field: 'heroImg',
      critique: 'A flat-lay of beans is the expected shot. What story should the image tell?', prompt: 'Swap the hero image direction:',
      options: [
        { id: 'pour', value: 'Pour-over in morning light', vibe: 'Ritual moment', tag: 'Lifestyle, in-use imagery' },
        { id: 'farm', value: 'Hands at the origin farm', vibe: 'Provenance', tag: 'Provenance, origin imagery' },
        { id: 'macro', value: 'Macro of a single roasted bean', vibe: 'Craft · macro', tag: 'Product macro imagery' },
      ],
    },
    paletteDot('The mood reads safe and roastery-default. What feeling should the page lead with?'),
    {
      id: 'social', n: 6, kind: 'text', region: 'Social proof', field: 'social',
      critique: '"12,000 home baristas" is a vanity number. Could the proof be quieter and truer?', prompt: 'Choose what to prove:',
      options: [
        { id: 'press', value: 'Featured in Standart, Sprudge & Monocle', vibe: 'Editorial', tag: 'Editorial credibility' },
        { id: 'rating', value: '4.9 average across 2,300 reviews', vibe: 'Earned · specific', tag: 'Specific, earned proof' },
        { id: 'origin', value: 'Sourced from 9 farms we visit each harvest', vibe: 'Provenance', tag: 'Provenance as proof' },
      ],
    },
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
      options: [
        { id: 'outcome', value: 'Your week, already planned.', vibe: 'Outcome · calm', tag: 'Outcome-led headlines' },
        { id: 'contra', value: 'Stop managing tasks. Start finishing them.', vibe: 'Contrarian', tag: 'Contrarian, punchy copy' },
        { id: 'cat', value: 'The to-do list that plans itself.', vibe: 'Concrete · category', tag: 'Category-defining lines' },
      ],
    },
    {
      id: 'subhead', n: 5, kind: 'text', region: 'Subhead voice', field: 'subhead',
      critique: 'The subhead lists features. Could it promise a feeling?', prompt: 'Rewrite the subhead voice:',
      options: [
        { id: 'vivid', value: 'Open Cadence and your whole week is already laid out, hour by hour.', vibe: 'Concrete · vivid', tag: 'Concrete, vivid copy' },
        { id: 'benefit', value: 'Less time deciding what to do, more time actually doing it.', vibe: 'Benefit-led', tag: 'Benefit-led voice' },
        { id: 'mech', value: 'It reads your calendar, ranks your work, and tells you what is next.', vibe: 'Mechanism · plain', tag: 'Plain mechanism copy' },
      ],
    },
    {
      id: 'cta', n: 3, kind: 'text', region: 'Primary CTA', field: 'cta',
      critique: '"Start free" is on every SaaS site. Make the first step feel lighter?', prompt: 'Try a different invitation:',
      options: [
        { id: 'plan', value: 'Plan my week', vibe: 'Action · concrete', tag: 'Action-oriented CTAs' },
        { id: 'see', value: 'See my day in Cadence', vibe: 'Show-me', tag: 'Show-me CTAs' },
        { id: 'today', value: "Try it on today's tasks", vibe: 'Low-stakes', tag: 'Low-stakes CTAs' },
      ],
    },
    {
      id: 'image', n: 4, kind: 'text', region: 'Hero product UI', field: 'heroImg',
      critique: 'The mock shows a generic timeline. What view would prove the value fastest?', prompt: 'Swap the hero UI focus:',
      options: [
        { id: 'timeline', value: 'timeline', vibe: 'Day timeline', tag: 'Timeline-first UI' },
        { id: 'focus', value: 'focus mode', vibe: 'One task, in focus', tag: 'Focus-mode UI' },
        { id: 'review', value: 'weekly review', vibe: 'Weekly recap', tag: 'Review-first UI' },
      ],
    },
    paletteDot('It reads like every other dev tool — deep indigo and techy. Lead with a different feeling?'),
    {
      id: 'social', n: 6, kind: 'text', region: 'Social proof', field: 'social',
      critique: 'A logo wall says nothing specific. Prove the outcome instead?', prompt: 'Choose what to prove:',
      options: [
        { id: 'press', value: 'As featured in The Verge & Sifted', vibe: 'Editorial', tag: 'Editorial credibility' },
        { id: 'hours', value: 'Members reclaim 6 hours a week', vibe: 'Outcome · specific', tag: 'Specific outcome proof' },
        { id: 'team', value: 'Built by the team behind tools you use daily', vibe: 'Credibility', tag: 'Maker credibility' },
      ],
    },
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
      options: [
        { id: 'blunt', value: 'Five products. Better skin.', vibe: 'Minimal · blunt', tag: 'Minimal, blunt headlines' },
        { id: 'relief', value: 'The whole routine, finally simplified.', vibe: 'Relief · promise', tag: 'Relief-led promise' },
        { id: 'premium', value: 'Clinically proven. Quietly luxurious.', vibe: 'Premium · proof', tag: 'Premium, proof-led tone' },
      ],
    },
    {
      id: 'subhead', n: 5, kind: 'text', region: 'Subhead voice', field: 'subhead',
      critique: 'The subhead sells simplicity. Could it sell trust?', prompt: 'Rewrite the subhead voice:',
      options: [
        { id: 'clinical', value: 'Dermatologist-formulated, fragrance-free, and proven in independent testing.', vibe: 'Clinical · trust', tag: 'Clinical, trust-led copy' },
        { id: 'edit', value: 'The five things your skin actually needs — and nothing it does not.', vibe: 'Editing · clarity', tag: 'Clarity-led editing' },
        { id: 'craft', value: 'Made in small batches with ingredients you can pronounce.', vibe: 'Honest · craft', tag: 'Honest, craft voice' },
      ],
    },
    {
      id: 'cta', n: 3, kind: 'text', region: 'Primary CTA', field: 'cta',
      critique: '"Build your routine" sounds like work. Make it feel effortless?', prompt: 'Try a different invitation:',
      options: [
        { id: 'find', value: 'Find my five', vibe: 'Personal · light', tag: 'Personal, light CTAs' },
        { id: 'shop', value: 'Shop the essentials', vibe: 'Direct', tag: 'Direct CTAs' },
        { id: 'quiz', value: 'Take the 60-second quiz', vibe: 'Guided · low-effort', tag: 'Guided, low-effort CTAs' },
      ],
    },
    {
      id: 'image', n: 4, kind: 'text', region: 'Hero image', field: 'heroImg',
      critique: 'A flat still life is the beauty default. What feels more Maren?', prompt: 'Swap the hero image direction:',
      options: [
        { id: 'still', value: 'Product still life', vibe: 'Classic catalogue', tag: 'Catalogue imagery' },
        { id: 'texture', value: 'Texture macro — the cream itself', vibe: 'Sensory · tactile', tag: 'Tactile, sensory imagery' },
        { id: 'skin', value: 'On real skin, morning light', vibe: 'Honest · in-use', tag: 'Honest, in-use imagery' },
      ],
    },
    paletteDot('The palette is safe spa-beige. What mood should the brand own?'),
    {
      id: 'social', n: 6, kind: 'text', region: 'Social proof', field: 'social',
      critique: '"200+ dermatologists" leans on authority. Is there warmer proof?', prompt: 'Choose what to prove:',
      options: [
        { id: 'reviews', value: '4.8 from 11,000 verified reviews', vibe: 'Earned · specific', tag: 'Specific review proof' },
        { id: 'result', value: '92% saw calmer skin in four weeks', vibe: 'Outcome · clinical', tag: 'Clinical outcome proof' },
        { id: 'press', value: 'As seen in Vogue, Byrdie & Goop', vibe: 'Editorial', tag: 'Editorial credibility' },
      ],
    },
  ],
}

export const brands: Record<BrandKey, Brand> = { ember, cadence, maren }

export const brandOrder: BrandKey[] = ['ember', 'cadence', 'maren']
