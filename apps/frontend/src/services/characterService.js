// Calls the backend which proxies to Claude API
// Character stays strictly in their era

import useStore from '../store/useStore'

// Cache today's OTD events in memory
let otdCache = { date: null, events: null }

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

  const response = await fetch('/api/character/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.detail || data.error || 'Character response failed')
  return data.response
}
