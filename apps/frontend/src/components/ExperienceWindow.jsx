import posthog from 'posthog-js'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import useStore from '../store/useStore'
import { ACTIVE_PROPERTY } from '../config/properties'
import { useEraImage } from '../hooks/useEraImage'
import { useGyroscope } from '../hooks/useGyroscope'
import { useEraAudio } from '../hooks/useEraAudio'
import { audioService } from '../services/audioService'
import { useDwellTime } from '../hooks/useDwellTime'
import { ERA_CHARACTERS, getCharacterForEra } from '../data/era-characters'
import { getAmbientProfile, startAmbient } from '../data/ambient-profiles'
import { getVenuesForEra, getAutoplayVenue } from '../data/venues'
import { buildConciergeIntro, getOfferForEra, getStoryTrailById, getStoryTrailForLayer } from '../data/engagement'
import AffinityOffer from './AffinityOffer'
import ArtifactLayer from './ArtifactLayer'
import CameraTimeTravel from './CameraTimeTravel'
import { CharacterChat } from './CharacterChat'
import EraDetail from './EraDetail'
import FutureVoting from './FutureVoting'
import ShareCard from './ShareCard'
import VenueCard from './VenueCard'
import VenueScene from './VenueScene'
import ScenePlayer from './ScenePlayer'
import SceneSelector from './SceneSelector'
import TimelessScene from './TimelessScene'
import ConciergeFAB from './ConciergeFAB'
import PassportPanel from './PassportPanel'
import TrailGuide from './TrailGuide'

function oneSentence(text) {
  const match = text.match(/^(.*?[.!?])/)
  return match ? match[1] : text.split('.')[0] + '.'
}

const eraColor = {
  past: '#C8860A',
  present: '#F5F5F5',
  future: '#1E4D8C',
  cultural: '#2D8F4E',
  operational: '#4A90A4',
}

const eraGradient = {
  past: 'linear-gradient(135deg, #1a1206 0%, #0A0A0A 50%, #141210 100%)',
  present: 'linear-gradient(135deg, #111111 0%, #0A0A0A 50%, #0f0f0f 100%)',
  future: 'linear-gradient(135deg, #0a0f1a 0%, #0A0A0A 50%, #0d1018 100%)',
  cultural: 'linear-gradient(135deg, #0a1a0f 0%, #0A0A0A 50%, #0d180f 100%)',
  operational: 'linear-gradient(135deg, #0a1318 0%, #0A0A0A 50%, #0d1518 100%)',
}

