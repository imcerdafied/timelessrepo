const HEDRA_API_URL = 'https://api.hedra.com/web-app/public'
const HEDRA_API_KEY = process.env.HEDRA_API_KEY
const ZOE_IMAGE_URL = process.env.ZOE_IMAGE_URL

// Verify globals are available (Node 20+)
if (typeof FormData === 'undefined' || typeof Blob === 'undefined') {
  throw new Error('FormData/Blob not available — requires Node 20+')
}

export async function generateTalkVideo(text, audioBuffer) {
  if (!HEDRA_API_KEY) throw new Error('HEDRA_API_KEY not configured')
  if (!ZOE_IMAGE_URL) throw new Error('ZOE_IMAGE_URL not configured')
  const headers = { 'X-API-Key': HEDRA_API_KEY }

  // Step 1: Upload Zoe's image
  const imageResponse = await fetch(ZOE_IMAGE_URL)
  const imageBuffer = await imageResponse.arrayBuffer()
  const imageForm = new FormData()
  imageForm.append('file', new Blob([imageBuffer], { type: 'image/png' }), 'zoe.png')

  const imageUpload = await fetch(
    `${HEDRA_API_URL}/assets?type=image`,
    { method: 'POST', headers, body: imageForm }
  )
  const imageResult = await imageUpload.json()
  console.log('Hedra image upload:', JSON.stringify(imageResult))
  if (!imageUpload.ok) throw new Error(`Image upload failed: ${JSON.stringify(imageResult)}`)
  const imageId = imageResult.id

  // Step 2: Upload audio
  const audioForm = new FormData()
  audioForm.append('file', new Blob([audioBuffer], { type: 'audio/mpeg' }), 'scene.mp3')

  const audioUpload = await fetch(
    `${HEDRA_API_URL}/assets?type=audio`,
    { method: 'POST', headers, body: audioForm }
  )
  const audioResult = await audioUpload.json()
  console.log('Hedra audio upload:', JSON.stringify(audioResult))
  if (!audioUpload.ok) throw new Error(`Audio upload failed: ${JSON.stringify(audioResult)}`)
  const audioId = audioResult.id

  // Step 3: Submit generation
  const generateResponse = await fetch(
    `${HEDRA_API_URL}/characters`,
    {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageId,
        audioId,
        aspectRatio: '9:16',
        resolution: '720p',
        textPrompt: 'A woman speaking directly to camera, natural expressions, subtle head movement'
      })
    }
  )
  const generateResult = await generateResponse.json()
  console.log('Hedra generate:', JSON.stringify(generateResult))
  if (!generateResponse.ok) throw new Error(`Generate failed: ${JSON.stringify(generateResult)}`)

  const jobId = generateResult.jobId || generateResult.id || generateResult.job_id

  // Step 4: Poll until complete (max 120 seconds)
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000))

    const statusResponse = await fetch(
      `${HEDRA_API_URL}/characters/${jobId}`,
      { headers }
    )
    const job = await statusResponse.json()
    console.log(`Hedra poll ${i}:`, JSON.stringify(job))

    if (job.status === 'completed' || job.status === 'done') {
      return job.videoUrl || job.video_url || job.url || job.result_url
    }
    if (job.status === 'failed' || job.status === 'error') {
      throw new Error(`Hedra job failed: ${JSON.stringify(job)}`)
    }
  }

  throw new Error('Hedra timed out after 120 seconds')
}
