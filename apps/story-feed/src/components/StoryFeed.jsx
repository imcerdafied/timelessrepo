import { motion } from 'framer-motion'
import { STORIES } from '../data/stories'
import useStoryStore from '../store/useStoryStore'
import StoryCard from './StoryCard'

export default function StoryFeed() {
  const { setActiveStory, setActiveEpisode } = useStoryStore()

  function handlePlay(story) {
    const firstEpisode = story.episodes.find(e => e.day === 1)
    if (firstEpisode) {
      setActiveStory(story)
      setActiveEpisode(firstEpisode)
    }
  }

  return (
    <div style={{ padding: '0 16px', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        paddingTop: 'max(20px, env(safe-area-inset-top))',
        paddingBottom: 24,
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#C8860A',
            marginBottom: 8,
            fontWeight: 600,
          }}>
            DISPATCH
          </div>
          <div style={{
            fontSize: 26,
            fontWeight: 600,
            fontFamily: "'Playfair Display', serif",
            color: 'white',
            marginBottom: 6,
          }}>
            Historical Drama
          </div>
          <div style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
            fontStyle: 'italic',
          }}>
            History speaks. You decide what happens next.
          </div>
        </motion.div>
      </div>

      {/* Story cards */}
      {STORIES.map((story, i) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
        >
          <StoryCard story={story} onPlay={handlePlay} />
        </motion.div>
      ))}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '24px 0',
        color: 'rgba(255,255,255,0.2)',
        fontSize: 11,
        letterSpacing: '0.08em',
      }}>
        More stories coming soon
      </div>
    </div>
  )
}
