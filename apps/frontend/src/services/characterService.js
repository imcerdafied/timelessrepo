// Calls the backend which proxies to Claude API
// Character stays strictly in their era

import useStore from '../store/useStore'

// Cache today's OTD events in memory
let otdCache = { date: null, events: null }
const CHARACTER_CHAT_TIMEOUT_MS = 12000

function cleanCopy(text = '') {
  return String(text).replace(/\u2014/g, ',').trim()
}

function buildLocalFallback(character, userMessage = '') {
  const name = character?.name || 'your guide'
  const latest = cleanCopy(userMessage).toLowerCase()

  if (name.includes('Anne Bonny')) {
    if (latest.includes('trouble') || latest.includes('where')) {
      return 'Trouble starts near the taverns, where stolen silver changes hands and every smiling man is counting your purse. Keep one eye on the door and the other on your knife.'
    }
    if (latest.includes('controlled') || latest.includes('nassau') || latest.includes('harbor')) {
      return 'No king controlled Nassau when I knew it. The harbor belonged to whoever had cannon, nerve, and friends enough to survive the night.'
    }
    return 'Ask plain, and do not waste my tide. I know Nassau, the shoals, the taverns, and the men who pretend they own them.'
  }

  if (name.includes('Woodes Rogers')) {
    if (latest.includes('pardon') || latest.includes('hang')) {
      return 'I would pardon a useful penitent and hang a stubborn rogue. Mercy without order is only another kind of surrender.'
    }
    return 'Nassau was ruled by rogues when I came ashore, and rogues understand force better than sermons. I offered the King\'s Pardon to the wise and the gallows to the stubborn.'
  }

  if (name === 'Atlas') {
    return 'I can help you choose the next layer, find a quieter route, or turn this moment into something worth sharing.'
  }

  return `I am ${name}, and I can only answer from my own moment. Ask what I have seen here, what I fear, or what this place is becoming.`
}

async function fetchWithTimeout(url, options, ms = CHARACTER_CHAT_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function getTodayEvents() {
  const today = new Date().toISOString().slice(0, 10)
  if (otdCache.date === today && otdCache.events) return otdCache.events

  try {
    const cacheKey = `otd_${today}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed?.events?.length) {
        otdCache = { date: today, events: parsed.events }
        return parsed.events
      }
    }
  } catch {}
  return []
}

export async function sendCharacterMessage(
  character,
  conversationHistory,
  userMessage,
  venueContext
) {
  const visitSummary = useStore.getState().getVisitSummary()
  const todayEvents = await getTodayEvents()

  const body = {
    character_id: character.id,
    system_prompt: character.system_prompt,
    accent: character.accent,
    messages: [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ],
    visit_context: {
      zones_visited: visitSummary.zones,
      layers_visited: visitSummary.layers,
      today_events: todayEvents.map(e => `${e.year}: ${e.headline}`),
    }
  }
  if (venueContext) body.venue_context = venueContext

  try {
    const response = await fetchWithTimeout('/api/character/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || data.error || 'Character response failed')
    return cleanCopy(data.response)
  } catch (err) {
    console.warn('Character chat using local fallback:', err)
    return buildLocalFallback(character, userMessage)
  }
}
