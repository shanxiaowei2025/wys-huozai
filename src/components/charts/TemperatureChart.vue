<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const temperatures = [
    22, 21, 20, 19, 19, 20, 22, 25, 28, 32, 35, 38,
    40, 42, 41, 39, 37, 34, 31, 28, 26, 24, 23, 22
  ]

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#409EFF',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '8%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours,
      axisLine: {
        lineStyle: {
          color: '#3a4060'
        }
      },
      axisLabel: {
        color: '#a0aec0',
        interval: 2
      }
    },
    yAxis: {
      type: 'value',
      name: '温度(℃)',
      nameTextStyle: {
        color: '#a0aec0'
      },
      axisLine: {
        lineStyle: {
          color: '#3a4060'
        }
      },
      axisLabel: {
        color: '#a0aec0'
      },
      splitLine: {
        lineStyle: {
          color: '#2a3150',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '温度',
        type: 'line',
        smooth: true,
        data: temperatures,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#67C23A' }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        itemStyle: {
          color: '#409EFF',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            color: '#fff',
            borderColor: '#409EFF',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(64, 158, 255, 0.5)'
          }
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
}
</style>

