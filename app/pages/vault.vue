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
        :balance="vaultStore.balance"
        :apy="vaultStore.apy"
        :rewards="vaultStore.userRewards"
      />

        <!-- Deposit/Withdraw Forms -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <VaultDepositForm @deposited="handleDeposit" />
          <VaultWithdrawForm
            :vault-balance="vaultStore.balance"
            :rewards="vaultStore.userRewards"
            @withdrawn="handleWithdraw"
          />
      </div>

      <!-- Charts and History -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VaultPortfolioChart
          :transactions="vaultStore.transactions"
          :balance="vaultStore.balance"
        />
          <VaultTransactionHistory :transactions="vaultStore.transactions" />
      </div>
    </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVaultStore } from '~~/stores/vault'

const web3 = useWeb3()
const vaultStore = useVaultStore()

const address = computed(() => {
  const addr = web3.address
  if (addr && typeof addr === 'object' && 'value' in addr) {
    return addr.value
  }
  return typeof addr === 'string' ? addr : undefined
})

const isConnected = computed(() => {
  const connected = web3.isConnected
  if (connected && typeof connected === 'object' && 'value' in connected) {
    return connected.value
  }
  return connected === true
})

const handleDeposit = async () => {
  const addr = address.value
  if (addr) {
    await vaultStore.fetchBalance(addr)
    await vaultStore.fetchTransactions(addr)
  }
}

const handleWithdraw = async () => {
  const addr = address.value
  if (addr) {
    await vaultStore.fetchBalance(addr)
    await vaultStore.fetchTransactions(addr)
  }
}

watch([address, isConnected], async ([newAddress, connected]) => {
  if (newAddress && connected) {
    await vaultStore.fetchBalance(newAddress)
    await vaultStore.fetchTransactions(newAddress)
  } else {
    vaultStore.reset()
  }
}, { immediate: true })
</script>
