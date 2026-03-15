// Uses Node.js native FormData/Blob (Node 18+) — no npm form-data needed

const HEDRA_API_URL = 'https://api.hedra.com/web-app/public'
const HEDRA_API_KEY = process.env.HEDRA_API_KEY
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

/**
 * Upload a portrait image to Hedra from a URL or buffer
 * Returns the Hedra asset ID
 */
export async function uploadPortrait(imageUrlOrBuffer) {
  if (!HEDRA_API_KEY) throw new Error('HEDRA_API_KEY not configured')

  // Step 1: Create asset placeholder
  const createRes = await fetch(`${HEDRA_API_URL}/assets`, {
    method: 'POST',
    headers: {
      'x-api-key': HEDRA_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: 'portrait.jpg', type: 'image' }),
  })
  const createResult = await createRes.json()
  console.log('Hedra create image asset:', JSON.stringify(createResult))
  if (!createRes.ok) throw new Error(`Asset create failed: ${JSON.stringify(createResult)}`)
  const assetId = createResult.id

  // Step 2: Fetch image if URL, otherwise use buffer directly
  let imageBuffer
  if (typeof imageUrlOrBuffer === 'string') {
    const imgRes = await fetch(imageUrlOrBuffer)
    if (!imgRes.ok) throw new Error(`Failed to fetch portrait image: ${imgRes.status}`)
    imageBuffer = Buffer.from(await imgRes.arrayBuffer())
  } else {
    imageBuffer = Buffer.from(imageUrlOrBuffer)
  }

  // Step 3: Upload using native FormData + Blob
  const blob = new Blob([imageBuffer], { type: 'image/jpeg' })
  const form = new FormData()
  form.append('file', blob, 'portrait.jpg')

  const uploadRes = await fetch(`${HEDRA_API_URL}/assets/${assetId}/upload`, {
    method: 'POST',
    headers: { 'x-api-key': HEDRA_API_KEY },
    body: form,
  })
  const uploadResult = await uploadRes.json()
  console.log('Hedra upload portrait:', JSON.stringify(uploadResult))
  if (!uploadRes.ok) throw new Error(`Portrait upload failed: ${JSON.stringify(uploadResult)}`)

  return assetId
}

/**
 * Upload audio to Hedra from a buffer
 * Returns the Hedra asset ID
 */
export async function uploadAudio(audioBuffer) {
  if (!HEDRA_API_KEY) throw new Error('HEDRA_API_KEY not configured')

  // Step 1: Create asset placeholder
  const createRes = await fetch(`${HEDRA_API_URL}/assets`, {
    method: 'POST',
    headers: {
      'x-api-key': HEDRA_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: 'audio.mp3', type: 'audio' }),
  })
  const createResult = await createRes.json()
  console.log('Hedra create audio asset:', JSON.stringify(createResult))
  if (!createRes.ok) throw new Error(`Audio asset create failed: ${JSON.stringify(createResult)}`)
  const assetId = createResult.id

  // Step 2: Upload using native FormData + Blob
  const blob = new Blob([audioBuffer], { type: 'audio/mpeg' })
  const form = new FormData()
  form.append('file', blob, 'audio.mp3')

  const uploadRes = await fetch(`${HEDRA_API_URL}/assets/${assetId}/upload`, {
    method: 'POST',
    headers: { 'x-api-key': HEDRA_API_KEY },
    body: form,
  })
  const uploadResult = await uploadRes.json()
  console.log('Hedra upload audio:', JSON.stringify(uploadResult))
  if (!uploadRes.ok) throw new Error(`Audio upload failed: ${JSON.stringify(uploadResult)}`)

  return assetId
}

// Hedra Character 3 — flagship talking-head model with lip sync
const CHARACTER_3_MODEL_ID = 'd1dd37a3-e39a-4854-a298-6510289f9cf2'

/**
 * Get the Character 3 model ID
 */
export async function getModelId() {
  return CHARACTER_3_MODEL_ID
}

/**
 * Submit a video generation job to Hedra
 * Returns the generation ID for polling
 */
