import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import { useEraImage } from '../hooks/useEraImage'
import { useGyroscope } from '../hooks/useGyroscope'

const eraColor = {
  past: '#C8860A',
  present: '#F5F5F5',
  future: '#1E4D8C',
}

export default function CameraOverlay({ onClose }) {
  const eras = useStore((s) => s.eras)
  const selectedEra = useStore((s) => s.selectedEra)
  const setSelectedEra = useStore((s) => s.setSelectedEra)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const sliderRef = useRef(null)
  const [opacity, setOpacity] = useState(0.5)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [dragging, setDragging] = useState(false)

  const era = eras.find((e) => e.id === selectedEra)
  const { url: imageUrl } = useEraImage(era)
  const { tilt } = useGyroscope()

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

  const handleSliderMove = useCallback(
    (clientX) => {
      if (!sliderRef.current) return
      const rect = sliderRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      setOpacity(x / rect.width)
    },
    [],
  )

  const onPointerDown = useCallback(
    (e) => {
      setDragging(true)
      handleSliderMove(e.clientX)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [handleSliderMove],
  )

  const onPointerMove = useCallback(
    (e) => {
      if (dragging) handleSliderMove(e.clientX)
    },
    [dragging, handleSliderMove],
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
      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Historical overlay image with gyroscope parallax */}
      {imageUrl && (
        <div
          className="absolute overflow-hidden"
          style={{ inset: '-8%', opacity }}
        >
          <img
            src={imageUrl}
            alt={era?.label}
            className="h-full w-full object-cover"
            style={{
              transform: `translate(${tilt.x * 0.4}px, ${tilt.y * 0.4}px)`,
              transition: 'transform 0.1s ease-out',
              willChange: 'transform',
            }}
          />
        </div>
      )}

      {/* Camera error fallback */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <p className="font-ui text-sm text-present/40">Camera not available</p>
        </div>
      )}

      {/* Top bar: era info + close */}
      <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 to-transparent px-5 pb-12 pt-[calc(env(safe-area-inset-top,16px)+8px)]">
        <div className="flex items-start justify-between">
          <div>
            {era && (
              <>
                <span className="font-ui text-[10px] tracking-[0.2em] text-present/50 uppercase">
                  {era.year_display}
                </span>
                <h2 className="mt-0.5 font-heading text-lg font-semibold text-present">
                  {era.headline}
                </h2>
                <span
                  className="mt-1 inline-block rounded-sm px-2 py-0.5 font-ui text-[10px] tracking-wider uppercase"
                  style={{
                    color: eraColor[era.era_type],
                    backgroundColor: `${eraColor[era.era_type]}18`,
                    border: `1px solid ${eraColor[era.era_type]}30`,
                  }}
                >
                  {era.label}
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-present/20 bg-surface/60 text-present/70 backdrop-blur-md"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M11 3L3 11M3 3l8 8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Era selector pills */}
      <div className="absolute inset-x-0 top-[calc(env(safe-area-inset-top,16px)+100px)] z-10 overflow-x-auto px-5">
        <div className="flex gap-2">
          {eras.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedEra(e.id)}
              className={`cursor-pointer whitespace-nowrap rounded-sm border px-2.5 py-1 font-mono text-[10px] transition-colors ${
                e.id === selectedEra
                  ? 'border-past/40 bg-past/20 text-past'
                  : 'border-present/10 bg-black/40 text-present/40 backdrop-blur-sm'
              }`}
            >
              {e.year_display}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom controls: slider */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-5 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] pt-12">
        <div className="mb-2 flex justify-between font-ui text-[10px] tracking-[0.15em] text-present/40 uppercase">
          <span>Live</span>
          <span>Then</span>
        </div>
        <div
          ref={sliderRef}
          className="relative h-10 cursor-pointer touch-none rounded-sm border border-border bg-surface/30"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* Fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-sm bg-past/20"
            style={{ width: `${opacity * 100}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-past shadow-lg"
            style={{ left: `calc(${opacity * 100}% - 2px)` }}
          />
        </div>
      </div>
    </motion.div>
  )
}
