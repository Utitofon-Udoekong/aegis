<template>
  <div class="min-h-screen bg-slate-950 dark:bg-slate-950 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 bg-grid-pattern"></div>
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>

    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
      <!-- Header -->
      <header class="mb-8">
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
      </header>

      <!-- Faucet Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
        <div class="text-center mb-8">
          <Icon name="mdi:water" class="text-6xl text-emerald-400 mb-4 mx-auto" />
          <h1 class="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            vaultBTC Faucet
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Get test tokens to try out Bitcoin Vault AI
          </p>
        </div>

        <UiCard class="mb-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Amount to Request
              </label>
              <div class="flex gap-2">
                <UiButton
                  v-for="amount in presetAmounts"
                  :key="amount"
                  @click="selectedAmount = amount"
                  :variant="selectedAmount === amount ? 'primary' : 'outline'"
                  size="sm"
                  class="flex-1"
                >
                  {{ amount }} vaultBTC
                </UiButton>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Or Enter Custom Amount
              </label>
              <UiInput
                v-model="customAmount"
                type="number"
                placeholder="0.0"
                :disabled="loading"
              >
                <template #suffix>
                  <span class="text-slate-400">vaultBTC</span>
                </template>
              </UiInput>
            </div>

            <div v-if="isConnected && address" class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Your Wallet:</span>
                <span class="text-sm font-mono text-emerald-600 dark:text-emerald-400">{{ truncatedAddress }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Current Balance:</span>
                <span class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{{ vaultBTCBalance }} vaultBTC</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Remaining Daily:</span>
                <span class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{{ faucetInfo.remainingDaily }} vaultBTC</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Remaining Lifetime:</span>
                <span class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{{ faucetInfo.remainingLifetime }} vaultBTC</span>
              </div>
              <div v-if="faucetInfo.cooldownRemaining >= 0.1" class="flex items-center justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <span class="text-sm text-gray-600 dark:text-gray-400">Cooldown:</span>
                <span class="text-sm font-semibold text-orange-600 dark:text-orange-400">{{ formatCooldown(faucetInfo.cooldownRemaining) }}</span>
              </div>
            </div>

            <UiButton
              @click="handleMint"
              :loading="loading"
              :disabled="!isConnected || loading || !canMint || !faucetInfo.canMint"
              class="w-full"
              size="lg"
            >
              <Icon name="mdi:water" class="mr-2" />
              {{ loading ? 'Minting...' : (faucetInfo.cooldownRemaining >= 0.1 ? 'Cooldown Active' : 'Request vaultBTC') }}
            </UiButton>

            <p v-if="!isConnected" class="text-sm text-center text-gray-500 dark:text-gray-400">
              Please connect your wallet to request tokens
            </p>

            <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
            </div>

            <div v-if="success" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-green-600 dark:text-green-400">
                ✅ Successfully minted {{ mintedAmount }} vaultBTC! 
                <NuxtLink to="/vault" class="underline font-semibold">Go to Vault</NuxtLink>
              </p>
            </div>
          </div>
        </UiCard>

        <!-- Info Section -->
        <div class="space-y-4">
          <UiCard>
            <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              <Icon name="mdi:information" class="inline mr-2 text-emerald-400" />
              About the Faucet
            </h3>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• This faucet is for <strong>testnet only</strong> - tokens have no real value</li>
              <li>• You can request vaultBTC tokens to test the vault functionality</li>
              <li>• Use these tokens to deposit into the AI Vault and earn yield</li>
              <li>• <strong>Max per request:</strong> 1000 vaultBTC</li>
              <li>• <strong>Daily limit:</strong> 2000 vaultBTC per wallet</li>
              <li>• <strong>Lifetime limit:</strong> 5000 vaultBTC per wallet</li>
              <li>• <strong>Cooldown:</strong> 24 hours between requests</li>
            </ul>
          </UiCard>

          <UiCard>
            <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              <Icon name="mdi:lightbulb" class="inline mr-2 text-emerald-400" />
              Quick Start
            </h3>
            <ol class="space-y-2 text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside">
              <li>Connect your wallet (MetaMask, WalletConnect, etc.)</li>
              <li>Request vaultBTC tokens from this faucet</li>
              <li>Go to the <NuxtLink to="/vault" class="text-emerald-400 hover:text-emerald-300 underline">Vault</NuxtLink> page</li>
              <li>Deposit your vaultBTC and start earning yield!</li>
            </ol>
          </UiCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppKitAccount } from "@reown/appkit/vue";

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
  if (amountNum > 1000) return false // Max per request
  if (amountNum > parseFloat(faucetInfo.value.remainingDaily)) return false
  if (amountNum > parseFloat(faucetInfo.value.remainingLifetime)) return false
  // Use same threshold as formatCooldown (0.1 seconds) to determine if cooldown is active
  if (faucetInfo.value.cooldownRemaining >= 0.1) return false
    
  return true
})

