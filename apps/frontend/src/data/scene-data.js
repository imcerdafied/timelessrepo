/**
 * Scene Data — monologues + metadata for every era's Timeless Scene experience
 *
 * Strategy:
 * 1. "Hero" eras get hand-written monologues (the most dramatic moments)
 * 2. All other eras auto-generate monologues from the character opening_line
 *    + era description, split into dramatic lines
 */

const SUPABASE_PUBLIC = 'https://xllwzunjvidtszyklhhm.supabase.co/storage/v1/object/public'

// ═══════════════════════════════════════════════════════════════════
// HAND-WRITTEN HERO MONOLOGUES
// ═══════════════════════════════════════════════════════════════════

export const HERO_MONOLOGUES = {
  'mission-1906': {
    narrator: { name: 'Thomas Wakefield', role: 'Reporter, San Francisco Examiner' },
    audioUrl: `${SUPABASE_PUBLIC}/episodes/sf-1906-scene.mp3`,
    lines: [
      "I woke to the sound of the world ending.",
      "It was quarter past five in the morning. April eighteenth. The bed moved... sideways. Not shaking — sliding. Like the floor had become water.",
      "I got to the window and looked out at Market Street... and the facades were peeling off the buildings like skin.",
      "Three-story walls just... folding forward into the street. Brick and glass and timber. The noise — I can't describe the noise. It wasn't a roar. It was deeper than that. It was the sound of the earth disagreeing with itself.",
      "I got dressed. I don't remember deciding to. Shoes, coat, notebook. The reporter in me took over before the man could panic.",
      "South of Market was already burning. You could see the smoke columns — three, four, five of them — rising like pillars holding up some terrible sky.",
      "People were moving north. Everyone was moving north. Families carrying what they could. A woman with a birdcage. A man dragging a trunk with one broken wheel, scraping a line into the cobblestones.",
      "The fire department was already out but the hydrants... the hydrants were dry. The earthquake had broken the water mains beneath the streets. Every last one.",
      "I stood on the corner of Mission and Third and I wrote this in my notebook: The city is on fire and there is no water. God help San Francisco.",
    ],
  },

  'lm-2001': {
    lines: [
      "The sky was so blue that morning. September blue. The kind of blue you only get in New York in early fall.",
      "I was walking to work along Church Street when the first plane hit. I heard it before I understood it — a sound like the air itself ripping open.",
      "I looked up and saw the North Tower burning. Paper was falling from the sky. Thousands of sheets, drifting like snow. Someone's reports. Someone's letters. Someone's life.",
      "Then the second plane. I saw it. Everyone on the street saw it. And in that moment, we all understood this was not an accident.",
      "People started running. I ran too. Uptown. Everyone was moving uptown.",
      "When the first tower fell, the ground shook. A wall of dust and smoke rolled through the streets like a wave. I ducked into a doorway. The world went dark.",
      "When it cleared, everything was gray. Every surface, every person, every car — covered in ash. We looked like ghosts walking through a ghost city.",
      "I found a payphone that worked and called my mother. I said the only thing that mattered: I'm alive.",
    ],
  },

  'city-1666': {
    lines: [
      "The fire started in Pudding Lane. A baker's oven. Such a small thing to destroy a city.",
      "By the time I reached the river, the whole of Fish Street was ablaze. The flames moved faster than a man could walk. The wind was merciless.",
      "I watched St. Paul's burn. The lead roof melted and ran down the walls like silver tears. The stones exploded from the heat. A cathedral that had stood for six hundred years, gone in a single night.",
      "The warehouses on the river held pitch, oil, brandy, timber — all of it fuel. When they caught fire, the flames leapt so high they seemed to touch the clouds.",
      "People were loading boats with everything they owned. Furniture, paintings, strongboxes of gold. The Thames was crowded with the escaping and the desperate.",
      "Four days it burned. Thirteen thousand houses. Eighty-seven churches. The medieval city my grandfather knew — erased entirely.",
      "When at last the flames died, I walked through what remained. Streets I had known my whole life were unrecognizable. Nothing but chimneys standing in fields of ash, like the bones of a city laid bare.",
    ],
  },

  'loop-1871': {
    lines: [
      "They say it started in a barn on DeKoven Street. A cow, a lantern — the story may be myth. But the fire was real enough.",
      "The city was made of wood. The sidewalks were wood. The streets were wood. Even the buildings that called themselves brick had wooden frames and wooden trim. Chicago was a tinderbox dressed in city clothes.",
      "The wind came off the prairie that night like it had a purpose. It carried embers a mile ahead of the flames. Whole blocks caught fire before the fire even arrived.",
      "I watched from the river as the courthouse bell rang the alarm — then fell silent when the courthouse itself caught fire. The bell tower collapsed inward.",
      "Three hundred people died. A hundred thousand were homeless by morning. The city that had risen from swamp mud in a single generation burned in a single night.",
      "But I'll tell you what I remember most: the rebuilding. Within two years, the downtown was rising again. Stone this time. Steel. As if the fire had merely cleared the way for what Chicago was always meant to become.",
    ],
  },

  'haight-1967': {
    lines: [
      "You could hear the music from three blocks away. The Grateful Dead at 710 Ashbury, Janis at Lyon Street, Jefferson Airplane a few doors down. This neighborhood was a jukebox.",
      "A hundred thousand people came that summer. Kids from Ohio, from Texas, from everywhere. They stepped off Greyhound buses with flowers in their hair and no idea where they'd sleep that night.",
      "The Diggers set up in the Panhandle every afternoon — free food, no questions asked. Somebody always had a guitar. Somebody always had something to share.",
      "Every Victorian on the street was painted in colors that didn't exist before. Or maybe they always existed and we just couldn't see them until now.",
      "I remember sitting on the sidewalk at Haight and Ashbury, watching the whole world walk by. Business suits and bare feet. Monks and runaways. Everyone mixed together like it was the most natural thing.",
      "It couldn't last. We knew that even then. By October the neighborhood had declared the Death of the Hippie. But for one summer, this was the center of the world. And nothing would ever be quite the same.",
    ],
  },

  'har-1925': {
    lines: [
      "You haven't heard music until you've heard it on Lenox Avenue on a Saturday night. The whole street swings.",
      "Langston Hughes reads at the Dark Tower on 136th Street. Zora Neale Hurston holds court at parties where every person in the room is a genius. Duke Ellington fills the Cotton Club with sounds that make you feel things English doesn't have words for.",
      "This is the most concentrated explosion of Black brilliance the world has ever seen. And it's happening in thirty square blocks of upper Manhattan.",
      "The Savoy Ballroom doesn't have a rope line. Doesn't matter what color you are — if you can dance, you can dance. Two thousand people on that floor on a good night, and every night is a good night.",
      "I watch the young poets walk these streets and I know they are writing the future. Not just for Harlem. For America. For the world.",
      "They'll call this the Renaissance later. But we don't call it anything. We just live it. Every night, something new. Every morning, something beautiful.",
    ],
  },

  'sb-1940': {
    lines: [
      "The sirens started at dusk. We knew what they meant by now. Everyone in the shelter, quick as you can.",
      "The Luftwaffe came over in waves. You could hear the engines first — a low, heavy drone that made your teeth vibrate. Then the whistling. Then the explosions.",
      "I was a fire watcher on the roof of the warehouse. My job was to throw incendiary bombs off the roof before they burned through. Sixteen years old and playing catch with fire.",
      "The docks took the worst of it. Warehouses full of sugar and rum burned so hot the river itself seemed to glow. The smoke was sweet and terrible.",
      "St. Paul's survived. They say it was a miracle. I say it was the fire watchers — volunteers who spent every night on that dome, kicking bombs into the street.",
      "Fifty-seven consecutive nights of bombing. We slept in the Tube stations. We made tea in the morning and swept the glass from the street. What else could we do?",
      "London broke, but Londoners didn't. That's what I want people to remember.",
    ],
  },

  'tokyo-shinjuku-1923': {
    lines: [
      "The earthquake struck at noon, when every kitchen in Tokyo was lit for the midday meal. The shaking lasted four minutes. What followed lasted three days.",
      "The wooden neighborhoods east of us caught fire instantly. A hundred thousand cooking fires knocked over at once. The wind carried the flames in sheets across the rooftops.",
      "In Shinjuku, we were lucky. The streets here are wider. The buildings newer. We shook but we did not burn.",
      "But the refugees came. Tens of thousands, walking west, carrying what they could. By evening, every park and temple ground in Shinjuku was a camp.",
      "The smoke from the east turned the sky orange for three days. You could smell the burning city from here — wood, paper, and things I don't want to name.",
      "When it was over, one hundred and forty thousand were dead. The old Tokyo — the city of paper walls and wooden lanes — was gone forever.",
      "They rebuilt, of course. Tokyo always rebuilds. But the city that rose from the ashes was a different creature entirely.",
    ],
  },

  'paris-montmartre-1889': {
    lines: [
      "The Moulin Rouge opened in October with a red windmill on the roof and electric lights that could be seen from the Seine. Paris gasped.",
      "Toulouse-Lautrec was already installed at his corner table, sketching the dancers. He captured them in motion — legs flying, skirts spinning — in a way photography never could.",
      "The same year, Monsieur Eiffel finished his tower. The whole world came to Paris for the Exposition, and the whole of Paris came to Montmartre to celebrate.",
      "The can-can dancers were scandalous and they knew it. La Goulue challenged the audience. Jane Avril danced with her eyes closed, as if the music had taken her somewhere else entirely.",
      "You could climb the butte at midnight and see all of Paris lit below you — gas lamps and electric lights together, the old world and the new, tangled up in a single view.",
      "This is what they'll call the Belle Époque. The beautiful era. And it was. God, it was.",
    ],
  },

  'lm-1929': {
    lines: [
      "The ticker tape machine couldn't keep up. That was the first sign. The numbers falling so fast the machines were running ninety minutes behind reality.",
      "I was on the floor of the Exchange when the panic started. Men who had been millionaires at breakfast were ruined by lunch. I watched a man sit down on the trading floor and simply... stop. Like a clock winding down.",
      "Outside, crowds gathered on Wall Street. Not angry — stunned. They stood in the rain staring up at the buildings as if waiting for someone to explain what had happened.",
      "Sixteen million shares traded on the worst day. The previous record had been four million. The numbers were incomprehensible.",
      "The window jumpers — that's what the papers focused on. But most men didn't jump. They walked home, told their wives, and began the slow work of starting over from nothing.",
      "Everything was built on margin. Everything was borrowed against tomorrow. And when tomorrow arrived, it was empty.",
    ],
  },

  'paris-marais-1789': {
    lines: [
      "The Bastille fell on a Tuesday. By Thursday, everything was different.",
      "I watched from my window on Rue des Francs-Bourgeois as the crowd surged east toward the fortress. Thousands of ordinary Parisians — bakers, laundresses, students — carrying whatever they could find.",
      "The aristocrats who had built their grand hôtels in this quarter were suddenly invisible. Doors locked. Shutters closed. Carriages gone from the courtyards.",
      "Liberty. Equality. Fraternity. The words were on every wall, every pamphlet, every tongue. They tasted like possibility and gunpowder.",
      "Within weeks, the National Guard was in the streets and the old order was dissolving. The feudal system that had lasted a thousand years collapsed like a house with its foundations pulled away.",
      "What comes next? Nobody knows. That is both the terror and the promise of revolution.",
    ],
  },

  'london-whitechapel-1888': {
    lines: [
      "The fog in Whitechapel is not like fog elsewhere. It is yellow with coal smoke and it smells of the tanneries and the river. It swallows sound. It hides everything.",
      "Five women are dead. All of them poor. All of them known in these streets. Mary Ann, Annie, Elizabeth, Catherine, Mary Jane. The newspapers call him Jack. We call him nothing — we just lock our doors.",
      "The police walk in pairs now, their bull's-eye lanterns cutting narrow paths through the dark. They find nothing. The killer moves through these lanes like he was born in them.",
      "This is the poorest district in London. Thirty thousand people in a few square blocks, packed into rooms not fit for animals. The world never looked at Whitechapel before. Now they can't look away.",
      "I sew shirts fourteen hours a day for sixpence. I share a room with three other women. This was my life before the murders. This will be my life after. That is the real horror of Whitechapel — not the knife, but the daily cruelty that nobody reports.",
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
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const lines = []
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    const words = trimmed.split(/\s+/)
    if (words.length <= 28) {
      lines.push(trimmed)
    } else {
      // Split long sentences at commas, semicolons, or dashes
      const parts = trimmed.split(/(?:—|;\s|,\s(?:and|but|or|then|while|because|although|when|where|which|who)\s)/i)
      if (parts.length > 1 && parts.every(p => p.trim().length > 10)) {
        parts.forEach(p => {
          const t = p.trim()
          if (t.length > 5) lines.push(t.endsWith('.') || t.endsWith('!') || t.endsWith('?') ? t : t)
        })
      } else {
        // Just split at the midpoint
        const mid = Math.floor(words.length / 2)
        lines.push(words.slice(0, mid).join(' '))
        lines.push(words.slice(mid).join(' '))
      }
    }
  }
  return lines.filter(l => l.length > 5).slice(0, 9) // cap at 9 lines
}

/**
 * Build a monologue for any era from its character + description data.
 * Works with OR without a character — eras without characters use
 * the era headline + description as a narrator-less monologue.
 * Returns { lines, narrator, audioUrl } or null if truly nothing is available.
 */
export function buildMonologue(eraId, character, era) {
  // Check for hand-written hero monologue
  if (HERO_MONOLOGUES[eraId]) {
    const hero = HERO_MONOLOGUES[eraId]
    return {
      lines: hero.lines,
      narrator: hero.narrator || (character ? { name: character.name, role: character.role } : null),
      audioUrl: hero.audioUrl || null,
    }
  }

  if (!era) return null

  const lines = []

  // If we have a character, lead with their opening line
  if (character?.opening_line) {
    lines.push(character.opening_line)
  } else if (era.headline) {
    // No character — use the era headline as the opening
    lines.push(era.headline)
  }

  // Add era description split into dramatic lines
  if (era.description) {
    const descLines = splitIntoLines(era.description)
    lines.push(...descLines)
  }

  // Add key events as dramatic beats if available and we need more lines
  if (era.key_events && lines.length < 5) {
    const events = Array.isArray(era.key_events) ? era.key_events : []
    for (const evt of events.slice(0, 3)) {
      if (typeof evt === 'string' && evt.length > 10) lines.push(evt)
    }
  }

  // Add landscape description as a coda if available
  if (era.landscape) {
    const landscapeLines = splitIntoLines(era.landscape)
    lines.push(...landscapeLines.slice(0, 2))
  }

  // Trim to 7-9 lines total
  const finalLines = lines.slice(0, 9)

  if (finalLines.length === 0) return null

  return {
    lines: finalLines,
    narrator: character ? { name: character.name, role: character.role } : null,
    audioUrl: null,
  }
}

/**
 * Get extra images for a scene (for Ken Burns cycling).
 * Returns array of image URLs — at least the era's main image.
 */
const EXTRA_IMAGES = {
  'mission-1906': [
    `${SUPABASE_PUBLIC}/characters/sf-1906-ruins.jpg`,
    `${SUPABASE_PUBLIC}/characters/sf-1906-aerial.jpg`,
  ],
}

export function getSceneImages(eraId, mainImageUrl) {
  if (EXTRA_IMAGES[eraId]) {
    return EXTRA_IMAGES[eraId]
  }
  // Just use the main era image (still gets Ken Burns treatment)
  return mainImageUrl ? [mainImageUrl] : []
}

/**
 * Get the visual overlay style for the era's time period.
 * Returns CSS filter + overlay color info.
 */
export function getEraVisualStyle(eraId, eraType) {
  // Fire / disaster eras — warm sepia
  const fireEras = ['mission-1906','emb-1906','fin-1906','ct-1906','tp-1906','nb-1906',
    'haight-1906','city-1666','loop-1871','ss-1871','tokyo-shinjuku-1923','tokyo-asakusa-1923']
  if (fireEras.includes(eraId)) {
    return {
      filter: 'brightness(0.35) saturate(0.6) sepia(0.35)',
      overlay: 'radial-gradient(ellipse at 30% 70%, rgba(220,100,20,0.35) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(180,70,15,0.25) 0%, transparent 55%)',
      overlayAnim: true,
    }
  }

  // War / blitz eras — cool desaturated
  const warEras = ['sb-1940','city-1940','london-tower-1941','london-soho-1916',
    'london-whitechapel-1940','lm-2001','bb-2001','nyc-wall-street-2001',
    'tokyo-shinjuku-1945','tokyo-asakusa-1945','paris-marais-1942','paris-montmartre-1942','dir-1818']
  if (warEras.includes(eraId)) {
    return {
      filter: 'brightness(0.3) saturate(0.4) contrast(1.1)',
      overlay: 'radial-gradient(ellipse at 50% 50%, rgba(100,120,150,0.15) 0%, transparent 60%)',
      overlayAnim: false,
    }
  }

  // Future eras — cool blue tint
  if (eraType === 'future') {
    return {
      filter: 'brightness(0.35) saturate(0.7) hue-rotate(10deg)',
      overlay: 'radial-gradient(ellipse at 50% 50%, rgba(30,77,140,0.2) 0%, transparent 60%)',
      overlayAnim: false,
    }
  }

  // Present day — natural, slightly dimmed
  if (eraType === 'present') {
    return {
      filter: 'brightness(0.4) saturate(0.8)',
      overlay: 'none',
      overlayAnim: false,
    }
  }

  // Old / medieval — sepia
  const medievalEras = ['sb-43','city-43','sb-1066','city-1066','sb-1600',
    'london-tower-1066','london-tower-1483','london-tower-1536','london-tower-1605',
    'london-soho-1685','london-whitechapel-1660','paris-marais-1500','paris-marais-1614',
    'paris-montmartre-1500','tokyo-shinjuku-1698','tokyo-asakusa-1700','dir-1446','dir-1744']
  if (medievalEras.includes(eraId)) {
    return {
      filter: 'brightness(0.35) saturate(0.5) sepia(0.5)',
      overlay: 'radial-gradient(ellipse at 50% 50%, rgba(180,150,100,0.1) 0%, transparent 60%)',
      overlayAnim: false,
    }
  }

  // Default — warm vintage
  return {
    filter: 'brightness(0.35) saturate(0.65) sepia(0.2)',
    overlay: 'radial-gradient(ellipse at 50% 50%, rgba(200,134,10,0.08) 0%, transparent 60%)',
    overlayAnim: false,
  }
}
