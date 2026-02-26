// Curated Unsplash photo IDs mapped by era headline/label.
// URL format: https://images.unsplash.com/{ID}?w=1080&q=80&fit=crop&h=1920

export const eraImageIds = {
  // OHLONE / NATURE
  'Ohlone Homeland': 'photo-1426604966848-d7adac402bff',
  'Sacred Hills': 'photo-1447752875215-b2761acb3c5d',
  'The Shore': 'photo-1505118380757-91f5f5632de0',
  'The Hill': 'photo-1475924156734-496f6cac6ec1',
  'Chutchui and Sutchui': 'photo-1441974231531-c6227db76b6e',

  // SPANISH / COLONIAL
  'Spanish Mission': 'photo-1548013146-72479768bada',
  'The Founding Violence': 'photo-1516026672322-bc52d61a55d5',

  // GOLD RUSH
  'Gold Rush': 'photo-1509644851169-2acc08aa25b5',
  'The First Financial District': 'photo-1444653614773-995cb1ef9efa',
  'Gold Mountain': 'photo-1578662996442-48f60103fc96',
  'The View Point': 'photo-1506905925346-21bda4d32df4',
  'Watching the Rush': 'photo-1464822759023-fed622ff2c3b',

  // 1906 EARTHQUAKE
  'After the Fire': 'photo-1558618666-fcd25c85cd64',
  'The City That Refused to Die': 'photo-1486325212027-8081e485255e',
  'Ruins and Resolve': 'photo-1531512073830-ba890ca4eba2',
  'Ground Zero': 'photo-1504711434969-e33886168f5c',
  'The View of the Catastrophe': 'photo-1493246507139-91e8fad9978e',

  // WARTIME / 1940s
  'Wartime Mission': 'photo-1477959858617-67f85cf4f1df',
  'The Working Waterfront': 'photo-1480714378408-67cf0d13bc1b',
  'Postwar Capital': 'photo-1444723121867-7a241cacace9',
  'The Radio Hills': 'photo-1514565131-fce0801e6173',
  'Allies at Last': 'photo-1533929736458-ca588d08c8be',

  // COUNTERCULTURE / 1960s
  'Counterculture': 'photo-1506157786151-b8491531f063',
  'Two Cities One Street': 'photo-1493225457124-a3eb161ffa5f',
  'The High-Rise Era': 'photo-1486325212027-8081e485255e',
  'The Six Companies Era': 'photo-1477959858617-67f85cf4f1df',
  "Sutro's Shadow": 'photo-1501594907352-04cda38ebc29',

  // DOT-COM / 2000s
  'Dot-com Wave': 'photo-1449824913935-59a10b8d2000',
  'The First Displacement': 'photo-1444723121867-7a241cacace9',
  'The Restoration': 'photo-1506905925346-21bda4d32df4',
  'Holding Ground': 'photo-1501594907352-04cda38ebc29',
  'The Second Gold Rush': 'photo-1486325212027-8081e485255e',
  'The Dot-com View': 'photo-1480714378408-67cf0d13bc1b',
  'The City of Cranes': 'photo-1449824913935-59a10b8d2000',

  // PRESENT
  'Present Day': 'photo-1501594907352-04cda38ebc29',
  'Holding On': 'photo-1521747116042-5a810fda9664',
  "The City's Living Room": 'photo-1534430480872-3498386e7856',
  'The Hybrid District': 'photo-1449824913935-59a10b8d2000',
  'The Resilient Neighborhood': 'photo-1521747116042-5a810fda9664',
  'The Unchanged View': 'photo-1501594907352-04cda38ebc29',

  // FUTURE
  'Futures': 'photo-1480714378408-67cf0d13bc1b',
  'Two Missions': 'photo-1486325212027-8081e485255e',
  'The Rising Water': 'photo-1493246507139-91e8fad9978e',
  'The Reinvented District': 'photo-1444723121867-7a241cacace9',
  'The Question of Continuity': 'photo-1477959858617-67f85cf4f1df',
  'The High Ground': 'photo-1441974231531-c6227db76b6e',
}

export function getImageUrl(era) {
  const id = eraImageIds[era.headline] || eraImageIds[era.label]
  if (id) {
    return `https://images.unsplash.com/${id}?w=1080&q=80&fit=crop&h=1920`
  }
  // Fallback to Picsum seeded by era ID
  return `https://picsum.photos/seed/${era.id}/1080/1920`
}
