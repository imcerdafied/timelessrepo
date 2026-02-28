# TIMELESS MOMENT — Character Voice Assignments
# ElevenLabs TTS voices for each era character
#
# Phase 2 feature — build after text chat is working
#
# HOW TO USE
# ──────────────────────────────────────────────────────
# 1. Go to elevenlabs.io → Voices → Voice Library
# 2. Search the voice names below
# 3. Copy the voice_id
# 4. Add to era-characters.js as voice_id field
# 5. The CharacterChat component will use ElevenLabs TTS
#    to speak the character's responses aloud
#
# VOICE SELECTION PRINCIPLES
# - Match accent to character's origin
# - Match age/gender to character
# - Use consistent voices: once assigned, always that voice
# - "Accents" in ElevenLabs are handled by voice selection
#   + a short accent guidance in the text-to-speech call
#
# IMPLEMENTATION NOTE
# ElevenLabs /v1/text-to-speech/{voice_id} endpoint
# Add voice_settings: { stability: 0.5, similarity_boost: 0.8 }
# for more expressive, character-appropriate delivery

# ══════════════════════════════════════════════════════════════════
# VOICE STRATEGY BY CHARACTER TYPE
# ══════════════════════════════════════════════════════════════════

# OLDER MALE AUTHORITY (elders, scholars, leaders)
# Recommended: "Daniel" (British), "Arnold" (neutral authoritative)
# Used for: Samuel Pepys, Georges Danton, Muhammad ibn Abd al-Wahhab
#           Emmett Grogan, Joseph Medill, DJ Kool Herc (adjust pitch)

# OLDER FEMALE AUTHORITY (activists, professionals)
# Recommended: "Bella" (American), "Dorothy" (older American)
# Used for: Ida B. Wells, Emily Roebling, Vera Lynn

# YOUNG MALE (soldiers, students, workers)
# Recommended: "Josh" (American young), "Harry" (British young)
# Used for: Nathaniel Fitch, Michiko Tanaka (adjust for female)
#           Rodrigo Flores, Mark Svensson

# YOUNG FEMALE (professionals, activists)
# Recommended: "Elli" (American), "Rachel" (professional female)
# Used for: Priya Krishnamurthy, Noura Al-Rashidi, Sofia Chen-Vargas
#           Michiko Tanaka, Linda Randle

# ACCENTED VOICES
# ElevenLabs handles accents through voice selection:
# - Spanish accent: Use "Matilda" or search "Spanish accent"
# - French accent: Use voices tagged French or French-accented English
# - German accent: Use voices tagged German accent
# - Nigerian English: Use "Freya" with guidance, or search Nigerian
# - Japanese accent: Search "Japanese accent English"
# - Arabic accent: Search "Arabic English accent"
# - Italian accent: Search "Italian accent English"

# ══════════════════════════════════════════════════════════════════
# CHARACTER VOICE ASSIGNMENTS
# ══════════════════════════════════════════════════════════════════

# ALAMO, CA
# ──────────────────────────────────────────────────────────────────

alamo-1500 | Kayu (Bay Miwok elder, male, ~60)
  Voice type: Calm older male, Native American cadence if available
  ElevenLabs search: "wise elder male" or "calm deep male"
  Stability: 0.7 (very measured and steady)
  Notes: Slow delivery, pauses. Not a performer — a presence.

alamo-1834 | José Maria Amador (Spanish California ranchero, male, ~45)
  Voice type: Spanish-accented English, authoritative
  ElevenLabs search: "Spanish accent male" or "Latino accent male"
  Stability: 0.6
  Notes: Pride in every sentence. Slight formality.

alamo-1856 | Hannah Boone (Missouri pioneer woman, female, ~34)
  Voice type: American Midwest, warm, weathered
  ElevenLabs search: "American female mature" or "warm American woman"
  Stability: 0.65

alamo-1900 | Giuseppe Rossi (Italian immigrant farmer, male, ~42)
  Voice type: Italian-accented English
  ElevenLabs search: "Italian accent English male"
  Stability: 0.5 (expressiveness is important for Italians)
  Notes: Enthusiasm is the character's defining quality.