export default function ExperienceWindow({ initialTool = null, initialTrail = null }) {
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
  const [showCameraPulse, setShowCameraPulse] = useState(() => !sessionStorage.getItem('camera_pulse_shown'))
  const [shareOpen, setShareOpen] = useState(false)
  const [passportOpen, setPassportOpen] = useState(false)
  const [characterOpen, setCharacterOpen] = useState(false)
  const [characterIntro, setCharacterIntro] = useState(null)
  const [chatKey, setChatKey] = useState(0)
  const [charDismissed, setCharDismissed] = useState(false)
  const [activeVenue, setActiveVenue] = useState(null)
  const [isAutoplay, setIsAutoplay] = useState(false)
  const [autoplayTriggered, setAutoplayTriggered] = useState(false)
  const [scenes, setScenes] = useState(null)
  const [sceneSelectorOpen, setSceneSelectorOpen] = useState(false)
  const [activeScene, setActiveScene] = useState(null)
  const [timelessSceneOpen, setTimelessSceneOpen] = useState(false)
  const [conciergeOpen, setConciergeOpen] = useState(false)
  const [conciergeIntro, setConciergeIntro] = useState(null)
  const [ambientStarted, setAmbientStarted] = useState(false)
  const initialToolOpened = useRef(false)
  const ambientRef = useRef(null)
  const dragControls = useDragControls()
  const touchStartY = useRef(null)

  const era = eras.find((e) => e.id === selectedEra)
  const venues = getVenuesForEra(era?.id)
  const { url: imageUrl } = useEraImage(era)
  const { tilt, needsPermission, requestPermission } = useGyroscope()
  const { audioEnabled, hasAudio, toggle: toggleAudio } = useEraAudio(era)
  const character = getCharacterForEra(era?.id)
  const offer = getOfferForEra(era)
  const guidedTrail = initialTrail?.id ? getStoryTrailById(initialTrail.id) : null
  const guidedStepIndex = initialTrail?.stepIndex || 0
  const guidedStep = guidedTrail?.stops?.[guidedStepIndex]
  const guidedNextStep = guidedTrail?.stops?.[guidedStepIndex + 1]
  const trailChatContext = guidedTrail ? {
    trailTitle: guidedTrail.title,
    stopTitle: guidedStep?.title,
    prompt: guidedStep?.prompt,
    nextHref: guidedNextStep ? `/demo/${ACTIVE_PROPERTY.slug}/trail/${guidedTrail.id}/${guidedStepIndex + 1}` : null,
    nextLabel: guidedNextStep?.title || 'the next stop',
  } : null
  const activeTrail = guidedTrail || getStoryTrailForLayer(era?.id)
  const conciergeEraId = `${selectedLocation}-present`
  const conciergeCharacter = getCharacterForEra(conciergeEraId)
  const hasCharacter = !!character
  const { dismiss: dismissCharacter } = useDwellTime(
    era?.id,
    hasCharacter && !charDismissed
  )

  // Reset state when era changes
  if (era && era.id !== prevEraId) {
    setPrevEraId(era.id)
    setImageLoaded(false)
    setImageFailed(false)
    setExpanded(false)
    setDetailOpen(false)
    setCameraOpen(false)
    setCharacterOpen(false)
    setCharacterIntro(null)
    setCharDismissed(false)
    setActiveVenue(null)
    setIsAutoplay(false)
    setAutoplayTriggered(false)
    setScenes(null)
    setSceneSelectorOpen(false)
    setActiveScene(null)
    setTimelessSceneOpen(false)
    // Restart ambient audio for new era
    if (ambientRef.current) {
      ambientRef.current.stop()
      ambientRef.current = null
    }
    if (ambientStarted) {
      const profile = getAmbientProfile(era.id, era.era_type)
      ambientRef.current = startAmbient(profile)
    }
  }

  // Start ambient on first user tap (browser autoplay policy)
  const startAmbientOnInteraction = useCallback(() => {
    if (ambientStarted || !era) return
    setAmbientStarted(true)
    const profile = getAmbientProfile(era.id, era.era_type)
    ambientRef.current = startAmbient(profile)
  }, [ambientStarted, era])

  useEffect(() => {
    const handler = () => startAmbientOnInteraction()
    document.addEventListener('touchstart', handler, { once: true })
    document.addEventListener('click', handler, { once: true })
    return () => {
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('click', handler)
    }
  }, [startAmbientOnInteraction])

  // Cleanup ambient on unmount
  useEffect(() => {
    return () => {
      if (ambientRef.current) {
        ambientRef.current.stop()
        ambientRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const handler = () => setCameraOpen(true)
    window.addEventListener('open-timelens', handler)
    return () => window.removeEventListener('open-timelens', handler)
  }, [])

  useEffect(() => {
    if (!era || initialToolOpened.current) return
    if (initialTool === 'timelens') {
      initialToolOpened.current = true
      setCameraOpen(true)
    }
    if (initialTool === 'moment') {
      initialToolOpened.current = true
      setTimelessSceneOpen(true)
    }
  }, [era, initialTool])

  // Scene loading disabled, video feature paused for now
  // const API_BASE = import.meta.env.VITE_API_URL || ''

  // Auto-trigger scene when era has an autoplay venue
  useEffect(() => {
    if (!era || autoplayTriggered || activeVenue) return
    const autoVenue = getAutoplayVenue(era.id)
    if (!autoVenue) return

    const timer = setTimeout(() => {
      if (!autoplayTriggered) {
        setActiveVenue(autoVenue)
        setIsAutoplay(true)
        setAutoplayTriggered(true)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [era, autoplayTriggered, activeVenue])

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

      {/* Background image, full bleed with Ken Burns + gyroscope parallax */}
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
                translate: `${tilt.x * 0.5}px ${tilt.y * 0.5}px`,
                transition: 'translate 0.15s ease-out',
                willChange: 'transform',
              }}
              initial={{ scale: 1.0, x: '0%' }}
              animate={{ scale: 1.1, x: '2%' }}
              transition={{
                duration: 25,
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

      {/* Bottom gradient, heavier at the bottom for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.85) 20%, rgba(10,10,10,0.5) 40%, transparent 60%)',
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
        {/* Audio button, only show if this era has audio */}
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
        <a
          href={`/demo/${ACTIVE_PROPERTY.slug}/trails`}
          title="Open story trails"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-present/20 bg-surface/60 text-present/70 backdrop-blur-md transition-colors hover:bg-surface/80"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 6h10a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h11" />
            <circle cx="5" cy="6" r="2" />
            <circle cx="19" cy="20" r="2" />
          </svg>
        </a>
        <button
          onClick={() => setPassportOpen(true)}
          title="Open passport"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-present/20 bg-surface/60 text-present/70 backdrop-blur-md transition-colors hover:bg-surface/80"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 7h6M9 17h6" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        </button>
        {/* Share button */}
        <button
          onClick={() => { setShareOpen(true); posthog.capture('share_card_generated', { zone_id: selectedLocation, layer_id: selectedEra }) }}
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
          onClick={() => {
            if (showCameraPulse) {
              sessionStorage.setItem('camera_pulse_shown', 'true')
              setShowCameraPulse(false)
            }
            setCameraOpen(true)
          }}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm ${showCameraPulse ? 'animate-pulse ring-2 ring-accent/50' : ''}`}
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

      {/* Era label + year, top left */}
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
              maxWidth: guidedTrail ? 168 : 220,
              overflow: 'hidden',
            }}
          >
            <span
              className="font-ui uppercase"
              style={{
                color: '#f59e0b',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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

      {/* BLE Nearby pill */}
      {useStore.getState().bleSimEnabled && useStore.getState().bleSimZone === selectedLocation && (
        <div className="absolute top-12 left-3 z-20 flex items-center gap-1.5 rounded-full border border-accent/30 bg-black/60 px-2.5 py-1 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span className="font-ui text-[10px] text-accent">
            You're at {locations.find(l => l.id === selectedLocation)?.name}
          </span>
        </div>
      )}

      <TrailGuide
        trail={guidedTrail}
        stepIndex={initialTrail?.stepIndex || 0}
        characterName={character?.name}
        onAskCharacter={character ? () => {
          setCharacterIntro(character.opening_line)
          setTimelessSceneOpen(false)
          setChatKey(k => k + 1)
          setCharacterOpen(true)
          posthog.capture('trail_step_character_opened', { zone_id: selectedLocation, layer_id: selectedEra, trail_id: guidedTrail?.id })
        } : null}
        onExperienceStop={() => {
          if (ambientRef.current) {
            ambientRef.current.stop()
            ambientRef.current = null
          }
          setExpanded(false)
          setTimelessSceneOpen(true)
          posthog.capture('trail_step_moment_opened', { zone_id: selectedLocation, layer_id: selectedEra, trail_id: guidedTrail?.id })
        }}
        onOpenPassport={() => setPassportOpen(true)}
      />

      {/* Bottom sheet, collapsed peek or expanded fixed overlay */}
      {expanded ? (
        <div
          className="mobile-frame"
          style={{
            position: 'fixed',
            bottom: 0,
            height: '85vh',
            zIndex: 10,
            backgroundColor: 'rgba(10,10,10,0.97)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Drag handle, swipe down to close */}
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

          {/* Scrollable content, full description + key events + landscape */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 20px 20px', maxWidth: 600, margin: '0 auto', width: '100%' }}>
            {/* Experience CTA, prominent at top of expanded sheet */}
            <button
              onClick={() => {
                if (ambientRef.current) { ambientRef.current.stop(); ambientRef.current = null }
                setExpanded(false)
                setTimelessSceneOpen(true)
                posthog.capture('scene_launched', { zone_id: selectedLocation, layer_id: selectedEra })
              }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 w-full mb-4"
              style={{ background: `${color}1f`, border: `1px solid ${color}40` }}
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: `${color}33` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
              <span className="flex flex-col items-start">
                <span className="text-sm font-medium" style={{ color }}>Experience This Moment</span>
                <span className="text-[10px]" style={{ color: `${color}99` }}>
                  {character ? `${character.name} narrates` : `${era.year_display || era.label}`}
                </span>
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-auto">
                <path d="M5 3l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <h2 className="font-heading text-xl font-semibold leading-tight text-white">
              {era.headline}
            </h2>
            <p className="mt-2 font-ui text-sm leading-relaxed text-white/72">
              {era.description}
            </p>

            {era.era_type === 'future' && (
              <FutureVoting era={era} />
            )}

            <AffinityOffer
              offer={offer}
              trail={activeTrail}
              onAction={() => {
                if (activeTrail || offer?.action === 'trails') {
                  window.location.href = `/demo/${ACTIVE_PROPERTY.slug}/trails`
                  return
                }
                setConciergeIntro(buildConciergeIntro({
                  offer,
                  era,
                  locationName: locations.find((l) => l.id === selectedLocation)?.name,
                }))
                setConciergeOpen(true)
                posthog.capture('concierge_opened', { zone_id: selectedLocation, context: 'affinity_offer' })
              }}
            />

            {era.era_type !== 'future' && era.key_events && era.key_events.length > 0 && (
              <div className="mt-4">
                {era.key_events.map((evt, i) => (
                  <div key={i} className="mt-2 flex gap-2">
                    <span className="font-mono text-[10px] shrink-0" style={{ color: `${color}99` }}>
                      {evt.year}
                    </span>
                    <span className="font-ui text-xs leading-relaxed text-white/55">
                      {evt.event}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {era.landscape && (
              <p className="mt-4 font-ui text-sm italic leading-relaxed text-white/55">
                {era.landscape}
              </p>
            )}

            {venues.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '12px'
                }}>
                  ENTER THIS ERA
                </div>
                {venues.map(venue => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onEnter={setActiveVenue}
                  />
                ))}
              </div>
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
          {/* Drag handle, tappable to expand */}
          <div
            className="relative flex cursor-grab flex-col items-center pb-1 pt-2 active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
            onClick={() => setExpanded(true)}
          >
            <div className="h-1 w-8 rounded-full bg-white/25" />
            <span className="mt-1 font-ui text-[9px] tracking-wider text-white/35 uppercase">
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
                <h2 className="font-heading text-xl font-semibold leading-tight text-white">
                  {era.headline}
                </h2>
                <p className="mt-2 font-ui text-sm leading-relaxed text-white/75 line-clamp-2">
                  {oneSentence(era.description)}
                </p>

                {/* Experience This Moment, available for ALL eras */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Pause ExperienceWindow ambient, TimelessScene has its own
                    if (ambientRef.current) {
                      ambientRef.current.stop()
                      ambientRef.current = null
                    }
                    setTimelessSceneOpen(true)
                    posthog.capture('scene_launched', { zone_id: selectedLocation, layer_id: selectedEra })
                  }}
                  className="mt-3 flex items-center gap-3 rounded-2xl px-4 py-3 w-full"
                  style={{
                    background: `${color}1f`,
                    border: `1px solid ${color}40`,
                  }}
                >
                  <span
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: `${color}33` }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </span>
                  <span className="flex flex-col items-start">
                    <span className="text-sm font-medium" style={{ color }}>
                      Experience This Moment
                    </span>
                    <span className="text-[10px]" style={{ color: `${color}99` }}>
                      {character ? `${character.name} narrates` : `${era.year_display || era.label}`}
                    </span>
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-auto">
                    <path d="M5 3l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>

                {/* Watch Scenes CTA, disabled while video feature is paused */}
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

      {/* Camera time-travel overlay */}
      {cameraOpen && (
        <CameraTimeTravel
          eras={eras}
          initialEra={era}
          zoneName={locations.find(l => l.id === selectedLocation)?.name}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* Share card overlay */}
      {shareOpen && (
        <ShareCard
          era={era}
          locationName={locations.find((l) => l.id === selectedLocation)?.name}
          imageUrl={imageUrl}
          onClose={() => setShareOpen(false)}
        />
      )}

      <PassportPanel
        open={passportOpen}
        onClose={() => setPassportOpen(false)}
      />

      {/* Character chat, portal to body to avoid overflow:hidden clipping */}
      {characterOpen && createPortal(
        <CharacterChat
          key={`chat-${era?.id}-${chatKey}`}
          era={era}
          sceneIntro={characterIntro || `I am here. Ask me anything about ${era?.label || 'this time'}.`}
          trailContext={trailChatContext}
          backLabel={guidedTrail ? `${guidedTrail.title} trail` : undefined}
          onDismiss={() => {
            setCharacterOpen(false)
            setCharacterIntro(null)
            setCharDismissed(true)
            dismissCharacter()
          }}
        />,
        document.body
      )}

      {/* Venue scene overlay */}
      {activeVenue && (
        <VenueScene
          venue={activeVenue}
          era={era}
          autoplay={isAutoplay}
          onClose={() => { setActiveVenue(null); setIsAutoplay(false) }}
        />
      )}

      {/* Scene selector overlay, shows available episodes */}
      <SceneSelector
        scenes={scenes}
        visible={sceneSelectorOpen}
        onClose={() => setSceneSelectorOpen(false)}
        onSelect={(scene) => {
          setSceneSelectorOpen(false)
          setActiveScene(scene)
        }}
      />

      {/* Scene player overlay, AI-generated dialogue video/audio */}
      {activeScene && createPortal(
        <ScenePlayer
          scene={activeScene}
          onClose={() => setActiveScene(null)}
          onTalkTo={(_characterId) => {
            setActiveScene(null)
            setCharacterOpen(true)
            posthog.capture('character_chat_opened', { zone_id: selectedLocation, layer_id: selectedEra, character_id: character?.name })
          }}
        />,
        document.body
      )}

      {/* Timeless Scene, immersive narrated experience */}
      {timelessSceneOpen && createPortal(
        <TimelessScene
          era={era}
          character={character}
          imageUrl={imageUrl}
          locationName={locations.find((l) => l.id === selectedLocation)?.name}
          onClose={() => {
            setTimelessSceneOpen(false)
            // Resume ambient din
            if (ambientStarted && !ambientRef.current && era) {
              const profile = getAmbientProfile(era.id, era.era_type)
              ambientRef.current = startAmbient(profile)
            }
          }}
          onTalkTo={() => {
            setTimelessSceneOpen(false)
            setCharacterIntro(null)
            setChatKey(k => k + 1)
            setCharacterOpen(true)
            posthog.capture('character_chat_opened', { zone_id: selectedLocation, layer_id: selectedEra, character_id: character?.name })
          }}
        />,
        document.body
      )}

      {/* Concierge FAB */}
      {!conciergeOpen && !characterOpen && !timelessSceneOpen && !cameraOpen && (
        <ConciergeFAB onClick={() => {
          if (conciergeCharacter) {
            setConciergeIntro(null)
            setConciergeOpen(true)
            posthog.capture('concierge_opened', { zone_id: selectedLocation, context: 'fab' })
          }
        }} />
      )}

      {/* Concierge Chat overlay */}
      {conciergeOpen && conciergeCharacter && (
        <CharacterChat
          era={eras.find(e => e.id === conciergeEraId)}
          character={conciergeCharacter}
          sceneIntro={conciergeIntro}
          onDismiss={() => {
            setConciergeOpen(false)
            setConciergeIntro(null)
          }}
          backLabel="Back to Experience"
        />
      )}
    </div>
  )
}
