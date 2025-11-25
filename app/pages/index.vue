<template>
  <div class="min-h-screen bg-slate-950 dark:bg-slate-950 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 bg-grid-pattern"></div>
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
    <!-- Header -->
      <header class="mb-12">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <Logo />
          </div>
          <div class="flex items-center gap-4">
            <NuxtLink to="/strategy">
              <UiButton variant="outline" size="sm" class="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                <Icon name="mdi:robot" class="mr-2" />
                AI Strategy
              </UiButton>
            </NuxtLink>
            <NuxtLink to="/faucet">
              <UiButton variant="outline" size="sm" class="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                <Icon name="mdi:water" class="mr-2" />
                Faucet
              </UiButton>
            </NuxtLink>
            <WalletConnectButton />
          </div>
      </div>
    </header>

    <!-- Hero Section -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
          <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          AI-Enhanced Finance & Risk Track
        </div>
        <h1 class="text-6xl sm:text-7xl font-extrabold mb-4 tracking-tight">
          <span class="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-300 bg-clip-text text-transparent">
            Bitcoin Vault
          </span>
          <br />
          <span class="text-white">AI</span>
        </h1>
        <p class="text-xl sm:text-2xl text-slate-300 mb-3 font-medium">
          AI-Optimized DeFi Vaults
        </p>
        <p class="text-slate-400 max-w-2xl mx-auto mb-8">
          Leverage artificial intelligence to optimize your Bitcoin yield strategies with automated DeFi recommendations and real-time market analysis.
      </p>
      <div class="flex gap-4 justify-center">
          <UiButton 
            size="lg" 
            @click="handleGetStarted"
            class="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
          >
            Get Started
            <Icon name="mdi:arrow-right" class="ml-2" />
          </UiButton>
          <UiButton 
            variant="outline" 
            size="lg" 
            class="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
            @click="router.push('/whitepaper')"
          >
          <Icon name="mdi:file-document" class="mr-2" />
          Whitepaper
          </UiButton>
        </div>
      </div>

    <!-- Features -->
      <section class="mb-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <UiCard class="text-center">
            <Icon name="mdi:robot" class="text-5xl text-emerald-400 mb-4 mx-auto" />
            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">AI-Optimized</h3>
            <p class="text-gray-600 dark:text-gray-400">
            Advanced AI analyzes market conditions and your position to generate optimal yield strategies
          </p>
          </UiCard>

          <UiCard class="text-center">
          <Icon name="mdi:shield-check" class="text-5xl text-green-400 mb-4 mx-auto" />
            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Secure</h3>
            <p class="text-gray-600 dark:text-gray-400">
            Built with security best practices including ReentrancyGuard and Pausable contracts
          </p>
          </UiCard>

          <UiCard class="text-center">
            <Icon name="mdi:link-variant" class="text-5xl text-emerald-400 mb-4 mx-auto" />
            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Cross-Chain Ready</h3>
            <p class="text-gray-600 dark:text-gray-400">
            Designed for future integration with trustless Bitcoin vaults across multiple chains
          </p>
          </UiCard>
      </div>
    </section>

    <!-- Statistics -->
      <section class="mb-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <UiCard>
            <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div class="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{{ analyticsData.tvl }}</div>
              <div class="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Total Value Locked</div>
            </div>
          </UiCard>
          <UiCard>
            <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div class="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{{ analyticsData.users }}</div>
              <div class="text-sm text-green-700 dark:text-green-300 font-medium">Active Users</div>
        </div>
          </UiCard>
          <UiCard>
            <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div class="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{{ analyticsData.apy }}%</div>
              <div class="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Average APY</div>
        </div>
          </UiCard>
      </div>
    </section>

    <!-- Footer -->
      <footer class="text-center mt-12 text-gray-500 dark:text-gray-400 text-sm">
        <p>Built for AWS Global Vibe Hackathon 2025 • AI-Enhanced Finance & Risk Track</p>
      </footer>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useAppKitAccount } from "@reown/appkit/vue";
import { useAppKit } from '@reown/appkit/vue';
const { open } = useAppKit();
const { data: analytics, error } = await useFetch('/api/vault/analytics')
const accountData = useAppKitAccount();
const isConnected = computed(() => accountData.value?.isConnected)
const address = computed(() => accountData.value?.address)
const router = useRouter()

// Provide fallback data if analytics fails to load
const analyticsData = computed(() => analytics.value || {
  tvl: '0',
  users: 0,
  apy: 5.0,
  totalRewards: '0',
})

const handleGetStarted = async () => {
  if (isConnected?.value) {
    router.push('/vault')
  } else {
    await open({ view: 'Connect' , namespace: 'eip155'})
  } 
}
</script>
