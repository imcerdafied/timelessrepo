import { create } from 'zustand'
import locationsData from '../../../../packages/content/locations.json'

const locations = locationsData.locations

const useStore = create((set) => ({
  // Location state
  locations,
  selectedLocation: null,
  setSelectedLocation: (id) =>
    set((state) => {
      const location = state.locations.find((l) => l.id === id)
      return {
        selectedLocation: id,
        eras: location?.eras ?? [],
        selectedEra: location?.eras?.[0]?.id ?? null,
      }
    }),

  // Era state
  eras: [],
  selectedEra: null,
  setSelectedEra: (id) => set({ selectedEra: id }),
}))

export default useStore
