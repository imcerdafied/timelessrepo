import { useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import posthog from 'posthog-js'
import useStore from '../store/useStore'

const NODE_SIZE = 44
const NODE_GAP = 48
const NODE_TOTAL = NODE_SIZE + NODE_GAP

const eraColor = {
  past: '#C8860A',
  present: '#F5F5F5',
  future: '#1E4D8C',
}

const glowColor = {
  past: 'rgba(200, 134, 10, 0.45)',
  present: 'rgba(245, 245, 245, 0.35)',
  future: 'rgba(30, 77, 140, 0.45)',
}

export default function TemporalRibbon() {
  const eras = useStore((s) => s.eras)
  const selectedEra = useStore((s) => s.selectedEra)
  const setSelectedEra = useStore((s) => s.setSelectedEra)
  const scrollRef = useRef(null)

  const scrollToNode = useCallback(
    (id, behavior = 'smooth') => {
      const container = scrollRef.current
      if (!container) return
      const index = eras.findIndex((e) => e.id === id)
      if (index === -1) return
      const containerWidth = container.offsetWidth
      const targetCenter = index * NODE_TOTAL + NODE_SIZE / 2
      container.scrollTo({
        left: targetCenter - containerWidth / 2,
        behavior,
      })
    },
    [eras],
  )

  useEffect(() => {
    scrollToNode(selectedEra, 'instant')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToNode(selectedEra)
  }, [selectedEra, scrollToNode])

  return (
    <div className="relative w-full">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />

      <div
        ref={scrollRef}
        className="flex items-center gap-12 overflow-x-auto px-[calc(50%-22px)] py-6"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {eras.map((era) => {
          const isSelected = era.id === selectedEra
          const color = eraColor[era.era_type]
          const glow = glowColor[era.era_type]

          return (
            <motion.button
              key={era.id}
              onClick={() => {
                posthog.capture('era_selected', { era_id: era.id, era_label: era.label, era_type: era.era_type, location_id: useStore.getState().selectedLocation })
                setSelectedEra(era.id)
              }}
              className="flex shrink-0 cursor-pointer flex-col items-center border-none bg-transparent p-0 outline-none"
              style={{ width: NODE_SIZE }}
              whileTap={{ scale: 0.92 }}
            >
              {/* Glow ring */}
              <div className="relative flex items-center justify-center" style={{ width: NODE_SIZE, height: NODE_SIZE }}>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: isSelected ? `0 0 20px 4px ${glow}` : '0 0 0px 0px transparent',
                    scale: isSelected ? 1 : 0.85,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    border: `2px solid ${isSelected ? color : 'transparent'}`,
                  }}
                />

                {/* Node dot */}
                <motion.div
                  className="rounded-full"
                  animate={{
                    width: isSelected ? 20 : 12,
                    height: isSelected ? 20 : 12,
                    backgroundColor: isSelected ? color : `${color}88`,
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              </div>

              {/* Year label */}
              <motion.span
                className="mt-2 font-mono text-[13px]"
                animate={{
                  color: isSelected ? color : '#666666',
                  opacity: isSelected ? 1 : 0.6,
                }}
                transition={{ duration: 0.2 }}
              >
                {era.year_display}
              </motion.span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
