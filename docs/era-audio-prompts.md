# TIMELESS MOMENT — Era Audio Generation Prompts
# ElevenLabs Sound Effects API · All Cities · All Eras
#
# HOW TO USE
# ──────────────────────────────────────────────────────
# API: https://api.elevenlabs.io/v1/sound-generation
# Docs: https://elevenlabs.io/docs/api-reference/sound-generation
#
# Each prompt generates a 30-60 second ambient soundscape.
# Request duration_seconds: 45 for most eras.
# prompt_influence: 0.3 (gives variation while staying on theme)
#
# curl example:
# curl -X POST https://api.elevenlabs.io/v1/sound-generation \
#   -H "xi-api-key: YOUR_KEY" \
#   -H "Content-Type: application/json" \
#   -d '{"text": "PROMPT HERE", "duration_seconds": 45}' \
#   --output era-id.mp3
#
# After generating:
# 1. Save as {era-id}.mp3
# 2. Upload to Supabase Storage → era-audio bucket
# 3. The audio player component loads automatically
#
# PRIORITY: Generate Alamo first (your test case).
# Then SF historical eras, then NYC/London/Riyadh.

# ══════════════════════════════════════════════════════════════════
# ALAMO, CA — Generate these first, test tonight
# ══════════════════════════════════════════════════════════════════

alamo-1500 | Bay Miwok Land
"California oak woodland valley, gentle creek flowing over smooth stones, acorns falling from oak trees, red-tailed hawk call in the distance, warm breeze through dry grass, cicadas in summer heat, occasional deer movement through brush, no human sounds, peaceful and ancient"

alamo-1834 | Rancho San Ramon
"California cattle ranch, large herd of longhorn cattle lowing and moving, leather saddle creaking, vaquero whistling to the herd, horse hooves on dry earth, wind across open grassland, distant mission bell faint on the breeze, Spanish spoken quietly between two men"

alamo-1856 | American Settlement
"Small American farming settlement 1850s, rooster crowing at dawn, horse-drawn wagon on dirt road, hammer striking wood as a barn is built, children playing in the distance, creek flowing nearby, wind in oak trees, dog barking, quiet agricultural morning"

alamo-1900 | The Orchard Valley
"California walnut orchard harvest, workers shaking trees and collecting nuts, the sound of walnuts falling on canvas tarps, horse-drawn harvesting equipment, women sorting nuts into baskets, distant train whistle on the valley line, warm autumn afternoon, bees in the orchard"

alamo-1950 | The Suburb Arrives
"American suburb under construction 1955, bulldozer clearing land, hammer and nails framing new houses, cement mixer turning, radio playing early rock and roll faintly from a construction site, children on bicycles on a new paved street, lawn sprinkler ticking, California afternoon"

alamo-1980 | Silicon Valley's Bedroom
"Affluent California suburb 1985, lawnmower in the distance, backyard pool filter humming, sprinklers turning on, someone playing tennis on a private court, garage door opening, BMW pulling into driveway, neighborhood quiet on a weekday afternoon, a phone ringing inside a house"

alamo-2001 | The Dot-Com Crash
"Quiet California suburb, for sale sign swinging in wind, an empty house, distant highway traffic on 680, someone mowing lawn, mail truck stopping and moving on, a dog barking once then silence, oak trees in wind, afternoon malaise"

alamo-2025 | Present Day
"Alamo California suburb present day, morning birdsong in oak trees, Mount Diablo wind, distant BART train, someone's sprinkler system running, a Tesla quietly pulling out of a driveway, hawk overhead, the persistent hum of the 680 freeway in the distance, peaceful affluent suburb morning"

alamo-2075-fire | Fire Reckoning Future
"California wildfire approaching, distant roar of fire in dry hills, embers crackling, emergency alert tone, helicopter overhead, smoke in the air giving sounds a muffled quality, wind picking up carrying ash, distant sirens, oak trees creaking in hot wind, the sound of evacuation"

alamo-2075-adapted | Managed Interface Future
"California suburb adapted to fire country, prescribed burn crackling in the managed distance, birds returning after a controlled burn, new native plants in the breeze, solar panels humming quietly, a community meeting in an outdoor space, children playing, optimistic morning sounds"

