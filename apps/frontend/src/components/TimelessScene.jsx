import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * TimelessScene — the core Timeless Moment experience
 *
 * Format: Go anywhere, any time. See imagery with Ken Burns treatment,
 * hear ambient sound of that era, listen to a character narrate,
 * then converse with them.
 *
 * This is the 1906 SF earthquake proof of concept.
 */

const SUPABASE_PUBLIC = 'https://xllwzunjvidtszyklhhm.supabase.co/storage/v1/object/public'

// Scene data for 1906 SF Earthquake
const SCENE = {
  title: 'The Great Earthquake',
  subtitle: 'San Francisco, April 18, 1906',
  location: 'Mission District',
  year: '1906',
  images: [
    `${SUPABASE_PUBLIC}/characters/sf-1906-ruins.jpg`,
    `${SUPABASE_PUBLIC}/characters/sf-1906-aerial.jpg`,
  ],
  audioUrl: `${SUPABASE_PUBLIC}/episodes/sf-1906-scene.mp3`,
  narrator: {
    name: 'Thomas Wakefield',
    role: 'Reporter, San Francisco Examiner',
    voiceId: 'TX3LPaxmHKxFdv7VOQHJ',
  },
  // The monologue text — matches the generated audio
  monologue: [
    "I woke to the sound of the world ending.",
    "It was quarter past five in the morning. April eighteenth. The bed moved... sideways. Not shaking — sliding. Like the floor had become water.",
    "I got to the window and looked out at Market Street... and the facades were peeling off the buildings like skin.",
    "Three-story walls just... folding forward into the street. Brick and glass and timber. The noise — I can't describe the noise. It wasn't a roar. It was deeper than that. It was the sound of the earth disagreeing with itself.",
    "I got dressed. I don't remember deciding to. Shoes, coat, notebook. The reporter in me took over before the man could panic.",
    "South of Market was already burning. You could see the smoke columns — three, four, five of them — rising like pillars holding up some terrible sky.",
    "People were moving north. Everyone was moving north. Families carrying what they could. A woman with a birdcage. A man dragging a trunk with one broken wheel, scraping a line into the cobblestones.",
    "The fire department was already out but the hydrants... the hydrants were dry. The earthquake had broken the water mains beneath the streets. Every last one.",
    "I stood on the corner of Mission and Third and I wrote this in my notebook: The city is on fire and there is no water. God help San Francisco.",
  ],
  // Character for post-scene conversation
  character: {
    name: 'Rosa Castellano',
    role: 'Laundress, Mission District resident',
    opening: 'The ground shook like God himself was angry. My building is gone. Everything I own is gone. But we are alive, mija, and the Mission still stands.',
  },
}

