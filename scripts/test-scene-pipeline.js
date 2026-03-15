/**
 * End-to-end test of the scene generation pipeline.
 *
 * Usage:
 *   # Script only (fast, ~5s):
 *   ANTHROPIC_API_KEY=sk_xxx node scripts/test-scene-pipeline.js script
 *
 *   # Full pipeline (script + TTS + Hedra video, ~3-5 min):
 *   ANTHROPIC_API_KEY=sk_xxx ELEVENLABS_API_KEY=sk_xxx HEDRA_API_KEY=sk_xxx node scripts/test-scene-pipeline.js full
 */

const mode = process.argv[2] || 'script'

async function testScript() {
  console.log('\n=== STEP 1: Generate Dialogue Script ===\n')

  const { generateScript } = await import('../apps/backend/src/services/sceneService.js')
  const script = await generateScript('mission-1906')

  console.log(`Generated ${script.length} lines of dialogue:\n`)
  script.forEach((line, i) => {
    console.log(`  [${line.characterId.toUpperCase().padEnd(7)}] ${line.speaker}:`)
    console.log(`           "${line.text}"`)
    console.log()
  })

  return script
}

async function testFull() {
  console.log('\n=== FULL PIPELINE TEST ===\n')

  const { generateScene } = await import('../apps/backend/src/services/sceneService.js')
  const startTime = Date.now()
  const result = await generateScene('mission-1906')
  const elapsed = Math.round((Date.now() - startTime) / 1000)

  console.log(`\n=== RESULT (${elapsed}s) ===\n`)
  console.log(`Title: ${result.title}`)
  console.log(`Script: ${result.script.length} lines`)
  console.log(`\nVideos:`)
  for (const [id, v] of Object.entries(result.videos)) {
    console.log(`  ${v.name}: ${v.videoUrl}`)
    console.log(`    Lines: ${v.lineCount}`)
  }
  console.log(`\nGenerated at: ${result.generatedAt}`)

  return result
}

async function main() {
  try {
    if (mode === 'full') {
      await testFull()
    } else {
      await testScript()
    }
    console.log('\n✅ Test passed!\n')
  } catch (err) {
    console.error('\n❌ Test failed:', err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

main()