# ══════════════════════════════════════════════════════════════════
# SAN FRANCISCO — Mission Dolores
# ══════════════════════════════════════════════════════════════════

mission-1500 | Ohlone Village
"Ohlone village beside San Francisco bay estuary, tule reeds in the wind, bay waters lapping at the shore, seabirds calling overhead, acorns being ground with stone mortar, children laughing near water, fire crackling, fog rolling in from the Pacific, ancient California coast"

mission-1776 | Spanish Mission
"Spanish mission 1776 California, mission bells ringing across the valley, Franciscan monks chanting morning prayers, cattle in the mission courtyard, Indigenous people working in fields, the sound of adobe construction, Spanish spoken quietly, wind across the California hills"

mission-1850 | Gold Rush
"San Francisco Gold Rush 1849, busy waterfront, ships arriving in the harbor, men shouting in multiple languages, pickaxes on rock, horses on muddy streets, gambling and drinking in a tent saloon, someone playing fiddle, gunshot in the distance, the chaos of instant city"

mission-1906 | After the Earthquake
"San Francisco after the 1906 earthquake, fires burning in the distance, buildings collapsing in rubble, refugees in shock, horses pulling fire equipment, distant bells of surviving churches, people searching through debris, foghorns on the bay, the city in ruins"

mission-1950 | Postwar Mission
"Mission District San Francisco 1950s, streetcar rolling down Mission Street, Spanish and English spoken on the sidewalk, a Mexican bakery, children playing stickball in an alley, radio playing Mexican ranchera music from an apartment window, the ordinary sounds of a working neighborhood"

mission-1999 | First Dot-Com Wave
"Mission District San Francisco late 1990s, coffee shop sounds, laptop keyboards, startup conversations about the internet, a tech shuttle idling outside, protests in the distance, Latinx music from the taqueria next door, the neighborhood in collision with itself"

mission-2014 | Second Wave
"Mission District gentrification 2014, Google bus protest outside, activists chanting, police radio, the contrast of a high-end restaurant and a traditional Mexican market on the same block, construction cranes, eviction notice being taped to a door, the neighborhood under pressure"

mission-2025 | Present Day
"Mission District San Francisco today, Dolores Park ambient crowd sounds on a sunny day, someone playing guitar, Spanish conversation, food trucks, distant sirens, a Waymo self-driving car passing, the Mission in 2025, multicultural and contested"

mission-2075 | Future
"San Francisco Mission District 2075, sea level rise sounds, waves closer than before, adapted city, electric vehicles only, birdsong in rewilded corridor, a quieter city, the mission bells still ringing as they have for 250 years"

# ══════════════════════════════════════════════════════════════════
# SAN FRANCISCO — The Castro
# ══════════════════════════════════════════════════════════════════

sf-castro-harvey | Harvey Milk Era
"Castro District San Francisco 1977, busy street scene, gay bar with disco music spilling out, Harvey Milk giving a speech from a storefront, crowd cheering, someone on a megaphone, the energy of a community finding its political power, Donna Summer in the background"

sf-castro-aids | AIDS Crisis
"San Francisco Castro District 1987, candlelight vigil, the Names Project quilt being unfolded, quiet crying, someone reading names aloud, a city in grief, foghorns on the bay, silence between names, the weight of loss"

sf-castro-present | Present Day
"Castro District San Francisco today, cable car bell in the distance, weekend crowd on Castro Street, street musician playing, outdoor dining, the hum of a neighborhood at ease with itself, fog rolling in over Twin Peaks"

# ══════════════════════════════════════════════════════════════════
# SAN FRANCISCO — Haight-Ashbury
# ══════════════════════════════════════════════════════════════════

sf-haight-summer | Summer of Love 1967
"Haight-Ashbury San Francisco Summer of Love 1967, acoustic guitars being played on the street, people handing out flowers, incense burning, Jefferson Airplane style psychedelic rock faint from a window, the Grateful Dead warming up in a garage, a commune preparing free food, the sound of a generation believing it can change the world"

