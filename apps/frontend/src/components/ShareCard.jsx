import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'

function truncate(text, max) {
  if (!text || text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, '') + '...'
}

export default function ShareCard({ era, locationName, imageUrl, onClose }) {
  const cardRef = useRef(null)
  const [sharing, setSharing] = useState(false)

  const handleShare = useCallback(async () => {
    if (sharing || !cardRef.current) return
    setSharing(true)

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#0A0A0A',
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      )

      if (navigator.share && blob) {
        const file = new File([blob], `timeless-${era.id}.png`, { type: 'image/png' })
        await navigator.share({
          title: era.headline,
          text: `${locationName}, ${era.year_display}`,
          url: window.location.href,
          files: [file],
        }).catch(() => {
          // User cancelled share — fall through to download
          downloadBlob(blob)
        })
      } else if (blob) {
        downloadBlob(blob)
      }
    } catch {
      // Silent fail
    } finally {
      setSharing(false)
    }
  }, [sharing, era, locationName])

  function downloadBlob(blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timeless-${era.id}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  const firstSentence = truncate(
    era.description?.match(/^(.*?[.!?])/)?.[1] || era.description,
    100
  )

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* The renderable card */}
          <div
            ref={cardRef}
            className="relative overflow-hidden"
            style={{ width: 390, height: 690, backgroundColor: '#0A0A0A' }}
          >
            {/* Background image */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                crossOrigin="anonymous"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}

            {/* Dark gradient overlay — bottom 60% */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 40%, transparent 60%)',
              }}
            />

            {/* Top branding */}
            <div style={{ position: 'absolute', top: 24, left: 24, right: 24 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', color: '#C8860A', textTransform: 'uppercase' }}>
                Timeless Moment
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(245,245,245,0.3)', marginTop: 2 }}>
                timelessmoment.app
              </div>
            </div>

            {/* Middle — year */}
            <div style={{ position: 'absolute', top: '42%', left: 24, right: 24, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 64, fontWeight: 700, color: '#F5F5F5', lineHeight: 1 }}>
                {era.year_display}
              </div>
            </div>

            {/* Bottom area */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 24px' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.2em', color: '#C8860A', textTransform: 'uppercase' }}>
                {locationName}
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 600, color: '#F5F5F5', lineHeight: 1.2, marginTop: 8, maxHeight: 68, overflow: 'hidden' }}>
                {era.headline}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(245,245,245,0.6)', lineHeight: 1.5, marginTop: 8 }}>
                {firstSentence}
              </div>

              {/* Bottom rule + tagline */}
              <div style={{ borderTop: '1px solid #C8860A', marginTop: 16, paddingTop: 12 }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(245,245,245,0.4)', letterSpacing: '0.1em' }}>
                  A place in time.
                </div>
              </div>
            </div>
          </div>

          {/* Share / download button */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              disabled={sharing}
              className="cursor-pointer rounded-full border border-past/40 bg-past/15 px-6 py-2.5 font-ui text-xs font-medium tracking-[0.15em] text-past uppercase transition-colors hover:bg-past/25 disabled:opacity-40"
            >
              {sharing ? 'Generating...' : navigator.share ? 'Share' : 'Download'}
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-full border border-present/20 bg-surface/60 px-6 py-2.5 font-ui text-xs tracking-wide text-present/60 backdrop-blur-md transition-colors hover:bg-surface/80"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
