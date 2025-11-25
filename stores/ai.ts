import { defineStore } from 'pinia'
import type { Message, Strategy } from '~~/shared/types/ai'

interface AIState {
  messages: Message[]
  currentStrategy: Strategy | null
  isLoading: boolean
  strategies: Strategy[]
}

export const useAIStore = defineStore('ai', {
  state: (): AIState => ({
    messages: [],
    currentStrategy: null,
    isLoading: false,
    strategies: [],
  }),

  actions: {
    addMessage(message: Message) {
      this.messages.push(message)
    },
    
    clearMessages() {
      this.messages = []
    },
    
    setCurrentStrategy(strategy: Strategy) {
      this.currentStrategy = strategy
    },
    
    setStrategies(strategies: Strategy[]) {
      this.strategies = strategies
    },
    
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
  },
})