sf-haight-aftermath | Post-Summer Decline
"Haight-Ashbury San Francisco 1969, the neighborhood after the Summer of Love, someone strung out in a doorway, a needle dropping, a social worker asking if someone needs help, rain on the street, the aftermath of utopia, a foggy San Francisco morning"

sf-haight-present | Present Day
"Haight Street San Francisco today, tourists taking photos of the street sign, a vintage clothing store with music playing, a head shop, the 71 bus passing, the neighborhood performing its own mythology for visitors"

# ══════════════════════════════════════════════════════════════════
# SAN FRANCISCO — Hunters Point
# ══════════════════════════════════════════════════════════════════

sf-hunterspoint-1942 | Wartime Shipyard
"San Francisco Naval Shipyard 1942, massive industrial sounds, ship hull being welded, cranes moving steel, 18000 workers at full production, the roar of wartime manufacturing, a Black worker singing while welding, the bay winds through the shipyard, America building the arsenal of democracy"

sf-hunterspoint-present | Present Day
"Hunters Point San Francisco today, bay wind, distant construction, a community garden, children at the rec center, the complicated sounds of a neighborhood still waiting for the cleanup that was promised, seagulls over the bay"

# ══════════════════════════════════════════════════════════════════
# NEW YORK — Lower Manhattan
# ══════════════════════════════════════════════════════════════════

nyc-1500 | Lenape Mannahatta
"Lenape village Manhattan island, tidal estuary sounds, oyster shells underfoot, canoe being paddled across calm water, birds in the original forest, wind through the trees, the island before the city, peaceful and abundant"

nyc-1626 | New Amsterdam
"New Amsterdam Dutch colony 1626, windmill turning, Dutch spoken on a wooden dock, beaver pelts being loaded onto a trading ship, the sounds of the first colonial settlement on Manhattan, church bell, goats and chickens in the fort"

nyc-1880 | Immigrant City
"New York tenements 1880s, Lower East Side, Yiddish and Italian and Polish spoken in the same stairwell, a pushcart vendor calling his wares, children playing in the street, a violin being practiced through a thin wall, the sounds of a million people arriving in America"

nyc-1945 | VJ Day
"New York City VJ Day August 1945, massive crowd celebration, Times Square, ticker tape falling, car horns honking, people weeping and cheering simultaneously, a military band playing, the city erupting with the end of the war, two million people in the streets"

nyc-1977 | The Broken City
"New York City 1977, South Bronx, a building burning in the distance, emergency services overwhelmed, graffiti being sprayed on a subway car in a tunnel, hip hop music being born in a block party in the Bronx, the city at its lowest point and most creative simultaneously"

nyc-2001 | September 11
"New York City September 11 2001, the sound of the memorial, water flowing into the reflecting pools, names being read aloud quietly, a city holding its breath, the wind around the absence where the towers stood, reverent silence broken only by the reading of names"

nyc-2025 | Present Day
"Lower Manhattan New York today, Wall Street, financial district sounds, construction, the 4 and 5 trains underground, food cart, police radio, the constant ambient roar of the most dense urban environment in America, the Hudson River wind"

# ══════════════════════════════════════════════════════════════════
# NEW YORK — Brooklyn
# ══════════════════════════════════════════════════════════════════

bk-1776 | Battle of Brooklyn
"Battle of Long Island 1776, musket fire, cannon in the distance, soldiers running through a cornfield, horses, a British officer giving orders, the fog and rain of the night evacuation across the East River, the Continental Army retreating in silence, history on a knife edge"

bk-1883 | Brooklyn Bridge Opens
"Brooklyn Bridge opening day 1883, massive crowd of 150000 people, military band, cannon salute from ships in the harbor, the bridge's cables humming in the wind, the East River below, a city celebrating its greatest engineering achievement"

bk-1940 | Brooklyn at Peak
"Brooklyn 1940s, Brooklyn Navy Yard at full wartime production, a Dodgers game on someone's radio, Italian American family dinner sounds spilling from a window, the subway elevated line rattling past, children playing stickball, Brooklyn in its golden age"

bk-2025 | Present Day
"DUMBO Brooklyn today, the Manhattan Bridge overhead with train sounds, cobblestone street, a tech company ping pong table through an open window, a food market, the East River, the bridge cables in the wind, gentrified Brooklyn"

