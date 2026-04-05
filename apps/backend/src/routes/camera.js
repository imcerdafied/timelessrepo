import { Router } from 'express'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import os from 'os'

const router = Router()

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

router.post('/time-travel', async (req, res) => {
  if (!client) {
    return res.status(503).json({ error: 'OPENAI_API_KEY not configured' })
  }

  const { image, era_id, era_label, era_year, era_description, era_landscape } = req.body

  if (!image || !era_id) {
    return res.status(400).json({ error: 'Missing required fields: image, era_id' })
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const tmpPath = path.join(os.tmpdir(), `timeless-camera-${Date.now()}.png`)
    fs.writeFileSync(tmpPath, Buffer.from(base64Data, 'base64'))

    const prompt = `Transform this photograph to show what this exact location looked like during the ${era_label} era (${era_year || 'historical period'}).

Scene context: ${era_landscape || ''}

Historical context: ${(era_description || '').slice(0, 500)}

CRITICAL: Maintain the same camera angle, framing, and composition as the original photo. Transform the buildings, vegetation, sky, and atmosphere to match the historical period. Photorealistic style, editorial travel photography quality. No text or watermarks.`

    const response = await client.images.edit({
      model: 'gpt-image-1',
      image: fs.createReadStream(tmpPath),
      prompt,
      size: '1024x1024',
    })

    try { fs.unlinkSync(tmpPath) } catch {}

    const b64 = response.data?.[0]?.b64_json
    if (!b64) {
      return res.status(500).json({ error: 'No image generated' })
    }

    res.json({ generated_image: `data:image/png;base64,${b64}` })
  } catch (err) {
    console.error('Camera time-travel error:', err.message)
    res.status(500).json({ error: 'Image generation failed. Please try again.' })
  }
})

router.post('/selfie', async (req, res) => {
  if (!client) {
    return res.status(503).json({ error: 'OPENAI_API_KEY not configured' })
  }

  const { image, era_id, era_label, era_year, era_description, era_landscape, zone_name } = req.body

  if (!image || !era_id) {
    return res.status(400).json({ error: 'Missing required fields: image, era_id' })
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const tmpPath = path.join(os.tmpdir(), `timeless-selfie-${Date.now()}.png`)
    fs.writeFileSync(tmpPath, Buffer.from(base64Data, 'base64'))

    const prompt = `Place this person into a scene at ${zone_name || 'a tropical resort'} during the ${era_label} era (${era_year || 'historical period'}).

Scene: ${era_landscape || ''}

The person should appear naturally in the scene as if they are visiting this place during this time period. Maintain their exact likeness, facial features, hair, and expression. The historical scene should surround them as their environment. Photorealistic, editorial travel photography quality. No text or watermarks.`

    const response = await client.images.edit({
      model: 'gpt-image-1',
      image: fs.createReadStream(tmpPath),
      prompt,
      size: '1024x1024',
    })

    try { fs.unlinkSync(tmpPath) } catch {}

    const b64 = response.data?.[0]?.b64_json
    if (!b64) {
      return res.status(500).json({ error: 'No image generated' })
    }

    res.json({ generated_image: `data:image/png;base64,${b64}` })
  } catch (err) {
    console.error('Camera selfie error:', err.message)
    res.status(500).json({ error: 'Image generation failed. Please try again.' })
  }
})

export default router
