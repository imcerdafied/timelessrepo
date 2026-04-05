import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const PROPERTY_NAME = process.env.PROPERTY_NAME || 'Atlantis Experience'

// In-memory cache keyed by date string (YYYY-MM-DD), 24-hour TTL
const cache = new Map()

// Create Anthropic client at module scope (not per-request)
const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function staticFallback() {
  return {
    greeting: 'On This Day',
    events: [
      {
        year: '1718',
        headline: 'The End of the Pirate Republic',
        snippet: 'Woodes Rogers arrived in Nassau with Royal authority and a pardon for any pirate willing to surrender.',
        zone_id: 'marina-beach',
        layer_id: 'marina-beach-colonial',
      },
      {
        year: '1973',
        headline: 'Bahamian Independence',
        snippet: 'The Bahamas gained independence from the United Kingdom after 256 years of British colonial rule.',
        zone_id: 'lobby-royal-towers',
        layer_id: 'lobby-royal-towers-colonial',
      },
    ],
    featured: {
      headline: 'The Republic of Pirates',
      snippet: 'In 1718, Nassau harbor held more pirate ships than any port in the world.',
      zone_id: 'marina-beach',
      layer_id: 'marina-beach-colonial',
    },
    did_you_know: 'The Atlantis marine habitat holds 11 million gallons of saltwater — enough to fill 17 Olympic swimming pools.',
  }
}

router.get('/', async (_req, res) => {
  const key = todayKey()

  // Check cache
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
    return res.json(cached.data)
  }

  // No API key — return static fallback
  if (!client) {
    const fallback = staticFallback()
    cache.set(key, { data: fallback, timestamp: Date.now() })
    return res.json(fallback)
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are a historical researcher for ${PROPERTY_NAME}, a luxury resort in Nassau, Bahamas. Generate "On This Day" historical content related to the Bahamas, Caribbean, ocean history, or tropical ecology. The property has these zones: marina-beach, lobby-royal-towers, waterpark-pools, casino-nightlife, marine-habitat. Each zone has layers with IDs like zone-id-colonial, zone-id-deep-past, zone-id-modern, etc. Respond ONLY with valid JSON, no markdown.`,
      messages: [
        {
          role: 'user',
          content: `Generate "On This Day" content for ${key}. Find 2-3 real historical events that happened on or near this date related to the Bahamas, Caribbean, piracy, ocean exploration, marine biology, or tropical ecology. Return JSON:
{
  "greeting": "On This Day",
  "events": [
    { "year": "1718", "headline": "Short headline", "snippet": "1-2 sentence description", "zone_id": "relevant-zone-id", "layer_id": "relevant-zone-id-layer" }
  ],
  "featured": {
    "headline": "Most interesting event headline",
    "snippet": "1-2 sentence fascinating detail",
    "zone_id": "relevant-zone-id",
    "layer_id": "relevant-zone-id-layer"
  },
  "did_you_know": "A single fascinating fact about the Bahamas, marine life, or Caribbean history"
}
Include 2-3 events. Use real historical dates and facts. Link each to the most relevant zone and layer.`,
        },
      ],
    })

    const text = response.content[0]?.text || ''
    let data
    try {
      data = JSON.parse(text)
    } catch {
      // If AI response isn't valid JSON, fall back to static
      data = staticFallback()
    }

    cache.set(key, { data, timestamp: Date.now() })
    res.json(data)
  } catch (err) {
    console.error('Today at property error:', err.message)
    const fallback = staticFallback()
    cache.set(key, { data: fallback, timestamp: Date.now() })
    res.json(fallback)
  }
})

export default router
