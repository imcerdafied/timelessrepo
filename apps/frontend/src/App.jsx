import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ExperienceWindow from './components/ExperienceWindow'
import GPSTrigger from './components/GPSTrigger'
import LocationSelector from './components/LocationSelector'
import Onboarding from './components/Onboarding'
import OnThisDayScreen from './components/OnThisDayScreen'
import TemporalRibbon from './components/TemporalRibbon'
import useStore from './store/useStore'

function App() {
  const selectedLocation = useStore((s) => s.selectedLocation)
  const setSelectedLocation = useStore((s) => s.setSelectedLocation)
  const setSelectedEra = useStore((s) => s.setSelectedEra)
  const [showOnThisDay, setShowOnThisDay] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('onboarding_complete')
  )
  const [gpsDismissed, setGpsDismissed] = useState(false)

  // Check for deep-link from shared On This Day event
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const otdEra = params.get('otd')
    if (otdEra) {
      // Find the location that contains this era
      const locations = useStore.getState().locations
      for (const loc of locations) {
        const era = loc.eras?.find(e => e.id === otdEra)
        if (era) {
          setSelectedLocation(loc.id)
          setSelectedEra(era.id)
          setShowOnThisDay(false)
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname)
          break
        }
      }
    }
  }, [setSelectedLocation, setSelectedEra])

  const handleGpsDismiss = useCallback(() => setGpsDismissed(true), [])

  // When user taps an "On This Day" event card
  const handleOnThisDayTap = useCallback((locationId, eraId) => {
    setSelectedLocation(locationId)
    // setSelectedLocation auto-selects the first era, so override to the matched era
    setTimeout(() => setSelectedEra(eraId), 0)
    setShowOnThisDay(false)
  }, [setSelectedLocation, setSelectedEra])

  return (
    <div className="flex h-dvh items-center justify-center bg-black">
      <div className="relative flex h-full w-full max-w-[390px] flex-col border-x border-border bg-background">
        <AnimatePresence mode="wait">
          {showOnThisDay && !selectedLocation ? (
            <motion.div
              key="on-this-day"
              className="flex-1"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <OnThisDayScreen
                onEventTap={handleOnThisDayTap}
                onSkip={() => setShowOnThisDay(false)}
              />
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
          {showOnboarding && !showOnThisDay && (
            <Onboarding onComplete={() => setShowOnboarding(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
