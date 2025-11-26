<template>
  <button
    :class="[
      'relative font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
      variantClasses,
      sizeClasses,
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <!-- Shimmer effect for primary/secondary -->
    <div v-if="variant === 'primary' || variant === 'secondary' || variant === 'success'" class="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    
    <span class="relative inline-flex items-center justify-center">
      <Icon v-if="loading" name="mdi:loading" class="animate-spin mr-2" />
      <slot v-if="!loading" />
      <span v-else>{{ loadingText }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  loadingText: 'Loading...',
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white shadow-lg shadow-slate-900/50 hover:shadow-slate-800/50 ring-1 ring-slate-500/20 hover:scale-[1.02] active:scale-[0.98]',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]',
    outline: 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]',
    ghost: 'text-slate-400 hover:text-white hover:bg-slate-800/50',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'text-sm py-2 px-4',
    md: 'text-sm py-3 px-5',
    lg: 'text-base py-4 px-8',
  }
  return sizes[props.size]
})
</script>
