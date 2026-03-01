// Calls the backend which proxies to Claude API
// Character stays strictly in their era

export async function sendCharacterMessage(
  character,
  conversationHistory,
  userMessage
) {
  const response = await fetch('/api/character/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      character_id: character.id,
      system_prompt: character.system_prompt,
      accent: character.accent,
      messages: [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ]
    })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.detail || data.error || 'Character response failed')
  return data.response
}
