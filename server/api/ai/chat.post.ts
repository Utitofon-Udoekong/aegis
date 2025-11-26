// import { getAnthropicClient } from '~~/server/utils/anthropic'
import { getGeminiClient } from '~~/server/utils/gemini'

export default defineEventHandler(async (event) => {
  console.log('=== AI Chat Request ===')
  
  let body
  try {
    body = await readBody(event)
    console.log('Request body received:', { 
      message: body?.message?.substring(0, 50) + '...', 
      hasContext: !!body?.context,
      historyLength: body?.history?.length || 0 
    })
  } catch (parseError: any) {
    console.error('Failed to parse request body:', parseError.message)
    throw createError({
      statusCode: 400,
      message: `Invalid request body: ${parseError.message}`,
    })
  }

  const { message, context, history } = body
  
  if (!message) {
    console.error('No message provided in request')
    throw createError({
      statusCode: 400,
      message: 'Message is required',
    })
  }

  let gemini
  try {
    gemini = getGeminiClient()
    console.log('Gemini client initialized successfully')
  } catch (initError: any) {
    console.error('Failed to initialize Gemini client:', initError.message)
    throw createError({
      statusCode: 500,
      message: `Failed to initialize AI: ${initError.message}`,
    })
  }

  // Project-specific system prompt with comprehensive knowledge
  const systemPrompt = `You are the AI assistant for AEGIS, a DeFi platform for Bitcoin-backed assets.

## ABOUT THIS PROJECT
AEGIS is an AI-enhanced DeFi vault platform that allows users to deposit vaultBTC tokens and earn yield. The platform uses AI to provide personalized investment strategies.

## KEY FEATURES
- **AIVault Smart Contract**: Main vault for deposits/withdrawals with 5% APY
- **VaultBTC Token**: ERC20 token representing Bitcoin positions (testnet faucet available)
- **AI Strategy Advisor**: Provides conservative, moderate, and aggressive strategies
- **Time-based Yield**: 24-hour minimum hold before yield accrues

## SMART CONTRACTS
### AIVault.sol
- deposit(amount): Deposit vaultBTC into the vault
- withdraw(amount): Withdraw with proportional yield
- claimYield(): Claim accrued yield without withdrawing principal
- getDepositInfo(user): Get deposit amount, time, and pending yield
- Security: ReentrancyGuard, Pausable, Ownable, SafeERC20

### VaultBTC.sol  
- ERC20 token for testnet
- Faucet: 1000 max per request, 2000 daily, 5000 lifetime, 24h cooldown

## YIELD MECHANICS
- APY: 5% annual (500 basis points)
- Minimum hold: 24 hours before yield starts accruing
- Calculation: (balance * APY * timeElapsed) / (10000 * 365 days)
- Claim options: Claim separately OR get proportional yield on withdrawal
- Yield reserves: Contract owner funds reserves to pay yields

## AI STRATEGIES
- Conservative: Risk 1-3, APY 4-6%, horizon 6-12 months
- Moderate: Risk 4-6, APY 6-10%, horizon 3-6 months  
- Aggressive: Risk 7-10, APY 10-20%, horizon 1-3 months

## USER'S CURRENT POSITION
${JSON.stringify(context || {}, null, 2)}

## INSTRUCTIONS
- Be helpful, accurate, and concise
- Explain DeFi concepts clearly for beginners
- When discussing risks, be honest about limitations
- Recommend visiting /vault for deposits, /faucet for test tokens, /strategy for AI advice
- If unsure, say so rather than making things up
- Format responses with markdown for readability`

  // Build conversation history for Gemini
  const conversationHistory = (history || []).map((msg: any) =>
    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
  ).join('\n\n')

  const fullPrompt = `${systemPrompt}

${conversationHistory ? `## CONVERSATION HISTORY\n${conversationHistory}\n\n` : ''}## USER'S QUESTION
${message}

## YOUR RESPONSE`

  console.log('Prompt length:', fullPrompt.length, 'characters')

  try {
    console.log('Calling Gemini API...')
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    })
    console.log('Gemini API response received')
    
    const responseText = response.text || 'I apologize, but I could not generate a response.'
    console.log('Response text length:', responseText.length, 'characters')
    
    return {
      response: responseText,
    }
  } catch (error: any) {
    console.error('=== Gemini API Error ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // Check for specific error types
    if (error.message?.includes('API key')) {
      throw createError({
        statusCode: 401,
        message: 'Invalid or missing Gemini API key. Please check your GEMINI_API_KEY environment variable.',
      })
    }
    
    if (error.message?.includes('quota') || error.message?.includes('rate')) {
      throw createError({
        statusCode: 429,
        message: 'API rate limit exceeded. Please try again later.',
      })
    }

    if (error.message?.includes('not found') || error.message?.includes('model')) {
      throw createError({
        statusCode: 400,
        message: 'Model not available. The specified Gemini model may not be accessible.',
      })
    }

    throw createError({
      statusCode: 500,
      message: `AI chat failed: ${error.message}`,
    })
  }
})
