import StoryFeed from './components/StoryFeed'
import EpisodePlayer from './components/EpisodePlayer'
import useStoryStore from './store/useStoryStore'

export default function App() {
  const { activeStory, activeEpisode } = useStoryStore()

  return (
    <div style={{
      backgroundColor: '#000',
      minHeight: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
      position: 'relative',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {activeStory && activeEpisode
        ? <EpisodePlayer />
        : <StoryFeed />
      }
    </div>
  )
}
