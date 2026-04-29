export const STORY_TRAILS = [
  {
    id: 'pirate-nassau',
    title: 'Pirate Nassau',
    shortTitle: 'Pirates',
    description: 'A three-stop trail through the Republic of Pirates, royal authority, and the harbor that made Nassau dangerous.',
    theme: 'maritime',
    stops: [
      {
        layerId: 'marina-beach-colonial',
        title: 'The Republic of Pirates',
        prompt: 'Ask Anne Bonny who really controlled Nassau harbor.',
      },
      {
        layerId: 'lobby-royal-towers-colonial',
        title: 'The Governor Arrives',
        prompt: 'Ask Woodes Rogers what order costs.',
      },
      {
        layerId: 'casino-nightlife-colonial',
        title: 'Taverns and Wagers',
        prompt: 'Follow the money through pirate Nassau.',
      },
    ],
  },
  {
    id: 'behind-the-mirage',
    title: 'Behind the Mirage',
    shortTitle: 'Operations',
    description: 'The hidden operating system behind a resort that feels effortless from the guest side.',
    theme: 'operational',
    stops: [
      {
        layerId: 'marina-beach-behind-scenes',
        title: 'Beach Before Sunrise',
        prompt: 'See how the beach is rebuilt every morning.',
      },
      {
        layerId: 'lobby-royal-towers-behind-scenes',
        title: 'First Sixty Minutes',
        prompt: 'Ask how 340 guest touchpoints become one arrival.',
      },
      {
        layerId: 'marine-habitat-behind-scenes',
        title: 'Life Support',
        prompt: 'Follow the machinery that keeps 11 million gallons alive.',
      },
    ],
  },
  {
    id: 'reef-rescue',
    title: 'Reef Rescue',
    shortTitle: 'Reef',
    description: 'A climate and conservation trail from guest-facing wonder to active marine restoration.',
    theme: 'natural',
    stops: [
      {
        layerId: 'marine-habitat-present',
        title: 'The Living Exhibit',
        prompt: 'Start with the animals guests can see today.',
      },
      {
        layerId: 'marina-beach-future',
        title: 'Living Marina',
        prompt: 'Step into a future where the marina becomes habitat.',
      },
      {
        layerId: 'marine-habitat-future',
        title: 'The Conservation Facility',
        prompt: 'Imagine the aquarium as a reef hospital.',
      },
    ],
  },
  {
    id: 'making-paradise',
    title: 'Making Paradise Island',
    shortTitle: 'Origins',
    description: 'How Hog Island became Paradise Island, then a resort city with its own mythology.',
    theme: 'architectural',
    stops: [
      {
        layerId: 'marina-beach-resort-era',
        title: 'From Hog Island to Paradise',
        prompt: 'Trace the bridge, casino, and marina expansion.',
      },
      {
        layerId: 'lobby-royal-towers-resort-era',
        title: 'Building the Royal Towers',
        prompt: 'Ask what it takes to build spectacle at this scale.',
      },
      {
        layerId: 'waterpark-pools-resort-era',
        title: 'Engineering Aquaventure',
        prompt: 'See why water became the resort entertainment engine.',
      },
    ],
  },
]

const CHARACTER_QUESTS = {
  'Governor Woodes Rogers': [
    'Would you pardon me or hang me?',
    'What was the hardest part of ending the pirate republic?',
    'Where would pirates hide if the harbor was watched?',
  ],
  'Anne Bonny': [
    'Would you trust me aboard your ship?',
    'Where should I go in Nassau if I want trouble?',
    'What did pirates understand that governors did not?',
  ],
  Atlas: [
    'Build me a one-hour route from here.',
    'What should I do next based on what I have explored?',
    'Find me something nearby that most guests miss.',
  ],
}

const QUESTS_BY_TYPE = {
  past: [
    'What would surprise you most about this place today?',
    'What danger should I notice first?',
    'Who has power here?',
  ],
  present: [
    'What should I do next from here?',
    'What do guests usually miss?',
    'Turn this into a one-hour plan.',
  ],
  cultural: [
    'What should I listen for?',
    'What would locals know that visitors miss?',
    'What tradition matters most here?',
  ],
  operational: [
    'What happens here before guests arrive?',
    'What system keeps this place running?',
    'What breaks if nobody notices?',
  ],
  future: [
    'What future are you trying to prevent?',
    'What changed first?',
    'What should resorts learn from this?',
  ],
}

const OFFERS_BY_TYPE = {
  past: {
    title: 'Turn the story into a trail',
    description: 'Follow the nearby layers that connect this moment to the rest of the property.',
    cta: 'Open Story Trails',
    action: 'trails',
  },
  present: {
    title: 'Ask Atlas to plan from here',
    description: 'Convert this stop into a practical route, dining idea, or activity plan.',
    cta: 'Ask Atlas',
    action: 'concierge',
  },
  cultural: {
    title: 'Find the cultural layer nearby',
    description: 'Ask Atlas for music, food, art, and local context tied to this part of Atlantis.',
    cta: 'Ask Atlas',
    action: 'concierge',
  },
  operational: {
    title: 'Go behind the scenes',
    description: 'Turn this operational story into a staff-led tour or premium experience prompt.',
    cta: 'Ask Atlas',
    action: 'concierge',
  },
  future: {
    title: 'Explore a future-positive visit',
    description: 'Ask Atlas how conservation, reef restoration, or lower-impact choices connect to this stop.',
    cta: 'Ask Atlas',
    action: 'concierge',
  },
}

export function getStoryTrailForLayer(layerId) {
  return STORY_TRAILS.find((trail) => trail.stops.some((stop) => stop.layerId === layerId))
}

export function getStoryTrailById(trailId) {
  return STORY_TRAILS.find((trail) => trail.id === trailId)
}

export function getTrailStep(trailId, rawStep = 0) {
  const trail = getStoryTrailById(trailId)
  if (!trail) return { trail: null, step: null, stepIndex: 0 }
  const parsed = Number.parseInt(rawStep, 10)
  const stepIndex = Number.isFinite(parsed)
    ? Math.min(Math.max(parsed, 0), trail.stops.length - 1)
    : 0
  return {
    trail,
    step: trail.stops[stepIndex],
    stepIndex,
  }
}

export function getQuestPrompts(character, era) {
  if (!character) return QUESTS_BY_TYPE[era?.era_type] || []
  return CHARACTER_QUESTS[character.name] || QUESTS_BY_TYPE[era?.era_type] || QUESTS_BY_TYPE.past
}

export function getOfferForEra(era) {
  return OFFERS_BY_TYPE[era?.era_type] || OFFERS_BY_TYPE.present
}

export function buildConciergeIntro({ offer, era, locationName }) {
  if (!offer || offer.action !== 'concierge') {
    return null
  }

  return `I can help turn ${era?.label || 'this layer'} at ${locationName || 'this property'} into a real guest plan. Tell me whether you want something quick, premium, family-friendly, or quiet.`
}
