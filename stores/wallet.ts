import { defineStore } from 'pinia'

interface WalletState {
  isConnecting: boolean
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    isConnecting: false,
  }),

  actions: {
    setConnecting(value: boolean) {
      this.isConnecting = value
    },
  },
})
