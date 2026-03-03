import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function ShareCard({ story, episode, onClose }) {
  const cardRef = useRef(null)

  async function handleShare() {
    const shareData = {
      title: `${story.title} — Story Universe`,
      text: `"${episode.scene.slice(0, 120)}..." — ${story.character}, ${story.year}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n\n${shareData.url}`
        )
      }
    } catch {
      // User cancelled share
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 'max(16px, env(safe-area-inset-top))',
          right: 16,
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 24,
          cursor: 'pointer',
        }}
      >
        &times;
      </button>

      {/* Card */}
      <div
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: 340,
          backgroundColor: '#111',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Top bar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#C8860A',
            marginBottom: 4,
          }}>
            STORY UNIVERSE
          </div>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "'Playfair Display', serif",
            color: 'white',
          }}>
            {story.title}
          </div>
        </div>

        {/* Quote */}
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{
            fontSize: 15,
            fontStyle: 'italic',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.8)',
            fontFamily: "'Playfair Display', serif",
          }}>
            &ldquo;{episode.scene.slice(0, 200)}&rdquo;
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
          }}>
            {story.character}, {story.year}
          </span>
          <span style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.06em',
          }}>
            {episode.title}
          </span>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        style={{
          marginTop: 20,
          backgroundColor: '#C8860A',
          color: '#000',
          border: 'none',
          borderRadius: 12,
          padding: '12px 32px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Share This Moment
      </button>
    </motion.div>
  )
}
