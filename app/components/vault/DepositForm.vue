<template>
  <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/5 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 transition-all duration-300 hover:border-emerald-500/30">
    <!-- Background glow -->
    <div class="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/15 transition-colors"></div>
    
    <div class="relative">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
          <Icon name="mdi:arrow-down-bold" class="text-xl text-emerald-400" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Deposit</h3>
          <p class="text-xs text-slate-500">Add funds to your vault</p>
        </div>
      </div>

      <form @submit.prevent="handleDeposit" class="space-y-5">
      <UiInput
        v-model="amount"
        label="Amount"
        type="number"
        placeholder="0.0"
        :error="error"
        :disabled="loading || !isConnected"
      >
        <template #suffix>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="setMax"
                class="text-xs font-medium px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
                MAX
            </button>
              <span class="text-slate-500 text-sm">vaultBTC</span>
          </div>
        </template>
      </UiInput>

        <!-- Fee Breakdown -->
        <div v-if="amount && parseFloat(amount) > 0" class="space-y-2 py-3 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-400">Deposit Amount</span>
            <span class="text-white">{{ amount }} vaultBTC</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-400 flex items-center gap-1">
              <Icon name="mdi:information-outline" class="text-xs" />
              Platform Fee ({{ FEE_PERCENT }}%)
            </span>
            <span class="text-amber-400">+{{ feeAmount }} vaultBTC</span>
          </div>
          <div class="border-t border-slate-700/50 pt-2 mt-2">
            <div class="flex items-center justify-between text-sm font-medium">
              <span class="text-slate-300">Total from Wallet</span>
              <span class="text-emerald-400">{{ totalAmount }} vaultBTC</span>
            </div>
          </div>
        </div>

        <div v-if="isConnected" class="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <span class="text-sm text-slate-400">Wallet Balance</span>
          <span class="text-sm font-medium text-white">{{ vaultBTCBalance }} <span class="text-emerald-400">vaultBTC</span></span>
        </div>

        <!-- Insufficient balance warning -->
        <div v-if="hasInsufficientBalance" class="flex items-center gap-2 py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <Icon name="mdi:alert-circle" class="text-red-400" />
          <span class="text-xs text-red-400">Insufficient balance (need {{ totalAmount }} vaultBTC)</span>
      </div>

      <UiButton
        type="submit"
        :loading="loading"
          :disabled="!isConnected || !amount || parseFloat(amount) <= 0 || hasInsufficientBalance"
        class="w-full"
      >
          <Icon name="mdi:arrow-down-bold" class="mr-2" />
          {{ loading ? 'Processing...' : 'Deposit to Vault' }}
      </UiButton>

        <p v-if="!isConnected" class="text-sm text-slate-500 text-center py-2 px-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <Icon name="mdi:wallet-outline" class="mr-1" />
          Connect wallet to deposit
        </p>

        <!-- Fee info -->
        <p class="text-xs text-slate-500 text-center">
          <Icon name="mdi:information-outline" class="mr-1" />
          {{ FEE_PERCENT }}% platform fee funds the yield reserves
      </p>
    </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppKitAccount } from '@reown/appkit/vue';

const { $toast } = useNuxtApp()
const accountData = useAppKitAccount();
const isConnected = computed(() => accountData.value?.isConnected)
const address = computed(() => accountData.value?.address)
const { deposit, getVaultBTCBalance, fundYieldReserves } = useVault()

const FEE_PERCENT = 0.5 // 0.5% fee

const amount = ref('')
const loading = ref(false)
const error = ref('')
const vaultBTCBalance = ref('0')

// Calculate fee amount
const feeAmount = computed(() => {
  const depositAmount = parseFloat(amount.value) || 0
  return (depositAmount * FEE_PERCENT / 100).toFixed(4)
})

// Calculate total amount (deposit + fee)
const totalAmount = computed(() => {
  const depositAmount = parseFloat(amount.value) || 0
  const fee = parseFloat(feeAmount.value) || 0
  return (depositAmount + fee).toFixed(4)
})

// Check if user has sufficient balance
const hasInsufficientBalance = computed(() => {
  if (!amount.value) return false
  const total = parseFloat(totalAmount.value) || 0
  const balance = parseFloat(vaultBTCBalance.value) || 0
  return total > balance
})

const setMax = () => {
  // Calculate max deposit considering the fee
  // If balance is B and fee is F%, then max deposit D satisfies: D + D*F/100 = B
  // D = B / (1 + F/100)
  const balance = parseFloat(vaultBTCBalance.value) || 0
  const maxDeposit = balance / (1 + FEE_PERCENT / 100)
  amount.value = maxDeposit.toFixed(4)
}

const handleDeposit = async () => {
  if (!amount.value || parseFloat(amount.value) <= 0) {
    $toast.warning('Please enter a valid amount')
    return
  }

  if (hasInsufficientBalance.value) {
    $toast.error('Insufficient balance')
    return
  }

  loading.value = true
  error.value = ''

  try {
    const depositAmount = amount.value
    const fee = feeAmount.value
    
    // Step 1: Fund yield reserves with the fee
    if (parseFloat(fee) > 0) {
      console.log('Funding yield reserves with fee:', fee)
      $toast.info({ title: 'Processing Fee', message: `Funding reserves with ${fee} vaultBTC` })
      await fundYieldReserves(fee)
    }
    
    // Step 2: Deposit the main amount
    console.log('Depositing to vault:', depositAmount)
    await deposit(depositAmount)
    
    $toast.success({
      title: 'Deposit Successful!',
      message: `Deposited ${depositAmount} vaultBTC to your vault`
    })
    
    amount.value = ''
    emit('deposited', depositAmount)
  } catch (err: any) {
    console.error('Deposit error:', err)
    $toast.error({
      title: 'Deposit Failed',
      message: err.message || 'Failed to deposit'
    })
  } finally {
    loading.value = false
  }
}

const emit = defineEmits<{
  deposited: [amount: string]
}>()

const fetchBalance = async () => {
  if (address.value) {
    vaultBTCBalance.value = await getVaultBTCBalance(address.value)
  }
  }

onMounted(fetchBalance)
watch(address, fetchBalance)
</script>
