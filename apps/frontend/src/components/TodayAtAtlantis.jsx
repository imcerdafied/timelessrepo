import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import posthog from 'posthog-js'

const API_BASE = import.meta.env.VITE_API_URL || ''
const PROPERTY_NAME = import.meta.env.VITE_PROPERTY_NAME || 'Atlantis Experience'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const FALLBACK = {
  greeting: 'On This Day',
  events: [
    {
      year: '1718',
      headline: 'The End of the Pirate Republic',
      snippet: 'Woodes Rogers arrived in Nassau with Royal authority and a pardon for any pirate willing to surrender, ending the most famous pirate haven in history.',
      zone_id: 'marina-beach',
      layer_id: 'marina-beach-colonial',
    },
    {
      year: '1973',
      headline: 'Bahamian Independence',
      snippet: 'The Bahamas gained independence from the United Kingdom, ending 256 years of British colonial rule and beginning a new chapter for the island nation.',
      zone_id: 'lobby-royal-towers',
      layer_id: 'lobby-royal-towers-colonial',
    },
  ],
  did_you_know: 'The Atlantis marine habitat holds 11 million gallons of saltwater — enough to fill 17 Olympic swimming pools.',
}

/**
 * TodayAtAtlantis — daily welcome screen showing weather, events,
 * featured historical moment, and a fun property fact.
 *
 * Props:
 *   onEventTap(zoneId, layerId) — navigate to zone/layer
 *   onSkip()                    — dismiss and browse all zones
 *   onLogoTap()                 — logo interaction
 */
export default function TodayAtAtlantis({ onEventTap, onSkip, onLogoTap }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    posthog.capture('session_started')

    const dateKey = todayKey()
    const cacheKey = `todayAtProperty_${dateKey}`

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.events?.length) {
          setData(parsed)
          setLoading(false)
          return
        }
      }
    } catch {}

    // Fetch from backend
    fetch(`${API_BASE}/api/today-at-property`)
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed')
        return r.json()
      })
      .then((payload) => {
        if (payload?.events?.length) {
          setData(payload)
          try { localStorage.setItem(cacheKey, JSON.stringify(payload)) } catch {}
        } else {
          setData(FALLBACK)
        }
      })
      .catch(() => {
        setData(FALLBACK)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── LOADING ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full flex-col bg-background px-5 pt-8">
        {/* Header shimmer */}
        <div className="shimmer mb-4 h-6 w-48 rounded" />
        {/* Event card shimmers */}
        <div className="shimmer mb-3 h-16 w-full rounded-xl" />
        <div className="shimmer mb-3 h-16 w-full rounded-xl" />
        <div className="shimmer mb-3 h-16 w-full rounded-xl" />
        {/* Featured shimmer */}
        <div className="shimmer mb-3 mt-4 h-20 w-full rounded-xl" />
        {/* Did You Know shimmer */}
        <div className="shimmer mt-3 h-16 w-full rounded-xl" />
      </div>
    )
  }

  const { greeting, events, featured, did_you_know } = data

  // ── MAIN CONTENT ───────────────────────────────────────────────────
  return (
    <motion.div
      className="flex h-full flex-col bg-background overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-5 pt-8 pb-2 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-accent">
            Welcome
          </p>
          <h1 className="font-heading text-2xl font-semibold text-present mt-1">
            {greeting || `Today at ${PROPERTY_NAME}`}
          </h1>
        </motion.div>

        <motion.button
          onClick={onLogoTap}
          className="ml-3 flex h-9 w-9 items-center justify-center rounded-full border border-border"
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          aria-label="Property logo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.8" />
            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>

      {/* On This Day */}
      <div className="px-5 pt-5">
        <motion.p
          className="font-ui text-[10px] tracking-[0.15em] uppercase text-present/40 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          On This Day
        </motion.p>

        <div className="flex flex-col gap-2.5">
          {events.map((event, i) => (
            <motion.button
              key={`${event.zone_id}-${i}`}
              onClick={() => onEventTap(event.zone_id, event.layer_id)}
              className="w-full text-left rounded-xl border border-border px-4 py-3 active:scale-[0.98] transition-transform"
              style={{ background: 'rgba(0,0,0,0.02)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08, duration: 0.45 }}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-accent font-semibold shrink-0 pt-0.5">{event.year}</span>
                <div>
                  <h3 className="font-heading text-sm font-medium text-present leading-snug">
                    {event.headline}
                  </h3>
                  <p className="font-ui text-xs text-present/50 mt-1 leading-relaxed">
                    {event.snippet}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Featured Historical Moment ────────────────────────────── */}
      {featured && (
        <div className="px-5 pt-5">
          <motion.p
            className="font-ui text-[10px] tracking-[0.15em] uppercase text-present/40 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Featured Historical Moment
          </motion.p>

          <motion.button
            onClick={() => onEventTap(featured.zone_id, featured.layer_id)}
            className="w-full text-left rounded-xl border border-accent/30 bg-accent/10 px-4 py-3.5 active:scale-[0.98] transition-transform"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.45 }}
          >
            <h3 className="font-heading text-sm font-semibold text-accent leading-snug">
              {featured.headline}
            </h3>
            <p className="font-ui text-xs text-present/50 mt-1.5 leading-relaxed">
              {featured.snippet}
            </p>
            <span className="inline-block mt-2 font-mono text-[10px] text-accent/70">
              Explore this era &rarr;
            </span>
          </motion.button>
        </div>
      )}

      {/* ── Did You Know ──────────────────────────────────────────── */}
      {did_you_know && (
        <div className="px-5 pt-5">
          <motion.p
            className="font-ui text-[10px] tracking-[0.15em] uppercase text-present/40 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            Did You Know
          </motion.p>

          <motion.div
            className="rounded-xl border border-past/30 bg-past/5 px-4 py-3.5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.45 }}
          >
            <p className="font-ui text-xs text-present/60 leading-relaxed">
              {did_you_know}
            </p>
          </motion.div>
        </div>
      )}

      {/* ── Explore All Zones Button ──────────────────────────────── */}
      <motion.div
        className="px-5 pb-6 pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={onSkip}
          className="w-full py-3 rounded-full font-ui text-xs tracking-wide border border-operational/20 bg-operational/5 text-operational active:scale-[0.98] transition-transform"
        >
          Explore All Zones
        </button>
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="text-center pb-4 font-ui text-[9px] tracking-[0.15em] uppercase text-present/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {PROPERTY_NAME}
      </motion.p>
    </motion.div>
  )
}
