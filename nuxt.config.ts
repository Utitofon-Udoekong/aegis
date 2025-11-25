// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false, // Required for Reown AppKit with Nuxt
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/image',
  ],
  app: {
    head: {
      title: 'Bitcoin Vault AI - Smart DeFi for Bitcoin',
      meta: [
        { name: 'description', content: 'AI-optimized Bitcoin DeFi vaults' },
      ],
    },
  },
  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    ethereumRpcUrl: process.env.ETHEREUM_RPC_URL,
    public: {
      vaultAddress: process.env.VAULT_CONTRACT_ADDRESS,
      vaultBtcAddress: process.env.VAULTBTC_ADDRESS,
      reownProjectId: process.env.REOWN_PROJECT_ID,
    },
  },
  css: ['~/assets/css/main.css'],
  vite: {
    build: {
      target: 'es2020', // Support BigInt literals
    },
  },
  nitro: {
    esbuild: {
      options: {
        target: 'es2020', // Support BigInt literals
      },
    },
  },
})