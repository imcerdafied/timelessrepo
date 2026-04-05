/**
 * Ambient Audio Profiles — Web Audio API soundscape recipes
 *
 * Each profile creates a procedural soundscape appropriate for a resort zone.
 * No external audio files needed — everything is generated from noise + oscillators.
 */

// -- Helper: create colored noise buffer ------------------------------------
function brownNoise(ctx, seconds) {
  const size = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(1, size, ctx.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < size; i++) {
    const w = Math.random() * 2 - 1
    last = (last + 0.02 * w) / 1.02
    data[i] = last * 3.5
  }
  return buf
}

function whiteNoise(ctx, seconds) {
  const size = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(1, size, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < size; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buf
}

function crackleNoise(ctx, seconds) {
  const size = ctx.sampleRate * seconds
  const buf = ctx.createBuffer(1, size, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < size; i++) {
    data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.7 ? 1.0 : 0.15)
  }
  return buf
}

// -- Helper: schedule random events -----------------------------------------
function scheduleRandom(audioCtx, master, minDelay, maxDelay, createSound) {
  let timer = null
  function schedule() {
    const delay = minDelay + Math.random() * (maxDelay - minDelay)
    timer = setTimeout(() => {
      if (audioCtx.state === 'closed') return
      createSound(audioCtx, master)
      schedule()
    }, delay)
  }
  schedule()
  return () => clearTimeout(timer)
}

// ===========================================================================
// PROFILES
// ===========================================================================

