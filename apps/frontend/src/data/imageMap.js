// Resort image map: curated Unsplash placeholders for all 45 zone × layer combos.
// Atlantis Bahamas hospitality demo.

const ZONES = ['marina-beach', 'lobby-royal-towers', 'waterpark-pools', 'casino-nightlife', 'marine-habitat']
const LAYERS = ['deep-past', 'colonial', 'early-tourism', 'resort-era', 'modern', 'present', 'culture', 'behind-scenes', 'future']

const CURATED = {
  // ═══════════════════════════════════════════════════════════════════
  // MARINA-BEACH
  // ═══════════════════════════════════════════════════════════════════
  'marina-beach-deep-past':      'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&q=80', // Caribbean coral reef
  'marina-beach-colonial':       'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=800&q=80', // pirate ship on sea
  'marina-beach-early-tourism':  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // vintage tropical beach
  'marina-beach-resort-era':     'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', // resort construction
  'marina-beach-modern':         'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', // luxury resort aerial
  'marina-beach-present':        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', // marina beach day
  'marina-beach-culture':        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80', // Caribbean festival
  'marina-beach-behind-scenes':  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80', // marine engineering
  'marina-beach-future':         'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', // futuristic ocean city

  // ═══════════════════════════════════════════════════════════════════
  // LOBBY-ROYAL-TOWERS
  // ═══════════════════════════════════════════════════════════════════
  'lobby-royal-towers-deep-past':      'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80', // underwater reef
  'lobby-royal-towers-colonial':       'https://images.unsplash.com/photo-1569161031678-f49b4b9ddd7b?w=800&q=80', // old colonial building
  'lobby-royal-towers-early-tourism':  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', // grand hotel vintage
  'lobby-royal-towers-resort-era':     'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80', // resort under construction
  'lobby-royal-towers-modern':         'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', // luxury hotel modern
  'lobby-royal-towers-present':        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', // grand hotel lobby
  'lobby-royal-towers-culture':        'https://images.unsplash.com/photo-1504699439244-b4ef9433a3d4?w=800&q=80', // Caribbean music
  'lobby-royal-towers-behind-scenes':  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80', // engineering room
  'lobby-royal-towers-future':         'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80', // futuristic architecture

  // ═══════════════════════════════════════════════════════════════════
  // WATERPARK-POOLS
  // ═══════════════════════════════════════════════════════════════════
  'waterpark-pools-deep-past':      'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80', // deep ocean
  'waterpark-pools-colonial':       'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80', // old Caribbean harbor
  'waterpark-pools-early-tourism':  'https://images.unsplash.com/photo-1504681869696-d977211a5f4c?w=800&q=80', // vintage swimming pool
  'waterpark-pools-resort-era':     'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80', // waterpark construction
  'waterpark-pools-modern':         'https://images.unsplash.com/photo-1572331165267-854da2b021b1?w=800&q=80', // modern waterpark slide
  'waterpark-pools-present':        'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&q=80', // resort pool day
  'waterpark-pools-culture':        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', // Caribbean food spread
  'waterpark-pools-behind-scenes':  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80', // water filtration system
  'waterpark-pools-future':         'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80', // futuristic water city

  // ═══════════════════════════════════════════════════════════════════
  // CASINO-NIGHTLIFE
  // ═══════════════════════════════════════════════════════════════════
  'casino-nightlife-deep-past':      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', // Caribbean reef fish
  'casino-nightlife-colonial':       'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80', // old tavern
  'casino-nightlife-early-tourism':  'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&q=80', // vintage bar
  'casino-nightlife-resort-era':     'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80', // resort nightclub build
  'casino-nightlife-modern':         'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80', // modern casino floor
  'casino-nightlife-present':        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80', // casino floor active
  'casino-nightlife-culture':        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80', // nightlife music
  'casino-nightlife-behind-scenes':  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', // surveillance / security
  'casino-nightlife-future':         'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&q=80', // futuristic neon city

  // ═══════════════════════════════════════════════════════════════════
  // MARINE-HABITAT
  // ═══════════════════════════════════════════════════════════════════
  'marine-habitat-deep-past':      'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&q=80', // ancient reef
  'marine-habitat-colonial':       'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80', // old sailing ship
  'marine-habitat-early-tourism':  'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&q=80', // early aquarium
  'marine-habitat-resort-era':     'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=800&q=80', // aquarium tank build
  'marine-habitat-modern':         'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80', // modern aquarium
  'marine-habitat-present':        'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&q=80', // aquarium visitors
  'marine-habitat-culture':        'https://images.unsplash.com/photo-1559827291-baf1a9d7e8b4?w=800&q=80', // ocean conservation
  'marine-habitat-behind-scenes':  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80', // marine laboratory
  'marine-habitat-future':         'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', // futuristic underwater city
}

// All present-layer era IDs are BLE-triggered (proximity-aware)
export const BLE_TRIGGERED = new Set([
  'marina-beach-present',
  'lobby-royal-towers-present',
  'waterpark-pools-present',
  'casino-nightlife-present',
  'marine-habitat-present',
])

/**
 * Get curated image URL for an era ID, or null if not found.
 */
export function getCuratedImage(eraId) {
  return CURATED[eraId] || null
}

/**
 * Check whether an era ID is BLE-triggered (present-day proximity layer).
 */
export function isBleTriggered(eraId) {
  return BLE_TRIGGERED.has(eraId)
}

export default CURATED
