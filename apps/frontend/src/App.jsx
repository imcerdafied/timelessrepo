import ExperienceWindow from './components/ExperienceWindow'
import TemporalRibbon from './components/TemporalRibbon'

function App() {
  return (
    <div className="flex h-dvh flex-col bg-background">
      <div className="relative flex-1 overflow-hidden">
        <ExperienceWindow />
      </div>
      <TemporalRibbon />
    </div>
  )
}

export default App