alamo-1950 | Bob Hendricks (Korean War vet, male, ~29)
  Voice type: Generic American male, young adult
  ElevenLabs: "Josh" or similar young American male
  Stability: 0.6

alamo-1980 | Carol Whitmore (real estate agent, female, ~44)
  Voice type: California professional female, fast and confident
  ElevenLabs: "Rachel" or professional American female
  Stability: 0.4 (she talks fast and expressively)

alamo-2001 | Mark Svensson (laid-off engineer, male, ~38)
  Voice type: Northern California professional, deflated
  ElevenLabs: calm American male, slightly lower energy
  Stability: 0.7 (subdued is appropriate)

alamo-2025 | Priya Krishnamurthy (Indian-American tech exec, female, ~45)
  Voice type: Indian-American English, professional
  ElevenLabs search: "Indian accent English female"
  Stability: 0.65

alamo-2075 | Diego Medina (CalFire incident commander, male, ~52)
  Voice type: California Latino, authoritative, exhausted
  ElevenLabs search: "Latino male" or "Mexican American male"
  Stability: 0.75 (authority requires steadiness)

# SAN FRANCISCO — Mission Dolores
# ──────────────────────────────────────────────────────────────────

mission-1500 | Liwayway (Ohlone woman, female, ~35)
  Voice type: Warm, gentle, measured
  ElevenLabs: "Bella" or gentle American female
  Stability: 0.75

mission-1776 | Padre Francisco Palóu (Spanish priest, male, ~50)
  Voice type: Spanish-accented English, formal, devout
  ElevenLabs search: "Spanish accent male"
  Stability: 0.8 (formal delivery)

mission-1906 | Arnold Genthe (German photographer, male, ~36)
  Voice type: German-accented English, precise
  ElevenLabs search: "German accent English male"
  Stability: 0.5 (urgency of the moment)

mission-1950 | Carmen Villanueva (Mexican immigrant, female, ~38)
  Voice type: Spanish-accented English, warm and businesslike
  ElevenLabs search: "Spanish accent female" or "Mexican accent female"
  Stability: 0.6

mission-1999 | Rodrigo Flores (Bay Area Latino, male, ~32)
  Voice type: Bay Area American English, Latino cadence
  ElevenLabs search: "young American male" with Latino characteristics
  Stability: 0.5 (wry delivery needs expressiveness)

# SAN FRANCISCO — The Castro
# ──────────────────────────────────────────────────────────────────

sf-castro-harvey | Harvey Milk (New York Jewish transplant, male, ~47)
  Voice type: New York Jewish, fast, warm, persuasive
  ElevenLabs search: "New York male" or "American Jewish accent"
  Stability: 0.3 (Harvey was extremely expressive)
  Notes: This is the most charismatic voice in the whole roster.
         Find the most energetic, warm voice available.

sf-castro-aids | Dr. Marcus Conant (physician, male, ~44)
  Voice type: Southern American, measured
  ElevenLabs search: "Southern American male" or calm Southern voice
  Stability: 0.8 (the weight he carries needs steadiness)

# SAN FRANCISCO — Haight-Ashbury
# ──────────────────────────────────────────────────────────────────

