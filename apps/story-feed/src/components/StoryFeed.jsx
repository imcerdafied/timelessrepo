import { motion } from 'framer-motion'
import { STORIES } from '../data/stories'
import useStoryStore from '../store/useStoryStore'
import { track } from '../services/analytics'

export default function StoryFeed() {
  const { setActiveStory, setActiveEpisode } = useStoryStore()
  const story = STORIES[0]

  function handlePlay() {
    const firstEpisode = story.episodes.find(e => e.number === 1)
    if (firstEpisode) {
      setActiveStory(story)
      setActiveEpisode(firstEpisode)
      track('dispatch_story_opened', { story_id: story.id })
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      {/* Header */}
      <div style={{
        paddingTop: 'max(20px, env(safe-area-inset-top))',
        paddingBottom: 16,
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#f59e0b',
            fontWeight: 600,
            marginBottom: 4,
          }}>
            DISPATCH
          </div>
          <div style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.35)',
            fontStyle: 'italic',
          }}>
            A new episode drops daily.
          </div>
        </motion.div>
      </div>

      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          position: 'relative',
          width: '100%',
          height: 280,
          overflow: 'hidden',
        }}
      >
        <img
          src={story.cover_image}
          alt={story.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.5)',
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, #000 0%, transparent 60%)',
        }} />
      </motion.div>

      {/* Story details */}
      <div style={{
        padding: '0 24px',
        marginTop: -40,
        position: 'relative',
        zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Title */}
          <div style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: 'white',
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}>
            {story.title}
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: 17,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.5,
            marginBottom: 20,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: 'italic',
          }}>
            {story.tagline}
          </div>

          {/* Character */}
          <div style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 8,
          }}>
            <span style={{ color: '#f59e0b', fontWeight: 500 }}>{story.character_name}</span>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>&middot;</span>
            {story.character_role}
          </div>

          {/* Character description */}
          <div style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.6,
            marginBottom: 32,
          }}>
            {story.character_description}
          </div>

          {/* CTA */}
          <button
            onClick={handlePlay}
            style={{
              width: '100%',
              backgroundColor: '#f59e0b',
              color: '#000',
              border: 'none',
              borderRadius: 12,
              padding: '16px 0',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 16,
            }}
          >
            Watch Episode 1
          </button>

          {/* Episode info */}
          <div style={{
            textAlign: 'center',
            fontSize: 13,
            color: 'rgba(255,255,255,0.3)',
            marginBottom: 40,
          }}>
            {story.episodes.length} episodes &middot; New episode daily
          </div>

          {/* Bottom tagline */}
          <div style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.08em',
            paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          }}>
            You decide what happens.
          </div>
        </motion.div>
      </div>
    </div>
  )
}
