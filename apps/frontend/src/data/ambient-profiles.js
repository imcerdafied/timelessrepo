/**
 * Ambient Audio Profiles — Web Audio API soundscape recipes
 *
 * Each profile creates a procedural soundscape appropriate for a historical era.
 * No external audio files needed — everything is generated from noise + oscillators.
 */

// ── Helper: create colored noise buffer ─────────────────────────────
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

// ── Helper: schedule random events ──────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════
// PROFILES
// ═══════════════════════════════════════════════════════════════════

const profiles = {

  // ── Nature: forests, pre-colonial Americas ────────────────────────
  nature(ctx, master) {
    const cleanups = []

    // Wind through trees
    const wind = ctx.createBufferSource()
    wind.buffer = brownNoise(ctx, 5)
    wind.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 350
    windFilter.Q.value = 0.4
    const windGain = ctx.createGain()
    windGain.gain.value = 0.3
    wind.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(master)
    wind.start()

    // Creek / water trickle
    const creek = ctx.createBufferSource()
    creek.buffer = whiteNoise(ctx, 3)
    creek.loop = true
    const creekFilter = ctx.createBiquadFilter()
    creekFilter.type = 'bandpass'
    creekFilter.frequency.value = 2500
    creekFilter.Q.value = 1.5
    const creekGain = ctx.createGain()
    creekGain.gain.value = 0.06
    creek.connect(creekFilter)
    creekFilter.connect(creekGain)
    creekGain.connect(master)
    creek.start()

    // Bird calls — random high-pitched tones
    cleanups.push(scheduleRandom(ctx, master, 4000, 12000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'sine'
      const freq = 1800 + Math.random() * 2000
      osc.frequency.setValueAtTime(freq, c.currentTime)
      osc.frequency.exponentialRampToValueAtTime(freq * (0.7 + Math.random() * 0.6), c.currentTime + 0.3)
      const g = c.createGain()
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.04, c.currentTime + 0.05)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 0.5)
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { wind.stop() } catch {}
      try { creek.stop() } catch {}
    }
  },

  // ── Ocean: coastal pre-colonial, ports ────────────────────────────
  ocean(ctx, master) {
    const cleanups = []

    // Waves — modulated brown noise
    const waves = ctx.createBufferSource()
    waves.buffer = brownNoise(ctx, 6)
    waves.loop = true
    const wavesFilter = ctx.createBiquadFilter()
    wavesFilter.type = 'lowpass'
    wavesFilter.frequency.value = 500
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.12  // slow wave rhythm
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 200
    lfo.connect(lfoGain)
    lfoGain.connect(wavesFilter.frequency)
    lfo.start()
    const wavesGain = ctx.createGain()
    wavesGain.gain.value = 0.45
    waves.connect(wavesFilter)
    wavesFilter.connect(wavesGain)
    wavesGain.connect(master)
    waves.start()

    // High surf hiss
    const hiss = ctx.createBufferSource()
    hiss.buffer = whiteNoise(ctx, 4)
    hiss.loop = true
    const hissFilter = ctx.createBiquadFilter()
    hissFilter.type = 'highpass'
    hissFilter.frequency.value = 3000
    const hissGain = ctx.createGain()
    hissGain.gain.value = 0.08
    hiss.connect(hissFilter)
    hissFilter.connect(hissGain)
    hissGain.connect(master)
    hiss.start()

    // Gulls
    cleanups.push(scheduleRandom(ctx, master, 8000, 20000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(2200, c.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1600, c.currentTime + 0.4)
      osc.frequency.exponentialRampToValueAtTime(2400, c.currentTime + 0.6)
      const g = c.createGain()
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.03, c.currentTime + 0.05)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 1)
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { waves.stop() } catch {}
      try { hiss.stop() } catch {}
      try { lfo.stop() } catch {}
    }
  },

  // ── Desert: wind, emptiness, vast ─────────────────────────────────
  desert(ctx, master) {
    const cleanups = []

    // Deep wind
    const wind = ctx.createBufferSource()
    wind.buffer = brownNoise(ctx, 6)
    wind.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 200
    windFilter.Q.value = 0.3
    const windGain = ctx.createGain()
    windGain.gain.value = 0.4
    wind.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(master)
    wind.start()

    // High wind whistle
    const whistle = ctx.createBufferSource()
    whistle.buffer = whiteNoise(ctx, 4)
    whistle.loop = true
    const whistleFilter = ctx.createBiquadFilter()
    whistleFilter.type = 'bandpass'
    whistleFilter.frequency.value = 1200
    whistleFilter.Q.value = 3
    const whistleGain = ctx.createGain()
    whistleGain.gain.value = 0.04
    whistle.connect(whistleFilter)
    whistleFilter.connect(whistleGain)
    whistleGain.connect(master)
    whistle.start()

    // Sand movement — very faint crackle
    const sand = ctx.createBufferSource()
    sand.buffer = crackleNoise(ctx, 3)
    sand.loop = true
    const sandFilter = ctx.createBiquadFilter()
    sandFilter.type = 'highpass'
    sandFilter.frequency.value = 4000
    const sandGain = ctx.createGain()
    sandGain.gain.value = 0.02
    sand.connect(sandFilter)
    sandFilter.connect(sandGain)
    sandGain.connect(master)
    sand.start()

    return () => {
      cleanups.forEach(fn => fn())
      try { wind.stop() } catch {}
      try { whistle.stop() } catch {}
      try { sand.stop() } catch {}
    }
  },

  // ── Fire: earthquakes, great fires, conflagrations ────────────────
  fire(ctx, master) {
    const cleanups = []

    // Base rumble
    const rumble = ctx.createBufferSource()
    rumble.buffer = brownNoise(ctx, 4)
    rumble.loop = true
    const rumbleFilter = ctx.createBiquadFilter()
    rumbleFilter.type = 'lowpass'
    rumbleFilter.frequency.value = 120
    const rumbleGain = ctx.createGain()
    rumbleGain.gain.value = 0.6
    rumble.connect(rumbleFilter)
    rumbleFilter.connect(rumbleGain)
    rumbleGain.connect(master)
    rumble.start()

    // Fire crackle
    const crackle = ctx.createBufferSource()
    crackle.buffer = crackleNoise(ctx, 3)
    crackle.loop = true
    const crackleFilter = ctx.createBiquadFilter()
    crackleFilter.type = 'bandpass'
    crackleFilter.frequency.value = 3000
    crackleFilter.Q.value = 0.8
    const crackleGain = ctx.createGain()
    crackleGain.gain.value = 0.15
    crackle.connect(crackleFilter)
    crackleFilter.connect(crackleGain)
    crackleGain.connect(master)
    crackle.start()

    // Wind / smoke
    const wind = ctx.createBufferSource()
    wind.buffer = brownNoise(ctx, 5)
    wind.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 400
    windFilter.Q.value = 0.5
    const windGain = ctx.createGain()
    windGain.gain.value = 0.25
    wind.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(master)
    wind.start()

    // Wood creaking
    cleanups.push(scheduleRandom(ctx, master, 6000, 18000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'sawtooth'
      const f = 60 + Math.random() * 80
      osc.frequency.setValueAtTime(f, c.currentTime)
      osc.frequency.exponentialRampToValueAtTime(f * 0.3, c.currentTime + 0.8)
      const g = c.createGain()
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.06, c.currentTime + 0.1)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2)
      const filter = c.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 200
      filter.Q.value = 2
      osc.connect(filter)
      filter.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 1.5)
    }))

    // Distant shouts
    cleanups.push(scheduleRandom(ctx, master, 10000, 25000, (c, m) => {
      const len = 0.3 + Math.random() * 0.4
      const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / d.length)
      const src = c.createBufferSource()
      src.buffer = buf
      const f = c.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = 800 + Math.random() * 600
      f.Q.value = 3
      const g = c.createGain()
      g.gain.value = 0.03
      src.connect(f)
      f.connect(g)
      g.connect(m)
      src.start()
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { rumble.stop() } catch {}
      try { crackle.stop() } catch {}
      try { wind.stop() } catch {}
    }
  },

  // ── War / Blitz: sirens, distant explosions, aircraft ─────────────
  war(ctx, master) {
    const cleanups = []

    // Low rumble — distant bombardment
    const rumble = ctx.createBufferSource()
    rumble.buffer = brownNoise(ctx, 5)
    rumble.loop = true
    const rumbleFilter = ctx.createBiquadFilter()
    rumbleFilter.type = 'lowpass'
    rumbleFilter.frequency.value = 80
    const rumbleGain = ctx.createGain()
    rumbleGain.gain.value = 0.4
    rumble.connect(rumbleFilter)
    rumbleFilter.connect(rumbleGain)
    rumbleGain.connect(master)
    rumble.start()

    // Wind
    const wind = ctx.createBufferSource()
    wind.buffer = brownNoise(ctx, 4)
    wind.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 300
    windFilter.Q.value = 0.4
    const windGain = ctx.createGain()
    windGain.gain.value = 0.2
    wind.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(master)
    wind.start()

    // Distant explosions
    cleanups.push(scheduleRandom(ctx, master, 8000, 22000, (c, m) => {
      const buf = c.createBuffer(1, c.sampleRate * 1.5, c.sampleRate)
      const d = buf.getChannelData(0)
      let v = 0
      for (let i = 0; i < d.length; i++) {
        v = (v + 0.03 * (Math.random() * 2 - 1)) / 1.03
        d[i] = v * Math.exp(-i / (c.sampleRate * 0.4)) * 8
      }
      const src = c.createBufferSource()
      src.buffer = buf
      const f = c.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = 200
      const g = c.createGain()
      g.gain.value = 0.12
      src.connect(f)
      f.connect(g)
      g.connect(m)
      src.start()
    }))

    // Air raid siren (occasional)
    cleanups.push(scheduleRandom(ctx, master, 20000, 45000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(300, c.currentTime)
      osc.frequency.linearRampToValueAtTime(600, c.currentTime + 2)
      osc.frequency.linearRampToValueAtTime(300, c.currentTime + 4)
      const g = c.createGain()
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.025, c.currentTime + 0.5)
      g.gain.setValueAtTime(0.025, c.currentTime + 3.5)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 5)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 5.5)
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { rumble.stop() } catch {}
      try { wind.stop() } catch {}
    }
  },

  // ── Medieval / Old World: wind, church bells, horses ──────────────
  medieval(ctx, master) {
    const cleanups = []

    // Wind
    const wind = ctx.createBufferSource()
    wind.buffer = brownNoise(ctx, 5)
    wind.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 300
    windFilter.Q.value = 0.4
    const windGain = ctx.createGain()
    windGain.gain.value = 0.25
    wind.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(master)
    wind.start()

    // Distant church bells
    cleanups.push(scheduleRandom(ctx, master, 12000, 30000, (c, m) => {
      const bell = c.createOscillator()
      bell.type = 'sine'
      bell.frequency.value = 523 + Math.random() * 200 // C5-ish
      const g = c.createGain()
      g.gain.setValueAtTime(0.06, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 3)
      // Add overtone
      const bell2 = c.createOscillator()
      bell2.type = 'sine'
      bell2.frequency.value = bell.frequency.value * 2.76 // bell overtone ratio
      const g2 = c.createGain()
      g2.gain.setValueAtTime(0.02, c.currentTime)
      g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5)
      bell.connect(g)
      bell2.connect(g2)
      g.connect(m)
      g2.connect(m)
      bell.start()
      bell2.start()
      bell.stop(c.currentTime + 3.5)
      bell2.stop(c.currentTime + 2)
    }))

    // Horse hooves (distant)
    cleanups.push(scheduleRandom(ctx, master, 15000, 35000, (c, m) => {
      const numClops = 6 + Math.floor(Math.random() * 8)
      for (let i = 0; i < numClops; i++) {
        const t = c.currentTime + i * (0.3 + Math.random() * 0.15)
        const buf = c.createBuffer(1, c.sampleRate * 0.06, c.sampleRate)
        const d = buf.getChannelData(0)
        for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (c.sampleRate * 0.01))
        const src = c.createBufferSource()
        src.buffer = buf
        const f = c.createBiquadFilter()
        f.type = 'bandpass'
        f.frequency.value = 800
        f.Q.value = 2
        const g = c.createGain()
        g.gain.value = 0.04
        src.connect(f)
        f.connect(g)
        g.connect(m)
        src.start(t)
      }
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { wind.stop() } catch {}
    }
  },

  // ── City (Historic): 1800s-1900s, horses, vendors, cobblestones ───
  cityOld(ctx, master) {
    const cleanups = []

    // Street noise base
    const street = ctx.createBufferSource()
    street.buffer = brownNoise(ctx, 5)
    street.loop = true
    const streetFilter = ctx.createBiquadFilter()
    streetFilter.type = 'bandpass'
    streetFilter.frequency.value = 500
    streetFilter.Q.value = 0.3
    const streetGain = ctx.createGain()
    streetGain.gain.value = 0.2
    street.connect(streetFilter)
    streetFilter.connect(streetGain)
    streetGain.connect(master)
    street.start()

    // Horse hooves
    cleanups.push(scheduleRandom(ctx, master, 8000, 18000, (c, m) => {
      const numClops = 8 + Math.floor(Math.random() * 10)
      for (let i = 0; i < numClops; i++) {
        const t = c.currentTime + i * (0.28 + Math.random() * 0.1)
        const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate)
        const d = buf.getChannelData(0)
        for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (c.sampleRate * 0.008))
        const src = c.createBufferSource()
        src.buffer = buf
        const f = c.createBiquadFilter()
        f.type = 'bandpass'
        f.frequency.value = 900
        f.Q.value = 2
        const g = c.createGain()
        g.gain.value = 0.06
        src.connect(f)
        f.connect(g)
        g.connect(m)
        src.start(t)
      }
    }))

    // Distant bell (clock tower / church)
    cleanups.push(scheduleRandom(ctx, master, 20000, 45000, (c, m) => {
      const bell = c.createOscillator()
      bell.type = 'sine'
      bell.frequency.value = 440
      const g = c.createGain()
      g.gain.setValueAtTime(0.04, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5)
      bell.connect(g)
      g.connect(m)
      bell.start()
      bell.stop(c.currentTime + 3)
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { street.stop() } catch {}
    }
  },

  // ── City (Modern): traffic, horns, background chatter ─────────────
  cityModern(ctx, master) {
    const cleanups = []

    // Traffic hum
    const traffic = ctx.createBufferSource()
    traffic.buffer = brownNoise(ctx, 5)
    traffic.loop = true
    const trafficFilter = ctx.createBiquadFilter()
    trafficFilter.type = 'lowpass'
    trafficFilter.frequency.value = 250
    const trafficGain = ctx.createGain()
    trafficGain.gain.value = 0.35
    traffic.connect(trafficFilter)
    trafficFilter.connect(trafficGain)
    trafficGain.connect(master)
    traffic.start()

    // Background chatter — filtered noise
    const chatter = ctx.createBufferSource()
    chatter.buffer = whiteNoise(ctx, 4)
    chatter.loop = true
    const chatterFilter = ctx.createBiquadFilter()
    chatterFilter.type = 'bandpass'
    chatterFilter.frequency.value = 1500
    chatterFilter.Q.value = 0.5
    const chatterGain = ctx.createGain()
    chatterGain.gain.value = 0.04
    chatter.connect(chatterFilter)
    chatterFilter.connect(chatterGain)
    chatterGain.connect(master)
    chatter.start()

    // Car horns
    cleanups.push(scheduleRandom(ctx, master, 8000, 20000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'square'
      osc.frequency.value = 340 + Math.random() * 120
      const g = c.createGain()
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.03, c.currentTime + 0.02)
      const dur = 0.15 + Math.random() * 0.3
      g.gain.setValueAtTime(0.03, c.currentTime + dur)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur + 0.1)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + dur + 0.2)
    }))

    // Distant siren (rare)
    cleanups.push(scheduleRandom(ctx, master, 30000, 60000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, c.currentTime)
      osc.frequency.linearRampToValueAtTime(900, c.currentTime + 1)
      osc.frequency.linearRampToValueAtTime(600, c.currentTime + 2)
      const g = c.createGain()
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.015, c.currentTime + 0.3)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 3)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 3.5)
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { traffic.stop() } catch {}
      try { chatter.stop() } catch {}
    }
  },

  // ── Jazz / Nightlife: muted music, glasses, low conversation ──────
  jazz(ctx, master) {
    const cleanups = []

    // Room tone
    const room = ctx.createBufferSource()
    room.buffer = brownNoise(ctx, 4)
    room.loop = true
    const roomFilter = ctx.createBiquadFilter()
    roomFilter.type = 'bandpass'
    roomFilter.frequency.value = 400
    roomFilter.Q.value = 0.3
    const roomGain = ctx.createGain()
    roomGain.gain.value = 0.15
    room.connect(roomFilter)
    roomFilter.connect(roomGain)
    roomGain.connect(master)
    room.start()

    // Muted bass line — simple walking bass
    cleanups.push(scheduleRandom(ctx, master, 800, 1500, (c, m) => {
      const notes = [110, 123.5, 130.8, 146.8, 164.8, 130.8, 146.8, 110]
      const note = notes[Math.floor(Math.random() * notes.length)]
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = note
      const g = c.createGain()
      g.gain.setValueAtTime(0.05, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 0.6)
    }))

    // Glass clink
    cleanups.push(scheduleRandom(ctx, master, 5000, 15000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = 3000 + Math.random() * 1500
      const g = c.createGain()
      g.gain.setValueAtTime(0.03, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 0.2)
    }))

    // Muted chatter
    const chatter = ctx.createBufferSource()
    chatter.buffer = whiteNoise(ctx, 3)
    chatter.loop = true
    const chatterF = ctx.createBiquadFilter()
    chatterF.type = 'bandpass'
    chatterF.frequency.value = 800
    chatterF.Q.value = 1
    const chatterG = ctx.createGain()
    chatterG.gain.value = 0.03
    chatter.connect(chatterF)
    chatterF.connect(chatterG)
    chatterG.connect(master)
    chatter.start()

    return () => {
      cleanups.forEach(fn => fn())
      try { room.stop() } catch {}
      try { chatter.stop() } catch {}
    }
  },

  // ── Protest / Crowd: chanting, megaphone, crowd noise ─────────────
  protest(ctx, master) {
    const cleanups = []

    // Crowd murmur — heavy filtered noise
    const crowd = ctx.createBufferSource()
    crowd.buffer = brownNoise(ctx, 5)
    crowd.loop = true
    const crowdFilter = ctx.createBiquadFilter()
    crowdFilter.type = 'bandpass'
    crowdFilter.frequency.value = 600
    crowdFilter.Q.value = 0.3
    const crowdGain = ctx.createGain()
    crowdGain.gain.value = 0.35
    crowd.connect(crowdFilter)
    crowdFilter.connect(crowdGain)
    crowdGain.connect(master)
    crowd.start()

    // Higher crowd chatter
    const chatter = ctx.createBufferSource()
    chatter.buffer = whiteNoise(ctx, 3)
    chatter.loop = true
    const chatterFilter = ctx.createBiquadFilter()
    chatterFilter.type = 'bandpass'
    chatterFilter.frequency.value = 1800
    chatterFilter.Q.value = 0.8
    const chatterGain = ctx.createGain()
    chatterGain.gain.value = 0.06
    chatter.connect(chatterFilter)
    chatterFilter.connect(chatterGain)
    chatterGain.connect(master)
    chatter.start()

    // Crowd swells — periodic rises in volume
    cleanups.push(scheduleRandom(ctx, master, 6000, 14000, (c, m) => {
      const swell = c.createBufferSource()
      const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
      const d = buf.getChannelData(0)
      let v = 0
      for (let i = 0; i < d.length; i++) {
        v = (v + 0.02 * (Math.random() * 2 - 1)) / 1.02
        d[i] = v * 3 * Math.sin(Math.PI * i / d.length)  // envelope shape
      }
      swell.buffer = buf
      const f = c.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = 500
      f.Q.value = 0.5
      const g = c.createGain()
      g.gain.value = 0.15
      swell.connect(f)
      f.connect(g)
      g.connect(m)
      swell.start()
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { crowd.stop() } catch {}
      try { chatter.stop() } catch {}
    }
  },

  // ── Industrial: machinery, steam, clanking ────────────────────────
  industrial(ctx, master) {
    const cleanups = []

    // Machinery hum
    const hum = ctx.createOscillator()
    hum.type = 'sawtooth'
    hum.frequency.value = 60
    const humFilter = ctx.createBiquadFilter()
    humFilter.type = 'lowpass'
    humFilter.frequency.value = 150
    const humGain = ctx.createGain()
    humGain.gain.value = 0.12
    hum.connect(humFilter)
    humFilter.connect(humGain)
    humGain.connect(master)
    hum.start()

    // Steam hiss — periodic
    cleanups.push(scheduleRandom(ctx, master, 5000, 12000, (c, m) => {
      const buf = c.createBuffer(1, c.sampleRate * 1.5, c.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.5))
      }
      const src = c.createBufferSource()
      src.buffer = buf
      const f = c.createBiquadFilter()
      f.type = 'highpass'
      f.frequency.value = 2000
      const g = c.createGain()
      g.gain.value = 0.06
      src.connect(f)
      f.connect(g)
      g.connect(m)
      src.start()
    }))

    // Metal clanking
    cleanups.push(scheduleRandom(ctx, master, 3000, 8000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'square'
      osc.frequency.value = 800 + Math.random() * 400
      const g = c.createGain()
      g.gain.setValueAtTime(0.04, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 0.2)
    }))

    // Background rumble
    const rumble = ctx.createBufferSource()
    rumble.buffer = brownNoise(ctx, 4)
    rumble.loop = true
    const rumbleF = ctx.createBiquadFilter()
    rumbleF.type = 'lowpass'
    rumbleF.frequency.value = 100
    const rumbleG = ctx.createGain()
    rumbleG.gain.value = 0.3
    rumble.connect(rumbleF)
    rumbleF.connect(rumbleG)
    rumbleG.connect(master)
    rumble.start()

    return () => {
      cleanups.forEach(fn => fn())
      try { hum.stop() } catch {}
      try { rumble.stop() } catch {}
    }
  },

  // ── Future: electronic hum, synthetic tones, digital wind ─────────
  future(ctx, master) {
    const cleanups = []

    // Low drone
    const drone = ctx.createOscillator()
    drone.type = 'sine'
    drone.frequency.value = 55
    const droneGain = ctx.createGain()
    droneGain.gain.value = 0.1
    drone.connect(droneGain)
    droneGain.connect(master)
    drone.start()

    // Harmonic pad
    const pad = ctx.createOscillator()
    pad.type = 'sine'
    pad.frequency.value = 220
    const padFilter = ctx.createBiquadFilter()
    padFilter.type = 'lowpass'
    padFilter.frequency.value = 300
    const padGain = ctx.createGain()
    padGain.gain.value = 0.04
    pad.connect(padFilter)
    padFilter.connect(padGain)
    padGain.connect(master)
    pad.start()

    // Gentle digital wind
    const wind = ctx.createBufferSource()
    wind.buffer = brownNoise(ctx, 6)
    wind.loop = true
    const windF = ctx.createBiquadFilter()
    windF.type = 'bandpass'
    windF.frequency.value = 800
    windF.Q.value = 2
    const windG = ctx.createGain()
    windG.gain.value = 0.05
    wind.connect(windF)
    windF.connect(windG)
    windG.connect(master)
    wind.start()

    // Soft synthetic pings
    cleanups.push(scheduleRandom(ctx, master, 3000, 8000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'sine'
      const notes = [440, 523.25, 659.25, 783.99, 880]
      osc.frequency.value = notes[Math.floor(Math.random() * notes.length)]
      const g = c.createGain()
      g.gain.setValueAtTime(0.025, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 2)
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { drone.stop() } catch {}
      try { pad.stop() } catch {}
      try { wind.stop() } catch {}
    }
  },

  // ── Colonial / Mission era: sparse, wind, distant construction ────
  colonial(ctx, master) {
    const cleanups = []

    // Wind
    const wind = ctx.createBufferSource()
    wind.buffer = brownNoise(ctx, 5)
    wind.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 300
    windFilter.Q.value = 0.4
    const windGain = ctx.createGain()
    windGain.gain.value = 0.25
    wind.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(master)
    wind.start()

    // Birds (sparse)
    cleanups.push(scheduleRandom(ctx, master, 6000, 15000, (c, m) => {
      const osc = c.createOscillator()
      osc.type = 'sine'
      const freq = 1600 + Math.random() * 1500
      osc.frequency.setValueAtTime(freq, c.currentTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, c.currentTime + 0.2)
      const g = c.createGain()
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.03, c.currentTime + 0.03)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3)
      osc.connect(g)
      g.connect(m)
      osc.start()
      osc.stop(c.currentTime + 0.4)
    }))

    // Distant hammering
    cleanups.push(scheduleRandom(ctx, master, 12000, 30000, (c, m) => {
      const numHits = 3 + Math.floor(Math.random() * 5)
      for (let i = 0; i < numHits; i++) {
        const t = c.currentTime + i * (0.4 + Math.random() * 0.2)
        const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate)
        const d = buf.getChannelData(0)
        for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (c.sampleRate * 0.008))
        const src = c.createBufferSource()
        src.buffer = buf
        const f = c.createBiquadFilter()
        f.type = 'bandpass'
        f.frequency.value = 1200
        f.Q.value = 3
        const g = c.createGain()
        g.gain.value = 0.025
        src.connect(f)
        f.connect(g)
        g.connect(m)
        src.start(t)
      }
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { wind.stop() } catch {}
    }
  },

  // ── Gold Rush: hammering, shouting, wagons, activity ──────────────
  goldrush(ctx, master) {
    const cleanups = []

    // Busy base noise
    const base = ctx.createBufferSource()
    base.buffer = brownNoise(ctx, 5)
    base.loop = true
    const baseFilter = ctx.createBiquadFilter()
    baseFilter.type = 'bandpass'
    baseFilter.frequency.value = 500
    baseFilter.Q.value = 0.3
    const baseGain = ctx.createGain()
    baseGain.gain.value = 0.25
    base.connect(baseFilter)
    baseFilter.connect(baseGain)
    baseGain.connect(master)
    base.start()

    // Pickaxe / hammering
    cleanups.push(scheduleRandom(ctx, master, 2000, 6000, (c, m) => {
      const buf = c.createBuffer(1, c.sampleRate * 0.04, c.sampleRate)
      const d = buf.getChannelData(0)
      for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (c.sampleRate * 0.005))
      const src = c.createBufferSource()
      src.buffer = buf
      const f = c.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = 1500 + Math.random() * 500
      f.Q.value = 3
      const g = c.createGain()
      g.gain.value = 0.05
      src.connect(f)
      f.connect(g)
      g.connect(m)
      src.start()
    }))

    // Distant shouts
    cleanups.push(scheduleRandom(ctx, master, 5000, 14000, (c, m) => {
      const len = 0.2 + Math.random() * 0.3
      const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / d.length)
      const src = c.createBufferSource()
      src.buffer = buf
      const f = c.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = 800 + Math.random() * 400
      f.Q.value = 2
      const g = c.createGain()
      g.gain.value = 0.03
      src.connect(f)
      f.connect(g)
      g.connect(m)
      src.start()
    }))

    return () => {
      cleanups.forEach(fn => fn())
      try { base.stop() } catch {}
    }
  },
}

