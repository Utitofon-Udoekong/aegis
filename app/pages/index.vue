<template>
  <div class="min-h-screen bg-slate-950 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 bg-grid-pattern"></div>
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
    <div class="absolute top-1/2 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl"></div>

    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
    <!-- Header -->
      <header class="mb-16">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <Logo />
          </div>
          <div class="flex items-center gap-3">
            <NuxtLink to="/strategy">
              <UiButton variant="outline" size="sm">
                <Icon name="mdi:robot" class="mr-2" />
                AI Strategy
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
    </header>

    <!-- Hero Section -->
      <div class="text-center mb-20">
        <div class="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span class="text-emerald-400 text-sm font-medium">AI-Enhanced Finance & Risk Track</span>
        </div>
        
        <h1 class="text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight">
          <span class="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
            AEGIS
          </span>
        </h1>
        
        <p class="text-xl sm:text-2xl text-slate-300 mb-4 font-medium">
          AI-Optimized DeFi Vaults
        </p>
        <p class="text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Leverage artificial intelligence to optimize your Bitcoin yield strategies with automated DeFi recommendations and real-time market analysis.
      </p>
        
        <div class="flex gap-4 justify-center flex-wrap">
          <button 
            @click="handleGetStarted"
            class="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <span class="relative flex items-center gap-2">
            Get Started
              <Icon name="mdi:arrow-right" />
            </span>
          </button>
          
          <button 
            @click="router.push('/whitepaper')"
            class="px-8 py-4 rounded-xl font-semibold border border-slate-700/50 text-slate-300 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-300"
          >
            <span class="flex items-center gap-2">
              <Icon name="mdi:file-document" />
          Whitepaper
            </span>
          </button>
        </div>
      </div>

    <!-- Features -->
      <section class="mb-20">
        <div class="text-center mb-10">
          <h2 class="text-2xl font-bold text-white mb-2">Why AEGIS?</h2>
          <p class="text-slate-400">Secure, intelligent, and ready for the future</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- AI Feature -->
          <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/20 p-8 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
            <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors"></div>
            <div class="relative text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/30 mb-6">
                <Icon name="mdi:robot" class="text-3xl text-emerald-400" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-white">AI-Optimized</h3>
              <p class="text-slate-400 leading-relaxed">
            Advanced AI analyzes market conditions and your position to generate optimal yield strategies
          </p>
            </div>
          </div>

          <!-- Security Feature -->
          <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-slate-900 to-slate-900 border border-green-500/20 p-8 transition-all duration-300 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10">
            <div class="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-colors"></div>
            <div class="relative text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/20 ring-1 ring-green-500/30 mb-6">
                <Icon name="mdi:shield-check" class="text-3xl text-green-400" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-white">Secure</h3>
              <p class="text-slate-400 leading-relaxed">
            Built with security best practices including ReentrancyGuard and Pausable contracts
          </p>
            </div>
          </div>

          <!-- Cross-Chain Feature -->
          <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-900 border border-cyan-500/20 p-8 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10">
            <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors"></div>
            <div class="relative text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/20 ring-1 ring-cyan-500/30 mb-6">
                <Icon name="mdi:link-variant" class="text-3xl text-cyan-400" />
              </div>
              <h3 class="text-xl font-bold mb-3 text-white">Cross-Chain Ready</h3>
              <p class="text-slate-400 leading-relaxed">
            Designed for future integration with trustless Bitcoin vaults across multiple chains
          </p>
            </div>
          </div>
      </div>
    </section>

    <!-- Statistics -->
      <section class="mb-20">
        <div class="text-center mb-10">
          <h2 class="text-2xl font-bold text-white mb-2">Platform Stats</h2>
          <p class="text-slate-400">Real-time metrics from the vault</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- TVL -->
          <div class="group relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 transition-all duration-300 hover:border-slate-600/50">
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            <div class="relative text-center">
              <div class="flex items-center justify-center gap-2 mb-2">
                <Icon name="mdi:safe" class="text-2xl text-emerald-400" />
              </div>
              <div class="text-4xl font-bold text-white mb-1 tabular-nums">
                {{ isLoading ? '...' : formatTVL(totalDeposits) }}
              </div>
              <div class="text-sm text-slate-400 font-medium">Total Value Locked</div>
            </div>
          </div>

          <!-- Yield Reserves -->
          <div class="group relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 transition-all duration-300 hover:border-slate-600/50">
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            <div class="relative text-center">
              <div class="flex items-center justify-center gap-2 mb-2">
                <Icon name="mdi:gift" class="text-2xl text-green-400" />
              </div>
              <div class="text-4xl font-bold text-white mb-1 tabular-nums">
                {{ isLoading ? '...' : formatTVL(yieldReserves) }}
              </div>
              <div class="text-sm text-slate-400 font-medium">Yield Reserves</div>
            </div>
          </div>

          <!-- APY -->
          <div class="group relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 transition-all duration-300 hover:border-slate-600/50">
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            <div class="relative text-center">
              <div class="flex items-center justify-center gap-2 mb-2">
                <Icon name="mdi:percent" class="text-2xl text-amber-400" />
              </div>
              <div class="text-4xl font-bold text-white mb-1 tabular-nums">{{ apy }}%</div>
              <div class="text-sm text-slate-400 font-medium">Fixed APY</div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="mb-16">
        <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 border border-emerald-500/20 p-10 text-center">
          <div class="absolute top-0 left-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 right-1/4 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div class="relative">
            <h2 class="text-3xl font-bold text-white mb-3">Ready to start earning?</h2>
            <p class="text-slate-400 mb-6 max-w-xl mx-auto">
              Get test tokens from our faucet and experience AI-powered DeFi strategies today.
            </p>
            <div class="flex gap-4 justify-center flex-wrap">
              <NuxtLink to="/faucet">
                <UiButton size="lg">
                  <Icon name="mdi:water" class="mr-2" />
                  Get Test Tokens
                </UiButton>
              </NuxtLink>
              <NuxtLink to="/vault">
                <UiButton variant="outline" size="lg">
                  <Icon name="mdi:wallet" class="mr-2" />
                  Open Vault
                </UiButton>
              </NuxtLink>
            </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
      <footer class="text-center pt-8 border-t border-slate-800">
        <p class="text-slate-500 text-sm">
          Built for AWS Global Vibe Hackathon 2025 • AI-Enhanced Finance & Risk Track
        </p>
      </footer>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useAppKitAccount } from "@reown/appkit/vue";
