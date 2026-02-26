import { create } from 'zustand'
import eras from '../data/eras'

const useStore = create((set) => ({
  eras,
  selectedEra: eras[0].id,
  setSelectedEra: (id) => set({ selectedEra: id }),
}))

export default useStore
