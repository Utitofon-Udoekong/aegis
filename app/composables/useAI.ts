import type { Strategy, MarketData } from '~~/shared/types/ai'
import { useAIStore } from '~~/stores/ai'

export const useAI = () => {
  const aiStore = useAIStore()
  
  const generateStrategy = async (
    vaultBalance: string,
    marketData?: MarketData
  ): Promise<{ strategies: Strategy[]; generatedAt: string }> => {
    const { data, error } = await useFetch('/api/ai/strategy', {
      method: 'POST',
      body: {
        vaultBalance,
        marketData: marketData || {
          btcPrice: 45000,
          ethPrice: 2500,
          defiTvl: 50000000000,
          marketSentiment: 'neutral',
        },
      },
    })
    
    if (error.value) {
      throw new Error(error.value.message || 'Failed to generate strategy')
    }
    
    return data.value as { strategies: Strategy[]; generatedAt: string }
  }
  
  const chat = async (message: string, context?: any) => {
    aiStore.addMessage({ role: 'user', content: message, timestamp: Date.now() })
    
    const { data, error } = await useFetch('/api/ai/chat', {
      method: 'POST',
      body: {
        message,
        context: context || {},
        history: aiStore.messages.slice(-10), // Last 10 messages for context
      },
    })
    
    if (error.value) {
      throw new Error(error.value.message || 'Failed to chat with AI')
    }
    
    const response = data.value as { response: string; strategies?: Strategy[] }
    aiStore.addMessage({
      role: 'assistant',
      content: response.response,
      timestamp: Date.now(),
    })
    
    return response
  }
  
  return {
    generateStrategy,
    chat,
  }
}

