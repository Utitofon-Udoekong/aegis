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
      <!-- Stats -->
      <VaultStats
        :balance="balance"
        :apy="apy"
        :rewards="userRewards"
        :deposit-time="depositTime"
        :last-claim-time="lastClaimTime"
        :yield-reserves="yieldReserves"
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
import type { Transaction } from '~~/shared/types/vault'

const accountData = useAppKitAccount();
const isConnected = computed(() => accountData.value?.isConnected)
const address = computed(() => accountData.value?.address)

// Use composables directly
const { getBalance, calculateYield, getTotalDeposits, getDepositInfo, getYieldReserves, getAPY } = useVault()
const { fetchTransactions } = useTransactions()

// Reactive state
const balance = ref('0')
const userRewards = ref('0')
const apy = ref(5.0)
const transactions = ref<Transaction[]>([])
const isLoading = ref(false)
const depositTime = ref(0)
const lastClaimTime = ref(0)
const yieldReserves = ref('0')

// Formatted values
const formattedBalance = computed(() => parseFloat(balance.value || '0').toFixed(4))
const formattedRewards = computed(() => parseFloat(userRewards.value || '0').toFixed(4))

// Fetch all vault data
const fetchVaultData = async (userAddress: string) => {
  if (!userAddress) {
    balance.value = '0'
    userRewards.value = '0'
    transactions.value = []
    depositTime.value = 0
    lastClaimTime.value = 0
    return
  }

  isLoading.value = true
  try {
    const [depositInfo, reservesResult, apyResult, transactionsResult] = await Promise.all([
      getDepositInfo(userAddress).catch(() => ({ amount: '0', depositTime: 0, lastClaimTime: 0, pendingYield: '0' })),
      getYieldReserves().catch(() => '0'),
      getAPY().catch(() => 500),
      fetchTransactions(userAddress).catch(() => [] as Transaction[]),
    ])

    balance.value = depositInfo.amount
    userRewards.value = depositInfo.pendingYield
    depositTime.value = depositInfo.depositTime
    lastClaimTime.value = depositInfo.lastClaimTime
    yieldReserves.value = reservesResult
    apy.value = apyResult / 100 // Convert from basis points to percentage
    transactions.value = transactionsResult
  } catch (error) {
    console.error('Error fetching vault data:', error)
  } finally {
    isLoading.value = false
  }
}

const handleDeposit = async () => {
  const addr = address.value
  if (addr) {
    await fetchVaultData(addr)
  }
}

const handleWithdraw = async () => {
  const addr = address.value
  if (addr) {
    await fetchVaultData(addr)
  }
}

const handleYieldClaimed = async () => {
  const addr = address.value
  if (addr) {
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
  }
}, { immediate: true })
</script>
