export function getSessionId() {
  let id = localStorage.getItem('dispatch_session')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('dispatch_session', id)
  }
  return id
}

export async function sendStoryMessage(story, episode, history, userMessage) {
  const response = await fetch('/api/story/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storyId: story.id,
      episodeId: episode.id,
      system_prompt: story.system_prompt,
      messages: [...history, { role: 'user', content: userMessage }]
    })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.detail || data.error || 'Story response failed')
  return data.response
}

export async function castVote(episodeId, optionId) {
  const sessionId = getSessionId()
  const response = await fetch('/api/story/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ episodeId, optionId, sessionId })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Vote failed')
  return data
}

export async function generateVideo(episodeId, text, voiceId) {
  const response = await fetch('/api/story/video/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ episodeId, text, voiceId })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Video generation failed')
  return data.video_url
}

export async function getVoteTallies(episodeId) {
  const response = await fetch(`/api/story/votes/${episodeId}`)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to fetch votes')
  return data
}
