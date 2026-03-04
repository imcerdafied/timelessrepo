const DID_API_KEY = process.env.DID_API_KEY
const ZOE_IMAGE_URL = process.env.ZOE_IMAGE_URL || 'https://xllwzunjvidtszyklhhm.supabase.co/storage/v1/object/public/characters/zoe.png'

export async function generateTalkVideo(text, voiceId = 'EXAVITQu4vr4xnSDxMaL') {
  if (!DID_API_KEY) throw new Error('DID_API_KEY not configured')

  // Create talk
  const createRes = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${DID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_url: ZOE_IMAGE_URL,
      script: {
        type: 'text',
        input: text.slice(0, 1000),
        provider: {
          type: 'elevenlabs',
          voice_id: voiceId,
        },
      },
      config: {
        stitch: true,
        result_format: 'mp4',
      },
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.text()
    throw new Error(`D-ID create failed: ${err}`)
  }

  const { id } = await createRes.json()

  // Poll for result
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 1000))

    const pollRes = await fetch(`https://api.d-id.com/talks/${id}`, {
      headers: { 'Authorization': `Basic ${DID_API_KEY}` },
    })

    if (!pollRes.ok) continue

    const talk = await pollRes.json()

    if (talk.status === 'done') {
      return talk.result_url
    }

    if (talk.status === 'error') {
      throw new Error(`D-ID talk failed: ${talk.error?.description || 'unknown'}`)
    }
  }

  throw new Error('D-ID talk timed out after 60s')
}
