<template>
  <UiCard :class="['hover:scale-105 transition-transform cursor-pointer', cardClass]">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h4 class="text-xl font-bold mb-1 text-gray-900 dark:text-white">{{ strategy.name }}</h4>
        <span
          :class="[
            'inline-block px-2 py-1 rounded text-xs font-medium',
            typeClass,
          ]"
        >
          {{ strategy.type }}
        </span>
      </div>
      <Icon :name="typeIcon" class="text-3xl opacity-50 text-emerald-400" />
    </div>

    <div class="space-y-3">
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Expected APY</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ strategy.expectedApy.min }}% - {{ strategy.expectedApy.max }}%
        </p>
      </div>

      <AiRiskMeter :risk-level="strategy.riskLevel" />

      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Horizon</p>
        <p class="font-medium text-gray-900 dark:text-white">{{ strategy.timeHorizon }}</p>
      </div>

      <div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Actions</p>
        <ul class="space-y-1">
          <li
            v-for="(action, index) in strategy.actions"
            :key="index"
            class="text-sm flex items-start gap-2 text-gray-700 dark:text-gray-300"
          >
            <Icon name="mdi:check-circle" class="text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>{{ action }}</span>
          </li>
        </ul>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400 mt-4">{{ strategy.description }}</p>

      <UiButton
        @click="$emit('select', strategy)"
        :class="['w-full mt-4', buttonClass]"
      >
        Select Strategy
      </UiButton>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import type { Strategy } from '~~/shared/types/ai'

interface Props {
  strategy: Strategy
}

const props = defineProps<Props>()

defineEmits<{
  select: [strategy: Strategy]
}>()

const cardClass = computed(() => {
  const classes = {
    conservative: 'border-green-500',
    moderate: 'border-yellow-500',
    aggressive: 'border-red-500',
  }
  return classes[props.strategy.type]
})

const typeClass = computed(() => {
  const classes = {
    conservative: 'bg-green-900/30 text-green-400',
    moderate: 'bg-yellow-900/30 text-yellow-400',
    aggressive: 'bg-red-900/30 text-red-400',
  }
  return classes[props.strategy.type]
})

const typeIcon = computed(() => {
  const icons = {
    conservative: 'mdi:shield-check',
    moderate: 'mdi:scale-balance',
    aggressive: 'mdi:rocket-launch',
  }
  return icons[props.strategy.type]
})

const buttonClass = computed(() => {
  const classes = {
    conservative: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
    moderate: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600',
    aggressive: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
  }
  return classes[props.strategy.type]
})
</script>