// ═══════════════════════════════════════════════════════════════════
// ERA → PROFILE MAPPING
// ═══════════════════════════════════════════════════════════════════

// Map era IDs to ambient profile names
// Falls back to smart defaults based on era_type and keywords
const ERA_PROFILES = {
  // SF — Mission Dolores
  'mission-1500': 'nature', 'mission-1776': 'colonial', 'mission-1849': 'goldrush',
  'mission-1906': 'fire', 'mission-1945': 'industrial', 'mission-1967': 'protest',
  'mission-2000': 'cityModern', 'mission-2025': 'cityModern', 'mission-2075': 'future',

  // SF — Embarcadero
  'emb-1500': 'ocean', 'emb-1776': 'ocean', 'emb-1849': 'goldrush',
  'emb-1906': 'fire', 'emb-1945': 'industrial', 'emb-1967': 'industrial',
  'emb-2000': 'cityModern', 'emb-2025': 'cityModern', 'emb-2075': 'future',

  // SF — Montgomery / Financial
  'fin-1500': 'ocean', 'fin-1776': 'ocean', 'fin-1849': 'goldrush',
  'fin-1906': 'fire', 'fin-1945': 'cityOld', 'fin-1967': 'cityModern',
  'fin-2000': 'cityModern', 'fin-2025': 'cityModern', 'fin-2075': 'future',

  // SF — Chinatown
  'ct-1500': 'nature', 'ct-1776': 'colonial', 'ct-1849': 'goldrush',
  'ct-1906': 'fire', 'ct-1945': 'cityOld', 'ct-1967': 'cityOld',
  'ct-2000': 'cityModern', 'ct-2025': 'cityModern', 'ct-2075': 'future',

  // SF — Twin Peaks
  'tp-1500': 'nature', 'tp-1776': 'nature', 'tp-1849': 'nature',
  'tp-1906': 'fire', 'tp-1945': 'nature', 'tp-1967': 'nature',
  'tp-2000': 'cityModern', 'tp-2025': 'cityModern', 'tp-2075': 'future',

  // SF — Haight-Ashbury
  'haight-1500': 'nature', 'haight-1776': 'nature', 'haight-1849': 'nature',
  'haight-1906': 'protest', 'haight-1945': 'cityOld', 'haight-1967': 'jazz',
  'haight-2000': 'cityModern', 'haight-2025': 'cityModern', 'haight-2075': 'future',

  // SF — North Beach
  'nb-1500': 'ocean', 'nb-1776': 'ocean', 'nb-1849': 'goldrush',
  'nb-1906': 'fire', 'nb-1945': 'cityOld', 'nb-1967': 'jazz',
  'nb-2000': 'cityModern', 'nb-2025': 'cityModern', 'nb-2075': 'future',

  // SF — Alamo
  'alamo-1500': 'nature', 'alamo-1834': 'nature', 'alamo-1856': 'nature',
  'alamo-1900': 'nature', 'alamo-1950': 'cityOld', 'alamo-1980': 'cityModern',
  'alamo-2001': 'cityModern', 'alamo-2025': 'cityModern', 'alamo-2075': 'future',

  // NYC — Lower Manhattan
  'lm-1500': 'ocean', 'lm-1664': 'colonial', 'lm-1789': 'cityOld',
  'lm-1863': 'protest', 'lm-1929': 'cityOld', 'lm-1977': 'cityModern',
  'lm-2001': 'war', 'lm-2025': 'cityModern', 'lm-2075': 'future',

  // NYC — Brooklyn Bridge
  'bb-1500': 'ocean', 'bb-1664': 'colonial', 'bb-1789': 'cityOld',
  'bb-1863': 'industrial', 'bb-1929': 'cityOld', 'bb-1977': 'cityModern',
  'bb-2001': 'war', 'bb-2025': 'cityModern', 'bb-2075': 'future',

  // NYC — Harlem
  'har-1500': 'nature', 'har-1658': 'colonial', 'har-1789': 'nature',
  'har-1863': 'cityOld', 'har-1925': 'jazz', 'har-1968': 'protest',
  'har-2000': 'cityModern', 'har-2025': 'cityModern', 'har-2075': 'future',

  // NYC — Wall Street
  'nyc-wall-street-1626': 'ocean', 'nyc-wall-street-1700': 'colonial',
  'nyc-wall-street-1789': 'cityOld', 'nyc-wall-street-1869': 'cityOld',
  'nyc-wall-street-1929': 'cityOld', 'nyc-wall-street-1987': 'cityModern',
  'nyc-wall-street-2001': 'war', 'nyc-wall-street-2025': 'cityModern', 'nyc-wall-street-2075': 'future',

  // NYC — Central Park
  'nyc-central-park-1609': 'nature', 'nyc-central-park-1820': 'nature',
  'nyc-central-park-1858': 'nature', 'nyc-central-park-1900': 'cityOld',
  'nyc-central-park-1969': 'jazz', 'nyc-central-park-1980': 'cityModern',
  'nyc-central-park-2001': 'cityModern', 'nyc-central-park-2025': 'cityModern', 'nyc-central-park-2075': 'future',

  // London — South Bank
  'sb-43': 'medieval', 'sb-1066': 'medieval', 'sb-1600': 'medieval',
  'sb-1851': 'industrial', 'sb-1940': 'war', 'sb-1951': 'cityOld',
  'sb-2000': 'cityModern', 'sb-2025': 'cityModern', 'sb-2075': 'future',

  // London — City of London
  'city-43': 'medieval', 'city-1066': 'medieval', 'city-1666': 'fire',
  'city-1851': 'industrial', 'city-1940': 'war', 'city-1966': 'cityModern',
  'city-2000': 'cityModern', 'city-2025': 'cityModern', 'city-2075': 'future',

  // London — Tower
  'london-tower-1066': 'medieval', 'london-tower-1483': 'medieval',
  'london-tower-1536': 'medieval', 'london-tower-1605': 'medieval',
  'london-tower-1941': 'war', 'london-tower-1952': 'cityOld',
  'london-tower-2000': 'cityModern', 'london-tower-2025': 'cityModern', 'london-tower-2075': 'future',

  // London — Soho
  'london-soho-1685': 'medieval', 'london-soho-1854': 'cityOld',
  'london-soho-1916': 'war', 'london-soho-1955': 'jazz',
  'london-soho-1967': 'jazz', 'london-soho-1984': 'cityModern',
  'london-soho-1999': 'cityModern', 'london-soho-2025': 'cityModern', 'london-soho-2075': 'future',

  // London — Whitechapel
  'london-whitechapel-1660': 'medieval', 'london-whitechapel-1888': 'cityOld',
  'london-whitechapel-1910': 'cityOld', 'london-whitechapel-1940': 'war',
  'london-whitechapel-1978': 'protest', 'london-whitechapel-1993': 'cityModern',
  'london-whitechapel-2012': 'cityModern', 'london-whitechapel-2025': 'cityModern', 'london-whitechapel-2075': 'future',

  // Riyadh — Diriyah
  'dir-1446': 'desert', 'dir-1744': 'desert', 'dir-1818': 'war',
  'dir-1902': 'desert', 'dir-1938': 'desert', 'dir-1975': 'desert',
  'dir-2010': 'desert', 'dir-2025': 'cityModern', 'dir-2075': 'future',

  // Riyadh — Empty Quarter
  'eq-1446': 'desert', 'eq-1744': 'desert', 'eq-1824': 'desert',
  'eq-1931': 'desert', 'eq-1938': 'desert', 'eq-1998': 'industrial',
  'eq-2010': 'desert', 'eq-2025': 'desert', 'eq-2075': 'future',

  // LA — Downtown
  'dtla-1500': 'nature', 'dtla-1781': 'colonial', 'dtla-1848': 'colonial',
  'dtla-1910': 'cityOld', 'dtla-1947': 'jazz', 'dtla-1968': 'protest',
  'dtla-2000': 'cityModern', 'dtla-2025': 'cityModern', 'dtla-2075': 'future',

  // LA — Venice Beach
  'ven-1500': 'ocean', 'ven-1781': 'ocean', 'ven-1848': 'ocean',
  'ven-1905': 'ocean', 'ven-1947': 'ocean', 'ven-1968': 'ocean',
  'ven-2000': 'ocean', 'ven-2025': 'ocean', 'ven-2075': 'future',

  // Chicago — The Loop
  'loop-1500': 'nature', 'loop-1837': 'colonial', 'loop-1871': 'fire',
  'loop-1893': 'cityOld', 'loop-1933': 'cityOld', 'loop-1968': 'protest',
  'loop-2000': 'cityModern', 'loop-2025': 'cityModern', 'loop-2075': 'future',

  // Chicago — South Side
  'ss-1500': 'nature', 'ss-1837': 'nature', 'ss-1871': 'fire',
  'ss-1893': 'cityOld', 'ss-1920': 'jazz', 'ss-1950': 'jazz',
  'ss-2000': 'cityModern', 'ss-2025': 'cityModern', 'ss-2075': 'future',

  // Lagos — Lagos Island
  'li-1400': 'ocean', 'li-1472': 'ocean', 'li-1700': 'ocean',
  'li-1861': 'colonial', 'li-1914': 'cityOld', 'li-1960': 'protest',
  'li-2000': 'cityModern', 'li-2025': 'cityModern', 'li-2075': 'future',

  // Lagos — Victoria Island
  'vi-1400': 'ocean', 'vi-1861': 'ocean', 'vi-1700': 'ocean',
  'vi-1914': 'colonial', 'vi-1960': 'protest', 'vi-1985': 'cityModern',
  'vi-2006': 'cityModern', 'vi-2025': 'cityModern', 'vi-2075': 'future',

  // Tokyo — Shinjuku
  'tokyo-shinjuku-1500': 'nature', 'tokyo-shinjuku-1698': 'medieval',
  'tokyo-shinjuku-1868': 'cityOld', 'tokyo-shinjuku-1923': 'fire',
  'tokyo-shinjuku-1945': 'war', 'tokyo-shinjuku-1968': 'protest',
  'tokyo-shinjuku-1988': 'cityModern', 'tokyo-shinjuku-2025': 'cityModern', 'tokyo-shinjuku-2075': 'future',

  // Tokyo — Asakusa
  'tokyo-asakusa-1500': 'nature', 'tokyo-asakusa-1700': 'medieval',
  'tokyo-asakusa-1890': 'cityOld', 'tokyo-asakusa-1923': 'fire',
  'tokyo-asakusa-1945': 'war', 'tokyo-asakusa-1960': 'cityOld',
  'tokyo-asakusa-2000': 'cityModern', 'tokyo-asakusa-2025': 'cityModern', 'tokyo-asakusa-2075': 'future',

  // Paris — Le Marais
  'paris-marais-1500': 'medieval', 'paris-marais-1614': 'medieval',
  'paris-marais-1789': 'protest', 'paris-marais-1850': 'cityOld',
  'paris-marais-1860': 'cityOld', 'paris-marais-1942': 'war',
  'paris-marais-1998': 'cityModern', 'paris-marais-2025': 'cityModern', 'paris-marais-2075': 'future',

  // Paris — Montmartre
  'paris-montmartre-1500': 'medieval', 'paris-montmartre-1871': 'protest',
  'paris-montmartre-1889': 'jazz', 'paris-montmartre-1907': 'jazz',
  'paris-montmartre-1942': 'war', 'paris-montmartre-1950': 'jazz',
  'paris-montmartre-1965': 'cityModern', 'paris-montmartre-2025': 'cityModern', 'paris-montmartre-2075': 'future',
}

/**
 * Get the ambient profile name for an era
 * Falls back to smart defaults based on era_type
 */
export function getAmbientProfile(eraId, eraType) {
  if (ERA_PROFILES[eraId]) return ERA_PROFILES[eraId]
  // Smart fallbacks
  if (eraType === 'future') return 'future'
  if (eraType === 'present') return 'cityModern'
  return 'nature' // safe default for unknown past eras
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

  const profileFn = profiles[profileName] || profiles.nature
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
