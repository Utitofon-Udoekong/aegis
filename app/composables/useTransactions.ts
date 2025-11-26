import type { Transaction } from '~~/shared/types/vault'
import { AIVaultABI } from '~~/config/abi/ai-vault'
import { useBlockNumber } from '@wagmi/vue'
import { formatUnits, type Address, createPublicClient, http, parseAbiItem, decodeEventLog } from 'viem'

export const useTransactions = () => {
  const config = useRuntimeConfig()
  
  const fetchTransactions = async (userAddress: string): Promise<Transaction[]> => {
    const vaultContractAddress = config.public.vaultContractAddress as string
    
    if (!vaultContractAddress || vaultContractAddress.trim() === '') {
      console.warn('VAULT_CONTRACT_ADDRESS is not configured')
      return []
    }

    const rpcUrl = config.public.ethereumRpcUrl as string
    if (!rpcUrl?.trim()) {
      console.warn('ETHEREUM_RPC_URL is not configured')
      return []
    }

    try {
      const publicClient = createPublicClient({
        transport: http(rpcUrl)
      })

      // Get current block number
      const currentBlock = await publicClient.getBlockNumber()

      // Fetch event logs for Deposit and Withdraw events
      const [depositLogs, withdrawLogs] = await Promise.all([
        publicClient.getLogs({
          address: vaultContractAddress as Address,
          event: parseAbiItem('event Deposit(address indexed user, uint256 amount, uint256 timestamp)'),
          args: {
            user: userAddress as Address,
          },
          fromBlock: 0n,
          toBlock: currentBlock,
        }).catch(() => []),

        publicClient.getLogs({
          address: vaultContractAddress as Address,
          event: parseAbiItem('event Withdraw(address indexed user, uint256 amount, uint256 yield, uint256 timestamp)'),
          args: {
            user: userAddress as Address,
          },
          fromBlock: 0n,
          toBlock: currentBlock,
        }).catch(() => []),
      ])

      // Decode and map deposit events
      const depositTransactions: Transaction[] = depositLogs.map((log) => {
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
      })

      // Decode and map withdraw events
      const withdrawTransactions: Transaction[] = withdrawLogs.map((log) => {
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
      })

      // Combine and sort by block number (newest first)
      const transactions: Transaction[] = [...depositTransactions, ...withdrawTransactions]
      return transactions.sort((a, b) => b.blockNumber - a.blockNumber)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }
  
  return {
    fetchTransactions,
  }
}

