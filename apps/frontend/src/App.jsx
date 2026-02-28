import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ExperienceWindow from './components/ExperienceWindow'
import GPSTrigger from './components/GPSTrigger'
import LocationSelector from './components/LocationSelector'
import Onboarding from './components/Onboarding'
import SplashScreen from './components/SplashScreen'
import TemporalRibbon from './components/TemporalRibbon'
import useStore from './store/useStore'

function App() {
  const selectedLocation = useStore((s) => s.selectedLocation)
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('onboarding_complete')
  )
  const [gpsDismissed, setGpsDismissed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  const handleGpsDismiss = useCallback(() => setGpsDismissed(true), [])

  return (
    <div className="flex h-dvh items-center justify-center bg-black">
      <div className="relative flex h-full w-full max-w-[390px] flex-col border-x border-border bg-background">
        <AnimatePresence mode="wait">
          {showSplash ? (
            <motion.div
              key="splash"
              className="flex-1"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <SplashScreen />
            </motion.div>
          ) : !selectedLocation ? (
            <motion.div
              key="selector"
              className="flex flex-1 flex-col overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              {!gpsDismissed && <GPSTrigger onDismiss={handleGpsDismiss} />}
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

        {/* Onboarding overlay — shows once, above everything */}
        <AnimatePresence>
          {showOnboarding && !showSplash && (
            <Onboarding onComplete={() => setShowOnboarding(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
