import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import posthog from 'posthog-js'
import { getCuratedImage } from '../data/imageMap'

const API_BASE = import.meta.env.VITE_API_URL || ''
const PROPERTY_NAME = import.meta.env.VITE_PROPERTY_NAME || 'Atlantis Experience'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const CATEGORY_COLORS = {
  maritime: '#1E4D8C',
  cultural: '#C8860A',
  natural: '#2D8F4E',
  political: '#8B4513',
  culinary: '#D4845A',
  scientific: '#4A90A4',
  architectural: '#6B7280',
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
      category: 'maritime',
    },
    {
      year: '1973',
      headline: 'Bahamian Independence',
      snippet: 'The Bahamas gained independence from the United Kingdom, ending 256 years of British colonial rule.',
      zone_id: 'lobby-royal-towers',
      layer_id: 'lobby-royal-towers-colonial',
      category: 'political',
    },
    {
      year: '1998',
      headline: 'Atlantis Opens Its Doors',
      snippet: 'Sol Kerzner unveiled the Royal Towers, transforming Paradise Island with the largest open-air marine habitat in the world.',
      zone_id: 'lobby-royal-towers',
      layer_id: 'lobby-royal-towers-modern',
      category: 'architectural',
      commerce_bridge: {
        type: 'experience',
        text: 'Walk through the lobby where it all began on a guided Heritage Tour',
        cta: 'Book Heritage Tour',
      },
    },
  ],
  featured: {
    headline: 'The Republic of Pirates',
    snippet: 'In 1718, Nassau harbor held more pirate ships than any port in the world.',
    zone_id: 'marina-beach',
    layer_id: 'marina-beach-colonial',
    category: 'maritime',
  },
  did_you_know: 'The Atlantis marine habitat holds 11 million gallons of saltwater, enough to fill 17 Olympic swimming pools.',
}

