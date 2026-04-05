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
    greeting: `Today at ${PROPERTY_NAME}`,
    weather: { temp: 82, condition: 'Sunny', water_temp: 79, sunset: '7:42 PM' },
    events: [
      { time: '2:00 PM', title: 'Shark Feeding — Marine Habitat', zone_id: 'marine-habitat', layer_id: 'marine-habitat-present' },
      { time: '5:30 PM', title: 'Sunset Cruise — Marina', zone_id: 'marina-beach', layer_id: 'marina-beach-present' },
      { time: '7:00 PM', title: "Chef's Table — Royal Towers", zone_id: 'lobby-royal-towers', layer_id: 'lobby-royal-towers-present' },
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
      system: `You are a creative concierge for ${PROPERTY_NAME}, a luxury resort in Nassau, Bahamas. Generate engaging daily content for resort guests. The property has these zones: marina-beach, lobby-royal-towers, waterpark-pools, casino-nightlife, marine-habitat. Each zone has historical layers with IDs like zone-id-present, zone-id-colonial, zone-id-ancient. Respond ONLY with valid JSON, no markdown.`,
      messages: [
        {
          role: 'user',
          content: `Generate today's content for ${key}. Return JSON with this exact structure:
{
  "greeting": "A warm, creative greeting for today",
  "weather": { "temp": number, "condition": "string", "water_temp": number, "sunset": "time string" },
  "events": [
    { "time": "time string", "title": "Event name — Location", "zone_id": "zone-id", "layer_id": "zone-id-era" }
  ],
  "featured": {
    "headline": "Interesting historical headline",
    "snippet": "A 1-2 sentence fascinating historical fact about Nassau or the Bahamas",
    "zone_id": "relevant-zone-id",
    "layer_id": "relevant-zone-id-era"
  },
  "did_you_know": "A single fascinating fact about Atlantis resort or Nassau"
}
Include exactly 3 events. Make content feel fresh and seasonal for the date.`,
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
