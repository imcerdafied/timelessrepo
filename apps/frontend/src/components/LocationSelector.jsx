import { motion } from 'framer-motion'
import posthog from 'posthog-js'
import useStore from '../store/useStore'

export default function LocationSelector() {
  const locations = useStore((s) => s.locations)
  const setSelectedLocation = useStore((s) => s.setSelectedLocation)

  return (
    <div className="flex h-full flex-col bg-background px-5 py-8">
      <h1 className="font-heading text-2xl font-bold tracking-[0.18em] text-present uppercase">Timeless Moment</h1>
      <p className="mt-1 font-ui text-sm text-present/50">
        San Francisco across time
      </p>

      <div className="mt-8 flex flex-1 flex-col gap-3 overflow-y-auto">
        {locations.map((location, i) => (
          <motion.button
            key={location.id}
            onClick={() => {
              posthog.capture('location_selected', { location_id: location.id, location_name: location.name })
              setSelectedLocation(location.id)
            }}
            className="group flex cursor-pointer flex-col rounded-xl border border-border bg-surface p-4 text-left outline-none transition-colors hover:border-present/20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold text-present">
                  {location.name}
                </h2>
                <p className="mt-0.5 font-ui text-xs text-present/40">
                  {location.subtext}
                </p>
              </div>
              <span className="rounded-full bg-present/8 px-2 py-0.5 font-mono text-xs text-present/50">
                {location.eras.length} eras
              </span>
            </div>
            <p className="mt-2 font-ui text-sm leading-relaxed text-present/60">
              {location.tagline}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
