import { JsonRpcProvider, Contract, formatEther } from 'ethers'

// AIVault ABI - only the functions and events we need
const AIVaultABI = [
  {
    name: 'totalDeposits',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'APY_BPS',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'Deposit',
    type: 'event',
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
  {
    name: 'Withdraw',
    type: 'event',
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'yield', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
] as const

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const vaultAddress = config.public.vaultAddress as string
  
  if (!vaultAddress) {
    throw createError({
      statusCode: 500,
      message: 'Vault contract address not configured',
    })
  }

  // Note: This is a server-side route, so we can't use Vue composables like useAppKitProvider.
  // We create our own provider using the same RPC URL from config.
  // Client-side code uses: useAppKitProvider("eip155") to get walletProvider
  // Server-side code uses: JsonRpcProvider with the configured RPC URL
  const rpcUrl = (config.ethereumRpcUrl as string) || 'https://sepolia.infura.io/v3/'
  
  if (!rpcUrl || rpcUrl.trim() === '') {
    throw createError({
      statusCode: 500,
      message: 'Ethereum RPC URL not configured',
    })
  }
  
  // Create a read-only provider for server-side blockchain queries
  // This uses the same RPC URL as configured for the client-side wallet connections
  const provider = new JsonRpcProvider(rpcUrl)
  const contract = new Contract(vaultAddress, AIVaultABI, provider)

  try {
    // 1. Get TVL (Total Value Locked) - from totalDeposits contract state
    const totalDeposits = await contract.totalDeposits()
    const tvl = formatEther(totalDeposits)

    // 2. Get APY - from APY_BPS constant (500 = 5%)
    const apyBps = await contract.APY_BPS()
    const apy = Number(apyBps) / 100 // Convert basis points to percentage

    // 3. Get unique users - count distinct addresses from Deposit events
    // Get all Deposit events from contract deployment
    const depositFilter = contract.filters.Deposit()
    const depositLogs = await contract.queryFilter(depositFilter)

    // Count unique users from Deposit events
    const uniqueUsers = new Set(
      depositLogs.map((log) => {
        if (!log.topics || !log.data) return null
        const decoded = contract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        })
        return decoded?.args?.user?.toLowerCase()
      }).filter(Boolean)
    ).size

    // 4. Calculate total rewards - sum of all yield from Withdraw events
    const withdrawFilter = contract.filters.Withdraw()
    const withdrawLogs = await contract.queryFilter(withdrawFilter)

    // Sum all yields from Withdraw events
    const totalRewards = withdrawLogs.reduce((sum: bigint, log) => {
      if (!log.topics || !log.data) return sum
      const decoded = contract.interface.parseLog({
        topics: log.topics,
        data: log.data,
      })
      const yieldAmount = decoded?.args?.yield || BigInt(0)
      return sum + BigInt(yieldAmount)
    }, BigInt(0))

    return {
      tvl,
      users: uniqueUsers,
      apy,
      totalRewards: formatEther(totalRewards),
    }
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    
    // Return fallback data if contract not deployed or RPC issues
    // Always return a valid object structure
    return {
      tvl: '0',
      users: 0,
      apy: 5.0,
      totalRewards: '0',
    }
  }
})

// Ensure we always return a valid response even if something goes wrong
