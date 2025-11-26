<template>
  <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/5 via-slate-900 to-slate-900 border border-emerald-500/20 transition-all duration-300">
    <!-- Background glow -->
    <div class="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    
    <div class="relative p-6">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
          <Icon name="mdi:robot" class="text-xl text-emerald-400" />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-white">Vault AI Assistant</h3>
          <p class="text-xs text-slate-500">Powered by AI • Specialized in AEGIS vault strategies</p>
        </div>
        <button 
          v-if="messages.length > 1" 
          @click="clearChat" 
          class="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
          title="Clear chat"
        >
          <Icon name="mdi:delete-outline" />
        </button>
      </div>

      <!-- Suggested Messages -->
      <div v-if="messages.length <= 1" class="mb-6">
        <p class="text-xs text-slate-500 mb-3">Quick questions:</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            @click="sendSuggestion(suggestion.message)"
            class="px-3 py-2 text-sm rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300 transition-all duration-200"
          >
            <Icon :name="suggestion.icon" class="mr-1.5" />
            {{ suggestion.label }}
          </button>
        </div>
      </div>

      <!-- Messages Container -->
      <div 
        ref="messagesContainer"
        class="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
      >
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'flex',
          message.role === 'user' ? 'justify-end' : 'justify-start',
        ]"
      >
        <div
          :class="[
              'max-w-[85%] rounded-2xl p-4',
            message.role === 'user'
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                : 'bg-slate-800/80 border border-slate-700/50 text-slate-200',
            ]"
          >
            <div v-if="message.role === 'assistant'" class="flex items-center gap-2 mb-2">
              <div class="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Icon name="mdi:robot" class="text-xs text-emerald-400" />
              </div>
              <span class="text-xs text-emerald-400 font-medium">Vault AI</span>
            </div>
            <p class="whitespace-pre-wrap text-sm leading-relaxed">{{ message.content }}</p>
          <p
            v-if="message.timestamp"
              :class="[
                'text-xs mt-2',
                message.role === 'user' ? 'text-white/60' : 'text-slate-500'
              ]"
          >
              {{ formatTime(message.timestamp) }}
          </p>
        </div>
      </div>

        <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-start">
          <div class="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4">
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
              <span class="text-sm text-slate-400">AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>

      <!-- Input Form -->
      <form @submit.prevent="sendMessage" class="flex gap-3">
        <div class="relative flex-1">
          <input
        v-model="inputMessage"
            type="text"
            placeholder="Ask about strategies, risks, the vault contract..."
        :disabled="isLoading"
            class="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-800 disabled:opacity-50 transition-all duration-200"
      />
        </div>
        <button 
          type="submit" 
          :disabled="!inputMessage.trim() || isLoading"
          class="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-400 hover:to-green-400 transition-all duration-200"
        >
          <Icon v-if="isLoading" name="mdi:loading" class="animate-spin" />
          <Icon v-else name="mdi:send" />
        </button>
    </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAIStore } from '~~/stores/ai'
import { useVaultStore } from '~~/stores/vault'

const aiStore = useAIStore()
const { chat } = useAI()
const vaultStore = useVaultStore()

const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const messages = computed(() => aiStore.messages)

// Suggested quick messages
const suggestions = [
  { id: 1, icon: 'mdi:shield-check', label: 'What are the risks?', message: 'What are the main risks of using this vault?' },
  { id: 2, icon: 'mdi:chart-line', label: 'Explain the APY', message: 'How does the 5% APY work and how is yield calculated?' },
  { id: 3, icon: 'mdi:file-document', label: 'About the contract', message: 'Tell me about the AIVault smart contract and its security features' },
  { id: 4, icon: 'mdi:bitcoin', label: 'Bitcoin integration', message: 'How does this relate to Bitcoin and trustless vaults?' },
  { id: 5, icon: 'mdi:robot', label: 'AI strategies', message: 'How do the AI-powered strategies work?' },
  { id: 6, icon: 'mdi:clock', label: 'Yield timing', message: 'When can I claim my yield and what is the minimum hold period?' },
]

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendSuggestion = (message: string) => {
  inputMessage.value = message
  sendMessage()
}

