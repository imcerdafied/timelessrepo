import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStoryStore from '../store/useStoryStore'

export default function VoteBar({ episode, story, onVoted }) {
  const { votes, castVote } = useStoryStore()
  const [tallies, setTallies] = useState(null)
  const hasVoted = !!votes[episode.id]

  async function handleVote(option) {
    const consequence = episode.vote_consequence[option]
    castVote(episode.id, option, consequence)

    // Try to submit to backend
    try {
      const userId = localStorage.getItem('story_user_id') || crypto.randomUUID()
      localStorage.setItem('story_user_id', userId)

      const res = await fetch('/api/story/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId: episode.id,
          option,
          userId,
        })
      })
      if (res.ok) {
        const data = await res.json()
        setTallies(data.tallies)
      }
    } catch {
      // Vote saved locally even if backend fails
    }

    if (onVoted) onVoted(option, consequence)
  }

  // Calculate percentages from tallies
  function getPercent(option) {
    if (!tallies) return 50
    const total = Object.values(tallies).reduce((s, v) => s + v, 0)
    if (!total) return 50
    return Math.round(((tallies[option] || 0) / total) * 100)
  }

  return (
    <div style={{ padding: '0 24px' }}>
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: 18,
          fontWeight: 600,
          fontFamily: "'Playfair Display', serif",
          color: 'white',
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 1.4,
        }}
      >
        {episode.vote_question}
      </motion.div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {episode.vote_options.map((option, i) => (
          <motion.button
            key={option}
            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            onClick={() => !hasVoted && handleVote(option)}
            disabled={hasVoted}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: 14,
              border: hasVoted && votes[episode.id] === option
                ? '1px solid #C8860A'
                : '1px solid rgba(255,255,255,0.12)',
              backgroundColor: hasVoted
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(255,255,255,0.06)',
              color: 'white',
              fontSize: 15,
              cursor: hasVoted ? 'default' : 'pointer',
              textAlign: 'left',
              overflow: 'hidden',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Percentage bar background */}
            {hasVoted && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getPercent(option)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: votes[episode.id] === option
                    ? 'rgba(200,134,10,0.15)'
                    : 'rgba(255,255,255,0.04)',
                  borderRadius: 14,
                }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>{option}</span>
            {hasVoted && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: 500,
                }}
              >
                {getPercent(option)}%
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
