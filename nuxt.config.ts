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
    '@wagmi/vue/nuxt',
    '@cssninja/nuxt-toaster'
  ],
  toaster: {
    installPlugin: false // We'll create a custom plugin
  },
  app: {
    head: {
      title: 'AEGIS - AI-Powered DeFi Vault',
      meta: [
        { name: 'description', content: 'AEGIS - AI-optimized DeFi vaults for maximum yield' },
      ],
    },
  },
  runtimeConfig: {
    // anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    subgraphApiKey: process.env.SUBGRAPH_API_KEY,
    public: {
      ethereumRpcUrl: process.env.ETHEREUM_RPC_URL,
      vaultContractAddress: process.env.VAULT_CONTRACT_ADDRESS,
      vaultBtcAddress: process.env.VAULT_BTC_ADDRESS,
      reownProjectId: process.env.REOWN_PROJECT_ID,
    },
  },
  css: ['~/assets/css/main.css'],
  vite: {
    build: {
      target: 'es2020', // Support BigInt literals
    },
    optimizeDeps: {
      exclude: ['oxc-parser', '@oxc-parser/binding-darwin-arm64']
    },
    define: {
      global: 'globalThis'
    }
  },
  nitro: {
    esbuild: {
      options: {
        target: 'es2020', // Support BigInt literals
      },
    },
    experimental: {
      wasm: true
    },
    // Exclude native bindings from bundling
    externals: {
      inline: ['oxc-parser']
    }
  },
  build: {
    transpile: []
  }
})