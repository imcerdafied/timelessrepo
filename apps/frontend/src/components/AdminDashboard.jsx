import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'

const ZONE_NAMES = {
  'marina-beach': 'Marina & Beach',
  'lobby-royal-towers': 'Lobby & Royal Towers',
  'waterpark-pools': 'Waterpark & Pools',
  'casino-nightlife': 'Casino & Nightlife',
  'marine-habitat': 'Marine Habitat',
}

const ZONE_IDS = Object.keys(ZONE_NAMES)

const LAYERS = [
  'deep-past',
  'colonial',
  'early-tourism',
  'resort-era',
  'modern',
  'present',
  'culture',
  'behind-scenes',
  'future',
]

const TOTAL_LAYERS = LAYERS.length

// Map each layer to a content-type bucket for affinity analysis
const LAYER_TYPE_MAP = {
  'deep-past': 'Historical',
  'colonial': 'Historical',
  'early-tourism': 'Historical',
  'resort-era': 'Historical',
  'modern': 'Present Day',
  'present': 'Present Day',
  'future': 'Future',
  'culture': 'Local Culture',
  'behind-scenes': 'Behind the Scenes',
}

const AFFINITY_TYPES = ['Historical', 'Present Day', 'Future', 'Local Culture', 'Behind the Scenes']

// Affinity label thresholds — label is applied when the matching type percentage exceeds the threshold
function computeAffinityLabels(typeBreakdown) {
  const labels = []
  const hist = typeBreakdown['Historical'] || 0
  const culture = typeBreakdown['Local Culture'] || 0
  const bts = typeBreakdown['Behind the Scenes'] || 0
  const future = typeBreakdown['Future'] || 0
  const present = typeBreakdown['Present Day'] || 0

  if (hist >= 30) labels.push('History Buff')
  if (culture >= 15) labels.push('Culture Explorer')
  if (bts >= 10) labels.push('Behind-the-Scenes Fan')
  if (future >= 15) labels.push('Futurist')
  if (present >= 20) labels.push('Live Experience Seeker')
  if (labels.length === 0) labels.push('General Explorer')

  return labels
}

