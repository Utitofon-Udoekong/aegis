<template>
  <div :class="['group relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 transition-all duration-300 hover:border-slate-600/50', paddingClass]">
    <!-- Subtle glow effect -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div class="relative">
      <h3 v-if="title" class="text-lg font-semibold mb-4 text-white flex items-center gap-2">
        <div class="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-green-500"></div>
        {{ title }}
      </h3>
    <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
})

const paddingClass = computed(() => {
  const padding = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  return padding[props.padding]
})
</script>
