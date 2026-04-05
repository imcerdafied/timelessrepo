// Calls the backend which proxies to Claude API
// Character stays strictly in their era

import useStore from '../store/useStore'

export async function sendCharacterMessage(
  character,
  conversationHistory,
  userMessage,
  venueContext
) {
  const visitSummary = useStore.getState().getVisitSummary()

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
