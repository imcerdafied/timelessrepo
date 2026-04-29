import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * ScenePlayer, plays a two-character dialogue scene
 *
 * Supports three modes:
 * 1. VIDEO mode: Two <video> elements layered, toggling based on active speaker
 * 2. AUDIO mode: Character portraits with TTS audio playback + subtitles
 * 3. CINEMATIC mode: Ken Burns pan over background image + ambient audio + voice
 */

const API_BASE = import.meta.env.VITE_API_URL || ''

// Speech timing constants
const CHARS_PER_SECOND = 12
const PAUSE_BETWEEN_LINES = 1.2

function estimateLineDuration(text) {
  return Math.max(2, text.length / CHARS_PER_SECOND + PAUSE_BETWEEN_LINES)
}

export default function ScenePlayer({ scene, onClose, onTalkTo }) {
  const { script, title, date, setting, mode = 'video' } = scene

  // State
  const [phase, setPhase] = useState('intro')
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [subtitlesOn, setSubtitlesOn] = useState(true)

  // Refs
  const videoRefs = useRef({})
  const audioRefs = useRef({})
  const ambientRef = useRef(null)
  const timerRef = useRef(null)

  const currentLine = script[currentLineIndex]
  const activeCharId = currentLine?.characterId

  // Build timeline
  const timeline = useRef([])
  useEffect(() => {
    let t = 0
    timeline.current = script.map((line) => {
      const duration = estimateLineDuration(line.text)
      const entry = { ...line, startTime: t, duration }
      t += duration
      return entry
    })
  }, [script])

  // Get unique character IDs
  const characterIds = [...new Set(script.map((l) => l.characterId))]

  // Build character lookup from scene data
  const characters = {}
  if (scene.characters) {
    scene.characters.forEach((c) => { characters[c.id] = c })
  }
  if (scene.videos) {
    Object.entries(scene.videos).forEach(([id, v]) => {
      if (!characters[id]) characters[id] = {}
      characters[id] = { ...characters[id], ...v }
    })
  }

  // Get video/audio URLs
  const getVideoUrl = (charId) => {
    const v = scene.videos?.[charId]
    if (!v) return null
    if (v.videoUrl) return v.videoUrl
    if (v.file) return `${API_BASE}/scenes/1906-earthquake/${v.file}`
    return null
  }

  const getAudioUrl = (charId) => {
    if (scene.audioFiles?.[charId]) {
      return `${API_BASE}/scenes/1906-earthquake/${scene.audioFiles[charId]}`
    }
    const sceneId = scene.sceneId || ''
    if (sceneId.includes('fire')) {
      return `${API_BASE}/scenes/1906-earthquake/${charId}-fire.mp3`
    }
    return null
  }

  const getAmbientUrl = () => {
    if (scene.ambientAudio) return `${API_BASE}/scenes/1906-earthquake/${scene.ambientAudio}`
    return null
  }

  // Start playback, just set state, actual media play happens in useEffect
  const startPlayback = useCallback(() => {
    setPhase('playing')
    setCurrentLineIndex(0)
    setIsPlaying(true)
  }, [])

  // *** KEY FIX: Start media playback AFTER React renders the playing phase elements ***
  useEffect(() => {
    if (phase !== 'playing' || !isPlaying) return

    // Small delay to ensure DOM elements are mounted and refs are set
    const startTimer = setTimeout(() => {
      if (mode === 'video') {
        characterIds.forEach((id) => {
          const vid = videoRefs.current[id]
          if (vid) {
            vid.muted = (id !== activeCharId)
            vid.currentTime = 0
            vid.play().catch((e) => console.warn('Video play failed:', id, e))
          }
        })
      } else {
        // Audio/cinematic mode: start all audio tracks
        characterIds.forEach((id) => {
          const aud = audioRefs.current[id]
          if (aud) {
            aud.muted = (id !== activeCharId)
            aud.currentTime = 0
            aud.play().catch((e) => console.warn('Audio play failed:', id, e))
          }
        })
        // Start ambient audio (cinematic mode)
        if (ambientRef.current) {
          ambientRef.current.currentTime = 0
          ambientRef.current.loop = true
          ambientRef.current.volume = 0.3
          ambientRef.current.play().catch((e) => console.warn('Ambient play failed:', e))
        }
      }
    }, 100)

    return () => clearTimeout(startTimer)
  }, [phase, isPlaying]) // Only fire when phase/isPlaying change

  // Advance through dialogue lines
  useEffect(() => {
    if (!isPlaying || phase !== 'playing') return

    const line = timeline.current[currentLineIndex]
    if (!line) {
      setPhase('done')
      setIsPlaying(false)
      return
    }

    timerRef.current = setTimeout(() => {
      if (currentLineIndex + 1 >= script.length) {
        setPhase('done')
        setIsPlaying(false)
      } else {
        setCurrentLineIndex(currentLineIndex + 1)
      }
    }, line.duration * 1000)

    return () => clearTimeout(timerRef.current)
  }, [currentLineIndex, isPlaying, phase, script.length])

  // Video mode: mute/unmute based on active character
  useEffect(() => {
    if (mode !== 'video' || phase !== 'playing') return
    characterIds.forEach((id) => {
      const vid = videoRefs.current[id]
      if (vid) vid.muted = (id !== activeCharId)
    })
  }, [activeCharId, phase, characterIds, mode])

  // Audio/cinematic mode: mute/unmute based on active character
  useEffect(() => {
    if (mode === 'video' || phase !== 'playing') return
    characterIds.forEach((id) => {
      const aud = audioRefs.current[id]
      if (aud) aud.muted = (id !== activeCharId)
    })
  }, [activeCharId, phase, characterIds, mode])

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      if (ambientRef.current) {
        ambientRef.current.pause()
        ambientRef.current.currentTime = 0
      }
    }
  }, [])

  // Fade out ambient when scene ends
  useEffect(() => {
    if (phase === 'done' && ambientRef.current) {
      const fadeOut = setInterval(() => {
        if (ambientRef.current && ambientRef.current.volume > 0.05) {
          ambientRef.current.volume = Math.max(0, ambientRef.current.volume - 0.03)
        } else {
          if (ambientRef.current) ambientRef.current.pause()
          clearInterval(fadeOut)
        }
      }, 100)
      return () => clearInterval(fadeOut)
    }
  }, [phase])

  // Pause all media when scene ends
  useEffect(() => {
    if (phase === 'done') {
      characterIds.forEach((id) => {
        const vid = videoRefs.current[id]
        if (vid) vid.pause()
        const aud = audioRefs.current[id]
        if (aud) aud.pause()
      })
    }
  }, [phase])

  const progress = script.length > 0 ? ((currentLineIndex + 1) / script.length) * 100 : 0

  // Helper to render a portrait image
  const renderPortrait = (charId, size = 64, borderColor = 'rgba(200,134,10,0.3)') => {
    const char = characters[charId]
    const url = char?.portraitUrl
    return (
      <div
        className="rounded-full bg-cover bg-center"
        style={{
          width: size,
          height: size,
          backgroundImage: url ? `url(${url})` : 'none',
          backgroundColor: url ? 'transparent' : '#222',
          border: `2px solid ${borderColor}`,
        }}
      />
    )
  }

  // ── INTRO SCREEN ──
  if (phase === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center mobile-frame"
        style={{ background: '#0A0A0A' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-white/60 text-lg">✕</span>
        </button>

        <div className="max-w-sm px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] tracking-[0.2em] uppercase mb-4"
            style={{ color: '#C8860A' }}
          >
            {mode === 'video' ? 'AI-Generated Scene' : mode === 'cinematic' ? 'Cinematic Experience' : 'AI-Generated Audio Drama'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl mb-2 font-semibold"
            style={{ fontFamily: 'Playfair Display, serif', color: '#F5F5F5' }}
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm mb-4"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {date}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-sm leading-relaxed mb-8"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {setting}
          </motion.p>

          {/* Character portraits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex justify-center gap-6 mb-10"
          >
            {characterIds.map((id) => {
              const char = characters[id]
              return (
                <div key={id} className="text-center">
                  <div className="mb-2 mx-auto">
                    {renderPortrait(id, 64)}
                  </div>
                  <p className="text-xs font-medium" style={{ color: '#F5F5F5' }}>
                    {char?.name || id}
                  </p>
                  {char?.role && (
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {char.role}
                    </p>
                  )}
                </div>
              )
            })}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            onClick={startPlayback}
            className="px-8 py-3 rounded-full text-sm font-medium tracking-wide"
            style={{ background: '#C8860A', color: '#0A0A0A' }}
          >
            {mode === 'video' ? 'Watch Scene' : mode === 'cinematic' ? 'Experience Scene' : 'Listen to Scene'}
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // ── PLAYING / DONE ──
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 mobile-frame"
      style={{ background: '#0A0A0A' }}
    >
      {/* VIDEO MODE: Layered video elements */}
      {mode === 'video' && (
        <div className="absolute inset-0">
          {characterIds.map((id) => {
            const url = getVideoUrl(id)
            if (!url) return null
            const isActive = phase === 'playing' ? id === activeCharId : false
            return (
              <motion.video
                key={id}
                ref={(el) => { videoRefs.current[id] = el }}
                src={url}
                playsInline
                preload="auto"
                muted
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: isActive ? 2 : 1 }}
              />
            )
          })}
        </div>
      )}

      {/* AUDIO MODE: Portrait + animated background */}
      {mode === 'audio' && (
        <div className="absolute inset-0">
          {/* Hidden audio elements */}
          {characterIds.map((id) => (
            <audio
              key={id}
              ref={(el) => { audioRefs.current[id] = el }}
              src={getAudioUrl(id)}
              preload="auto"
            />
          ))}

          {/* Animated portrait display */}
          <div className="absolute inset-0 flex items-center justify-center">
            {characterIds.map((id) => {
              const char = characters[id]
              const isActive = phase === 'playing' ? id === activeCharId : false
              return (
                <motion.div
                  key={id}
                  className="absolute flex flex-col items-center"
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ zIndex: isActive ? 2 : 1 }}
                >
                  <div
                    style={{
                      filter: isActive ? 'drop-shadow(0 0 40px rgba(200,134,10,0.2))' : 'none',
                    }}
                  >
                    {renderPortrait(id, 224, isActive ? 'rgba(200,134,10,0.5)' : 'rgba(200,134,10,0.3)')}
                  </div>
                  <motion.p
                    className="mt-4 text-xs tracking-[0.15em] uppercase"
                    style={{ color: '#C8860A' }}
                    animate={{ opacity: isActive ? 1 : 0 }}
                  >
                    {char?.name}
                  </motion.p>
                </motion.div>
              )
            })}
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(200,100,20,0.06) 0%, transparent 60%)',
            }}
          />
        </div>
      )}

      {/* CINEMATIC MODE: Ken Burns pan over era image + ambient audio + voice */}
      {mode === 'cinematic' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Hidden audio elements */}
          {characterIds.map((id) => (
            <audio
              key={id}
              ref={(el) => { audioRefs.current[id] = el }}
              src={getAudioUrl(id)}
              preload="auto"
            />
          ))}

          {/* Ambient audio */}
          {getAmbientUrl() && (
            <audio
              ref={ambientRef}
              src={getAmbientUrl()}
              preload="auto"
              loop
            />
          )}

          {/* Ken Burns background, slow pan across the era image */}
          <motion.div
            className="absolute"
            style={{ inset: '-15%' }}
            initial={{ scale: 1.0, x: 0, y: 0 }}
            animate={phase === 'playing' ? {
              scale: [1.0, 1.12, 1.05, 1.15],
              x: ['0%', '3%', '-2%', '4%'],
              y: ['0%', '-2%', '1%', '-3%'],
            } : { scale: 1.0 }}
            transition={{
              duration: 60,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <img
              src={scene.backgroundImage}
              alt="Scene"
              className="w-full h-full object-cover"
              style={{
                filter: 'brightness(0.4) saturate(0.7) sepia(0.3)',
              }}
            />
          </motion.div>

          {/* Firelight overlay, warm, flickering glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={phase === 'playing' ? {
              opacity: [0.15, 0.25, 0.18, 0.22, 0.15],
            } : { opacity: 0.15 }}
            transition={{
              duration: 4,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            style={{
              background: 'radial-gradient(ellipse at 30% 60%, rgba(220,120,30,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 40%, rgba(180,80,20,0.3) 0%, transparent 55%)',
            }}
          />

          {/* Small character portraits in corners, indicate who's speaking */}
          <div className="absolute top-16 left-0 right-0 z-10 flex justify-center gap-8 px-6">
            {characterIds.map((id) => {
              const char = characters[id]
              const isActive = phase === 'playing' ? id === activeCharId : false
              return (
                <motion.div
                  key={id}
                  className="flex flex-col items-center"
                  animate={{
                    opacity: isActive ? 1 : 0.3,
                    scale: isActive ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {renderPortrait(id, 48, isActive ? 'rgba(200,134,10,0.6)' : 'rgba(255,255,255,0.15)')}
                  <p
                    className="mt-1 text-[9px] tracking-wider uppercase"
                    style={{ color: isActive ? '#C8860A' : 'rgba(255,255,255,0.3)' }}
                  >
                    {char?.name?.split(' ')[0]}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
            }}
          />
        </div>
      )}

      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-24 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}
      />

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      >
        <span className="text-white/60 text-lg">✕</span>
      </button>

      {/* Subtitles toggle */}
      <button
        onClick={() => setSubtitlesOn(!subtitlesOn)}
        className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full text-xs"
        style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          color: subtitlesOn ? '#C8860A' : 'rgba(255,255,255,0.4)',
          border: `1px solid ${subtitlesOn ? 'rgba(200,134,10,0.3)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        CC
      </button>

      {/* Mode indicator */}
      {(mode === 'audio' || mode === 'cinematic') && (
        <div
          className="absolute top-4 left-16 z-20 px-3 py-1.5 rounded-full text-[10px] tracking-wider uppercase"
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.3)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {mode === 'cinematic' ? 'Cinematic' : 'Audio'}
        </div>
      )}

      {/* Speaker name + subtitle area */}
      {phase === 'playing' && currentLine && (
        <div className="absolute bottom-16 left-0 right-0 z-20 px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLineIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <p
                className="text-xs tracking-[0.15em] uppercase mb-2 font-medium"
                style={{ color: '#C8860A' }}
              >
                {currentLine.speaker}
              </p>

              {subtitlesOn && (
                <p
                  className="text-base leading-relaxed"
                  style={{
                    color: '#F5F5F5',
                    textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                  }}
                >
                  {currentLine.text}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div
            className="mt-4 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: '#C8860A' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* DONE STATE */}
      {phase === 'done' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(6px)' }}
          />
          <div className="relative z-10 max-w-sm px-6 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] tracking-[0.2em] uppercase mb-3"
              style={{ color: '#C8860A' }}
            >
              Scene Complete
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl mb-6 font-semibold"
              style={{ fontFamily: 'Playfair Display, serif', color: '#F5F5F5' }}
            >
              {title}
            </motion.h2>

            <div className="flex flex-col gap-3">
              {/* Replay */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={startPlayback}
                className="w-full px-6 py-3 rounded-full text-sm font-medium"
                style={{
                  background: '#C8860A',
                  color: '#0A0A0A',
                }}
              >
                Watch Again
              </motion.button>

              {/* Talk to characters */}
              {characterIds.map((id) => {
                const char = characters[id]
                return (
                  <motion.button
                    key={id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => onTalkTo?.(id)}
                    className="w-full px-6 py-3 rounded-full text-sm font-medium"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: '#F5F5F5',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    Talk to {char?.name || id}
                  </motion.button>
                )
              })}

              {/* Close */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={onClose}
                className="w-full px-6 py-3 text-sm"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Back to Era
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
