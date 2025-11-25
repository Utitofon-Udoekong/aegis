<template>
  <button
    :class="[
      'font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses,
      sizeClasses,
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="inline-flex items-center">
      <Icon name="mdi:loading" class="animate-spin mr-2" />
      {{ loadingText }}
    </span>
    <span v-else>
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline'
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
    primary: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md shadow-emerald-500/25',
    secondary: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md shadow-emerald-500/25',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md shadow-emerald-500/25',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border-2 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'text-sm py-1 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-6',
  }
  return sizes[props.size]
})
</script>

