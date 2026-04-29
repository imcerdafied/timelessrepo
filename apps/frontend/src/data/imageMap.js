// Resort image map: AI-generated images for all 45 zone × layer combos.
// Images served from /era-images/ (public directory).
import { ACTIVE_PROPERTY } from '../config/properties'

const CURATED = {}

// Auto-populate from the active property's zone × layer manifest.
const ZONES = ACTIVE_PROPERTY.zones
const LAYERS = ACTIVE_PROPERTY.layers

for (const zone of ZONES) {
  for (const layer of LAYERS) {
    const id = `${zone}-${layer}`
    CURATED[id] = `/era-images/${id}.jpg`
  }
}

// Images that would only appear when physically at the location (BLE-triggered)
export const BLE_TRIGGERED = new Set(
  ZONES.map(z => `${z}-present`)
)

export function getCuratedImage(eraId) {
  return CURATED[eraId] || null
}

export function isBleTriggered(eraId) {
  return BLE_TRIGGERED.has(eraId)
}

export default CURATED
