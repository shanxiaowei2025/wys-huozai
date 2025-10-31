<template>
  <div class="map-wrapper">
    <div ref="chartRef" class="chart-container"></div>
    <div class="map-legend">
      <div class="legend-item">
        <span class="legend-dot normal"></span>
        <span class="legend-text">已处置</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot warning"></span>
        <span class="legend-text">处置中</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot alarm"></span>
        <span class="legend-text">未处置</span>
      </div>
    </div>

    <!-- 报警详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogData.title"
      width="500px"
      :before-close="handleClose"
      class="alarm-dialog"
    >
      <div class="alarm-detail">
        <div class="alarm-row">
          <span class="alarm-label">报警类型：</span>
          <span class="alarm-value alarm-type">{{ dialogData.alarmType }}</span>
        </div>
        <div class="alarm-row">
          <span class="alarm-label">报警地点：</span>
          <span class="alarm-value alarm-location">{{ dialogData.location }}</span>
        </div>
        <div class="alarm-row">
          <span class="alarm-label">报警时间：</span>
          <span class="alarm-value alarm-time">{{ dialogData.time }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleClose">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { useAlarmData } from '@/composables/useAlarmData'

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 使用共享的报警数据
const { communityStatusMap } = useAlarmData()

// 弹窗状态管理
const dialogVisible = ref(false)
// 弹窗显示的数据
const dialogData = ref({
  title: '',
  alarmType: '',
  location: '',
  time: ''
})

// 生成地图数据点
// 这里定义了所有小区的地理位置坐标(经度,纬度)和设备数量
const mapData = computed(() => {
  const basePositions = [
    // 第一排小区 (上方)
    { name: '恒源御景', position: [116.3850, 39.9080], deviceCount: 32 },
    { name: '盛世华庭', position: [116.3920, 39.9085], deviceCount: 28 },
    { name: '锦绣家园', position: [116.3990, 39.9090], deviceCount: 35 },
    { name: '阳光花园', position: [116.4060, 39.9085], deviceCount: 30 },
    { name: '龙泉小区', position: [116.4130, 39.9080], deviceCount: 38 },
    
    // 第二排小区 (中上)
    { name: '碧水云天', position: [116.3870, 39.9030], deviceCount: 34 },
    { name: '金色家园', position: [116.3940, 39.9035], deviceCount: 29 },
    { name: '翠竹苑', position: [116.4010, 39.9040], deviceCount: 31 },
    { name: '紫荆花园', position: [116.4080, 39.9035], deviceCount: 36 },
    { name: '枫林雅居', position: [116.4150, 39.9030], deviceCount: 33 },
    
    // 第三排小区 (中下)
    { name: '海棠湾', position: [116.3890, 39.8980], deviceCount: 37 },
    { name: '梧桐苑', position: [116.3960, 39.8985], deviceCount: 30 },
    { name: '兰亭序', position: [116.4030, 39.8990], deviceCount: 32 },
    { name: '芳华园', position: [116.4100, 39.8985], deviceCount: 28 },
    { name: '锦江花园', position: [116.4170, 39.8980], deviceCount: 35 }
  ]
  
  // 遍历所有小区位置,并根据报警数据设置状态
  return basePositions.map(base => {
    // 从报警数据中获取该小区的状态信息
    const statusInfo = communityStatusMap.value[base.name]
    const alarmData = statusInfo?.alarmData
    
    return {
      name: base.name,
      value: [...base.position, base.deviceCount],
      // 状态: normal(正常) / warning(预警) / alarm(报警)
      status: statusInfo?.status || 'normal',
      // 报警类型,移除emoji符号
      alarmType: alarmData ? alarmData.title.replace(/🔥|🪟/g, '').trim() : '',
      // 报警级别
      alarmLevel: alarmData?.level || 'normal'
    }
  })
})

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}

// 处理小区点击事件
const handleChartClick = (params: any) => {
  const data = params.data
  // 只有有报警的小区才显示弹窗
  if (data.status !== 'normal') {
    const statusInfo = communityStatusMap.value[data.name]
    const alarmData = statusInfo?.alarmData
    
    if (alarmData) {
      // 设置弹窗数据
      dialogData.value = {
        title: '报警详情',
        alarmType: alarmData.title,  // 包含emoji的完整标题
        location: alarmData.location,  // 格式：小区名称 x栋（xx-xx层）
        time: alarmData.time  // 报警时间
      }
      // 显示弹窗
      dialogVisible.value = true
    }
  }
}

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  updateChart()
  
  // 绑定点击事件
  chartInstance.on('click', handleChartClick)
}

