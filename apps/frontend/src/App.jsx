import ExperienceWindow from './components/ExperienceWindow'
import TemporalRibbon from './components/TemporalRibbon'

function App() {
  return (
    <div className="flex h-dvh items-center justify-center bg-black">
      <div className="relative flex h-full w-full max-w-[390px] flex-col border-x border-border bg-background">
        <div className="relative flex-1 overflow-hidden">
          <ExperienceWindow />
        </div>
        <TemporalRibbon />
      </div>
    </div>
  )
}

export default App
