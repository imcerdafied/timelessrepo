import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m away`
  return `${(meters / 1000).toFixed(1)}km away`
}

// Shared GPS state for use by other components
let gpsCoords = null
export function useGPS() {
  const [coords, setCoords] = useState(gpsCoords)

  useEffect(() => {
    if (gpsCoords) {
      setCoords(gpsCoords)
      return
    }
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        gpsCoords = c
        setCoords(c)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  return coords
}

export default function GPSTrigger({ onDismiss }) {
  const locations = useStore((s) => s.locations)
  const setSelectedLocation = useStore((s) => s.setSelectedLocation)
  const [nearest, setNearest] = useState(null)
  const [distance, setDistance] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const coords = useGPS()

  useEffect(() => {
    if (!coords || !locations.length) return

    let closestLoc = null
    let closestDist = Infinity

    for (const loc of locations) {
      if (!loc.coordinates) continue
      const d = haversine(coords.lat, coords.lng, loc.coordinates.lat, loc.coordinates.lng)
      if (d < closestDist) {
        closestDist = d
        closestLoc = loc
      }
    }

    if (closestLoc) {
      setNearest(closestLoc)
      setDistance(closestDist)
    }
  }, [coords, locations])

  const handleExplore = useCallback(() => {
    if (nearest) setSelectedLocation(nearest.id)
  }, [nearest, setSelectedLocation])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    onDismiss?.()
  }, [onDismiss])

  if (dismissed || !nearest) return null

  const isNearby = distance < 500

  return (
    <AnimatePresence>
      <motion.div
        className="mx-5 mb-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={`rounded-sm border p-4 ${
            isNearby
              ? 'border-past/40 bg-past/10'
              : 'border-border bg-surface'
          }`}
        >
          {isNearby ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-ui text-[10px] tracking-[0.2em] text-past uppercase">
                  You are here
                </span>
              </div>
              <h3 className="mt-1 font-heading text-lg font-semibold text-present">
                {nearest.name}
              </h3>
              <p className="mt-1 font-ui text-xs text-present/40">
                {nearest.subtext}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleExplore}
                  className="cursor-pointer rounded-sm border border-past/40 bg-past/15 px-4 py-2 font-ui text-xs font-medium tracking-[0.15em] text-past uppercase transition-colors hover:bg-past/25"
                >
                  Explore This Place
                </button>
                <button
                  onClick={handleDismiss}
                  className="cursor-pointer rounded-sm border border-border px-3 py-2 font-ui text-xs text-present/40 transition-colors hover:text-present/60"
                >
                  Browse All
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="font-ui text-[10px] tracking-[0.2em] text-present/40 uppercase">
                  Nearest location
                </span>
                <span className="font-mono text-[10px] text-present/30">
                  {formatDistance(distance)}
                </span>
              </div>
              <h3 className="mt-1 font-heading text-base font-semibold text-present">
                {nearest.name}
              </h3>
              <p className="mt-1 font-ui text-xs text-present/40">
                {nearest.subtext}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleExplore}
                  className="cursor-pointer rounded-sm border border-border bg-surface px-4 py-2 font-ui text-xs font-medium tracking-[0.15em] text-present/60 uppercase transition-colors hover:text-present/80"
                >
                  Go There
                </button>
                <button
                  onClick={handleDismiss}
                  className="cursor-pointer rounded-sm border border-border px-3 py-2 font-ui text-xs text-present/40 transition-colors hover:text-present/60"
                >
                  Browse All
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
