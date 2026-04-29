import { Router } from 'express'
import { SCENE_LIBRARY, generateScript, generateScene } from '../services/sceneService.js'

const router = Router()

// In-memory cache: sceneId → generated scene data
const sceneCache = new Map()

/**
 * GET /api/scene/list
 * Return available scenes
 */
router.get('/list', (req, res) => {
  const scenes = Object.values(SCENE_LIBRARY).map(s => ({
    id: s.id,
    title: s.title,
    location: s.location,
    date: s.date,
    characterCount: s.characters.length,
    characters: s.characters.map(c => ({ id: c.id, name: c.name, role: c.role })),
  }))
  res.json({ scenes })
})

/**
 * POST /api/scene/script
 * Generate just the dialogue script (no video), useful for previewing
 */
router.post('/script', async (req, res) => {
  const { sceneId } = req.body
  if (!sceneId) return res.status(400).json({ error: 'sceneId required' })

  try {
    const script = await generateScript(sceneId)
    res.json({ sceneId, script })
  } catch (err) {
    console.error('Script generation error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/scene/generate
 * Full pipeline: script → TTS → Hedra video for each character
 * Returns cached result if available
 */
router.post('/generate', async (req, res) => {
  const { sceneId, bustCache } = req.body
  if (!sceneId) return res.status(400).json({ error: 'sceneId required' })

  // Return cached result
  if (!bustCache && sceneCache.has(sceneId)) {
    console.log(`Returning cached scene: ${sceneId}`)
    return res.json({ cached: true, ...sceneCache.get(sceneId) })
  }

  try {
    const result = await generateScene(sceneId)
    sceneCache.set(sceneId, result)
    res.json({ cached: false, ...result })
  } catch (err) {
    console.error('Scene generation error:', err.message, err.stack)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/scene/:sceneId
 * Return cached scene data if it exists
 */
router.get('/:sceneId', (req, res) => {
  const { sceneId } = req.params
  if (sceneCache.has(sceneId)) {
    return res.json({ cached: true, ...sceneCache.get(sceneId) })
  }

  const sceneDef = SCENE_LIBRARY[sceneId]
  if (!sceneDef) return res.status(404).json({ error: 'Scene not found' })

  // Return the scene definition without generated content
  res.json({
    cached: false,
    generated: false,
    sceneId,
    title: sceneDef.title,
    location: sceneDef.location,
    date: sceneDef.date,
    setting: sceneDef.setting,
    characters: sceneDef.characters.map(c => ({
      id: c.id,
      name: c.name,
      role: c.role,
      hasPortrait: !!c.portraitUrl,
    })),
  })
})

export default router
