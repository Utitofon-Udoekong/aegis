<template>
  <UiCard title="Withdraw vaultBTC">
    <form @submit.prevent="handleWithdraw" class="space-y-4">
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
              class="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Max
            </button>
            <span class="text-slate-400">vaultBTC</span>
          </div>
        </template>
      </UiInput>

      <div v-if="isConnected" class="text-sm text-slate-400">
        <p>Vault Balance: {{ vaultBalance }} vaultBTC</p>
        <p v-if="parseFloat(rewards) > 0" class="text-green-400">
          Estimated Yield: {{ rewards }} vaultBTC
        </p>
      </div>

      <UiButton
        type="submit"
        variant="secondary"
        :loading="loading"
        :disabled="!isConnected || !amount || parseFloat(amount) <= 0"
        class="w-full"
      >
        {{ loading ? 'Processing...' : 'Withdraw' }}
      </UiButton>

      <p v-if="!isConnected" class="text-sm text-slate-400 text-center">
        Please connect your wallet to withdraw
      </p>
    </form>
  </UiCard>
</template>

<script setup lang="ts">
import { useAppKitAccount } from "@reown/appkit/vue";

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

const setMax = () => {
  amount.value = props.vaultBalance
}

const handleWithdraw = async () => {
  if (!amount.value || parseFloat(amount.value) <= 0) {
    error.value = 'Please enter a valid amount'
    return
  }

  if (parseFloat(amount.value) > parseFloat(props.vaultBalance)) {
    error.value = 'Insufficient balance'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await withdraw(amount.value)
    amount.value = ''
    emit('withdrawn', amount.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to withdraw'
  } finally {
    loading.value = false
  }
}

const emit = defineEmits<{
  withdrawn: [amount: string]
}>()
</script>

