const baseUrl = (process.env.BASE_URL || process.argv[2] || 'http://localhost:3001').replace(/\/$/, '')
const checkChat = process.env.CHECK_CHAT === '1'

const routes = [
  '/',
  '/demos',
  '/demo/atlantis/trails',
  '/demo/atlantis/trail/pirate-nassau/0',
  '/demo/atlantis/passport',
  '/demo/atlantis/timelens/marina-beach-colonial',
  '/demo/atlantis/signals',
]

const assetChecks = [
  'Timeless Moment',
  'Choose a guest journey',
  'Trail checkpoint',
  'Back to Demos',
]

const failures = []

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`
  const response = await fetch(url, options)
  return { url, response, text: await response.text() }
}

function assert(condition, message) {
  if (!condition) failures.push(message)
}

for (const route of routes) {
  try {
    const { response } = await request(route)
    assert(response.ok, `${route} returned ${response.status}`)
  } catch (err) {
    failures.push(`${route} failed: ${err.message}`)
  }
}

try {
  const { response, text } = await request('/api/health')
  assert(response.ok, `/api/health returned ${response.status}`)
  assert(text.includes('"status":"ok"'), '/api/health did not report ok')
} catch (err) {
  failures.push(`/api/health failed: ${err.message}`)
}

try {
  const { response, text } = await request('/api/property')
  assert(response.ok, `/api/property returned ${response.status}`)
  assert(text.includes('"slug":"atlantis"'), '/api/property did not return Atlantis')
} catch (err) {
  failures.push(`/api/property failed: ${err.message}`)
}

try {
  const { response } = await request('/era-images/marina-beach-colonial.jpg')
  assert(response.ok, `/era-images/marina-beach-colonial.jpg returned ${response.status}`)
} catch (err) {
  failures.push(`/era-images/marina-beach-colonial.jpg failed: ${err.message}`)
}

try {
  const { text: html } = await request('/')
  const jsAssets = [...html.matchAll(/assets\/index-[^"']+\.js/g)].map((match) => `/${match[0]}`)
  assert(jsAssets.length > 0, 'No frontend JS bundle found in index.html')
  const bundleText = (await Promise.all(jsAssets.map((asset) => request(asset).then((result) => result.text)))).join('\n')
  for (const expected of assetChecks) {
    assert(bundleText.includes(expected), `Frontend bundle missing "${expected}"`)
  }
} catch (err) {
  failures.push(`Frontend bundle check failed: ${err.message}`)
}

if (checkChat) {
  try {
    const { response, text } = await request('/api/character/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_prompt: 'You are Anne Bonny, a pirate in Nassau.',
        accent: 'Irish Caribbean pirate, direct and vivid',
        messages: [{ role: 'user', content: 'Where should I go in Nassau if I want trouble?' }],
        visit_context: { zones_visited: [], layers_visited: [], today_events: [] },
      }),
    })
    assert(response.ok, `/api/character/chat returned ${response.status}`)
    assert(text.includes('response'), '/api/character/chat did not return a response field')
  } catch (err) {
    failures.push(`/api/character/chat failed: ${err.message}`)
  }
}

if (failures.length) {
  console.error(`Demo smoke failed for ${baseUrl}`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Demo smoke passed for ${baseUrl}`)
