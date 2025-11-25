<template>
  <UiCard title="Transaction History">
    <div v-if="transactions.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <Icon name="mdi:history" class="text-4xl mb-2 opacity-50" />
      <p>No transactions yet</p>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-600">
            <th class="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Type</th>
            <th class="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Amount</th>
            <th class="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Date</th>
            <th class="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Hash</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="tx in transactions"
            :key="tx.hash"
            class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <td class="py-3 px-4">
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium',
                  tx.type === 'deposit'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
                ]"
              >
                <Icon
                  :name="tx.type === 'deposit' ? 'mdi:arrow-down' : 'mdi:arrow-up'"
                />
                {{ tx.type === 'deposit' ? 'Deposit' : 'Withdraw' }}
              </span>
            </td>
            <td class="py-3 px-4 text-gray-900 dark:text-gray-100">{{ parseFloat(tx.amount).toFixed(4) }} vaultBTC</td>
            <td class="py-3 px-4 text-gray-600 dark:text-gray-400">
              {{ new Date(tx.timestamp).toLocaleString() }}
            </td>
            <td class="py-3 px-4">
              <a
                :href="`https://sepolia.etherscan.io/tx/${tx.hash}`"
                target="_blank"
                rel="noopener noreferrer"
                class="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
              >
                {{ tx.hash.slice(0, 10) }}...
                <Icon name="mdi:open-in-new" class="text-xs" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import type { Transaction } from '~~/shared/types/vault'

interface Props {
  transactions: Transaction[]
}

defineProps<Props>()
</script>

