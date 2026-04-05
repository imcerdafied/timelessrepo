/**
 * generate-content.js
 *
 * Generates rich resort content for 5 zones × 9 layers = 45 era entries
 * using the Claude API. Output is written to packages/content/locations.json
 * and copied to apps/frontend/src/data/locations.json.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-content.js [zone-id]
 *
 * If zone-id is provided, only that zone is generated.
 * If omitted, all 5 zones are generated.
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ---------------------------------------------------------------------------
// Zone definitions
// ---------------------------------------------------------------------------

const ZONES = [
  {
    id: 'marina-beach',
    name: 'The Marina & Beach',
    subtext: 'Paradise Island, Bahamas',
    coordinates: { lat: 25.0865, lng: -77.3233 },
    tagline: 'Where the Atlantic meets centuries of reinvention — from Lucayan canoes to superyachts.',
  },
  {
    id: 'lobby-royal-towers',
    name: 'Main Lobby & Royal Towers',
    subtext: 'Atlantis Resort',
    coordinates: { lat: 25.0867, lng: -77.3230 },
    tagline: 'A lobby built to feel like a myth — every surface tells a story most guests walk past.',
  },
  {
    id: 'waterpark-pools',
    name: 'The Waterpark & Pools',
    subtext: 'Aquaventure',
    coordinates: { lat: 25.0855, lng: -77.3225 },
    tagline: 'Sixty acres of engineered joy on an island that once had no fresh water at all.',
  },
  {
    id: 'casino-nightlife',
    name: 'Casino & Nightlife District',
    subtext: 'Atlantis Casino & Aura Nightclub',
    coordinates: { lat: 25.0870, lng: -77.3237 },
    tagline: 'The Bahamas was built on gambling long before anyone installed a roulette wheel.',
  },
  {
    id: 'marine-habitat',
    name: 'Marine Habitat & Gardens',
    subtext: 'Atlantis Marine Exhibits',
    coordinates: { lat: 25.0860, lng: -77.3220 },
    tagline: 'Eleven million gallons of ocean behind glass — and the question of who is watching whom.',
  },
]

// ---------------------------------------------------------------------------
// Layer definitions
// ---------------------------------------------------------------------------

const LAYERS = [
  {
    suffix: 'deep-past',
    label: 'Deep Past',
    year_display: 'Pre-1700',
    era_type: 'past',
    prompt_context: 'Lucayan and Taino indigenous history, natural pre-colonial landscape, geological formation of the island. Focus on the people who lived here for centuries before Europeans arrived.',
  },
  {
    suffix: 'colonial',
    label: 'Colonial Era',
    year_display: '1700s–1800s',
    era_type: 'past',
    prompt_context: 'Pirates, British colonial rule, the transatlantic slave trade, Nassau as a pirate republic, Woodes Rogers, the salt trade, emancipation. The dark and complex foundations of modern Bahamas.',
  },
  {
    suffix: 'early-tourism',
    label: 'Early Tourism',
    year_display: '1900s–1950s',
    era_type: 'past',
    prompt_context: 'Prohibition-era rum running, the Duke and Duchess of Windsor, grand colonial hotels, Pan Am Clippers, the beginnings of Paradise Island (then Hog Island). Early tourism and the transformation of Nassau.',
  },
  {
    suffix: 'resort-era',
    label: 'Resort Era',
    year_display: '1960s–1990s',
    era_type: 'past',
    prompt_context: 'Huntington Hartford\'s Paradise Island development, the bridge to Nassau, Sun International, Sol Kerzner, the first mega-resorts. The transformation from sleepy colonial outpost to international destination.',
  },
  {
    suffix: 'modern',
    label: 'Modern Atlantis',
    year_display: '1998–2010s',
    era_type: 'past',
    prompt_context: 'Kerzner\'s Atlantis vision, the Royal Towers opening (1998), The Cove and The Reef expansions, Aquaventure, celebrity culture, Michael Jordan and Oprah visits, post-9/11 tourism, Brookfield Asset Management acquisition.',
  },
  {
    suffix: 'present',
    label: 'Present Day',
    year_display: 'Now',
    era_type: 'present',
    prompt_context: 'The current guest experience at this specific area of Atlantis. What a visitor sees, hears, smells, and feels right now. The daily rhythms, the staff, the sensory details. Ground this in reality.',
  },
  {
    suffix: 'culture',
    label: 'Bahamian Culture',
    year_display: '',
    era_type: 'cultural',
    prompt_context: 'Bahamian Junkanoo traditions, local food (conch salad, guava duff, sky juice), rake-and-scrape music, Goombay, storytelling traditions, the cultural life that exists alongside and beneath the resort. Non-temporal — this is about living culture.',
  },
  {
    suffix: 'behind-scenes',
    label: 'Behind the Scenes',
    year_display: '',
    era_type: 'operational',
    prompt_context: 'The engineering, logistics, and human operations that make this area function. Desalination, power, supply chains, marine biology teams, hospitality choreography. The invisible machinery of paradise. Non-temporal — this is about systems and people.',
  },
  {
    suffix: 'future',
    label: 'Future Horizons',
    year_display: '2035+',
    era_type: 'future',
    prompt_context: 'Climate adaptation, coral reef conservation, sustainable tourism, renewable energy, rising sea levels, AI-assisted hospitality, marine sanctuaries. Speculative but grounded — what could this place become? Include three future_scenarios for guest voting.',
  },
]

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a travel writer with the literary sensibility of Paul Theroux and the naturalist precision of David Attenborough. You write evocative, layered prose about places — not tourist brochure copy, but the kind of writing that makes someone feel the salt air, hear the casino chips, sense the weight of history beneath the marble floors.

You are generating content for a hospitality guest experience app at Atlantis Paradise Island, Bahamas. Each entry describes a specific zone of the resort through a specific historical or thematic lens.

Your writing should:
- Be vivid, specific, and grounded in real history and geography
- Avoid cliché resort language ("paradise awaits", "luxury redefined", etc.)
- Include telling details that reveal deeper truths about a place
- Balance beauty with complexity — acknowledge colonial violence, environmental cost, labor
- Feel like literary journalism, not marketing copy

You must return ONLY valid JSON. No markdown, no code fences, no commentary.`

function buildUserPrompt(zone, layer) {
  const eraId = `${zone.id}-${layer.suffix}`
  const isFuture = layer.suffix === 'future'

  const futureInstructions = isFuture
    ? `

IMPORTANT: Since this is the "future" layer, you MUST include a "future_scenarios" array with exactly 3 scenarios. Each scenario should have:
- "id": a slug like "${zone.id}-future-1", "${zone.id}-future-2", "${zone.id}-future-3"
- "title": a compelling 5-8 word title
- "description": 2-3 sentences describing the scenario
- "confidence": a number 0.0-1.0 representing likelihood`
    : ''

  return `Generate a single era entry for the following zone and layer.

ZONE: ${zone.name} (${zone.subtext})
ZONE ID: ${zone.id}
TAGLINE: ${zone.tagline}

LAYER: ${layer.label}
LAYER CONTEXT: ${layer.prompt_context}

ERA ID: ${eraId}
YEAR DISPLAY: ${layer.year_display || '(leave empty string)'}
ERA TYPE: ${layer.era_type}
${futureInstructions}

Return a JSON object with exactly these fields:
{
  "id": "${eraId}",
  "year_display": "${layer.year_display}",
  "label": "${layer.label}",
  "era_type": "${layer.era_type}",
  "image_query": "5 comma-separated keywords for finding a representative image",
  "headline": "Punchy 5-10 word headline — evocative, not generic",
  "description": "200-400 words of evocative travel-writer prose. Literary journalism, not brochure copy.",
  "key_events": [
    { "year": "year or label", "event": "one sentence describing a real historical event or cultural fact" }
  ],
  "landscape": "50-100 word sensory description of what this place looked/felt/smelled/sounded like in this era",
  "sources": ["2-3 real, citable references (books, articles, documentaries)"]${isFuture ? ',\n  "future_scenarios": [3 scenario objects as described above]' : ''}
}

Include 3-5 key_events. All sources must be real publications or documentaries.
Return ONLY the JSON object. No markdown, no explanation.`
}

// ---------------------------------------------------------------------------
// API call with retry
// ---------------------------------------------------------------------------

async function generateEra(zone, layer, retries = 2) {
  const eraId = `${zone.id}-${layer.suffix}`
  console.log(`  Generating: ${eraId}`)

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(zone, layer) }],
      })

      const text = response.content[0].text.trim()

      // Strip markdown code fences if the model wraps the output
      const cleaned = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')

      const parsed = JSON.parse(cleaned)

      // Validate required fields
      const required = ['id', 'headline', 'description', 'key_events', 'landscape', 'sources']
      for (const field of required) {
        if (!parsed[field]) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      if (layer.suffix === 'future' && (!parsed.future_scenarios || parsed.future_scenarios.length < 3)) {
        throw new Error('Future layer missing future_scenarios (need 3)')
      }

      // Enforce correct id and metadata in case the model drifted
      parsed.id = eraId
      parsed.year_display = layer.year_display
      parsed.label = layer.label
      parsed.era_type = layer.era_type

      return parsed
    } catch (err) {
      if (attempt < retries) {
        console.warn(`    Retry ${attempt + 1} for ${eraId}: ${err.message}`)
        await delay(2000)
      } else {
        console.error(`    FAILED: ${eraId} after ${retries + 1} attempts: ${err.message}`)
        throw err
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function generateZone(zone) {
  console.log(`\nZone: ${zone.name}`)
  const eras = []

  for (const layer of LAYERS) {
    const era = await generateEra(zone, layer)
    eras.push(era)
    // Rate-limit: 1 second between calls
    await delay(1000)
  }

  return {
    id: zone.id,
    name: zone.name,
    subtext: zone.subtext,
    coordinates: zone.coordinates,
    tagline: zone.tagline,
    eras,
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required.')
    console.error('Usage: ANTHROPIC_API_KEY=sk-... node scripts/generate-content.js [zone-id]')
    process.exit(1)
  }

  const targetZoneId = process.argv[2]
  let zonesToGenerate = ZONES

  if (targetZoneId) {
    const found = ZONES.find(z => z.id === targetZoneId)
    if (!found) {
      console.error(`Error: Unknown zone "${targetZoneId}".`)
      console.error(`Valid zones: ${ZONES.map(z => z.id).join(', ')}`)
      process.exit(1)
    }
    zonesToGenerate = [found]
    console.log(`Generating content for zone: ${found.name}`)
  } else {
    console.log('Generating content for all 5 zones (45 era entries total)')
  }

  const locations = []

  for (const zone of zonesToGenerate) {
    const location = await generateZone(zone)
    locations.push(location)
  }

  // If we only generated one zone, merge with existing data
  let output
  if (targetZoneId) {
    const contentPath = path.resolve(__dirname, '..', 'packages', 'content', 'locations.json')
    let existing = { locations: [] }
    try {
      existing = JSON.parse(fs.readFileSync(contentPath, 'utf-8'))
    } catch {
      // File doesn't exist or is invalid — start fresh
    }

    // Replace the target zone if it exists, otherwise append
    const idx = existing.locations.findIndex(l => l.id === targetZoneId)
    if (idx >= 0) {
      existing.locations[idx] = locations[0]
    } else {
      existing.locations.push(locations[0])
    }
    output = existing
  } else {
    output = { locations }
  }

  // Write to packages/content/locations.json
  const contentOut = path.resolve(__dirname, '..', 'packages', 'content', 'locations.json')
  fs.writeFileSync(contentOut, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`\nWritten: ${contentOut}`)

  // Copy to apps/frontend/src/data/locations.json
  const frontendOut = path.resolve(__dirname, '..', 'apps', 'frontend', 'src', 'data', 'locations.json')
  fs.mkdirSync(path.dirname(frontendOut), { recursive: true })
  fs.writeFileSync(frontendOut, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`Copied:  ${frontendOut}`)

  const totalEras = output.locations.reduce((sum, l) => sum + l.eras.length, 0)
  console.log(`\nDone. ${output.locations.length} zones, ${totalEras} era entries.`)
}

main().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
