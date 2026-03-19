import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import posthog from 'posthog-js'

const API_BASE = import.meta.env.VITE_API_URL || ''

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getTodayMMDD() {
  const now = new Date()
  return String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0')
}

function getTodayLabel() {
  const now = new Date()
  return `${monthNames[now.getMonth()]} ${now.getDate()}`
}

/**
 * OnThisDayScreen — replaces the splash screen with a daily "On This Day" experience.
 *
 * Shows 2-3 historical events that happened on today's date, each mapped to an
 * existing location in the app. The user taps an event card to jump directly there.
 *
 * Props:
 *   onEventTap(locationId, eraId) — navigate to the location/era
 *   onSkip() — dismiss and show the normal location browser
 */
export default function OnThisDayScreen({ onEventTap, onSkip }) {
  const [events, setEvents] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    posthog.capture('session_started')

    const mmdd = getTodayMMDD()
    const cacheKey = `onThisDay_${mmdd}`

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.events?.length) {
          setEvents(parsed.events)
          setLoading(false)
          posthog.capture('on_this_day_loaded', { event_count: parsed.events.length, cache_hit: true })
          return
        }
      }
    } catch {}

    // Fetch from backend
    fetch(`${API_BASE}/api/on-this-day/${mmdd}`)
      .then(r => r.json())
      .then(data => {
        if (data.events?.length) {
          setEvents(data.events)
          posthog.capture('on_this_day_loaded', { event_count: data.events.length, cache_hit: !!data.cached })
          // Cache in localStorage
          try { localStorage.setItem(cacheKey, JSON.stringify({ events: data.events })) } catch {}
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Share an event to clipboard / native share
  function handleShare(event) {
    const text = event.shareText || `${event.headline} (${event.year})`
    const url = `${window.location.origin}?otd=${event.eraId}`
    const shareData = { text, url }

    posthog.capture('on_this_day_shared', { era_id: event.eraId, city: event.city })

    if (navigator.share) {
      navigator.share(shareData).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).catch(() => {})
    }
  }

  function handleEventTap(event) {
    posthog.capture('on_this_day_event_tapped', {
      era_id: event.eraId,
      location_id: event.locationId,
      city: event.city,
      year: event.year,
    })
    onEventTap(event.locationId, event.eraId)
  }

  // ── LOADING STATE ──────────────────────────────────────────────────
  if (loading) {
    return (
      <motion.div
        className="flex h-full flex-col items-center justify-center text-center bg-background"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="font-heading text-3xl font-bold tracking-[0.14em] text-present uppercase"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Timeless Moment
        </motion.h1>
        <motion.p
          className="mt-3 font-ui text-sm tracking-widest text-past"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          A place in time.
        </motion.p>
      </motion.div>
    )
  }

  // ── ERROR / FALLBACK → just show splash briefly then skip ──────────
  if (error || !events?.length) {
    // Auto-skip after a brief moment
    setTimeout(() => onSkip(), 800)
    return (
      <motion.div
        className="flex h-full flex-col items-center justify-center text-center bg-background"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-3xl font-bold tracking-[0.14em] text-present uppercase">
          Timeless Moment
        </h1>
        <p className="mt-3 font-ui text-sm tracking-widest text-past">
          A place in time.
        </p>
      </motion.div>
    )
  }

  // ── ON THIS DAY CARDS ──────────────────────────────────────────────
  return (
    <motion.div
      className="flex h-full flex-col bg-background overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="px-5 pt-8 pb-2">
        <motion.p
          className="font-ui text-[10px] tracking-[0.2em] uppercase"
          style={{ color: '#C8860A' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          On This Day
        </motion.p>
        <motion.h1
          className="font-heading text-2xl font-semibold text-present mt-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {getTodayLabel()}
        </motion.h1>
        <motion.p
          className="font-ui text-xs text-present/40 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Step into history. Tap to explore.
        </motion.p>
      </div>

      {/* Event Cards */}
      <div className="flex-1 px-5 py-4 flex flex-col gap-3">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
          >
            <button
              onClick={() => handleEventTap(event)}
              className="w-full text-left rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="px-4 pt-4 pb-3">
                {/* City + Year */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: '#C8860A' }}
                  >
                    {event.city} &middot; {event.year}
                  </span>
                </div>

                {/* Headline */}
                <h3
                  className="text-base font-semibold leading-snug mb-1.5"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#F5F5F5' }}
                >
                  {event.headline}
                </h3>

                {/* Description */}
                <p
                  className="text-xs leading-relaxed line-clamp-3"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  {event.description}
                </p>
              </div>

              {/* Bottom bar */}
              <div
                className="px-4 py-2.5 flex items-center justify-between"
                style={{
                  background: 'rgba(200,134,10,0.06)',
                  borderTop: '1px solid rgba(200,134,10,0.08)',
                }}
              >
                <span className="text-xs font-medium" style={{ color: '#C8860A' }}>
                  Experience this moment
                </span>
                <div className="flex items-center gap-2">
                  {/* Share button */}
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); handleShare(event) }}
                    className="w-6 h-6 flex items-center justify-center rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l4 4-4 4" stroke="#C8860A" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Skip / Browse */}
      <motion.div
        className="px-5 pb-6 pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <button
          onClick={onSkip}
          className="w-full py-3 rounded-full font-ui text-xs tracking-wide"
          style={{
            color: 'rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          Browse all locations
        </button>
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="text-center pb-4 font-ui text-[9px] tracking-[0.15em] uppercase"
        style={{ color: 'rgba(255,255,255,0.12)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Timeless Moment
      </motion.p>
    </motion.div>
  )
}
