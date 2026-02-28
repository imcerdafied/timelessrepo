import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const screens = [
  {
    title: 'Every place has a past.',
    body: 'Timeless Moment lets you explore any location across its entire history\u00a0\u2014 from ancient origins to possible futures.',
  },
  {
    title: 'Scrub through time.',
    body: 'Every location spans from indigenous history to 2075 climate futures. Tap any era to enter it.',
    showRibbon: true,
  },
  {
    title: 'Leave your mark.',
    body: 'Drop an artifact at any era. Vote on the future. The more people participate, the more the futures shift.',
    isFinal: true,
  },
]

const ribbonEras = [
  { label: 'c. 1500', type: 'past' },
  { label: '1834', type: 'past' },
  { label: '1906', type: 'past' },
  { label: '1945', type: 'past' },
  { label: '1967', type: 'past' },
  { label: '2001', type: 'past' },
  { label: '2025', type: 'present' },
  { label: '2075', type: 'future' },
]

const eraColor = {
  past: '#C8860A',
  present: '#F5F5F5',
  future: '#1E4D8C',
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [ribbonActive, setRibbonActive] = useState(0)

  const screen = screens[step]

  const advance = () => {
    if (step < screens.length - 1) {
      setStep(step + 1)
    }
  }

  const finish = () => {
    localStorage.setItem('onboarding_complete', 'true')
    onComplete()
  }

  // Animate ribbon demo
  const handleRibbonTap = (i) => {
    setRibbonActive(i)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex h-full w-full max-w-[390px] flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="flex w-full flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Title */}
            <h1 className="font-heading text-3xl font-semibold leading-tight text-present">
              {screen.title}
            </h1>

            {/* Body */}
            <p className="mt-4 font-ui text-sm leading-relaxed text-present/50">
              {screen.body}
            </p>

            {/* Ribbon preview for screen 2 */}
            {screen.showRibbon && (
              <div className="mt-8 flex items-center gap-4 overflow-x-auto px-2 py-4">
                {ribbonEras.map((era, i) => {
                  const isActive = i === ribbonActive
                  const color = eraColor[era.type]
                  return (
                    <button
                      key={i}
                      onClick={() => handleRibbonTap(i)}
                      className="flex shrink-0 cursor-pointer flex-col items-center bg-transparent border-none outline-none"
                    >
                      <motion.div
                        className="rounded-full"
                        animate={{
                          width: isActive ? 20 : 10,
                          height: isActive ? 20 : 10,
                          backgroundColor: isActive ? color : `${color}66`,
                          boxShadow: isActive ? `0 0 16px 3px ${color}55` : '0 0 0px transparent',
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                      <motion.span
                        className="mt-2 font-mono text-[10px]"
                        animate={{ color: isActive ? color : '#666666' }}
                      >
                        {era.label}
                      </motion.span>
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom area */}
        <div className="absolute bottom-12 flex w-full max-w-[390px] flex-col items-center gap-6 px-8">
          {/* Dot indicators */}
          <div className="flex gap-2">
            {screens.map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full transition-colors"
                style={{ backgroundColor: i === step ? '#C8860A' : '#333333' }}
              />
            ))}
          </div>

          {/* Action button */}
          {screen.isFinal ? (
            <button
              onClick={finish}
              className="w-full cursor-pointer rounded-sm border border-past bg-past/20 py-4 font-ui text-sm font-medium tracking-[0.15em] text-past uppercase transition-colors hover:bg-past/30"
            >
              Begin
            </button>
          ) : (
            <button
              onClick={advance}
              className="w-full cursor-pointer rounded-sm border border-present/20 bg-surface/60 py-4 font-ui text-sm tracking-wide text-present/60 transition-colors hover:bg-surface/80"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
