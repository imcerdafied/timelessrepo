import { useRef } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'

const typeLabel = {
  past: 'Historical Record',
  present: 'Present Day',
  future: 'Projected Future',
}

export default function EraDetail({ era, open, onClose, color, locationName }) {
  const dragControls = useDragControls()
  const sheetRef = useRef(null)

  if (!era) return null

  const hasFutureScenarios = era.future_scenarios && era.future_scenarios.length > 0

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 z-30 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className="absolute inset-x-0 bottom-0 z-40 max-h-[85%] overflow-hidden rounded-t-2xl border-t border-border bg-surface/95 backdrop-blur-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose()
              }
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-8 rounded-full bg-present/20" />
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto overscroll-contain px-5" style={{ maxHeight: 'calc(85vh - 24px)', paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className="rounded-full px-2.5 py-0.5 font-ui text-[10px] font-medium tracking-wider uppercase"
                    style={{
                      color,
                      backgroundColor: `${color}18`,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {era.year_display} — {typeLabel[era.era_type]}
                  </span>
                  {locationName && (
                    <p className="mt-2 font-ui text-[11px] tracking-wide text-present/40 uppercase">
                      {locationName}
                    </p>
                  )}
                  <h2 className="mt-1 font-heading text-2xl font-semibold leading-tight text-present">
                    {era.headline}
                  </h2>
                </div>
              </div>

              {/* Full description */}
              <p className="mt-4 font-ui text-sm leading-relaxed text-present/75">
                {era.description}
              </p>

              {/* Key Events Timeline */}
              {era.key_events && era.key_events.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-ui text-xs font-medium tracking-wider text-present/40 uppercase">
                    Key Events
                  </h3>
                  <div className="mt-3 space-y-0">
                    {era.key_events.map((evt, i) => (
                      <div key={i} className="flex gap-3">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                          <div
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          {i < era.key_events.length - 1 && (
                            <div className="w-px flex-1 bg-border" />
                          )}
                        </div>
                        {/* Event content */}
                        <div className="pb-4">
                          <span className="font-mono text-[11px]" style={{ color: `${color}BB` }}>
                            {evt.year}
                          </span>
                          <p className="mt-0.5 font-ui text-sm leading-relaxed text-present/70">
                            {evt.event}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Landscape */}
              {era.landscape && (
                <div className="mt-6">
                  <h3 className="font-ui text-xs font-medium tracking-wider text-present/40 uppercase">
                    The Landscape
                  </h3>
                  <p className="mt-2 font-ui text-sm italic leading-relaxed text-present/60">
                    {era.landscape}
                  </p>
                </div>
              )}

              {/* Future Scenarios — only for 2075 eras */}
              {hasFutureScenarios && (
                <div className="mt-6">
                  <h3 className="font-ui text-xs font-medium tracking-wider text-present/40 uppercase">
                    Possible Futures
                  </h3>
                  <div className="mt-3 space-y-3">
                    {era.future_scenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        className="rounded-xl border border-border bg-background/50 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-ui text-sm font-medium text-present">
                              {scenario.label}
                            </h4>
                            <span className="font-ui text-[11px] text-present/40">
                              {scenario.sublabel}
                            </span>
                          </div>
                          <span
                            className="rounded-full px-2 py-0.5 font-mono text-[10px]"
                            style={{
                              color,
                              backgroundColor: `${color}15`,
                            }}
                          >
                            {Math.round(scenario.confidence * 100)}%
                          </span>
                        </div>
                        {/* Confidence bar */}
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${scenario.confidence * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                        <p className="mt-2 font-ui text-[13px] leading-relaxed text-present/60">
                          {scenario.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources */}
              {era.sources && era.sources.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-ui text-xs font-medium tracking-wider text-present/40 uppercase">
                    Sources
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {era.sources.map((source, i) => (
                      <li key={i} className="font-ui text-[12px] leading-relaxed text-present/35">
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
