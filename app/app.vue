<script setup lang="ts">
import { createAppKit } from '@reown/appkit/vue'

import { networks, projectId, wagmiAdapter } from '~~/config/appkit'

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  themeMode: 'light',

  metadata: {
    name: 'AEGIS',
    description: 'AEGIS',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})
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
