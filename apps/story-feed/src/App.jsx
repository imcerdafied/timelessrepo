import { useEffect } from 'react'
import EpisodePlayer from './components/EpisodePlayer'
import useStoryStore from './store/useStoryStore'
import { STORIES } from './data/stories'
import { track } from './services/analytics'

export default function App() {
  const { activeStory, activeEpisode, setActiveStory, setActiveEpisode } = useStoryStore()

  // Load directly into Episode 1
  useEffect(() => {
    if (!activeStory || !activeEpisode) {
      const story = STORIES[0]
      const firstEpisode = story.episodes.find(e => e.number === 1)
      if (story && firstEpisode) {
        setActiveStory(story)
        setActiveEpisode(firstEpisode)
        track('dispatch_story_opened', { story_id: story.id })
      }
    }
  }, [])

  if (!activeStory || !activeEpisode) return null

  return (
    <div style={{
      backgroundColor: '#000',
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '390px',
        height: '100dvh',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '1px solid #222',
        borderRight: '1px solid #222',
      }}>
        <EpisodePlayer />
      </div>
    </div>
  )
}
