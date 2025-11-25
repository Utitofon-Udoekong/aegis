import { defineStore } from 'pinia'

interface WalletState {
  isConnecting: boolean
  error: string | null
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    isConnecting: false,
    error: null,
  }),

  actions: {
    setConnecting(value: boolean) {
      this.isConnecting = value
    },
    setError(error: string | null) {
      this.error = error
    },
    clearError() {
      this.error = null
    },
  },
})

