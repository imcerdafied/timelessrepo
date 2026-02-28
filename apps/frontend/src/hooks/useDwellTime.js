import { useState, useEffect, useRef } from 'react'
import { DWELL_TIME_SECONDS } from '../data/era-characters'

export function useDwellTime(eraId, enabled = true) {
  const [dwellMet, setDwellMet] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    // Reset when era changes
    setDwellMet(false)
    setSecondsElapsed(0)

    if (!eraId || !enabled) return

    // Check if character was already dismissed this session
    const dismissed = sessionStorage.getItem(`char_dismissed_${eraId}`)
    if (dismissed) return

    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      )
      setSecondsElapsed(elapsed)

      if (elapsed >= DWELL_TIME_SECONDS) {
        setDwellMet(true)
        clearInterval(timerRef.current)
      }
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [eraId, enabled])

  const dismiss = () => {
    sessionStorage.setItem(`char_dismissed_${eraId}`, 'true')
    setDwellMet(false)
  }

  return { dwellMet, secondsElapsed, dismiss }
}