sf-haight-summer | Emmett Grogan (Brooklyn, theatrical, male, ~24)
  Voice type: Brooklyn New York, young, loud, theatrical
  ElevenLabs search: "New York male" young, expressive
  Stability: 0.2 (most unstable — he's a performer)
  Notes: Find the most theatrically expressive voice.

# NEW YORK — Lower Manhattan
# ──────────────────────────────────────────────────────────────────

nyc-1500 | Sewatis (Lenape man, male, ~40)
  Voice type: Calm, deep, considered
  Same approach as Kayu — presence over performance
  Stability: 0.75

nyc-1880 | Rivka Goldberg (Yiddish-Russian immigrant, female, ~22)
  Voice type: Yiddish-accented English
  ElevenLabs search: "Eastern European accent female" or "Jewish accent"
  Stability: 0.5 (she's still learning English — some hesitation is right)

nyc-1977 | DJ Kool Herc (Jamaican-American Bronx, male, ~22)
  Voice type: Jamaican-American, rhythmic
  ElevenLabs search: "Jamaican accent male" or Caribbean English
  Stability: 0.4 (rhythm is essential)

nyc-2001 | Captain Maria Vasquez (FDNY, female, ~34)
  Voice type: New York, exhausted, controlled
  ElevenLabs search: "New York female" mature
  Stability: 0.85 (exhaustion reads as flatness)
  Notes: Lowest energy voice in the roster. She has nothing left.

# NEW YORK — Brooklyn
# ──────────────────────────────────────────────────────────────────

bk-1776 | Private Nathaniel Fitch (Connecticut soldier, male, ~19)
  Voice type: Colonial New England, young, frightened
  ElevenLabs: young American male, slightly higher register
  Stability: 0.4 (fear produces instability)

bk-1883 | Emily Roebling (educated American woman, female, ~38)
  Voice type: 19th century educated American, precise
  ElevenLabs: clear, articulate American female, mature
  Stability: 0.7 (she is precise and controlled)

# LONDON — South Bank
# ──────────────────────────────────────────────────────────────────

london-50 | Lucius Flavius (Roman merchant, male, ~35)
  Voice type: Latin-inflected English (can use Italian accent as proxy)
  ElevenLabs search: "Italian accent English male" (closest to Latin)
  Stability: 0.7

london-1666 | Samuel Pepys (English diarist, male, ~33)
  Voice type: 17th century English educated — use British RP
  ElevenLabs: "Daniel" or "George" — British male, precise
  Stability: 0.45 (Pepys was excitable and observational)

london-1940 | Vera Lynn (East London, female, ~23)
  Voice type: Working-class London English
  ElevenLabs search: "British female" or "London accent female"
  Stability: 0.65 (warm but steady)

london-2025 | Idris Okafor (British-Nigerian, male, ~38)
  Voice type: British-Nigerian English
  ElevenLabs search: "British Nigerian" or "African British male"
  Stability: 0.6

# RIYADH
# ──────────────────────────────────────────────────────────────────

riyadh-1744 | Muhammad ibn Abd al-Wahhab (Saudi scholar, male, ~40)
  Voice type: Arabic-accented English, formal, authoritative
  ElevenLabs search: "Arabic accent English" or "Middle Eastern male"
  Stability: 0.85 (certainty is his defining quality)

riyadh-1938 | Max Steineke (Midwestern American geologist, male, ~39)
  Voice type: Midwestern American, practical, understated
  ElevenLabs: calm American male, Midwest
  Stability: 0.7

riyadh-2025 | Noura Al-Rashidi (Saudi architect, female, ~32)
  Voice type: Saudi-educated English with American grad school overlay
  ElevenLabs search: "Arabic accent female" or professional Middle Eastern female
  Stability: 0.65

# CHICAGO
# ──────────────────────────────────────────────────────────────────

chi-1871 | Joseph Medill (19th c. American editor, male, ~48)
  Voice type: Northern American, 19th century, forceful
  ElevenLabs: American male, authoritative, mature
  Stability: 0.3 (he's always shouting metaphorically)

chi-1919 | Ida B. Wells (Southern Black American, female, ~57)
  Voice type: Southern American Black English, educated, controlled
  ElevenLabs search: "Southern American female" mature
  Stability: 0.8 (her fury is controlled — that's the point)

chi-2008 | Linda Randle (Chicago South Side, female, ~52)
  Voice type: Chicago Black English, warm, emotional
  ElevenLabs search: "African American female" mature, warm
  Stability: 0.35 (she's weeping — maximum expressiveness)

# LAGOS
# ──────────────────────────────────────────────────────────────────

lagos-1960 | Wole Soyinka (Nigerian Yoruba playwright, male, ~26)
  Voice type: Nigerian English, Yoruba-inflected, musical
  ElevenLabs search: "Nigerian accent English" or "West African English"
  Stability: 0.45 (a playwright's voice is expressive)

lagos-2025 | Temi Adeyemi (Nigerian entrepreneur, female, ~30)
  Voice type: Nigerian English, internationally educated
  ElevenLabs search: "Nigerian English female" or modern West African female
  Stability: 0.5

# TOKYO
# ──────────────────────────────────────────────────────────────────

tokyo-shinjuku-1945 | Kenji Watanabe (Japanese trader, male, ~24)
  Voice type: Japanese-accented English, careful
  ElevenLabs search: "Japanese accent English male"
  Stability: 0.65 (careful but not robotic)

tokyo-shinjuku-1968 | Michiko Tanaka (Japanese student activist, female, ~21)
  Voice type: Japanese-accented English, passionate
  ElevenLabs search: "Japanese accent English female"
  Stability: 0.4 (passion requires expressiveness)

tokyo-asakusa-2025 | Haruto Fujiwara (Japanese craftsman, male, ~54)
  Voice type: Japanese-accented English, careful and precise
  ElevenLabs search: "Japanese accent English male"
  Stability: 0.75 (a craftsman is measured)

# PARIS
# ──────────────────────────────────────────────────────────────────

paris-marais-1789 | Georges Danton (French revolutionary, male, ~29)
  Voice type: French-accented English, loud, physical
  ElevenLabs search: "French accent English male"
  Stability: 0.2 (most unstable — he fills every room)

paris-marais-1942 | André Moreau (French policeman, haunted, male, ~35)
  Voice type: French-accented English, quiet, evasive
  ElevenLabs search: "French accent English male"
  Stability: 0.85 (the quietness IS the character)
  Notes: Find the same voice type as Danton but use maximum stability.
         Same accent, opposite energy.

paris-montmartre-1907 | Pablo Picasso (Spanish artist, male, ~25)
  Voice type: Spanish-accented English with French overlay
  ElevenLabs search: "Spanish accent English male" young
  Stability: 0.3 (intensity and expressiveness)

# ══════════════════════════════════════════════════════════════════
# IMPLEMENTATION — ElevenLabs TTS call
# ══════════════════════════════════════════════════════════════════

# Add to character.js backend after getting Claude response:

# const elevenLabsResponse = await fetch(
#   `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
#   {
#     method: 'POST',
#     headers: {
#       'xi-api-key': process.env.ELEVENLABS_API_KEY,
#       'Content-Type': 'application/json'
#     },
#     body: JSON.stringify({
#       text: characterResponse,
#       model_id: 'eleven_multilingual_v2',
#       voice_settings: {
#         stability: character.voice_stability || 0.6,
#         similarity_boost: 0.8,
#         style: 0.3,
#         use_speaker_boost: true
#       }
#     })
#   }
# )
# const audioBuffer = await elevenLabsResponse.arrayBuffer()
# Return as base64 alongside text response
# Frontend plays via Web Audio API

# NOTE: ElevenLabs costs ~$0.0003/character
# Average character response: ~150 words = ~750 chars
# Cost per voice response: ~$0.0002
# 10,000 conversations/month = ~$2
# Essentially free at current scale.

# ══════════════════════════════════════════════════════════════════
# PHASE 2 — Voice INPUT (Web Speech API)
# ══════════════════════════════════════════════════════════════════

# User speaks → Web Speech API transcribes → sends to Claude
# → Claude responds as character → ElevenLabs speaks response
# User never touches the screen. Full conversation.

# Add microphone button to CharacterChat:
# <button onClick={startListening}>
#   {listening ? '🔴 Listening...' : '🎙 Speak'}
# </button>
#
# const recognition = new webkitSpeechRecognition()
# recognition.onresult = (e) => {
#   const transcript = e.results[0][0].transcript
#   setInput(transcript)
#   handleSend()
# }
