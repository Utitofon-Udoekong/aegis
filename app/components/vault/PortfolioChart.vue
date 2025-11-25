<template>
  <UiCard title="Portfolio Performance">
    <div v-if="transactions.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <Icon name="mdi:chart-line" class="text-4xl mb-2 opacity-50" />
      <p>No transaction history yet</p>
    </div>
    <div v-else class="h-64 relative">
      <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#10b981;stop-opacity:0" />
          </linearGradient>
        </defs>
        <polyline
          :points="chartPoints"
          fill="none"
          stroke="#10b981"
          stroke-width="2"
        />
        <polygon
          :points="areaPoints"
          fill="url(#gradient)"
        />
      </svg>
      <div class="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400 px-2">
        <span v-for="(label, index) in chartLabels" :key="index">
          {{ label }}
        </span>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import type { Transaction } from '~~/shared/types/vault'

interface Props {
  transactions: Transaction[]
  balance: string
}

const props = defineProps<Props>()

const chartData = computed(() => {
  let cumulative = 0
  const data = props.transactions
    .slice()
    .reverse()
    .map((tx) => {
      if (tx.type === 'deposit') {
        cumulative += parseFloat(tx.amount)
      } else {
        cumulative -= parseFloat(tx.amount)
      }
      return {
        x: new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        y: cumulative,
      }
    })

  return data
})

const maxValue = computed(() => {
  if (chartData.value.length === 0) return 1
  return Math.max(...chartData.value.map(d => d.y), parseFloat(props.balance) || 0) * 1.1
})

const chartPoints = computed(() => {
  if (chartData.value.length === 0) return ''
  const width = 400
  const height = 200
  const padding = 20
  
  return chartData.value
    .map((d, i) => {
      const x = padding + (i / (chartData.value.length - 1 || 1)) * (width - padding * 2)
      const y = height - padding - (d.y / maxValue.value) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
})

const areaPoints = computed(() => {
  if (chartData.value.length === 0) return ''
  const width = 400
  const height = 200
  const padding = 20
  
  const points = chartData.value
    .map((d, i) => {
      const x = padding + (i / (chartData.value.length - 1 || 1)) * (width - padding * 2)
      const y = height - padding - (d.y / maxValue.value) * (height - padding * 2)
      return `${x},${y}`
    })
  
  return `${padding},${height - padding} ${points.join(' ')} ${width - padding},${height - padding}`
})

const chartLabels = computed(() => {
  if (chartData.value.length === 0) return []
  const count = Math.min(5, chartData.value.length)
  const step = Math.floor(chartData.value.length / count)
  return chartData.value.filter((_, i) => i % step === 0).map(d => d.x)
})
</script>

