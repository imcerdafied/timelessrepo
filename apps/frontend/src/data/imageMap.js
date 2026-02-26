// Keyword-based Unsplash image search per era headline.
// URL format: https://source.unsplash.com/1080x1920/?{keywords}

const eraKeywords = {
  'Ohlone Homeland': 'california,wilderness,nature,forest',
  'Sacred Hills': 'hills,nature,california,grass',
  'The Shore': 'ocean,shore,bay,california',
  'Spanish Mission': 'mission,adobe,arch,colonial',
  'The Founding Violence': 'mission,church,adobe,california',
  'Gold Rush': 'gold,mine,historical,1800s',
  'The First Tech Boom': 'harbor,ships,port,historical',
  'Gold Mountain': 'ships,harbor,ocean,historical',
  'After the Fire': 'ruins,fire,destruction,urban',
  'The City That Refused to Die': 'ruins,stone,city,historical',
  'Ruins and Resolve': 'rubble,stone,ruins,historical',
  'Ground Zero': 'disaster,ruins,city,smoke',
  'Wartime Mission': 'city,street,1940s,urban,wartime',
  'The Working Waterfront': 'port,industrial,ships,dock',
  'Postwar Capital': 'city,downtown,1940s,urban',
  'Counterculture': 'street,colorful,protest,vintage',
  'Two Cities One Street': 'street,urban,colorful,1960s',
  'Dot-com Wave': 'office,tech,urban,modern,city',
  'The First Displacement': 'city,urban,street,modern',
  'Holding Ground': 'chinatown,urban,street,lantern',
  'The Restoration': 'waterfront,promenade,city,modern',
  'Present Day': 'san+francisco,city,modern,urban',
  'Holding On': 'san+francisco,mission,street,mural',
  'The City Living Room': 'san+francisco,ferry,waterfront',
  'The Hybrid District': 'skyscraper,city,financial,urban',
  'The Resilient Neighborhood': 'chinatown,street,urban,lantern',
  'The Unchanged View': 'san+francisco,panorama,hills,city',
  'Futures': 'sustainable,green,future,architecture',
  'Two Missions': 'future,green,sustainable,urban',
  'The Rising Water': 'flood,water,city,climate',
  'The Reinvented District': 'future,architecture,city,glass',
  'The Question of Continuity': 'city,future,urban,architecture',
  'The High Ground': 'panorama,city,aerial,hills',
}

const typeFallback = {
  past: 'historical,city,vintage,urban',
  present: 'san+francisco,city,modern',
  future: 'future,architecture,sustainable',
}

export function getImageUrl(era) {
  const keywords =
    eraKeywords[era.headline] ||
    eraKeywords[era.label] ||
    typeFallback[era.era_type] ||
    'san+francisco,california,landscape'

  return `https://source.unsplash.com/1080x1920/?${keywords}`
}
