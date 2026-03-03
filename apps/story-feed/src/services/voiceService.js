class VoiceService {
  constructor() {
    this.audio = new Audio()
    this.audio.preload = 'none'
    this.enabled = localStorage.getItem('storyVoiceEnabled') !== 'false'
  }

  async speak(text, voiceId) {
    if (!this.enabled) return
    this.stop()

    try {
      const response = await fetch('/api/story/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 1000),
          voiceId: voiceId || 'EXAVITQu4vr4xnSDxMaL'
        })
      })

      if (!response.ok) return

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      this.audio = new Audio(url)
      this.audio.preload = 'auto'
      await this.audio.play()
    } catch (err) {
      console.error('Voice error:', err)
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
    }
  }

  toggle() {
    this.enabled = !this.enabled
    localStorage.setItem('storyVoiceEnabled', this.enabled)
    if (!this.enabled) this.stop()
    return this.enabled
  }
}

export const voiceService = new VoiceService()
