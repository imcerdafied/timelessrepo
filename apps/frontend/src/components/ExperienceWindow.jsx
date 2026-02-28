import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useStore from '../store/useStore'
import { getImageUrl } from '../data/imageMap'
import ArtifactLayer from './ArtifactLayer'
import CameraOverlay from './CameraOverlay'
import EraDetail from './EraDetail'

function twoSentences(text) {
  const match = text.match(/^(.*?[.!?])\s+(.*?[.!?])/)
  return match ? match[1] + ' ' + match[2] : text.split('.')[0] + '.'
}

const eraColor = {
  past: '#C8860A',
  present: '#F5F5F5',
  future: '#1E4D8C',
}

const eraGradient = {
  past: 'linear-gradient(135deg, #1a1206 0%, #0A0A0A 50%, #141210 100%)',
  present: 'linear-gradient(135deg, #111111 0%, #0A0A0A 50%, #0f0f0f 100%)',
  future: 'linear-gradient(135deg, #0a0f1a 0%, #0A0A0A 50%, #0d1018 100%)',
}

export default function ExperienceWindow() {
  const eras = useStore((s) => s.eras)
  const selectedEra = useStore((s) => s.selectedEra)
  const selectedLocation = useStore((s) => s.selectedLocation)
  const locations = useStore((s) => s.locations)
  const setSelectedLocation = useStore((s) => s.setSelectedLocation)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [prevEraId, setPrevEraId] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)

  const era = eras.find((e) => e.id === selectedEra)

  // Reset loading state when era changes
  if (era && era.id !== prevEraId) {
    setPrevEraId(era.id)
    setImageLoaded(false)
    setImageFailed(false)
    setDetailOpen(false)
  }

  if (!era) return null

  const color = eraColor[era.era_type]
  const imageUrl = getImageUrl(era)
  const isFirstEra = eras[0]?.id === era.id

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Fallback gradient when image fails */}
      {imageFailed && (
        <div className="absolute inset-0" style={{ background: eraGradient[era.era_type] }} />
      )}

      {/* Shimmer loading state */}
      <AnimatePresence>
        {!imageLoaded && !imageFailed && (
          <motion.div
            key="shimmer"
            className="shimmer absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Background image with Ken Burns + cross-dissolve */}
      {!imageFailed && (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={era.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <motion.img
              src={imageUrl}
              alt={era.label}
              crossOrigin="anonymous"
              loading={isFirstEra ? 'eager' : 'lazy'}
              className="h-full w-full object-cover"
              initial={{ scale: 1.0 }}
              animate={{ scale: 1.08 }}
              transition={{
                duration: 20,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,10,0.7) 100%), linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.4) 35%, transparent 60%)',
        }}
      />

      {/* Top right controls */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        {/* Camera button */}
        <button
          onClick={() => setCameraOpen(true)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-present/20 bg-surface/60 text-present/70 backdrop-blur-md transition-colors hover:bg-surface/80"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
        {/* Back button */}
        <button
          onClick={() => setSelectedLocation(null)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-present/20 bg-surface/60 text-present/70 backdrop-blur-md transition-colors hover:bg-surface/80"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M11 3L3 11M3 3l8 8" />
          </svg>
        </button>
      </div>

      {/* Era label + year — top left */}
      <AnimatePresence mode="wait">
        <motion.div
          key={era.id + '-label'}
          className="absolute left-5 top-5 z-10 flex items-center gap-2"
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
          <span className="font-mono text-xs" style={{ color: `${color}99` }}>
            {era.year_display}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* InfoCard — slides up from bottom, tap to expand. Hidden when detail sheet is open. */}
      <AnimatePresence>
        {!detailOpen && (
          <motion.div
            key={era.id + '-info'}
            className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Artifact count pill */}
            <div className="mb-3 flex justify-center">
              <ArtifactLayer
                era={era}
                locationId={selectedLocation}
                locationName={locations.find((l) => l.id === selectedLocation)?.name}
                city={locations.find((l) => l.id === selectedLocation)?.city}
              />
            </div>

            <motion.div
              className="cursor-pointer rounded-2xl border border-border bg-surface/90 p-5 backdrop-blur-xl shadow-lg shadow-black/30"
              onClick={() => setDetailOpen(true)}
              whileTap={{ scale: 0.98 }}
            >
              <h2 className="font-heading text-xl font-semibold leading-tight text-present">
                {era.headline}
              </h2>
              <p className="mt-2 font-ui text-sm leading-relaxed text-present/70">
                {twoSentences(era.description)}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-present/40">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 2v8M2 6l4 4 4-4" />
                </svg>
                <span className="font-ui text-[11px] tracking-wide uppercase">Tap to explore</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Era Detail sheet */}
      <EraDetail
        era={era}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        color={color}
        locationName={locations.find((l) => l.id === selectedLocation)?.name}
      />

      {/* Camera overlay */}
      <AnimatePresence>
        {cameraOpen && <CameraOverlay onClose={() => setCameraOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
