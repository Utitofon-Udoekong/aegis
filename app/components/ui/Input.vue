<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium mb-2">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50',
          error ? 'border-red-500' : '',
          $slots.suffix ? 'pr-24' : '',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <div v-if="$slots.suffix" class="absolute right-0 top-0 h-full flex items-center pr-4">
        <slot name="suffix" />
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
    <p v-if="hint && !error" class="mt-1 text-sm text-slate-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

