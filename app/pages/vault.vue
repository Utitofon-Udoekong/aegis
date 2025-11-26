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
      </div>
    </header>

    <!-- Main Content -->
      <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <!-- Stats with loading state -->
      <div v-if="isLoading && !hasLoadedOnce" class="mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="rounded-2xl bg-slate-900 border border-slate-700/50 p-6 animate-pulse">
            <div class="h-4 w-20 bg-slate-700 rounded mb-4"></div>
            <div class="h-8 w-32 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
      <VaultStats
        v-else
        :balance="balance"
        :apy="apy"
        :rewards="userRewards"
        :deposit-time="depositTime"
        :last-claim-time="lastClaimTime"
        :yield-reserves="yieldReserves"
        :transactions="transactions"
        @yield-claimed="handleYieldClaimed"
      />

        <!-- Deposit/Withdraw Forms -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <VaultDepositForm @deposited="handleDeposit" />
          <VaultWithdrawForm
            :vault-balance="balance"
            :rewards="userRewards"
            @withdrawn="handleWithdraw"
          />
      </div>

      <!-- Charts and History -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VaultPortfolioChart
          :transactions="transactions"
          :balance="balance"
        />
          <VaultTransactionHistory :transactions="transactions" />
      </div>
    </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppKitAccount } from "@reown/appkit/vue";
import { useVaultStore } from '~~/stores/vault'
import type { Transaction } from '~~/shared/types/vault'

const accountData = useAppKitAccount();
const isConnected = computed(() => accountData.value?.isConnected)
const address = computed(() => accountData.value?.address)
const vaultStore = useVaultStore()

// Use composables directly
const { getBalance, calculateYield, getTotalDeposits, getDepositInfo, getYieldReserves, getAPY } = useVault()
const { fetchTransactions, clearTransactionCache } = useTransactions()

// Reactive state
const balance = ref('0')
const userRewards = ref('0')
const apy = ref(5.0)
const transactions = ref<Transaction[]>([])
const isLoading = ref(true) // Start as true to show loading on initial render
const depositTime = ref(0)
const lastClaimTime = ref(0)
const yieldReserves = ref('0')
const hasLoadedOnce = ref(false) // Track if we've loaded data at least once

// Sync local state with Pinia store
const syncToStore = () => {
  vaultStore.balance = balance.value
  vaultStore.userRewards = userRewards.value
  vaultStore.apy = apy.value
  vaultStore.transactions = transactions.value
}

// Fetch all vault data - optimized for speed
const fetchVaultData = async (userAddress: string) => {
  if (!userAddress) {
    balance.value = '0'
    userRewards.value = '0'
    transactions.value = []
    depositTime.value = 0
    lastClaimTime.value = 0
    vaultStore.reset()
    isLoading.value = false
    return
  }

  isLoading.value = true
  const startTime = Date.now()
  
  try {
    // Fetch critical data in parallel (fast RPC calls)
    const [depositInfoResult, reservesResult, apyResult] = await Promise.all([
      getDepositInfo(userAddress).catch(async () => {
        // Fallback for old contract
        const [bal, rewards] = await Promise.all([
          getBalance(userAddress).catch(() => '0'),
          calculateYield(userAddress).catch(() => '0'),
        ])
        return { amount: bal, depositTime: 0, lastClaimTime: 0, pendingYield: rewards }
      }),
      getYieldReserves().catch(() => '0'),
      getAPY().catch(() => 500),
    ])


    // Update UI immediately with core data
    balance.value = depositInfoResult.amount
    userRewards.value = depositInfoResult.pendingYield
    depositTime.value = depositInfoResult.depositTime
    lastClaimTime.value = depositInfoResult.lastClaimTime
    yieldReserves.value = reservesResult
    apy.value = apyResult / 100
    
    // Mark as loaded so UI shows
    isLoading.value = false
    hasLoadedOnce.value = true
    
    // Sync to store for other pages
    syncToStore()

    // Fetch transactions in background (slow - uses public RPCs)
    fetchTransactions(userAddress)
      .then((txs) => {
        transactions.value = txs
        syncToStore()
      })
      .catch((e) => {
      })

  } catch (error) {
    isLoading.value = false
    hasLoadedOnce.value = true
  }
}

const handleDeposit = async () => {
  const addr = address.value
  if (addr) {
    // Clear cache to force fresh fetch
    clearTransactionCache(addr)
    // Add a small delay to allow blockchain to update
    await new Promise(resolve => setTimeout(resolve, 3000))
    await fetchVaultData(addr)
  }
}

const handleWithdraw = async () => {
  const addr = address.value
  if (addr) {
    clearTransactionCache(addr)
    await new Promise(resolve => setTimeout(resolve, 3000))
    await fetchVaultData(addr)
  }
}

const handleYieldClaimed = async () => {
  const addr = address.value
  if (addr) {
    clearTransactionCache(addr)
    await new Promise(resolve => setTimeout(resolve, 3000))
    await fetchVaultData(addr)
  }
}

// Watch for address/connection changes
watch([address, isConnected], async ([newAddress, connected]) => {
  if (newAddress && connected) {
    await fetchVaultData(newAddress)
  } else {
    balance.value = '0'
    userRewards.value = '0'
    transactions.value = []
    depositTime.value = 0
    lastClaimTime.value = 0
    vaultStore.reset()
  }
}, { immediate: true })
</script>
