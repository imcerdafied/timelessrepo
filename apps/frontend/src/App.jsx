import { AnimatePresence, motion } from 'framer-motion'
import ExperienceWindow from './components/ExperienceWindow'
import LocationSelector from './components/LocationSelector'
import TemporalRibbon from './components/TemporalRibbon'
import useStore from './store/useStore'

function App() {
  const selectedLocation = useStore((s) => s.selectedLocation)

  return (
    <div className="flex h-dvh items-center justify-center bg-black">
      <div className="relative flex h-full w-full max-w-[390px] flex-col border-x border-border bg-background">
        <AnimatePresence mode="wait">
          {!selectedLocation ? (
            <motion.div
              key="selector"
              className="flex-1 overflow-hidden"
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              <LocationSelector />
            </motion.div>
          ) : (
            <motion.div
              key="experience"
              className="flex flex-1 flex-col overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative flex-1 overflow-hidden">
                <ExperienceWindow />
              </div>
              <TemporalRibbon />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