export default function TodayAtAtlantis({ onEventTap, onSkip, onLogoTap, onCameraTap }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    posthog.capture('session_started')
    posthog.capture('otd_screen_viewed', { mode: 'on_property' })
    const dateKey = todayKey()
    const cacheKey = `otd_${dateKey}`

    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.events?.length) { setData(parsed); setLoading(false); return }
      }
    } catch {}

    fetch(`${API_BASE}/api/today-at-property`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(payload => {
        if (payload?.events?.length) {
          setData(payload)
          try { localStorage.setItem(cacheKey, JSON.stringify(payload)) } catch {}
        } else { setData(FALLBACK) }
      })
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  const handleShare = useCallback(async (event) => {
    const text = `On this day in ${event.year}: ${event.headline}. ${event.snippet}`
    if (navigator.share) {
      try { await navigator.share({ text, title: `On This Day, ${PROPERTY_NAME}` }) } catch {}
    } else {
      navigator.clipboard?.writeText(text)
    }
    posthog.capture('otd_shared', { event_year: event.year, share_target: 'native' })
  }, [])

  if (loading) {
    return (
      <div className="flex h-full flex-col bg-background px-5 pt-8">
        <div className="shimmer mb-4 h-6 w-48 rounded" />
        <div className="flex gap-3 overflow-hidden mt-4">
          <div className="shimmer h-48 w-64 shrink-0 rounded-xl" />
          <div className="shimmer h-48 w-64 shrink-0 rounded-xl" />
        </div>
        <div className="shimmer mt-6 h-20 w-full rounded-xl" />
        <div className="shimmer mt-4 h-16 w-full rounded-xl" />
      </div>
    )
  }

  const { greeting, events, featured, did_you_know } = data
  const commerceBridge = events?.find(e => e.commerce_bridge)?.commerce_bridge

  return (
    <motion.div
      className="flex h-full flex-col bg-background overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="px-5 pt-8 pb-2 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="font-ui text-[10px] tracking-[0.2em] uppercase text-accent">Welcome</p>
          <h1 className="font-heading text-2xl font-semibold text-present mt-1">{greeting || 'On This Day'}</h1>
        </motion.div>
        <motion.button
          onClick={onLogoTap}
          className="ml-3 flex h-9 w-9 items-center justify-center rounded-full border border-border"
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.8" />
            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>

      {/* On This Day horizontal carousel */}
      <div className="pt-4">
        <p className="px-5 font-ui text-[10px] tracking-[0.15em] uppercase text-present/40 mb-3">On This Day</p>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: 'none' }}>
          {events.map((event, i) => {
            const catColor = CATEGORY_COLORS[event.category] || '#6B7280'
            const eraImage = getCuratedImage(event.layer_id)
            return (
              <motion.button
                key={`${event.year}-${i}`}
                onClick={() => {
                  posthog.capture('otd_card_tapped', { event_year: event.year, category: event.category, target_zone: event.zone_id, position: i })
                  onEventTap(event.zone_id, event.layer_id)
                }}
                className="shrink-0 w-64 text-left rounded-xl border border-border overflow-hidden active:scale-[0.98] transition-transform"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                {/* Image thumbnail */}
                <div className="h-28 bg-surface relative overflow-hidden">
                  {eraImage ? (
                    <img src={eraImage} alt={event.headline} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center" style={{ backgroundColor: `${catColor}15` }}>
                      <span className="text-3xl opacity-30">{event.category === 'maritime' ? '\u{26F5}' : event.category === 'natural' ? '\u{1F3DD}' : event.category === 'culinary' ? '\u{1F374}' : '\u{1F3DB}'}</span>
                    </div>
                  )}
                  {/* Category pill */}
                  <span
                    className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-medium text-white uppercase tracking-wider"
                    style={{ backgroundColor: catColor }}
                  >
                    {event.category}
                  </span>
                  {/* Share icon */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(event) }}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                    </svg>
                  </button>
                </div>
                {/* Card content */}
                <div className="px-3 py-2.5">
                  <span className="font-mono text-[10px] font-semibold" style={{ color: catColor }}>{event.year}</span>
                  <h3 className="font-heading text-sm font-medium text-present leading-snug mt-0.5">{event.headline}</h3>
                  <p className="font-ui text-[11px] text-present/50 mt-1 leading-relaxed line-clamp-2">{event.snippet}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Commerce Bridge */}
      {commerceBridge && (
        <motion.div
          className="mx-5 mt-4 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-ui text-xs text-present/60 leading-relaxed">{commerceBridge.text}</p>
          <button
            onClick={() => posthog.capture('otd_commerce_bridge_tapped', { offer_type: commerceBridge.type })}
            className="mt-2 font-ui text-xs font-medium text-accent"
          >
            {commerceBridge.cta} &rarr;
          </button>
        </motion.div>
      )}

      {/* Featured Historical Moment */}
      {featured && (
        <div className="px-5 pt-5">
          <p className="font-ui text-[10px] tracking-[0.15em] uppercase text-present/40 mb-3">Featured Moment</p>
          <motion.button
            onClick={() => onEventTap(featured.zone_id, featured.layer_id)}
            className="w-full text-left rounded-xl border border-accent/30 bg-accent/5 px-4 py-3.5 active:scale-[0.98] transition-transform"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <h3 className="font-heading text-sm font-semibold text-accent leading-snug">{featured.headline}</h3>
            <p className="font-ui text-xs text-present/50 mt-1.5 leading-relaxed">{featured.snippet}</p>
            <span className="inline-block mt-2 font-mono text-[10px] text-accent/70">Explore this era &rarr;</span>
          </motion.button>
        </div>
      )}

      {/* Did You Know */}
      {did_you_know && (
        <div className="px-5 pt-5">
          <p className="font-ui text-[10px] tracking-[0.15em] uppercase text-present/40 mb-3">Did You Know</p>
          <motion.div
            className="rounded-xl border border-operational/20 bg-operational/5 px-4 py-3.5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="font-ui text-xs text-present/60 leading-relaxed">{did_you_know}</p>
          </motion.div>
        </div>
      )}

      {/* Explore All Zones */}
      <motion.div className="px-5 pb-6 pt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <button
          onClick={onSkip}
          className="w-full py-3 rounded-full font-ui text-xs tracking-wide border border-border text-present/60 active:scale-[0.98] transition-transform"
        >
          Explore All Zones
        </button>
      </motion.div>

      <motion.p
        className="text-center pb-4 font-ui text-[9px] tracking-[0.15em] uppercase text-present/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {PROPERTY_NAME}
      </motion.p>
    </motion.div>
  )
}
