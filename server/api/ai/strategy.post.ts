// import { getAnthropicClient } from '~~/server/utils/anthropic'
import { getGeminiClient } from '~~/server/utils/gemini'
import type { Strategy } from '~~/shared/types/ai'

export default defineEventHandler(async (event) => {
  let body
  try {
    body = await readBody(event)
  } catch (parseError: any) {
    throw createError({
      statusCode: 400,
      message: `Invalid request body: ${parseError.message}`,
    })
  }

  const { vaultBalance, marketData } = body

  let gemini
  try {
    gemini = getGeminiClient()
  } catch (initError: any) {
    throw createError({
      statusCode: 500,
      message: `Failed to initialize AI: ${initError.message}`,
    })
  }
  
  const prompt = `You are a DeFi strategy advisor for the AEGIS platform.

**IMPORTANT CONTEXT:**
- The user's vaultBTC is currently deposited in our AIVault contract which provides a FIXED 5% APY
- This 5% APY is the base, guaranteed yield from our vault
- Your strategies should advise on how to MAXIMIZE returns by either:
  1. Keeping funds in our vault (conservative - get the guaranteed 5%)
  2. Using vaultBTC in other DeFi protocols (moderate/aggressive - potentially higher but riskier)

User's position:
- Vault Balance: ${vaultBalance || '0'} vaultBTC
- Base Vault APY: 5% (guaranteed, 24h minimum hold)

Market conditions:
${JSON.stringify(marketData || {}, null, 2)}

Provide 3 strategic recommendations:
1. Conservative - Focus on our vault's 5% APY, stable and secure
2. Moderate - Mix of vault holding + some external DeFi
3. Aggressive - Leverage external DeFi protocols for higher (but riskier) yields

For each strategy:
- expectedApy: Conservative should be around 5% (our vault rate), others can be higher for external strategies
- riskLevel: 1-10 (conservative 1-3, moderate 4-6, aggressive 7-10)
- actions: Specific actionable steps
- timeHorizon: Investment period
- description: Clear explanation of the strategy

Return ONLY a valid JSON array:
[
  {
    "id": "conservative-1",
    "name": "Conservative Vault Hold",
    "type": "conservative",
    "expectedApy": { "min": 5, "max": 5 },
    "riskLevel": 2,
    "actions": ["Keep vaultBTC in AIVault for guaranteed 5% APY", "Wait 24h for yield to accrue", "Claim or compound yields periodically"],
    "timeHorizon": "6-12 months",
    "description": "Maximize security by keeping funds in our audited vault with guaranteed 5% APY. This is the safest option with predictable returns."
  },
  {
    "id": "moderate-1",
    "name": "Balanced DeFi Growth",
    "type": "moderate",
    "expectedApy": { "min": 6, "max": 10 },
    "riskLevel": 5,
    "actions": ["action1", "action2"],
    "timeHorizon": "3-6 months",
    "description": "Strategy mixing vault and external DeFi"
  },
  {
    "id": "aggressive-1",
    "name": "Aggressive Yield Strategy",
    "type": "aggressive",
    "expectedApy": { "min": 10, "max": 20 },
    "riskLevel": 8,
    "actions": ["action1", "action2"],
    "timeHorizon": "1-3 months",
    "description": "Higher risk strategy using leverage or volatile pairs"
  }
]`

  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
    
    const responseText = response.text || ''
    
    // Extract JSON from response (handle markdown code blocks if present)
    let jsonStr = responseText.trim()
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim()
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim()
    }
    
    const strategies: Strategy[] = JSON.parse(jsonStr)
    
    return {
      strategies,
      generatedAt: new Date().toISOString(),
    }
  } catch (error: any) {
    // Check for JSON parsing errors
    if (error.name === 'SyntaxError') {
      throw createError({
        statusCode: 500,
        message: 'Failed to parse AI response as JSON. The model may have returned invalid data.',
      })
    }
    
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

    throw createError({
      statusCode: 500,
      message: `Failed to generate strategy: ${error.message}`,
    })
  }
})
