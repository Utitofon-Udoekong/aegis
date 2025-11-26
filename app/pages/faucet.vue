<template>
  <div class="min-h-screen bg-slate-950 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 bg-grid-pattern"></div>
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
    <div class="absolute top-1/2 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
      <!-- Header -->
      <header class="mb-8">
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
            <WalletConnectButton />
          </div>
        </div>
      </header>

      <!-- Faucet Hero -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30 mb-6">
          <Icon name="mdi:water" class="text-4xl text-cyan-400" />
        </div>
        <h1 class="text-4xl font-bold mb-3 text-white">vaultBTC Faucet</h1>
        <p class="text-lg text-slate-400">Get test tokens to try out Bitcoin Vault AI</p>
      </div>

      <!-- Main Faucet Card -->
      <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-900 border border-cyan-500/20 p-8 mb-8 transition-all duration-300 hover:border-cyan-500/30">
        <div class="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div class="relative space-y-6">
          <!-- Amount Selection -->
            <div>
            <label class="block text-sm font-medium text-slate-300 mb-3">Select Amount</label>
            <div class="grid grid-cols-5 gap-2">
              <button
                  v-for="amount in presetAmounts"
                  :key="amount"
                  @click="selectedAmount = amount"
                :class="[
                  'py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200',
                  selectedAmount === amount 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25' 
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-cyan-500/30 hover:text-cyan-400'
                ]"
                >
                {{ amount }}
              </button>
              </div>
            </div>

          <!-- Custom Amount -->
            <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Or Enter Custom Amount</label>
              <UiInput
                v-model="customAmount"
                type="number"
                placeholder="0.0"
                :disabled="loading"
              >
                <template #suffix>
                <span class="text-slate-500 text-sm">vaultBTC</span>
                </template>
              </UiInput>
            </div>

          <!-- Wallet Info Panel -->
          <div v-if="isConnected && address" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p class="text-xs text-slate-500 mb-1">Wallet</p>
                <p class="text-sm font-mono text-cyan-400">{{ truncatedAddress }}</p>
              </div>
              <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p class="text-xs text-slate-500 mb-1">Balance</p>
                <p class="text-sm font-semibold text-white">{{ vaultBTCBalance }} <span class="text-cyan-400">vaultBTC</span></p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p class="text-xs text-slate-500 mb-1">Daily Remaining</p>
                <p class="text-sm font-semibold text-emerald-400">{{ faucetInfo.remainingDaily }} vaultBTC</p>
              </div>
              <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p class="text-xs text-slate-500 mb-1">Lifetime Remaining</p>
                <p class="text-sm font-semibold text-emerald-400">{{ faucetInfo.remainingLifetime }} vaultBTC</p>
              </div>
            </div>

            <div v-if="faucetInfo.cooldownRemaining >= 0.1" class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Icon name="mdi:timer-sand" class="text-amber-400" />
                  <span class="text-sm text-amber-400">Cooldown Active</span>
              </div>
                <span class="text-sm font-semibold text-amber-400">{{ formatCooldown(faucetInfo.cooldownRemaining) }}</span>
              </div>
              </div>
            </div>

          <!-- Mint Button -->
          <button
              @click="handleMint"
              :disabled="!isConnected || loading || !canMint || !faucetInfo.canMint"
            class="group/btn relative w-full py-4 px-6 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 transition-all duration-300"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <div class="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <span class="relative flex items-center justify-center gap-2">
              <Icon v-if="loading" name="mdi:loading" class="animate-spin" />
              <Icon v-else name="mdi:water" />
              {{ loading ? 'Minting...' : (faucetInfo.cooldownRemaining >= 0.1 ? 'Cooldown Active' : 'Request vaultBTC') }}
            </span>
          </button>

          <p v-if="!isConnected" class="text-sm text-slate-500 text-center py-3 px-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <Icon name="mdi:wallet-outline" class="mr-1" />
            Connect your wallet to request tokens
            </p>

          <!-- Error/Success Messages -->
          <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p class="text-sm text-red-400 flex items-center gap-2">
              <Icon name="mdi:alert-circle" />
              {{ error }}
            </p>
            </div>

          <div v-if="success" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p class="text-sm text-emerald-400 flex items-center gap-2">
              <Icon name="mdi:check-circle" />
              Successfully minted {{ mintedAmount }} vaultBTC! 
              <NuxtLink to="/vault" class="underline font-semibold hover:text-emerald-300">Go to Vault →</NuxtLink>
              </p>
          </div>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="group relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 transition-all duration-300 hover:border-slate-600/50">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 ring-1 ring-blue-500/30">
              <Icon name="mdi:information" class="text-xl text-blue-400" />
            </div>
            <h3 class="text-lg font-semibold text-white">About the Faucet</h3>
          </div>
          <ul class="space-y-2 text-sm text-slate-400">
            <li class="flex items-start gap-2">
              <Icon name="mdi:circle-small" class="text-slate-600 mt-0.5" />
              <span><strong class="text-slate-300">Testnet only</strong> - tokens have no real value</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="mdi:circle-small" class="text-slate-600 mt-0.5" />
              <span><strong class="text-slate-300">Max per request:</strong> 1000 vaultBTC</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="mdi:circle-small" class="text-slate-600 mt-0.5" />
              <span><strong class="text-slate-300">Daily limit:</strong> 2000 vaultBTC</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="mdi:circle-small" class="text-slate-600 mt-0.5" />
              <span><strong class="text-slate-300">Lifetime limit:</strong> 5000 vaultBTC</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="mdi:circle-small" class="text-slate-600 mt-0.5" />
              <span><strong class="text-slate-300">Cooldown:</strong> 24 hours between requests</span>
            </li>
            </ul>
        </div>

        <div class="group relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 transition-all duration-300 hover:border-slate-600/50">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
              <Icon name="mdi:rocket-launch" class="text-xl text-emerald-400" />
            </div>
            <h3 class="text-lg font-semibold text-white">Quick Start</h3>
          </div>
          <ol class="space-y-3 text-sm text-slate-400">
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex-shrink-0">1</span>
              <span>Connect your wallet (MetaMask, WalletConnect, etc.)</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex-shrink-0">2</span>
              <span>Request vaultBTC tokens from this faucet</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex-shrink-0">3</span>
              <span>Go to the <NuxtLink to="/vault" class="text-emerald-400 hover:text-emerald-300 underline">Vault</NuxtLink> page</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex-shrink-0">4</span>
              <span>Deposit your vaultBTC and start earning yield!</span>
            </li>
            </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppKitAccount } from "@reown/appkit/vue";

