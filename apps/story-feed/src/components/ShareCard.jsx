import { motion } from 'framer-motion'

export default function ShareCard({ story, episode, votedOption, percent, onClose }) {
  const firstName = story.character_name.split(' ')[0]

  async function handleShare() {
    const text = votedOption && percent != null
      ? `"${episode.vote_question}" — ${percent}% of readers chose "${votedOption.label}"`
      : `"${episode.vote_question}" — ${firstName}'s story on Dispatch`

    const shareData = {
      title: `${story.title} — Dispatch`,
      text,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${text}\n\ndispatch.app`)
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
        backgroundColor: 'rgba(0,0,0,0.95)',
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

      {/* Shareable stat card */}
      <div style={{
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#000',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(245,158,11,0.3)',
        padding: '32px 24px',
      }}>
        {/* DISPATCH branding */}
        <div style={{
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#f59e0b',
          marginBottom: 24,
          fontWeight: 600,
        }}>
          DISPATCH
        </div>

        {/* Vote question */}
        <div style={{
          fontSize: 18,
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: 'white',
          lineHeight: 1.5,
          marginBottom: 20,
        }}>
          {episode.vote_question}
        </div>

        {/* Result */}
        {votedOption && percent != null && (
          <div style={{
            fontSize: 15,
            color: '#f59e0b',
            fontWeight: 500,
            marginBottom: 24,
          }}>
            {percent}% of readers chose &ldquo;{votedOption.label}&rdquo;
          </div>
        )}

        {/* Footer */}
        <div style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.06em',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 16,
        }}>
          dispatch.app
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        style={{
          marginTop: 20,
          backgroundColor: '#f59e0b',
          color: '#000',
          border: 'none',
          borderRadius: 12,
          padding: '12px 32px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Share
      </button>
    </motion.div>
  )
}
