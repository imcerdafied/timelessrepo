import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import useStore from '../store/useStore'
import { useGPS } from './GPSTrigger'
import { supabase } from '../lib/supabase'

const EMOJI_OPTIONS = ['📍', '🔥', '⚓', '🌊', '🏛️', '🕊️', '⚡', '🌿']

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function ArtifactLayer({ era, locationId, locationName, city }) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [artifacts, setArtifacts] = useState([])
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState('📍')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const dragControls = useDragControls()
  const coords = useGPS()

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    setFormOpen(false)
    setSuccess(false)
  }, [])

  const fetchArtifacts = useCallback(async () => {
    if (!locationId || !era?.id) return
    try {
      const { data, count: total, error } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact' })
        .eq('location_id', locationId)
        .eq('era_id', era.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error) {
        setArtifacts(data || [])
        setCount(total || 0)
      }
    } catch {
      // Silent fail — artifacts are non-critical
    }
  }, [locationId, era?.id])

  useEffect(() => {
    fetchArtifacts()
  }, [fetchArtifacts])

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)

    try {
      const { error } = await supabase.from('artifacts').insert({
        location_id: locationId,
        location_name: locationName,
        city: city || 'San Francisco',
        era_id: era.id,
        era_year: era.year_display,
        era_label: era.label,
        latitude: coords?.lat || null,
        longitude: coords?.lng || null,
        author_name: (name || 'Anonymous').slice(0, 50),
        message: message ? message.slice(0, 200) : null,
        emoji: emoji || '📍',
      })

      if (!error) {
        setSuccess(true)
        setFormOpen(false)
        setName('')
        setMessage('')
        setEmoji('📍')
        await fetchArtifacts()
        setTimeout(() => setSuccess(false), 1500)
      }
    } catch {
      // Silent fail
    } finally {
      setSubmitting(false)
    }
  }, [submitting, locationId, locationName, city, era, coords, name, message, emoji, fetchArtifacts])

  if (!era) return null

  return (
    <>
      {/* Count pill — bottom of era view */}
      <motion.button
        onClick={() => setPanelOpen(true)}
        className="cursor-pointer rounded-sm border border-border bg-surface/80 px-3 py-1.5 backdrop-blur-sm transition-colors hover:border-present/20"
        whileTap={{ scale: 0.97 }}
      >
        <span className="font-ui text-[10px] tracking-[0.15em] text-present/50 uppercase">
          {count > 0
            ? `${count} ${count === 1 ? 'person' : 'people'} stood here in ${era.year_display}`
            : 'Be the first'}
        </span>
      </motion.button>

      {/* Artifact panel (bottom sheet) */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 z-30 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
            />

            <motion.div
              className="absolute inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-hidden rounded-t-sm border-t border-border bg-surface/95 backdrop-blur-2xl"
              style={{ touchAction: 'none' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              dragListener={false}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  closePanel()
                }
              }}
            >
              {/* Drag handle */}
              <div
                className="flex cursor-grab justify-center pt-3 pb-2 active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="h-1 w-8 rounded-full bg-present/20" />
              </div>

              <div className="overflow-y-auto overscroll-contain px-5" style={{ maxHeight: 'calc(85vh - 24px)', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 16px))' }}>
                {/* Header with title and close/back buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {formOpen && (
                      <button
                        onClick={() => setFormOpen(false)}
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-present/40 transition-colors hover:text-present/60"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M7.5 1.5L3 6l4.5 4.5" />
                        </svg>
                      </button>
                    )}
                    <h3 className="font-ui text-xs font-medium tracking-[0.2em] text-present/40 uppercase">
                      {formOpen ? 'Leave Your Mark' : `Visitors, ${era.year_display}`}
                    </h3>
                  </div>
                  <button
                    onClick={closePanel}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-present/40 transition-colors hover:text-present/60"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M8 2L2 8M2 2l6 6" />
                    </svg>
                  </button>
                </div>

                {/* Success banner */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      className="mt-3 flex items-center gap-2 rounded-sm border border-past/30 bg-past/10 px-3 py-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#C8860A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11.5 3.5L5.5 10 2.5 7" />
                      </svg>
                      <span className="font-ui text-xs text-past">You were here.</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* List view */}
                {!formOpen && (
                  <>
                    {artifacts.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {artifacts.map((a) => (
                          <div key={a.id} className="flex gap-3 rounded-sm border border-border bg-background/50 px-3 py-2.5">
                            <span className="text-base">{a.emoji}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="font-ui text-xs font-medium text-present/80">
                                  {a.author_name}
                                </span>
                                <span className="shrink-0 font-mono text-[10px] text-present/25">
                                  {timeAgo(a.created_at)}
                                </span>
                              </div>
                              {a.message && (
                                <p className="mt-0.5 font-ui text-xs leading-relaxed text-present/50">
                                  {a.message}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 font-ui text-xs text-present/30">
                        No one has stood here yet. Be the first.
                      </p>
                    )}

                    <button
                      onClick={() => setFormOpen(true)}
                      className="mt-4 w-full cursor-pointer rounded-sm border border-past/40 bg-past/15 py-3 font-ui text-xs font-medium tracking-[0.2em] text-past uppercase transition-colors hover:bg-past/25"
                    >
                      I Was Here
                    </button>
                  </>
                )}

                {/* Form view */}
                {formOpen && (
                  <motion.div
                    className="mt-4 space-y-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <input
                      type="text"
                      placeholder="Your name"
                      maxLength={50}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-sm border border-border bg-background px-3 py-2 font-ui text-sm text-present placeholder:text-present/25 outline-none focus:border-past/40"
                    />
                    <textarea
                      placeholder="Leave a message (optional)"
                      maxLength={200}
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full resize-none rounded-sm border border-border bg-background px-3 py-2 font-ui text-sm text-present placeholder:text-present/25 outline-none focus:border-past/40"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-ui text-[10px] tracking-[0.15em] text-present/30 uppercase">
                        {message.length}/200
                      </span>
                    </div>
                    {/* Emoji picker */}
                    <div className="flex gap-2">
                      {EMOJI_OPTIONS.map((e) => (
                        <button
                          key={e}
                          onClick={() => setEmoji(e)}
                          className={`cursor-pointer rounded-sm border px-2 py-1 text-base transition-colors ${
                            emoji === e
                              ? 'border-past/40 bg-past/15'
                              : 'border-border bg-background hover:border-present/20'
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full cursor-pointer rounded-sm border border-past/40 bg-past/15 py-3 font-ui text-xs font-medium tracking-[0.2em] text-past uppercase transition-colors hover:bg-past/25 disabled:opacity-40"
                    >
                      {submitting ? 'Dropping...' : 'Drop It'}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
