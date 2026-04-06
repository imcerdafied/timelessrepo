// Resort image map: AI-generated images for all 45 zone × layer combos.
// Images served from /era-images/ (public directory).

const CURATED = {}

// Auto-populate from the 5 zones × 9 layers
const ZONES = ['marina-beach', 'lobby-royal-towers', 'waterpark-pools', 'casino-nightlife', 'marine-habitat']
const LAYERS = ['deep-past', 'colonial', 'early-tourism', 'resort-era', 'modern', 'present', 'culture', 'behind-scenes', 'future']

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
