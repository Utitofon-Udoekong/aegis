<template>
  <div :class="['card', paddingClass]">
    <h3 v-if="title" class="text-xl font-bold mb-4 text-gray-900 dark:text-white">{{ title }}</h3>
    <slot />
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

