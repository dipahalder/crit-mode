import type { VercelRequest, VercelResponse } from '@vercel/node'
import { BRAND_KEYS, clientAvailable, generateMany, staticCritiques } from '../server/core'

// Production endpoint for the LLM-chosen critiques (M14), served by Vercel as a
// serverless function. It reuses server/core (the same logic the local Express
// proxy uses) and reads ANTHROPIC_API_KEY from the project's environment so the
// key stays server-side. Reliability first: any failure returns the static dots.
// vercel.json rewrites /critiques to /api/critiques so the client URL is stable.

// The LLM round can take longer than the 10s Hobby default; allow up to 60s.
export const config = { maxDuration: 60 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })

  const { brand, pageModel, persona, inventory, targets } = (req.body ?? {}) as Record<string, unknown>
  if (typeof brand !== 'string' || !BRAND_KEYS.includes(brand as (typeof BRAND_KEYS)[number])) {
    return res.status(400).json({ error: 'invalid brand' })
  }
  const b = brand as (typeof BRAND_KEYS)[number]

  if (!clientAvailable()) {
    return res.json({ critiques: staticCritiques(b), source: 'fallback' })
  }
  try {
    const critiques = await generateMany(b, (pageModel as Record<string, unknown>) ?? {}, persona as never, inventory, targets)
    return res.json({ critiques, source: 'live' })
  } catch {
    return res.json({ critiques: staticCritiques(b), source: 'fallback' })
  }
}
