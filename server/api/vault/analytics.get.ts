import { AIVaultABI } from '~~/config/abi/ai-vault'
import { wagmiAdapter } from '~~/config/appkit'
import { readContract } from '@wagmi/core'
import { Address, formatUnits } from 'viem'
import { createPublicClient, http, parseAbiItem } from 'viem'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const vaultAddress = config.public.vaultAddress as string

  if (!vaultAddress) {
    return {
      tvl: '0',
      users: 0,
      apy: 5.0,
      totalRewards: '0',
    }
  }

  const rpcUrl = config.ethereumRpcUrl as string
  if (!rpcUrl?.trim()) {
    return {
      tvl: '0',
      users: 0,
      apy: 5.0,
      totalRewards: '0',
    }
  }

  try {
    const publicClient = createPublicClient({
      transport: http(rpcUrl)
    })

    // Get current block number to use as toBlock
    const currentBlock = await publicClient.getBlockNumber()

    const [totalDeposits, apyBps, depositLogs, withdrawLogs] = await Promise.all([
      readContract(wagmiAdapter.wagmiConfig, {
        address: vaultAddress as Address,
        abi: AIVaultABI,
        functionName: 'totalDeposits',
      }).catch(() => BigInt(0)),

      readContract(wagmiAdapter.wagmiConfig, {
        address: vaultAddress as Address,
        abi: AIVaultABI,
        functionName: 'APY_BPS',
      }).catch(() => 500), // Fallback to 5% APY

      publicClient.getLogs({
        address: vaultAddress as Address,
        event: parseAbiItem('event Deposit(address indexed user, uint256 amount, uint256 timestamp)'),
        fromBlock: 0n,
        toBlock: currentBlock
      }).catch(() => []),

      publicClient.getLogs({
        address: vaultAddress as Address,
        event: parseAbiItem('event Withdraw(address indexed user, uint256 amount, uint256 yield, uint256 timestamp)'),
        fromBlock: 0n,
        toBlock: currentBlock
      }).catch(() => [])
    ])

    // Count unique users
    const userAddresses = depositLogs.map(log => {
      return log.topics && log.topics[1]
        ? '0x' + log.topics[1].slice(26).toLowerCase()
        : null
    }).filter(Boolean) as string[]

    const uniqueUsers = new Set(userAddresses).size

    // Calculate total rewards
    let totalRewards = BigInt(0)
    for (const log of withdrawLogs) {
      if (log.data && log.data !== '0x') {
        try {
          const data = log.data.slice(2)
          if (data.length >= 128) {
            const yieldHex = data.slice(64, 128)
            totalRewards += BigInt('0x' + yieldHex)
          }
        } catch {
          // Continue if parsing fails for a single log
        }
      }
    }

    return {
      tvl: formatUnits(totalDeposits as bigint, 18),
      users: uniqueUsers,
      apy: Number(apyBps) / 100,
      totalRewards: formatUnits(totalRewards, 18),
    }
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return {
      tvl: '0',
      users: 0,
      apy: 5.0,
      totalRewards: '0',
    }
  }
})