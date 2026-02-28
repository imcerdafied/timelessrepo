import { useState } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import useStore from '../store/useStore'
import { useEraImage } from '../hooks/useEraImage'
import { useGyroscope } from '../hooks/useGyroscope'
import ArtifactLayer from './ArtifactLayer'
import CameraOverlay from './CameraOverlay'
import EraDetail from './EraDetail'
import FutureVoting from './FutureVoting'
import ShareCard from './ShareCard'

function oneSentence(text) {
  const match = text.match(/^(.*?[.!?])/)
  return match ? match[1] : text.split('.')[0] + '.'
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
  const [expanded, setExpanded] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const dragControls = useDragControls()

  const era = eras.find((e) => e.id === selectedEra)
  const { url: imageUrl, credit, creditUrl } = useEraImage(era)
  const { tilt, needsPermission, requestPermission } = useGyroscope()

  // Reset state when era changes
  if (era && era.id !== prevEraId) {
    setPrevEraId(era.id)
    setImageLoaded(false)
    setImageFailed(false)
    setExpanded(false)
    setDetailOpen(false)
  }

  if (!era) return null

  const color = eraColor[era.era_type]
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

      {/* Background image — full bleed with Ken Burns + gyroscope parallax */}
      {!imageFailed && (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={era.id}
            className="absolute overflow-hidden"
            style={{ inset: '-8%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <motion.img
              src={imageUrl}
              alt={era.label}
              loading={isFirstEra ? 'eager' : 'lazy'}
              className="h-full w-full object-cover"
              style={{
                transform: `translate(${tilt.x * 0.4}px, ${tilt.y * 0.4}px)`,
                transition: 'transform 0.1s ease-out',
                willChange: 'transform',
              }}
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

      {/* Bottom gradient — heavier at the bottom for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.4) 30%, transparent 55%)',
        }}
      />

      {/* Unsplash credit */}
      {credit && (
        <a
          href={`${creditUrl}?utm_source=timeless_moment&utm_medium=referral`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 top-14 z-[5] rounded bg-black/40 px-1.5 py-0.5 font-ui text-[9px] text-present/30 backdrop-blur-sm transition-colors hover:text-present/50"
        >
          Photo by {credit}
        </a>
      )}

      {/* iOS gyroscope permission pill */}
      <AnimatePresence>
        {needsPermission && (
          <motion.button
            onClick={requestPermission}
            className="absolute left-1/2 top-[40%] z-20 -translate-x-1/2 cursor-pointer rounded-full border border-past/30 bg-surface/80 px-4 py-2 backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="font-ui text-xs tracking-wide text-past">
              Move through this era &rarr;
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Top right controls */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        {/* Share button */}
        <button
          onClick={() => setShareOpen(true)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-present/20 bg-surface/60 text-present/70 backdrop-blur-md transition-colors hover:bg-surface/80"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
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
        {/* Close button */}
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

      {/* Artifact count pill — floats above the bottom sheet */}
      <AnimatePresence>
        {!expanded && !detailOpen && (
          <motion.div
            className="absolute inset-x-0 z-10 flex justify-center"
            style={{ bottom: '32%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArtifactLayer
              era={era}
              locationId={selectedLocation}
              locationName={locations.find((l) => l.id === selectedLocation)?.name}
              city={locations.find((l) => l.id === selectedLocation)?.city}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom sheet — peek state (headline + hint) or expanded (full text) */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-10"
        style={{ touchAction: 'none' }}
        animate={{ y: expanded ? '-45%' : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        drag="y"
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.3, bottom: 0.3 }}
        dragListener={false}
        onDragEnd={(_, info) => {
          if (info.offset.y < -40 || info.velocity.y < -300) {
            setExpanded(true)
          } else if (info.offset.y > 40 || info.velocity.y > 300) {
            setExpanded(false)
          }
        }}
      >
        {/* Drag handle */}
        <div
          className="flex cursor-grab justify-center pb-2 pt-2 active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="h-1 w-8 rounded-full bg-present/25" />
        </div>

        <div
          className="px-5 pb-5"
          onClick={() => {
            if (!expanded) setExpanded(true)
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={era.id + '-card'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-heading text-xl font-semibold leading-tight text-present">
                {era.headline}
              </h2>
              <p className={`mt-2 font-ui text-sm leading-relaxed text-present/70 ${expanded ? '' : 'line-clamp-2'}`}>
                {expanded ? era.description : oneSentence(era.description)}
              </p>

              {expanded && era.era_type === 'future' && (
                <FutureVoting era={era} />
              )}

              {expanded && era.era_type !== 'future' && era.key_events && era.key_events.length > 0 && (
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {era.key_events.slice(0, 3).map((evt, i) => (
                    <div key={i} className="mt-2 flex gap-2">
                      <span className="font-mono text-[10px] shrink-0" style={{ color: `${color}99` }}>
                        {evt.year}
                      </span>
                      <span className="font-ui text-xs leading-relaxed text-present/50">
                        {evt.event}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Action row */}
              <div className="mt-3 flex items-center justify-between">
                <div
                  className="flex cursor-pointer items-center gap-1.5 text-present/40"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (expanded) {
                      setDetailOpen(true)
                      setExpanded(false)
                    } else {
                      setExpanded(true)
                    }
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M6 2v8M2 6l4 4 4-4" />
                  </svg>
                  <span className="font-ui text-[11px] tracking-wide uppercase">
                    {expanded ? 'Full detail' : 'Tap to explore'}
                  </span>
                </div>
                {expanded && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpanded(false)
                    }}
                    className="cursor-pointer font-ui text-[11px] tracking-wide text-present/30 uppercase transition-colors hover:text-present/50"
                  >
                    Collapse
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

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

      {/* Share card overlay */}
      {shareOpen && (
        <ShareCard
          era={era}
          locationName={locations.find((l) => l.id === selectedLocation)?.name}
          imageUrl={imageUrl}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}
