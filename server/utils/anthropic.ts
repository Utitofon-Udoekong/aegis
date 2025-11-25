import Anthropic from '@anthropic-ai/sdk'

export const getAnthropicClient = () => {
  const config = useRuntimeConfig()
  
  if (!config.anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }
  
  return new Anthropic({
    apiKey: config.anthropicApiKey,
  })
}