const { $toast } = useNuxtApp()
const accountData = useAppKitAccount();
const isConnected = computed(() => accountData.value?.isConnected)
const address = computed(() => accountData.value?.address)
const { mintVaultBTC, getVaultBTCBalance, getFaucetInfo } = useVault()

const presetAmounts = ['50', '100', '200', '500', '1000']
const selectedAmount = ref('200')
const customAmount = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const mintedAmount = ref('')
const vaultBTCBalance = ref('0')
const faucetInfo = ref({
  remainingDaily: '0',
  remainingLifetime: '0',
  cooldownRemaining: 0,
  canMint: false,
})

const truncatedAddress = computed(() => {
  if (!address.value) return ''
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
})

const canMint = computed(() => {
  const amount = customAmount.value || selectedAmount.value
  const amountNum = parseFloat(amount)
  
  if (!amount || amountNum <= 0) return false
  if (amountNum > 1000) return false
  if (amountNum > parseFloat(faucetInfo.value.remainingDaily)) return false
  if (amountNum > parseFloat(faucetInfo.value.remainingLifetime)) return false
  if (faucetInfo.value.cooldownRemaining >= 0.1) return false
    
  return true
})

const formatCooldown = (seconds: number): string => {
  if (!seconds || seconds < 0.1 || isNaN(seconds) || !isFinite(seconds)) {
    return 'Ready'
  }
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

const handleMint = async () => {
  if (!isConnected.value || !address.value) {
    $toast.warning('Please connect your wallet first')
    return
  }

  const amount = customAmount.value || selectedAmount.value
  const amountNum = parseFloat(amount)
  
  if (!amount || amountNum <= 0) {
    $toast.warning('Please enter a valid amount')
    return
  }
  
  if (amountNum > 1000) {
    $toast.error('Maximum 1000 vaultBTC per request')
    return
  }
  
  if (amountNum > parseFloat(faucetInfo.value.remainingDaily)) {
    $toast.error({
      title: 'Daily Limit Exceeded',
      message: `Remaining: ${faucetInfo.value.remainingDaily} vaultBTC`
    })
    return
  }
  
  if (amountNum > parseFloat(faucetInfo.value.remainingLifetime)) {
    $toast.error({
      title: 'Lifetime Limit Exceeded',
      message: `Remaining: ${faucetInfo.value.remainingLifetime} vaultBTC`
    })
    return
  }
  
  if (faucetInfo.value.cooldownRemaining >= 0.1) {
    $toast.warning({
      title: 'Cooldown Active',
      message: `Please wait ${formatCooldown(faucetInfo.value.cooldownRemaining)}`
    })
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    await mintVaultBTC(amount)
    mintedAmount.value = amount
    success.value = true
    
    $toast.success({
      title: 'Tokens Minted!',
      message: `Successfully minted ${amount} vaultBTC`
    })
    
    vaultBTCBalance.value = await getVaultBTCBalance(address.value)
    faucetInfo.value = await getFaucetInfo(address.value)
    
    customAmount.value = ''
    selectedAmount.value = '200'
  } catch (err: any) {
    $toast.error({
      title: 'Mint Failed',
      message: err.message || 'Failed to mint tokens'
    })
    console.error('Mint error:', err)
  } finally {
    loading.value = false
  }
}

watch([isConnected, address], async ([connected, addr]) => {
  if (connected && addr) {
    vaultBTCBalance.value = await getVaultBTCBalance(addr)
    faucetInfo.value = await getFaucetInfo(addr)
  }
}, { immediate: true })

let cooldownInterval: NodeJS.Timeout | null = null

watch([isConnected, address], ([connected, addr]) => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
    cooldownInterval = null
  }
  
  if (connected && addr) {
    cooldownInterval = setInterval(async () => {
      faucetInfo.value = await getFaucetInfo(addr)
    }, 1000)
  }
})

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})
</script>
