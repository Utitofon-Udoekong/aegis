# Reserve Health UI Implementation Guide

## Composable for Reserve Data

Create `composables/useReserveHealth.ts`:

```typescript
export const useReserveHealth = () => {
  const { vaultContract } = useVaultContract();
  
  const reserveBalance = ref<bigint>(0n);
  const reserveRatio = ref<number>(0);
  const daysRemaining = ref<number>(0);
  const reserveStatus = ref<'CRITICAL' | 'LOW' | 'HEALTHY' | 'EXCELLENT'>('HEALTHY');
  
  const fetchReserveHealth = async () => {
    if (!vaultContract.value) return;
    
    try {
      const [balance, ratio, days, status] = await Promise.all([
        vaultContract.value.getReserveBalance(),
        vaultContract.value.getReserveRatio(),
        vaultContract.value.getReserveDaysRemaining(),
        vaultContract.value.getReserveStatus()
      ]);
      
      reserveBalance.value = balance;
      reserveRatio.value = Number(ratio) / 100; // Convert basis points to percentage
      daysRemaining.value = Number(days);
      reserveStatus.value = ['CRITICAL', 'LOW', 'HEALTHY', 'EXCELLENT'][status];
    } catch (error) {
      console.error('Failed to fetch reserve health:', error);
    }
  };
  
  const statusColor = computed(() => {
    switch (reserveStatus.value) {
      case 'CRITICAL': return 'text-red-500';
      case 'LOW': return 'text-yellow-500';
      case 'HEALTHY': return 'text-green-500';
      case 'EXCELLENT': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  });
  
  const statusIcon = computed(() => {
    switch (reserveStatus.value) {
      case 'CRITICAL': return '🔴';
      case 'LOW': return '🟡';
      case 'HEALTHY': return '🟢';
      case 'EXCELLENT': return '🔵';
      default: return '⚪';
    }
  });
  
  return {
    reserveBalance,
    reserveRatio,
    daysRemaining,
    reserveStatus,
    statusColor,
    statusIcon,
    fetchReserveHealth
  };
};
```

## Reserve Health Component

Create `components/ReserveHealth.vue`:

```vue
<template>
  <div class="reserve-health-card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Reserve Health</h3>
      <span :class="statusColor" class="text-2xl">{{ statusIcon }}</span>
    </div>
    
    <div class="space-y-3">
      <div class="metric-row">
        <span class="text-gray-600">Balance</span>
        <span class="font-mono">{{ formatBalance(reserveBalance) }} vBTC</span>
      </div>
      
      <div class="metric-row">
        <span class="text-gray-600">Reserve Ratio</span>
        <span :class="statusColor" class="font-semibold">{{ reserveRatio.toFixed(2) }}%</span>
      </div>
      
      <div class="metric-row">
        <span class="text-gray-600">Est. Days Remaining</span>
        <span>{{ formatDays(daysRemaining) }}</span>
      </div>
      
      <div class="status-badge" :class="statusBadgeClass">
        {{ reserveStatus }}
      </div>
    </div>
    
    <div v-if="showWarning" class="warning-banner mt-4">
      <p v-if="reserveStatus === 'CRITICAL'">
        ⚠️ Reserves critically low. Yield distribution may be paused.
      </p>
      <p v-else-if="reserveStatus === 'LOW'">
        ⚠️ Reserves running low. Consider waiting for reserve refill.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatUnits } from 'viem';

const { 
  reserveBalance, 
  reserveRatio, 
  daysRemaining, 
  reserveStatus,
  statusColor,
  statusIcon,
  fetchReserveHealth 
} = useReserveHealth();

const showWarning = computed(() => 
  reserveStatus.value === 'CRITICAL' || reserveStatus.value === 'LOW'
);

const statusBadgeClass = computed(() => ({
  'bg-red-100 text-red-800': reserveStatus.value === 'CRITICAL',
  'bg-yellow-100 text-yellow-800': reserveStatus.value === 'LOW',
  'bg-green-100 text-green-800': reserveStatus.value === 'HEALTHY',
  'bg-blue-100 text-blue-800': reserveStatus.value === 'EXCELLENT',
}));

const formatBalance = (balance: bigint) => {
  return parseFloat(formatUnits(balance, 18)).toFixed(4);
};

const formatDays = (days: number) => {
  if (days === 0) return 'Empty';
  if (days > 365 * 10) return '∞';
  return `~${days} days`;
};

onMounted(() => {
  fetchReserveHealth();
  // Refresh every 30 seconds
  setInterval(fetchReserveHealth, 30000);
});
</script>

<style scoped>
.reserve-health-card {
  @apply bg-white rounded-lg shadow p-6;
}

.metric-row {
  @apply flex justify-between items-center;
}

.status-badge {
  @apply px-3 py-1 rounded-full text-sm font-medium text-center;
}

.warning-banner {
  @apply bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800;
}
</style>
```

