<template>
  <!-- Floating Action Button -->
  <button
    v-if="!isOpen"
    @click="isOpen = true"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-full shadow-lg shadow-emerald-500/50 flex items-center justify-center transition-all hover:scale-110"
    aria-label="Open AI Chatbot"
  >
    <Icon name="mdi:robot" class="text-2xl" />
    <span
      v-if="hasUnreadMessages"
      class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950"
    />
  </button>

  <!-- Chat Window -->
  <Transition name="slide-up">
    <div
      v-if="isOpen"
      class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[calc(100vh-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700"
      style="height: min(600px, calc(100vh - 2rem));"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon name="mdi:robot" class="text-xl" />
          <h3 class="font-semibold">AI Strategy Advisor</h3>
        </div>
        <button
          @click="isOpen = false"
          class="hover:bg-white/20 rounded-full p-1 transition-colors"
          aria-label="Close chat"
        >
          <Icon name="mdi:close" />
        </button>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
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
              'max-w-[80%] rounded-lg p-3',
              message.role === 'user'
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700',
            ]"
          >
            <p class="whitespace-pre-wrap text-sm">{{ message.content }}</p>
            <p
              v-if="message.timestamp"
              :class="[
                'text-xs mt-1',
                message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              {{ new Date(message.timestamp).toLocaleTimeString() }}
            </p>
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Icon name="mdi:loading" class="animate-spin text-emerald-500" />
              <span class="text-sm">AI is thinking...</span>
            </div>
          </div>
        </div>

        <div ref="messagesEnd" />
      </div>

      <!-- Input -->
      <form @submit.prevent="sendMessage" class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
        <div class="flex gap-2">
          <UiInput
            v-model="inputMessage"
            placeholder="Ask about strategies..."
            :disabled="isLoading"
            class="flex-1"
          />
          <UiButton
            type="submit"
            :disabled="!inputMessage.trim() || isLoading"
            size="sm"
            class="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
          >
            <Icon name="mdi:send" />
          </UiButton>
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

const messages = computed(() => aiStore.messages)

const hasUnreadMessages = computed(() => {
  // Show badge if there are messages and chat is closed
  return !isOpen.value && messages.value.length > 0
})

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
    }

    await chat(message, context)
    scrollToBottom()
  } catch (error: any) {
    aiStore.addMessage({
      role: 'assistant',
      content: `Error: ${error.message}`,
      timestamp: Date.now(),
    })
  } finally {
    isLoading.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  // Add welcome message if no messages exist
  if (aiStore.messages.length === 0) {
    aiStore.addMessage({
      role: 'assistant',
      content: 'Hello! I\'m your AI DeFi strategy advisor. How can I help you optimize your Bitcoin vault position?',
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
</style>

