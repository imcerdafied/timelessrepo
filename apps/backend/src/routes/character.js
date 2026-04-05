import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('WARNING: ANTHROPIC_API_KEY is not set. Character chat will not work.')
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post('/chat', async (req, res) => {
  const { system_prompt, accent, messages, venue_context, visit_context } = req.body

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  if (!system_prompt || !messages?.length) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Build system prompt with optional venue context
  const basePrompt = venue_context
    ? `${venue_context}\n\n${system_prompt}`
    : system_prompt

  let contextPrefix = ''
  if (visit_context?.zones_visited?.length) {
    contextPrefix = `GUEST CONTEXT: This guest has explored the following zones: ${visit_context.zones_visited.join(', ')}. They have visited ${visit_context.layers_visited?.length || 0} total layers. You can reference their journey if relevant to the conversation.\n\n`
  }

  // Enforce era constraint in system prompt
  const fullSystemPrompt = `${contextPrefix}${basePrompt}

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

// POST /api/character/narrate — generate TTS narration for a TimelessScene monologue
// Returns audio/mpeg stream. Body: { text, eraId, eraType, city, characterName, characterRole, characterAccent }
router.post('/narrate', async (req, res) => {
  const { text, eraId, eraType, city, characterName, characterRole, characterAccent } = req.body

  if (!text) {
    return res.status(400).json({ error: 'text required' })
  }

  const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY
  if (!ELEVEN_API_KEY) {
    return res.status(500).json({ error: 'ElevenLabs API key not configured' })
  }

  // ── VOICE SELECTION ──────────────────────────────────────────────
  // ElevenLabs default voices categorized by demographics
  const VOICES = {
    // Young American male
    youngAmericanMale:   { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },     // Young, well-rounded
    youngAmericanMale2:  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },       // Young, deep
    youngAmericanMale3:  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' },        // Young, raspy
    youngAmericanMale4:  { id: 'g5CIjZEefAph4nQFvHAz', name: 'Ethan' },      // Young
    // Middle-aged American male
    midAmericanMale:     { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },       // Deep
    midAmericanMale2:    { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian' },      // Deep
    midAmericanMale3:    { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill' },       // Strong
    // Old American male
    oldAmericanMale:     { id: 't0jbNlBVZ17f02VDIeMI', name: 'Jessie' },     // Old, raspy
    oldAmericanMale2:    { id: 'flq6f7yk4E4fJM5XTYuZ', name: 'Michael' },    // Old
    // Young American female
    youngAmericanFemale: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },     // Calm
    youngAmericanFemale2:{ id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },     // Soft
    youngAmericanFemale3:{ id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda' },    // Warm
    youngAmericanFemale4:{ id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },       // Strong
    // Southern American female
    southernFemale:      { id: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace' },      // Southern
    // Middle-aged American female
    midAmericanFemale:   { id: 'pMsXgVXv3BLzUgSXRplE', name: 'Serena' },     // Pleasant
    // British male
    britishMale:         { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel' },     // Deep
    britishMale2:        { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },     // Raspy
    britishMale3:        { id: 'Zlb1dXrM653N07WRdFW3', name: 'Joseph' },     // Middle-aged
    // British female
    britishFemale:       { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy' },    // Pleasant
    britishFemale2:      { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice' },     // Confident
    britishFemale3:      { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily' },       // Raspy
    // Young British male
    youngBritishMale:    { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave' },       // Conversational
    // Irish male
    irishMale:           { id: 'D38z5RcWu1voky8WS1ja', name: 'Fin' },        // Old, sailor
    // Italian-accented male
    italianMale:         { id: 'zcAOhNBS3c14rBihAFp1', name: 'Giovanni' },   // Young, Italian
    // Child/teen female
    childFemale:         { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi' },       // Childish
  }

  // Infer gender from character name/role/accent
  function inferGender(name, role, accent) {
    const firstName = (name || '').split(' ')[0].toLowerCase()
    const combined = `${name} ${role} ${accent}`.toLowerCase()

    // Comprehensive female first name list
    const femaleNames = new Set([
      'ada', 'adele', 'adeola', 'alejandra', 'alice', 'amanda', 'amara', 'amira', 'amy',
      'ana', 'andrea', 'angela', 'anna', 'annie', 'beatrice', 'bessie', 'bridget',
      'catherine', 'cecilia', 'charlotte', 'chioma', 'clara', 'claudette', 'connie',
      'dana', 'denise', 'dorothy', 'elena', 'elizabeth', 'ella', 'emily', 'emma',
      'esther', 'fatima', 'florence', 'grace', 'harriet', 'helen', 'ida', 'irene',
      'isabella', 'jane', 'jenny', 'jessica', 'joan', 'josephine', 'julia', 'karen',
      'kate', 'katherine', 'kaya', 'kura', 'lakshmi', 'laura', 'lily', 'linda', 'lisa',
      'liwayway', 'lucia', 'luna', 'margaret', 'maria', 'martha', 'mary', 'maya',
      'mildred', 'nancy', 'ngozi', 'nia', 'noura', 'osha', 'patricia', 'piya', 'preethi',
      'priya', 'rebecca', 'rivka', 'rosa', 'ruth', 'sakura', 'sarah', 'sofia', 'susan',
      'sylvia', 'tanya', 'temi', 'toypurina', 'tsipni', 'vanessa', 'vera', 'victoria',
      'yinka', 'yuki', 'yumi', 'zara', 'donaldina', 'manahatta', 'amara',
    ])

    // Check first name against known female names
    if (femaleNames.has(firstName)) return 'female'

    // Check role/accent for gender signals
    const femaleRoleSignals = ['woman', 'female', 'girl', 'she ', 'her ', 'mother', 'wife',
      'daughter', 'sister', 'nun', 'mrs', 'miss', 'ms ', 'lady', 'queen', 'princess',
      'nurse', 'midwife', 'seamstress', 'washerwoman', 'laundress', 'actress', 'maid',
      'governess', 'countess', 'duchess', 'priestess', 'widow']
    const maleRoleSignals = ['man ', 'male', 'boy ', 'father', 'husband', 'son ', 'brother',
      'monk', 'mr ', 'sir ', 'king ', 'prince', 'soldier', 'captain', 'reporter',
      'photographer', 'priest', 'padre', 'rabbi', 'imam', 'dock worker', 'longshoreman',
      'firefighter', 'officer', 'jr.', 'senior']

    const fScore = femaleRoleSignals.filter(s => combined.includes(s)).length
    const mScore = maleRoleSignals.filter(s => combined.includes(s)).length
    if (fScore > mScore) return 'female'
    if (mScore > fScore) return 'male'
    return 'male' // default fallback
  }

  // Infer age category from role/accent description
  function inferAge(role, accent) {
    const combined = `${role} ${accent}`.toLowerCase()
    if (/\b(child|kid|boy |girl |teenage|teen |youth|young boy|young girl|student|12|13|14|15|16|17)\b/.test(combined)) return 'young'
    if (/\b(elderly|old |aged|retired|ancient|grandmother|grandfather|80|70|veteran)\b/.test(combined)) return 'old'
    if (/\b(young|20s|twenties|25|23|22)\b/.test(combined)) return 'young'
    if (/\b(middle.aged|40s|50s|mature|experienced)\b/.test(combined)) return 'middle'
    return 'middle' // default
  }

  // Infer accent/region
  function inferAccent(accent, city, role) {
    const combined = `${accent} ${city} ${role}`.toLowerCase()
    if (/british|london|english|cockney|east end|working.class.*london|received pronunciation/i.test(combined)) return 'british'
    if (/irish/i.test(combined)) return 'irish'
    if (/italian/i.test(combined)) return 'italian'
    if (/southern|dixie|georgia|alabama|texas|mississippi|carolina/i.test(combined)) return 'southern'
    if (/french|paris|parisian/i.test(combined)) return 'french'
    if (/japanese|tokyo|japan/i.test(combined)) return 'japanese'
    if (/african|nigerian|lagos|yoruba/i.test(combined)) return 'african'
    if (/arabic|arab|saudi|riyadh/i.test(combined)) return 'arabic'
    return 'american'
  }

  const gender = inferGender(characterName || '', characterRole || '', characterAccent || '')
  const age = inferAge(characterRole || '', characterAccent || '')
  const accent = inferAccent(characterAccent || '', city || '', characterRole || '')

  // Select best matching voice
  let voice
  if (gender === 'female') {
    if (accent === 'british') {
      voice = age === 'young' ? VOICES.britishFemale : VOICES.britishFemale2
    } else if (accent === 'southern') {
      voice = VOICES.southernFemale
    } else {
      // American female
      if (age === 'young') voice = VOICES.youngAmericanFemale3  // Matilda — warm
      else if (age === 'old') voice = VOICES.midAmericanFemale
      else voice = VOICES.youngAmericanFemale4  // Domi — strong
    }
  } else {
    // Male
    if (accent === 'british') {
      if (age === 'young') voice = VOICES.youngBritishMale
      else if (age === 'old') voice = VOICES.britishMale2  // George — raspy
      else voice = VOICES.britishMale  // Daniel — deep
    } else if (accent === 'irish') {
      voice = VOICES.irishMale
    } else if (accent === 'italian') {
      voice = VOICES.italianMale
    } else {
      // American male (including default for non-European accents)
      if (age === 'young') voice = VOICES.youngAmericanMale  // Antoni — young, well-rounded
      else if (age === 'old') voice = VOICES.oldAmericanMale  // Jessie — old, raspy
      else voice = VOICES.midAmericanMale  // Adam — deep
    }
  }

  const voiceId = voice?.id || VOICES.midAmericanMale.id
  console.log(`Narrate: ${characterName} (${gender}/${age}/${accent}) → ${voice?.name || 'fallback'} [${voiceId}]`)

  // Adjust voice settings based on era type for mood
  const voiceSettings = {
    stability: eraType === 'past' ? 0.6 : 0.5,
    similarity_boost: 0.75,
    style: eraType === 'past' ? 0.3 : 0.1,
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text.slice(0, 3000),
          model_id: 'eleven_turbo_v2',
          voice_settings: voiceSettings,
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Narration TTS error:', err)
      return res.status(500).json({ error: 'TTS generation failed' })
    }

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    const { Readable } = await import('stream')
    Readable.fromWeb(response.body).pipe(res)
  } catch (err) {
    console.error('Narration error:', err)
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
