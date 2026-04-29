import { motion } from 'framer-motion'
import posthog from 'posthog-js'
import useStore from '../store/useStore'
import { ACTIVE_PROPERTY } from '../config/properties'

const PROPERTY_NAME = import.meta.env.VITE_PROPERTY_NAME || ACTIVE_PROPERTY.name

const ZONE_ICONS = {
  wave: '\u{1F30A}',
  hotel: '\u{1F3E8}',
  swim: '\u{1F3CA}',
  spark: '\u{2728}',
  reef: '\u{1F420}',
}

export default function LocationSelector() {
  const locations = useStore((s) => s.locations)
  const setSelectedLocation = useStore((s) => s.setSelectedLocation)
  const bleSimEnabled = useStore((s) => s.bleSimEnabled)
  const bleSimZone = useStore((s) => s.bleSimZone)

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="font-heading text-2xl font-bold tracking-[0.18em] text-present uppercase">
          {PROPERTY_NAME}
        </h1>
        <p className="mt-1 font-ui text-sm text-present/50">
          Explore zones across time and culture
        </p>
      </div>

      {/* BLE simulation banner */}
      {bleSimEnabled && bleSimZone && (
        <div className="mx-5 mb-3 rounded-sm border border-accent/30 bg-accent/10 px-3 py-2 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="font-ui text-xs text-accent">
            Simulated BLE: {locations.find(l => l.id === bleSimZone)?.name || bleSimZone}
          </span>
        </div>
      )}

      {/* Zone cards */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="flex flex-col gap-3">
          {locations.map((zone, i) => {
            const isNearby = bleSimEnabled && bleSimZone === zone.id
            const iconKey = ACTIVE_PROPERTY.zoneIcons?.[zone.id]
            const icon = ZONE_ICONS[iconKey] || '\u{1F4CD}'

            return (
              <motion.button
                key={zone.id}
                onClick={() => {
                  posthog.capture('zone_entered', {
                    zone_id: zone.id,
                    zone_name: zone.name,
                    trigger: isNearby ? 'ble' : 'manual',
                  })
                  setSelectedLocation(zone.id)
                }}
                className={`group flex cursor-pointer flex-col rounded-sm border p-4 text-left outline-none transition-colors ${
                  isNearby
                    ? 'border-accent/40 bg-accent/10'
                    : 'border-border bg-surface hover:border-present/20'
                }`}
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
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      <h2 className="font-heading text-lg font-semibold text-present">
                        {zone.name}
                      </h2>
                    </div>
                    <p className="mt-0.5 font-ui text-xs text-present/40">
                      {zone.subtext}
                    </p>
                  </div>
                  {isNearby && (
                    <div className="flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                      </span>
                      <span className="font-ui text-[10px] tracking-widest text-accent uppercase">Nearby</span>
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 font-ui text-sm leading-relaxed text-present/60">
                  {zone.tagline}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="font-ui text-[10px] tracking-[0.15em] text-present/30 uppercase">
                    {zone.eras?.length || 0} layers
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
