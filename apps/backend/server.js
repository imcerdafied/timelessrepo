import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { supabase } from './src/lib/supabase.js'
import { getActiveProperty, getProperties } from './src/lib/propertyConfig.js'
import characterRoutes from './src/routes/character.js'
import storyRoutes from './src/routes/story.js'
import sceneRoutes from './src/routes/scene.js'
import todayAtPropertyRoutes from './src/routes/today-at-property.js'
import cameraRoutes from './src/routes/camera.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const LEGACY_DISPATCH_ENABLED = process.env.ENABLE_LEGACY_DISPATCH === 'true'
const LEGACY_SCENES_ENABLED = process.env.ENABLE_LEGACY_SCENES === 'true'

// CORS — restrict to known origins in production
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:4173']
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  }
}))
app.use(express.json({ limit: '10mb' }))

// Supabase client imported from shared lib (src/lib/supabase.js)

// Rate limiting for routes that proxy to paid APIs (Anthropic, ElevenLabs)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,             // 20 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
})

// Character chat — Claude API proxy
app.use('/api/character', apiLimiter, characterRoutes)

// Story Universe — chat, TTS, voting
app.use('/api/story', apiLimiter, storyRoutes)

// Scene generation — AI-generated dialogue videos
app.use('/api/scene', apiLimiter, sceneRoutes)

// Legacy generic On This Day route retired with the San Francisco prototype.
app.use('/api/on-this-day', (_req, res) => {
  res.status(410).json({
    error: 'Legacy generic On This Day route retired',
    replacement: '/api/today-at-property',
  })
})

// Today at Property — daily content feed
app.use('/api/today-at-property', todayAtPropertyRoutes)

// Camera AI — image generation (expensive, tighter limit)
const cameraLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many image requests, please wait a moment' },
})
app.use('/api/camera', cameraLimiter, cameraRoutes)

// Serve pre-baked San Francisco scene assets only when explicitly enabled.
const scenesDir = path.join(__dirname, '..', '..', 'scenes')
if (LEGACY_SCENES_ENABLED && fs.existsSync(scenesDir)) {
  console.log('Scenes directory found, serving at /scenes')
  app.use('/scenes', express.static(scenesDir, {
    maxAge: '7d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.mp4')) res.setHeader('Content-Type', 'video/mp4')
      if (filePath.endsWith('.mp3')) res.setHeader('Content-Type', 'audio/mpeg')
    },
  }))
}

// Legacy scene manifest — retained for local archaeology, disabled for Phunware demos.
app.get('/api/scenes/manifest', (_req, res) => {
  if (!LEGACY_SCENES_ENABLED) {
    return res.json({
      scenes: [],
      retired: true,
      replacement: '/demo/atlantis/moment/lobby-royal-towers-modern',
    })
  }

  try {
    const sceneDir = path.join(scenesDir, '1906-earthquake')
    const scenes = []
    for (const file of ['scene1-data.json', 'scene2-data.json', 'scene3-data.json']) {
      const filePath = path.join(sceneDir, file)
      if (fs.existsSync(filePath)) {
        scenes.push(JSON.parse(fs.readFileSync(filePath, 'utf-8')))
      }
    }
    res.json({ scenes })
  } catch (err) {
    console.error('Scene manifest error:', err)
    res.status(500).json({ error: 'Failed to load scene manifest' })
  }
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', supabase: !!supabase })
})

// GET /api/artifacts/:locationId/:eraId
app.get('/api/artifacts/:locationId/:eraId', async (req, res) => {
  if (!supabase) return res.json({ count: 0, artifacts: [] })

  const { locationId, eraId } = req.params

  const { data, error, count } = await supabase
    .from('artifacts')
    .select('*', { count: 'exact' })
    .eq('location_id', locationId)
    .eq('era_id', eraId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Artifacts fetch error:', error)
    return res.status(500).json({ error: 'Failed to fetch artifacts' })
  }

  res.json({ count: count || 0, artifacts: data || [] })
})

// POST /api/artifacts
app.post('/api/artifacts', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not configured' })

  const {
    location_id,
    location_name,
    city,
    era_id,
    era_year,
    era_label,
    latitude,
    longitude,
    author_name,
    message,
    emoji,
  } = req.body

  // Validate required fields
  if (!location_id || !location_name || !city || !era_id || !era_year || !era_label) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const name = (author_name || 'Anonymous').slice(0, 50)
  const msg = message ? message.slice(0, 200) : null

  const { data, error } = await supabase
    .from('artifacts')
    .insert({
      location_id,
      location_name,
      city,
      era_id,
      era_year,
      era_label,
      latitude: latitude || null,
      longitude: longitude || null,
      author_name: name,
      message: msg,
      emoji: emoji || '📍',
    })
    .select('id, share_token')
    .single()

  if (error) {
    console.error('Artifact insert error:', error)
    return res.status(500).json({ error: 'Failed to create artifact' })
  }

  res.json({ success: true, artifact: data })
})

// Property configuration — makes the app white-label-ready
app.get('/api/property', (_req, res) => {
  const property = getActiveProperty()
  res.json({
    ...property,
    name: process.env.PROPERTY_NAME || property.name,
  })
})

app.get('/api/properties', (_req, res) => {
  res.json({ properties: getProperties() })
})

app.get('/api/properties/:slug', (req, res) => {
  const property = getProperties().find((item) => item.slug === req.params.slug || item.id === req.params.slug)
  if (!property) return res.status(404).json({ error: 'Unknown property' })
  res.json(property)
})

// BLE beacon simulation — returns simulated proximity data
app.get('/api/ble/simulate/:zoneId', (req, res) => {
  const { zoneId } = req.params
  const validZones = getActiveProperty()?.zones || []
  if (!validZones.includes(zoneId)) {
    return res.status(404).json({ error: 'Unknown zone' })
  }
  res.json({
    zone_id: zoneId,
    rssi: -45 - Math.floor(Math.random() * 20),
    distance_m: 1 + Math.random() * 10,
    timestamp: new Date().toISOString(),
    simulated: true,
  })
})

// Catch-all for unmatched /api routes (must come after all API registrations)
app.all('/api/{*splat}', (req, res) => {
  res.status(404).json({ error: 'API route not found', path: req.path })
})

// Serve the legacy story-feed at /dispatch only when explicitly enabled.
const storyDistPath = path.join(__dirname, '..', 'story-feed', 'dist')

if (LEGACY_DISPATCH_ENABLED && fs.existsSync(storyDistPath)) {
  console.log('Story-feed dist found, serving at /dispatch')
  app.use('/dispatch', express.static(storyDistPath))
  app.get('/dispatch/{*splat}', (req, res) => {
    res.sendFile(path.join(storyDistPath, 'index.html'))
  })
} else {
  const dispatchRetired = (_req, res) => {
    res.status(410).json({
      error: 'Legacy San Francisco dispatch demo retired',
      replacement: '/demos',
    })
  }
  app.get('/dispatch', dispatchRetired)
  app.get('/dispatch/{*splat}', dispatchRetired)
}

// Serve frontend static build (must come AFTER all /api routes)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist')

if (fs.existsSync(frontendDist)) {
  console.log('Frontend dist found, serving static files')
  app.use(express.static(frontendDist))
  app.use((req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
} else {
  console.error('WARNING: Frontend dist not found at', frontendDist)
  app.use((req, res) => {
    res.status(503).json({ error: 'Frontend not built', path: frontendDist })
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Frontend dist: ${frontendDist}`)
})
