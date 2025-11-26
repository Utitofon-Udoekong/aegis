<template>
  <div>
   <ClientOnly>
    <UiButton
      v-if="!walletConnected"
      @click="handleConnect"
      :loading="isConnecting"
    >
      <Icon name="mdi:wallet" class="mr-2" />
      Connect Wallet
    </UiButton>
    <div v-else class="flex items-center gap-3">
      <div class="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
        <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <span class="text-sm font-mono text-emerald-400">{{ truncatedAddress }}</span>
      </div>
      <UiButton variant="outline" @click="handleDisconnect" size="sm" class="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
        Disconnect
      </UiButton>
    </div>
   </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useWalletStore } from '~~/stores/wallet'
import { useAppKitAccount } from "@reown/appkit/vue";
import { useAppKit } from '@reown/appkit/vue';
import { useDisconnect } from '@reown/appkit/vue';
const { open } = useAppKit();
const accountData = useAppKitAccount();
const isConnected = computed(() => accountData.value?.isConnected)
const address = computed(() => accountData.value?.address)
const walletStore = useWalletStore()
const { disconnect } = useDisconnect();
const isConnecting = computed(() => walletStore.isConnecting)

// Check both isConnected and address to determine connection state
const walletConnected = computed(() => {
  return isConnected.value && !!address.value
})

const truncatedAddress = computed(() => {
  if (!address.value) return ''
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
})

const handleConnect = async () => {
  walletStore.setConnecting(true)
  try {
    await open({ view: 'Connect' , namespace: 'eip155'})
  } catch (error) {
  } finally {
    walletStore.setConnecting(false)
  }
}

const handleDisconnect = async () => {
  try {
    await disconnect({namespace: 'eip155'})
    // User can disconnect from the account modal
  } catch (error) {
  }
}

// Watch for connection state changes (for debugging)
watch([isConnected, address], ([connected, addr]) => {
}, { immediate: true })
</script>

