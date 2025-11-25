<template>
  <div class="min-h-screen bg-slate-950 dark:bg-slate-950 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 bg-grid-pattern"></div>
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

    <div class="relative">
      <!-- Header -->
      <header class="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur sticky top-0 z-50">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <NuxtLink to="/" class="flex items-center gap-3">
              <Logo />
            </NuxtLink>
            <div class="flex items-center gap-4">
              <NuxtLink to="/vault">
                <UiButton variant="outline" size="sm" class="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                  <Icon name="mdi:wallet" class="mr-2" />
                  Vault
                </UiButton>
              </NuxtLink>
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <h1 class="text-4xl font-bold mb-8 text-white">AI Strategy Advisor</h1>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AiStrategyCard
            v-for="strategy in aiStore.strategies"
            :key="strategy.id"
            :strategy="strategy"
            @select="handleSelectStrategy"
          />
        </div>

        <AiStrategyChat />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAIStore } from '~~/stores/ai'
import { useVaultStore } from '~~/stores/vault'

const aiStore = useAIStore()
const vaultStore = useVaultStore()
const { generateStrategy } = useAI()

const handleSelectStrategy = (strategy: any) => {
  aiStore.setCurrentStrategy(strategy)
}

onMounted(async () => {
  if (aiStore.strategies.length === 0 && parseFloat(vaultStore.balance) > 0) {
    try {
      const result = await generateStrategy(vaultStore.balance)
      aiStore.setStrategies(result.strategies)
    } catch (error) {
      console.error('Failed to load strategies:', error)
    }
  }
})
</script>
