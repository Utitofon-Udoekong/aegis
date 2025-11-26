import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  sepolia,
  type AppKitNetwork
} from '@reown/appkit/networks'

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia]

// Use NUXT_PUBLIC_ prefix for Vite to expose env vars at build time
// Falls back to hardcoded value for development
export const projectId = import.meta.env.NUXT_PUBLIC_REOWN_PROJECT_ID || 
                         import.meta.env.VITE_REOWN_PROJECT_ID ||
                         'b56e18d47c72ab683b10814fe9495694'
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

