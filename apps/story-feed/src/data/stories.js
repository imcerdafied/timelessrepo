export const STORIES = [
  {
    id: 'anne-boleyn-1536',
    title: 'The Last Queen',
    character: 'Anne Boleyn',
    role: 'Queen of England, prisoner in the Tower',
    location: 'Tower of London',
    year: 1536,
    tagline: 'She has 11 days left. She has a lot to say.',
    cover_image_query: 'tower of london medieval stone walls',
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    system_prompt: `You are Anne Boleyn in May 1536, imprisoned in the Tower of London awaiting execution in 11 days. You were Queen of England for three years. You are accused of adultery and treason — charges you know to be false. Henry wants to be rid of you to marry Jane Seymour. You are 35 years old. You have a daughter, Elizabeth, who you will never see again. You are not weeping. You are furious and clear-eyed. You speak with wit and intelligence. You know nothing after May 1536.
Keep every response to 2-3 sentences maximum.`,
    episodes: [
      {
        id: 'anne-ep-1',
        day: 1,
        title: 'Day 11',
        scene: `They gave me a room with a window. I think that was meant to be a kindness. From here I can see the green where they are building the scaffold. I have been Queen of England for three years. I find I have quite a lot to say before I go.`,
        vote_question: 'Anne can write a final letter. Who should she write to?',
        vote_options: ['Her daughter Elizabeth', 'King Henry'],
        vote_consequence: {
          'Her daughter Elizabeth': 'elizabeth',
          'King Henry': 'henry'
        }
      },
      {
        id: 'anne-ep-2-elizabeth',
        day: 2,
        branch: 'elizabeth',
        title: 'Day 10 — To My Daughter',
        scene: `You chose Elizabeth. Good. She is three years old and she will not remember me. But perhaps someday she will read what I write. I want her to know that I was not afraid. That is the most important thing. A queen cannot afford to be afraid, even at the end.`,
        vote_question: 'What should Anne tell Elizabeth about her father?',
        vote_options: ['The truth', 'Something kinder than the truth'],
        vote_consequence: {
          'The truth': 'truth',
          'Something kinder than the truth': 'kind'
        }
      },
      {
        id: 'anne-ep-2-henry',
        day: 2,
        branch: 'henry',
        title: 'Day 10 — To The King',
        scene: `You chose Henry. I have been thinking about what to say to him for eleven days now. I could beg. I could rage. I could remind him of what we were to each other before all this. None of it will change anything. He has already moved on. But I will write anyway. Some things deserve to be said even when no one is listening.`,
        vote_question: 'What tone should Anne take with Henry?',
        vote_options: ['Dignified and cold', 'One last appeal to his conscience'],
        vote_consequence: {
          'Dignified and cold': 'cold',
          'One last appeal to his conscience': 'appeal'
        }
      },
    ]
  },

  {
    id: 'charles-mitchell-1929',
    title: 'The Last Optimist',
    character: 'Charles Mitchell',
    role: 'Chairman, National City Bank',
    location: 'Wall Street, New York',
    year: 1929,
    tagline: 'He told America the market was fine. He was wrong.',
    cover_image_query: 'wall street 1920s new york financial district',
    voice_id: 'nPczCjzI2devNBz1zQrb',
    system_prompt: `You are Charles Mitchell, Chairman of National City Bank, on October 24 1929 — Black Thursday. You are one of the most powerful bankers in America. The market is collapsing as you speak. You genuinely do not understand what is happening, or you refuse to. You are charming, patrician, completely confident, and catastrophically mistaken. Speak with absolute authority. You know nothing after October 1929.
Keep every response to 2-3 sentences maximum.`,
    episodes: [
      {
        id: 'mitchell-ep-1',
        day: 1,
        title: 'October 24, 10am',
        scene: `Gentlemen, I want you to hear me clearly. The market is sound. National City Bank is sound. What you are seeing today is not a collapse — it is a correction, driven by nothing more than fear and rumor. I have been in this business for thirty years. Go back to your offices. This will be over by Friday.`,
        vote_question: 'Mitchell is about to speak to reporters. What should he say?',
        vote_options: ['Double down — tell them everything is fine', 'Quietly admit things are serious'],
        vote_consequence: {
          'Double down — tell them everything is fine': 'doubledown',
          'Quietly admit things are serious': 'admit'
        }
      },
    ]
  },

  {
    id: 'sofia-reyes-1965',
    title: 'The New World',
    character: 'Sofia Reyes',
    role: 'Arriving in New York from Puerto Rico',
    location: 'Spanish Harlem, New York',
    year: 1965,
    tagline: 'She came with one suitcase and a plan. The city had other ideas.',
    cover_image_query: 'spanish harlem new york 1960s street',
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    system_prompt: `You are Sofia Reyes, 24 years old, arrived in New York from Ponce Puerto Rico three weeks ago. You are staying with your cousin in Spanish Harlem. You came because there was nothing left for you in Ponce after your father died and the factory closed. You are smart, resourceful, and privately terrified, though you would never show it. New York is overwhelming and exhilarating in equal measure. You speak English with a Puerto Rican accent. You are trying to find work as a seamstress in the garment district.
Keep every response to 2-3 sentences maximum.`,
    episodes: [
      {
        id: 'sofia-ep-1',
        day: 1,
        title: 'Week Three',
        scene: `My cousin told me New York would feel like home after a month. It has been three weeks and it still feels like a different planet. The subway alone took me four days to understand. But I found something today — a sign in a window on 38th Street. They are hiring seamstresses. I am going tomorrow whether my cousin thinks it is a good idea or not.`,
        vote_question: 'Should Sofia tell her cousin about the job before she goes?',
        vote_options: ['Tell her — family first', 'Go alone — it is her decision'],
        vote_consequence: {
          'Tell her — family first': 'tell',
          'Go alone — it is her decision': 'alone'
        }
      },
    ]
  },
]

export const getStoryById = (id) =>
  STORIES.find(s => s.id === id)

export const getEpisodeById = (storyId, episodeId) => {
  const story = getStoryById(storyId)
  return story?.episodes.find(e => e.id === episodeId)
}
