import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import characterRoutes from './src/routes/character.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Supabase client — requires env vars
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

let supabase = null
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

// Character chat — Claude API proxy
app.use('/api/character', characterRoutes)

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

// Serve frontend static build in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist')
app.use(express.static(frontendDist))
app.use((req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
