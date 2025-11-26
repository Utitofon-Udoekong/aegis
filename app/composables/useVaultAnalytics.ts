import { ref, onUnmounted } from 'vue'
import { AIVaultABI } from '~~/config/abi/ai-vault'
import { wagmiAdapter } from '~~/config/appkit'
import { readContract, watchContractEvent } from '@wagmi/core'
import { type Address, formatUnits, decodeEventLog } from 'viem'

interface AnalyticsData {
  tvl: string
  users: number
  apy: number
  totalRewards: string
}

export function useVaultAnalytics() {
  const config = useRuntimeConfig()
  const vaultAddress = config.public.vaultAddress as string
  
  const analytics = ref<AnalyticsData>({
    tvl: '0',
    users: 0,
    apy: 5.0,
    totalRewards: '0'
  })
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Store unwatch functions for cleanup
  const unwatchFunctions: (() => void)[] = []
  
  // Track unique users locally (for real-time updates)
  const userSet = ref<Set<string>>(new Set())
  
  // Base user count from server (historical data)
  const baseUserCount = ref(0)
  
  // Track total rewards (for real-time updates)
  const totalRewardsAccumulated = ref<bigint>(BigInt(0))

  const fetchAnalytics = async () => {
    const address = vaultAddress?.trim()
    
    if (!address) {
      console.warn('VAULT_CONTRACT_ADDRESS is not configured')
      error.value = 'Vault contract address not configured'
      loading.value = false
      return
    }

    loading.value = true
    error.value = null

    try {
      // Fetch from server API which has access to full event history
      const serverData = await $fetch('/api/vault/analytics').catch(() => null)
      
      if (serverData) {
        // Use server data for users and rewards (from historical events)
        baseUserCount.value = serverData.users || 0
        analytics.value.users = baseUserCount.value
        analytics.value.totalRewards = serverData.totalRewards || '0'
        // Initialize accumulated rewards from server data
        const rewardsFloat = parseFloat(serverData.totalRewards || '0')
        totalRewardsAccumulated.value = BigInt(Math.floor(rewardsFloat * 1e18))
        // Reset user set since we're starting fresh with server data
        userSet.value.clear()
      }

      // Fetch contract state directly for TVL and APY
      try {
      const totalDeposits = await readContract(wagmiAdapter.wagmiConfig, {
          address: address as Address,
        abi: AIVaultABI,
        functionName: 'totalDeposits',
      })
      analytics.value.tvl = formatUnits(totalDeposits as bigint, 18)
      } catch (err) {
        console.error('Error fetching TVL:', err)
        // Keep existing value or default
      }

      try {
      const apyBps = await readContract(wagmiAdapter.wagmiConfig, {
          address: address as Address,
        abi: AIVaultABI,
        functionName: 'APY_BPS',
      })
      analytics.value.apy = Number(apyBps) / 100 // Convert basis points to percentage
      } catch (err) {
        console.error('Error fetching APY:', err)
        // Keep default 5.0%
      }
      
      // Set up real-time event listeners for live updates
      setupEventListeners()
      
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      error.value = err.message || 'Failed to fetch vault analytics'
    } finally {
      loading.value = false
    }
  }

  const setupEventListeners = () => {
    const address = vaultAddress?.trim()
    if (!address) return
    
    // Clean up existing listeners first
    cleanup()
    
    try {
      // Watch for Deposit events to update TVL and user count
    const unwatchDeposit = watchContractEvent(wagmiAdapter.wagmiConfig, {
        address: address as Address,
      abi: AIVaultABI,
      eventName: 'Deposit',
        onLogs: async (logs) => {
        console.log('New Deposit logs!', logs)
          
          // Update TVL by fetching latest totalDeposits
          try {
            const totalDeposits = await readContract(wagmiAdapter.wagmiConfig, {
              address: address as Address,
              abi: AIVaultABI,
              functionName: 'totalDeposits',
            })
            analytics.value.tvl = formatUnits(totalDeposits as bigint, 18)
          } catch (err) {
            console.error('Error updating TVL from deposit event:', err)
          }
          
          // Track unique users from indexed topic (user address)
          logs.forEach(log => {
            try {
              // Extract user address from topics[1] (indexed parameter)
              // topics[1] is a 32-byte hex string, address is last 20 bytes
              if (log.topics && log.topics[1]) {
                const topicHex = log.topics[1]
                // Extract last 40 hex chars (20 bytes) for address
                const userAddress = ('0x' + topicHex.slice(-40)).toLowerCase()
                if (userAddress && userAddress.length === 42 && !userSet.value.has(userAddress)) {
                  userSet.value.add(userAddress)
                  // Add new users to base count from server
                  analytics.value.users = baseUserCount.value + userSet.value.size
                }
              }
            } catch (err) {
              console.error('Error extracting user from deposit event:', err)
            }
          })
      }
    })

      // Watch for Withdraw events to update rewards and TVL
    const unwatchWithdraw = watchContractEvent(wagmiAdapter.wagmiConfig, {
        address: address as Address,
      abi: AIVaultABI,
      eventName: 'Withdraw',
        onLogs: async (logs) => {
        console.log('New Withdraw logs!', logs)
          
          // Update TVL by fetching latest totalDeposits
          try {
            const totalDeposits = await readContract(wagmiAdapter.wagmiConfig, {
              address: address as Address,
              abi: AIVaultABI,
              functionName: 'totalDeposits',
            })
            analytics.value.tvl = formatUnits(totalDeposits as bigint, 18)
          } catch (err) {
            console.error('Error updating TVL from withdraw event:', err)
          }
          
          // Update total rewards from yield in withdraw events
          logs.forEach(log => {
            try {
              const decoded = decodeEventLog({
                abi: AIVaultABI,
                data: log.data,
                topics: log.topics,
                eventName: 'Withdraw',
              })
              if (decoded.args && 'yield' in decoded.args) {
                const yieldAmount = decoded.args.yield as bigint
                if (yieldAmount && yieldAmount > 0n) {
                  totalRewardsAccumulated.value += yieldAmount
                  analytics.value.totalRewards = formatUnits(totalRewardsAccumulated.value, 18)
                }
              }
            } catch (err) {
              console.error('Error decoding withdraw event:', err)
            }
          })
      }
    })

    unwatchFunctions.push(unwatchDeposit, unwatchWithdraw)
    } catch (err) {
      console.error('Error setting up event listeners:', err)
    }
  }

  const cleanup = () => {
    // Clean up all event listeners
    unwatchFunctions.forEach(unwatch => {
      try {
        unwatch()
      } catch (err) {
        console.error('Error cleaning up event listener:', err)
      }
    })
    unwatchFunctions.length = 0
  }

  // Auto-cleanup when component unmounts
  onUnmounted(cleanup)

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    cleanup
  }
}