const clearChat = () => {
  aiStore.clearMessages()
  // Re-add welcome message
  aiStore.addMessage({
    role: 'assistant',
    content: `Hello! I'm your AEGIS assistant. I'm specialized in helping you understand this DeFi platform, including:

• **AIVault Contract** - Deposits, withdrawals, and yield mechanics
• **VaultBTC Token** - The ERC20 token representing Bitcoin positions
• **AI Strategies** - Conservative, moderate, and aggressive investment approaches
• **Security** - ReentrancyGuard, Pausable, SafeERC20 protections
• **Yield System** - 5% APY with 24-hour minimum hold period

What would you like to know?`,
    timestamp: Date.now(),
  })
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const message = inputMessage.value
  inputMessage.value = ''
  isLoading.value = true

  try {
    // Enhanced context with project-specific information
    const context = {
      // User's vault data
      balance: vaultStore.balance,
      apy: vaultStore.apy,
      rewards: vaultStore.userRewards,
      
      // Project information for AI training
      projectInfo: {
        name: 'AEGIS',
        description: 'An AI-enhanced DeFi vault platform for Bitcoin-backed assets',
        
        contracts: {
          aiVault: {
            description: 'Main vault contract for deposits and withdrawals',
            features: ['5% APY', '24-hour minimum hold', 'Time-based yield calculation', 'Proportional yield on partial withdrawals', 'Separate claimYield function'],
            security: ['ReentrancyGuard', 'Pausable', 'Ownable', 'SafeERC20'],
            functions: ['deposit()', 'withdraw()', 'claimYield()', 'getDepositInfo()', 'calculateYield()']
          },
          vaultBTC: {
            description: 'ERC20 token representing Bitcoin positions',
            features: ['Faucet for testnet', '1000 max per request', '2000 daily limit', '5000 lifetime limit', '24h cooldown']
          }
        },
        
        yieldMechanism: {
          apy: '5% annual',
          minHold: '24 hours before yield accrues',
          claimOptions: ['Claim yield separately without withdrawing', 'Get proportional yield on any withdrawal'],
          yieldReserves: 'Contract owner funds yield reserves to pay user yields'
        },
        
        strategies: {
          conservative: { riskLevel: '1-3', apy: '4-6%', timeHorizon: '6-12 months' },
          moderate: { riskLevel: '4-6', apy: '6-10%', timeHorizon: '3-6 months' },
          aggressive: { riskLevel: '7-10', apy: '10-20%', timeHorizon: '1-3 months' }
        },
        
        futurePlans: 'Designed to integrate with Bitcoin trustless vaults when technology matures'
      }
    }

    await chat(message, context)
    scrollToBottom()
  } catch (error: any) {
    aiStore.addMessage({
      role: 'assistant',
      content: `I encountered an error: ${error.message}\n\nPlease try again or rephrase your question.`,
      timestamp: Date.now(),
    })
    scrollToBottom()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Add enhanced welcome message if empty
  if (aiStore.messages.length === 0) {
    aiStore.addMessage({
      role: 'assistant',
      content: `Hello! I'm your AEGIS assistant. I'm specialized in helping you understand this DeFi platform, including:

• **AIVault Contract** - Deposits, withdrawals, and yield mechanics
• **VaultBTC Token** - The ERC20 token representing Bitcoin positions  
• **AI Strategies** - Conservative, moderate, and aggressive investment approaches
• **Security** - ReentrancyGuard, Pausable, SafeERC20 protections
• **Yield System** - 5% APY with 24-hour minimum hold period

What would you like to know?`,
      timestamp: Date.now(),
    })
  }
  scrollToBottom()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.3);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.5);
}
</style>
