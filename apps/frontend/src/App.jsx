import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ExperienceWindow from './components/ExperienceWindow'
import LocationSelector from './components/LocationSelector'
import Onboarding from './components/Onboarding'
import TodayAtProperty from './components/TodayAtProperty'
import TemporalRibbon from './components/TemporalRibbon'
import AdminDashboard from './components/AdminDashboard'
import DemoDirectory from './components/DemoDirectory'
import PassportPanel from './components/PassportPanel'
import StoryTrails from './components/StoryTrails'
import { getDemoRoute } from './config/demoRoutes'
import useStore from './store/useStore'

const ADMIN_ENABLED = import.meta.env.VITE_ADMIN_ENABLED !== 'false'
const INITIAL_ROUTE = getDemoRoute()

function App() {
  const selectedLocation = useStore((s) => s.selectedLocation)
  const setSelectedLocation = useStore((s) => s.setSelectedLocation)
  const setSelectedEra = useStore((s) => s.setSelectedEra)
  const setBleSimZone = useStore((s) => s.setBleSimZone)
  const locations = useStore((s) => s.locations)

  const [showToday, setShowToday] = useState(INITIAL_ROUTE.view === 'today')
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('onboarding_complete')
  )
  const [showAdmin, setShowAdmin] = useState(INITIAL_ROUTE.view === 'signals')
  const [showBlePanel, setShowBlePanel] = useState(false)
  const [initialTool] = useState(INITIAL_ROUTE.tool || null)
  const [initialTrail] = useState(() => (
    INITIAL_ROUTE.tool === 'trail'
      ? { id: INITIAL_ROUTE.trailId, stepIndex: INITIAL_ROUTE.trailStep || 0 }
      : null
  ))

  // Route clean demo URLs into the single-page demo shell.
  useEffect(() => {
    if (INITIAL_ROUTE.view === 'signals' && ADMIN_ENABLED) {
      setShowAdmin(true)
    }
    if (INITIAL_ROUTE.view === 'experience' && INITIAL_ROUTE.zoneId) {
      setSelectedLocation(INITIAL_ROUTE.zoneId)
      if (INITIAL_ROUTE.layerId) {
        setTimeout(() => setSelectedEra(INITIAL_ROUTE.layerId), 0)
      }
      setShowToday(false)
    }
  }, [])

  // Triple-tap logo to open admin
  const [tapCount, setTapCount] = useState(0)
  const handleLogoTap = useCallback(() => {
    const newCount = tapCount + 1
    if (newCount >= 3 && ADMIN_ENABLED) {
      setShowAdmin(true)
      setTapCount(0)
    } else {
      setTapCount(newCount)
      setTimeout(() => setTapCount(0), 1000)
    }
  }, [tapCount])

  const handleTodayTap = useCallback((locationId, eraId) => {
    setSelectedLocation(locationId)
    setTimeout(() => setSelectedEra(eraId), 0)
    setShowToday(false)
  }, [setSelectedLocation, setSelectedEra])

  if (showAdmin) {
    return <AdminDashboard onClose={() => setShowAdmin(false)} />
  }

  if (INITIAL_ROUTE.view === 'directory') {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="relative flex h-full w-full max-w-[390px] flex-col border-x border-border bg-background">
          <DemoDirectory />
        </div>
      </div>
    )
  }

  if (INITIAL_ROUTE.view === 'trails') {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="relative flex h-full w-full max-w-[390px] flex-col border-x border-border bg-background">
          <StoryTrails />
        </div>
      </div>
    )
  }

  if (INITIAL_ROUTE.view === 'passport') {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="relative flex h-full w-full max-w-[390px] flex-col border-x border-border bg-background">
          <PassportPanel fullPage />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-white">
      <div className="relative flex h-full w-full max-w-[390px] flex-col border-x border-border bg-background">
        <AnimatePresence mode="wait">
          {showToday && !selectedLocation ? (
            <motion.div
              key="today"
              className="flex-1"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <TodayAtProperty
                onEventTap={handleTodayTap}
                onSkip={() => setShowToday(false)}
                onLogoTap={handleLogoTap}
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
                <ExperienceWindow initialTool={initialTool} initialTrail={initialTrail} />
              </div>
              <TemporalRibbon />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Onboarding overlay */}
        <AnimatePresence>
          {showOnboarding && !showToday && (
            <Onboarding onComplete={() => setShowOnboarding(false)} />
          )}
        </AnimatePresence>

        {/* Demo mode toggle */}
        <button
          onClick={() => setShowBlePanel(!showBlePanel)}
          className="fixed top-3 right-3 z-50 rounded-full border border-border bg-surface/90 px-3 py-1.5 font-ui text-[10px] tracking-widest text-present/50 uppercase backdrop-blur-sm"
          style={{ maxWidth: 'fit-content' }}
        >
          Demo
        </button>

        {/* BLE simulation panel */}
        <AnimatePresence>
          {showBlePanel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-12 right-3 z-50 rounded-sm border border-border bg-surface p-3 shadow-lg"
              style={{ maxWidth: 200 }}
            >
              <p className="font-ui text-[10px] tracking-widest text-present/40 uppercase mb-2">
                Simulate BLE Beacon
              </p>
              {locations.map(zone => (
                <button
                  key={zone.id}
                  onClick={() => setBleSimZone(zone.id)}
                  className={`block w-full text-left px-2 py-1.5 rounded-sm font-ui text-xs transition-colors cursor-pointer ${
                    useStore.getState().bleSimZone === zone.id
                      ? 'bg-accent/15 text-accent'
                      : 'text-present/50 hover:text-present/70'
                  }`}
                >
                  {zone.name}
                </button>
              ))}
              <button
                onClick={() => setBleSimZone(null)}
                className="mt-1 block w-full text-left px-2 py-1.5 rounded-sm font-ui text-xs text-present/30 hover:text-present/50 cursor-pointer"
              >
                None
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
