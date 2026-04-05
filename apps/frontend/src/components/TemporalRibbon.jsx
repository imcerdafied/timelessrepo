import { useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import posthog from 'posthog-js'
import useStore from '../store/useStore'
import { audioService } from '../services/audioService'

const NODE_SIZE = 44

const eraColor = {
  past: '#C8860A',
  present: '#F5F5F5',
  future: '#1E4D8C',
  cultural: '#2D8F4E',
  operational: '#4A90A4',
}

const glowColor = {
  past: 'rgba(200, 134, 10, 0.45)',
  present: 'rgba(245, 245, 245, 0.35)',
  future: 'rgba(30, 77, 140, 0.45)',
  cultural: 'rgba(45, 143, 78, 0.45)',
  operational: 'rgba(74, 144, 164, 0.45)',
}

const layerIcon = {
  past: '\u{1F552}',
  present: '\u{1F4CD}',
  future: '\u{1F52D}',
  cultural: '\u{1F334}',
  operational: '\u{2699}',
}

export default function TemporalRibbon() {
  const eras = useStore((s) => s.eras)
  const selectedEra = useStore((s) => s.selectedEra)
  const setSelectedEra = useStore((s) => s.setSelectedEra)
  const scrollRef = useRef(null)
  const nodeRefs = useRef({})

  const scrollToNode = useCallback(
    (id, behavior = 'smooth') => {
      const node = nodeRefs.current[id]
      if (node) {
        node.scrollIntoView({
          behavior,
          inline: 'center',
          block: 'nearest',
        })
      }
    },
    [],
  )

  useEffect(() => {
    scrollToNode(selectedEra, 'instant')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToNode(selectedEra)
  }, [selectedEra, scrollToNode])

  return (
    <div className="relative w-full">
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
          const color = eraColor[era.era_type] || eraColor.past
          const glow = glowColor[era.era_type] || glowColor.past
          const icon = layerIcon[era.era_type] || layerIcon.past

          return (
            <motion.button
              key={era.id}
              ref={(el) => { nodeRefs.current[era.id] = el }}
              onClick={() => {
                posthog.capture('layer_selected', {
                  zone_id: useStore.getState().selectedLocation,
                  layer_id: era.id,
                  layer_type: era.era_type,
                  layer_label: era.label,
                })
                setSelectedEra(era.id)
              }}
              className="flex shrink-0 cursor-pointer flex-col items-center border-none bg-transparent p-0 outline-none"
              style={{ width: NODE_SIZE }}
              whileTap={{ scale: 0.92 }}
            >
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

                <motion.div
                  className="flex items-center justify-center rounded-full"
                  animate={{
                    width: isSelected ? 24 : 14,
                    height: isSelected ? 24 : 14,
                    backgroundColor: isSelected ? color : `${color}88`,
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                >
                  {isSelected && (
                    <span className="text-[10px]">{icon}</span>
                  )}
                </motion.div>
              </div>

              <motion.span
                className="mt-2 flex items-center gap-0.5 font-mono text-[11px]"
                animate={{
                  color: isSelected ? color : '#666666',
                  opacity: isSelected ? 1 : 0.6,
                }}
                transition={{ duration: 0.2 }}
              >
                {era.label}
                {audioService.hasAudio(era.id) && (
                  <span style={{ color: `${color}99` }} className="text-[10px]">&#9835;</span>
                )}
              </motion.span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
