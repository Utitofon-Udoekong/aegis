<script setup lang="ts">
import { createAppKit } from '@reown/appkit/vue'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { sepolia } from '@reown/appkit/networks'

const config = useRuntimeConfig()
const projectId = config.public.reownProjectId as string

// Initialize AppKit (only on client side)
if (process.client && projectId) {
  const metadata = {
    name: 'Bitcoin Vault AI',
    description: 'AI-optimized Bitcoin DeFi vaults',
    url: window.location.origin,
    icons: [`${window.location.origin}/icon.png`]
  }

  createAppKit({
    adapters: [new EthersAdapter()],
    networks: [sepolia],
    defaultNetwork: sepolia,
    metadata,
    projectId,
    features: {
      analytics: true,
      email: true,
      socials: ['google', 'github'],
    }
  })
}
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <!-- Global AI Chatbot (available on all pages) -->
    <ClientOnly>
      <AiChatbot />
    </ClientOnly>
  </div>
</template>