## Owner Reserve Management Component

Create `components/OwnerReservePanel.vue`:

```vue
<template>
  <div v-if="isOwner" class="owner-panel">
    <h3 class="text-xl font-bold mb-4">Reserve Management</h3>
    
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="stat-card">
        <p class="text-sm text-gray-600">Total Fees Collected</p>
        <p class="text-2xl font-bold">{{ totalFees }} vBTC</p>
      </div>
      
      <div class="stat-card">
        <p class="text-sm text-gray-600">Reserve Burn Rate</p>
        <p class="text-2xl font-bold">{{ burnRate }} vBTC/day</p>
      </div>
    </div>
    
    <div class="fund-reserve-section">
      <input 
        v-model="fundAmount" 
        type="number" 
        placeholder="Amount to fund"
        class="input-field"
      />
      <button 
        @click="handleFundReserve" 
        :disabled="!fundAmount || isLoading"
        class="btn-primary"
      >
        {{ isLoading ? 'Funding...' : 'Fund Reserve' }}
      </button>
    </div>
    
    <div v-if="reserveStatus === 'CRITICAL'" class="alert alert-critical">
      🚨 CRITICAL: Immediate funding required
    </div>
    <div v-else-if="reserveStatus === 'LOW'" class="alert alert-warning">
      ⚠️ WARNING: Reserve below recommended threshold
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseUnits } from 'viem';

const { address } = useAccount();
const { vaultContract } = useVaultContract();
const { reserveStatus } = useReserveHealth();

const fundAmount = ref('');
const isLoading = ref(false);
const totalFees = ref('0');
const burnRate = ref('0');

const isOwner = computed(() => {
  // Check if connected address is contract owner
  // Implement owner check logic
  return true; // Placeholder
});

const handleFundReserve = async () => {
  if (!vaultContract.value || !fundAmount.value) return;
  
  isLoading.value = true;
  try {
    const amount = parseUnits(fundAmount.value, 18);
    const tx = await vaultContract.value.fundReserve(amount);
    await tx.wait();
    
    fundAmount.value = '';
    // Refresh data
  } catch (error) {
    console.error('Failed to fund reserve:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.owner-panel {
  @apply bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg p-6;
}

.stat-card {
  @apply bg-white rounded-lg p-4 shadow;
}

.fund-reserve-section {
  @apply flex gap-3 mb-4;
}

.input-field {
  @apply flex-1 px-4 py-2 border rounded-lg;
}

.btn-primary {
  @apply px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50;
}

.alert {
  @apply p-4 rounded-lg font-medium;
}

.alert-critical {
  @apply bg-red-100 text-red-800 border border-red-300;
}

.alert-warning {
  @apply bg-yellow-100 text-yellow-800 border border-yellow-300;
}
</style>
```

## Integration in Main Vault Page

Update `pages/vault.vue`:

```vue
<template>
  <div class="vault-page">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main vault operations -->
      <div class="lg:col-span-2">
        <VaultOperations />
      </div>
      
      <!-- Sidebar with reserve health -->
      <div class="space-y-6">
        <ReserveHealth />
        <OwnerReservePanel v-if="isOwner" />
      </div>
    </div>
  </div>
</template>
```

## AI Strategy Integration

Update AI prompt in `server/api/ai-strategy.ts`:

```typescript
const reserveHealth = await getReserveHealth(vaultAddress);

const systemPrompt = `
You are an AI DeFi strategy advisor for a Bitcoin vault.

Current Reserve Status:
- Balance: ${reserveHealth.balance} vBTC
- Ratio: ${reserveHealth.ratio}%
- Status: ${reserveHealth.status}
- Days Remaining: ${reserveHealth.daysRemaining}

${reserveHealth.status === 'CRITICAL' ? 
  'IMPORTANT: Reserves are critically low. Warn users about potential yield interruptions.' : ''}

${reserveHealth.status === 'LOW' ? 
  'NOTE: Reserves are running low. Mention this as a risk factor in your recommendations.' : ''}

Provide strategy recommendations considering the reserve health.
`;
```

## Quick Implementation Checklist

- [ ] Add reserve view functions to smart contract
- [ ] Create `useReserveHealth` composable
- [ ] Build `ReserveHealth.vue` component
- [ ] Build `OwnerReservePanel.vue` component
- [ ] Integrate components in vault page
- [ ] Update AI prompts with reserve context
- [ ] Test reserve monitoring flow
- [ ] Deploy updated contract
