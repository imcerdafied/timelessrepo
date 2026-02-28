const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// Curated audio map — era-id → Supabase Storage URL
// Add entries here as audio files are uploaded
const ERA_AUDIO = {
  // Alamo
  'alamo-1500': `${SUPABASE_URL}/storage/v1/object/public/era-audio/alamo-1500.mp3`,
  'alamo-1834': `${SUPABASE_URL}/storage/v1/object/public/era-audio/alamo-1834.mp3`,
  'alamo-1856': `${SUPABASE_URL}/storage/v1/object/public/era-audio/alamo-1856.mp3`,
  'alamo-1900': `${SUPABASE_URL}/storage/v1/object/public/era-audio/alamo-1900.mp3`,
  'alamo-1950': `${SUPABASE_URL}/storage/v1/object/public/era-audio/alamo-1950.mp3`,
  'alamo-1980': `${SUPABASE_URL}/storage/v1/object/public/era-audio/alamo-1980.mp3`,
  'alamo-2001': `${SUPABASE_URL}/storage/v1/object/public/era-audio/alamo-2001.mp3`,
  'alamo-2025': `${SUPABASE_URL}/storage/v1/object/public/era-audio/alamo-2025.mp3`,
  'alamo-2075': `${SUPABASE_URL}/storage/v1/object/public/era-audio/alamo-2075.mp3`,
}

class AudioService {
  constructor() {
    this.audio = null
    this.currentEraId = null
    this.enabled = localStorage.getItem('audio_enabled') === 'true'
    this.volume = 0.6
  }

  hasAudio(eraId) {
    return !!ERA_AUDIO[eraId]
  }

  async play(eraId) {
    if (!this.enabled) return
    if (this.currentEraId === eraId) return
    if (!ERA_AUDIO[eraId]) return

    await this.fadeOut()

    this.currentEraId = eraId
    this.audio = new Audio(ERA_AUDIO[eraId])
    this.audio.loop = true
    this.audio.volume = 0
    this.audio.preload = 'auto'

    try {
      await this.audio.play()
      this.fadeIn()
    } catch (err) {
      // Autoplay blocked — wait for user gesture
      console.log('Audio autoplay blocked:', err)
    }
  }

  fadeIn() {
    if (!this.audio) return
    const target = this.volume
    const step = target / 20
    const interval = setInterval(() => {
      if (!this.audio) return clearInterval(interval)
      if (this.audio.volume >= target - step) {
        this.audio.volume = target
        clearInterval(interval)
      } else {
        this.audio.volume = Math.min(target, this.audio.volume + step)
      }
    }, 50)
  }

  fadeOut() {
    return new Promise(resolve => {
      if (!this.audio) return resolve()
      const current = this.audio
      const step = current.volume / 20
      const interval = setInterval(() => {
        if (current.volume <= step) {
          current.pause()
          current.src = ''
          clearInterval(interval)
          resolve()
        } else {
          current.volume = Math.max(0, current.volume - step)
        }
      }, 50)
    })
  }

  stop() {
    this.fadeOut()
    this.currentEraId = null
  }

  setEnabled(enabled) {
    this.enabled = enabled
    localStorage.setItem('audio_enabled', enabled.toString())
    if (!enabled) this.stop()
  }

  setVolume(vol) {
    this.volume = vol
    if (this.audio) this.audio.volume = vol
  }
}

// Singleton
export const audioService = new AudioService()
