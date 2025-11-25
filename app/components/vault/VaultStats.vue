<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <UiCard>
      <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <p class="text-emerald-700 dark:text-emerald-300 text-sm font-medium">Your Balance</p>
          <Icon name="mdi:wallet" class="text-2xl text-emerald-400 opacity-70" />
        </div>
        <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{{ formattedBalance }} vaultBTC</p>
      </div>
    </UiCard>

    <UiCard>
      <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <p class="text-green-700 dark:text-green-300 text-sm font-medium">Total APY</p>
          <Icon name="mdi:trending-up" class="text-2xl text-green-400 opacity-70" />
        </div>
        <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ apy }}%</p>
      </div>
    </UiCard>

    <UiCard>
      <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <p class="text-emerald-700 dark:text-emerald-300 text-sm font-medium">Unclaimed Rewards</p>
          <Icon name="mdi:gift" class="text-2xl text-emerald-400 opacity-70" />
        </div>
        <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{{ formattedRewards }} vaultBTC</p>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
interface Props {
  balance: string
  apy: number
  rewards: string
}

const props = defineProps<Props>()

const formattedBalance = computed(() => {
  return parseFloat(props.balance || '0').toFixed(4)
})

const formattedRewards = computed(() => {
  return parseFloat(props.rewards || '0').toFixed(4)
})
</script>
