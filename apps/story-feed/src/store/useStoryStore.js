import { create } from 'zustand'

const useStoryStore = create((set, get) => ({
  activeStory: null,
  activeEpisode: null,

  // { episodeId: optionId }
  votes: {},

  // { episodeId: consequence }
  branches: {},

  // { episodeId: [messages] }
  chatHistory: {},

  setActiveStory: (story) => set({ activeStory: story }),
  setActiveEpisode: (episode) => set({ activeEpisode: episode }),

  castVote: (episodeId, optionId, consequence) => {
    set(state => ({
      votes: { ...state.votes, [episodeId]: optionId },
      branches: { ...state.branches, [episodeId]: consequence }
    }))
  },

  addMessage: (episodeId, message) => {
    set(state => ({
      chatHistory: {
        ...state.chatHistory,
        [episodeId]: [...(state.chatHistory[episodeId] || []), message]
      }
    }))
  },

  getNextEpisode: (story, currentEpisode) => {
    const { branches } = get()
    const votedBranch = branches[currentEpisode.id]
    const nextNumber = currentEpisode.number + 1
    return story.episodes.find(e =>
      e.number === nextNumber &&
      (!e.branch || e.branch === votedBranch)
    )
  }
}))

export default useStoryStore
