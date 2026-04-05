// scripts/generate-images.js
// Usage: OPENAI_API_KEY=... node scripts/generate-images.js [zone-id]
// Generates one unique image per era using OpenAI gpt-image-1
// Saves to apps/frontend/src/data/imageMap.js

import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is required')
  process.exit(1)
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Load locations data
const locationsPath = path.join(__dirname, '..', 'packages', 'content', 'locations.json')
const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf-8')).locations

// Load current image map to check what already exists
const imageMapPath = path.join(__dirname, '..', 'apps', 'frontend', 'src', 'data', 'imageMap.js')

// Output directory for generated images (local storage before Supabase upload)
const outputDir = path.join(__dirname, '..', 'generated-images')
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

async function generateImage(zone, era) {
  const eraId = era.id
  const outputPath = path.join(outputDir, `${eraId}.png`)

  // Skip if already generated
  if (fs.existsSync(outputPath)) {
    console.log(`  SKIP ${eraId} (already exists)`)
    return outputPath
  }

  const prompt = `A photorealistic scene of ${zone.name} (${zone.subtext}) during ${era.label} (${era.year_display || 'non-temporal layer'}).

${era.landscape || era.description?.slice(0, 300) || ''}

Style: editorial travel photography, cinematic lighting, 16:9 landscape composition. Photorealistic, high detail. No text, no watermarks, no UI elements.`

  console.log(`  Generating ${eraId}...`)

  try {
    const response = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1536x1024',
      quality: 'high',
      n: 1,
    })

    const b64 = response.data?.[0]?.b64_json
    if (!b64) throw new Error('No image data in response')

    fs.writeFileSync(outputPath, Buffer.from(b64, 'base64'))
    console.log(`  SAVED ${eraId}`)

    // Rate limit: 2 seconds between calls
    await new Promise(r => setTimeout(r, 2000))

    return outputPath
  } catch (err) {
    console.error(`  ERROR ${eraId}: ${err.message}`)
    return null
  }
}

async function main() {
  const targetZone = process.argv[2]

  const zonesToProcess = targetZone
    ? locations.filter(z => z.id === targetZone)
    : locations

  if (zonesToProcess.length === 0) {
    console.error(`Zone not found: ${targetZone}`)
    console.log('Available:', locations.map(z => z.id).join(', '))
    process.exit(1)
  }

  let generated = 0
  let failed = 0

  for (const zone of zonesToProcess) {
    console.log(`\nZone: ${zone.name} (${zone.id})`)
    for (const era of zone.eras || []) {
      const result = await generateImage(zone, era)
      if (result) generated++
      else failed++
    }
  }

  console.log(`\nDone. Generated: ${generated}, Failed: ${failed}`)
  console.log(`Images saved to: ${outputDir}`)
  console.log(`\nNext step: Upload images to Supabase Storage bucket 'era-images'`)
  console.log(`Then update apps/frontend/src/data/imageMap.js with the Supabase URLs`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
