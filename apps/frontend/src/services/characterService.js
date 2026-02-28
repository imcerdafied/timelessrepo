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

  if (!response.ok) throw new Error('Character response failed')
  const data = await response.json()
  return data.response
}
