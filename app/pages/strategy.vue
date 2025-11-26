<template>
  <div class="min-h-screen bg-slate-950 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 bg-grid-pattern"></div>
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
    <div class="absolute top-1/3 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>

    <div class="relative">
      <!-- Header -->
      <header class="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <NuxtLink to="/" class="flex items-center gap-3">
              <Logo />
            </NuxtLink>
            <div class="flex items-center gap-4">
              <NuxtLink to="/vault">
                <UiButton variant="outline" size="sm">
                  <Icon name="mdi:wallet" class="mr-2" />
                  Vault
                </UiButton>
              </NuxtLink>
              <NuxtLink to="/faucet">
                <UiButton variant="outline" size="sm">
                  <Icon name="mdi:water" class="mr-2" />
                  Faucet
                </UiButton>
              </NuxtLink>
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <!-- Hero Section -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 ring-1 ring-emerald-500/30 mb-6">
            <Icon name="mdi:robot" class="text-3xl text-emerald-400" />
          </div>
          <h1 class="text-4xl font-bold mb-3 text-white">AI Strategy Advisor</h1>
          <p class="text-lg text-slate-400 max-w-2xl mx-auto">
            Get personalized DeFi strategies powered by AI, tailored to your risk tolerance and investment goals
          </p>
        </div>

        <!-- Balance Display -->
        <div v-if="isConnected" class="flex justify-center mb-8">
          <div class="inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div class="flex items-center gap-2">
              <Icon name="mdi:wallet" class="text-emerald-400" />
              <span class="text-slate-400">Vault Balance:</span>
            </div>
            <span class="text-xl font-bold text-white">{{ currentBalance }} <span class="text-emerald-400">vaultBTC</span></span>
            <UiButton 
              v-if="!loading && (aiStore.strategies.length === 0 || parseFloat(currentBalance) > 0)" 
              @click="handleGenerateClick" 
              size="sm"
              :disabled="loading || parseFloat(currentBalance) <= 0"
            >
              <Icon name="mdi:refresh" :class="loading ? 'animate-spin' : ''" class="mr-1" />
              {{ aiStore.strategies.length > 0 ? 'Refresh' : 'Generate' }} Strategies
            </UiButton>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
            <Icon name="mdi:loading" class="text-3xl text-emerald-400 animate-spin" />
          </div>
          <p class="text-slate-400">Generating AI strategies...</p>
          <p class="text-sm text-slate-500 mt-2">Analyzing market conditions and your portfolio...</p>
        </div>

        <!-- Not Connected -->
        <div v-else-if="!isConnected" class="text-center py-20">
          <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/20 p-12 max-w-xl mx-auto">
            <div class="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div class="relative">
              <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                <Icon name="mdi:wallet-outline" class="text-4xl text-slate-600" />
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
              <p class="text-slate-400 mb-6">
                Connect your wallet to get personalized AI-powered investment strategies
              </p>
              <WalletConnectButton />
            </div>
          </div>
        </div>

        <!-- No Balance -->
        <div v-else-if="parseFloat(currentBalance) <= 0 && aiStore.strategies.length === 0" class="text-center py-20">
          <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/20 p-12 max-w-xl mx-auto">
            <div class="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div class="relative">
              <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                <Icon name="mdi:chart-timeline-variant" class="text-4xl text-slate-600" />
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">No Vault Balance</h3>
              <p class="text-slate-400 mb-6">
                Deposit some vaultBTC to get personalized AI-powered investment strategies
              </p>
              <NuxtLink to="/vault">
                <UiButton>
                  <Icon name="mdi:wallet" class="mr-2" />
                  Go to Vault
                </UiButton>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Strategy Cards Grid -->
        <div v-else-if="aiStore.strategies.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <AiStrategyCard
            v-for="strategy in aiStore.strategies"
            :key="strategy.id"
            :strategy="strategy"
            @select="handleSelectStrategy"
          />
        </div>

        <!-- Error State -->
        <div v-if="error" class="mb-8">
          <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 max-w-xl mx-auto">
            <p class="text-sm text-red-400 flex items-center gap-2">
              <Icon name="mdi:alert-circle" />
              {{ error }}
            </p>
            <UiButton @click="handleGenerateClick" size="sm" variant="outline" class="mt-3">
              Try Again
            </UiButton>
          </div>
        </div>

        <!-- AI Chat Section -->
        <div v-if="aiStore.strategies.length > 0 || parseFloat(currentBalance) > 0" class="mt-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
              <Icon name="mdi:chat" class="text-xl text-emerald-400" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-white">Strategy Chat</h2>
              <p class="text-sm text-slate-500">Ask questions about your strategies and the vault</p>
            </div>
          </div>
        <AiStrategyChat />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAIStore } from '~~/stores/ai'
import { useVaultStore } from '~~/stores/vault'
import { useAppKitAccount } from "@reown/appkit/vue";

const aiStore = useAIStore()
const vaultStore = useVaultStore()
const { generateStrategy } = useAI()
const { getBalance } = useVault()

const accountData = useAppKitAccount();
const isConnected = computed(() => accountData.value?.isConnected)
const address = computed(() => accountData.value?.address)

const loading = ref(false)
const error = ref('')
const fetchedBalance = ref('0')

// Use store balance or fetched balance
const currentBalance = computed(() => {
  const storeBalance = parseFloat(vaultStore.balance)
  const fetched = parseFloat(fetchedBalance.value)
  return storeBalance > 0 ? vaultStore.balance : fetchedBalance.value
})

const handleSelectStrategy = (strategy: any) => {
  aiStore.setCurrentStrategy(strategy)
}

const handleGenerateClick = () => {
  // Force refresh if we already have strategies
  generateStrategies(aiStore.strategies.length > 0)
}

const generateStrategies = async (forceRefresh = false) => {
  // Check cache first (unless forcing refresh)
  if (!forceRefresh && aiStore.loadCachedStrategies(currentBalance.value)) {
    console.log('Using cached strategies')
    return
  }
  
  loading.value = true
  error.value = ''
  
    try {
    const result = await generateStrategy(currentBalance.value)
    // Pass balance to cache the strategies
    aiStore.setStrategies(result.strategies, currentBalance.value)
  } catch (err: any) {
    console.error('Failed to generate strategies:', err)
    error.value = err.message || 'Failed to generate strategies. Please try again.'
  } finally {
    loading.value = false
  }
}

// Fetch balance on mount if not in store
const fetchBalance = async () => {
  if (!address.value) return
  
  try {
    const balance = await getBalance(address.value)
    fetchedBalance.value = balance
    
    // Also update store if empty
    if (parseFloat(vaultStore.balance) <= 0) {
      vaultStore.balance = balance
    }
  } catch (e) {
    console.error('Failed to fetch balance:', e)
  }
}

watch([address, isConnected], async ([addr, connected]) => {
  if (addr && connected) {
    await fetchBalance()
    
    // Auto-generate strategies if balance > 0 and no strategies yet
    if (parseFloat(currentBalance.value) > 0 && aiStore.strategies.length === 0) {
      await generateStrategies()
    }
  }
}, { immediate: true })
</script>
