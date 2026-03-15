import Anthropic from '@anthropic-ai/sdk'
import { generateCharacterVideo } from './hedraService.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Scene definition for mission-1906: San Francisco Earthquake aftermath
 * Two survivors at Dolores Park, April 18, 1906 — hours after the quake
 */
export const SCENE_LIBRARY = {
  'mission-1906': {
    id: 'mission-1906',
    title: 'After the Shaking',
    location: 'Dolores Park, San Francisco',
    date: 'April 18, 1906 — late morning',
    setting: 'The earthquake struck at 5:12 AM. It is now midmorning. Fires are visible to the north and east. Dolores Park is filling with refugees carrying whatever they could grab. The Mission District survived the quake better than most neighborhoods, but the fires are spreading. Smoke hangs over everything.',
    characters: [
      {
        id: 'rosa',
        name: 'Rosa Castellano',
        role: 'Laundress, Mission District resident',
        age: 34,
        portraitUrl: 'https://i.ibb.co/gZJHjvqS/Rosa-Castellano.jpg',
        voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah — Mature, Confident
        voiceSettings: { stability: 0.45, similarity_boost: 0.8, style: 0.4 },
        textPrompt: 'A Mexican-American woman in her 30s speaking with emotion, dust on her face, worried but determined, natural head movements',
        description: 'Mexican-American laundress. Her tenement on 18th Street collapsed but she escaped with her two children. Her husband is away working the railroads. She is practical, traumatized, furious at the rich whose mansions burned while her neighborhood survived. She speaks English with a slight Mexican-American accent.',
      },
      {
        id: 'genthe',
        name: 'Arnold Genthe',
        role: 'Photographer',
        age: 36,
        portraitUrl: 'https://i.ibb.co/C3s2qPV7/Genthe.jpg',
        voiceId: 'nPczCjzI2devNBz1zQrb', // Brian — Deep, Resonant (German-accented)
        voiceSettings: { stability: 0.6, similarity_boost: 0.75, style: 0.25 },
        textPrompt: 'A German man in his 30s with wire-rimmed spectacles speaking carefully, observant eyes, slight urgency in expression, natural head movements',
        description: 'German-born photographer, precise and observational. He lived in Chinatown and photographed its streets for years. His studio on Sutter Street was destroyed. He borrowed a camera from a friend and has been photographing the destruction all morning. He speaks English with a faint German accent, choosing words carefully. He is haunted by what he has seen but compelled to document it.',
      },
    ],
    sceneDirection: `Write a dialogue between Rosa Castellano and Arnold Genthe. They are strangers who have just met in Dolores Park, San Francisco, on the morning of April 18, 1906, hours after the great earthquake.

Rosa is sitting on the grass with her two sleeping children. Her building collapsed. She is waiting and does not know what to do next. Genthe approaches carrying a borrowed camera, dusty and exhausted. He has been photographing the destruction all morning and pauses near her.

The conversation should feel real, not theatrical. Two exhausted, frightened people trying to make sense of what just happened. Rosa is practical: where will they sleep, is there water, when will the fires stop. Genthe is observational: he describes what he saw walking through the city, the scale of it. They are from different worlds but share this moment.

The dialogue should reveal:
- Rosa's tenement collapsed but the Mission survived better than downtown
- Genthe's Chinatown studio is gone, and Chinatown itself is destroyed
- The fires are still burning and spreading
- Neither knows how bad it will get
- A moment of unexpected human connection between strangers

Tone: exhausted, raw, real. Not sentimental. Two people processing shock in real time.`,
  },
  'mission-1906-fire': {
    id: 'mission-1906-fire',
    title: 'The Fire Comes',
    location: '20th & Mission, San Francisco',
    date: 'April 18, 1906 — late afternoon',
    setting: 'It is late afternoon. The fires that started downtown after the earthquake have been burning all day and are now approaching the Mission District. Soldiers are dynamiting buildings on Van Ness Avenue to create a firebreak, and the explosions can be heard every few minutes. Refugees are streaming south. Rosa and Genthe, who met that morning in Dolores Park, find each other again on Mission Street as people flee past them carrying belongings.',
    characters: [
      {
        id: 'rosa',
        name: 'Rosa Castellano',
        role: 'Laundress, Mission District resident',
        age: 34,
        portraitUrl: 'https://i.ibb.co/gZJHjvqS/Rosa-Castellano.jpg',
        voiceId: 'EXAVITQu4vr4xnSDxMaL',
        voiceSettings: { stability: 0.45, similarity_boost: 0.8, style: 0.4 },
        textPrompt: 'A Mexican-American woman in her 30s speaking urgently, soot on her face, frightened but resolute, natural head movements',
        description: 'Rosa is now more frightened than she was this morning. The fires are real, visible, close. She has her children with her and needs to decide: stay in the Mission and hope the fire stops, or join the refugees heading south toward the waterfront. Her husband is still unreachable. She has been given conflicting information by soldiers and neighbors. She is angry at the dynamiting, which she can hear and feel.',
      },
      {
        id: 'genthe',
        name: 'Arnold Genthe',
        role: 'Photographer',
        age: 36,
        portraitUrl: 'https://i.ibb.co/C3s2qPV7/Genthe.jpg',
        voiceId: 'nPczCjzI2devNBz1zQrb',
        voiceSettings: { stability: 0.6, similarity_boost: 0.75, style: 0.25 },
        textPrompt: 'A German man in his 30s with wire-rimmed spectacles speaking with quiet urgency, tired eyes, soot-covered, natural head movements',
        description: 'Genthe has been photographing all day. He has seen the full extent of the destruction. He has information Rosa does not: the Army is dynamiting buildings, the fire jumped Market Street hours ago, the waterfront is chaos. He is torn between continuing to document and helping people. He feels a responsibility to Rosa because she is alone with children.',
      },
    ],
    sceneDirection: `Write a dialogue between Rosa Castellano and Arnold Genthe. They met this morning as strangers in Dolores Park after the earthquake. Now it is late afternoon and the fires are approaching the Mission District. They recognize each other on Mission Street as crowds of refugees stream past.

Rosa has her two children with her. She has spent the day trying to find information: Is the fire coming this way? Should she stay or go? Soldiers told her conflicting things. She is exhausted and scared but trying to hold it together for the children.

Genthe has been photographing the destruction all day. He has walked the entire northern half of the city. He has seen things he cannot unsay. He now knows the scale of what is happening: this is not just a fire, it is the end of the city as they knew it. He tells Rosa what he has seen, not to frighten her but because she deserves the truth.

The conversation should feel urgent but not panicked. Two people who barely know each other but are now bound by circumstance. The explosions from the dynamiting should be referenced. Rosa must decide whether to flee south. Genthe offers to help but is pulled toward continuing to photograph.

The dialogue should reveal:
- The fire has crossed Market Street and is consuming everything north
- The Army is dynamiting buildings to create firebreaks, which terrifies people
- The Mission may or may not be spared
- Rosa has to make a decision now, with her children, without her husband
- Genthe feels guilty for photographing instead of helping
- Despite everything, there is a moment where these two people care about each other's fate

Tone: urgent, strained, human. The city is burning around them. They have hours, not days.`,
  },
}

