import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import posthog from 'posthog-js'
import useStore from '../store/useStore'

const API_BASE = import.meta.env.VITE_API_URL || ''

/**
 * CameraTimeTravel — camera capture + AI image generation
 *
 * Props:
 *   mode       — 'time-travel' (rear camera) or 'selfie' (front camera)
 *   era        — current era object
 *   zoneName   — display name of the zone
 *   onClose    — close callback
 */
export default function CameraTimeTravel({ mode = 'time-travel', era, zoneName, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [phase, setPhase] = useState('camera') // camera → processing → result
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)

  const facingMode = mode === 'selfie' ? 'user' : 'environment'
  const selectedLocation = useStore((s) => s.selectedLocation)

  // Start camera
  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch {
        setCameraError(true)
      }
    }

    if (phase === 'camera') startCamera()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [phase, facingMode])

  // Capture frame from video
  const captureFrame = useCallback(() => {
    const video = videoRef.current
    if (!video) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  }, [])

  // Handle capture
  const handleCapture = useCallback(async () => {
    const base64 = captureFrame()
    if (!base64) return

    // Stop camera
    streamRef.current?.getTracks().forEach(t => t.stop())
    setPhase('processing')
    setError(null)

    posthog.capture(mode === 'selfie' ? 'selfie_captured' : 'time_travel_captured', {
      zone_id: selectedLocation,
      layer_id: era?.id,
    })

    try {
      const endpoint = mode === 'selfie' ? '/api/camera/selfie' : '/api/camera/time-travel'
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
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
      if (!response.ok) throw new Error(data.error || 'Generation failed')

      setGeneratedImage(data.generated_image)
      setPhase('result')

      posthog.capture(mode === 'selfie' ? 'selfie_generated' : 'time_travel_generated', {
        zone_id: selectedLocation,
        layer_id: era?.id,
      })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setPhase('camera')
      // Restart camera on error
    }
  }, [captureFrame, mode, era, zoneName, selectedLocation])

  // Save image
  const handleSave = useCallback(() => {
    if (!generatedImage) return
    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `timeless-${mode}-${era?.id || 'photo'}.png`
    link.click()
  }, [generatedImage, mode, era])

  // Share image
  const handleShare = useCallback(async () => {
    if (!generatedImage || !navigator.share) {
      handleSave()
      return
    }
    try {
      const res = await fetch(generatedImage)
      const blob = await res.blob()
      const file = new File([blob], `timeless-${mode}.png`, { type: 'image/png' })
      await navigator.share({
        files: [file],
        title: `${zoneName} — ${era?.label}`,
        text: `Time travel to ${era?.label} at ${zoneName}`,
      })
    } catch {
      handleSave()
    }
  }, [generatedImage, mode, zoneName, era, handleSave])

  const accentColor = era?.era_type === 'past' ? '#C8860A'
    : era?.era_type === 'future' ? '#1E4D8C'
    : era?.era_type === 'cultural' ? '#2D8F4E'
    : era?.era_type === 'operational' ? '#4A90A4'
    : '#D4845A'

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black mobile-frame"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 5l10 10M15 5L5 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Era label */}
      <div className="absolute top-4 left-4 z-50">
        <span className="rounded-full px-3 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm">
          {mode === 'selfie' ? 'Era Selfie' : 'Time Travel'} — {era?.label}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* CAMERA PHASE */}
        {phase === 'camera' && (
          <motion.div
            key="camera"
            className="flex h-full flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {cameraError ? (
              <div className="flex flex-1 items-center justify-center px-8 text-center">
                <div>
                  <p className="text-white text-sm mb-2">Camera access required</p>
                  <p className="text-white/50 text-xs">Please allow camera permissions and try again.</p>
                  <button
                    onClick={onClose}
                    className="mt-4 rounded-full border border-white/20 px-6 py-2 text-xs text-white"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  playsInline
                  muted
                  style={{ transform: mode === 'selfie' ? 'scaleX(-1)' : 'none' }}
                />

                {/* Error message */}
                {error && (
                  <div className="absolute top-16 left-4 right-4 z-50 rounded-lg bg-red-500/90 px-4 py-2 text-center text-xs text-white">
                    {error}
                  </div>
                )}

                {/* Capture button */}
                {cameraReady && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                    <button
                      onClick={handleCapture}
                      className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white"
                    >
                      <div className="h-16 w-16 rounded-full" style={{ backgroundColor: accentColor }} />
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* PROCESSING PHASE */}
        {phase === 'processing' && (
          <motion.div
            key="processing"
            className="flex h-full flex-col items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Spinner */}
            <motion.div
              className="mb-6 h-12 w-12 rounded-full border-2 border-white/20"
              style={{ borderTopColor: accentColor }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-white text-sm font-medium">
              {mode === 'selfie'
                ? `Placing you in ${era?.label}...`
                : `Traveling to ${era?.label}...`
              }
            </p>
            <p className="mt-2 text-white/40 text-xs">
              This may take 10-20 seconds
            </p>
          </motion.div>
        )}

        {/* RESULT PHASE */}
        {phase === 'result' && generatedImage && (
          <motion.div
            key="result"
            className="flex h-full flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Generated image */}
            <div className="flex-1 relative overflow-hidden">
              <motion.img
                src={generatedImage}
                alt={`${era?.label} at ${zoneName}`}
                className="h-full w-full object-cover"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 8, ease: 'linear' }}
              />
              {/* Gradient overlay bottom */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Caption */}
              <div className="absolute bottom-24 left-4 right-4">
                <p className="text-white/50 text-[10px] tracking-widest uppercase mb-1">
                  {mode === 'selfie' ? 'You in' : 'AI-generated time travel'}
                </p>
                <p className="text-white text-lg font-heading font-semibold">
                  {zoneName} — {era?.label}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {era?.year_display}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="bg-black px-4 py-4 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 rounded-full py-3 text-xs font-medium text-white border border-white/20"
              >
                Save
              </button>
              <button
                onClick={handleShare}
                className="flex-1 rounded-full py-3 text-xs font-medium text-black"
                style={{ backgroundColor: accentColor }}
              >
                Share
              </button>
              <button
                onClick={() => {
                  setGeneratedImage(null)
                  setPhase('camera')
                }}
                className="rounded-full px-4 py-3 text-xs text-white/50 border border-white/10"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