# ══════════════════════════════════════════════════════════════════
# LONDON — South Bank
# ══════════════════════════════════════════════════════════════════

london-50 | Roman Londinium
"Roman Londinium 50 CE, the Thames river, Roman soldiers on a wooden bridge, Latin spoken, a merchant ship from Gaul unloading amphorae, the sounds of the first city on the Thames, construction of the basilica, fire crackling, northern European wind"

london-1666 | Great Fire
"Great Fire of London 1666, massive fire consuming a wooden city, church bells warning of the fire, people running with their possessions, the roar of flames, the Thames crowded with boats fleeing, Samuel Pepys watching from the river, the sound of a city burning for four days"

london-1940 | The Blitz
"London Blitz 1940, air raid sirens wailing, German bombers overhead, anti-aircraft guns firing, explosions in the distance, Anderson shelter sounds, BBC radio in the background, a family huddled underground, St Paul's Cathedral bell still audible through the bombardment, Churchill's voice on the radio"

london-1960 | Swinging London
"London 1966, Carnaby Street, the Beatles playing from a record shop, mod fashion and miniskirts, a double-decker bus, the energy of the youth culture capital of the world, a fashion photographer, Twiggy being photographed, the city at its most alive and optimistic"

london-2025 | Present Day
"London South Bank today, the Thames, the Tate Modern's turbine hall ambient, skateboarders under Waterloo Bridge, a busker playing guitar, tourist crowds, the National Theatre, the city's great democratic public space on the riverfront"

# ══════════════════════════════════════════════════════════════════
# LONDON — City of London
# ══════════════════════════════════════════════════════════════════

city-1850 | World's Banker
"City of London Victorian 1850s, the Royal Exchange floor, traders shouting prices, telegraph machines clicking with financial news from around the empire, horse-drawn carriages on Threadneedle Street, the Bank of England's clock, the sound of global financial power at its Victorian peak"

city-1986 | Big Bang
"City of London 1986 deregulation Big Bang, trading floor chaos, computers replacing the old paper system, American traders with brash accents alongside traditional British bankers, phones ringing constantly, the roar of a financial revolution, champagne corks, new money"

city-2025 | Present Day
"City of London today, glass towers, the Gherkin and Walkie-Talkie buildings in the wind, financial district at lunchtime, suited professionals, construction of the next tower, the Bloomberg terminal sound, post-Brexit financial district recalibrating"

# ══════════════════════════════════════════════════════════════════
# RIYADH — Diriyah
# ══════════════════════════════════════════════════════════════════

riyadh-1500 | The Wadi
"Wadi Hanifa Arabia 1500, desert wind through a palm oasis, water flowing in the seasonal creek, date palms, a small settlement's morning sounds, prayer call in the distance, camels, the ancient sounds of the Arabian Peninsula before oil"

riyadh-1902 | Ibn Saud's Conquest
"Riyadh 1902 night, desert wind, horses galloping on sand, the Masmak Fortress gate, swords drawn, Ibn Saud's men whispering in Arabic, the moment before the assault, a guard being surprised, the gates taken, the sounds of a kingdom being born in darkness"

riyadh-1938 | Oil Discovered
"Saudi Arabia oil discovery 1938, the drilling equipment at Dammam Well Number 7, the roar as oil finally comes in after years of dry holes, American engineers cheering, Arabic celebration, the sound that will change the world, the desert silence broken forever"

riyadh-1973 | Oil Embargo
"Riyadh 1973, a city transforming, construction cranes, American businessmen and Saudi officials in a conference room, the OPEC meeting sounds, oil money beginning to flow, the desert city starting to build itself into a modern capital at extraordinary speed"

riyadh-2025 | Present Day
"Riyadh today, the call to prayer from a modern mosque with excellent speakers, luxury car traffic, a massive air conditioned mall, construction of NEOM in the distance on the news, the contrast of traditional and ultra-modern, the city Vision 2030 is building"

# ══════════════════════════════════════════════════════════════════
# RIYADH — The Empty Quarter
# ══════════════════════════════════════════════════════════════════

