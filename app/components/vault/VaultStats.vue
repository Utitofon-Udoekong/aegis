<template>
  <div class="mb-8">
    <!-- Main Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Balance Card -->
      <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
        <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors"></div>
        <div class="relative">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
              <Icon name="mdi:wallet-outline" class="text-xl text-emerald-400" />
            </div>
            <span class="text-sm font-medium text-slate-400 uppercase tracking-wider">Your Balance</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-bold text-white tabular-nums">{{ formattedBalance }}</span>
            <span class="text-sm font-medium text-emerald-400">vaultBTC</span>
          </div>
          <p v-if="earliestDepositTime > 0" class="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <Icon name="mdi:clock-outline" class="text-sm" />
            First deposit {{ formatTimeAgo(earliestDepositTime) }}
          </p>
        </div>
      </div>

      <!-- APY Card -->
      <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-slate-900 to-slate-900 border border-green-500/20 p-6 transition-all duration-300 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10">
        <div class="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-colors"></div>
        <div class="relative">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/20 ring-1 ring-green-500/30">
              <Icon name="mdi:chart-line" class="text-xl text-green-400" />
            </div>
            <span class="text-sm font-medium text-slate-400 uppercase tracking-wider">Total APY</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-bold text-white tabular-nums">{{ apy }}</span>
            <span class="text-2xl font-bold text-green-400">%</span>
          </div>
          <div class="mt-2 flex items-center gap-1.5">
            <div class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
            <span class="text-xs text-slate-500">Min hold: 24 hours</span>
          </div>
        </div>
      </div>

      <!-- Pending Yield Card -->
      <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 p-6 transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10">
        <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-colors"></div>
        <div class="relative">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 ring-1 ring-amber-500/30">
              <Icon name="mdi:gift-outline" class="text-xl text-amber-400" />
            </div>
            <span class="text-sm font-medium text-slate-400 uppercase tracking-wider">Pending Yield</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-bold text-white tabular-nums">{{ formattedRewards }}</span>
            <span class="text-sm font-medium text-amber-400">vaultBTC</span>
          </div>
          <div class="mt-2">
            <div v-if="canClaimYield && parseFloat(rewards) > 0" class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span class="text-xs text-green-400 font-medium">Ready to claim!</span>
            </div>
            <div v-else-if="!canClaimYield && earliestDepositTime > 0" class="flex items-center gap-1.5">
              <Icon name="mdi:timer-sand" class="text-sm text-slate-500" />
              <span class="text-xs text-slate-500">Claimable in {{ timeUntilClaimable }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Yield Reserves Card -->
      <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-900 border border-cyan-500/20 p-6 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10">
        <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors"></div>
        <div class="relative">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/20 ring-1 ring-cyan-500/30">
              <Icon name="mdi:safe-square-outline" class="text-xl text-cyan-400" />
            </div>
            <span class="text-sm font-medium text-slate-400 uppercase tracking-wider">Yield Pool</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-bold text-white tabular-nums">{{ formattedReserves }}</span>
            <span class="text-sm font-medium text-cyan-400">vaultBTC</span>
          </div>
          <p class="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <Icon name="mdi:shield-check-outline" class="text-sm text-cyan-500/50" />
            Available for payouts
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons Row -->
    <div class="mt-6 flex flex-wrap gap-4">
      <!-- Claim Yield Button -->
      <button
        v-if="parseFloat(rewards) > 0 && canClaimYield"
        @click="handleClaimYield"
        :disabled="claiming"
        class="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <!-- Animated gradient background -->
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 transition-all duration-300 group-hover:scale-105"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <!-- Shimmer effect -->
        <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <span class="relative flex items-center gap-2">
          <Icon v-if="claiming" name="mdi:loading" class="text-xl animate-spin" />
          <Icon v-else name="mdi:gift" class="text-xl" />
          {{ claiming ? 'Claiming...' : `Claim ${formattedRewards} vaultBTC` }}
        </span>
      </button>

      <!-- Fund Reserves Button (Owner Only) -->
      <button
        v-if="isOwner"
        @click="showFundModal = true"
        class="group relative inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300"
      >
        <!-- Animated gradient background -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300 group-hover:scale-105"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <!-- Shimmer effect -->
        <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <span class="relative flex items-center gap-2">
          <Icon name="mdi:plus-circle" class="text-xl" />
          Fund Reserves
        </span>
      </button>
    </div>

    <!-- Fund Reserves Modal -->
    <Teleport to="body">
      <div v-if="showFundModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showFundModal = false"></div>
        
        <!-- Modal -->
        <div class="relative w-full max-w-md bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 rounded-2xl border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-500/10">
          <button 
            @click="showFundModal = false"
            class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <Icon name="mdi:close" class="text-xl" />
          </button>
          
          <div class="flex items-center gap-3 mb-6">
            <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/20 ring-1 ring-cyan-500/30">
              <Icon name="mdi:safe-square-outline" class="text-2xl text-cyan-400" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">Fund Yield Reserves</h3>
              <p class="text-sm text-slate-400">Add tokens to the yield pool</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Amount to Fund</label>
              <div class="relative">
                <input
                  v-model="fundAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.0"
                  class="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-cyan-400">vaultBTC</span>
              </div>
            </div>
            
            <div class="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span class="text-sm text-slate-400">Your Balance</span>
              <span class="text-sm font-medium text-white">{{ ownerBalance }} <span class="text-cyan-400">vaultBTC</span></span>
            </div>
            
            <button
              @click="handleFundReserves"
              :disabled="funding || !fundAmount || parseFloat(fundAmount) <= 0"
              class="w-full group relative inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300 group-hover:scale-105"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <span class="relative flex items-center gap-2">
                <Icon v-if="funding" name="mdi:loading" class="text-xl animate-spin" />
                <Icon v-else name="mdi:plus-circle" class="text-xl" />
                {{ funding ? 'Funding...' : 'Fund Reserves' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useAppKitAccount } from "@reown/appkit/vue";
import type { Transaction } from '~~/shared/types/vault'

interface Props {
  balance: string
  apy: number
  rewards: string
  depositTime?: number
  lastClaimTime?: number
  yieldReserves?: string
  transactions?: Transaction[]
}

const props = withDefaults(defineProps<Props>(), {
  depositTime: 0,
  lastClaimTime: 0,
  yieldReserves: '0',
  transactions: () => [],
})

const emit = defineEmits<{
  yieldClaimed: []
  reservesFunded: []
}>()

const { $toast } = useNuxtApp()
const accountData = useAppKitAccount();
const { claimYield, fundYieldReserves, getOwner, getVaultBTCBalance } = useVault()

const claiming = ref(false)
const showFundModal = ref(false)
const fundAmount = ref('')
const funding = ref(false)
const ownerAddress = ref('')
const ownerBalance = ref('0')

// Check if current user is the owner
const isOwner = computed(() => {
  if (!accountData.value?.address || !ownerAddress.value) return false
  return accountData.value.address.toLowerCase() === ownerAddress.value.toLowerCase()
})

const formattedBalance = computed(() => {
  return parseFloat(props.balance || '0').toFixed(4)
})

const formattedRewards = computed(() => {
  return parseFloat(props.rewards || '0').toFixed(4)
})

const formattedReserves = computed(() => {
  return parseFloat(props.yieldReserves || '0').toFixed(2)
})

// Get the earliest deposit timestamp from transactions (in seconds)
const earliestDepositTime = computed(() => {
  const deposits = props.transactions.filter(tx => tx.type === 'deposit')
  if (deposits.length === 0) return 0
  
  // Find the earliest deposit (smallest timestamp)
  const earliest = deposits.reduce((min, tx) => {
    const txTime = Math.floor(tx.timestamp / 1000) // Convert ms to seconds
    return txTime < min ? txTime : min
  }, Infinity)
  
  return earliest === Infinity ? 0 : earliest
})

const MIN_DEPOSIT_TIME = 86400 // 24 hours in seconds

// Check if 24 hours have passed since the earliest deposit
const canClaimYield = computed(() => {
  if (parseFloat(props.rewards) <= 0) return false
  if (earliestDepositTime.value === 0) return false
  
  const now = Math.floor(Date.now() / 1000)
  const timeSinceFirstDeposit = now - earliestDepositTime.value
  
  return timeSinceFirstDeposit >= MIN_DEPOSIT_TIME
})

const timeUntilClaimable = computed(() => {
  if (earliestDepositTime.value === 0) return ''
  
  const now = Math.floor(Date.now() / 1000)
  const timeSinceFirstDeposit = now - earliestDepositTime.value
  const remaining = MIN_DEPOSIT_TIME - timeSinceFirstDeposit
  
  if (remaining <= 0) return ''
  
  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
})

const formatTimeAgo = (timestamp: number) => {
  if (!timestamp) return ''
  
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const handleClaimYield = async () => {
  if (!accountData.value?.isConnected) return
  
  claiming.value = true
  try {
    await claimYield()
    $toast.success({
      title: 'Yield Claimed!',
      message: `Successfully claimed ${formattedRewards.value} vaultBTC`
    })
    emit('yieldClaimed')
  } catch (error: any) {
    console.error('Error claiming yield:', error)
    $toast.error({
      title: 'Claim Failed',
      message: error.message || 'Failed to claim yield'
    })
  } finally {
    claiming.value = false
  }
}

const handleFundReserves = async () => {
  if (!fundAmount.value || parseFloat(fundAmount.value) <= 0) return
  
  funding.value = true
  try {
    await fundYieldReserves(fundAmount.value)
    $toast.success({
      title: 'Reserves Funded!',
      message: `Added ${fundAmount.value} vaultBTC to yield pool`
    })
    fundAmount.value = ''
    showFundModal.value = false
    emit('reservesFunded')
  } catch (error: any) {
    console.error('Error funding reserves:', error)
    $toast.error({
      title: 'Funding Failed',
      message: error.message || 'Failed to fund reserves'
    })
  } finally {
    funding.value = false
  }
}

const fetchOwnerData = async () => {
  ownerAddress.value = await getOwner()
  if (accountData.value?.address) {
    ownerBalance.value = await getVaultBTCBalance(accountData.value.address)
  }
}

onMounted(fetchOwnerData)
watch(() => accountData.value?.address, fetchOwnerData)
</script>
