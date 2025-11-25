export interface Transaction {
  hash: string
  type: 'deposit' | 'withdraw'
  amount: string
  timestamp: number
  blockNumber: number
}

export interface VaultStats {
  balance: string
  apy: number
  totalDeposits: string
  userRewards: string
}

