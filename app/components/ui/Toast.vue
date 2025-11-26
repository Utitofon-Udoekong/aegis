<script setup lang="ts">
const props = defineProps<{
  title: string
  message?: string
  type: 'success' | 'error' | 'info' | 'warning'
}>()

const { close } = useNinjaToasterState()

const typeConfig = computed(() => {
  switch (props.type) {
    case 'success':
      return {
        icon: 'mdi:check-circle',
        bgClass: 'from-emerald-500/20 to-emerald-600/10',
        borderClass: 'border-emerald-500/30',
        iconClass: 'text-emerald-400 bg-emerald-500/20',
        titleClass: 'text-emerald-300',
      }
    case 'error':
      return {
        icon: 'mdi:alert-circle',
        bgClass: 'from-red-500/20 to-red-600/10',
        borderClass: 'border-red-500/30',
        iconClass: 'text-red-400 bg-red-500/20',
        titleClass: 'text-red-300',
      }
    case 'warning':
      return {
        icon: 'mdi:alert',
        bgClass: 'from-amber-500/20 to-amber-600/10',
        borderClass: 'border-amber-500/30',
        iconClass: 'text-amber-400 bg-amber-500/20',
        titleClass: 'text-amber-300',
      }
    case 'info':
    default:
      return {
        icon: 'mdi:information',
        bgClass: 'from-cyan-500/20 to-cyan-600/10',
        borderClass: 'border-cyan-500/30',
        iconClass: 'text-cyan-400 bg-cyan-500/20',
        titleClass: 'text-cyan-300',
      }
  }
})
</script>

<template>
  <div 
    class="relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl bg-gradient-to-br shadow-xl"
    :class="[typeConfig.bgClass, typeConfig.borderClass]"
  >
    <!-- Icon -->
    <div 
      class="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
      :class="typeConfig.iconClass"
    >
      <Icon :name="typeConfig.icon" class="text-lg" />
    </div>
    
    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h4 class="font-semibold text-sm" :class="typeConfig.titleClass">
        {{ props.title }}
      </h4>
      <p v-if="props.message" class="mt-0.5 text-xs text-slate-400 line-clamp-2">
        {{ props.message }}
      </p>
    </div>
    
    <!-- Close button -->
    <button 
      @click="close()"
      class="flex-shrink-0 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
    >
      <Icon name="mdi:close" class="text-sm" />
    </button>
  </div>
</template>
