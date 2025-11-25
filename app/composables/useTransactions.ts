
import type { Transaction } from '~~/shared/types/vault'
import {AIVaultABI} from '~~/config/abi/ai-vault'
import { readContract } from '@wagmi/core'
import { wagmiAdapter } from '~~/config/appkit'
import { formatUnits, type Address } from 'viem'

export const useTransactions = () => {
  const config = useRuntimeConfig()
  
  const fetchTransactions = async (userAddress: string): Promise<Transaction[]> => {
    try {
      const depositEvents: any = await readContract(wagmiAdapter.wagmiConfig, {
        address: config.public.vaultAddress as Address,
        abi: AIVaultABI,
        functionName: 'Deposit',
        args: [userAddress],
      })
      const withdrawEvents: any = await readContract(wagmiAdapter.wagmiConfig, {
        address: config.public.vaultAddress as Address,
        abi: AIVaultABI,
        functionName: 'Withdraw',
        args: [userAddress],
      })
      
      const transactions: Transaction[] = [
        ...depositEvents.map((event: any) => ({
          hash: event.transactionHash,
          type: 'deposit' as const,
          amount: formatUnits(event.args.amount, 18),
          timestamp: Number(event.args.timestamp) * 1000,
          blockNumber: event.blockNumber,
        })),
        ...withdrawEvents.map((event: any) => ({
          hash: event.transactionHash,
          type: 'withdraw' as const,
          amount: formatUnits(event.args.amount, 18),
          timestamp: Number(event.args.timestamp) * 1000,
          blockNumber: event.blockNumber,
        })),
      ]
      
      // Sort by block number (newest first)
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

