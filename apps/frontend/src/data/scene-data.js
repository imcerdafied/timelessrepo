/**
 * Scene Data: hero monologues + metadata for Atlantis Bahamas hospitality demo.
 *
 * Strategy:
 * 1. "Hero" eras get hand-written monologues (the most dramatic moments)
 * 2. All other eras auto-generate monologues from the character opening_line
 *    + era description, split into dramatic lines
 */

// ═══════════════════════════════════════════════════════════════════
// HAND-WRITTEN HERO MONOLOGUES
// ═══════════════════════════════════════════════════════════════════

export const HERO_MONOLOGUES = {
  'marina-beach-colonial': {
    narrator: { name: 'Captain Jack Rackham', role: 'Pirate captain, formerly of the sloop William' },
    lines: [
      "Nassau belonged to no king. That was the whole point.",
      "We sailed under our own colours, answered to no admiralty, bowed to no throne. A thousand pirates turning this harbour into a republic built on defiance.",
      "The merchants called us thieves. The Crown called us enemies of mankind. But look at what their civilised world offered: pressed into service on a warship, flogged for speaking plain, paid in scraps.",
      "Here, every man had a vote and an equal share of the prize. We wrote articles fairer than any charter Parliament ever drafted.",
      "They sent Woodes Rogers to break us. A royal governor with pardons in one hand and a noose in the other. Most took the pardon. I did not.",
      "Freedom is not something you are given. It is something you refuse to surrender. Nassau taught me that, and the sea remembers.",
    ],
  },

  'marine-habitat-modern': {
    narrator: { name: 'Coral Anderson', role: 'Head aquarist, Atlantis Marine Habitat' },
    lines: [
      "I arrive at five in the morning, before the guests, before the sun. The habitat is quiet then, just the hum of the life-support systems and fifty thousand heartbeats.",
      "People see the tanks and think it is a display. It is a city. Every species has a territory, a routine, a personality. The parrotfish are early risers. The moray eels are night owls.",
      "There is a hammerhead I have known for eleven years. She was a juvenile when she arrived, barely three feet long. Now she is nine feet of muscle and grace.",
      "I have watched her through pregnancies, through illness, through storms that knocked the power out and we ran generators through the night to keep the water moving.",
      "The best part of this work is the children. A six-year-old presses their face against the glass, and a stingray glides past close enough to touch, and the child gasps.",
      "That gasp is everything. That is the moment a person falls in love with the ocean. And once you love something, you protect it.",
    ],
  },

  'lobby-royal-towers-resort-era': {
    narrator: { name: 'James Kingsley', role: 'Lead architect, Royal Towers project' },
    lines: [
      "Sol Kerzner did not want a hotel. He wanted a myth made physical. He said: build me Atlantis.",
      "The lobby ceiling rises sixty-three feet. I fought for every inch. The engineers wanted forty. Forty would have been a hotel. Sixty-three is a cathedral.",
      "We studied every great hall ever built: Hagia Sophia, Grand Central, the Alhambra. Then we threw out the references and asked a different question. What does the lost city feel like when you walk through the door?",
      "Fourteen thousand tons of hand-carved coral stone. Eight years of construction. Two hundred artisans from eleven countries.",
      "When the first guests walked in, they stopped. Not because they were impressed, although they were. They stopped because the space changed how they breathed. That is architecture doing its job.",
    ],
  },
}

// ═══════════════════════════════════════════════════════════════════
// AUTO-GENERATE MONOLOGUES FROM ERA DATA
// ═══════════════════════════════════════════════════════════════════

/**
 * Split text into dramatic lines, aiming for 15-25 words per line.
 * Splits at sentence boundaries, then further at natural pause points.
 */
function splitIntoLines(text) {
  if (!text) return []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const lines = []
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    const words = trimmed.split(/\s+/)
    if (words.length <= 28) {
      lines.push(trimmed)
    } else {
      const parts = trimmed.split(/(?:,|;\s|,\s(?:and|but|or|then|while|because|although|when|where|which|who)\s)/i)
      if (parts.length > 1 && parts.every(p => p.trim().length > 10)) {
        parts.forEach(p => {
          const t = p.trim()
          if (t.length > 5) lines.push(t)
        })
      } else {
        const mid = Math.floor(words.length / 2)
        lines.push(words.slice(0, mid).join(' '))
        lines.push(words.slice(mid).join(' '))
      }
    }
  }
  return lines.filter(l => l.length > 5).slice(0, 9)
}

/**
 * Build a monologue for any era.
 * Returns hero monologue if it exists, otherwise auto-generates from
 * character opening_line + era description sentences.
 * Returns { lines, narrator } or null if nothing is available.
 */
export function buildMonologue(eraId, character, era) {
  // Check for hand-written hero monologue
  if (HERO_MONOLOGUES[eraId]) {
    const hero = HERO_MONOLOGUES[eraId]
    return {
      lines: hero.lines,
      narrator: hero.narrator || (character ? { name: character.name, role: character.role } : null),
    }
  }

  if (!era) return null

  const lines = []

  // Start with character opening line if available
  if (character?.opening_line) {
    lines.push(character.opening_line)
  }

  // Add era description split into dramatic lines
  if (era.description) {
    const descLines = splitIntoLines(era.description)
    lines.push(...descLines)
  }

  // Trim to 7-9 lines total
  const finalLines = lines.slice(0, 9).map(l =>
    l.replace(/\s*[,–]\s*/g, ', ').replace(/\s{2,}/g, ' ').trim()
  )

  if (finalLines.length === 0) return null

  return {
    lines: finalLines,
    narrator: character ? { name: character.name, role: character.role } : null,
  }
}

/**
 * Get scene images for an era. Simple pass-through for now.
 * Returns array with primary image URL.
 */
export function getSceneImages(eraId, primaryImageUrl) {
  return primaryImageUrl ? [primaryImageUrl] : []
}

/**
 * Get the visual overlay style for a given era type.
 * Returns { filter: CSS filter string, accent: hex color }.
 */
export function getEraVisualStyle(eraType) {
  switch (eraType) {
    case 'past':
      return {
        filter: 'sepia(0.3) saturate(0.8) brightness(0.9)',
        accent: '#C8860A',
      }
    case 'present':
      return {
        filter: 'brightness(1.05) saturate(1.1)',
        accent: '#F5F5F5',
      }
    case 'future':
      return {
        filter: 'saturate(0.7) brightness(0.85) hue-rotate(10deg)',
        accent: '#1E4D8C',
      }
    case 'cultural':
      return {
        filter: 'saturate(1.3) brightness(1.0)',
        accent: '#2D8F4E',
      }
    case 'operational':
      return {
        filter: 'saturate(0.6) brightness(0.95) contrast(1.1)',
        accent: '#4A90A4',
      }
    default:
      return {
        filter: 'brightness(0.9) saturate(0.8) sepia(0.15)',
        accent: '#C8860A',
      }
  }
}
