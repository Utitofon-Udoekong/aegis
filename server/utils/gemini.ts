import { GoogleGenAI } from '@google/genai'

export const getGeminiClient = () => {
  const config = useRuntimeConfig()
  
  const apiKey = config.geminiApiKey
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.')
  }
  
  return new GoogleGenAI({ apiKey })
}
