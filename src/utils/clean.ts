// Em/en dash scrub. Guardrail 4 in CLAUDE.md: never render an em or en dash.
// Run this on every critique, prompt, option label, and piece of chrome copy,
// including text lifted from the prototype.
export const clean = (s: string): string => s.replace(/\s*[—–]\s*/g, ', ')
