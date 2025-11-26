<template>
  <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 via-slate-900 to-slate-900 border border-slate-700/50 p-6 transition-all duration-300 hover:border-slate-600/50">
    <!-- Background glow -->
    <div class="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
    
    <div class="relative">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-700/50 ring-1 ring-slate-600/50">
          <Icon name="mdi:history" class="text-xl text-slate-400" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Transaction History</h3>
          <p class="text-xs text-slate-500">Recent vault activity</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="transactions.length === 0" class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
          <Icon name="mdi:swap-horizontal" class="text-3xl text-slate-600" />
        </div>
        <p class="text-slate-500">No transactions yet</p>
        <p class="text-xs text-slate-600 mt-1">Your deposit and withdrawal history will appear here</p>
    </div>

      <!-- Transaction List -->
      <div v-else class="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        <div
            v-for="tx in transactions"
            :key="tx.hash"
          class="group/item flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200"
          >
          <!-- Type Icon -->
          <div :class="[
            'flex items-center justify-center w-10 h-10 rounded-xl ring-1',
                  tx.type === 'deposit'
              ? 'bg-emerald-500/20 ring-emerald-500/30' 
              : 'bg-amber-500/20 ring-amber-500/30'
          ]">
                <Icon
              :name="tx.type === 'deposit' ? 'mdi:arrow-down-bold' : 'mdi:arrow-up-bold'"
              :class="tx.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'"
                />
          </div>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span :class="[
                'text-sm font-medium',
                tx.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'
              ]">
                {{ tx.type === 'deposit' ? 'Deposit' : 'Withdraw' }}
              </span>
              <span class="text-sm text-white font-medium">{{ parseFloat(tx.amount).toFixed(4) }}</span>
              <span class="text-xs text-slate-500">vaultBTC</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              {{ new Date(tx.timestamp).toLocaleString() }}
            </p>
            
            <!-- Claimable info for deposits -->
            <div v-if="tx.type === 'deposit'" class="mt-1.5">
              <div v-if="isDepositClaimable(tx.timestamp)" class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span class="text-xs text-green-400 font-medium">Yield eligible</span>
              </div>
              <div v-else class="flex items-center gap-1.5">
                <Icon name="mdi:timer-sand" class="text-xs text-amber-400" />
                <span class="text-xs text-amber-400">Claimable in {{ getTimeUntilClaimable(tx.timestamp) }}</span>
              </div>
            </div>
          </div>

          <!-- Link -->
              <a
                :href="`https://sepolia.etherscan.io/tx/${tx.hash}`"
                target="_blank"
                rel="noopener noreferrer"
            class="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
              >
            {{ tx.hash.slice(0, 6) }}...{{ tx.hash.slice(-4) }}
                <Icon name="mdi:open-in-new" class="text-xs" />
              </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '~~/shared/types/vault'

interface Props {
  transactions: Transaction[]
}

defineProps<Props>()

const MIN_DEPOSIT_TIME = 86400 // 24 hours in seconds

// Check if a deposit's yield is claimable (24h passed since deposit)
const isDepositClaimable = (timestamp: number): boolean => {
  const depositTime = Math.floor(timestamp / 1000) // Convert ms to seconds
  const now = Math.floor(Date.now() / 1000)
  return (now - depositTime) >= MIN_DEPOSIT_TIME
}

// Get time remaining until deposit's yield is claimable
const getTimeUntilClaimable = (timestamp: number): string => {
  const depositTime = Math.floor(timestamp / 1000)
  const now = Math.floor(Date.now() / 1000)
  const elapsed = now - depositTime
  const remaining = MIN_DEPOSIT_TIME - elapsed
  
  if (remaining <= 0) return ''
  
  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.3);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.5);
}
</style>
