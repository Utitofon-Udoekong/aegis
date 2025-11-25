export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

export interface Strategy {
  id: string
  name: string
  type: 'conservative' | 'moderate' | 'aggressive'
  expectedApy: {
    min: number
    max: number
  }
  riskLevel: number // 1-10
  actions: string[]
  timeHorizon: string
  description: string
}

export interface MarketData {
  btcPrice: number
  ethPrice: number
  defiTvl: number
  marketSentiment: 'bullish' | 'bearish' | 'neutral'
}