const updateChart = () => {
  if (!chartInstance) return
  
  const data = mapData.value

  const statusColors: Record<string, string> = {
    normal: '#67C23A',
    warning: '#E6A23C',
    alarm: '#F56C6C'
  }

  const option = {
    backgroundColor: 'transparent',
    // 简化 tooltip，提示用户点击查看详情
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#409EFF',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 13
      },
      formatter: (params: any) => {
        const data = params.data
        const status = data.status
        // 状态文字现在对应处理状态
        const statusText = status === 'normal' ? '已处置' : status === 'warning' ? '处置中' : '未处置'
        const statusIcon = status === 'alarm' ? '🚨' : status === 'warning' ? '⚠️' : '✅'
        
        // 只显示基本信息和提示
        let tooltip = `${statusIcon} ${data.name}<br/>状态: ${statusText}`
        
        // 如果有报警，提示点击查看详情
        if (status !== 'normal') {
          tooltip += `<br/><span style="color: #409EFF; font-size: 12px;">👆 点击查看详情</span>`
        }
        
        return tooltip
      }
    },
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    xAxis: {
      show: false,
      type: 'value',
      // X轴范围调整,覆盖所有小区的经度范围
      min: 116.38,
      max: 116.42
    },
    yAxis: {
      show: false,
      type: 'value',
      // Y轴范围调整,覆盖所有小区的纬度范围
      min: 39.895,
      max: 39.912
    },
    series: [
      {
        type: 'scatter',
        coordinateSystem: 'cartesian2d',
        data: data,
        symbolSize: (val: any) => {
          return Math.max(val[2] / 2, 15)
        },
        itemStyle: {
          color: (params: any) => {
            return statusColors[params.data.status]
          },
          shadowBlur: (params: any) => {
            return params.data.status === 'alarm' ? 15 : 10
          },
          shadowColor: (params: any) => {
            const status = params.data.status
            if (status === 'alarm') return 'rgba(245, 108, 108, 0.8)'
            if (status === 'warning') return 'rgba(230, 162, 60, 0.6)'
            return 'rgba(64, 158, 255, 0.5)'
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(255, 255, 255, 0.8)'
          }
        },
        label: {
          show: true,
          position: 'top',
          color: '#fff',
          formatter: '{b}'
        }
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'cartesian2d',
        data: data.filter(item => item.status !== 'normal'),
        symbolSize: (val: any) => {
          return Math.max(val[2] / 2, 15)
        },
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke',
          scale: (params: any) => {
            return params.data.status === 'alarm' ? 4 : 3
          },
          period: (params: any) => {
            return params.data.status === 'alarm' ? 2.5 : 4
          }
        },
        itemStyle: {
          color: (params: any) => {
            return statusColors[params.data.status]
          },
          shadowBlur: (params: any) => {
            return params.data.status === 'alarm' ? 20 : 15
          },
          shadowColor: (params: any) => {
            const status = params.data.status
            if (status === 'alarm') return 'rgba(245, 108, 108, 1)'
            return 'rgba(230, 162, 60, 0.8)'
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
  // 移除点击事件监听
  if (chartInstance) {
    chartInstance.off('click', handleChartClick)
    chartInstance.dispose()
  }
})

// 监听数据变化，自动更新图表
watch(mapData, () => {
  if (chartInstance) {
    updateChart()
  }
}, { deep: true })
</script>

<style lang="scss" scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  flex: 1;
  min-height: 0;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.05) 0%, transparent 70%);
  border-radius: 8px;
}

.map-legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(10, 14, 39, 0.8);
  border: 1px solid rgba(64, 158, 255, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  gap: 20px;
  backdrop-filter: blur(10px);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  
  &.normal {
    background: #67C23A;
    box-shadow: 0 0 8px rgba(103, 194, 58, 0.6);
  }
  
  &.warning {
    background: #E6A23C;
    box-shadow: 0 0 8px rgba(230, 162, 60, 0.6);
  }
  
  &.alarm {
    background: #F56C6C;
    box-shadow: 0 0 8px rgba(245, 108, 108, 0.6);
    animation: alarmPulse 1.5s infinite;
  }
}

@keyframes alarmPulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(245, 108, 108, 0.6);
  }
  50% {
    box-shadow: 0 0 15px rgba(245, 108, 108, 1);
  }
}

.legend-text {
  font-size: 12px;
  color: #a0aec0;
  font-weight: 500;
}

// 报警详情弹窗样式
:deep(.alarm-dialog) {
  .el-dialog {
    background: linear-gradient(135deg, rgba(20, 25, 45, 0.95), rgba(30, 35, 55, 0.95));
    border: 1px solid rgba(64, 158, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  }
  
  .el-dialog__header {
    border-bottom: 1px solid rgba(64, 158, 255, 0.2);
    padding: 20px 24px;
  }
  
  .el-dialog__title {
    color: #409EFF;
    font-size: 18px;
    font-weight: 600;
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .el-dialog__footer {
    border-top: 1px solid rgba(64, 158, 255, 0.2);
    padding: 16px 24px;
  }
}

// 报警详情内容样式
.alarm-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alarm-row {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: rgba(64, 158, 255, 0.05);
  border-left: 3px solid rgba(64, 158, 255, 0.5);
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(64, 158, 255, 0.1);
    border-left-color: rgba(64, 158, 255, 0.8);
  }
}

.alarm-label {
  font-size: 14px;
  color: #a0aec0;
  font-weight: 500;
  min-width: 90px;
  flex-shrink: 0;
}

.alarm-value {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
  flex: 1;
  
  &.alarm-type {
    font-size: 16px;
    color: #F56C6C;
  }
  
  &.alarm-location {
    color: #409EFF;
  }
  
  &.alarm-time {
    color: #67C23A;
    font-family: 'Courier New', monospace;
  }
}
</style>