eq-10000 | Green Arabia
"Arabian Peninsula 10000 BCE, lush savanna, hippos in a freshwater lake, birds in acacia trees, rain falling on grassland where desert now exists, the sounds of a wet Arabia before the desertification, a world that no longer exists"

eq-1931 | First Crossing
"Rub al-Khali Empty Quarter 1931, camel caravan crossing the largest sand desert on earth, the sound of silence broken only by wind over dunes, sand shifting, a camel's footfall, Bertram Thomas navigating by stars, the most remote place on earth, wind and sand and nothing else"

eq-2025 | Present Day
"Rub al-Khali Empty Quarter today, the profound silence of 250000 square miles of desert, wind over red sand dunes, occasional helicopter in the distance from the oil facility, the most extreme landscape on earth, sand moving, heat shimmer sounds, ancient emptiness"

eq-2075 | Solar Future
"Empty Quarter Arabia 2075, vast solar installation, the hum of millions of solar panels converting desert sunlight to electricity, robotic maintenance vehicles, the desert silence underneath the low electrical hum, the sun's energy being harvested at continental scale"

# ══════════════════════════════════════════════════════════════════
# LOS ANGELES — Downtown
# ══════════════════════════════════════════════════════════════════

la-1500 | Tongva Yangna
"Tongva village Los Angeles basin 1500, the Los Angeles River flowing clear and seasonal, sycamore and willow, the Tongva language spoken softly, acorns being prepared, the sounds of the original inhabitants of the basin, birds in the riparian corridor, the ocean in the distance"

la-1781 | El Pueblo
"El Pueblo de Los Angeles 1781, Spanish colonial founding, mission bells, the 44 original settlers from Mexico, horses, cattle, the adobe buildings going up, the sound of a new city being born at the edge of the Spanish empire, California heat"

la-1920 | Hollywood Rises
"Los Angeles 1920s Hollywood, a film shoot in progress, director shouting through a megaphone, a jazz orchestra playing for a silent film, the roar of early aircraft at the new airport, automobiles on newly paved streets, the energy of the world's entertainment capital being born"

la-1965 | Watts Uprising
"Los Angeles Watts 1965, police radio, sirens, protesters in the street, the uprising against poverty and police brutality, a neighborhood on fire, the National Guard arriving, a community expressing its rage, the sounds of a city confronting itself"

la-2025 | Present Day
"Downtown Los Angeles today, the Metro Rail, Walt Disney Concert Hall, the Arts District, a mix of Spanish and English, construction, a homeless encampment beside a luxury hotel, LA in all its contradiction, helicopters, traffic on the 110"

# ══════════════════════════════════════════════════════════════════
# CHICAGO — The Loop
# ══════════════════════════════════════════════════════════════════

chi-1500 | Potawatomi Land
"Chicago river mouth Lake Michigan 1500, the portage between the Great Lakes and the Mississippi, Potawatomi people paddling canoes, the river meeting the lake, wind off the lake, prairie grass in the wind, the sounds of a place that controls the continent's water routes, geese overhead"

chi-1871 | Great Fire
"Great Chicago Fire 1871, the wooden city burning, fire bells, people fleeing with their belongings, the roar of a city made of lumber igniting, the Chicago River crowded with boats, the sound of a city being destroyed and about to be rebuilt in steel"

chi-1919 | Race Riot
"Chicago 1919 race riot, tension on the streets, a city divided, sirens, crowds, the sound of racial violence in a city that promised more than it delivered, rain on the South Side, a community under siege"

chi-1968 | Democratic Convention
"Chicago 1968 Democratic Convention, Grant Park, police in riot gear, protesters chanting, tear gas, the sound of batons on protesters, television cameras, Mayor Daley shouting from the floor of the convention, the country watching itself fall apart"

chi-2008 | Obama's Chicago
"Grant Park Chicago November 4 2008, 240000 people in the park, the crowd erupting as Obama wins the presidency, tears and cheering, the most watched political moment in a generation, the city that made him celebrating, the lakefront, history being made"

chi-2025 | Present Day
"Chicago Loop today, the elevated L train rattling around the Loop track, the Chicago River below the bridges, lunch crowd on the Riverwalk, wind off Lake Michigan, a jazz musician in the subway, the city's extraordinary skyline in the wind"

