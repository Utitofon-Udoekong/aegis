import { defineStore } from 'pinia'
import type { Transaction } from '~~/shared/types/vault'

interface VaultState {
  balance: string
  apy: number
  userRewards: string
  transactions: Transaction[]
}

export const useVaultStore = defineStore('vault', {
  state: (): VaultState => ({
    balance: '0',
    apy: 5.0,
    userRewards: '0',
    transactions: [],
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
    reset() {
      this.balance = '0'
      this.userRewards = '0'
      this.transactions = []
    },
  },
})
