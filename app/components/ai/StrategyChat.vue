<template>
  <UiCard class="h-full flex flex-col">
    <h3 class="text-xl font-bold mb-4">AI Strategy Advisor</h3>

    <div class="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px] max-h-[500px]">
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
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
          ]"
        >
          <p class="whitespace-pre-wrap">{{ message.content }}</p>
          <p
            v-if="message.timestamp"
            class="text-xs opacity-70 mt-1"
          >
            {{ new Date(message.timestamp).toLocaleTimeString() }}
          </p>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
          <div class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Icon name="mdi:loading" class="animate-spin" />
            <span>AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="flex gap-2">
      <UiInput
        v-model="inputMessage"
        placeholder="Ask about strategies, risks, or recommendations..."
        :disabled="isLoading"
        class="flex-1"
      />
      <UiButton type="submit" :disabled="!inputMessage.trim() || isLoading">
        <Icon name="mdi:send" />
      </UiButton>
    </form>
  </UiCard>
</template>

<script setup lang="ts">
import { useAIStore } from '~~/stores/ai'
import { useVaultStore } from '~~/stores/vault'

const aiStore = useAIStore()
const { chat } = useAI()
const vaultStore = useVaultStore()

const inputMessage = ref('')
const isLoading = ref(false)

const messages = computed(() => aiStore.messages)

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

onMounted(() => {
  // Add welcome message
  if (aiStore.messages.length === 0) {
    aiStore.addMessage({
      role: 'assistant',
      content: 'Hello! I\'m your AI DeFi strategy advisor. How can I help you optimize your Bitcoin vault position?',
      timestamp: Date.now(),
    })
  }
})
</script>