// ─── Web Audio API: 1906 Fire Ambient ───────────────────────────────
function createFireAmbient(audioCtx) {
  const master = audioCtx.createGain()
  master.gain.value = 0
  master.connect(audioCtx.destination)

  // 1. Base rumble — very low brown noise for earthquake aftermath
  const rumbleSize = audioCtx.sampleRate * 4
  const rumbleBuffer = audioCtx.createBuffer(1, rumbleSize, audioCtx.sampleRate)
  const rumbleData = rumbleBuffer.getChannelData(0)
  let lastRumble = 0
  for (let i = 0; i < rumbleSize; i++) {
    const white = Math.random() * 2 - 1
    lastRumble = (lastRumble + 0.02 * white) / 1.02
    rumbleData[i] = lastRumble * 3.5
  }
  const rumble = audioCtx.createBufferSource()
  rumble.buffer = rumbleBuffer
  rumble.loop = true
  const rumbleFilter = audioCtx.createBiquadFilter()
  rumbleFilter.type = 'lowpass'
  rumbleFilter.frequency.value = 120
  const rumbleGain = audioCtx.createGain()
  rumbleGain.gain.value = 0.6
  rumble.connect(rumbleFilter)
  rumbleFilter.connect(rumbleGain)
  rumbleGain.connect(master)
  rumble.start()

  // 2. Fire crackle — bandpass-filtered noise with randomized volume
  const crackleSize = audioCtx.sampleRate * 3
  const crackleBuffer = audioCtx.createBuffer(1, crackleSize, audioCtx.sampleRate)
  const crackleData = crackleBuffer.getChannelData(0)
  for (let i = 0; i < crackleSize; i++) {
    crackleData[i] = (Math.random() * 2 - 1) * (Math.random() > 0.7 ? 1.0 : 0.2)
  }
  const crackle = audioCtx.createBufferSource()
  crackle.buffer = crackleBuffer
  crackle.loop = true
  const crackleFilter = audioCtx.createBiquadFilter()
  crackleFilter.type = 'bandpass'
  crackleFilter.frequency.value = 3000
  crackleFilter.Q.value = 0.8
  const crackleGain = audioCtx.createGain()
  crackleGain.gain.value = 0.15
  crackle.connect(crackleFilter)
  crackleFilter.connect(crackleGain)
  crackleGain.connect(master)
  crackle.start()

  // 3. Wind / smoke drift — filtered noise, slow modulation
  const windSize = audioCtx.sampleRate * 5
  const windBuffer = audioCtx.createBuffer(1, windSize, audioCtx.sampleRate)
  const windData = windBuffer.getChannelData(0)
  let lastWind = 0
  for (let i = 0; i < windSize; i++) {
    const w = Math.random() * 2 - 1
    lastWind = (lastWind + 0.04 * w) / 1.04
    windData[i] = lastWind * 2.5
  }
  const wind = audioCtx.createBufferSource()
  wind.buffer = windBuffer
  wind.loop = true
  const windFilter = audioCtx.createBiquadFilter()
  windFilter.type = 'bandpass'
  windFilter.frequency.value = 400
  windFilter.Q.value = 0.5
  const windGain = audioCtx.createGain()
  windGain.gain.value = 0.25
  wind.connect(windFilter)
  windFilter.connect(windGain)
  windGain.connect(master)
  wind.start()

  // 4. Random wood creak / collapse sounds — scheduled at intervals
  let creakInterval = null
  function scheduleCreak() {
    const delay = 6000 + Math.random() * 18000 // every 6-24 seconds
    creakInterval = setTimeout(() => {
      if (audioCtx.state === 'closed') return
      const osc = audioCtx.createOscillator()
      osc.type = 'sawtooth'
      const startFreq = 60 + Math.random() * 80
      osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(startFreq * 0.3, audioCtx.currentTime + 0.8)
      const creakGain = audioCtx.createGain()
      creakGain.gain.setValueAtTime(0, audioCtx.currentTime)
      creakGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.1)
      creakGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2)
      const creakFilter = audioCtx.createBiquadFilter()
      creakFilter.type = 'bandpass'
      creakFilter.frequency.value = 200
      creakFilter.Q.value = 2
      osc.connect(creakFilter)
      creakFilter.connect(creakGain)
      creakGain.connect(master)
      osc.start()
      osc.stop(audioCtx.currentTime + 1.5)
      scheduleCreak()
    }, delay)
  }
  scheduleCreak()

  // 5. Distant shouts — very faint, occasional bursts of filtered noise
  let shoutInterval = null
  function scheduleShout() {
    const delay = 10000 + Math.random() * 20000 // every 10-30 seconds
    shoutInterval = setTimeout(() => {
      if (audioCtx.state === 'closed') return
      const shoutLen = 0.3 + Math.random() * 0.5
      const shoutBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * shoutLen, audioCtx.sampleRate)
      const shoutData = shoutBuf.getChannelData(0)
      for (let i = 0; i < shoutData.length; i++) {
        shoutData[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / shoutData.length)
      }
      const src = audioCtx.createBufferSource()
      src.buffer = shoutBuf
      const shoutFilter = audioCtx.createBiquadFilter()
      shoutFilter.type = 'bandpass'
      shoutFilter.frequency.value = 800 + Math.random() * 600
      shoutFilter.Q.value = 3
      const shoutGain = audioCtx.createGain()
      shoutGain.gain.value = 0.03 + Math.random() * 0.02
      src.connect(shoutFilter)
      shoutFilter.connect(shoutGain)
      shoutGain.connect(master)
      src.start()
      scheduleShout()
    }, delay)
  }
  scheduleShout()

  // Fade in
  master.gain.setValueAtTime(0, audioCtx.currentTime)
  master.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 3)

  return {
    master,
    stop: () => {
      clearTimeout(creakInterval)
      clearTimeout(shoutInterval)
      master.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2)
      setTimeout(() => {
        try { rumble.stop() } catch {}
        try { crackle.stop() } catch {}
        try { wind.stop() } catch {}
      }, 2500)
    },
  }
}

// ─── Ken Burns keyframes for two images ─────────────────────────────
const kenBurnsVariants = [
  {
    initial: { scale: 1.0, x: '0%', y: '0%' },
    animate: { scale: 1.15, x: '3%', y: '-2%' },
  },
  {
    initial: { scale: 1.1, x: '-2%', y: '1%' },
    animate: { scale: 1.0, x: '2%', y: '-1%' },
  },
]

