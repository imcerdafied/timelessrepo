class VoiceService {
  constructor() {
    this.currentAudio = null
    this.enabled = localStorage.getItem('characterVoiceEnabled') !== 'false'
  }

  async speak(text, eraId) {
    if (!this.enabled) return

    // Stop any currently playing voice
    this.stop()

    const { ERA_CHARACTER_VOICES } = await import('../data/character-voices.js')
    const voiceId = ERA_CHARACTER_VOICES[eraId] || 'pNInz6obpgDQGcFmaJgB'

    try {
      const response = await fetch('/api/character/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId })
      })

      if (!response.ok) throw new Error('Voice request failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      this.currentAudio = new Audio(url)
      this.currentAudio.onended = () => URL.revokeObjectURL(url)
      await this.currentAudio.play()
    } catch (err) {
      console.error('Voice playback error:', err)
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }
  }

  toggle() {
    this.enabled = !this.enabled
    localStorage.setItem('characterVoiceEnabled', this.enabled)
    if (!this.enabled) this.stop()
    return this.enabled
  }
}

export const voiceService = new VoiceService()