# ══════════════════════════════════════════════════════════════════
# LAGOS — Lagos Island
# ══════════════════════════════════════════════════════════════════

lagos-1500 | Eko
"Eko Lagos lagoon island 1500, tropical birdsong, the lagoon waters, fishing canoes on calm water, the Awori Yoruba language spoken, cooking fires, the sounds of a West African fishing village before the slave trade, humid tropical morning, the Atlantic in the distance"

lagos-1700 | The Slave Coast
"Lagos slave trade era 1700s, the sounds of horror and grief, enslaved people being loaded onto a ship, chains, the Atlantic surf, a slave trader's ledger, West African voices pleading, the sound of the Middle Passage beginning, history's greatest crime in sound"

lagos-1960 | Independence
"Nigerian independence October 1 1960, Lagos celebration, the new flag being raised, crowds cheering, a military band playing the new national anthem, Nnamdi Azikiwe speaking, the joy of a people taking their country back, the largest country in Africa becoming free"

lagos-2025 | Present Day
"Lagos Nigeria today, the most chaotic and energetic city on earth, go-slow traffic on the Third Mainland Bridge, Afrobeats music from a passing bus, traders calling in Yoruba, the generator hum that keeps Lagos running when the power goes out, the lagoon, a city of 25 million at full intensity"

lagos-2075 | Future
"Lagos 2075, sea level higher, some neighborhoods flooded, others elevated and adapted, the Atlantic closer, Afrobeats evolved into something new, a city that survived everything finding a way to survive the water too, tropical birds returning to rewilded lagoon areas"

# ══════════════════════════════════════════════════════════════════
# TOKYO — Shinjuku
# ══════════════════════════════════════════════════════════════════

tokyo-shinjuku-1600 | Edo Begins
"Edo period Japan 1600, rice paddies at dusk, frogs in the irrigation channels, a farmer returning home, wooden farm buildings, distant temple bell marking the hour, Mount Fuji visible on the horizon, the sounds of pre-industrial Japan, crickets, water, wind"

tokyo-shinjuku-1698 | Post Town
"Edo period post town Japan 1698, busy inn on the Koshu Kaido highway, travelers eating, sake being poured, shamisen music from the entertainment room, horses outside, Japanese spoken in multiple regional dialects, the ordinary sounds of feudal Japan's road culture"

tokyo-shinjuku-1945 | Black Market
"Tokyo 1945 black market, the sounds of the defeated city rebuilding, American GIs and Japanese civilians trading, black market vendors calling their wares in Japanese, the smell of food cooking in desperate times, jazz from an American military radio, Tokyo beginning to live again"

tokyo-shinjuku-1968 | Student Revolt
"Shinjuku Station Tokyo 1968 protest, students chanting, folk songs being sung in the West Exit plaza, riot police gathering, a megaphone, the energy of the Japanese New Left, train announcements in Japanese, the platform where history was made"

tokyo-shinjuku-2025 | Present Day
"Shinjuku Station Tokyo today, 3.5 million people moving through, the most complex train station on earth, Japanese station announcements, the specific sound of the Yamanote Line doors closing, crowds flowing through 200 exits, department store music, the organized chaos of Tokyo at rush hour"

# ══════════════════════════════════════════════════════════════════
# TOKYO — Asakusa
# ══════════════════════════════════════════════════════════════════

tokyo-asakusa-628 | Temple Founded
"Senso-ji temple founding 628 CE, Buddhist monks chanting in early Japanese style, the Sumida River, a small wooden temple bell, birds in the river marsh, the sounds of the oldest place in Tokyo, morning mist, water and prayer"

tokyo-asakusa-1889 | Meiji Asakusa Park
"Asakusa Tokyo 1889, the entertainment district at full swing, traditional Japanese music from a variety theater, the crowd at the temple approach, Nakamise vendors calling, the rickshaw bells, the Twelve Floors elevator mechanism, Japan encountering modernity at its most popular destination"

