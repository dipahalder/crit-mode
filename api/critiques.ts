import type { VercelRequest, VercelResponse } from '@vercel/node'

// Production endpoint for the LLM-chosen critiques (M14), served by Vercel as a
// serverless function. It reuses server/core (the same logic the local Express
// proxy uses) and reads ANTHROPIC_API_KEY from the project's environment so the
// key stays server-side. Reliability first: any failure returns the static dots.
// vercel.json rewrites /critiques to /api/critiques so the client URL is stable.
//
// Core is loaded with a dynamic import inside the handler so an import/runtime
// error surfaces as JSON we can read, instead of an opaque FUNCTION_INVOCATION
// crash.

// The LLM round can take longer than the 10s Hobby default; allow up to 60s.
export const config = { maxDuration: 60 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let core: typeof import('../server/core')
  try {
    core = await import('../server/core')
  } catch (e) {
    return res.status(500).json({ error: 'core import failed', message: String((e as Error)?.stack ?? e) })
  }

  const { brand, pageModel, persona, inventory, targets } = (req.body ?? {}) as Record<string, unknown>
  if (typeof brand !== 'string' || !core.BRAND_KEYS.includes(brand as (typeof core.BRAND_KEYS)[number])) {
    return res.status(400).json({ error: 'invalid brand' })
  }
  const b = brand as (typeof core.BRAND_KEYS)[number]

  if (!core.clientAvailable()) {
    return res.json({ critiques: core.staticCritiques(b), source: 'fallback', reason: 'no ANTHROPIC_API_KEY' })
  }
  try {
    const critiques = await core.generateMany(b, (pageModel as Record<string, unknown>) ?? {}, persona as never, inventory, targets)
    return res.json({ critiques, source: 'live' })
  } catch (e) {
    return res.json({ critiques: core.staticCritiques(b), source: 'fallback', debug: String((e as Error)?.message ?? e) })
  }
}
