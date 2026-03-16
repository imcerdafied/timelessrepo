import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildMonologue, getSceneImages, getEraVisualStyle } from '../data/scene-data'
import { getAmbientProfile, startAmbient } from '../data/ambient-profiles'

/**
 * TimelessScene — the core Timeless Moment experience
 *
 * Generic: works for ANY era at ANY location.
 * Ken Burns imagery + era-appropriate ambient soundscape + character monologue + conversation.
 *
 * Props:
 *   era        — era object from locations.json
 *   character  — character from ERA_CHARACTERS
 *   imageUrl   — main era image URL
 *   locationName — display name of the location
 *   onClose    — close callback
 *   onTalkTo   — open character chat callback
 */

// Ken Burns motion variants — cycle through these
const kenBurnsVariants = [
  { initial: { scale: 1.0, x: '0%', y: '0%' }, animate: { scale: 1.15, x: '3%', y: '-2%' } },
  { initial: { scale: 1.1, x: '-2%', y: '1%' }, animate: { scale: 1.0, x: '2%', y: '-1%' } },
  { initial: { scale: 1.05, x: '1%', y: '-1%' }, animate: { scale: 1.12, x: '-3%', y: '2%' } },
]

export default function TimelessScene({ era, character, imageUrl, locationName, onClose, onTalkTo }) {
  const [phase, setPhase] = useState('intro') // intro | playing | conversation
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const [visibleLines, setVisibleLines] = useState(0)
  const [audioReady, setAudioReady] = useState(false)

  const audioRef = useRef(null)
  const ambientRef = useRef(null)
  const lineTimerRef = useRef(null)
  const imageTimerRef = useRef(null)

  // Build monologue + scene data from era info
  const monologueData = buildMonologue(era?.id, character, era)
  const lines = monologueData?.lines || []
  const narrator = monologueData?.narrator || (character ? { name: character.name, role: character.role } : null)
  const narratorAudioUrl = monologueData?.audioUrl || null
  const hasAudio = !!narratorAudioUrl

  // Get images for Ken Burns cycling
  const images = getSceneImages(era?.id, imageUrl)

  // Get visual style (filter, overlay) for this era
  const visualStyle = getEraVisualStyle(era?.id, era?.era_type)

  // Get ambient profile name
  const ambientProfile = getAmbientProfile(era?.id, era?.era_type)

  // Preload narrator audio if available
  useEffect(() => {
    if (!narratorAudioUrl) {
      setAudioReady(true) // no audio to wait for
      return
    }
    const audio = new Audio(narratorAudioUrl)
    audio.preload = 'auto'
    audio.addEventListener('canplaythrough', () => setAudioReady(true), { once: true })
    // Fallback: mark ready after 5s even if audio isn't loaded
    const fallbackTimer = setTimeout(() => setAudioReady(true), 5000)
    audioRef.current = audio
    return () => {
      clearTimeout(fallbackTimer)
      audio.pause()
      audio.src = ''
    }
  }, [narratorAudioUrl])

  // Calculate line timing
  const getLineDurations = useCallback(() => {
    return lines.map(line => {
      const words = line.split(' ').length
      // If we have narrator audio, time to the audio (~130 wpm with pauses)
      // If no audio, go a bit faster (~150 wpm reading pace)
      const wpm = hasAudio ? 2.2 : 2.8
      return Math.max(2.5, (words / wpm) + 1.2)
    })
  }, [lines, hasAudio])

  // Start text reveal
  const startTextReveal = useCallback(() => {
    const durations = getLineDurations()
    let lineIdx = 0
    function revealNext() {
      if (lineIdx >= lines.length) return
      lineTimerRef.current = setTimeout(() => {
        lineIdx++
        setVisibleLines(lineIdx)
        if (lineIdx < lines.length) {
          revealNext()
        } else if (!hasAudio) {
          // No narrator audio — auto-transition to conversation after text ends
          setTimeout(() => setPhase('conversation'), 3000)
        }
      }, durations[lineIdx] * 1000)
    }
    // First line after a beat
    lineTimerRef.current = setTimeout(() => {
      setVisibleLines(1)
      lineIdx = 1
      revealNext()
    }, 1500)
  }, [lines, hasAudio, getLineDurations])

  // Start experience
  const startExperience = useCallback(() => {
    setPhase('playing')
    setVisibleLines(0)
    setCurrentImageIdx(0)

    // Start ambient soundscape
    ambientRef.current = startAmbient(ambientProfile)

    // Start narrator audio if available
    if (audioRef.current && hasAudio) {
      audioRef.current.currentTime = 0
      audioRef.current.volume = 0.85
      audioRef.current.play().catch(e => console.warn('Audio play failed:', e))
    }

    // Start progressive text reveal
    startTextReveal()

    // Cycle images every 15 seconds
    if (images.length > 1) {
      imageTimerRef.current = setInterval(() => {
        setCurrentImageIdx(prev => (prev + 1) % images.length)
      }, 15000)
    }
  }, [ambientProfile, hasAudio, startTextReveal, images.length])

  // Detect when narrator audio ends → transition to conversation
  useEffect(() => {
    if (phase !== 'playing' || !audioRef.current || !hasAudio) return
    const audio = audioRef.current
    const onEnded = () => {
      setVisibleLines(lines.length)
      if (ambientRef.current) {
        ambientRef.current.setVolume(0.3, 3)
      }
      setTimeout(() => setPhase('conversation'), 3000)
    }
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [phase, hasAudio, lines.length])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(lineTimerRef.current)
      clearInterval(imageTimerRef.current)
      if (ambientRef.current) ambientRef.current.stop()
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  const handleClose = () => {
    if (ambientRef.current) ambientRef.current.stop()
    if (audioRef.current) audioRef.current.pause()
    clearTimeout(lineTimerRef.current)
    clearInterval(imageTimerRef.current)
    onClose()
  }

  const handleTalkTo = () => {
    if (audioRef.current) audioRef.current.pause()
    if (ambientRef.current) ambientRef.current.setVolume(0.15, 1)
    onTalkTo?.(era?.id)
  }

  const handleReplay = () => {
    setPhase('playing')
    setVisibleLines(0)
    if (audioRef.current && hasAudio) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
    if (ambientRef.current) ambientRef.current.setVolume(0.7, 2)
    startTextReveal()
  }

  // Era color accent
  const eraColors = { past: '#C8860A', present: '#F5F5F5', future: '#5B9BD5' }
  const accent = eraColors[era?.era_type] || '#C8860A'

  if (!era || !lines.length) return null

  // ── INTRO SCREEN ──────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: '#0A0A0A' }}
      >
        {/* Background preview */}
        <div className="absolute inset-0 overflow-hidden">
          {images[0] && (
            <img
              src={images[0]}
              alt={era.label}
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.15) saturate(0.5) sepia(0.3)' }}
            />
          )}
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-white/60 text-lg">&times;</span>
        </button>

        <div className="relative z-10 max-w-sm px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] tracking-[0.25em] uppercase mb-2"
            style={{ color: `${accent}cc` }}
          >
            Timeless Moment
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-[11px] tracking-[0.15em] uppercase mb-6"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {locationName} &middot; {era.year_display}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-3xl mb-4 font-semibold"
            style={{ fontFamily: 'Playfair Display, serif', color: '#F5F5F5' }}
          >
            {era.headline || era.label}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {era.description?.substring(0, 180)}...
          </motion.p>

          {narrator && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-xs leading-relaxed mb-8"
              style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}
            >
              {narrator.name}, {narrator.role}
            </motion.p>
          )}

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            onClick={startExperience}
            className="px-8 py-3.5 rounded-full text-sm font-medium tracking-wide"
            style={{
              background: audioReady
                ? `linear-gradient(135deg, ${accent}, ${accent}cc)`
                : `${accent}44`,
              color: audioReady ? '#0A0A0A' : 'rgba(255,255,255,0.4)',
              pointerEvents: audioReady ? 'auto' : 'none',
            }}
          >
            {audioReady ? 'Experience This Moment' : 'Loading...'}
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // ── PLAYING / CONVERSATION ────────────────────────────────────────
  const kbVariant = kenBurnsVariants[currentImageIdx % kenBurnsVariants.length]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50"
      style={{ background: '#0A0A0A' }}
    >
      {/* Ken Burns background */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIdx}
            className="absolute"
            style={{ inset: '-12%' }}
            initial={{ opacity: 0, ...kbVariant.initial }}
            animate={{ opacity: 1, ...kbVariant.animate }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 2 },
              scale: { duration: 20, ease: 'linear' },
              x: { duration: 20, ease: 'linear' },
              y: { duration: 20, ease: 'linear' },
            }}
          >
            <img
              src={images[currentImageIdx % images.length] || imageUrl}
              alt={era.label}
              className="w-full h-full object-cover"
              style={{ filter: visualStyle.filter }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Era-appropriate overlay */}
      {visualStyle.overlay !== 'none' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={visualStyle.overlayAnim ? {
            opacity: [0.12, 0.22, 0.15, 0.20, 0.12],
          } : {}}
          transition={visualStyle.overlayAnim ? {
            duration: 4,
            ease: 'easeInOut',
            repeat: Infinity,
          } : {}}
          style={{ background: visualStyle.overlay }}
        />
      )}

      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-28 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}
      />

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: '65%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 30%, transparent 100%)',
        }}
      />

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      >
        <span className="text-white/60 text-lg">&times;</span>
      </button>

      {/* Location / year label */}
      <div className="absolute top-5 left-5 z-20">
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            borderRadius: 999,
            padding: '4px 12px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: accent, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {locationName || era.label}
          </span>
          <span style={{ color: `${accent}88`, fontSize: 10, fontFamily: 'monospace' }}>
            {era.year_display}
          </span>
        </div>
      </div>

      {/* Narrator name */}
      {phase === 'playing' && narrator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute top-5 left-0 right-0 z-20 flex justify-center"
        >
          <span style={{
            color: `${accent}99`,
            fontSize: 9,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            {narrator.name}
          </span>
        </motion.div>
      )}

      {/* Progressive text */}
      {phase === 'playing' && (
        <div
          className="absolute bottom-8 left-0 right-0 z-20 px-6"
          style={{ maxHeight: '55%', overflow: 'hidden' }}
        >
          <div className="flex flex-col justify-end" style={{ minHeight: '100%' }}>
            {lines.slice(0, visibleLines).map((line, i) => {
              const isLatest = i === visibleLines - 1
              const isFaded = i < visibleLines - 3
              return (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: isFaded ? 0.2 : isLatest ? 1 : 0.5,
                    y: 0,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="mb-3"
                  style={{
                    color: '#F5F5F5',
                    fontSize: isLatest ? 16 : 14,
                    lineHeight: 1.7,
                    textShadow: '0 2px 12px rgba(0,0,0,0.95)',
                    fontStyle: i === 0 ? 'italic' : 'normal',
                  }}
                >
                  {line}
                </motion.p>
              )
            })}
          </div>
        </div>
      )}

      {/* CONVERSATION PHASE */}
      <AnimatePresence>
        {phase === 'conversation' && character && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center"
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(4px)' }}
            />
            <div className="relative z-10 max-w-sm px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[10px] tracking-[0.2em] uppercase mb-4"
                style={{ color: `${accent}bb` }}
              >
                Someone is here
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl mb-1 font-semibold"
                style={{ fontFamily: 'Playfair Display, serif', color: '#F5F5F5' }}
              >
                {character.name}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs mb-6"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {character.role}
              </motion.p>

              {character.opening_line && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-sm leading-relaxed mb-8"
                  style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}
                >
                  &ldquo;{character.opening_line}&rdquo;
                </motion.p>
              )}

              <div className="flex flex-col gap-3">
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  onClick={handleTalkTo}
                  className="w-full px-6 py-3.5 rounded-full text-sm font-medium tracking-wide"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#0A0A0A' }}
                >
                  Talk to {character.name}
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  onClick={handleReplay}
                  className="w-full px-6 py-3 rounded-full text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#F5F5F5',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {hasAudio ? 'Listen Again' : 'Experience Again'}
                </motion.button>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  onClick={handleClose}
                  className="w-full px-6 py-3 text-sm"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  Back to Era
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No character — end with just replay/close */}
      <AnimatePresence>
        {phase === 'conversation' && !character && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center"
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(4px)' }}
            />
            <div className="relative z-10 max-w-sm px-6 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl mb-6 font-semibold"
                style={{ fontFamily: 'Playfair Display, serif', color: '#F5F5F5' }}
              >
                {era.headline || era.label}
              </motion.h2>

              <div className="flex flex-col gap-3">
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleReplay}
                  className="w-full px-6 py-3.5 rounded-full text-sm font-medium"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#0A0A0A' }}
                >
                  Experience Again
                </motion.button>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleClose}
                  className="w-full px-6 py-3 text-sm"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  Back to Era
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