/**
 * Generate a dialogue script using Claude
 * Returns an array of { speaker, characterId, text } objects
 */
export async function generateScript(sceneId) {
  const scene = SCENE_LIBRARY[sceneId]
  if (!scene) throw new Error(`Unknown scene: ${sceneId}`)

  const characterDescriptions = scene.characters
    .map(c => `${c.name} (${c.id}): ${c.description}`)
    .join('\n\n')

  const systemPrompt = `You are a screenwriter creating dialogue for a historical scene. You write naturalistic, historically grounded dialogue that sounds like real speech, not polished writing.

SCENE: ${scene.title}
LOCATION: ${scene.location}
DATE: ${scene.date}
SETTING: ${scene.setting}

CHARACTERS:
${characterDescriptions}

RULES:
- Write exactly 6-8 exchanges (12-16 total lines of dialogue)
- Each line should be 1-3 sentences, as if spoken aloud
- No stage directions, no action descriptions, no parentheticals
- Never use em dashes. Use commas, periods, or colons instead.
- The dialogue must feel like overheard conversation, not performance
- Include natural hesitations, incomplete thoughts, interruptions
- Each character should sound distinct: different vocabulary, rhythm, concerns
- The scene should build emotionally but end on an unresolved, human note
- Historical accuracy is critical: only reference things that existed in April 1906

OUTPUT FORMAT:
Return ONLY a JSON array. Each element is an object with:
- "speaker": the character's display name
- "characterId": "rosa" or "genthe"
- "text": the spoken line

Example:
[
  { "speaker": "Rosa Castellano", "characterId": "rosa", "text": "Line of dialogue here." },
  { "speaker": "Arnold Genthe", "characterId": "genthe", "text": "Response here." }
]

Return ONLY the JSON array, no markdown, no explanation.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: scene.sceneDirection,
      },
    ],
  })

  const rawText = response.content[0]?.text || ''
  console.log('Raw script response:', rawText)

  // Parse JSON — handle potential markdown wrapping
  const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const script = JSON.parse(jsonStr)

  // Validate structure
  if (!Array.isArray(script) || script.length < 4) {
    throw new Error('Script generation returned invalid format')
  }

  return script
}

/**
 * Concatenate all lines for a given character into a single text block
 * with brief pauses (represented by "..." for TTS) between lines
 */
export function getCharacterLines(script, characterId) {
  return script
    .filter(line => line.characterId === characterId)
    .map(line => line.text)
}

/**
 * Generate a complete scene: script + videos for all characters
 * Returns { script, videos: { characterId: { videoUrl, lines } } }
 *
 * Strategy: Each character gets ONE video containing all their lines spoken
 * as a continuous monologue. The frontend interleaves by cutting between
 * the two videos at timed intervals.
 */
export async function generateScene(sceneId) {
  const scene = SCENE_LIBRARY[sceneId]
  if (!scene) throw new Error(`Unknown scene: ${sceneId}`)

  // Validate portraits are set
  for (const char of scene.characters) {
    if (!char.portraitUrl) {
      throw new Error(`Portrait URL not set for character: ${char.name}. Generate Midjourney portraits first and update SCENE_LIBRARY.`)
    }
  }

  console.log(`\n========================================`)
  console.log(`GENERATING SCENE: ${scene.title}`)
  console.log(`========================================\n`)

  // Step 1: Generate the script
  console.log('STEP 1: Generating dialogue script...')
  const script = await generateScript(sceneId)
  console.log(`Script generated: ${script.length} lines`)
  script.forEach((line, i) => console.log(`  [${i}] ${line.speaker}: ${line.text.slice(0, 60)}...`))

  // Step 2: For each character, concatenate their lines and generate video
  console.log('\nSTEP 2: Generating character videos in parallel...')
  const videoPromises = scene.characters.map(async (char) => {
    const lines = getCharacterLines(script, char.id)
    const fullText = lines.join(' ... ')

    console.log(`\n--- ${char.name}: ${lines.length} lines, ${fullText.length} chars ---`)

    const result = await generateCharacterVideo({
      portraitUrl: char.portraitUrl,
      text: fullText,
      voiceId: char.voiceId,
      voiceSettings: char.voiceSettings,
      textPrompt: char.textPrompt,
    })

    return {
      characterId: char.id,
      name: char.name,
      videoUrl: result.videoUrl,
      downloadUrl: result.downloadUrl,
      lines,
      lineCount: lines.length,
    }
  })

  const videoResults = await Promise.all(videoPromises)

  // Step 3: Build the response
  const videos = {}
  for (const v of videoResults) {
    videos[v.characterId] = v
  }

  const result = {
    sceneId,
    title: scene.title,
    location: scene.location,
    date: scene.date,
    setting: scene.setting,
    script,
    videos,
    generatedAt: new Date().toISOString(),
  }

  console.log(`\n========================================`)
  console.log(`SCENE COMPLETE: ${scene.title}`)
  console.log(`Videos: ${Object.keys(videos).map(k => `${k}=${videos[k].videoUrl}`).join(', ')}`)
  console.log(`========================================\n`)

  return result
}
