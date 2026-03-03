// Calls the backend which proxies to Claude API
// Character stays strictly in their era

export async function sendCharacterMessage(
  character,
  conversationHistory,
  userMessage,
  venueContext
) {
  const body = {
    character_id: character.id,
    system_prompt: character.system_prompt,
    accent: character.accent,
    messages: [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]
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