function getNextBestAction(visitedZones, visitedLayers) {
  // Find zones never entered
  const unvisitedZones = ZONE_IDS.filter((z) => !visitedZones.has(z))
  if (unvisitedZones.length > 0) {
    const zone = unvisitedZones[0]
    return {
      type: 'explore_zone',
      title: `Explore ${ZONE_NAMES[zone]}`,
      description: `This guest hasn't visited ${ZONE_NAMES[zone]} yet. A targeted push notification or wayfinding prompt could drive engagement.`,
    }
  }

  // Find under-explored zones (< 3 layers visited)
  for (const zone of ZONE_IDS) {
    const visited = LAYERS.filter((l) => visitedLayers.has(`${zone}-${l}`)).length
    if (visited < 3) {
      const missing = LAYERS.filter((l) => !visitedLayers.has(`${zone}-${l}`))
      const suggestion = missing[0]
      return {
        type: 'deepen_zone',
        title: `Deepen ${ZONE_NAMES[zone]}`,
        description: `Only ${visited}/${TOTAL_LAYERS} layers explored. Suggest the "${suggestion}" layer to increase dwell time and content engagement.`,
      }
    }
  }

  return {
    type: 'fully_engaged',
    title: 'Fully Engaged Guest',
    description: 'This guest has explored extensively. Recommend premium upsell: private tour, cabana reservation, or loyalty program enrollment.',
  }
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export default function AdminDashboard({ onClose }) {
  const visitedZones = useStore((s) => s.visitedZones)
  const visitedLayers = useStore((s) => s.visitedLayers)
  const [events, setEvents] = useState([])
  const eventStreamRef = useRef(null)
  const prevStateRef = useRef({ zones: new Set(), layers: new Set() })

  // Subscribe to store changes for event stream
  useEffect(() => {
    const unsub = useStore.subscribe((state, prevState) => {
      const now = new Date()

      // Detect new zones
      for (const zone of state.visitedZones) {
        if (!prevStateRef.current.zones.has(zone)) {
          setEvents((prev) => [
            { id: Date.now() + Math.random(), type: 'zone_entered', zone, time: now },
            ...prev,
          ])
        }
      }

      // Detect new layers
      for (const layer of state.visitedLayers) {
        if (!prevStateRef.current.layers.has(layer)) {
          setEvents((prev) => [
            { id: Date.now() + Math.random(), type: 'layer_selected', layer, time: now },
            ...prev,
          ])
        }
      }

      prevStateRef.current = {
        zones: new Set(state.visitedZones),
        layers: new Set(state.visitedLayers),
      }
    })

    // Seed with initial state
    prevStateRef.current = {
      zones: new Set(useStore.getState().visitedZones),
      layers: new Set(useStore.getState().visitedLayers),
    }

    return unsub
  }, [])

  // Zone engagement: count visited layers per zone
  const zoneEngagement = useMemo(() => {
    return ZONE_IDS.map((zoneId) => {
      const count = LAYERS.filter((l) => visitedLayers.has(`${zoneId}-${l}`)).length
      return { zoneId, name: ZONE_NAMES[zoneId], count, total: TOTAL_LAYERS }
    })
  }, [visitedLayers])

  // Content affinity breakdown
  const typeBreakdown = useMemo(() => {
    const counts = {}
    AFFINITY_TYPES.forEach((t) => (counts[t] = 0))
    let total = 0

    for (const layerId of visitedLayers) {
      // Extract the layer suffix from the visited layer ID
      for (const l of LAYERS) {
        if (layerId.endsWith(`-${l}`)) {
          const type = LAYER_TYPE_MAP[l]
          if (type) {
            counts[type]++
            total++
          }
          break
        }
      }
    }

    // Convert to percentages
    const pct = {}
    AFFINITY_TYPES.forEach((t) => {
      pct[t] = total > 0 ? Math.round((counts[t] / total) * 100) : 0
    })
    return pct
  }, [visitedLayers])

  // Guest profile labels
  const affinityLabels = useMemo(() => computeAffinityLabels(typeBreakdown), [typeBreakdown])

  // Next best action
  const nextAction = useMemo(
    () => getNextBestAction(visitedZones, visitedLayers),
    [visitedZones, visitedLayers]
  )

  const totalExplored = visitedLayers.size
  const totalPossible = ZONE_IDS.length * TOTAL_LAYERS

  return (
    <motion.div
      className="fixed inset-0 z-50 mobile-frame flex flex-col bg-background"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/90 backdrop-blur-md px-5 py-4">
        <div>
          <h1 className="font-heading text-lg font-bold tracking-wide text-present">
            Behavioral Signal
          </h1>
          <p className="text-xs text-accent/70 font-ui mt-0.5">
            Apollo Intelligence Preview
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-ui text-present/60 hover:text-present hover:border-accent/40 transition-colors"
        >
          Close
        </button>
      </div>

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Summary stat */}
        <div className="text-center">
          <span className="text-3xl font-heading font-bold text-accent">{totalExplored}</span>
          <span className="text-present/40 text-sm font-ui"> / {totalPossible} layers explored</span>
        </div>

        {/* ── Zone Engagement Heatmap ────────────────────────────── */}
        <section>
          <h2 className="font-heading text-sm font-semibold text-present/80 uppercase tracking-widest mb-3">
            Zone Engagement
          </h2>
          <div className="space-y-2.5">
            {zoneEngagement.map(({ zoneId, name, count, total }) => (
              <div key={zoneId}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-ui text-present/70 truncate mr-2">{name}</span>
                  <span className="text-xs font-ui text-accent tabular-nums">
                    {count}/{total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-accent/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / total) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Content Affinity ───────────────────────────────────── */}
        <section>
          <h2 className="font-heading text-sm font-semibold text-present/80 uppercase tracking-widest mb-3">
            Content Affinity
          </h2>
          <div className="flex flex-wrap gap-2">
            {AFFINITY_TYPES.map((type) => {
              const pct = typeBreakdown[type]
              return (
                <motion.span
                  key={type}
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-ui"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-present/80">{type}</span>
                  <span className="text-accent font-semibold tabular-nums">{pct}%</span>
                </motion.span>
              )
            })}
          </div>
        </section>

        {/* ── Guest Profile ──────────────────────────────────────── */}
        <section>
          <h2 className="font-heading text-sm font-semibold text-present/80 uppercase tracking-widest mb-3">
            Guest Profile
          </h2>
          <div className="flex flex-wrap gap-2">
            {affinityLabels.map((label) => (
              <motion.span
                key={label}
                className="rounded-full bg-accent/20 border border-accent/30 px-3 py-1.5 text-xs font-ui font-medium text-accent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {label}
              </motion.span>
            ))}
          </div>
        </section>

        {/* ── Next Best Action ───────────────────────────────────── */}
        <section>
          <h2 className="font-heading text-sm font-semibold text-present/80 uppercase tracking-widest mb-3">
            Next Best Action
          </h2>
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs">
                {nextAction.type === 'fully_engaged' ? '\u2713' : '\u2192'}
              </div>
              <div>
                <p className="text-sm font-ui font-medium text-present/90">{nextAction.title}</p>
                <p className="mt-1 text-xs font-ui text-present/50 leading-relaxed">
                  {nextAction.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Event Stream ───────────────────────────────────────── */}
        <section>
          <h2 className="font-heading text-sm font-semibold text-present/80 uppercase tracking-widest mb-3">
            Event Stream
          </h2>
          <div
            ref={eventStreamRef}
            className="max-h-48 overflow-y-auto rounded-lg border border-border bg-surface/50 divide-y divide-border"
          >
            {events.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs font-ui text-present/30">
                No events yet. Explore zones to generate signals.
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {events.slice(0, 50).map((evt) => (
                  <motion.div
                    key={evt.id}
                    className="flex items-center gap-3 px-4 py-2.5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span
                      className={`flex-shrink-0 h-1.5 w-1.5 rounded-full ${
                        evt.type === 'zone_entered' ? 'bg-accent' : 'bg-primary'
                      }`}
                    />
                    <span className="flex-1 text-xs font-ui text-present/70 truncate">
                      {evt.type === 'zone_entered'
                        ? `zone_entered: ${ZONE_NAMES[evt.zone] || evt.zone}`
                        : `layer_selected: ${evt.layer}`}
                    </span>
                    <span className="text-[10px] font-ui text-present/30 tabular-nums flex-shrink-0">
                      {formatTime(evt.time)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div className="border-t border-border px-5 py-3 text-center">
        <p className="text-[10px] font-ui text-present/30 tracking-wider uppercase">
          Powered by Phunware Apollo
        </p>
      </div>
    </motion.div>
  )
}