import { useAppKit } from '@reown/appkit/vue';

const { open } = useAppKit();
const accountData = useAppKitAccount();
const isConnected = computed(() => accountData.value?.isConnected)
const router = useRouter()

// Use composables to fetch vault data
const { getTotalDeposits, getYieldReserves, getAPY } = useVault()

const totalDeposits = ref('0')
const yieldReserves = ref('0')
const apy = ref(5)
const isLoading = ref(true)

const formatTVL = (value: string) => {
  const num = parseFloat(value)
  if (num === 0) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
  return num.toFixed(2)
}

const fetchStats = async () => {
  isLoading.value = true
  try {
    const [deposits, reserves, apyBps] = await Promise.all([
      getTotalDeposits().catch(() => '0'),
      getYieldReserves().catch(() => '0'),
      getAPY().catch(() => 500),
    ])
    
    totalDeposits.value = deposits
    yieldReserves.value = reserves
    apy.value = apyBps / 100
  } catch (error) {
  } finally {
    isLoading.value = false
  }
}

const handleGetStarted = async () => {
  if (isConnected?.value) {
    router.push('/vault')
  } else {
    await open({ view: 'Connect', namespace: 'eip155' })
  } 
}

// Fetch stats on mount
onMounted(() => {
  fetchStats()
})
</script>
