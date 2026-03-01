import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('WARNING: ANTHROPIC_API_KEY is not set. Character chat will not work.')
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post('/chat', async (req, res) => {
  const { system_prompt, accent, messages } = req.body

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  if (!system_prompt || !messages?.length) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Enforce era constraint in system prompt
  const fullSystemPrompt = `${system_prompt}

CRITICAL INSTRUCTIONS:
- Stay in character completely. You are this person, in this time.
- Never break character or acknowledge being an AI.
- If asked about events after your era, respond from your actual present.
  You cannot know the future. Be curious, not evasive.
- Keep responses conversational, 2-4 sentences usually.
  Longer only for topics you'd naturally speak at length about.
- Never use em dashes in your responses. Use commas, periods, or colons instead.
- Speak with the accent and speech patterns described: ${accent}
- You are talking to a visitor who has appeared in your time and place.
  Their questions may seem strange to you. Answer honestly from your vantage point.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: fullSystemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    })

    const text = response.content[0]?.text || ''
    res.json({ response: text })
  } catch (err) {
    console.error('Character chat error:', JSON.stringify({
      message: err.message,
      status: err.status,
      error: err.error,
      stack: err.stack
    }))
    res.status(500).json({
      error: 'Character unavailable',
      detail: err.message
    })
  }
})

router.get('/test', async (req, res) => {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say hello in one word.' }]
    })
    res.json({
      success: true,
      response: response.content[0].text
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      status: err.status
    })
  }
})

export default router
