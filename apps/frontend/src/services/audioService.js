const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

// Layer 1: Ambient soundscapes (nature, city sounds)
const ERA_AMBIENT = {
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

// Layer 2: Era music (Suno-generated, public domain, or Spotify)
// Add entries here as music files are uploaded to Supabase
// Spotify entries use { type: 'spotify', uri: '...' }
// File entries use { type: 'file', url: '...' }
const ERA_MUSIC = {
  // Alamo — add as Suno files are generated and uploaded
  // 'alamo-1834': { type: 'file', url: `${SUPABASE_URL}/storage/v1/object/public/era-audio/alamo-1834-music.mp3` },

  // High-priority Spotify entries — these work immediately
  // once Spotify embed support is added (Phase 2)
  // 'sf-haight-summer': { type: 'spotify', uri: 'spotify:playlist:37i9dQZF1DX4UtSsGT1Sbe' },
  // 'sf-castro-harvey': { type: 'spotify', uri: 'spotify:playlist:37i9dQZF1DXaXB8fQg7xof' },
  // 'lagos-2025': { type: 'spotify', uri: 'spotify:playlist:37i9dQZF1DX4JAvHpjipBk' },
  // 'nyc-1977': { type: 'spotify', uri: 'spotify:playlist:37i9dQZF1DX0XUfTFmNBRM' },
  // 'paris-montmartre-2001': { type: 'spotify', uri: 'spotify:album:5dqC4MoaeHqicPBTaAMFpR' },
}

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

    // Start Layer 1 — ambient
    if (ERA_AMBIENT[eraId]) {
      this.ambientAudio = await this._createAudio(
        ERA_AMBIENT[eraId],
        this.AMBIENT_VOLUME
      )
    }

    // Start Layer 2 — music
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