const formatCooldown = (seconds: number): string => {
  // Handle very small numbers (essentially 0) or invalid values
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
    error.value = 'Please connect your wallet first'
    return
  }

  const amount = customAmount.value || selectedAmount.value
  const amountNum = parseFloat(amount)
  
  if (!amount || amountNum <= 0) {
    error.value = 'Please enter a valid amount'
    return
  }
  
  if (amountNum > 1000) {
    error.value = 'Maximum 1000 vaultBTC per request'
    return
  }
  
  if (amountNum > parseFloat(faucetInfo.value.remainingDaily)) {
    error.value = `Daily limit exceeded. Remaining: ${faucetInfo.value.remainingDaily} vaultBTC`
    return
  }
  
  if (amountNum > parseFloat(faucetInfo.value.remainingLifetime)) {
    error.value = `Lifetime limit exceeded. Remaining: ${faucetInfo.value.remainingLifetime} vaultBTC`
    return
  }
  
  // Use same threshold (0.1 seconds) as formatCooldown to determine if cooldown is active
  if (faucetInfo.value.cooldownRemaining >= 0.1) {
    error.value = `Cooldown active. Please wait ${formatCooldown(faucetInfo.value.cooldownRemaining)}`
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    await mintVaultBTC(amount)
    mintedAmount.value = amount
    success.value = true
    
    // Refresh balance and faucet info
    vaultBTCBalance.value = await getVaultBTCBalance(address.value)
    faucetInfo.value = await getFaucetInfo(address.value)
    
    // Clear form
    customAmount.value = ''
    selectedAmount.value = '200'
  } catch (err: any) {
    error.value = err.message || 'Failed to mint tokens'
    console.error('Mint error:', err)
  } finally {
    loading.value = false
  }
}

// Load balance and faucet info when wallet connects
watch([isConnected, address], async ([connected, addr]) => {
  if (connected && addr) {
    console.log("faucetInfo", faucetInfo.value)
    console.log("connected", connected)
    console.log("addr", addr)
    vaultBTCBalance.value = await getVaultBTCBalance(addr)
    faucetInfo.value = await getFaucetInfo(addr)
  }
}, { immediate: true })

// Refresh faucet info periodically to update cooldown
let cooldownInterval: NodeJS.Timeout | null = null

watch([isConnected, address], ([connected, addr]) => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
    cooldownInterval = null
  }
  
  if (connected && addr) {
    cooldownInterval = setInterval(async () => {
      faucetInfo.value = await getFaucetInfo(addr)
    }, 1000) // Update every second
  }
})

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})

onMounted(() => {
  console.log('Faucet mounted')
  console.log("isConnected", !isConnected.value)
  console.log("loading", loading.value)
  console.log("canMint", canMint.value)
  console.log("faucetInfo.canMint", faucetInfo.value.canMint)
})
</script>

