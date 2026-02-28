// Era image system: curated URLs → Picsum fallback.
// All URLs verified via Wikimedia Commons API. Public domain or CC-licensed.

const CURATED = {
  // === San Francisco ===

  // Mission Dolores
  'mission-1776': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/San_Francisco_Mission_Dolores_1898.jpg',
  'mission-1849': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Ships-abandoned-in-Yerba-Buena-Cove-San-Francisco-during-the-California-gold-rush.-1849.jpg',
  'mission-1906': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/San_Francisco_in_ruin_edit2.jpg/1280px-San_Francisco_in_ruin_edit2.jpg',

  // Embarcadero
  'emb-1849': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Ships-abandoned-in-Yerba-Buena-Cove-San-Francisco-during-the-California-gold-rush.-1849.jpg',
  'emb-1906': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/San_Francisco_in_ruin_edit2.jpg/1280px-San_Francisco_in_ruin_edit2.jpg',

  // Montgomery / Financial District
  'fin-1849': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Ships-abandoned-in-Yerba-Buena-Cove-San-Francisco-during-the-California-gold-rush.-1849.jpg',
  'fin-1906': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/San_Francisco_in_ruin_edit2.jpg/1280px-San_Francisco_in_ruin_edit2.jpg',

  // Chinatown
  'ct-1849': 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Toy_Vendor%2C_Chinatown%2C_San_Francisco_%28c1900s%29_Arnold_Genthe_%28RESTORED%29_%284079377018%29.jpg',
  'ct-1906': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/San_Francisco_in_ruin_edit2.jpg/1280px-San_Francisco_in_ruin_edit2.jpg',
  'ct-1945': 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Toy_Vendor%2C_Chinatown%2C_San_Francisco_%28c1900s%29_Arnold_Genthe_%28RESTORED%29_%284079377018%29.jpg',

  // Haight-Ashbury
  'haight-1967': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg/1280px-Hippies_on_Haight-Ashbury_-_The_Greenville_News_%281967%29.jpg',

  // === New York ===

  // Lower Manhattan
  'lm-1664': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Castelloplan.jpg/1280px-Castelloplan.jpg',
  'lm-1929': 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Crowd_outside_nyse.jpg',
  'lm-2001': 'https://upload.wikimedia.org/wikipedia/commons/f/fd/National_Park_Service_9-11_Statue_of_Liberty_and_WTC_fire.jpg',

  // Brooklyn Bridge
  'bb-1863': 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Brooklyn_Bridge_Under_Construction_1878.jpg',
  'bb-1929': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Brooklyn_Bridge_New_York_City_1899_Pedestrian_Crossing.jpg/1280px-Brooklyn_Bridge_New_York_City_1899_Pedestrian_Crossing.jpg',

  // Harlem
  'har-1925': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Three_Harlem_Women%2C_ca._1925.png/1280px-Three_Harlem_Women%2C_ca._1925.png',
  'har-1968': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Black_children_playing_leap_frog_in_a_Harlem_street%2C_ca._1930_-_NARA_-_541880.jpg/1280px-Black_children_playing_leap_frog_in_a_Harlem_street%2C_ca._1930_-_NARA_-_541880.jpg',

  // === London ===

  // South Bank
  'sb-1600': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg/1280px-Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg',
  'sb-1940': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/London_Blitz_9_September_1940.jpg/1280px-London_Blitz_9_September_1940.jpg',
  'sb-1951': 'https://upload.wikimedia.org/wikipedia/commons/0/02/1951_South_Bank_Exhibition.jpg',

  // City of London
  'city-1666': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Great_Fire_London.jpg/1280px-Great_Fire_London.jpg',
  'city-1940': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/The_London_Blitz_1940_HU86166.jpg',
  'city-1066': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg/1280px-Panorama_of_London_by_Claes_Van_Visscher%2C_1616_no_angels.jpg',

  // === Chicago ===

  // The Loop
  'loop-1871': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Chicago_in_Flames_by_Currier_%26_Ives%2C_1871_%28cropped%29.jpg/1280px-Chicago_in_Flames_by_Currier_%26_Ives%2C_1871_%28cropped%29.jpg',
  'loop-1893': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Chicago_World%27s_Columbian_Exposition_1893.jpg/1280px-Chicago_World%27s_Columbian_Exposition_1893.jpg',

  // South Side
  'ss-1871': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Chicago_in_Flames_by_Currier_%26_Ives%2C_1871_%28cropped%29.jpg/1280px-Chicago_in_Flames_by_Currier_%26_Ives%2C_1871_%28cropped%29.jpg',
  'ss-1893': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Court_of_Honor_and_Grand_Basin.jpg',

  // === Los Angeles ===

  // Downtown LA
  'dtla-1910': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Broadway_north_from_Fourth_Street%2C_downtown_Los_Angeles%2C_1903-1905_%28CHS-1876%29.jpg/1280px-Broadway_north_from_Fourth_Street%2C_downtown_Los_Angeles%2C_1903-1905_%28CHS-1876%29.jpg',

  // Venice
  'ven-1905': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Building-Venice-1905.jpg',
  'ven-2000': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Houses_on_Grand_Canal%2C_Venice_Canal_Historic_District%2C_Venice%2C_California.JPG/1280px-Houses_on_Grand_Canal%2C_Venice_Canal_Historic_District%2C_Venice%2C_California.JPG',

  // === Riyadh ===

  // Diriyah
  'dir-2010': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/At-Turaif_District.jpg/1280px-At-Turaif_District.jpg',

  // Empty Quarter
  'eq-1446': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'eq-1744': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'eq-1824': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',
  'eq-1931': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rub_al_Khali_002.JPG/1280px-Rub_al_Khali_002.JPG',

  // === Lagos ===

  // Lagos Island
  'li-1861': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/The_Lagos_City_Hall%2C_Established_in_1900%2C_in_Lagos_State._Nigeria._%281%29.jpg',
  'li-1960': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Tafawa_Balewa_Square_Lagos.jpg/1280px-Tafawa_Balewa_Square_Lagos.jpg',
}

export function getImageUrl(era) {
  if (CURATED[era.id]) {
    return CURATED[era.id]
  }
  return `https://picsum.photos/seed/${era.id}/1080/1920`
}

export function isCurated(eraId) {
  return eraId in CURATED
}
