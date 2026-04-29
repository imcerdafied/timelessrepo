import { create } from 'zustand'
import { getPropertyLocations } from '../config/properties'

const locations = getPropertyLocations()
const PASSPORT_STORAGE_KEY = 'timeless_passport_v1'

function readPassport() {
  if (typeof localStorage === 'undefined') return []
  try {
    const parsed = JSON.parse(localStorage.getItem(PASSPORT_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function savePassport(stamps) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(stamps))
  } catch {}
}

function addStamp(stamps, stamp) {
  if (!stamp?.id || stamps.some((item) => item.id === stamp.id)) return stamps
  const next = [...stamps, { ...stamp, unlockedAt: new Date().toISOString() }]
  savePassport(next)
  return next
}

function zoneStamp(location) {
  if (!location) return null
  return {
    id: `zone:${location.id}`,
    type: 'zone',
    label: location.name,
  }
}

function layerStamp(location, layerId) {
  const layer = location?.eras?.find((era) => era.id === layerId)
  if (!layer) return null
  return {
    id: `layer:${layer.id}`,
    type: 'layer',
    label: layer.headline || layer.label,
    detail: location.name,
  }
}

const useStore = create((set, get) => ({
  // Location/zone state
  locations,
  selectedLocation: null,
  setSelectedLocation: (id) =>
    set((state) => {
      const location = state.locations.find((l) => l.id === id)
      const visitedZones = new Set(state.visitedZones)
      if (id) visitedZones.add(id)
      const defaultEraId = location?.eras?.[0]?.id ?? null
      const stampsWithZone = addStamp(state.passportStamps, zoneStamp(location))
      const passportStamps = defaultEraId
        ? addStamp(stampsWithZone, layerStamp(location, defaultEraId))
        : stampsWithZone
      return {
        selectedLocation: id,
        eras: location?.eras ?? [],
        selectedEra: defaultEraId,
        visitedZones,
        passportStamps,
      }
    }),

  // Era/layer state
  eras: [],
  selectedEra: null,
  setSelectedEra: (id) =>
    set((state) => {
      const visitedLayers = new Set(state.visitedLayers)
      if (id) visitedLayers.add(id)
      const location = state.locations.find((item) => item.eras?.some((era) => era.id === id))
      return {
        selectedEra: id,
        visitedLayers,
        passportStamps: addStamp(state.passportStamps, layerStamp(location, id)),
      }
    }),

  // BLE simulation
  bleSimEnabled: true,
  bleSimZone: null,
  setBleSimZone: (zoneId) => set({ bleSimZone: zoneId }),
  toggleBleSim: () => set((s) => ({ bleSimEnabled: !s.bleSimEnabled })),

  // Demo mode
  demoMode: true,

  // Visit tracking (behavioral signal)
  visitedZones: new Set(),
  visitedLayers: new Set(),
  passportStamps: readPassport(),
  awardStamp: (stamp) =>
    set((state) => ({
      passportStamps: addStamp(state.passportStamps, stamp),
    })),
  getVisitSummary: () => {
    const state = get()
    return {
      zones: [...state.visitedZones],
      layers: [...state.visitedLayers],
      zoneCount: state.visitedZones.size,
      layerCount: state.visitedLayers.size,
    }
  },
}))

export default useStore
