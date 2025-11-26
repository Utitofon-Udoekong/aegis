<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
    <UiCard>
      <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <p class="text-emerald-700 dark:text-emerald-300 text-sm font-medium">Your Balance</p>
          <Icon name="mdi:wallet" class="text-2xl text-emerald-400 opacity-70" />
        </div>
        <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{{ formattedBalance }} vaultBTC</p>
        <p v-if="depositTime > 0" class="text-xs text-slate-400 mt-1">
          Deposited {{ formatTimeAgo(depositTime) }}
        </p>
      </div>
    </UiCard>

    <UiCard>
      <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <p class="text-green-700 dark:text-green-300 text-sm font-medium">Total APY</p>
          <Icon name="mdi:trending-up" class="text-2xl text-green-400 opacity-70" />
        </div>
        <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ apy }}%</p>
        <p class="text-xs text-slate-400 mt-1">Min hold: 24 hours</p>
      </div>
    </UiCard>

    <UiCard>
      <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <p class="text-emerald-700 dark:text-emerald-300 text-sm font-medium">Pending Yield</p>
          <Icon name="mdi:gift" class="text-2xl text-emerald-400 opacity-70" />
        </div>
        <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{{ formattedRewards }} vaultBTC</p>
        <p v-if="!canClaimYield && depositTime > 0" class="text-xs text-amber-400 mt-1">
          Claimable in {{ timeUntilClaimable }}
        </p>
        <p v-else-if="canClaimYield" class="text-xs text-green-400 mt-1">
          Ready to claim!
        </p>
      </div>
    </UiCard>

    <UiCard>
      <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <p class="text-slate-700 dark:text-slate-300 text-sm font-medium">Yield Reserves</p>
          <Icon name="mdi:bank" class="text-2xl text-slate-400 opacity-70" />
        </div>
        <p class="text-3xl font-bold text-slate-600 dark:text-slate-300">{{ formattedReserves }} vaultBTC</p>
        <p class="text-xs text-slate-400 mt-1">Available for payouts</p>
      </div>
    </UiCard>
  </div>

  <!-- Claim Yield Button -->
  <div v-if="parseFloat(rewards) > 0 && canClaimYield" class="mb-6">
    <UiButton
      @click="handleClaimYield"
      :loading="claiming"
      :disabled="!canClaimYield || claiming"
      variant="primary"
      class="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
    >
      <Icon name="mdi:gift-outline" class="mr-2" />
      {{ claiming ? 'Claiming...' : `Claim ${formattedRewards} vaultBTC Yield` }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { useAppKitAccount } from "@reown/appkit/vue";

interface Props {
  balance: string
  apy: number
  rewards: string
  depositTime?: number
  lastClaimTime?: number
  yieldReserves?: string
}

const props = withDefaults(defineProps<Props>(), {
  depositTime: 0,
  lastClaimTime: 0,
  yieldReserves: '0',
})

const emit = defineEmits<{
  yieldClaimed: []
}>()

const accountData = useAppKitAccount();
const { claimYield } = useVault()

const claiming = ref(false)

const formattedBalance = computed(() => {
  return parseFloat(props.balance || '0').toFixed(4)
})

const formattedRewards = computed(() => {
  return parseFloat(props.rewards || '0').toFixed(4)
})

const formattedReserves = computed(() => {
  return parseFloat(props.yieldReserves || '0').toFixed(2)
})

// Check if 24 hours have passed since last claim
const canClaimYield = computed(() => {
  if (parseFloat(props.rewards) <= 0) return false
  if (props.lastClaimTime === 0) return false
  
  const now = Math.floor(Date.now() / 1000)
  const timeSinceLastClaim = now - props.lastClaimTime
  const minDepositTime = 86400 // 1 day in seconds
  
  return timeSinceLastClaim >= minDepositTime
})

const timeUntilClaimable = computed(() => {
  if (props.lastClaimTime === 0) return ''
  
  const now = Math.floor(Date.now() / 1000)
  const timeSinceLastClaim = now - props.lastClaimTime
  const minDepositTime = 86400 // 1 day
  const remaining = minDepositTime - timeSinceLastClaim
  
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
    emit('yieldClaimed')
  } catch (error: any) {
    console.error('Error claiming yield:', error)
    alert(error.message || 'Failed to claim yield')
  } finally {
    claiming.value = false
  }
}
</script>