// ─── Component ──────────────────────────────────────────────────────
export default function TimelessScene({ onClose, onTalkTo }) {
  const [phase, setPhase] = useState('intro') // intro | playing | conversation
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const [visibleLines, setVisibleLines] = useState(0)
  const [audioReady, setAudioReady] = useState(false)

  const audioRef = useRef(null)
  const audioCtxRef = useRef(null)
  const ambientRef = useRef(null)
  const lineTimerRef = useRef(null)
  const imageTimerRef = useRef(null)

  // Preload audio
  useEffect(() => {
    const audio = new Audio(SCENE.audioUrl)
    audio.preload = 'auto'
    audio.addEventListener('canplaythrough', () => setAudioReady(true), { once: true })
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Start experience
  const startExperience = useCallback(() => {
    setPhase('playing')
    setVisibleLines(0)
    setCurrentImageIdx(0)

    // Start ambient audio
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    audioCtxRef.current = ctx
    ambientRef.current = createFireAmbient(ctx)

    // Start narrator audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.volume = 0.85
      audioRef.current.play().catch(e => console.warn('Audio play failed:', e))
    }

    // Progressive text reveal — roughly timed to the monologue
    const lineDurations = SCENE.monologue.map(line => {
      // Estimate ~130 words per minute for the slow narration with pauses
      const words = line.split(' ').length
      return Math.max(3, (words / 2.2) + 1.5) // seconds per line
    })

    let lineIdx = 0
    let elapsed = 0
    function revealNext() {
      if (lineIdx >= SCENE.monologue.length) return
      lineTimerRef.current = setTimeout(() => {
        lineIdx++
        setVisibleLines(lineIdx)
        if (lineIdx < SCENE.monologue.length) {
          elapsed += lineDurations[lineIdx]
          revealNext()
        }
      }, lineDurations[lineIdx] * 1000)
    }
    // First line after 1.5s
    lineTimerRef.current = setTimeout(() => {
      setVisibleLines(1)
      lineIdx = 1
      revealNext()
    }, 1500)

    // Cycle images every 15 seconds
    imageTimerRef.current = setInterval(() => {
      setCurrentImageIdx(prev => (prev + 1) % SCENE.images.length)
    }, 15000)
  }, [])

  // Detect when narrator audio ends → transition to conversation
  useEffect(() => {
    if (phase !== 'playing' || !audioRef.current) return
    const audio = audioRef.current
    const onEnded = () => {
      // Show all remaining lines
      setVisibleLines(SCENE.monologue.length)
      // Fade ambient down slightly
      if (ambientRef.current) {
        ambientRef.current.master.gain.linearRampToValueAtTime(
          0.3,
          audioCtxRef.current.currentTime + 3
        )
      }
      // Transition to conversation after a beat
      setTimeout(() => setPhase('conversation'), 3000)
    }
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [phase])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(lineTimerRef.current)
      clearInterval(imageTimerRef.current)
      if (ambientRef.current) ambientRef.current.stop()
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close()
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const handleClose = () => {
    if (ambientRef.current) ambientRef.current.stop()
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      setTimeout(() => audioCtxRef.current.close(), 2500)
    }
    if (audioRef.current) audioRef.current.pause()
    clearTimeout(lineTimerRef.current)
    clearInterval(imageTimerRef.current)
    onClose()
  }

  const handleTalkTo = () => {
    // Stop narrator audio, keep ambient at low volume
    if (audioRef.current) audioRef.current.pause()
    if (ambientRef.current) {
      ambientRef.current.master.gain.linearRampToValueAtTime(
        0.15,
        audioCtxRef.current.currentTime + 1
      )
    }
    onTalkTo?.('mission-1906')
  }

  // ── INTRO SCREEN ──────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: '#0A0A0A' }}
      >
        {/* Background preview — dimmed */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={SCENE.images[0]}
            alt="1906 San Francisco"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.15) saturate(0.5) sepia(0.4)' }}
          />
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
            style={{ color: 'rgba(220,140,40,0.8)' }}
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
            {SCENE.subtitle}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-3xl mb-4 font-semibold"
            style={{ fontFamily: 'Playfair Display, serif', color: '#F5F5F5' }}
          >
            {SCENE.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            A 7.9 magnitude earthquake strikes at 5:12 AM. Fires rage across the city for three days. 80% of San Francisco is destroyed.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-xs leading-relaxed mb-8"
            style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}
          >
            Narrated by {SCENE.narrator.name}, {SCENE.narrator.role}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            onClick={startExperience}
            className="px-8 py-3.5 rounded-full text-sm font-medium tracking-wide"
            style={{
              background: audioReady
                ? 'linear-gradient(135deg, #C8860A, #a06d08)'
                : 'rgba(200,134,10,0.3)',
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50"
      style={{ background: '#0A0A0A' }}
    >
      {/* Ken Burns background — cycling images */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIdx}
            className="absolute"
            style={{ inset: '-12%' }}
            initial={{ opacity: 0, ...kenBurnsVariants[currentImageIdx].initial }}
            animate={{
              opacity: 1,
              ...kenBurnsVariants[currentImageIdx].animate,
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 2 },
              scale: { duration: 20, ease: 'linear' },
              x: { duration: 20, ease: 'linear' },
              y: { duration: 20, ease: 'linear' },
            }}
          >
            <img
              src={SCENE.images[currentImageIdx]}
              alt="1906 San Francisco"
              className="w-full h-full object-cover"
              style={{
                filter: 'brightness(0.35) saturate(0.6) sepia(0.35)',
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Firelight overlay — warm flicker */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.12, 0.22, 0.15, 0.20, 0.12],
        }}
        transition={{
          duration: 4,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        style={{
          background:
            'radial-gradient(ellipse at 30% 70%, rgba(220,100,20,0.35) 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 70% 30%, rgba(180,70,15,0.25) 0%, transparent 55%)',
        }}
      />

      {/* Smoke drift overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.05, 0.12, 0.07, 0.10],
          x: ['0%', '2%', '-1%', '1%'],
        }}
        transition={{
          duration: 12,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        style={{
          background:
            'linear-gradient(180deg, rgba(80,60,40,0.3) 0%, transparent 40%, transparent 70%, rgba(40,30,20,0.4) 100%)',
        }}
      />

      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-28 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}
      />

      {/* Bottom gradient — heavy for text legibility */}
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
          <span style={{ color: '#dc8c28', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {SCENE.location}
          </span>
          <span style={{ color: 'rgba(220,140,40,0.5)', fontSize: 10, fontFamily: 'monospace' }}>
            {SCENE.year}
          </span>
        </div>
      </div>

      {/* Narrator name — small, top center */}
      {phase === 'playing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute top-5 left-0 right-0 z-20 flex justify-center"
        >
          <span style={{
            color: 'rgba(220,140,40,0.6)',
            fontSize: 9,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            {SCENE.narrator.name}
          </span>
        </motion.div>
      )}

      {/* Progressive text — monologue lines appearing one by one */}
      {phase === 'playing' && (
        <div
          className="absolute bottom-8 left-0 right-0 z-20 px-6"
          style={{ maxHeight: '55%', overflow: 'hidden' }}
        >
          <div className="flex flex-col justify-end" style={{ minHeight: '100%' }}>
            {SCENE.monologue.slice(0, visibleLines).map((line, i) => {
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

      {/* CONVERSATION PHASE — after narration ends */}
      <AnimatePresence>
        {phase === 'conversation' && (
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
                style={{ color: 'rgba(220,140,40,0.7)' }}
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
                {SCENE.character.name}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs mb-6"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {SCENE.character.role}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-sm leading-relaxed mb-8"
                style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}
              >
                "{SCENE.character.opening}"
              </motion.p>

              <div className="flex flex-col gap-3">
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  onClick={handleTalkTo}
                  className="w-full px-6 py-3.5 rounded-full text-sm font-medium tracking-wide"
                  style={{ background: 'linear-gradient(135deg, #C8860A, #a06d08)', color: '#0A0A0A' }}
                >
                  Talk to {SCENE.character.name}
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  onClick={() => {
                    setPhase('playing')
                    setVisibleLines(0)
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0
                      audioRef.current.play().catch(() => {})
                    }
                    if (ambientRef.current) {
                      ambientRef.current.master.gain.linearRampToValueAtTime(
                        0.7,
                        audioCtxRef.current.currentTime + 2
                      )
                    }
                    // Restart text reveal
                    let lineIdx = 0
                    const lineDurations = SCENE.monologue.map(line => {
                      const words = line.split(' ').length
                      return Math.max(3, (words / 2.2) + 1.5)
                    })
                    function revealNext() {
                      if (lineIdx >= SCENE.monologue.length) return
                      lineTimerRef.current = setTimeout(() => {
                        lineIdx++
                        setVisibleLines(lineIdx)
                        if (lineIdx < SCENE.monologue.length) revealNext()
                      }, lineDurations[lineIdx] * 1000)
                    }
                    lineTimerRef.current = setTimeout(() => {
                      setVisibleLines(1)
                      lineIdx = 1
                      revealNext()
                    }, 1500)
                  }}
                  className="w-full px-6 py-3 rounded-full text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#F5F5F5',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  Listen Again
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
    </motion.div>
  )
}
