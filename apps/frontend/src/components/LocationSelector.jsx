import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import posthog from 'posthog-js'
import useStore from '../store/useStore'

const CITY_ORDER = [
  'San Francisco',
  'New York',
  'London',
  'Riyadh',
  'Los Angeles',
  'Chicago',
  'Lagos',
]

export default function LocationSelector() {
  const locations = useStore((s) => s.locations)
  const setSelectedLocation = useStore((s) => s.setSelectedLocation)

  const grouped = useMemo(() => {
    const map = {}
    for (const loc of locations) {
      const city = loc.city || 'San Francisco'
      if (!map[city]) map[city] = []
      map[city].push(loc)
    }
    return map
  }, [locations])

  const cities = useMemo(
    () => CITY_ORDER.filter((c) => grouped[c]?.length),
    [grouped],
  )

  const [activeCity, setActiveCity] = useState(cities[0] || 'San Francisco')
  const cityLocations = grouped[activeCity] || []

  const yearRange = (eras) => {
    if (!eras?.length) return ''
    const first = eras[0].year_display
    const last = eras[eras.length - 1].year_display
    return `${first} to ${last}`
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="font-heading text-2xl font-bold tracking-[0.18em] text-present uppercase">
          Timeless Moment
        </h1>
        <p className="mt-1 font-ui text-sm text-present/50">
          Explore places across time
        </p>
      </div>

      {/* City tabs */}
      <div className="overflow-x-auto px-5 pb-4">
        <div className="flex gap-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`cursor-pointer whitespace-nowrap rounded-sm border px-3 py-1.5 font-ui text-xs font-medium tracking-[0.15em] uppercase transition-colors ${
                activeCity === city
                  ? 'border-past/40 bg-past/15 text-past'
                  : 'border-border bg-surface text-present/40 hover:text-present/60'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Location cards */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCity}
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {cityLocations.map((location, i) => (
              <motion.button
                key={location.id}
                onClick={() => {
                  posthog.capture('location_selected', {
                    location_id: location.id,
                    location_name: location.name,
                    city: activeCity,
                  })
                  setSelectedLocation(location.id)
                }}
                className="group flex cursor-pointer flex-col rounded-sm border border-border bg-surface p-4 text-left outline-none transition-colors hover:border-present/20"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-heading text-lg font-semibold text-present">
                      {location.name}
                    </h2>
                    <p className="mt-0.5 font-ui text-xs text-present/40">
                      {location.subtext}
                    </p>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 font-ui text-sm leading-relaxed text-present/60">
                  {location.tagline}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="font-ui text-[10px] tracking-[0.15em] text-present/30 uppercase">
                    {location.eras.length} eras
                  </span>
                  <span className="font-mono text-[10px] text-present/25">
                    {yearRange(location.eras)}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
