import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import posthog from 'posthog-js'
import useStore from '../store/useStore'
import { useEraImage } from '../hooks/useEraImage'
import { getCuratedImage } from '../data/imageMap'

const API_BASE = import.meta.env.VITE_API_URL || ''

const eraColor = {
  past: '#C8860A',
  present: '#1A1A1A',
  future: '#1E4D8C',
  cultural: '#2D8F4E',
  operational: '#4A90A4',
}

// Web Audio "time whoosh" — short pitch-shifted sweep
function playWhoosh() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch {}
}

/**
 * CameraTimeTravel — sequential pipeline:
 * 1. camera    — rear camera viewfinder, capture button
 * 2. scrub     — frozen frame + temporal ribbon, pick an era
 * 3. transform — AI generates the scene in that era (or fallback to era image)
 * 4. selfie    — optionally add yourself with front camera
 * 5. result    — final image with save/share
 */
export default function CameraTimeTravel({ eras, initialEra, zoneName, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [phase, setPhase] = useState('camera')
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [selectedEra, setSelectedEra] = useState(initialEra?.id || null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [compositeImage, setCompositeImage] = useState(null)
  const [error, setError] = useState(null)
  const [periodStyling, setPeriodStyling] = useState(false)

  const selectedLocation = useStore((s) => s.selectedLocation)

  useEffect(() => {
    posthog.capture('timelens_opened', { zone_id: selectedLocation })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const era = eras?.find(e => e.id === selectedEra) || initialEra
  const accent = eraColor[era?.era_type] || '#D4845A'

  // Ribbon scroll ref
  const ribbonRef = useRef(null)
  const nodeRefs = useRef({})

  // Start/stop camera based on phase
  useEffect(() => {
    if (phase !== 'camera' && phase !== 'selfie') return
    let cancelled = false
    const facingMode = phase === 'selfie' ? 'user' : 'environment'

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch { setCameraError(true) }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      setCameraReady(false)
    }
  }, [phase])

  // Scroll ribbon to selected era
  useEffect(() => {
    if (phase === 'scrub' && nodeRefs.current[selectedEra]) {
      nodeRefs.current[selectedEra].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [selectedEra, phase])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    if (!video) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  }, [])

  // Phase: CAMERA → capture → SCRUB
  const handleCapture = useCallback(() => {
    const base64 = captureFrame()
    if (!base64) return
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCapturedImage(base64)
    setPhase('scrub')
    posthog.capture('timelens_captured', { zone_id: selectedLocation })
  }, [captureFrame, selectedLocation])

  // Phase: SCRUB — user picks an era → TRANSFORM
  const handleEraSelect = useCallback((eraId) => {
    if (eraId !== selectedEra) {
      playWhoosh()
      posthog.capture('timelens_era_selected', {
        zone_id: selectedLocation,
        from_era: selectedEra,
        to_era: eraId,
      })
    }
    setSelectedEra(eraId)
  }, [selectedEra, selectedLocation])

  const handleTransform = useCallback(async () => {
    setPhase('transforming')
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/camera/time-travel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: capturedImage,
          zone_id: selectedLocation,
          zone_name: zoneName,
          era_id: era?.id,
          era_label: era?.label,
          era_year: era?.year_display,
          era_description: era?.description,
          era_landscape: era?.landscape,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Transform failed')
      setGeneratedImage(data.generated_image)
      setPhase('result')
      posthog.capture('timelens_transform_viewed', { zone_id: selectedLocation, era_id: era?.id })
    } catch (err) {
      // Fallback: use the pre-existing era image with crossfade
      const fallbackUrl = getCuratedImage(era?.id)
      if (fallbackUrl) {
        setGeneratedImage(fallbackUrl)
        setPhase('result')
        posthog.capture('timelens_transform_viewed', { zone_id: selectedLocation, era_id: era?.id, generation_method: 'fallback' })
      } else {
        setError(err.message || 'Generation failed. Please try again.')
        setPhase('scrub')
      }
    }
  }, [capturedImage, era, zoneName, selectedLocation])

  // Phase: SELFIE capture → composite
  const handleSelfieCapture = useCallback(async () => {
    const selfieBase64 = captureFrame()
    if (!selfieBase64) return
    streamRef.current?.getTracks().forEach(t => t.stop())
    setPhase('compositing')

    posthog.capture('timelens_selfie_added', { zone_id: selectedLocation, era_id: era?.id, period_styling: periodStyling })

    try {
      const response = await fetch(`${API_BASE}/api/camera/selfie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selfieBase64,
          zone_id: selectedLocation,
          zone_name: zoneName,
          era_id: era?.id,
          era_label: era?.label,
          era_year: era?.year_display,
          era_description: era?.description,
          era_landscape: era?.landscape,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Composite failed')
      setCompositeImage(data.generated_image)
      setPhase('result')
    } catch (err) {
      setError(err.message)
      setPhase('result') // show the transformed image without selfie
    }
  }, [captureFrame, era, zoneName, selectedLocation, periodStyling])

  // Save/Share
  const finalImage = compositeImage || generatedImage
  const handleSave = useCallback(() => {
    if (!finalImage) return
    const link = document.createElement('a')
    link.href = finalImage
    link.download = `timeless-${era?.id || 'photo'}.png`
    link.click()
  }, [finalImage, era])

  const handleShare = useCallback(async () => {
    if (!finalImage || !navigator.share) { handleSave(); return }
    try {
      const res = await fetch(finalImage)
      const blob = await res.blob()
      const file = new File([blob], `timeless-${era?.id}.png`, { type: 'image/png' })
      await navigator.share({ files: [file], title: `${zoneName} — ${era?.label}` })
      posthog.capture('timelens_shared', {
        zone_id: selectedLocation,
        era_id: era?.id,
        had_selfie: !!compositeImage,
        share_target: 'native',
      })
    } catch { handleSave() }
  }, [finalImage, era, zoneName, selectedLocation, compositeImage, handleSave])

  // ── RENDER ─────────────────────────────────────────────────────

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black mobile-frame flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close button — always visible */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 5l10 10M15 5L5 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Phase label */}
      <div className="absolute top-4 left-4 z-50">
        <span className="rounded-full px-3 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm">
          {phase === 'camera' && 'Frame your scene'}
          {phase === 'scrub' && 'Choose an era'}
          {phase === 'transforming' && `Traveling to ${era?.label}...`}
          {phase === 'selfie' && 'Take a selfie'}
          {phase === 'compositing' && `Placing you in ${era?.label}...`}
          {phase === 'result' && `${zoneName} — ${era?.label}`}
        </span>
      </div>

      <AnimatePresence mode="wait">

        {/* ── CAMERA PHASE ──────────────────────────────────────── */}
        {phase === 'camera' && (
          <motion.div key="camera" className="flex-1 relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {cameraError ? (
              <div className="flex h-full items-center justify-center px-8 text-center">
                <div>
                  <p className="text-white text-sm mb-2">Camera access required</p>
                  <p className="text-white/50 text-xs mb-4">Please allow camera permissions and try again.</p>
                  <button onClick={onClose} className="rounded-full border border-white/20 px-6 py-2 text-xs text-white">Go Back</button>
                </div>
              </div>
            ) : (
              <>
                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                {cameraReady && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                    <button onClick={handleCapture} className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white">
                      <div className="h-16 w-16 rounded-full bg-white" />
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ── SCRUB PHASE — frozen frame + temporal ribbon ──────── */}
        {phase === 'scrub' && (
          <motion.div key="scrub" className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Captured image with era-image crossfade overlay */}
            <div className="flex-1 relative overflow-hidden">
              {/* Base: captured photo */}
              <img src={capturedImage} alt="Captured" className="h-full w-full object-cover" />

              {/* Overlay: era image preview (crossfade) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedEra}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                >
                  {getCuratedImage(selectedEra) && (
                    <img
                      src={getCuratedImage(selectedEra)}
                      alt={era?.label}
                      className="h-full w-full object-cover"
                      style={{ filter: era?.era_type === 'past' ? 'sepia(0.3) brightness(0.9)' : era?.era_type === 'future' ? 'hue-rotate(10deg) brightness(0.85)' : 'none' }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Film grain flash overlay on era change */}
              <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC43IiBudW1PY3RhdmVzPSIzIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-30 mix-blend-overlay" />

              {/* Era info overlay */}
              <div className="absolute bottom-20 left-4 right-4 z-10">
                <p className="text-white/60 text-[10px] tracking-widest uppercase mb-1">{era?.year_display}</p>
                <h2 className="text-white text-xl font-heading font-semibold">{era?.headline}</h2>
              </div>
            </div>

            {/* Temporal ribbon */}
            <div className="bg-black/90 backdrop-blur-sm">
              <div
                ref={ribbonRef}
                className="flex items-center gap-6 overflow-x-auto px-[calc(50%-22px)] py-4"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {eras?.map((e) => {
                  const isSelected = e.id === selectedEra
                  const color = eraColor[e.era_type] || '#D4845A'
                  return (
                    <button
                      key={e.id}
                      ref={el => { nodeRefs.current[e.id] = el }}
                      onClick={() => handleEraSelect(e.id)}
                      className="flex shrink-0 flex-col items-center bg-transparent border-none p-0"
                    >
                      <motion.div
                        className="rounded-full"
                        animate={{
                          width: isSelected ? 20 : 10,
                          height: isSelected ? 20 : 10,
                          backgroundColor: isSelected ? color : `${color}66`,
                          boxShadow: isSelected ? `0 0 12px ${color}88` : 'none',
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                      <span
                        className="mt-1.5 text-[10px] font-mono whitespace-nowrap"
                        style={{ color: isSelected ? color : '#666' }}
                      >
                        {e.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Transform button */}
              <div className="px-4 pb-4">
                <button
                  onClick={handleTransform}
                  className="w-full rounded-full py-3 text-sm font-medium text-white"
                  style={{ backgroundColor: accent }}
                >
                  Travel to {era?.label}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TRANSFORMING / COMPOSITING PHASE ─────────────────── */}
        {(phase === 'transforming' || phase === 'compositing') && (
          <motion.div key="processing" className="flex-1 flex flex-col items-center justify-center px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="mb-6 h-12 w-12 rounded-full border-2 border-white/20"
              style={{ borderTopColor: accent }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-white text-sm font-medium">
              {phase === 'compositing' ? `Placing you in ${era?.label}...` : `Traveling to ${era?.label}...`}
            </p>
            <p className="mt-2 text-white/40 text-xs">This may take 10-20 seconds</p>
          </motion.div>
        )}

        {/* ── SELFIE PHASE ─────────────────────────────────────── */}
        {phase === 'selfie' && (
          <motion.div key="selfie" className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex-1 relative">
              <video ref={videoRef} className="h-full w-full object-cover" playsInline muted style={{ transform: 'scaleX(-1)' }} />
              {cameraReady && (
                <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
                  {/* Period styling toggle */}
                  <button
                    onClick={() => setPeriodStyling(!periodStyling)}
                    className={`rounded-full px-4 py-1.5 text-xs border ${periodStyling ? 'border-accent text-accent bg-accent/10' : 'border-white/20 text-white/50'}`}
                  >
                    {periodStyling ? 'Period styling: ON' : 'Period styling: OFF'}
                  </button>
                  <button onClick={handleSelfieCapture} className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white">
                    <div className="h-16 w-16 rounded-full" style={{ backgroundColor: accent }} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── RESULT PHASE ─────────────────────────────────────── */}
        {phase === 'result' && finalImage && (
          <motion.div key="result" className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex-1 relative overflow-hidden">
              {/* Crossfade from captured image to generated */}
              {capturedImage && (
                <motion.img
                  src={capturedImage}
                  alt="Original"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 2, delay: 0.3 }}
                />
              )}
              <motion.img
                src={finalImage}
                alt={`${era?.label} at ${zoneName}`}
                className="h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ opacity: { duration: 2, delay: 0.3 }, scale: { duration: 8, ease: 'linear' } }}
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-24 left-4 right-4">
                <p className="text-white/50 text-[10px] tracking-widest uppercase mb-1">AI-generated time travel</p>
                <p className="text-white text-lg font-heading font-semibold">{zoneName} — {era?.label}</p>
                <p className="text-white/60 text-xs mt-1">{era?.year_display}</p>
              </div>

              {/* Error banner */}
              {error && (
                <div className="absolute top-16 left-4 right-4 rounded-lg bg-red-500/90 px-4 py-2 text-center text-xs text-white">{error}</div>
              )}
            </div>

            {/* Action buttons */}
            <div className="bg-black px-4 py-4 flex gap-3">
              {!compositeImage && (
                <button
                  onClick={() => setPhase('selfie')}
                  className="flex-1 rounded-full py-3 text-xs font-medium text-white border border-white/20"
                >
                  Put Yourself In
                </button>
              )}
              <button onClick={handleSave} className="flex-1 rounded-full py-3 text-xs font-medium text-white border border-white/20">
                Save
              </button>
              <button onClick={handleShare} className="flex-1 rounded-full py-3 text-xs font-medium text-black" style={{ backgroundColor: accent }}>
                Share
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}
