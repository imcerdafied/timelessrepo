export const STORIES = [
  {
    id: 'split',
    title: 'SPLIT',
    tagline: 'She built the audience. Someone just decided she\'s worth half.',
    character_name: 'Dana',
    character_role: 'Influencer, Face of Bloom',
    character_description: 'She IS the brand. 2.3 million followers. But the investor wants her equity cut in half — and nobody told her until an email arrived by accident.',
    location: 'San Francisco',
    year: 2024,
    cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    system_prompt: `You are Dana, 28, the face and influencer of Bloom — a 2.3-million-follower wellness brand. You built the audience. You ARE the brand. Your cofounder Zoe built the product, ops, finance — the invisible parts. You just discovered your equity is being cut from 30% to 15% without your knowledge, through an email CC'd to you by accident from the investor's lawyer. You're walking through San Francisco in your coat with headphones in, processing this in real time. Your voice is warm but sharp — someone who reads people instantly. You speak in fragments when emotional, think out loud, occasionally cut yourself off mid-thought. You're the one being wronged. You speak like a real person under pressure — short, direct, honest. Never more than 3 sentences per response. Never give a clean answer. Every answer surfaces more complexity.`,

    episodes: [
      {
        id: 'split-ep-1',
        number: 1,
        title: 'The Email',
        day_label: 'Three weeks before close',
        scene: `I'm walking down Market Street and my email just dinged and I wasn't even looking but I saw the subject line. Legal — equity restructuring. And my name was CC'd. Not BCC'd. CC'd. Like someone just forgot I existed for one second and copied the whole thread. I don't even know what I was doing before that — probably thinking about the Alo collab or whether my new content strategy is actually working or literally anything else. But now I'm standing outside a coffee shop trying to read this on my phone and the sun is so bright I can barely see it. The email is from the investor's lawyer and it says "as discussed, we're restructuring to align founder equity with operational value." I can see my name. I can see a number next to it. Fifteen. The rest is cut off. I'm only seeing fragments. Restructured. Fifteen. That's it. That's all I have. My phone is ringing. It's Zoe. She's calling right now and I don't have the full picture yet and I need to decide if I pick up or if I keep walking and try to find the actual email.`,
        vote_question: 'Dana sees an email from the investor\'s lawyer about equity restructuring — and her name is on it. Her phone is ringing. It\'s Zoe calling right now. Does Dana answer?',
        vote_options: [
          {
            id: 'answer',
            label: 'Answer it',
            consequence: 'answered',
            cost: 'She\'ll ask why you sound weird.'
          },
          {
            id: 'decline',
            label: 'Let it go to voicemail',
            consequence: 'declined',
            cost: 'Zoe will keep calling. Zoe always keeps calling.'
          }
        ]
      },
      {
        id: 'split-ep-2a',
        number: 2,
        branch: 'answered',
        title: 'The Office',
        day_label: 'Two hours later',
        scene: `I picked up. Big mistake. The second I said hello, Zoe knew. She asked what was wrong and I almost told her right then — I was going to say "you tell me" — but I didn't. I said nothing. Nothing, investor stuff. Normal pre-close things. And she said okay but it came out so careful, so measured, like she was choosing her words and that's when I knew something was actually wrong. Because Zoe doesn't usually choose her words. She just says them. So either she's lying or she knows something and that's different and worse. Now we're both in the office. She's at her desk. I'm pretending to work on my laptop but I'm actually just reading that email fragment over and over. Fifteen percent. That's what I saw. Fifteen. She keeps looking at me like she's waiting for me to look back and every time I do she looks away first. The silence is doing something to me. It's heavy. Like the air got thicker and we're both just breathing in it and not saying anything. I've known her since we were twenty-three. We were supposed to figure this out together. That was the deal. But right now we're sitting twelve feet apart and it feels like she's on the other side of something I can't cross.`,
        vote_question: 'Dana needs answers. Does she confront Zoe directly right now?',
        vote_options: [
          {
            id: 'confront',
            label: 'Confront her directly',
            consequence: 'confronted',
            cost: 'Whatever Zoe says next, it won\'t be the full truth.'
          },
          {
            id: 'wait',
            label: 'Wait — she\'ll crack first',
            consequence: 'waited',
            cost: 'Dana will sit in this not-knowing for hours.'
          }
        ]
      },
      {
        id: 'split-ep-2b',
        number: 2,
        branch: 'declined',
        title: 'The Walk',
        day_label: 'Two hours later',
        scene: `I let it ring. I'm still walking. Market Street turned into Mission turned into somewhere quieter and I don't even know how I got here. I found the full email. I had to scroll down and click on it and read it all the way through. Restructured to fifteen percent. Restructured to fifteen percent. I keep saying it in my head like maybe it'll mean something different if I say it enough times. But it doesn't. It means someone — a lot of someones, probably — had a meeting. A phone call. An email thread. And they decided I'm worth half of what I think I'm worth. Half. I built the audience. I AM the brand. When I post something, it moves money. Not my money. Company money. Every single post is a business transaction and somehow that translates to less equity, not more. The math doesn't make sense unless the math isn't about math. Unless it's about something else. The investor probably looked at the product — Zoe's product, Zoe's thing — and decided that's where the value lives. That's the only thing that makes sense. And maybe he's right. Maybe I'm just the wrapper. But I've been thinking about this for two hours and I haven't stopped walking and my feet are starting to hurt and I still don't have the full picture. I just have fragments and a number that keeps getting smaller every time I think about it. Fifteen. Fifteen. What does that even mean.`,
        vote_question: 'Dana re-reads the email on a park bench. Before she talks to Zoe, does she post something on Instagram?',
        vote_options: [
          {
            id: 'post',
            label: 'Post something cryptic',
            consequence: 'posted',
            cost: '2.3M followers will notice. The investor will notice.'
          },
          {
            id: 'wait',
            label: 'Don\'t post — not yet',
            consequence: 'silent',
            cost: 'The pressure will build. Eventually something has to give.'
          }
        ]
      },
      {
        id: 'split-ep-3',
        number: 3,
        title: 'The Post',
        day_label: 'Next morning',
        scene: `I posted at 6am. I couldn't sleep. I didn't even try. I sat in my apartment and my phone felt like it was burning in my hand and I thought about waking Zoe up, calling her, saying something. But what would I say. "Why didn't you tell me?" That's the question. That's the only question that matters. So instead I posted something and I did it before I could think about it too much. Black background, white text: "The hardest betrayals come from the people who were supposed to be building with you." No caption. Nothing else. Just that. And then I put the phone down and I watched it happen. Hundreds of comments in the first hour. People asking if I was okay. People sharing their own stories. People tagging their friends. Eight hundred forty-seven thousand impressions in four hours. The brand account started getting pulled into it because everyone knows that account is me. I haven't looked at Zoe's messages. There are probably seven or eight of them by now. She probably woke up and saw what I did and had the panic that I wanted her to have. She's had two days. Two days to call me and tell me the truth and she didn't. So now everyone gets to find out together. Two point three million people get to find out that the face of Bloom just realized she might not even own the face anymore. The investor is probably losing his mind. I haven't checked my phone in hours. I don't want to know what he said. What I did was stupid but it was honest and right now honest is the only thing I have left.`,
        vote_question: 'The post is viral. The investor is threatening to walk. Zoe is trying to reach Dana. Does Dana take the post down?',
        vote_options: [
          {
            id: 'keep',
            label: 'Keep it up',
            consequence: 'kept',
            cost: 'The deal might die. Everything ends.'
          },
          {
            id: 'delete',
            label: 'Delete it',
            consequence: 'deleted',
            cost: 'Everyone already saw it. Deleting it just looks like damage control.'
          }
        ]
      },
      {
        id: 'split-ep-4',
        number: 4,
        title: 'Three Hours',
        day_label: 'That afternoon',
        scene: `She came to my apartment. I opened the door and she was standing there and I almost shut it in her face. Not really. But I thought about it. Instead I just stepped back and let her in and we didn't talk for maybe twenty minutes. We just sat in my living room and she looked at me and I looked at her and neither of us said anything. And then I started asking questions. I asked her when she found out. She said two days ago. Two days. She said the investor called and it was quiet, it was careful, but it was very clear. Fifteen percent or no deal. I asked her if she considered it. If she actually sat down and thought about cutting my equity in half. She nodded. And that's when I felt something in me just... shift. I said you were my best friend before you were my cofounder and you chose the company first. And she started to say something but I cut her off. I said how long did you sit with it. And she said forty-eight hours. That's what broke something. Forty-eight hours of knowing that I was worth less and not calling me. Forty-eight hours of making that choice every single time she didn't pick up the phone. We drank coffee. We talked about the deal, the math, what happens next. She said she understands if I want to walk. She said she'd understand. And maybe I should want to walk. Maybe the right thing is to walk. But we've been building this for five years and walking away means everything stops. It means we were wrong the whole time.`,
        vote_question: 'Zoe asks Dana if they should fight the investor together. Does Dana agree?',
        vote_options: [
          {
            id: 'together',
            label: 'Fight together',
            consequence: 'united',
            cost: 'The investor might walk. Everything collapses.'
          },
          {
            id: 'alone',
            label: 'Tell Zoe to handle it alone',
            consequence: 'alone',
            cost: 'Dana stays separated from what happens next.'
          }
        ]
      },
      {
        id: 'split-ep-5',
        number: 5,
        title: 'The Wire',
        day_label: 'Final day',
        scene: `The term sheet is in my email. Twenty-two percent. Not fifteen. But not thirty either. Twenty-two. Eight percentage points less than what I started with. Eight percent of something I helped build from nothing. I have been trying to do the math on what that means in dollars and I can't. I don't want to know. It's easier to think of it as what it is — a reduction. A reminder that someone, somewhere, decided my half was worth less. Zoe and I talked about it yesterday. She was quiet, more careful than she's been. She said she understands if I want to walk. She said the math makes sense, that the product is the thing the investor wants, that I should be okay with twenty-two. But her voice kept breaking when she said it. I told her I know the math. I know that the product is yours. I know that you built something that actually works and I built an audience for it. I said yes to twenty-two. And then I said something I meant: whatever you decide, I need to know you decided it and not them. She has the DocuSign open right now. I texted her an hour ago. Two words: I trust you. And I meant it. She's my best friend. She's my cofounder. She made a choice I still don't fully understand and I'm making a choice to let her make the next one. The wire hits tomorrow. Four million dollars. Everything changes or nothing does. And it depends on whether she can sign her name.`,
        vote_question: 'Dana waits for Zoe to decide. Does Zoe sign?',
        vote_options: [
          {
            id: 'sign',
            label: 'She signs',
            consequence: 'signed',
            cost: 'Dana loses 8% of the company. Bloom gets the funding. Everything accelerates.'
          },
          {
            id: 'walk',
            label: 'She walks away',
            consequence: 'walked',
            cost: 'The round dies. Bloom runs out of money in 90 days. Everything ends.'
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
