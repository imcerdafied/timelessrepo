import { create } from 'zustand'
import locationsData from '../data/locations.json'

const locations = locationsData.locations

const useStore = create((set, get) => ({
  // Location/zone state
  locations,
  selectedLocation: null,
  setSelectedLocation: (id) =>
    set((state) => {
      const location = state.locations.find((l) => l.id === id)
      const visitedZones = new Set(state.visitedZones)
      if (id) visitedZones.add(id)
      return {
        selectedLocation: id,
        eras: location?.eras ?? [],
        selectedEra: location?.eras?.[0]?.id ?? null,
        visitedZones,
      }
    }),

  // Era/layer state
  eras: [],
  selectedEra: null,
  setSelectedEra: (id) =>
    set((state) => {
      const visitedLayers = new Set(state.visitedLayers)
      if (id) visitedLayers.add(id)
      return { selectedEra: id, visitedLayers }
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
