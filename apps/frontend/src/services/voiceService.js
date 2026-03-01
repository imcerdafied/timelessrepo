class VoiceService {
  constructor() {
    this.audio = new Audio()
    this.audio.preload = 'none'
    this.enabled = localStorage.getItem('characterVoiceEnabled') !== 'false'
  }

  async speak(text, eraId) {
    if (!this.enabled) return
    this.stop()

    try {
      // Build URL with query params so Audio src can load it directly
      // This works on iOS Safari because we set src before play()
      const params = new URLSearchParams({
        text: text.slice(0, 500),
        eraId: eraId || 'alamo-1834'
      })

      this.audio = new Audio(`/api/character/speak-stream?${params}`)
      this.audio.preload = 'auto'

      // iOS Safari requires play() to be called, then it loads
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
    localStorage.setItem('characterVoiceEnabled', this.enabled)
    if (!this.enabled) this.stop()
    return this.enabled
  }
}

export const voiceService = new VoiceService()
