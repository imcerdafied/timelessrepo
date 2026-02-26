import { AnimatePresence, motion } from 'framer-motion'
import useStore from '../store/useStore'

const eraColor = {
  past: '#C8860A',
  present: '#F5F5F5',
  future: '#1E4D8C',
}

export default function ExperienceWindow() {
  const eras = useStore((s) => s.eras)
  const selectedEra = useStore((s) => s.selectedEra)
  const era = eras.find((e) => e.id === selectedEra)

  if (!era) return null

  const color = eraColor[era.type]

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background image with Ken Burns + cross-dissolve */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={era.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <motion.img
            src={era.image}
            alt={era.label}
            className="h-full w-full object-cover"
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.08 }}
            transition={{
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,10,0.7) 100%), linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 40%)',
        }}
      />

      {/* Era label — top left */}
      <AnimatePresence mode="wait">
        <motion.div
          key={era.id + '-label'}
          className="absolute left-5 top-5 z-10"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span
            className="rounded-full px-3 py-1 font-ui text-xs font-medium tracking-wide uppercase"
            style={{
              color,
              backgroundColor: `${color}18`,
              border: `1px solid ${color}30`,
            }}
          >
            {era.label}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* InfoCard — slides up from bottom */}
      <AnimatePresence mode="wait">
        <motion.div
          key={era.id + '-info'}
          className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-md">
            <h2 className="font-heading text-xl font-semibold leading-tight text-present">
              {era.headline}
            </h2>
            <p className="mt-2 font-ui text-sm leading-relaxed text-present/70">
              {era.description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