const profiles = {

  // -- Ocean: marina-beach zone (waves, seabirds, light wind) ---------------
  ocean(ctx, master) {
    const cleanups = []

    // Ocean waves — brown noise through lowpass with slow LFO for wave rhythm
    const waves = ctx.createBufferSource()
    waves.buffer = brownNoise(ctx, 6)
    waves.loop = true
    const wavesFilter = ctx.createBiquadFilter()
    wavesFilter.type = 'lowpass'
    wavesFilter.frequency.value = 500
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.1  // slow wave rhythm
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 250
    lfo.connect(lfoGain)
    lfoGain.connect(wavesFilter.frequency)
    lfo.start()
    const wavesGain = ctx.createGain()
    wavesGain.gain.value = 0.45
    waves.connect(wavesFilter)
    wavesFilter.connect(wavesGain)
    wavesGain.connect(master)
    waves.start()

    // Distant seabirds — random high sine chirps
    cleanups.push(scheduleRandom(ctx, master, 6000, 18000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'sine'
      const freq = 2000 + Math.random() * 2200
      osc.frequency.setValueAtTime(freq, c.currentTime)
      osc.frequency.exponentialRampToValueAtTime(freq * (0.6 + Math.random() * 0.5), c.currentTime + 0.35)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.1, c.currentTime + 0.5)
      const g = c.createGain()
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.03, c.currentTime + 0.04)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.7)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 0.8)
    }))

    // Light wind — bandpass brown noise
    const wind = ctx.createBufferSource()
    wind.buffer = brownNoise(ctx, 5)
    wind.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 400
    windFilter.Q.value = 0.3
    const windGain = ctx.createGain()
    windGain.gain.value = 0.15
    wind.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(master)
    wind.start()

    return () => {
      cleanups.forEach(fn => fn())
      try { waves.stop() } catch {}
      try { lfo.stop() } catch {}
      try { wind.stop() } catch {}
    }
  },

  // -- Lobby: lobby-royal-towers zone (room tone, fountain, piano) ----------
  lobby(ctx, master) {
    const cleanups = []

    // Reverberant room tone — very low brown noise
    const room = ctx.createBufferSource()
    room.buffer = brownNoise(ctx, 5)
    room.loop = true
    const roomFilter = ctx.createBiquadFilter()
    roomFilter.type = 'lowpass'
    roomFilter.frequency.value = 120
    const roomGain = ctx.createGain()
    roomGain.gain.value = 0.12
    room.connect(roomFilter)
    roomFilter.connect(roomGain)
    roomGain.connect(master)
    room.start()

    // Fountain water — high-freq white noise bandpass
    const fountain = ctx.createBufferSource()
    fountain.buffer = whiteNoise(ctx, 4)
    fountain.loop = true
    const fountainFilter = ctx.createBiquadFilter()
    fountainFilter.type = 'bandpass'
    fountainFilter.frequency.value = 3500
    fountainFilter.Q.value = 0.8
    const fountainGain = ctx.createGain()
    fountainGain.gain.value = 0.06
    fountain.connect(fountainFilter)
    fountainFilter.connect(fountainGain)
    fountainGain.connect(master)
    fountain.start()

    // Occasional soft piano notes — random from C-B scale, sine with decay
    const pianoNotes = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9] // C4-B4
    cleanups.push(scheduleRandom(ctx, master, 3000, 8000, (c, m) => {
      const freq = pianoNotes[Math.floor(Math.random() * pianoNotes.length)]
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      // Add a second harmonic for richer tone
      const osc2 = c.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.value = freq * 2
      const g = c.createGain()
      g.gain.setValueAtTime(0.04, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2)
      const g2 = c.createGain()
      g2.gain.setValueAtTime(0.015, c.currentTime)
      g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2)
      osc.connect(g)
      osc2.connect(g2)
      g.connect(m)
      g2.connect(m)
      osc.start()
      osc2.start()
      osc.stop(c.currentTime + 2.5)
      osc2.stop(c.currentTime + 1.5)
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { room.stop() } catch {}
      try { fountain.stop() } catch {}
    }
  },

  // -- Waterpark: waterpark-pools zone (splashing, waterfall, laughter) ------
  waterpark(ctx, master) {
    const cleanups = []

    // Splashing water — bandpass white noise
    const splash = ctx.createBufferSource()
    splash.buffer = whiteNoise(ctx, 4)
    splash.loop = true
    const splashFilter = ctx.createBiquadFilter()
    splashFilter.type = 'bandpass'
    splashFilter.frequency.value = 2000
    splashFilter.Q.value = 0.5
    const splashGain = ctx.createGain()
    splashGain.gain.value = 0.1
    splash.connect(splashFilter)
    splashFilter.connect(splashGain)
    splashGain.connect(master)
    splash.start()

    // Waterfall rush — lowpass brown noise
    const waterfall = ctx.createBufferSource()
    waterfall.buffer = brownNoise(ctx, 6)
    waterfall.loop = true
    const waterfallFilter = ctx.createBiquadFilter()
    waterfallFilter.type = 'lowpass'
    waterfallFilter.frequency.value = 350
    const waterfallGain = ctx.createGain()
    waterfallGain.gain.value = 0.35
    waterfall.connect(waterfallFilter)
    waterfallFilter.connect(waterfallGain)
    waterfallGain.connect(master)
    waterfall.start()

    // Distant laughter — random short bright triangle wave bursts
    cleanups.push(scheduleRandom(ctx, master, 4000, 12000, (c, m) => {
      const numBursts = 2 + Math.floor(Math.random() * 3)
      for (let i = 0; i < numBursts; i++) {
        const t = c.currentTime + i * (0.12 + Math.random() * 0.08)
        const osc = c.createOscillator()
        osc.type = 'triangle'
        const freq = 600 + Math.random() * 800
        osc.frequency.setValueAtTime(freq, t)
        osc.frequency.exponentialRampToValueAtTime(freq * (1.2 + Math.random() * 0.4), t + 0.08)
        const g = c.createGain()
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.025, t + 0.02)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
        osc.connect(g)
        g.connect(m)
        osc.start(t)
        osc.stop(t + 0.15)
      }
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { splash.stop() } catch {}
      try { waterfall.stop() } catch {}
    }
  },

  // -- Casino: casino-nightlife zone (room murmur, slot chimes, ice clink) --
  casino(ctx, master) {
    const cleanups = []

    // Room murmur — bandpass brown noise
    const murmur = ctx.createBufferSource()
    murmur.buffer = brownNoise(ctx, 5)
    murmur.loop = true
    const murmurFilter = ctx.createBiquadFilter()
    murmurFilter.type = 'bandpass'
    murmurFilter.frequency.value = 500
    murmurFilter.Q.value = 0.3
    const murmurGain = ctx.createGain()
    murmurGain.gain.value = 0.2
    murmur.connect(murmurFilter)
    murmurFilter.connect(murmurGain)
    murmurGain.connect(master)
    murmur.start()

    // Slot machine chimes — random bright sine tones from high-C scale
    const chimeNotes = [1046.5, 1174.7, 1318.5, 1396.9, 1568.0, 1760.0, 1975.5] // C6-B6
    cleanups.push(scheduleRandom(ctx, master, 1500, 5000, (c, m) => {
      const numChimes = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < numChimes; i++) {
        const t = c.currentTime + i * 0.12
        const freq = chimeNotes[Math.floor(Math.random() * chimeNotes.length)]
        const osc = c.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq
        const g = c.createGain()
        g.gain.setValueAtTime(0.03, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
        osc.connect(g)
        g.connect(m)
        osc.start(t)
        osc.stop(t + 0.5)
      }
    }))

    // Ice in glass — short crackle bursts
    cleanups.push(scheduleRandom(ctx, master, 6000, 16000, (c, m) => {
      const buf = crackleNoise(c, 0.12)
      const src = c.createBufferSource()
      src.buffer = buf
      const f = c.createBiquadFilter()
      f.type = 'highpass'
      f.frequency.value = 3000
      const g = c.createGain()
      g.gain.setValueAtTime(0.04, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)
      src.connect(f)
      f.connect(g)
      g.connect(m)
      src.start()
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { murmur.stop() } catch {}
    }
  },

  // -- Underwater: marine-habitat zone (drone, bubbles, rumble, whale) ------
  underwater(ctx, master) {
    const cleanups = []

    // Deep underwater drone — 55Hz sine
    const drone = ctx.createOscillator()
    drone.type = 'sine'
    drone.frequency.value = 55
    const droneGain = ctx.createGain()
    droneGain.gain.value = 0.12
    drone.connect(droneGain)
    droneGain.connect(master)
    drone.start()

    // Bubble sounds — rising frequency sine chirps
    cleanups.push(scheduleRandom(ctx, master, 2000, 7000, (c, m) => {
      const numBubbles = 2 + Math.floor(Math.random() * 4)
      for (let i = 0; i < numBubbles; i++) {
        const t = c.currentTime + i * (0.1 + Math.random() * 0.15)
        const osc = c.createOscillator()
        osc.type = 'sine'
        const startFreq = 200 + Math.random() * 300
        osc.frequency.setValueAtTime(startFreq, t)
        osc.frequency.exponentialRampToValueAtTime(startFreq * (2 + Math.random() * 2), t + 0.15)
        const g = c.createGain()
        g.gain.setValueAtTime(0.025, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
        osc.connect(g)
        g.connect(m)
        osc.start(t)
        osc.stop(t + 0.2)
      }
    }))

    // Filtered ocean rumble — very low brown noise
    const rumble = ctx.createBufferSource()
    rumble.buffer = brownNoise(ctx, 6)
    rumble.loop = true
    const rumbleFilter = ctx.createBiquadFilter()
    rumbleFilter.type = 'lowpass'
    rumbleFilter.frequency.value = 80
    const rumbleGain = ctx.createGain()
    rumbleGain.gain.value = 0.35
    rumble.connect(rumbleFilter)
    rumbleFilter.connect(rumbleGain)
    rumbleGain.connect(master)
    rumble.start()

    // Occasional whale-like tones — slow descending sine with fade
    cleanups.push(scheduleRandom(ctx, master, 12000, 30000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'sine'
      const startFreq = 300 + Math.random() * 200
      osc.frequency.setValueAtTime(startFreq, c.currentTime)
      osc.frequency.exponentialRampToValueAtTime(startFreq * 0.4, c.currentTime + 3)
      const g = c.createGain()
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.04, c.currentTime + 0.5)
      g.gain.setValueAtTime(0.04, c.currentTime + 1.5)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 3.5)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 4)
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { drone.stop() } catch {}
      try { rumble.stop() } catch {}
    }
  },
}

// ===========================================================================
// ZONE -> PROFILE MAPPING
// ===========================================================================

const ZONE_PROFILES = {
  'marina-beach': 'ocean',
  'lobby-royal-towers': 'lobby',
  'waterpark-pools': 'waterpark',
  'casino-nightlife': 'casino',
  'marine-habitat': 'underwater',
}

/**
 * Get the ambient profile name for an era ID.
 * Extracts zone from era ID by checking which zone prefix it starts with.
 */
export function getAmbientProfile(eraId) {
  for (const [zone, profile] of Object.entries(ZONE_PROFILES)) {
    if (eraId.startsWith(zone)) return profile
  }
  // Default fallback
  return 'ocean'
}

/**
 * Start an ambient soundscape for a given profile name.
 * Returns { master, stop } — call stop() to clean up.
 */
export function startAmbient(profileName) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  const profileFn = profiles[profileName] || profiles.ocean
  const cleanup = profileFn(ctx, master)

  // Fade in
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 3)

  return {
    ctx,
    master,
    stop: () => {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
      cleanup()
      setTimeout(() => {
        try { ctx.close() } catch {}
      }, 2500)
    },
    setVolume: (vol, rampTime = 1) => {
      master.gain.linearRampToValueAtTime(vol, ctx.currentTime + rampTime)
    },
  }
}

export default profiles
