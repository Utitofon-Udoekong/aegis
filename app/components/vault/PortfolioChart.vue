<template>
  <div class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/5 via-slate-900 to-slate-900 border border-green-500/20 p-6 transition-all duration-300 hover:border-green-500/30">
    <!-- Background glow -->
    <div class="absolute top-0 left-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 group-hover:bg-green-500/15 transition-colors"></div>
    
    <div class="relative">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/20 ring-1 ring-green-500/30">
            <Icon name="mdi:chart-areaspline" class="text-xl text-green-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">Portfolio Performance</h3>
            <p class="text-xs text-slate-500">Balance over time</p>
          </div>
        </div>
        <div v-if="chartData.length > 0" class="text-right">
          <p class="text-2xl font-bold text-white">{{ parseFloat(balance).toFixed(4) }}</p>
          <p class="text-xs text-green-400">vaultBTC</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="transactions.length === 0" class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
          <Icon name="mdi:chart-line" class="text-3xl text-slate-600" />
        </div>
        <p class="text-slate-500">No data yet</p>
        <p class="text-xs text-slate-600 mt-1">Make a deposit to see your portfolio chart</p>
    </div>

      <!-- Chart -->
      <div v-else class="h-48 relative mt-4">
        <svg class="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
        <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.4" />
              <stop offset="50%" style="stop-color:#10b981;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#10b981;stop-opacity:0" />
          </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#10b981" />
              <stop offset="100%" style="stop-color:#22c55e" />
            </linearGradient>
        </defs>
          
          <!-- Grid lines -->
          <line v-for="i in 4" :key="'h'+i" 
            x1="20" :y1="20 + (i-1) * 40" 
            x2="380" :y2="20 + (i-1) * 40" 
            stroke="rgba(100,116,139,0.1)" stroke-width="1"
          />
          
          <!-- Area fill -->
          <polygon
            :points="areaPoints"
            fill="url(#chartGradient)"
          />
          
          <!-- Line -->
          <polyline
            :points="chartPoints"
            fill="none"
            stroke="url(#lineGradient)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          
          <!-- Glow effect -->
        <polyline
          :points="chartPoints"
          fill="none"
            stroke="#10b981"
            stroke-width="6"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.2"
            filter="blur(4px)"
          />
          
          <!-- Data points -->
          <circle
            v-for="(point, index) in chartPointsArray"
            :key="index"
            :cx="point.x"
            :cy="point.y"
            r="4"
            fill="#0f172a"
          stroke="#10b981"
          stroke-width="2"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </svg>
        
        <!-- X-axis labels -->
        <div class="absolute bottom-0 left-5 right-5 flex justify-between text-xs text-slate-500">
        <span v-for="(label, index) in chartLabels" :key="index">
          {{ label }}
        </span>
      </div>
    </div>
    </div>
  </div>
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

const chartPointsArray = computed(() => {
  if (chartData.value.length === 0) return []
  const width = 400
  const height = 180
  const padding = 20
  
  return chartData.value.map((d, i) => ({
    x: padding + (i / (chartData.value.length - 1 || 1)) * (width - padding * 2),
    y: height - padding - (d.y / maxValue.value) * (height - padding * 2)
  }))
})

const chartPoints = computed(() => {
  return chartPointsArray.value.map(p => `${p.x},${p.y}`).join(' ')
})

const areaPoints = computed(() => {
  if (chartData.value.length === 0) return ''
  const width = 400
  const height = 180
  const padding = 20
  
  const points = chartPointsArray.value.map(p => `${p.x},${p.y}`)
  
  return `${padding},${height - padding} ${points.join(' ')} ${width - padding},${height - padding}`
})

const chartLabels = computed(() => {
  if (chartData.value.length === 0) return []
  const count = Math.min(5, chartData.value.length)
  const step = Math.floor(chartData.value.length / count)
  return chartData.value.filter((_, i) => i % step === 0).map(d => d.x)
})
</script>
