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
        scene: `I've been sitting in this parking lot for forty minutes. Engine off. Windows up. The air conditioning stopped twenty minutes ago and I haven't moved to turn it back on. My shirt is sticking to the seat. I can see our office from here, third floor, the lights are on. Dana is up there right now. Probably on a call with a brand partner, laughing at something, completely fine. She has no idea what just happened. An hour ago our lead investor called me. Not Dana. Me. And he said something I'm still trying to unhear. He said they're investing in the business, not the brand. He said they need Dana's equity restructured before they wire. From thirty percent to fifteen. He said it like he was reading a weather report. Like it was just math. And then he said the thing that's been sitting in my chest ever since: "Let's get alignment on the cap table first. Before we loop Dana in." Alignment. That's the word he used. Like my best friend's stake in the company we built together is a spreadsheet problem. Like I'm supposed to just nod and say yes and then walk upstairs and sit across from her and pretend that everything is fine. I keep looking at the office door. I keep picking up my phone and putting it down. The investor is waiting for me to say something. Dana is waiting for me to come inside. And I'm just sitting here in this parking lot, watching the minutes go by, trying to figure out who I'm about to become.`,
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
        scene: `She knew something was wrong the second I picked up. Dana always knows. It's the thing about her that makes her great at what she does and terrible to lie to. She said "what happened" before I even said hello. Just like that. Not "hey" or "where are you." What happened. I told her it was nothing. Investor stuff. Normal pre-close anxiety. I could hear myself talking and I sounded wrong. My voice was doing that thing where it gets too steady, too measured, and Dana knows what that means because she's known me since we were twenty-two. She said okay. But she said it the way you say okay when you're filing something away to come back to later. Now we're both in the office. She's at her desk twelve feet from mine. She took one call and then she's just been on her laptop, not really typing, more like scrolling, waiting. I can feel her looking at me every few minutes. I keep staring at a spreadsheet I opened forty minutes ago and haven't read a single cell of. The air between us has changed. It's the kind of silence that has weight to it. I've never kept something from her before. In five years of building this together, through the failed launch and the rebrand and the months where we couldn't make payroll, I have never once sat across from her and hidden something. But here I am. And every minute I don't say something is another minute that this silence gets more expensive.`,
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
        scene: `She left a voicemail. Thirty seconds. I've listened to it four times. "Hey, just checking in, you seemed off this morning on the thread. Call me back, we have the Alo call at three." That's it. Her normal voice. The one she uses when everything is fine. She has no idea. She has absolutely no idea that an hour ago someone put a number on her worth and decided it was half of what she thinks it is. I'm parked outside the office and I need to go inside because the Alo call is in ninety minutes and we're both supposed to be on it. An hour of sitting next to her, talking about Q2 partnerships and influencer rates and content calendars, while I know what I know. While I have a term sheet in my email that says her name next to a number she's never seen. The thing about Dana is she's not just the face of the brand. She IS the brand. Two point three million people follow her. They don't follow Bloom. They follow Dana. When she posts, our sales spike within the hour. I know that. The investor knows that. And somehow the investor still looked at the numbers and decided she's worth fifteen percent. I keep thinking about something my business school professor said about negotiation. He said the person with the most information always has the most power. Right now that person is me. And I have never wanted power less than I do in this parking lot.`,
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
        scene: `Dana knows. I don't know how. Maybe the investor said something. Maybe someone at the firm talked. Maybe she just felt it the way she always feels things before anyone says them out loud. She texted me at 11pm last night. Four words and a period: "I know something is happening with my equity. I need you to call me." I didn't call her. I sat on my couch and stared at that text for three hours. I wrote six different replies and deleted every single one. I didn't sleep. Not a minute. This morning I checked her Instagram and my stomach dropped. She posted something at 6am. A black background with white text. A quote: "The hardest betrayals come from the people who were supposed to be building with you." No caption. No context. Just that. 847,000 impressions in four hours. The comments are already filling up. People asking if she's okay. People saying they've been through this. People tagging their friends. Our brand account is getting pulled into it. I've gotten three texts from our PR person asking what's going on. The investor saw the post. He called me twenty minutes ago, voice tight, and said if this turns into a public thing the deal is done. Not might be done. Is done. Dana hasn't texted me back since last night. She hasn't posted anything else. She's just out there, somewhere, with her phone, and 2.3 million people are watching, and I still haven't called her back.`,
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
        scene: `We talked for three hours. I went to her apartment. She opened the door and didn't say anything for a long time and then she stepped aside and let me in. I'm not going to tell you everything that was said because some of it I'm still processing. But I'll tell you the parts that matter. She didn't yell. I almost wish she had. Instead she got very quiet and very precise and she asked me questions I didn't have answers to. She asked me when I found out. She asked me if I considered it. She asked me how long I sat with it before I told her. And when I hesitated on that last one she nodded like she already knew. At one point she said something that I can't stop hearing. She said: "I always knew you thought I was the lesser founder." And I wanted to say that's not true. I wanted to say that's not what this is. But I also kept thinking about the fact that I didn't call her back that night. That I almost just signed the thing without telling her. That I had forty-eight hours where I was actually considering it. What does that mean about me. She made us coffee at some point. We sat at her kitchen table and she said she doesn't blame the investor because investors are investors. She blames me for not picking up the phone the second it happened. And she's right. I know she's right. That's the part I can't get past.`,
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
        scene: `The term sheet is in my email. The final version. After everything that happened, the investor came back with a counter. Dana keeps 22%, not 15%. It's better than the original ask but it's still eight points less than what she has right now. Eight percent of the company she helped build from nothing. Dana and I talked about it for a long time yesterday. She was calm. Calmer than me, honestly. She said she understands the math. She said she knows that the product is what the investors are buying and the product is what I built. She said she's okay with 22 if I'm okay with it. And then she said the thing that's been keeping me up all night. She said: "Whatever you decide, I need to know you decided it. Not them." The wire would hit tomorrow. Four million dollars. The product we've been building for five years, the thing we started in her apartment with a credit card and a Shopify store, it finally has the runway to become what it was supposed to be. Real distribution. Real manufacturing. Real salaries instead of the barely-anything we've been paying ourselves. I have the DocuSign open on my screen right now. The signature line is blinking. I keep scrolling up to the section that says Dana's name next to 22% and then scrolling back down to the signature line. My phone is on the desk. Dana texted me an hour ago: "I trust you." Two words. And I don't know if that makes this easier or impossible.`,
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
