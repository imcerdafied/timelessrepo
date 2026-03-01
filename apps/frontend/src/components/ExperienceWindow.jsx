import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import useStore from '../store/useStore'
import { useEraImage } from '../hooks/useEraImage'
import { useGyroscope } from '../hooks/useGyroscope'
import { useEraAudio } from '../hooks/useEraAudio'
import { audioService } from '../services/audioService'
import { useDwellTime } from '../hooks/useDwellTime'
import { ERA_CHARACTERS } from '../data/era-characters'
import ArtifactLayer from './ArtifactLayer'
import CameraOverlay from './CameraOverlay'
import { CharacterChat } from './CharacterChat'
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
  const [characterOpen, setCharacterOpen] = useState(false)
  const [charDismissed, setCharDismissed] = useState(false)
  const dragControls = useDragControls()
  const touchStartY = useRef(null)

  const era = eras.find((e) => e.id === selectedEra)
  const { url: imageUrl } = useEraImage(era)
  const { tilt, needsPermission, requestPermission } = useGyroscope()
  const { audioEnabled, hasAudio, toggle: toggleAudio } = useEraAudio(era)
  const hasCharacter = !!ERA_CHARACTERS[era?.id]
  const { dwellMet, dismiss: dismissCharacter } = useDwellTime(
    era?.id,
    hasCharacter && !charDismissed
  )
  const showCharacterNotification = dwellMet && hasCharacter && !characterOpen && !charDismissed

  // Reset state when era changes
  if (era && era.id !== prevEraId) {
    setPrevEraId(era.id)
    setImageLoaded(false)
    setImageFailed(false)
    setExpanded(false)
    setDetailOpen(false)
    setCameraOpen(false)
    setCharacterOpen(false)
    setCharDismissed(false)
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

      {/* Dark skeleton loading state */}
      <AnimatePresence>
        {!imageLoaded && !imageFailed && (
          <motion.div
            key="skeleton"
            className="absolute inset-0 animate-pulse bg-neutral-800"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
        {/* Audio button — only show if this era has audio */}
        {hasAudio && (
          <button
            onClick={toggleAudio}
            className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-colors ${
              audioEnabled
                ? 'border-past/30 bg-surface/60 audio-playing'
                : 'border-present/20 bg-surface/60'
            }`}
            aria-label={audioEnabled ? 'Mute era audio' : 'Play era audio'}
          >
            {audioEnabled ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-past">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-present/50">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
            {audioService.hasMusic(era.id) && audioEnabled && (
              <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-past text-[6px] font-bold text-background">
                &#9835;
              </span>
            )}
          </button>
        )}
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
          onClick={() => {
            audioService.stop()
            setSelectedLocation(null)
          }}
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
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 999,
              padding: '4px 10px',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              className="font-ui uppercase"
              style={{
                color: '#f59e0b',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              {era.label}
            </span>
            <span className="font-mono" style={{ color: 'rgba(245,158,11,0.6)', fontSize: 11 }}>
              {era.year_display}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Artifact count pill — floats above the bottom sheet */}
      <AnimatePresence>
        {!expanded && !detailOpen && (
          <motion.div
            className="absolute inset-x-0 z-10 flex justify-center"
            style={{ bottom: 160 }}
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

      {/* Bottom sheet — collapsed peek or expanded fixed overlay */}
      {expanded ? (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '85vh',
            zIndex: 10,
            backgroundColor: 'rgba(10,10,10,0.97)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Drag handle — swipe down to close */}
          <div
            style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 6 }}
            onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY }}
            onTouchEnd={(e) => {
              if (touchStartY.current === null) return
              const delta = touchStartY.current - e.changedTouches[0].clientY
              if (delta < -40) setExpanded(false)
              touchStartY.current = null
            }}
          >
            <div style={{ width: 48, height: 5, borderRadius: 3, backgroundColor: 'rgba(245,245,245,0.5)' }} />
          </div>

          {/* Scrollable content — full description + key events + landscape */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 20px 20px' }}>
            <h2 className="font-heading text-xl font-semibold leading-tight text-present">
              {era.headline}
            </h2>
            <p className="mt-2 font-ui text-sm leading-relaxed text-present/70">
              {era.description}
            </p>

            {era.era_type === 'future' && (
              <FutureVoting era={era} />
            )}

            {era.era_type !== 'future' && era.key_events && era.key_events.length > 0 && (
              <div className="mt-4">
                {era.key_events.map((evt, i) => (
                  <div key={i} className="mt-2 flex gap-2">
                    <span className="font-mono text-[10px] shrink-0" style={{ color: `${color}99` }}>
                      {evt.year}
                    </span>
                    <span className="font-ui text-xs leading-relaxed text-present/50">
                      {evt.event}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {era.landscape && (
              <p className="mt-4 font-ui text-sm italic leading-relaxed text-present/50">
                {era.landscape}
              </p>
            )}
          </div>
        </div>
      ) : (
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10"
          style={{ touchAction: 'none' }}
          drag="y"
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.3, bottom: 0.3 }}
          dragListener={false}
          onDragEnd={(_, info) => {
            if (info.offset.y < -40 || info.velocity.y < -300) {
              setExpanded(true)
            }
          }}
          onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY }}
          onTouchEnd={(e) => {
            if (touchStartY.current === null) return
            const delta = touchStartY.current - e.changedTouches[0].clientY
            if (delta > 40) setExpanded(true)
            touchStartY.current = null
          }}
        >
          {/* Drag handle — tappable to expand */}
          <div
            className="relative flex cursor-grab flex-col items-center pb-1 pt-2 active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
            onClick={() => setExpanded(true)}
          >
            <div className="h-1 w-8 rounded-full bg-present/25" />
            <span className="mt-1 font-ui text-[9px] tracking-wider text-present/20 uppercase">
              Swipe up to read
            </span>
          </div>

          <div className="relative px-5 pb-4">
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
                <p className="mt-2 font-ui text-sm leading-relaxed text-present/70 line-clamp-2">
                  {oneSentence(era.description)}
                </p>
                <div className="mt-3 h-4" />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}

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

      {/* Character chat — portal to body to avoid overflow:hidden clipping */}
      {(showCharacterNotification || characterOpen) && createPortal(
        <AnimatePresence>
          <CharacterChat
            era={era}
            onDismiss={() => {
              setCharacterOpen(false)
              setCharDismissed(true)
              dismissCharacter()
            }}
          />
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
