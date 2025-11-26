<template>
  <!-- Floating Action Button -->
  <button
    v-if="!isOpen"
    @click="isOpen = true"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
    aria-label="Open AI Chatbot"
  >
    <Icon name="mdi:robot" class="text-2xl" />
    <span
      v-if="hasUnreadMessages"
      class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"
    />
  </button>

  <!-- Chat Window -->
  <Transition name="slide-up">
    <div
      v-if="isOpen"
      class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] bg-slate-900 rounded-2xl shadow-2xl flex flex-col border border-emerald-500/20 overflow-hidden"
      style="height: min(650px, calc(100vh - 2rem));"
    >
      <!-- Background glow -->
      <div class="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <!-- Header -->
      <div class="relative bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-b border-emerald-500/20 p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
            <Icon name="mdi:robot" class="text-xl text-emerald-400" />
          </div>
          <div>
            <h3 class="font-semibold text-white">Vault AI Assistant</h3>
            <p class="text-xs text-slate-500">Powered by AI</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="messages.length > 1"
            @click="clearChat"
            class="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
            title="Clear chat"
          >
            <Icon name="mdi:delete-outline" />
          </button>
        <button
          @click="isOpen = false"
            class="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
          aria-label="Close chat"
        >
          <Icon name="mdi:close" />
        </button>
        </div>
      </div>

      <!-- Suggested Messages -->
      <div v-if="messages.length <= 1" class="p-4 border-b border-slate-800/50">
        <p class="text-xs text-slate-500 mb-3">Quick questions:</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            @click="sendSuggestion(suggestion.message)"
            class="px-3 py-2 text-xs rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300 transition-all duration-200"
          >
            <Icon :name="suggestion.icon" class="mr-1" />
            {{ suggestion.label }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div 
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
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

        <div ref="messagesEnd" />
      </div>

      <!-- Input -->
      <form @submit.prevent="sendMessage" class="p-4 border-t border-slate-800/50 bg-slate-900/50">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <input
            v-model="inputMessage"
              type="text"
              placeholder="Ask about strategies, risks..."
            :disabled="isLoading"
              class="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-800 disabled:opacity-50 transition-all duration-200 text-sm"
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
        </div>
      </form>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useAIStore } from '~~/stores/ai'
import { useVaultStore } from '~~/stores/vault'

const aiStore = useAIStore()
const vaultStore = useVaultStore()
const { chat } = useAI()

const isOpen = ref(false)
const inputMessage = ref('')
const isLoading = ref(false)
const messagesEnd = ref<HTMLElement | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

const messages = computed(() => aiStore.messages)

const hasUnreadMessages = computed(() => {
  return !isOpen.value && messages.value.length > 0
})

// Suggested quick messages
const suggestions = [
  { id: 1, icon: 'mdi:shield-check', label: 'Risks', message: 'What are the main risks of using this vault?' },
  { id: 2, icon: 'mdi:chart-line', label: 'APY', message: 'How does the 5% APY work?' },
  { id: 3, icon: 'mdi:file-document', label: 'Contract', message: 'Tell me about the smart contract' },
  { id: 4, icon: 'mdi:clock', label: 'Yield', message: 'When can I claim my yield?' },
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
    content: `Hello! I'm your AEGIS assistant. I can help with:

• **Vault Operations** - Deposits, withdrawals, yield claiming
• **Security** - Smart contract protections
• **Yield** - 5% APY with 24h hold period
• **Strategies** - AI-powered investment advice

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
    const context = {
      balance: vaultStore.balance,
      apy: vaultStore.apy,
      rewards: vaultStore.userRewards,
      projectInfo: {
        name: 'AEGIS',
        description: 'AI-enhanced DeFi vault for Bitcoin-backed assets',
        contracts: {
          aiVault: {
            features: ['5% APY', '24-hour minimum hold', 'Time-based yield'],
            security: ['ReentrancyGuard', 'Pausable', 'SafeERC20']
          }
        }
      }
    }

    await chat(message, context)
    scrollToBottom()
  } catch (error: any) {
    aiStore.addMessage({
      role: 'assistant',
      content: `Error: ${error.message}`,
      timestamp: Date.now(),
    })
    scrollToBottom()
  } finally {
    isLoading.value = false
  }
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  if (aiStore.messages.length === 0) {
    aiStore.addMessage({
      role: 'assistant',
      content: `Hello! I'm your AEGIS assistant. I can help with:

• **Vault Operations** - Deposits, withdrawals, yield claiming
• **Security** - Smart contract protections
• **Yield** - 5% APY with 24h hold period
• **Strategies** - AI-powered investment advice

What would you like to know?`,
      timestamp: Date.now(),
    })
  }
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

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
