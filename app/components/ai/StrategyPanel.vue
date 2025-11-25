<template>
  <div class="space-y-6">
    <UiCard>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">AI Strategy Recommendations</h3>
        <UiButton
          @click="generateStrategies"
          :loading="isGenerating"
          size="sm"
        >
          <Icon name="mdi:refresh" class="mr-2" />
          Refresh
        </UiButton>
      </div>

      <div v-if="strategies.length === 0 && !isGenerating" class="text-center py-8 text-gray-500 dark:text-gray-400">
        <Icon name="mdi:robot" class="text-4xl mb-2 opacity-50 text-emerald-400" />
        <p>Click "Generate Strategies" to get AI recommendations</p>
      </div>

      <div v-else-if="isGenerating" class="text-center py-8">
        <Icon name="mdi:loading" class="text-4xl mb-2 animate-spin text-emerald-400" />
        <p class="text-gray-600 dark:text-gray-400">Generating strategies...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AiStrategyCard
          v-for="strategy in strategies"
          :key="strategy.id"
          :strategy="strategy"
          @select="handleSelectStrategy"
        />
      </div>
    </UiCard>

    <AiStrategyChat />
  </div>
</template>

<script setup lang="ts">
import type { Strategy } from '~~/shared/types/ai'
import { useAIStore } from '~~/stores/ai'
import { useVaultStore } from '~~/stores/vault'

const aiStore = useAIStore()
const { generateStrategy } = useAI()
const vaultStore = useVaultStore()

const isGenerating = ref(false)

const strategies = computed(() => aiStore.strategies)

const generateStrategies = async () => {
  if (!vaultStore.balance || parseFloat(vaultStore.balance) === 0) {
    // Show message that user needs to deposit first
    return
  }

  isGenerating.value = true
  try {
    const result = await generateStrategy(vaultStore.balance)
    aiStore.setStrategies(result.strategies)
  } catch (error: any) {
    console.error('Failed to generate strategies:', error)
  } finally {
    isGenerating.value = false
  }
}

const handleSelectStrategy = (strategy: Strategy) => {
  aiStore.setCurrentStrategy(strategy)
  // Could emit event or navigate to strategy detail page
}

onMounted(() => {
  if (strategies.value.length === 0 && parseFloat(vaultStore.balance) > 0) {
    generateStrategies()
  }
})
</script>

