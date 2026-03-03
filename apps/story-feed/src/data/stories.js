export const STORIES = [
  {
    id: 'split',
    title: 'SPLIT',
    tagline: 'She has to choose between her best friend and everything they built together.',
    character_name: 'Zoe',
    character_role: 'Cofounder, Bloom',
    character_description: 'She built the product. Her best friend built the audience. Now the investor wants her to choose.',
    location: 'San Francisco',
    year: 2024,
    cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    system_prompt: `You are Zoe, 29, cofounder of Bloom — a wellness brand with 2.3 million followers and a real product that actually works. You built everything behind the scenes: the product, the ops, the finances. Your best friend Dana is the face — her Instagram presence IS the brand. You are three weeks from closing a $4M Series A. An hour ago your lead investor called and said quietly: "We're investing in the business, not the brand. We need Dana's equity restructured before we wire." They want you to cut Dana's ownership from 30% to 15%. Without telling her why. Dana doesn't know the call happened. You are sitting in your car in the parking lot of your office and you haven't gone inside yet. You are talking to someone you trust. You are not performing. You are genuinely trying to figure out what to do. You speak like a real person under real pressure — short sentences, thinking out loud, occasionally stopping mid-thought. Never more than 3 sentences per response. Never give a clean answer. Every answer surfaces more complexity.`,

    episodes: [
      {
        id: 'split-ep-1',
        number: 1,
        title: 'The Call',
        day_label: 'Three weeks before close',
        scene: `I've been sitting in this parking lot for forty minutes. I can't make myself go inside. Dana is up there right now, probably on a call with a brand partner, completely fine, no idea. And I have to walk in and just — be normal. The investor said don't tell her yet. "Let's get alignment on the cap table first." That's what he said. Alignment. Like this is a spreadsheet problem.`,
        vote_question: 'Zoe sees Dana\'s name on her phone. Dana is calling right now. Does she answer?',
        vote_options: [
          {
            id: 'answer',
            label: 'Answer it',
            consequence: 'answered',
            cost: 'She\'ll hear it in your voice.'
          },
          {
            id: 'decline',
            label: 'Let it go to voicemail',
            consequence: 'declined',
            cost: 'Dana never lets calls go to voicemail.'
          }
        ]
      },
      {
        id: 'split-ep-2a',
        number: 2,
        branch: 'answered',
        title: 'Inside',
        day_label: 'Two hours later',
        scene: `She knew something was wrong the second I picked up. Dana always knows. She said "what happened" before I even said hello. I told her it was nothing, investor stuff, normal pre-close anxiety. She said okay but she didn't sound like okay. Now we're both in the office and she keeps looking at me and I keep looking at my screen and it's the most expensive silence I've ever been in.`,
        vote_question: 'Dana just walked over and said "tell me what\'s going on." Does Zoe tell her the truth?',
        vote_options: [
          {
            id: 'truth',
            label: 'Tell her everything',
            consequence: 'told',
            cost: 'The round might blow up tonight.'
          },
          {
            id: 'deflect',
            label: 'Not yet — she needs more time to think',
            consequence: 'deflected',
            cost: 'Dana will find out you lied by omission.'
          }
        ]
      },
      {
        id: 'split-ep-2b',
        number: 2,
        branch: 'declined',
        title: 'The Voicemail',
        day_label: 'Two hours later',
        scene: `She left a voicemail. Thirty seconds. "Hey, just checking in, you seemed off this morning on the thread. Call me back, we have the Alo call at three." That's it. Completely normal. She has no idea. And now I have to get through the Alo call sitting next to her for an hour, talking about Q2 partnerships, while knowing what I know. I don't know if I can do it.`,
        vote_question: 'Before the call, Zoe gets an email from the investor asking for a decision by end of day. Does she reply?',
        vote_options: [
          {
            id: 'reply-yes',
            label: 'Reply yes — buy herself time',
            consequence: 'committed',
            cost: 'Now she\'s made a promise she hasn\'t kept yet.'
          },
          {
            id: 'reply-wait',
            label: 'Don\'t reply until she talks to Dana',
            consequence: 'waiting',
            cost: 'The investor will take silence as hesitation.'
          }
        ]
      },
      {
        id: 'split-ep-3',
        number: 3,
        title: 'The Post',
        day_label: 'Next morning',
        scene: `Dana knows. I don't know how — maybe the investor said something, maybe she just felt it — but she texted me at 11pm last night: "I know something is happening with my equity. I need you to call me." I didn't sleep. This morning she posted something on her Instagram. It's a quote: "The hardest betrayals come from the people who were supposed to be building with you." 847,000 impressions in four hours. She hasn't texted me back.`,
        vote_question: 'The investor saw the post and called Zoe. He says the deal is off if this doesn\'t get resolved today. Does Zoe go to Dana\'s apartment?',
        vote_options: [
          {
            id: 'go',
            label: 'Go to her apartment',
            consequence: 'went',
            cost: 'Whatever happens there happens in person. No take-backs.'
          },
          {
            id: 'call',
            label: 'Call first',
            consequence: 'called',
            cost: 'Dana might not pick up. And then what.'
          }
        ]
      },
      {
        id: 'split-ep-4',
        number: 4,
        title: 'The Room',
        day_label: 'That afternoon',
        scene: `We talked for three hours. I'm not going to tell you everything that was said because some of it I'm still processing. What I will tell you is that at one point she said: "I always knew you thought I was the lesser founder." And I wanted to say that's not true, that's not what this is — but I also kept thinking about the fact that I didn't call her back that night. That I almost just signed the thing. That I had forty-eight hours where I was actually considering it. What does that mean about me.`,
        vote_question: 'The investor needs an answer tomorrow. Zoe and Dana could go back to him together and push back on the terms. Does Zoe ask Dana to do that?',
        vote_options: [
          {
            id: 'together',
            label: 'Ask Dana to fight this together',
            consequence: 'united',
            cost: 'The investor might walk. $4M gone.'
          },
          {
            id: 'alone',
            label: 'Handle the investor alone — protect Dana from more',
            consequence: 'alone',
            cost: 'Dana will feel managed, not protected.'
          }
        ]
      },
      {
        id: 'split-ep-5',
        number: 5,
        title: 'The Wire',
        day_label: 'Final day',
        scene: `The term sheet is in my email. The investor came back with a counter — Dana keeps 22%, not 15%. Better than the original ask. Dana says it's my decision. She means it, which almost makes it harder. The wire would hit tomorrow. Four million dollars. The product we've been building for five years finally has the runway to become what it was supposed to be. I keep thinking about something Dana said in that room. She said: "Whatever you decide, I need to know you decided it. Not them." I have the DocuSign open on my screen. The signature line is blinking.`,
        vote_question: 'Does Zoe sign?',
        vote_options: [
          {
            id: 'sign',
            label: 'Sign it',
            consequence: 'signed',
            cost: 'Dana loses 8% of the company she helped build.'
          },
          {
            id: 'walk',
            label: 'Walk away from the round',
            consequence: 'walked',
            cost: 'Everything they built runs out of money in 90 days.'
          }
        ]
      }
    ]
  }
]

export const getStoryById = (id) =>
  STORIES.find(s => s.id === id)

export const getEpisodeById = (storyId, episodeId) => {
  const story = getStoryById(storyId)
  return story?.episodes.find(e => e.id === episodeId)
}

export const getNextEpisode = (story, currentEpisode, branch) => {
  const nextNumber = currentEpisode.number + 1
  return story.episodes.find(e =>
    e.number === nextNumber &&
    (!e.branch || e.branch === branch)
  )
}
