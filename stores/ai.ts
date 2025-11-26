import { defineStore } from 'pinia'
import type { Message, Strategy } from '~~/shared/types/ai'

interface AIState {
  messages: Message[]
  currentStrategy: Strategy | null
  isLoading: boolean
  strategies: Strategy[]
  lastBalanceUsed: string
}

const STRATEGIES_CACHE_KEY = 'vault_ai_strategies'
const STRATEGIES_CACHE_DURATION = 60 * 60 * 1000 * 24 // 1 day

export const useAIStore = defineStore('ai', {
  state: (): AIState => ({
    messages: [],
    currentStrategy: null,
    isLoading: false,
    strategies: [],
    lastBalanceUsed: '0',
  }),

  getters: {
    // Check if we have cached strategies for a given balance
    hasCachedStrategies: (state) => (balance: string): boolean => {
      const cached = getCachedStrategies()
      if (!cached) return false
      
      // Consider cache valid if balance is within 10% of cached balance
      const cachedBalance = parseFloat(cached.balance)
      const currentBalance = parseFloat(balance)
      
      if (cachedBalance === 0 || currentBalance === 0) {
        return cachedBalance === currentBalance
      }
      
      const diff = Math.abs(cachedBalance - currentBalance) / cachedBalance
      return diff < 0.1 // 10% tolerance
    },
  },

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
    
    setStrategies(strategies: Strategy[], balance?: string) {
      this.strategies = strategies
      if (balance) {
        this.lastBalanceUsed = balance
        // Cache to localStorage
        cacheStrategies(strategies, balance)
      }
    },
    
    loadCachedStrategies(balance: string): boolean {
      const cached = getCachedStrategies()
      if (!cached) return false
      
      // Check if balance is close enough
      const cachedBalance = parseFloat(cached.balance)
      const currentBalance = parseFloat(balance)
      
      if (cachedBalance === 0 && currentBalance === 0) {
        return false // Don't use cache for zero balance
      }
      
      if (cachedBalance > 0 && currentBalance > 0) {
        const diff = Math.abs(cachedBalance - currentBalance) / cachedBalance
        if (diff < 0.1) { // 10% tolerance
          this.strategies = cached.strategies
          this.lastBalanceUsed = cached.balance
          return true
        }
      }
      
      return false
    },
    
    clearStrategiesCache() {
      try {
        localStorage.removeItem(STRATEGIES_CACHE_KEY)
      } catch (e) {
        // Ignore
      }
      this.strategies = []
      this.lastBalanceUsed = '0'
    },
    
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
  },
})

// Helper functions for localStorage caching
function getCachedStrategies(): { strategies: Strategy[], balance: string, timestamp: number } | null {
  try {
    const cached = localStorage.getItem(STRATEGIES_CACHE_KEY)
    if (cached) {
      const data = JSON.parse(cached)
      // Check if cache is still valid
      if (Date.now() - data.timestamp < STRATEGIES_CACHE_DURATION) {
        return data
      }
    }
  } catch (e) {
    // Ignore cache errors
  }
  return null
}

function cacheStrategies(strategies: Strategy[], balance: string) {
  try {
    localStorage.setItem(STRATEGIES_CACHE_KEY, JSON.stringify({
      strategies,
      balance,
      timestamp: Date.now()
    }))
  } catch (e) {
    // Ignore cache errors
  }
}
