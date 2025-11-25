# Analytics Data Requirements

## Data Source: Contract-Specific

**All analytics data MUST come from our deployed AIVault contract.** This is NOT generic chain data - it's specific to our vault contract.

### Data Requirements

| Metric | Source | Contract-Specific? | Chain-Specific? |
|--------|--------|-------------------|-----------------|
| **TVL** | `AIVault.totalDeposits()` | ✅ YES | ✅ Sepolia only |
| **APY** | `AIVault.APY_BPS()` | ✅ YES | ✅ Sepolia only |
| **Users** | `AIVault.Deposit` events | ✅ YES | ✅ Sepolia only |
| **Total Rewards** | `AIVault.Withdraw` events | ✅ YES | ✅ Sepolia only |

### Why Contract-Specific?

1. **TVL**: Only our contract tracks `totalDeposits` - this is unique to our vault
2. **APY**: Our contract has a specific `APY_BPS` constant (500 = 5%)
3. **Users**: We count unique addresses from our contract's `Deposit` events
4. **Total Rewards**: We sum yields from our contract's `Withdraw` events

### Why Chain-Specific?

- We deploy to **Sepolia testnet** (chainId: 11155111)
- The contract address is specific to Sepolia
- Event logs are chain-specific
- Cannot use data from other chains or mainnet

### Can We Use Data from Elsewhere?

**NO** - All data must come from:
- Our deployed AIVault contract on Sepolia
- The specific contract address configured in `VAULT_CONTRACT_ADDRESS`

### Alternative Data Sources (NOT Applicable)

- ❌ Generic Sepolia chain stats
- ❌ Other DeFi protocols
- ❌ Mainnet data
- ❌ Other testnets

## Implementation

The analytics endpoint:
1. Reads contract state from our AIVault contract
2. Queries event logs from our AIVault contract
3. All queries target the specific contract address from config
4. All queries are on Sepolia network

## Alchemy RPC Requirements

Alchemy needs to support:
- `eth_call` - to read contract state (TVL, APY)
- `eth_getLogs` - to fetch event logs (Users, Rewards)

Both are standard Ethereum RPC methods that Alchemy fully supports.
