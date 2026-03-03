import { create } from 'zustand'

const useStoryStore = create((set, get) => ({
  // Active story/episode
  activeStory: null,
  activeEpisode: null,

  // User's vote history: { episodeId: optionChosen }
  votes: {},

  // Which branch each story is on for this user
  branches: {},

  // Chat history per episode
  chatHistory: {},

  setActiveStory: (story) => set({ activeStory: story }),
  setActiveEpisode: (episode) => set({ activeEpisode: episode }),

  castVote: (episodeId, option, consequence) => {
    set(state => ({
      votes: { ...state.votes, [episodeId]: option },
      branches: {
        ...state.branches,
        [episodeId]: consequence
      }
    }))
  },

  addMessage: (episodeId, message) => {
    set(state => ({
      chatHistory: {
        ...state.chatHistory,
        [episodeId]: [
          ...(state.chatHistory[episodeId] || []),
          message
        ]
      }
    }))
  },

  getNextEpisode: (story, currentEpisode) => {
    const { branches } = get()
    const votedBranch = branches[currentEpisode.id]
    const nextDay = currentEpisode.day + 1

    // Find episode matching next day and current branch
    return story.episodes.find(e =>
      e.day === nextDay &&
      (!e.branch || e.branch === votedBranch)
    )
  }
}))

export default useStoryStore
