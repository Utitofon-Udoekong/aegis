import { ref, onUnmounted } from 'vue'
import { AIVaultABI } from '~~/config/abi/ai-vault'
import { wagmiAdapter } from '~~/config/appkit'
import { readContract, watchContractEvent } from '@wagmi/core'
import { type Address, formatUnits } from 'viem'

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

  const fetchAnalytics = async () => {
    if (!vaultAddress) {
      error.value = 'Vault contract address not configured'
      return
    }

    loading.value = true
    error.value = null

    try {
      // 1. Get TVL (Total Value Locked) - from totalDeposits contract state
      const totalDeposits = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultAddress as Address,
        abi: AIVaultABI,
        functionName: 'totalDeposits',
      })
      analytics.value.tvl = formatUnits(totalDeposits as bigint, 18)

      // 2. Get APY - from APY_BPS constant (500 = 5%)
      const apyBps = await readContract(wagmiAdapter.wagmiConfig, {
        address: vaultAddress as Address,
        abi: AIVaultABI,
        functionName: 'APY_BPS',
      })
      analytics.value.apy = Number(apyBps) / 100 // Convert basis points to percentage

      // Note: For unique users and total rewards from events, we need a different approach
      // since we can't easily read all historical events on the client side.
      // You might want to:
      // - Create a server endpoint for historical data
      // - Use TheGraph for event indexing
      // - Or implement a different strategy for real-time updates only
      
      // For now, we'll set up real-time event listeners
      setupEventListeners()
      
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      error.value = err.message || 'Failed to fetch vault analytics'
    } finally {
      loading.value = false
    }
  }

  const setupEventListeners = () => {
    if (!vaultAddress) return

    // Watch for Deposit events to update user count (in real-time)
    const unwatchDeposit = watchContractEvent(wagmiAdapter.wagmiConfig, {
      address: vaultAddress as Address,
      abi: AIVaultABI,
      eventName: 'Deposit',
      onLogs: (logs) => {
        console.log('New Deposit logs!', logs)
        // In a real implementation, you'd update user count based on new deposits
        // This would require tracking users locally or fetching from an indexer
      }
    })

    // Watch for Withdraw events to update rewards (in real-time)
    const unwatchWithdraw = watchContractEvent(wagmiAdapter.wagmiConfig, {
      address: vaultAddress as Address,
      abi: AIVaultABI,
      eventName: 'Withdraw',
      onLogs: (logs) => {
        console.log('New Withdraw logs!', logs)
        // Update rewards in real-time based on new withdraw events
        // This would require calculating yield from the events
      }
    })

    unwatchFunctions.push(unwatchDeposit, unwatchWithdraw)
  }

  const cleanup = () => {
    // Clean up all event listeners
    unwatchFunctions.forEach(unwatch => unwatch())
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