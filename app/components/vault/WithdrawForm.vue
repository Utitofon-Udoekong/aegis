<template>
  <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/5 via-slate-900 to-slate-900 border border-amber-500/20 p-6 transition-all duration-300 hover:border-amber-500/30">
    <!-- Background glow -->
    <div class="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/15 transition-colors"></div>
    
    <div class="relative">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 ring-1 ring-amber-500/30">
          <Icon name="mdi:arrow-up-bold" class="text-xl text-amber-400" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Withdraw</h3>
          <p class="text-xs text-slate-500">Remove funds from vault</p>
        </div>
      </div>

      <form @submit.prevent="handleWithdraw" class="space-y-5">
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
                class="text-xs font-medium px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
                MAX
            </button>
              <span class="text-slate-500 text-sm">vaultBTC</span>
          </div>
        </template>
      </UiInput>

        <div v-if="isConnected" class="space-y-2">
          <div class="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span class="text-sm text-slate-400">Vault Balance</span>
            <span class="text-sm font-medium text-white">{{ vaultBalance }} <span class="text-amber-400">vaultBTC</span></span>
          </div>
          
          <div v-if="parseFloat(rewards) > 0" class="flex items-center justify-between py-3 px-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <span class="text-sm text-green-400">Pending Yield</span>
            <span class="text-sm font-medium text-green-400">+{{ rewards }} vaultBTC</span>
          </div>
          
          <div v-if="estimatedYield > 0" class="flex items-center justify-between py-2 px-4 text-xs">
            <span class="text-slate-500">Est. yield with withdrawal</span>
            <span class="text-emerald-400">+{{ estimatedYield.toFixed(6) }} vaultBTC</span>
          </div>
        </div>

        <div class="flex items-start gap-2 py-3 px-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <Icon name="mdi:information-outline" class="text-emerald-400 mt-0.5 flex-shrink-0" />
          <p class="text-xs text-slate-400">
            Withdrawals include proportional yield if held for 24h+
        </p>
      </div>

      <UiButton
        type="submit"
        variant="secondary"
        :loading="loading"
        :disabled="!isConnected || !amount || parseFloat(amount) <= 0"
        class="w-full"
      >
          <Icon name="mdi:arrow-up-bold" class="mr-2" />
          {{ loading ? 'Processing...' : 'Withdraw from Vault' }}
      </UiButton>

        <p v-if="!isConnected" class="text-sm text-slate-500 text-center py-2 px-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <Icon name="mdi:wallet-outline" class="mr-1" />
          Connect wallet to withdraw
      </p>
    </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppKitAccount } from "@reown/appkit/vue";

const { $toast } = useNuxtApp()
const accountData = useAppKitAccount();
interface Props {
  vaultBalance: string
  rewards: string
}

const props = defineProps<Props>()

const { withdraw } = useVault()
const isConnected = computed(() => accountData.value?.isConnected)

const amount = ref('')
const loading = ref(false)
const error = ref('')

// Calculate estimated yield based on withdrawal amount
const estimatedYield = computed(() => {
  if (!amount.value || parseFloat(amount.value) <= 0) return 0
  if (parseFloat(props.vaultBalance) <= 0) return 0
  
  const withdrawAmount = parseFloat(amount.value)
  const totalBalance = parseFloat(props.vaultBalance)
  const totalYield = parseFloat(props.rewards)
  
  // Proportional yield
  return (totalYield * withdrawAmount) / totalBalance
})

const setMax = () => {
  amount.value = props.vaultBalance
}

const handleWithdraw = async () => {
  if (!amount.value || parseFloat(amount.value) <= 0) {
    $toast.warning('Please enter a valid amount')
    return
  }

  if (parseFloat(amount.value) > parseFloat(props.vaultBalance)) {
    $toast.error('Insufficient vault balance')
    return
  }

  loading.value = true
  error.value = ''

  try {
    await withdraw(amount.value)
    const withdrawnAmount = amount.value
    const yieldIncluded = estimatedYield.value > 0 ? ` (+${estimatedYield.value.toFixed(4)} yield)` : ''
    
    $toast.success({
      title: 'Withdrawal Successful!',
      message: `Withdrew ${withdrawnAmount} vaultBTC${yieldIncluded}`
    })
    
    amount.value = ''
    emit('withdrawn', withdrawnAmount)
  } catch (err: any) {
    $toast.error({
      title: 'Withdrawal Failed',
      message: err.message || 'Failed to withdraw'
    })
  } finally {
    loading.value = false
  }
}

const emit = defineEmits<{
  withdrawn: [amount: string]
}>()
</script>
