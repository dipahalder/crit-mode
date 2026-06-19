// Client-side palette derivation, mirroring derivePalette() in server/index.ts.
// Given a few base colors we build the full token set (surface, sub, line,
// accentInk, display family) by color math, so any mood, authored or LLM
// suggested, recolors the page correctly and consistently.
import type { Palette } from '../types'

function toRgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
}
function toHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')
}
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = toRgb(a)
  const [br, bg, bb] = toRgb(b)
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t)
}
function luminance(h: string): number {
  const [r, g, b] = toRgb(h).map((x) => x / 255)
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

// bg = page background, ink = body text, accent = buttons/highlights, hero =
// image tint. serif picks the brand serif vs the sans display family.
export function derivePalette(bg: string, ink: string, accent: string, hero: string, serif: boolean): Palette {
  return {
    bg,
    surface: mix(bg, '#ffffff', 0.5),
    ink,
    sub: mix(ink, bg, 0.42),
    accent,
    accentInk: luminance(accent) > 0.5 ? ink : '#ffffff',
    line: mix(ink, bg, 0.82),
    hero,
    display: serif ? '"Newsreader", Georgia, serif' : '"Manrope", sans-serif',
    dispWeight: serif ? 500 : 800,
    dispLs: serif ? '-0.4px' : '-1.4px',
  }
}
