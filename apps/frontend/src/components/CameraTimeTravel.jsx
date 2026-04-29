import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import posthog from 'posthog-js'
import useStore from '../store/useStore'
import { ACTIVE_PROPERTY } from '../config/properties'
import { getCuratedImage } from '../data/imageMap'

const API_BASE = import.meta.env.VITE_API_URL || ''

const eraColor = {
  past: '#C8860A',
  present: '#1A1A1A',
  future: '#1E4D8C',
  cultural: '#2D8F4E',
  operational: '#4A90A4',
}

// Web Audio "time whoosh", short pitch-shifted sweep
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

function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawCover(ctx, img, x, y, width, height) {
  const scale = Math.max(width / img.width, height / img.height)
  const sw = width / scale
  const sh = height / scale
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height)
}

function createDemoSelfieDataUrl(accent = '#D4845A') {
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 1200
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, accent)
  gradient.addColorStop(1, '#0B3D5C')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.beginPath()
  ctx.arc(450, 430, 150, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(450, 780, 250, 310, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(0, 1010, canvas.width, 190)
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.font = '700 56px Inter, Arial, sans-serif'
  ctx.fillText('Demo Guest', 450, 1105)
  return canvas.toDataURL('image/png', 0.9)
}

async function createSelfieKeepsake({ sceneImage, selfieImage, era, zoneName, accent, periodStyling }) {
  const [scene, selfie] = await Promise.all([
    loadCanvasImage(sceneImage),
    loadCanvasImage(selfieImage),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')

  drawCover(ctx, scene, 0, 0, canvas.width, canvas.height)

  const gradient = ctx.createLinearGradient(0, 720, 0, canvas.height)
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(0.65, 'rgba(0,0,0,0.55)')
  gradient.addColorStop(1, 'rgba(0,0,0,0.9)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(540, 1120, 260, 340, 0, 0, Math.PI * 2)
  ctx.clip()
  ctx.filter = periodStyling ? 'sepia(0.45) saturate(0.85) contrast(1.08)' : 'none'
  drawCover(ctx, selfie, 280, 780, 520, 680)
  ctx.restore()

  ctx.beginPath()
  ctx.ellipse(540, 1120, 270, 350, 0, 0, Math.PI * 2)
  ctx.lineWidth = 10
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'
  ctx.stroke()

  ctx.fillStyle = accent || '#D4845A'
  ctx.fillRect(120, 1510, 840, 3)

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.font = '700 58px Georgia, serif'
  ctx.fillText('I stepped into', 540, 1600)
  ctx.font = '700 68px Georgia, serif'
  ctx.fillText(era?.label || 'another time', 540, 1680)
  ctx.font = '28px Inter, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.fillText(`${zoneName || 'Atlantis'} · ${era?.year_display || ''}`, 540, 1740)
  ctx.font = '24px Inter, Arial, sans-serif'
  ctx.fillText('Powered by TimeLens', 540, 1810)
  ctx.font = '22px Inter, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  const path = `/demo/${ACTIVE_PROPERTY.slug}/layer/${era?.id || ''}`
  ctx.fillText(path, 540, 1855)

  return canvas.toDataURL('image/png', 0.92)
}

/**
 * CameraTimeTravel, sequential pipeline:
 * 1. camera, rear camera viewfinder, capture button
 * 2. scrub, frozen frame + temporal ribbon, pick an era
 * 3. transform, AI generates the scene in that era (or fallback to era image)
 * 4. selfie, optionally add yourself with front camera
 * 5. result, final image with save/share
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
  const awardStamp = useStore((s) => s.awardStamp)

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
        setCameraError(false)
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

  const handleUseDemoFrame = useCallback(() => {
    const fallbackUrl = getCuratedImage(era?.id) || getCuratedImage(selectedEra)
    if (!fallbackUrl) return
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCapturedImage(fallbackUrl)
    setPhase('scrub')
    posthog.capture('timelens_demo_frame_used', { zone_id: selectedLocation, era_id: era?.id })
  }, [era?.id, selectedEra, selectedLocation])

  // Phase: SCRUB, user picks an era → TRANSFORM
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
    awardStamp({
      id: `share:timelens:${era?.id}`,
      type: 'share',
      label: `Created TimeLens keepsake`,
      detail: era?.label,
    })

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
      try {
        const fallback = await createSelfieKeepsake({
          sceneImage: generatedImage || getCuratedImage(era?.id),
          selfieImage: selfieBase64,
          era,
          zoneName,
          accent,
          periodStyling,
        })
        setCompositeImage(fallback)
        setError('Created a shareable keepsake. Full scene blending needs image generation keys.')
      } catch {
        setError(err.message || 'Selfie compositing failed. Showing the time-traveled scene instead.')
      }
      setPhase('result')
    }
  }, [captureFrame, era, zoneName, selectedLocation, periodStyling, generatedImage, accent, awardStamp])

  const handleDemoSelfie = useCallback(async () => {
    setPhase('compositing')
    const demoSelfie = createDemoSelfieDataUrl(accent)
    try {
      const fallback = await createSelfieKeepsake({
        sceneImage: generatedImage || getCuratedImage(era?.id),
        selfieImage: demoSelfie,
        era,
        zoneName,
        accent,
        periodStyling,
      })
      setCompositeImage(fallback)
      setError('Created a demo keepsake without camera access.')
      awardStamp({
        id: `share:timelens:${era?.id}`,
        type: 'share',
        label: `Created TimeLens keepsake`,
        detail: era?.label,
      })
    } catch {
      setError('Demo keepsake could not be created.')
    }
    setPhase('result')
  }, [accent, generatedImage, era, zoneName, periodStyling, awardStamp])

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
      await navigator.share({ files: [file], title: `${zoneName}, ${era?.label}` })
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
      {/* Close button, always visible */}
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
          {phase === 'selfie' && 'Step into the era'}
          {phase === 'compositing' && `Placing you in ${era?.label}...`}
          {phase === 'result' && `${zoneName}, ${era?.label}`}
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
                  <p className="text-white/50 text-xs mb-4">Use a demo frame now, then test live camera after production deployment.</p>
                  <div className="flex flex-col gap-2">
                    <button onClick={handleUseDemoFrame} className="rounded-full bg-white px-6 py-2 text-xs font-medium text-black">Use Demo Frame</button>
                    <button onClick={onClose} className="rounded-full border border-white/20 px-6 py-2 text-xs text-white">Go Back</button>
                  </div>
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

        {/* ── SCRUB PHASE, frozen frame + temporal ribbon ──────── */}
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
              {cameraError ? (
                <div className="flex h-full items-center justify-center px-8 text-center">
                  <div>
                    <p className="text-white text-sm mb-2">Selfie camera unavailable</p>
                    <p className="text-white/50 text-xs mb-4">Create a demo keepsake now, or retry with camera access later.</p>
                    <button onClick={handleDemoSelfie} className="rounded-full bg-white px-6 py-2 text-xs font-medium text-black">Create Demo Keepsake</button>
                  </div>
                </div>
              ) : (
                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted style={{ transform: 'scaleX(-1)' }} />
              )}
              <div className="absolute top-16 left-4 right-4 rounded-2xl bg-black/45 px-4 py-3 text-center backdrop-blur-sm">
                <p className="text-white text-sm font-medium">Place yourself in {era?.label}</p>
                <p className="mt-1 text-white/55 text-xs">Frame your face clearly, then TimeLens will make a shareable keepsake.</p>
              </div>
              {cameraReady && (
                <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
                  {/* Period styling toggle */}
                  <button
                    onClick={() => setPeriodStyling(!periodStyling)}
                    className={`rounded-full px-4 py-1.5 text-xs border ${periodStyling ? 'border-accent text-accent bg-accent/10' : 'border-white/20 text-white/50'}`}
                  >
                    {periodStyling ? 'Era styling: ON' : 'Era styling: OFF'}
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
                <p className="text-white text-lg font-heading font-semibold">{zoneName}, {era?.label}</p>
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
                  Step Into This Era
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
