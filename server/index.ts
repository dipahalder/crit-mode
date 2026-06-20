import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { BRAND_KEYS, FIELD_KEYS, MODEL, clientAvailable, fallbackFor, generate, generateMany, staticCritiques } from './core.js'

// Local dev critique proxy (M11/M14): a thin Express wrapper around server/core.
// In production these same endpoints are served by Vercel functions (api/*),
// which import the identical core. Reliability first (CLAUDE.md guardrail 3):
// every endpoint falls back to the static dots on any failure.

const PORT = Number(process.env.PORT) || 8787

const app = express()
app.use(cors())
app.use(express.json({ limit: '256kb' }))

// Single-region critique (M11).
app.post('/critique', async (req, res) => {
  const { brand, region, pageModel, persona } = req.body ?? {}
  if (!BRAND_KEYS.includes(brand) || !FIELD_KEYS.includes(region)) {
    return res.status(400).json({ error: 'invalid brand or region' })
  }
  const fallback = fallbackFor(brand, region)
  if (!clientAvailable()) {
    console.log(`[critique] ${brand}/${region} -> fallback (no API key)`)
    return res.json({ ...fallback, source: 'fallback' })
  }
  try {
    const generated = await generate(brand, region, pageModel ?? {}, persona)
    console.log(`[critique] ${brand}/${region} -> live (Claude)`)
    return res.json({ ...generated, source: 'live' })
  } catch (err) {
    console.warn(`[critique] ${brand}/${region} -> fallback (${(err as Error).message})`)
    return res.json({ ...fallback, source: 'fallback' })
  }
})

// LLM-chosen multi-region critiques (M14).
app.post('/critiques', async (req, res) => {
  const { brand, pageModel, persona, inventory, targets } = req.body ?? {}
  if (!BRAND_KEYS.includes(brand)) return res.status(400).json({ error: 'invalid brand' })

  if (!clientAvailable()) {
    console.log(`[critiques] ${brand} as ${persona ?? 'designer'} -> fallback (no API key)`)
    return res.json({ critiques: staticCritiques(brand), source: 'fallback' })
  }
  try {
    const critiques = await generateMany(brand, pageModel ?? {}, persona, inventory, targets)
    console.log(`[critiques] ${brand} as ${persona ?? 'designer'} -> live (${critiques.length}: ${critiques.map((c) => c.targetId).join(', ')})`)
    return res.json({ critiques, source: 'live' })
  } catch (err) {
    console.warn(`[critiques] ${brand} as ${persona ?? 'designer'} -> fallback (${(err as Error).message})`)
    return res.json({ critiques: staticCritiques(brand), source: 'fallback' })
  }
})

app.listen(PORT, () => {
  console.log(`[critique] proxy on http://localhost:${PORT}  (model: ${MODEL}, key: ${clientAvailable() ? 'set' : 'MISSING, fallback only'})`)
})