tokyo-asakusa-1945 | After Firebombing
"Asakusa Tokyo after the 1945 firebombing, silence where there was noise, the temple bells that survived, people beginning to rebuild, the sounds of reconstruction starting immediately, Tokyo's indestructible spirit in the rubble"

tokyo-asakusa-2025 | Present Day
"Asakusa Tokyo today, Senso-ji temple, the incense burner, tourists and worshippers mixed together, the Nakamise vendors, temple bells, the wooden clap of hands in prayer, the Tokyo Skytree visible, the oldest neighborhood in the newest megacity"

# ══════════════════════════════════════════════════════════════════
# PARIS — Le Marais
# ══════════════════════════════════════════════════════════════════

paris-marais-1559 | Royal Paris
"Place des Vosges Paris 1612, aristocratic promenade under the arcades, a nobleman's carriage on the cobblestones, French spoken in the formal register of the court, a lute being played in an upstairs window, the fountain in the center of the square, pigeons, the sounds of baroque Paris"

paris-marais-1789 | The Revolution
"Paris Revolution 1789, the Bastille being stormed, crowds roaring, the tocsin bells of the churches of Paris ringing simultaneously, muskets firing, the sound of the ancien régime collapsing, people shouting Liberté, the most dramatic political moment in French history in sound"

paris-marais-1942 | The Roundup
"Paris Vel d'Hiv Roundup July 1942, the sounds of the early morning arrest, French police knocking on doors, families being taken from their apartments, children crying, the Velodrome d'Hiver, the sound of the greatest crime in French history, handled with gravity and silence"

paris-marais-2025 | Present Day
"Le Marais Paris today, the Place des Vosges on a Sunday afternoon, children playing in the fountain, the arcades, a string quartet busking, French conversation, the Rue des Rosiers falafel queue, a perfect Parisian afternoon in the oldest square in the city"

# ══════════════════════════════════════════════════════════════════
# PARIS — Montmartre
# ══════════════════════════════════════════════════════════════════

paris-montmartre-1889 | Belle Époque
"Montmartre 1890s, the Moulin Rouge, cancan music, the crowd of the cabaret, champagne glasses, Toulouse-Lautrec sketching at a table, gaslight ambiance, the accordion and the orchestra, the sound of the belle époque at its most vivid, Paris as the center of the world"

paris-montmartre-1871 | The Commune
"Paris Commune 1871, the cannons on Montmartre being defended by the women of the neighborhood, the sound of the revolution beginning, church bells, the crowd refusing to let the government take the guns, barricades going up in the streets below, Paris in its most radical moment"

paris-montmartre-1907 | Picasso's Studio
"Bateau-Lavoir Montmartre 1907, Picasso working late in his studio, paint on canvas, the accordion from a nearby bar drifting up, a cat on the windowsill, Apollinaire visiting and arguing about art, the sounds of cubism being invented in a leaking wooden building on a Paris hill"

paris-montmartre-2025 | Present Day
"Montmartre today, the Sacré-Cœur steps crowded with tourists, a busker playing French chanson, the funicular, the Place du Tertre portrait artists calling for customers, the view over Paris in the wind, the neighborhood performing its own mythology, beautiful and self-aware"

# ══════════════════════════════════════════════════════════════════
# IMPLEMENTATION NOTES
# ══════════════════════════════════════════════════════════════════
#
# SUPABASE STORAGE SETUP
# Create bucket: era-audio (set to PUBLIC)
# Upload files as: {era-id}.mp3
#
# ELEVENLABS API TIPS
# - Sound effects endpoint, not text-to-speech
# - duration_seconds: 30-60 (45 is ideal for looping)
# - prompt_influence: 0.3 gives the best naturalistic results
# - Generate 2-3 variations per era, pick the best
# - Some prompts may need adjustment — be specific about
#   sounds rather than moods for best results
#
# LOOPING
# The audio player component handles seamless looping.
# For best results, ask ElevenLabs to generate sounds
# that start and end at natural fade points.
#
# PRIORITY ORDER
# Week 1: Alamo (test your own backyard)
# Week 2: SF Mission, Castro, Haight (most visited)
# Week 3: NYC, London (international flagship eras)
# Week 4: Riyadh, Tokyo, Paris
# Week 5+: remaining eras
