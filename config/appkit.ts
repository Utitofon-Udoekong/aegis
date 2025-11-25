
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  sepolia,
  type AppKitNetwork
} from '@reown/appkit/networks'

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia]

export const projectId = 'b56e18d47c72ab683b10814fe9495694'

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

