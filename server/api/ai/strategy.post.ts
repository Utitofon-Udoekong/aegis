import { getAnthropicClient } from '~~/server/utils/anthropic'
import type { Strategy } from '~~/shared/types/ai'

export default defineEventHandler(async (event) => {
  const { vaultBalance, marketData } = await readBody(event)
  const anthropic = getAnthropicClient()
  
  const prompt = `You are a DeFi strategy advisor for Bitcoin vaults. 

User's vault position:
- Balance: ${vaultBalance} vaultBTC
- Current APY: 5%

Market conditions:
${JSON.stringify(marketData, null, 2)}

Provide 3 strategic recommendations for this user:
1. Conservative (low risk)
2. Moderate (balanced)
3. Aggressive (high yield, higher risk)

For each strategy, include:
- Expected APY range (min and max)
- Risk level (1-10 scale)
- Specific actions to take
- Time horizon
- Description

Return ONLY a valid JSON array of strategy objects with this exact structure:
[
  {
    "id": "conservative-1",
    "name": "Conservative Strategy",
    "type": "conservative",
    "expectedApy": { "min": 4, "max": 6 },
    "riskLevel": 3,
    "actions": ["action1", "action2"],
    "timeHorizon": "6-12 months",
    "description": "Strategy description"
  },
  {
    "id": "moderate-1",
    "name": "Moderate Strategy",
    "type": "moderate",
    "expectedApy": { "min": 6, "max": 10 },
    "riskLevel": 5,
    "actions": ["action1", "action2"],
    "timeHorizon": "3-6 months",
    "description": "Strategy description"
  },
  {
    "id": "aggressive-1",
    "name": "Aggressive Strategy",
    "type": "aggressive",
    "expectedApy": { "min": 10, "max": 20 },
    "riskLevel": 8,
    "actions": ["action1", "action2"],
    "timeHorizon": "1-3 months",
    "description": "Strategy description"
  }
]`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    })
    
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''
    
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
    throw createError({
      statusCode: 500,
      message: `Failed to generate strategy: ${error.message}`,
    })
  }
})

