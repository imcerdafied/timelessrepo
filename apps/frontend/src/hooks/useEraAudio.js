import { useState, useEffect } from 'react'
import { audioService } from '../services/audioService'

export function useEraAudio(era) {
  const [audioEnabled, setAudioEnabled] = useState(
    audioService.enabled
  )
  const [hasAudio, setHasAudio] = useState(false)

  useEffect(() => {
    if (!era?.id) return
    setHasAudio(audioService.hasAudio(era.id))

    if (audioService.enabled) {
      audioService.play(era.id)
    }

    return () => {
      // Don't stop on era change — fadeOut handles it
    }
  }, [era?.id])

  const toggle = () => {
    const next = !audioEnabled
    setAudioEnabled(next)
    audioService.setEnabled(next)

    if (next && era?.id) {
      audioService.play(era.id)
    }
  }

  return { audioEnabled, hasAudio, toggle }
}