export async function submitGeneration({ portraitAssetId, audioAssetId, modelId, textPrompt }) {
  if (!HEDRA_API_KEY) throw new Error('HEDRA_API_KEY not configured')

  const body = {
    type: 'video',
    ai_model_id: modelId,
    start_keyframe_id: portraitAssetId,
    generated_video_inputs: {
      text_prompt: textPrompt || 'A person speaking directly to camera with natural expressions',
      resolution: '720p',
      aspect_ratio: '9:16',
    },
    audio_id: audioAssetId,
  }

  const res = await fetch(`${HEDRA_API_URL}/generations`, {
    method: 'POST',
    headers: {
      'x-api-key': HEDRA_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const result = await res.json()
  console.log('Hedra submit generation:', JSON.stringify(result))
  if (!res.ok) throw new Error(`Generation submit failed: ${JSON.stringify(result)}`)

  return result.id || result.jobId || result.job_id || result.generation_id
}

/**
 * Poll a generation job until complete
 * Returns { videoUrl, downloadUrl }
 */
export async function pollGeneration(generationId, maxWaitMs = 480000) {
  if (!HEDRA_API_KEY) throw new Error('HEDRA_API_KEY not configured')

  const startTime = Date.now()
  const pollInterval = 5000 // 5 seconds per Hedra recommendation

  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(r => setTimeout(r, pollInterval))

    const res = await fetch(`${HEDRA_API_URL}/generations/${generationId}/status`, {
      headers: { 'x-api-key': HEDRA_API_KEY },
    })
    const job = await res.json()
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    console.log(`Hedra poll [${elapsed}s]:`, JSON.stringify(job))

    if (job.status === 'complete' || job.status === 'completed' || job.status === 'done') {
      return {
        videoUrl: job.url || job.videoUrl || job.video_url || job.result_url,
        downloadUrl: job.download_url || job.downloadUrl || null,
      }
    }
    if (job.status === 'failed' || job.status === 'error') {
      throw new Error(`Hedra generation failed: ${JSON.stringify(job)}`)
    }
  }

  throw new Error(`Hedra generation timed out after ${maxWaitMs / 1000}s`)
}

/**
 * Generate ElevenLabs TTS audio from text
 * Returns audio buffer (MP3)
 */
export async function generateTTS(text, voiceId, voiceSettings = {}) {
  if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY not configured')

  const settings = {
    stability: voiceSettings.stability || 0.5,
    similarity_boost: voiceSettings.similarity_boost || 0.75,
    style: voiceSettings.style || 0.3,
    use_speaker_boost: true,
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text.slice(0, 2000),
        model_id: 'eleven_multilingual_v2',
        voice_settings: settings,
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ElevenLabs TTS failed: ${err}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

/**
 * Full pipeline: portrait URL + text + voice → Hedra video URL
 * This is the high-level function that orchestrates everything for one character.
 */
export async function generateCharacterVideo({ portraitUrl, text, voiceId, voiceSettings, textPrompt }) {
  console.log(`\n=== Generating character video ===`)
  console.log(`Portrait: ${portraitUrl}`)
  console.log(`Text length: ${text.length} chars`)
  console.log(`Voice: ${voiceId}`)

  // Step 1: Generate TTS audio
  console.log('Step 1: Generating TTS audio...')
  const audioBuffer = await generateTTS(text, voiceId, voiceSettings)
  console.log(`Audio generated: ${audioBuffer.length} bytes`)

  // Step 2: Upload portrait to Hedra
  console.log('Step 2: Uploading portrait...')
  const portraitAssetId = await uploadPortrait(portraitUrl)
  console.log(`Portrait asset: ${portraitAssetId}`)

  // Step 3: Upload audio to Hedra
  console.log('Step 3: Uploading audio...')
  const audioAssetId = await uploadAudio(audioBuffer)
  console.log(`Audio asset: ${audioAssetId}`)

  // Step 4: Get model ID
  console.log('Step 4: Getting model...')
  const modelId = await getModelId()
  console.log(`Model: ${modelId}`)

  // Step 5: Submit generation
  console.log('Step 5: Submitting generation...')
  const generationId = await submitGeneration({
    portraitAssetId,
    audioAssetId,
    modelId,
    textPrompt,
  })
  console.log(`Generation ID: ${generationId}`)

  // Step 6: Poll until complete
  console.log('Step 6: Polling for completion...')
  const result = await pollGeneration(generationId)
  console.log(`Video ready: ${result.videoUrl}`)

  return result
}
