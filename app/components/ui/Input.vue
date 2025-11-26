<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-slate-300 mb-2">
      {{ label }}
    </label>
    <div class="relative group">
      <!-- Glow effect on focus -->
      <div class="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300"></div>
      
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
            'w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500',
            'focus:outline-none focus:border-emerald-500/50 focus:bg-slate-800',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            error ? 'border-red-500/50 focus:border-red-500' : '',
            $slots.suffix ? 'pr-28' : '',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <div v-if="$slots.suffix" class="absolute right-0 top-0 h-full flex items-center pr-4">
        <slot name="suffix" />
      </div>
    </div>
    </div>
    <p v-if="error" class="mt-2 text-sm text-red-400 flex items-center gap-1">
      <Icon name="mdi:alert-circle" class="text-sm" />
      {{ error }}
    </p>
    <p v-if="hint && !error" class="mt-2 text-sm text-slate-500">{{ hint }}</p>
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
