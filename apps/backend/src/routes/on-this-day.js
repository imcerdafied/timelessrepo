import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = Router()

// In-memory cache: { "0318": { events: [...], generatedAt: "..." } }
const cache = new Map()

// Load locations for era matching
let locations = []
try {
  const locPath = path.join(__dirname, '..', '..', '..', 'frontend', 'src', 'data', 'locations.json')
  if (fs.existsSync(locPath)) {
    locations = JSON.parse(fs.readFileSync(locPath, 'utf-8')).locations || []
  } else {
    // Try packages/content fallback
    const altPath = path.join(__dirname, '..', '..', '..', '..', 'packages', 'content', 'locations.json')
    if (fs.existsSync(altPath)) {
      locations = JSON.parse(fs.readFileSync(altPath, 'utf-8')).locations || []
    }
  }
  console.log(`On This Day: loaded ${locations.length} locations`)
} catch (e) {
  console.warn('On This Day: failed to load locations', e.message)
}

// Build a flat index of all eras with their location context
function buildEraIndex() {
  const index = []
  for (const loc of locations) {
    for (const era of (loc.eras || [])) {
      // Extract a numeric year from year_display (e.g. "c. 1500" → 1500, "1906" → 1906)
      const yearMatch = era.year_display?.match(/(\d{3,4})/)
      const year = yearMatch ? parseInt(yearMatch[1], 10) : null
      index.push({
        locationId: loc.id,
        locationName: loc.name,
        city: loc.city || loc.subtext || '',
        eraId: era.id,
        year,
        yearDisplay: era.year_display,
        label: era.label,
        headline: era.headline,
        eraType: era.era_type,
      })
    }
  }
  return index
}

const eraIndex = buildEraIndex()

// Map a city name + year to the best matching location/era
function findBestEra(city, year) {
  if (!city || !year) return null

  const cityLower = city.toLowerCase()

  // Map common city names to our location city strings
  const cityAliases = {
    'san francisco': ['san francisco', 'mission', 'embarcadero', 'financial', 'chinatown', 'twin peaks', 'haight', 'north beach'],
    'new york': ['new york', 'manhattan', 'brooklyn', 'harlem', 'wall street', 'central park'],
    'london': ['london', 'southwark', 'east london', 'west end'],
    'paris': ['paris', 'arrondissement', 'marais', 'montmartre'],
    'tokyo': ['tokyo', 'shinjuku', 'asakusa', 'taito'],
    'chicago': ['chicago', 'state street', 'bronzeville'],
    'los angeles': ['los angeles', 'bunker hill', 'venice', 'ocean front'],
    'lagos': ['lagos', 'victoria island'],
    'riyadh': ['riyadh', 'diriyah', 'arabian'],
  }

  // Find matching eras by city
  let candidates = eraIndex.filter(e => {
    const locCity = (e.city + ' ' + e.locationName).toLowerCase()
    // Direct match
    if (locCity.includes(cityLower)) return true
    // Alias match
    for (const [key, aliases] of Object.entries(cityAliases)) {
      if (cityLower.includes(key) || key.includes(cityLower)) {
        return aliases.some(a => locCity.includes(a))
      }
    }
    return false
  })

  if (candidates.length === 0) return null

  // Find closest year
  candidates.sort((a, b) => {
    const diffA = a.year ? Math.abs(a.year - year) : 9999
    const diffB = b.year ? Math.abs(b.year - year) : 9999
    return diffA - diffB
  })

  const best = candidates[0]
  const yearDiff = best.year ? Math.abs(best.year - year) : 9999

  return {
    locationId: best.locationId,
    eraId: best.eraId,
    locationName: best.locationName,
    city: best.city,
    yearDisplay: best.yearDisplay,
    label: best.label,
    headline: best.headline,
    confidence: yearDiff <= 5 ? 0.95 : yearDiff <= 20 ? 0.8 : yearDiff <= 50 ? 0.6 : 0.4,
  }
}

// GET /api/on-this-day — uses today's date
router.get('/', async (req, res) => {
  req.params.mmdd = null
  return handleOnThisDay(req, res)
})

// GET /api/on-this-day/:mmdd — specific date
router.get('/:mmdd', async (req, res) => {
  return handleOnThisDay(req, res)
})

async function handleOnThisDay(req, res) {
  try {
    // Determine date
    const now = new Date()
    let month, day
    if (req.params.mmdd && /^\d{4}$/.test(req.params.mmdd)) {
      month = parseInt(req.params.mmdd.slice(0, 2), 10)
      day = parseInt(req.params.mmdd.slice(2, 4), 10)
    } else {
      month = now.getMonth() + 1
      day = now.getDate()
    }
    const mmdd = String(month).padStart(2, '0') + String(day).padStart(2, '0')

    // Check cache
    const cached = cache.get(mmdd)
    if (cached && (Date.now() - cached.generatedAt < 24 * 60 * 60 * 1000)) {
      return res.json({ date: mmdd, events: cached.events, cached: true })
    }

    // Generate via Claude
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'API key not configured' })
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    const dateStr = `${monthNames[month - 1]} ${day}`

    const locationList = [...new Set(locations.map(l => l.city || l.subtext || l.name))].join(', ')

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: `You are a historical event curator for the Timeless Moment app. You find fascinating, dramatic historical events that happened on specific dates. Focus on events that are vivid, human, and emotionally resonant — not just "important." Prefer events tied to specific places where someone could imagine standing.

Available cities in our app: ${locationList}

Always return valid JSON. No markdown formatting.`,
      messages: [{
        role: 'user',
        content: `What are 3 notable historical events that happened on ${dateStr} (any year)?

For each event, it MUST be connected to one of these cities: San Francisco, New York, London, Paris, Tokyo, Chicago, Los Angeles, Lagos, Riyadh.

Return a JSON array of exactly 3 objects with these fields:
- "year": number (the year it happened)
- "city": string (which city from the list above)
- "headline": string (5-10 words, dramatic, present tense — like a newspaper headline)
- "description": string (2-3 sentences describing what happened, written vividly as if you were there)
- "shareText": string (a compelling 1-line social media post about this event, under 200 chars, include the year)

Only return the JSON array, nothing else.`
      }],
    })

    // Parse Claude's response
    let events = []
    const text = response.content[0]?.text || ''
    try {
      // Try to extract JSON array from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        events = JSON.parse(jsonMatch[0])
      }
    } catch (parseErr) {
      console.error('On This Day: failed to parse Claude response:', parseErr.message)
      console.error('Raw response:', text.slice(0, 500))
      return res.status(500).json({ error: 'Failed to parse event data' })
    }

    // Map each event to our location/era system
    const mappedEvents = events.map((event, i) => {
      const match = findBestEra(event.city, event.year)
      return {
        id: `otd-${mmdd}-${i}`,
        year: event.year,
        city: event.city,
        headline: event.headline,
        description: event.description,
        shareText: event.shareText || event.headline,
        locationId: match?.locationId || null,
        eraId: match?.eraId || null,
        matchedLocation: match?.locationName || null,
        matchedEra: match?.label || null,
        matchedHeadline: match?.headline || null,
        confidence: match?.confidence || 0,
      }
    }).filter(e => e.locationId) // Only return events we can map

    // Cache the result
    cache.set(mmdd, { events: mappedEvents, generatedAt: Date.now() })

    res.json({ date: mmdd, events: mappedEvents, cached: false })
  } catch (err) {
    console.error('On This Day error:', err)
    res.status(500).json({ error: 'Failed to generate events' })
  }
}

export default router
