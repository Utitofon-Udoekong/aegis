<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      :class="[
        'fixed bottom-4 right-4 z-50 max-w-md w-full card flex items-center gap-3',
        typeClasses,
      ]"
    >
      <Icon :name="iconName" class="text-2xl" />
      <div class="flex-1">
        <p class="font-semibold">{{ title }}</p>
        <p v-if="message" class="text-sm text-slate-300">{{ message }}</p>
      </div>
      <button
        @click="$emit('close')"
        class="text-slate-400 hover:text-white transition-colors"
      >
        <Icon name="mdi:close" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
})

defineEmits<{
  close: []
}>()

const typeClasses = computed(() => {
  const types = {
    success: 'border-green-500 bg-green-900/20',
    error: 'border-red-500 bg-red-900/20',
    warning: 'border-yellow-500 bg-yellow-900/20',
    info: 'border-blue-500 bg-blue-900/20',
  }
  return types[props.type]
})

const iconName = computed(() => {
  const icons = {
    success: 'mdi:check-circle',
    error: 'mdi:alert-circle',
    warning: 'mdi:alert',
    info: 'mdi:information',
  }
  return icons[props.type]
})
</script>

