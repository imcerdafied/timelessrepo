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
- Never use em dashes in your responses. Use commas, periods, or colons instead.
- Speak with the accent and speech patterns described: ${accent}
- You are talking to a visitor who has appeared in your time and place.
  Their questions may seem strange to you. Answer honestly from your vantage point.

CRITICAL: Keep every response to 2-3 sentences maximum. You are speaking aloud in conversation, not writing an essay. Short, vivid, historically grounded. Leave the visitor wanting more.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
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

router.post('/speak', async (req, res) => {
  const { text, voiceId } = req.body

  if (!text || !voiceId) {
    return res.status(400).json({ error: 'text and voiceId required' })
  }

  const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY
  if (!ELEVEN_API_KEY) {
    return res.status(500).json({ error: 'ElevenLabs API key not configured' })
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      }
    )

    if (!response.ok) {
      const err = await response.text()
      return res.status(500).json({ error: 'ElevenLabs error', detail: err })
    }

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Transfer-Encoding', 'chunked')
    const { Readable } = await import('stream')
    const nodeStream = Readable.fromWeb(response.body)
    nodeStream.pipe(res)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/speak-stream', async (req, res) => {
  const { text, eraId } = req.query

  const voiceMap = {
    'alamo-1834': 'JBFqnCBsd6RMkjVDRZzb',       // Jose — George (Warm Storyteller)
    'mission-1776': 'onwK4e9ZLuTAKqWW03F9',     // Padre Palou — Daniel (Formal)
    'mission-1906': 'EXAVITQu4vr4xnSDxMaL',    // Rosa — Sarah (Mature, Confident)
    'mission-1969': 'cjVigY5qzO86Huf0OWal',     // Chavez — Eric (Smooth, Trustworthy)
    'embarcadero-1934': 'nPczCjzI2devNBz1zQrb', // Bridges — Brian (Deep, Resonant)
    'chinatown-1882': 'pqHfZKP75CvOlQylNhV4',   // Lee Wong — Bill (Wise, Old)
  }

  const voiceId = voiceMap[eraId] || 'JBFqnCBsd6RMkjVDRZzb'
  const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY

  if (!ELEVEN_API_KEY) {
    return res.status(500).json({ error: 'ElevenLabs API key not configured' })
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text?.slice(0, 500) || 'Hello',
          model_id: 'eleven_turbo_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      }
    )

    if (!response.ok) {
      const err = await response.text()
      return res.status(500).json({ error: 'ElevenLabs error', detail: err })
    }

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-cache')
    const { Readable } = await import('stream')
    Readable.fromWeb(response.body).pipe(res)
  } catch (err) {
    res.status(500).json({ error: err.message })
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
