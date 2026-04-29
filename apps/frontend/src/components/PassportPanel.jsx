import { AnimatePresence, motion } from 'framer-motion'
import { ACTIVE_PROPERTY } from '../config/properties'
import useStore from '../store/useStore'

const stampTypeLabel = {
  zone: 'Zone',
  layer: 'Layer',
  quest: 'Quest',
  share: 'Share',
  trail: 'Trail',
}

function hrefForStamp(stamp) {
  if (stamp.href) return stamp.href

  const [, targetId] = String(stamp.id || '').split(':')
  if (!targetId) return null

  if (stamp.type === 'zone') return `/demo/${ACTIVE_PROPERTY.slug}/zone/${targetId}`
  if (stamp.type === 'layer') return `/demo/${ACTIVE_PROPERTY.slug}/layer/${targetId}`
  if (stamp.type === 'trail') return `/demo/${ACTIVE_PROPERTY.slug}/trails`
  return null
}

export default function PassportPanel({ open = true, onClose, fullPage = false }) {
  const stamps = useStore((s) => s.passportStamps)
  const locations = useStore((s) => s.locations)
  const totalLayers = locations.reduce((sum, location) => sum + (location.eras?.length || 0), 0)
  const zoneCount = stamps.filter((stamp) => stamp.type === 'zone').length
  const layerCount = stamps.filter((stamp) => stamp.type === 'layer').length
  const recent = [...stamps].reverse()

  const body = (
    <div className={`${fullPage ? 'h-full' : 'max-h-[82vh]'} flex w-full flex-col rounded-t-2xl border-t border-white/10 bg-black text-white`}>
      <div className="flex items-start justify-between border-b border-white/10 px-5 py-5">
        <div>
          <p className="font-ui text-[10px] tracking-[0.2em] text-accent uppercase">
            Timeless Passport
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold">Your Atlantis trail</h2>
          <p className="mt-2 max-w-[280px] font-ui text-xs leading-relaxed text-white/55">
            Stamps unlock as guests visit zones, open layers, speak with characters, and create share moments. Tap a stamp to return there.
          </p>
        </div>
        {onClose ? (
          <button onClick={onClose} className="rounded-full border border-white/15 px-3 py-1.5 font-ui text-xs text-white/65">
            Close
          </button>
        ) : (
          <a href="/demos" className="rounded-full border border-white/15 px-3 py-1.5 font-ui text-xs text-white/65">
            Demos
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 py-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <div className="font-heading text-2xl text-accent">{zoneCount}/{locations.length}</div>
          <div className="font-ui text-[10px] tracking-[0.12em] text-white/45 uppercase">Zones</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <div className="font-heading text-2xl text-accent">{layerCount}/{totalLayers}</div>
          <div className="font-ui text-[10px] tracking-[0.12em] text-white/45 uppercase">Layers</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <a
          href={`/demo/${ACTIVE_PROPERTY.slug}/trails`}
          className="mb-4 flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-accent"
        >
          <span>
            <span className="block font-heading text-sm">Continue a Story Trail</span>
            <span className="mt-0.5 block font-ui text-[11px] text-accent/65">
              Follow a guided sequence and complete your next stamp.
            </span>
          </span>
          <span className="font-ui text-xs">&rarr;</span>
        </a>

        {recent.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 font-ui text-sm leading-relaxed text-white/55">
            Visit a zone or open a layer to collect your first stamp.
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((stamp) => {
              const href = hrefForStamp(stamp)
              const RowTag = href ? 'a' : 'div'

              return (
                <RowTag
                  key={stamp.id}
                  href={href || undefined}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-accent/35"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/35 bg-accent/10 font-heading text-sm text-accent">
                    {stampTypeLabel[stamp.type]?.[0] || 'T'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-heading text-sm text-white">{stamp.label}</div>
                    <div className="mt-0.5 font-ui text-[10px] tracking-[0.12em] text-white/40 uppercase">
                      {stampTypeLabel[stamp.type] || stamp.type}
                      {stamp.detail ? ` / ${stamp.detail}` : ''}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {href && (
                      <div className="font-ui text-[10px] text-accent/75">
                        Open
                      </div>
                    )}
                    <div className="mt-0.5 font-mono text-[10px] text-white/30">
                      {new Date(stamp.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </RowTag>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  if (fullPage) return body

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end bg-black/70 backdrop-blur-sm mobile-frame"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            onClick={(event) => event.stopPropagation()}
          >
            {body}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
