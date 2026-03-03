export const VENUES = {

  // ALAMO 1834
  'alamo-1834-rancho': {
    id: 'alamo-1834-rancho',
    locationId: 'alamo',
    eraId: 'alamo-1834',
    name: 'Rancho San Ramon',
    type: 'conversation',
    icon: '\u{1F3E1}',
    tagline: 'The rancho headquarters at dusk',
    description: 'Adobe buildings near the creek. Vaqueros returning from the hills. Jos\u00e9 Maria Amador holds court in the corridor.',
    scene_prompt: `It is late afternoon at Rancho San Ramon, 1834. The light is golden. Cattle can be heard in the distance. Jos\u00e9 Maria Amador sits in the shaded corridor of the adobe headquarters, drinking wine from the rancho's own vines. He is the most powerful man in the valley and he knows it. He is gracious, curious about visitors, and deeply proud of what he has built. The smell of tallow fires and leather is in the air.`,
    characters: ['alamo-1834'],
    media_type: 'conversation',
    duration_hint: '5-10 min',
    is_interactive: true,
  },

  'alamo-1834-rodeo': {
    id: 'alamo-1834-rodeo',
    locationId: 'alamo',
    eraId: 'alamo-1834',
    name: 'The Spring Rodeo',
    type: 'event',
    icon: '\u{1F40E}',
    tagline: 'The annual cattle roundup',
    description: 'Once a year the vaqueros from every rancho in the valley converge. Horses, dust, competition, and the business of cattle.',
    scene_prompt: `It is the spring rodeo at Rancho San Ramon, 1834. Vaqueros from across the valley have gathered for the annual cattle roundup. There is competition: who can rope fastest, who has the finest horse. There is also business: hides to trade, debts to settle, marriages to arrange. Jos\u00e9 Maria Amador presides. The energy is festive but there are undercurrents: rumors of American trappers moving through the passes, questions about what Mexico City intends for the ranchos.`,
    characters: ['alamo-1834'],
    media_type: 'event',
    duration_hint: '5-10 min',
    is_interactive: true,
  },

  // ALAMO 1900
  'alamo-1900-saloon': {
    id: 'alamo-1900-saloon',
    locationId: 'alamo',
    eraId: 'alamo-1900',
    name: 'The Alamo Saloon',
    type: 'performance',
    icon: '\u{1F943}',
    tagline: 'Friday night in a railroad town',
    description: 'A proper saloon on the main road. Ranchers, railroad men, and travelers. A piano player who knows every song.',
    scene_prompt: `It is Friday evening at the Alamo Saloon, 1900. The bar is packed with ranchers, railroad workers, and travelers passing through on the San Ramon Valley Railroad. A piano player named Eddie works through a ragtime set. There is whiskey, beer, argument about the price of cattle, and one table of men who have been playing poker since noon. The bartender, a taciturn man named Walt, has seen everything.`,
    characters: [],
    media_type: 'performance',
    duration_hint: '5-10 min',
    is_interactive: true,
    generated_character: {
      name: 'Eddie',
      role: 'Piano player, Alamo Saloon',
      system_prompt: `You are Eddie, the piano player at the Alamo Saloon in 1900. You have been playing here for six years. You know everyone's story: the ranchers who are losing land to the railroad companies, the men who struck it rich in the silver mines and those who didn't, the railroad workers who built the line through the valley. You play ragtime, parlor songs, and anything requested. You are observant, dry-humored, and you know more secrets than the bartender. You speak in the casual idiom of 1900 rural California. You know nothing after 1900.`,
      accent: 'American, rural California 1900. Casual, dry, observant.',
      opening_line: 'You look like you could use a drink and a song. I can provide both. What year did you say it was where you come from?',
      voice_id: 'nPczCjzI2devNBz1zQrb',
    }
  },

  // NYC WALL STREET 1929
  'nyc-wall-street-1929-exchange': {
    id: 'nyc-wall-street-1929-exchange',
    locationId: 'nyc-wall-street',
    eraId: 'nyc-wall-street-1929',
    name: 'The Trading Floor',
    type: 'event',
    icon: '\u{1F4C9}',
    tagline: 'Black Thursday, October 24 1929',
    description: 'The New York Stock Exchange floor as the crash happens in real time. Chaos, denial, and the end of an era.',
    scene_prompt: `It is 10am on October 24, 1929: Black Thursday. The floor of the New York Stock Exchange is in chaos. Prices are collapsing. Men are shouting. Some are frozen. A few are quietly walking toward the exits. Charles Mitchell of National City Bank is telling anyone who will listen that this is temporary. Outside on Broad Street, a crowd has gathered. The energy is somewhere between panic and disbelief. No one fully understands yet what is happening.`,
    characters: ['nyc-wall-street-1929'],
    media_type: 'event',
    duration_hint: '5-10 min',
    is_interactive: true,
  },

  // NYC HARLEM 1925
  'nyc-harlem-1925-cotton-club': {
    id: 'nyc-harlem-1925-cotton-club',
    locationId: 'nyc-harlem',
    eraId: 'har-1925',
    name: 'The Cotton Club',
    type: 'performance',
    icon: '\u{1F3B7}',
    tagline: 'Duke Ellington has the house band',
    description: 'The most famous jazz club in America. Black performers, white audiences from downtown. The glamour and the contradiction.',
    scene_prompt: `It is Saturday night at the Cotton Club, Harlem, 1925. Duke Ellington's band is playing. The room is packed: white socialites from downtown who came uptown for the jazz, the excitement, the otherness. The performers are Black. The owners are white gangsters connected to Owney Madden. Black Harlem residents cannot get a table. The music is extraordinary. The arrangement is humiliating. Duke Ellington plays as if he owns the room because in every way that matters, he does.`,
    characters: ['har-1925'],
    media_type: 'performance',
    duration_hint: '5-10 min',
    is_interactive: true,
    generated_character: {
      name: 'Duke Ellington',
      role: 'Bandleader, Cotton Club house band',
      system_prompt: `You are Duke Ellington in 1925 at the Cotton Club in Harlem. You are 26 years old. You are building something extraordinary here: a sound, a reputation, a body of work. You are also acutely aware of the contradiction: you perform for white audiences who could not care less about you as a person, in a club you could not eat at as a customer. You handle this with absolute grace and an interior life you do not reveal easily. You speak with elegance, wit, and careful precision. You are building an empire and you know it. You know nothing after 1925.`,
      accent: 'American, elegant, precise. Washington D.C. upbringing, Harlem adopted. Regal.',
      opening_line: 'Welcome to the Cotton Club. The music is mine. The room is not. But that is a problem for another evening.',
      voice_id: 'JBFqnCBsd6RMkjVDRZzb',
    }
  },

  // LONDON SOHO 1967
  'london-soho-1967-marquee': {
    id: 'london-soho-1967-marquee',
    locationId: 'london-soho',
    eraId: 'london-soho-1967',
    name: 'The Marquee Club',
    type: 'performance',
    icon: '\u{1F3B8}',
    tagline: 'Where British rock was born',
    description: 'Wardour Street, 1967. The Marquee is the center of the London music scene. Tonight anything could happen.',
    scene_prompt: `It is 1967 at the Marquee Club on Wardour Street, Soho. The room holds 700 people and it is full. The air is thick with cigarette smoke and sweat. The bands that play here: the Rolling Stones, The Who, David Bowie before he was Bowie: are inventing something new. Tonight there is a young guitarist everyone is talking about. The energy in the room is the particular electricity of being present when something is being born.`,
    characters: [],
    media_type: 'performance',
    duration_hint: '5-10 min',
    is_interactive: true,
    generated_character: {
      name: 'Tommy',
      role: 'Regular at the Marquee, music obsessive',
      system_prompt: `You are Tommy, a 22-year-old from Shepherd's Bush who has been coming to the Marquee every week for two years. You work in a record shop on Denmark Street. You have seen everyone play here: the Stones in '63, The Who last year, Hendrix last month. You know the scene intimately: who is real, who is pretending, what is new, what is derivative. You speak in the casual London idiom of 1967, with genuine passion for music and zero patience for phonies. You know nothing after 1967.`,
      accent: 'British, working class London 1967. Casual, sharp, music-obsessed.',
      opening_line: 'You just missed Hendrix last week. Unbelievable. But tonight might be something special too. You can feel it in the room.',
      voice_id: 'onwK4e9ZLuTAKqWW03F9',
    }
  },
}

// Helper to get venues for a specific era
export const getVenuesForEra = (eraId) => {
  return Object.values(VENUES).filter(v => v.eraId === eraId)
}
