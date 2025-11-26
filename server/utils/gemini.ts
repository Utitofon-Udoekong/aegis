import { GoogleGenAI } from '@google/genai'

export const getGeminiClient = () => {
  const config = useRuntimeConfig()
  
  const apiKey = config.geminiApiKey
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables')
    console.error('Available config keys:', Object.keys(config))
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.')
  }
  
  // Log that we have a key (but not the key itself)
  console.log('Gemini API key found, length:', apiKey.length, 'chars')
  
  return new GoogleGenAI({ apiKey })
}
