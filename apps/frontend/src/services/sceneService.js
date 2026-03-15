/**
 * Scene generation service — calls backend to generate dialogue + video
 */

const API_BASE = import.meta.env.VITE_API_URL || ''

/**
 * List available scenes
 */
export async function listScenes() {
  const res = await fetch(`${API_BASE}/api/scene/list`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to list scenes')
  return data.scenes
}

/**
 * Get scene info (cached or definition)
 */
export async function getScene(sceneId) {
  const res = await fetch(`${API_BASE}/api/scene/${sceneId}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Scene not found')
  return data
}

/**
 * Generate just the script (no video) — fast preview
 */
export async function generateScript(sceneId) {
  const res = await fetch(`${API_BASE}/api/scene/script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sceneId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Script generation failed')
  return data.script
}

/**
 * Generate full scene (script + video for each character)
 * This takes a while (2-5 minutes for Hedra generation)
 */
export async function generateScene(sceneId, bustCache = false) {
  const res = await fetch(`${API_BASE}/api/scene/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sceneId, bustCache }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Scene generation failed')
  return data
}
