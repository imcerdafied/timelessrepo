import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const systemPrompt = `You are a screenwriter creating dialogue for a historical scene. You write naturalistic, historically grounded dialogue that sounds like real speech, not polished writing.

SCENE: The First Night
LOCATION: Golden Gate Park, San Francisco
DATE: April 18, 1906 — nightfall
SETTING: Night has fallen on the first day after the earthquake. The sky is bright orange from the fires consuming the city. Golden Gate Park has become a massive refugee camp, thousands of people sleeping on the grass. Rosa has brought her children here after fleeing the Mission. Genthe found her as he promised. They sit near a small campfire someone else built, watching the glow of the burning city on the horizon. The children are asleep.

CHARACTERS:
Rosa Castellano (rosa): Rosa made it to the park with her children. She is exhausted beyond measure but cannot sleep. The orange sky terrifies her. She has not heard from her husband. She is past the crisis mode of the day and now the enormity of what has happened is settling on her. She is quieter than before.

Arnold Genthe (genthe): Genthe kept his promise and found Rosa before dark. He has exposed all the film he had. He has nothing left to photograph with. For the first time today he is sitting still. Without the camera between him and reality, the day is hitting him. He is more vulnerable than he was before.

RULES:
- Write exactly 6-8 exchanges (12-16 total lines of dialogue)
- Each line should be 1-3 sentences, as if spoken aloud
- No stage directions, no action descriptions, no parentheticals
- Never use em dashes. Use commas, periods, or colons instead.
- The dialogue must feel like overheard conversation, not performance
- Include natural hesitations, incomplete thoughts
- This is the quiet scene. The day is over. They are looking at the fire from a distance.
- The emotional register is lower: exhaustion, grief, small moments of care
- Historical accuracy is critical: only reference things that existed in April 1906

OUTPUT FORMAT:
Return ONLY a JSON array. Each element is an object with:
- "speaker": the character's display name
- "characterId": "rosa" or "genthe"
- "text": the spoken line

Return ONLY the JSON array, no markdown, no explanation.`

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2000,
  system: systemPrompt,
  messages: [{ role: 'user', content: 'Write the dialogue for this quiet nighttime scene.' }],
})

const rawText = response.content[0]?.text || ''
const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
const script = JSON.parse(jsonStr)
console.log('Script:', script.length, 'lines')
script.forEach((l, i) => console.log(`  [${i}] ${l.speaker}: ${l.text.substring(0, 80)}`))

// Generate TTS
for (const charId of ['rosa', 'genthe']) {
  const lines = script.filter(l => l.characterId === charId).map(l => l.text)
  const fullText = lines.join(' ... ')
  console.log(`\nTTS for ${charId} (${fullText.length} chars)...`)

  const voiceId = charId === 'rosa' ? 'EXAVITQu4vr4xnSDxMaL' : 'nPczCjzI2devNBz1zQrb'
  const voiceSettings = charId === 'rosa'
    ? { stability: 0.5, similarity_boost: 0.8, style: 0.3 }
    : { stability: 0.65, similarity_boost: 0.75, style: 0.2 }

  const ttsRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: fullText, model_id: 'eleven_multilingual_v2', voice_settings: voiceSettings }),
  })

  if (!ttsRes.ok) throw new Error('TTS failed: ' + await ttsRes.text())
  const buf = Buffer.from(await ttsRes.arrayBuffer())
  fs.writeFileSync('scenes/1906-earthquake/' + charId + '-night.mp3', buf)
  console.log(`Saved: ${charId}-night.mp3 (${buf.length} bytes)`)
}

// Save scene data
const sceneData = {
  sceneId: 'mission-1906-night',
  title: 'The First Night',
  location: 'Golden Gate Park, San Francisco',
  date: 'April 18, 1906 — nightfall',
  setting: 'Night has fallen on the first day after the earthquake. The sky is bright orange from the fires consuming the city to the east. Golden Gate Park has become a massive refugee camp. Rosa and Genthe sit near a small campfire. The children are asleep. For the first time all day, there is stillness.',
  mode: 'cinematic',
  script,
  characters: [
    { id: 'rosa', name: 'Rosa Castellano', role: 'Laundress, Mission District resident', portraitUrl: 'https://i.ibb.co/gZJHjvqS/Rosa-Castellano.jpg' },
    { id: 'genthe', name: 'Arnold Genthe', role: 'Photographer', portraitUrl: 'https://i.ibb.co/C3s2qPV7/Genthe.jpg' },
  ],
  audioFiles: { rosa: 'rosa-night.mp3', genthe: 'genthe-night.mp3' },
  ambientAudio: 'ambient-fire.mp3',
  backgroundImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/San_Francisco_in_ruin_edit2.jpg/1280px-San_Francisco_in_ruin_edit2.jpg',
  generatedAt: new Date().toISOString(),
}
fs.writeFileSync('scenes/1906-earthquake/scene3-data.json', JSON.stringify(sceneData, null, 2))
console.log('\nScene 3 saved!')
