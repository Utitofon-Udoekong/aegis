import { WagmiPlugin } from '@wagmi/vue'
import { wagmiAdapter } from '~~/config/appkit'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(WagmiPlugin, { config: wagmiAdapter.wagmiConfig })
})