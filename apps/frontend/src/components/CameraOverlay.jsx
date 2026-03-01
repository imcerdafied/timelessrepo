import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import { useEraImage } from '../hooks/useEraImage'

export default function CameraOverlay({ onClose }) {
  const eras = useStore((s) => s.eras)
  const selectedEra = useStore((s) => s.selectedEra)
  const selectedLocation = useStore((s) => s.selectedLocation)
  const locations = useStore((s) => s.locations)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const containerRef = useRef(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [dividerX, setDividerX] = useState(0.5)
  const [dragging, setDragging] = useState(false)

  const era = eras.find((e) => e.id === selectedEra)
  const { url: imageUrl } = useEraImage(era)
  const locationName = locations.find((l) => l.id === selectedLocation)?.name

  // Start camera
  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch {
        if (!cancelled) setCameraError(true)
      }
    }

    startCamera()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  // Drag handlers for split divider
  const handleMove = useCallback(
    (clientX) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0.05, Math.min((clientX - rect.left) / rect.width, 0.95))
      setDividerX(x)
    },
    [],
  )

  const onPointerDown = useCallback(
    (e) => {
      setDragging(true)
      handleMove(e.clientX)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [handleMove],
  )

  const onPointerMove = useCallback(
    (e) => {
      if (dragging) handleMove(e.clientX)
    },
    [dragging, handleMove],
  )

  const onPointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Full-screen container for split view */}
      <div
        ref={containerRef}
        className="absolute inset-0 touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* LEFT side: era historical image (clipped to divider) */}
        {imageUrl && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${(1 - dividerX) * 100}% 0 0)` }}
          >
            <img
              src={imageUrl}
              alt={era?.label}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* RIGHT side: camera feed (clipped from divider) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${dividerX * 100}%)` }}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
            autoPlay
          />
        </div>

        {/* Camera error fallback */}
        {cameraError && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-surface"
            style={{ clipPath: `inset(0 0 0 ${dividerX * 100}%)` }}
          >
            <p className="font-ui text-sm text-present/40">Camera not available</p>
          </div>
        )}

        {/* Divider line + handle */}
        <div
          className="absolute inset-y-0 z-20"
          style={{ left: `${dividerX * 100}%`, transform: 'translateX(-50%)' }}
        >
          {/* Vertical line */}
          <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/60" />

          {/* Drag handle circle */}
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-black/50 backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 8H1M12 8h3M5 5L2 8l3 3M11 5l3 3-3 3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom left: era label */}
      <div
        className="absolute bottom-0 left-0 z-30 bg-gradient-to-t from-black/60 to-transparent pb-[calc(env(safe-area-inset-bottom,16px)+16px)] pl-5 pr-20 pt-12"
      >
        <span className="font-ui text-[10px] tracking-[0.2em] text-past/80 uppercase">
          {locationName}, {era?.year_display}
        </span>
      </div>

      {/* Bottom right: LIVE indicator */}
      <div
        className="absolute bottom-0 right-0 z-30 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] pr-5"
      >
        <span className="flex items-center gap-1.5 font-ui text-[10px] tracking-[0.2em] text-present/60 uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          Live
        </span>
      </div>

      {/* Close button - top right */}
      <div className="absolute right-4 top-[calc(env(safe-area-inset-top,16px)+8px)] z-30">
        <button
          onClick={onClose}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-present/20 bg-surface/60 text-present/70 backdrop-blur-md"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M11 3L3 11M3 3l8 8" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}
