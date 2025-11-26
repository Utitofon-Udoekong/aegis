import type { Transaction } from '~~/shared/types/vault'
import { AIVaultABI } from '~~/config/abi/ai-vault'
import { formatUnits, type Address, createPublicClient, http, parseAbiItem, decodeEventLog } from 'viem'
import { sepolia } from 'viem/chains'

export const useTransactions = () => {
  const config = useRuntimeConfig()
  
  // Use localStorage to cache transactions
  const CACHE_KEY = 'vault_transactions'
  const CACHE_DURATION = 60 * 1000 // 1 minute
  
  const getCachedTransactions = (userAddress: string): { transactions: Transaction[], isExpired: boolean } | null => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${userAddress.toLowerCase()}`)
      if (cached) {
        const { transactions, timestamp } = JSON.parse(cached)
        const isExpired = Date.now() - timestamp > CACHE_DURATION
        return { transactions, isExpired }
      }
    } catch (e) {
      // Ignore cache errors
    }
    return null
  }
  
  const cacheTransactions = (userAddress: string, transactions: Transaction[]) => {
    try {
      localStorage.setItem(`${CACHE_KEY}_${userAddress.toLowerCase()}`, JSON.stringify({
        transactions,
        timestamp: Date.now()
      }))
    } catch (e) {
      // Ignore cache errors
    }
  }
  
  const fetchTransactions = async (userAddress: string): Promise<Transaction[]> => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      return []
    }

    // Check cache first - return immediately if valid
    const cached = getCachedTransactions(userAddress)
    if (cached && !cached.isExpired) {
      return cached.transactions
    }

    // Use public RPCs - try fastest first
    const publicRpcs = [
      'https://ethereum-sepolia-rpc.publicnode.com',
      'https://rpc.sepolia.org',
      'https://sepolia.drpc.org',
    ]
    

    for (const rpcUrl of publicRpcs) {
      try {
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http(rpcUrl, { timeout: 10000 }) // 10 second timeout
        })

        // Get current block number
        const currentBlock = await publicClient.getBlockNumber()
        
        // Query last 5000 blocks (~1 day on Sepolia) - smaller range = faster
        const fromBlock = currentBlock > 5000n ? currentBlock - 5000n : 0n

        // Fetch events in parallel with short timeout
        const [depositLogs, withdrawLogs] = await Promise.all([
          publicClient.getLogs({
            address: vaultContractAddress as Address,
            event: parseAbiItem('event Deposit(address indexed user, uint256 amount, uint256 timestamp)'),
            fromBlock,
            toBlock: currentBlock,
          }).catch(() => []),
          
          publicClient.getLogs({
            address: vaultContractAddress as Address,
            event: parseAbiItem('event Withdraw(address indexed user, uint256 amount, uint256 yield, uint256 timestamp)'),
            fromBlock,
            toBlock: currentBlock,
          }).catch(() => []),
        ])

        // Filter by user address manually
        const userAddressLower = userAddress.toLowerCase()
        
        const userDepositLogs = depositLogs.filter(log => {
          if (log.topics && log.topics[1]) {
            const logUser = ('0x' + log.topics[1].slice(-40)).toLowerCase()
            return logUser === userAddressLower
          }
          return false
        })
        
        const userWithdrawLogs = withdrawLogs.filter(log => {
          if (log.topics && log.topics[1]) {
            const logUser = ('0x' + log.topics[1].slice(-40)).toLowerCase()
            return logUser === userAddressLower
          }
          return false
        })

        // Decode deposit events
        const depositTransactions: Transaction[] = userDepositLogs.map((log) => {
          try {
            const decoded = decodeEventLog({
              abi: AIVaultABI,
              data: log.data,
              topics: log.topics,
              eventName: 'Deposit',
            })
            return {
              hash: log.transactionHash,
          type: 'deposit' as const,
              amount: formatUnits((decoded.args as any).amount as bigint, 18),
              timestamp: Number((decoded.args as any).timestamp as bigint) * 1000,
              blockNumber: Number(log.blockNumber),
            }
          } catch {
            return null
          }
        }).filter(Boolean) as Transaction[]

        // Decode withdraw events
        const withdrawTransactions: Transaction[] = userWithdrawLogs.map((log) => {
          try {
            const decoded = decodeEventLog({
              abi: AIVaultABI,
              data: log.data,
              topics: log.topics,
              eventName: 'Withdraw',
            })
            return {
              hash: log.transactionHash,
          type: 'withdraw' as const,
              amount: formatUnits((decoded.args as any).amount as bigint, 18),
              timestamp: Number((decoded.args as any).timestamp as bigint) * 1000,
              blockNumber: Number(log.blockNumber),
            }
          } catch {
            return null
          }
        }).filter(Boolean) as Transaction[]
      
        // Combine and sort by block number (newest first)
        const transactions = [...depositTransactions, ...withdrawTransactions]
          .sort((a, b) => b.blockNumber - a.blockNumber)
        
        
        // Cache the results
        cacheTransactions(userAddress, transactions)
        
        return transactions
      } catch (error: any) {
        continue
      }
    }
    
    // If all RPCs failed but we have stale cache, use it
    if (cached) {
      return cached.transactions
    }
    
    console.error('All RPCs failed, no cache available')
      return []
  }
  
  // Add a transaction to cache immediately after deposit/withdraw
  const addTransactionToCache = (userAddress: string, tx: Transaction) => {
    try {
      const cached = getCachedTransactions(userAddress)
      const transactions = cached?.transactions || []
      transactions.unshift(tx)
      cacheTransactions(userAddress, transactions)
    } catch (e) {
      // Ignore
    }
  }
  
  // Clear cache
  const clearTransactionCache = (userAddress: string) => {
    try {
      localStorage.removeItem(`${CACHE_KEY}_${userAddress.toLowerCase()}`)
    } catch (e) {
      // Ignore
    }
  }
  
  return {
    fetchTransactions,
    addTransactionToCache,
    clearTransactionCache,
  }
}
