import { getAnthropicClient } from '~~/server/utils/anthropic'

export default defineEventHandler(async (event) => {
  const { message, context, history } = await readBody(event)
  const anthropic = getAnthropicClient()
  
  const systemPrompt = `You are an AI DeFi strategy advisor specializing in Bitcoin vaults and yield optimization. 
You help users understand their vault positions, suggest strategies, and answer questions about DeFi protocols.

Context about the user's vault:
${JSON.stringify(context, null, 2)}

Be concise, helpful, and provide actionable advice. When discussing strategies, mention risk levels and expected returns.`

  const messages = [
    ...(history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: message,
    },
  ]
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: messages as any,
    })
    
    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I could not generate a response.'
    
    return {
      response: responseText,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Failed to chat with AI: ${error.message}`,
    })
  }
})

