<template>
  <div :class="[
    'group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 cursor-pointer',
    'hover:scale-[1.02] hover:shadow-xl',
    cardClass
  ]">
    <!-- Background glow -->
    <div :class="['absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors', glowClass]"></div>
    
    <div class="relative">
      <!-- Header -->
      <div class="flex items-start justify-between mb-5">
      <div>
          <span :class="[
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3',
            badgeClass
          ]">
            <Icon :name="typeIcon" class="text-sm" />
          {{ strategy.type }}
        </span>
          <h4 class="text-xl font-bold text-white">{{ strategy.name }}</h4>
        </div>
        <div :class="['flex items-center justify-center w-12 h-12 rounded-xl ring-1', iconBgClass]">
          <Icon :name="typeIcon" class="text-2xl" :class="iconColorClass" />
        </div>
      </div>

      <!-- APY Display -->
      <div class="mb-5 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <p class="text-xs text-slate-400 uppercase tracking-wider mb-1">Expected APY</p>
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-bold text-white">{{ strategy.expectedApy.min }}%</span>
          <template v-if="strategy.expectedApy.min !== strategy.expectedApy.max">
            <span class="text-slate-500">-</span>
            <span class="text-3xl font-bold text-white">{{ strategy.expectedApy.max }}%</span>
          </template>
    </div>
        <p v-if="strategy.type === 'conservative'" class="text-xs text-green-400/70 mt-1 flex items-center gap-1">
          <Icon name="mdi:shield-check" class="text-sm" />
          Vault guaranteed rate
        </p>
        <p v-else class="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <Icon name="mdi:alert-circle-outline" class="text-sm" />
          External DeFi strategies (not guaranteed)
        </p>
      </div>

      <!-- Risk & Time -->
      <div class="grid grid-cols-2 gap-3 mb-5">
        <div class="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <p class="text-xs text-slate-500 mb-1">Risk Level</p>
          <div class="flex items-center gap-2">
            <div class="flex gap-0.5">
              <div v-for="i in 10" :key="i" 
                :class="[
                  'w-1.5 h-4 rounded-sm transition-colors',
                  i <= strategy.riskLevel ? riskBarClass : 'bg-slate-700'
                ]"
              ></div>
            </div>
            <span class="text-sm font-medium text-white">{{ strategy.riskLevel }}/10</span>
          </div>
        </div>
        <div class="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <p class="text-xs text-slate-500 mb-1">Time Horizon</p>
          <p class="text-sm font-medium text-white flex items-center gap-1">
            <Icon name="mdi:clock-outline" class="text-slate-400" />
            {{ strategy.timeHorizon }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="mb-5">
        <p class="text-xs text-slate-400 uppercase tracking-wider mb-2">Key Actions</p>
        <ul class="space-y-2">
          <li
            v-for="(action, index) in strategy.actions.slice(0, 3)"
            :key="index"
            class="text-sm flex items-start gap-2 text-slate-300"
          >
            <Icon :name="checkIcon" :class="['mt-0.5 flex-shrink-0', iconColorClass]" />
            <span>{{ action }}</span>
          </li>
        </ul>
      </div>

      <!-- Description -->
      <p class="text-sm text-slate-400 mb-5 line-clamp-2">{{ strategy.description }}</p>

      <!-- Select Button -->
      <button
        @click="$emit('select', strategy)"
        :class="[
          'relative w-full py-3 px-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300',
          'hover:shadow-lg active:scale-[0.98]',
          buttonClass
        ]"
      >
        <div class="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <span class="relative flex items-center justify-center gap-2">
          <Icon name="mdi:check-circle" />
        Select Strategy
        </span>
      </button>
    </div>
  </div>
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
    conservative: 'bg-gradient-to-br from-green-500/10 via-slate-900 to-slate-900 border border-green-500/30 hover:border-green-500/50 hover:shadow-green-500/10',
    moderate: 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 hover:shadow-amber-500/10',
    aggressive: 'bg-gradient-to-br from-red-500/10 via-slate-900 to-slate-900 border border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/10',
  }
  return classes[props.strategy.type]
})

const glowClass = computed(() => {
  const classes = {
    conservative: 'bg-green-500/10 group-hover:bg-green-500/20',
    moderate: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    aggressive: 'bg-red-500/10 group-hover:bg-red-500/20',
  }
  return classes[props.strategy.type]
})

const badgeClass = computed(() => {
  const classes = {
    conservative: 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30',
    moderate: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30',
    aggressive: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
  }
  return classes[props.strategy.type]
})

const iconBgClass = computed(() => {
  const classes = {
    conservative: 'bg-green-500/20 ring-green-500/30',
    moderate: 'bg-amber-500/20 ring-amber-500/30',
    aggressive: 'bg-red-500/20 ring-red-500/30',
  }
  return classes[props.strategy.type]
})

const iconColorClass = computed(() => {
  const classes = {
    conservative: 'text-green-400',
    moderate: 'text-amber-400',
    aggressive: 'text-red-400',
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

const checkIcon = computed(() => {
  const icons = {
    conservative: 'mdi:check-circle',
    moderate: 'mdi:check-circle',
    aggressive: 'mdi:check-circle',
  }
  return icons[props.strategy.type]
})

const riskBarClass = computed(() => {
  const classes = {
    conservative: 'bg-green-500',
    moderate: 'bg-amber-500',
    aggressive: 'bg-red-500',
  }
  return classes[props.strategy.type]
})

const buttonClass = computed(() => {
  const classes = {
    conservative: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 shadow-green-500/25',
    moderate: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 shadow-amber-500/25',
    aggressive: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 shadow-red-500/25',
  }
  return classes[props.strategy.type]
})
</script>
