export async function sendStoryMessage(story, episode, history, userMessage) {
  const response = await fetch('/api/story/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storyId: story.id,
      episodeId: episode.id,
      system_prompt: story.system_prompt,
      messages: [
        ...history,
        { role: 'user', content: userMessage }
      ]
    })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.detail || data.error || 'Story response failed')
  return data.response
}

export async function castVote(episodeId, option, userId) {
  const response = await fetch('/api/story/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ episodeId, option, userId })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Vote failed')
  return data
}

export async function getVoteTallies(episodeId) {
  const response = await fetch(`/api/story/votes/${episodeId}`)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to fetch votes')
  return data
}
