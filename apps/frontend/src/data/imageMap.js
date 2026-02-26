// Curated Unsplash keyword strings for era-appropriate imagery.
// URL format: https://images.unsplash.com/featured/?{keywords}&w=1080&h=1920&fit=crop

const labelKeywords = {
  // Ohlone / indigenous pre-contact
  'Ohlone Homeland': 'california,nature,redwood,forest,bay',
  'Ohlone Shore': 'california,nature,redwood,forest,bay',
  'The Shore': 'california,nature,redwood,forest,bay',
  'Sacred Hills': 'california,nature,redwood,forest,bay',
  'The Hill': 'california,nature,redwood,forest,bay',

  // Spanish colonial / mission era
  'Spanish Mission': 'california,mission,adobe,historical,architecture',

  // Gold Rush
  'Gold Rush': 'historical,harbor,ships,port,ocean',
  'Gold Rush Port': 'historical,harbor,ships,port,ocean',
  'Gold Rush Banks': 'historical,harbor,ships,port,ocean',
  'First Arrivals': 'historical,harbor,ships,port,ocean',
  'The View Point': 'hills,panorama,city,aerial,california',

  // 1906 earthquake
  'After the Fire': 'ruins,architecture,stone,historical,city',

  // Wartime 1940s
  'Wartime Mission': 'city,street,documentary,urban,1940s',
  'The Industrial Port': 'city,street,documentary,urban,1940s',
  'Postwar Capital': 'city,street,documentary,urban,1940s',
  'Wartime Chinatown': 'city,street,documentary,urban,1940s',
  'The Radio Hills': 'hills,panorama,city,aerial,california',

  // 1960s counterculture
  'Counterculture': 'colorful,street,urban,vintage,california',
  'The Freeway Years': 'colorful,street,urban,vintage,california',
  'The High-Rise Era': 'colorful,street,urban,vintage,california',
  'The Six Companies Era': 'colorful,street,urban,vintage,california',
  "Sutro's Shadow": 'hills,grass,california,nature,golden',

  // Dot-com / late 20th century
  'Dot-com Wave': 'san+francisco,city,urban,modern,street',
  'The Restoration': 'san+francisco,city,urban,modern,street',
  'Dot-com Peak': 'san+francisco,city,urban,modern,street',
  'Holding Ground': 'san+francisco,city,urban,modern,street',
  'The Dot-com View': 'san+francisco,city,urban,modern,street',
}

const typeKeywords = {
  present: 'san+francisco,city,street,urban,morning',
  future: 'architecture,sustainable,green,future,city',
}

export function getImageUrl(era) {
  const keywords =
    labelKeywords[era.label] ||
    typeKeywords[era.era_type] ||
    'san+francisco,california,landscape'

  return `https://images.unsplash.com/featured/?${keywords}&w=1080&h=1920&fit=crop`
}
