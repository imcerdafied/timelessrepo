const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// Layer 1: Ambient soundscapes, add entries as audio files are uploaded
const ERA_AMBIENT = {}

// Layer 2: Era music, add entries as music files are uploaded
const ERA_MUSIC = {}

class AudioService {
  constructor() {
    this.ambientAudio = null
    this.musicAudio = null
    this.currentEraId = null
    this.enabled = localStorage.getItem('audio_enabled') === 'true'
    this.AMBIENT_VOLUME = 0.55
    this.MUSIC_VOLUME = 0.35
  }

  hasAudio(eraId) {
    return !!(ERA_AMBIENT[eraId] || ERA_MUSIC[eraId])
  }

  hasMusic(eraId) {
    return !!ERA_MUSIC[eraId]
  }

  async play(eraId) {
    if (!this.enabled) return
    if (this.currentEraId === eraId) return

    this.currentEraId = eraId

    // Fade out and stop both current layers
    await Promise.all([
      this._fadeOut(this.ambientAudio),
      this._fadeOut(this.musicAudio)
    ])
    this.ambientAudio = null
    this.musicAudio = null

    // Start Layer 1, ambient
    if (ERA_AMBIENT[eraId]) {
      this.ambientAudio = await this._createAudio(
        ERA_AMBIENT[eraId],
        this.AMBIENT_VOLUME
      )
    }

    // Start Layer 2, music
    const music = ERA_MUSIC[eraId]
    if (music && music.type === 'file') {
      this.musicAudio = await this._createAudio(
        music.url,
        this.MUSIC_VOLUME
      )
    }
    // Spotify handled separately via SpotifyEmbed component
  }

  async _createAudio(url, targetVolume) {
    const audio = new Audio(url)
    audio.loop = true
    audio.volume = 0
    audio.preload = 'auto'

    try {
      await audio.play()
      this._fadeIn(audio, targetVolume)
      return audio
    } catch (err) {
      console.log('Audio autoplay blocked:', err)
      return audio
    }
  }

  _fadeIn(audio, targetVolume) {
    const steps = 20
    const step = targetVolume / steps
    let count = 0
    const interval = setInterval(() => {
      count++
      if (!audio || count >= steps) {
        if (audio) audio.volume = targetVolume
        clearInterval(interval)
      } else {
        audio.volume = Math.min(targetVolume, audio.volume + step)
      }
    }, 50)
  }

  _fadeOut(audio) {
    return new Promise(resolve => {
      if (!audio) return resolve()
      const steps = 20
      const step = audio.volume / steps
      let count = 0
      const interval = setInterval(() => {
        count++
        if (count >= steps || audio.volume <= 0) {
          audio.pause()
          audio.src = ''
          clearInterval(interval)
          resolve()
        } else {
          audio.volume = Math.max(0, audio.volume - step)
        }
      }, 50)
    })
  }

  stop() {
    Promise.all([
      this._fadeOut(this.ambientAudio),
      this._fadeOut(this.musicAudio)
    ])
    this.ambientAudio = null
    this.musicAudio = null
    this.currentEraId = null
  }

  setEnabled(enabled) {
    this.enabled = enabled
    localStorage.setItem('audio_enabled', enabled.toString())
    if (!enabled) this.stop()
  }

  setAmbientVolume(vol) {
    this.AMBIENT_VOLUME = vol
    if (this.ambientAudio) this.ambientAudio.volume = vol
  }

  setMusicVolume(vol) {
    this.MUSIC_VOLUME = vol
    if (this.musicAudio) this.musicAudio.volume = vol
  }
}

// Singleton
export const audioService = new AudioService()
