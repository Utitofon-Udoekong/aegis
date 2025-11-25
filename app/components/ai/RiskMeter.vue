<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">Risk Level</span>
      <span class="text-lg font-bold" :class="riskColorClass">{{ riskLevel }}/10</span>
    </div>
    <div class="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
      <div
        :class="['h-full transition-all duration-500', riskColorClass]"
        :style="{ width: `${(riskLevel / 10) * 100}%` }"
      />
    </div>
    <p class="text-xs text-slate-400">{{ riskLabel }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  riskLevel: number
}

const props = defineProps<Props>()

const riskColorClass = computed(() => {
  if (props.riskLevel <= 3) return 'bg-green-500'
  if (props.riskLevel <= 6) return 'bg-yellow-500'
  return 'bg-red-500'
})

const riskLabel = computed(() => {
  if (props.riskLevel <= 3) return 'Low Risk'
  if (props.riskLevel <= 6) return 'Moderate Risk'
  return 'High Risk'
})
</script>

