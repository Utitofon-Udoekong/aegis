# Reserve Monitoring Implementation

## Smart Contract Features

### Reserve Health Metrics

Add these view functions to your AIVault contract:

```solidity
// Get current reserve balance
function getReserveBalance() public view returns (uint256) {
    return vaultBTC.balanceOf(address(this)) - totalDeposits;
}

// Calculate reserve ratio (reserve / total deposits)
function getReserveRatio() public view returns (uint256) {
    if (totalDeposits == 0) return 0;
    return (getReserveBalance() * 10000) / totalDeposits; // basis points
}

// Check if reserves are healthy (above threshold)
function isReserveHealthy() public view returns (bool) {
    return getReserveRatio() >= minReserveRatio; // e.g., 500 = 5%
}

// Estimate days until reserve depletion at current yield rate
function getReserveDaysRemaining() public view returns (uint256) {
    uint256 reserve = getReserveBalance();
    if (reserve == 0) return 0;
    
    uint256 dailyYieldCost = (totalDeposits * yieldRate) / (365 * 10000);
    if (dailyYieldCost == 0) return type(uint256).max;
    
    return reserve / dailyYieldCost;
}
```

### Reserve Thresholds

```solidity
uint256 public minReserveRatio = 500; // 5% minimum
uint256 public warningReserveRatio = 1000; // 10% warning threshold

enum ReserveStatus { CRITICAL, LOW, HEALTHY, EXCELLENT }

function getReserveStatus() public view returns (ReserveStatus) {
    uint256 ratio = getReserveRatio();
    
    if (ratio < minReserveRatio) return ReserveStatus.CRITICAL;
    if (ratio < warningReserveRatio) return ReserveStatus.LOW;
    if (ratio < 2000) return ReserveStatus.HEALTHY;
    return ReserveStatus.EXCELLENT;
}
```

### Events for Monitoring

```solidity
event ReserveFunded(address indexed funder, uint256 amount, uint256 newBalance);
event ReserveLow(uint256 currentRatio, uint256 daysRemaining);
event ReserveCritical(uint256 currentBalance);
event YieldPaused(string reason);
```

### Auto-pause on Low Reserves

```solidity
modifier checkReserveHealth() {
    if (!isReserveHealthy() && !paused()) {
        _pause();
        emit YieldPaused("Reserve ratio below minimum threshold");
    }
    _;
}

// Apply to withdraw function
function withdraw(uint256 amount) external nonReentrant checkReserveHealth {
    // ... existing withdraw logic
}
```

## Frontend UI Components

### Reserve Health Dashboard

Display in your main vault view:

```vue
<div class="reserve-health">
  <h3>Reserve Health</h3>
  
  <div class="metric">
    <span>Reserve Balance:</span>
    <span>{{ formatBTC(reserveBalance) }} vBTC</span>
  </div>
  
  <div class="metric">
    <span>Reserve Ratio:</span>
    <span :class="reserveStatusClass">{{ reserveRatio }}%</span>
  </div>
  
  <div class="metric">
    <span>Days Remaining:</span>
    <span>{{ daysRemaining }}</span>
  </div>
  
  <div class="status-indicator" :class="reserveStatusClass">
    {{ reserveStatus }}
  </div>
</div>
```

### Reserve Status Colors

```css
.status-critical { color: #ef4444; }
.status-low { color: #f59e0b; }
.status-healthy { color: #10b981; }
.status-excellent { color: #3b82f6; }
```

## AI Strategy Integration

### Update AI Prompts

Add reserve context to your AI strategy recommendations:

```typescript
const reserveContext = `
Current Reserve Status:
- Balance: ${reserveBalance} vBTC
- Ratio: ${reserveRatio}%
- Status: ${reserveStatus}
- Days Remaining: ${daysRemaining}

${reserveStatus === 'CRITICAL' ? 
  'WARNING: Reserves are critically low. Yield distribution may be paused.' : ''}
`;
```

### AI Response Adjustments

The AI should:
- Warn users when reserves are low
- Suggest waiting for reserve refill if critical
- Recommend smaller deposits during low reserve periods
- Highlight reserve health as a risk factor

## Owner Dashboard

### Reserve Management Panel

```vue
<div class="owner-panel" v-if="isOwner">
  <h3>Reserve Management</h3>
  
  <button @click="fundReserve" :disabled="reserveStatus === 'EXCELLENT'">
    Fund Reserve
  </button>
  
  <div class="alerts">
    <div v-if="reserveStatus === 'CRITICAL'" class="alert-critical">
      ⚠️ CRITICAL: Reserve below {{ minReserveRatio }}%
    </div>
    <div v-if="reserveStatus === 'LOW'" class="alert-warning">
      ⚠️ WARNING: Reserve below {{ warningReserveRatio }}%
    </div>
  </div>
  
  <div class="reserve-stats">
    <p>Total Fees Collected: {{ totalFeesCollected }} vBTC</p>
    <p>Total Reserve Spent: {{ totalReserveSpent }} vBTC</p>
    <p>Net Reserve Flow: {{ netReserveFlow }} vBTC</p>
  </div>
</div>
```

## Monitoring & Alerts

### Off-chain Monitoring Script

Create a simple monitoring script:

```typescript
// scripts/monitor-reserves.ts
import { ethers } from 'hardhat';

async function monitorReserves() {
  const vault = await ethers.getContractAt('AIVault', VAULT_ADDRESS);
  
  const reserveBalance = await vault.getReserveBalance();
  const reserveRatio = await vault.getReserveRatio();
  const daysRemaining = await vault.getReserveDaysRemaining();
  const status = await vault.getReserveStatus();
  
  console.log('Reserve Status:', {
    balance: ethers.formatUnits(reserveBalance, 18),
    ratio: reserveRatio.toString() / 100 + '%',
    daysRemaining: daysRemaining.toString(),
    status: ['CRITICAL', 'LOW', 'HEALTHY', 'EXCELLENT'][status]
  });
  
  // Send alerts if needed
  if (status === 0) { // CRITICAL
    await sendAlert('CRITICAL: Reserve needs immediate funding');
  } else if (status === 1) { // LOW
    await sendAlert('WARNING: Reserve running low');
  }
}

// Run every hour
setInterval(monitorReserves, 3600000);
```

## Implementation Priority

1. **Phase 1**: Add view functions to contract
2. **Phase 2**: Display reserve health in UI
3. **Phase 3**: Integrate with AI recommendations
4. **Phase 4**: Add owner dashboard
5. **Phase 5**: Set up monitoring alerts
