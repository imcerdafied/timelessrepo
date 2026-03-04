import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { generateTalkVideo } from '../services/didService.js'

const router = Router()

// In-memory video cache (episodeId → video URL)
const videoCache = new Map()

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Supabase for vote storage
let supabase = null
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
}

// POST /api/story/chat — character conversation within a story episode
router.post('/chat', async (req, res) => {
  const { system_prompt, messages } = req.body

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  if (!system_prompt || !messages?.length) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const fullSystemPrompt = `${system_prompt}

CRITICAL INSTRUCTIONS:
- Stay in character completely. You are this person, in this time.
- Never break character or acknowledge being an AI.
- Never use em dashes in your responses. Use commas, periods, or colons instead.
- Keep every response to 2-3 sentences maximum.
- You are speaking aloud in conversation, not writing an essay.`

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
    console.error('Story chat error:', err.message)
    res.status(500).json({
      error: 'Character unavailable',
      detail: err.message
    })
  }
})

// POST /api/story/speak — TTS via ElevenLabs
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
          text: text.slice(0, 1000),
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
    Readable.fromWeb(response.body).pipe(res)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/story/votes/:episodeId — get vote tallies
router.get('/votes/:episodeId', async (req, res) => {
  if (!supabase) {
    return res.json({ tallies: {}, total: 0 })
  }

  const { episodeId } = req.params

  try {
    const { data, error } = await supabase
      .from('story_votes')
      .select('option_chosen')
      .eq('episode_id', episodeId)

    if (error) throw error

    const tallies = {}
    for (const row of (data || [])) {
      tallies[row.option_chosen] = (tallies[row.option_chosen] || 0) + 1
    }
    const total = data?.length || 0

    res.json({ tallies, total })
  } catch (err) {
    console.error('Vote tally error:', err.message)
    res.json({ tallies: {}, total: 0 })
  }
})

// POST /api/story/vote — cast a vote
router.post('/vote', async (req, res) => {
  const { episodeId, optionId, sessionId } = req.body

  if (!episodeId || !optionId) {
    return res.status(400).json({ error: 'episodeId and optionId required' })
  }

  if (!supabase) {
    return res.json({ success: true, tallies: { [optionId]: 1 }, total: 1 })
  }

  try {
    // Upsert: one vote per session per episode
    const { error: upsertError } = await supabase
      .from('story_votes')
      .upsert({
        episode_id: episodeId,
        option_chosen: optionId,
        user_id: sessionId || 'anonymous',
      }, {
        onConflict: 'episode_id,user_id'
      })

    if (upsertError) throw upsertError

    // Fetch updated tallies
    const { data, error } = await supabase
      .from('story_votes')
      .select('option_chosen')
      .eq('episode_id', episodeId)

    if (error) throw error

    const tallies = {}
    for (const row of (data || [])) {
      tallies[row.option_chosen] = (tallies[row.option_chosen] || 0) + 1
    }
    const total = data?.length || 0

    res.json({ success: true, tallies, total })
  } catch (err) {
    console.error('Vote error:', err.message)
    res.status(500).json({ error: 'Vote failed', detail: err.message })
  }
})

// POST /api/story/video/generate — D-ID talking head video
router.post('/video/generate', async (req, res) => {
  const { episodeId, text, voiceId } = req.body

  if (!text) {
    return res.status(400).json({ error: 'text required' })
  }

  // Return cached video if available
  if (videoCache.has(episodeId)) {
    return res.json({ status: 'done', video_url: videoCache.get(episodeId) })
  }

  try {
    const videoUrl = await generateTalkVideo(text, voiceId || 'EXAVITQu4vr4xnSDxMaL')
    videoCache.set(episodeId, videoUrl)
    res.json({ status: 'done', video_url: videoUrl })
  } catch (err) {
    console.error('D-ID error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
