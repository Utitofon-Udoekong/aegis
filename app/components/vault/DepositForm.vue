<template>
  <UiCard title="Deposit vaultBTC">
    <form @submit.prevent="handleDeposit" class="space-y-4">
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
        <p>Wallet Balance: {{ vaultBTCBalance }} vaultBTC</p>
      </div>

      <UiButton
        type="submit"
        :loading="loading"
        :disabled="!isConnected || !amount || parseFloat(amount) <= 0"
        class="w-full"
      >
        {{ loading ? 'Processing...' : 'Deposit' }}
      </UiButton>

      <p v-if="!isConnected" class="text-sm text-slate-400 text-center">
        Please connect your wallet to deposit
      </p>
    </form>
  </UiCard>
</template>

<script setup lang="ts">
import { useAppKitAccount } from '@reown/appkit/vue';
import { useVaultStore } from '~~/stores/vault'

const accountData = useAppKitAccount();
const isConnected = computed(() => accountData.value?.isConnected)
const address = computed(() => accountData.value?.address)
const { deposit, getVaultBTCBalance } = useVault()
const vaultStore = useVaultStore()

const amount = ref('')
const loading = ref(false)
const error = ref('')
const vaultBTCBalance = ref('0')

const setMax = () => {
  amount.value = vaultBTCBalance.value
}

const handleDeposit = async () => {
  if (!amount.value || parseFloat(amount.value) <= 0) {
    error.value = 'Please enter a valid amount'
    return
  }

  if (parseFloat(amount.value) > parseFloat(vaultBTCBalance.value)) {
    error.value = 'Insufficient balance'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await deposit(amount.value)
    amount.value = ''
    // Emit success event
    emit('deposited', amount.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to deposit'
  } finally {
    loading.value = false
  }
}

const emit = defineEmits<{
  deposited: [amount: string]
}>()

onMounted(async () => {
  if (address.value) {
    vaultBTCBalance.value = await getVaultBTCBalance(address.value)
  }
})

watch(address, async (newAddress) => {
  if (newAddress) {
    vaultBTCBalance.value = await getVaultBTCBalance(newAddress)
  }
})
</script>

