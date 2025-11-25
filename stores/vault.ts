import { defineStore } from 'pinia'
import type { Transaction } from '~~/shared/types/vault'

interface VaultState {
  balance: string
  apy: number
  totalDeposits: string
  userRewards: string
  transactions: Transaction[]
  isLoading: boolean
  vaultBTCBalance: string
}

export const useVaultStore = defineStore('vault', {
  state: (): VaultState => ({
    balance: '0',
    apy: 5.0,
    totalDeposits: '0',
    userRewards: '0',
    transactions: [],
    isLoading: false,
    vaultBTCBalance: '0',
  }),

  getters: {
    hasBalance: (state): boolean => {
      return parseFloat(state.balance) > 0
    },
    formattedBalance: (state): string => {
      return parseFloat(state.balance).toFixed(4)
    },
    formattedRewards: (state): string => {
      return parseFloat(state.userRewards).toFixed(4)
    },
  },

  actions: {
    async fetchBalance(address: string) {
      if (!address) return
      
      this.isLoading = true
      try {
        const { getBalance, calculateYield, getVaultBTCBalance, getTotalDeposits } = useVault()
        
        const [balance, rewards, vaultBTCBalance, totalDeposits] = await Promise.all([
          getBalance(address),
          calculateYield(address),
          getVaultBTCBalance(address),
          getTotalDeposits(),
        ])
        
        this.balance = balance
        this.userRewards = rewards
        this.vaultBTCBalance = vaultBTCBalance
        this.totalDeposits = totalDeposits
      } catch (error) {
        console.error('Error fetching balance:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchTransactions(address: string) {
      if (!address) return
      
      try {
        const { fetchTransactions } = useTransactions()
        this.transactions = await fetchTransactions(address)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      }
    },

    reset() {
      this.balance = '0'
      this.userRewards = '0'
      this.transactions = []
      this.vaultBTCBalance = '0'
    },
  },
})

