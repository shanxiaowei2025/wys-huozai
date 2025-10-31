<template>
  <div class="dashboard-page">
    <ScreenAdapter :width="1920" :height="1080">
      <div class="dashboard-content">
        <!-- 顶部标题 -->
        <header class="dashboard-header">
          <h1 class="dashboard-title">
            定兴县火灾暨高空抛物监控预警
          </h1>
          <div class="header-actions">
            <div class="action-item">设备管理</div>
            <div class="action-item">系统设置</div>
          </div>
          <div class="current-time">{{ currentTime }}</div>
        </header>

        <!-- 主要内容区 -->
        <div class="dashboard-main">
          <!-- 全屏按钮 -->
          <FullScreenButton />
          
          <!-- 地图模式 -->
          <template v-if="currentMode === 'map'">
            <!-- 左侧区域 - GIS地图 -->
            <div class="left-panel">
              <DataCard title="🗺️ GIS地图监控" icon="Location" class="map-card">
                <template #top>
                  <!-- 模式切换按钮 -->
                  <div class="mode-switcher-in-card">
                    <button 
                      class="mode-btn" 
                      :class="{ active: (currentMode as string) === 'map' }"
                      @click="currentMode = 'map'"
                    >
                      🗺️ 地图模式
                    </button>
                    <button 
                      class="mode-btn" 
                      :class="{ active: (currentMode as string) === 'monitor' }"
                      @click="currentMode = 'monitor'"
                    >
                      📹 监控模式
                    </button>
                  </div>
                </template>
                <MapChart />
              </DataCard>
            </div>

            <!-- 右侧区域 - 报警列表 -->
            <div class="right-panel">
              <AlarmList 
                @test-alarm="showTestAlarm" 
                @alarm-click="showAlarmFromList"
              />
            </div>
          </template>

          <!-- 监控模式 -->
          <template v-if="currentMode === 'monitor'">
            <!-- 中间区域 - 9分屏视频 -->
            <div class="monitor-panel">
              <DataCard :title="`📹 实时视频监控（${gridMode}分屏）`" icon="Monitor">
                <template #top>
                  <!-- 模式切换按钮 -->
                  <div class="mode-switcher-in-card">
                    <button 
                      class="mode-btn" 
                      :class="{ active: (currentMode as string) === 'map' }"
                      @click="currentMode = 'map'"
                    >
                      🗺️ 地图模式
                    </button>
                    <button 
                      class="mode-btn" 
                      :class="{ active: (currentMode as string) === 'monitor' }"
                      @click="currentMode = 'monitor'"
                    >
                      📹 监控模式
                    </button>
                  </div>
                </template>
                <template #header-actions>
                  <!-- 分屏切换按钮 -->
                  <div class="grid-switcher">
                    <button 
                      class="grid-btn" 
                      :class="{ active: gridMode === 9 }"
                      @click="gridMode = 9"
                    >
                      9屏
                    </button>
                    <button 
                      class="grid-btn" 
                      :class="{ active: gridMode === 16 }"
                      @click="gridMode = 16"
                    >
                      16屏
                    </button>
                    <button 
                      class="grid-btn" 
                      :class="{ active: gridMode === 25 }"
                      @click="gridMode = 25"
                    >
                      25屏
                    </button>
                  </div>
                </template>
                <template #header-bottom>
                  <!-- 小区切换按钮组 -->
                  <div class="community-buttons">
                    <button 
                      v-for="community in communities" 
                      :key="community.id"
                      class="community-btn"
                      :class="{ active: currentCommunity === community.id }"
                      @click="switchCommunity(community.id)"
                    >
                      <span class="community-name">{{ community.name }}</span>
                      <span class="camera-count">📹 {{ community.cameraCount }}</span>
                    </button>
                  </div>
                </template>
                <DeviceStatus 
                  :grid-mode="gridMode" 
                  :camera-count="getCurrentCommunity?.cameraCount || 9"
                  :community-name="getCurrentCommunity?.name || '小区1'"
                />
              </DataCard>
            </div>

            <!-- 右侧区域 - 报警列表 -->
            <div class="right-panel">
              <AlarmList 
                @test-alarm="showTestAlarm" 
                @alarm-click="showAlarmFromList"
              />
            </div>
          </template>
        </div>
      </div>
    </ScreenAdapter>

    <!-- 报警通知弹窗 -->
    <AlarmNotification
      :visible="showAlarmNotification"
      :alarm-type="currentAlarmData.type"
      :alarm-location="currentAlarmData.location"
      :alarm-time="currentAlarmData.time"
      :alarm-level="currentAlarmData.level"
      :alarm-id="currentAlarmData.alarmId"
      @close="closeAlarmNotification"
    />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import dayjs from 'dayjs'
import ScreenAdapter from '@/components/ScreenAdapter.vue'
import FullScreenButton from '@/components/FullScreenButton.vue'
import DataCard from '@/components/DataCard.vue'
import DeviceStatus from '@/components/charts/DeviceStatus.vue'
import MapChart from '@/components/charts/MapChart.vue'
import AlarmList from '@/components/charts/AlarmList.vue'
import AlarmNotification from '@/components/AlarmNotification.vue'
import { COMMUNITIES, type CommunityConfig } from '@/config/communities'
import { useAlarmData } from '@/composables/useAlarmData'

// 小区配置列表（使用统一的配置文件）
// 这样可以确保监控画面、报警列表、地图显示的小区信息完全一致
const communities = ref<CommunityConfig[]>(COMMUNITIES)

const currentTime = ref<string>('')
const currentMode = ref<'map' | 'monitor'>('map') // 当前模式：地图模式或监控模式
const gridMode = ref<9 | 16 | 25>(9) // 分屏模式：9屏、16屏、25屏
const currentCommunity = ref<number>(1) // 当前选中的小区ID

// 使用报警数据
const { globalAlarms } = useAlarmData()

// 报警弹窗状态
const showAlarmNotification = ref<boolean>(false)
const currentAlarmData = ref<{
  type: string
  location: string
  time: string
  level: 'danger' | 'warning'
  alarmId: string
}>({
  type: '',
  location: '',
  time: '',
  level: 'danger',
  alarmId: ''
})

// 已显示过的报警ID（避免重复弹窗）
const shownAlarms = new Set<string>()

// 监听报警数据变化，自动弹出未处置的新报警
watch(globalAlarms, (newAlarms) => {
  // 找到第一个未处置且未显示过的报警
  const newAlarm = newAlarms.find(alarm => {
    const alarmId = `${alarm.community}-${alarm.building}-${alarm.floor}-${alarm.time}`
    return alarm.status === 'pending' && !shownAlarms.has(alarmId)
  })
  
  if (newAlarm) {
    // 标记为已显示
    const alarmId = `${newAlarm.community}-${newAlarm.building}-${newAlarm.floor}-${newAlarm.time}`
    shownAlarms.add(alarmId)
    
    // 设置弹窗数据
    currentAlarmData.value = {
      type: newAlarm.title,
      location: newAlarm.location,
      time: newAlarm.time,
      level: newAlarm.level,
      alarmId: alarmId
    }
    
    // 显示弹窗
    showAlarmNotification.value = true
  }
}, { deep: true, immediate: true })

// 关闭报警弹窗
const closeAlarmNotification = (): void => {
  showAlarmNotification.value = false
}

// 显示报警列表中的报警详情弹窗
const showAlarmFromList = (alarm: any): void => {
  // 生成报警ID
  const alarmId = alarm.id || `${alarm.community}-${alarm.building}-${alarm.floor}-${alarm.time}`
  
  // 将报警数据转换为弹窗需要的格式
  currentAlarmData.value = {
    type: alarm.title,
    location: alarm.location,
    time: alarm.time,
    level: alarm.level,
    alarmId: alarmId
  }
  showAlarmNotification.value = true
}

// 显示测试报警弹窗（使用当前选中的小区信息，只从有摄像头的范围选择）
const showTestAlarm = (): void => {
  // 获取当前选中的小区信息
  const currentCommunityInfo = getCurrentCommunity.value
  
  if (!currentCommunityInfo) {
    console.warn('未找到当前小区信息')
    return
  }
  
  // 计算该小区实际有摄像头监控的楼栋和楼层范围
  const cameraCount = currentCommunityInfo.cameraCount
  const floorsPerBuilding = 5  // 每栋楼有5个楼层段
  
  // 完整监控的楼栋数
  const fullBuildingCount = Math.floor(cameraCount / floorsPerBuilding)
  // 最后一栋楼监控的楼层段数
  const lastBuildingFloorCount = cameraCount % floorsPerBuilding
  
  // 计算实际可用的楼栋数
  const availableBuildingCount = lastBuildingFloorCount > 0 ? fullBuildingCount + 1 : fullBuildingCount
  
  if (availableBuildingCount === 0) {
    console.warn('该小区没有可用的摄像头')
    return
  }
  
  // 从实际有摄像头监控的楼栋中随机选择
  const buildingIndex = Math.floor(Math.random() * availableBuildingCount)
  const randomBuilding = currentCommunityInfo.buildings[buildingIndex]
  
  // 根据选择的楼栋，确定可用的楼层段
  const floorRanges = [
    { id: 1, label: '1-5层' },
    { id: 2, label: '6-10层' },
    { id: 3, label: '11-15层' },
    { id: 4, label: '16-20层' },
    { id: 5, label: '21-25层' }
  ]
  
  let availableFloorRanges: typeof floorRanges
  if (buildingIndex < fullBuildingCount) {
    // 完整监控的楼栋，所有楼层段都可用
    availableFloorRanges = floorRanges
  } else {
    // 最后一栋楼，只有部分楼层段可用
    availableFloorRanges = floorRanges.slice(0, lastBuildingFloorCount)
  }
  
  // 从可用的楼层段中随机选择
  const randomFloorRange = availableFloorRanges[Math.floor(Math.random() * availableFloorRanges.length)]
  
  // 随机选择报警类型
  const alarmTypes = [
    { type: '🔥 火焰探测报警', level: 'danger' as const },
    { type: '🔥 烟雾浓度异常', level: 'danger' as const },
    { type: '🔥 温度超标报警', level: 'danger' as const },
    { type: '🔥 燃气泄漏报警', level: 'danger' as const },
    { type: '🪟 高空抛物报警', level: 'warning' as const },
    { type: '🪟 窗户玻璃破碎', level: 'warning' as const }
  ]
  const randomAlarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]
  
  // 生成当前时间
  const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  
  // 生成测试报警ID
  const testAlarmId = `test-${currentCommunityInfo.name}-${randomBuilding}-${randomFloorRange.id}-${currentTime}`
  
  // 设置弹窗数据（使用当前小区的真实监控范围信息）
  currentAlarmData.value = {
    type: randomAlarmType.type,
    location: `${currentCommunityInfo.name} ${randomBuilding}栋(${randomFloorRange.label})`,
    time: currentTime,
    level: randomAlarmType.level,
    alarmId: testAlarmId
  }
  
  showAlarmNotification.value = true
}

// 切换小区
const switchCommunity = (communityId: number): void => {
  currentCommunity.value = communityId
  // 不再自动调整分屏模式，保持用户选择的分屏模式
}

// 获取当前小区信息
const getCurrentCommunity = computed<CommunityConfig | undefined>(() => {
  return communities.value.find(c => c.id === currentCommunity.value)
})

let timer: number | null = null

const updateTime = (): void => {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.dashboard-page {
  width: 100%;
  height: 100%;
  background: $bg-dark;
}

.dashboard-content {
  width: 100%;
  height: 1080px;
  padding: 8px 20px 8px 20px;
  background: linear-gradient(180deg, #0a0e27 0%, #1a1f3a 100%);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(90deg, rgba(64, 158, 255, 0.03) 1px, transparent 1px),
      linear-gradient(rgba(64, 158, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
  }
}

.dashboard-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 50px;
  margin-bottom: 6px;
  flex-shrink: 0;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
  border-bottom: 2px solid rgba(64, 158, 255, 0.3);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
}

.dashboard-title {
  font-size: 40px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  gap: 20px;
  margin-left: auto;
  margin-right: 30px;
  
  .action-item {
    padding: 12px 28px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%);
    border: 1px solid rgba(64, 158, 255, 0.5);
    border-radius: 8px;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    
    &:hover {
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.4) 0%, rgba(102, 126, 234, 0.4) 100%);
      border-color: rgba(64, 158, 255, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
    }
  }
}

.current-time {
  font-size: 22px;
  color: #409EFF;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
  flex-shrink: 0;
  white-space: nowrap;
}

.mode-switcher-in-card {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 10px;
  padding: 10px 15px 12px 15px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.15);
  
  .mode-btn {
    padding: 10px 18px;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(102, 126, 234, 0.15) 100%);
    border: 2px solid rgba(64, 158, 255, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    flex: 1;
    min-width: 120px;
    text-align: center;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(64, 158, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    
    &:hover {
      border-color: rgba(64, 158, 255, 0.6);
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.25) 0%, rgba(102, 126, 234, 0.25) 100%);
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(64, 158, 255, 0.4);
      
      &::before {
        width: 300px;
        height: 300px;
      }
    }
    
    &.active {
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.5) 0%, rgba(102, 126, 234, 0.5) 100%);
      border-color: rgba(64, 158, 255, 0.9);
      box-shadow: 0 0 20px rgba(64, 158, 255, 0.6), inset 0 0 20px rgba(64, 158, 255, 0.3);
      transform: scale(1.05);
    }
  }
}

.function-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px 0;
  margin-top: 8px;
  border-top: 1px solid rgba(64, 158, 255, 0.15);
  
  .func-btn {
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%);
    border: 1px solid rgba(64, 158, 255, 0.4);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(64, 158, 255, 0.4);
      transform: translate(-50%, -50%);
      transition: width 0.5s, height 0.5s;
    }
    
    &:hover {
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.3) 0%, rgba(102, 126, 234, 0.3) 100%);
      border-color: rgba(64, 158, 255, 0.7);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
      
      &::before {
        width: 200px;
        height: 200px;
      }
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
    }
  }
}

.grid-switcher {
  display: flex;
  gap: 8px;
  align-items: center;
  
  .grid-btn {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(64, 158, 255, 0.1);
    border: 1.5px solid rgba(64, 158, 255, 0.3);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.3), transparent);
      transition: left 0.5s;
    }
    
    &:hover {
      color: #fff;
      background: rgba(64, 158, 255, 0.2);
      border-color: rgba(64, 158, 255, 0.5);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
      
      &::before {
        left: 100%;
      }
    }
    
    &.active {
      color: #fff;
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.4), rgba(102, 126, 234, 0.4));
      border-color: rgba(64, 158, 255, 0.8);
      box-shadow: 0 0 15px rgba(64, 158, 255, 0.5), inset 0 0 10px rgba(64, 158, 255, 0.2);
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
}

// 小区切换按钮样式
.community-buttons {
  display: flex;
  gap: 12px;
  padding: 0 0 8px 0;
  overflow-x: auto;
  overflow-y: hidden;
  flex-wrap: nowrap;
  position: relative;
  
  /* 下方分隔线 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(64, 158, 255, 0.3) 10%, 
      rgba(64, 158, 255, 0.6) 50%, 
      rgba(64, 158, 255, 0.3) 90%, 
      transparent 100%
    );
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
  }
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(64, 158, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(64, 158, 255, 0.4);
    border-radius: 3px;
    
    &:hover {
      background: rgba(64, 158, 255, 0.6);
    }
  }
  
  .community-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 8px 24px;
    min-width: 120px;
    flex-shrink: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    background: linear-gradient(135deg, rgba(20, 25, 45, 0.6), rgba(30, 35, 55, 0.6));
    border: 2px solid rgba(64, 158, 255, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.2), transparent);
      transition: left 0.6s ease;
    }
    
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 8px;
      padding: 2px;
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.3), rgba(102, 126, 234, 0.3));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .community-name {
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.5px;
      position: relative;
      z-index: 1;
    }
    
    .camera-count {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 500;
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    
    &:hover {
      color: #fff;
      background: linear-gradient(135deg, rgba(30, 35, 55, 0.8), rgba(40, 45, 65, 0.8));
      border-color: rgba(64, 158, 255, 0.6);
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
      
      &::before {
        left: 100%;
      }
      
      &::after {
        opacity: 1;
      }
      
      .camera-count {
        color: rgba(64, 158, 255, 0.9);
      }
    }
    
    &.active {
      color: #fff;
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.3), rgba(102, 126, 234, 0.3));
      border-color: rgba(64, 158, 255, 1);
      box-shadow: 0 0 25px rgba(64, 158, 255, 0.6), 
                  0 0 50px rgba(64, 158, 255, 0.3),
                  inset 0 0 20px rgba(64, 158, 255, 0.2);
      transform: scale(1.08);
      
      &::after {
        opacity: 1;
        animation: border-glow 2s ease-in-out infinite;
      }
      
      .community-name {
        text-shadow: 0 0 10px rgba(64, 158, 255, 0.8);
      }
      
      .camera-count {
        color: rgba(255, 255, 255, 0.95);
        text-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
      }
    }
    
    &:active {
      transform: scale(0.95);
      box-shadow: 0 2px 10px rgba(64, 158, 255, 0.4);
    }
  }
}

@keyframes border-glow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.dashboard-main {
  display: grid;
  gap: 6px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  
  // 地图模式：左侧地图 + 右侧报警列表（自适应宽度）
  &:has(.left-panel) {
    grid-template-columns: 2.8fr minmax(280px, 0.7fr);
  }
  
  // 监控模式：中间视频 + 右侧报警列表（自适应宽度）
  &:has(.monitor-panel) {
    grid-template-columns: 3.2fr minmax(280px, 0.7fr);
  }
  
  // 响应式适配
  @media (max-width: 1400px) {
    &:has(.left-panel),
    &:has(.monitor-panel) {
      grid-template-columns: 1.5fr 1fr;
    }
  }
  
  @media (max-width: 1024px) {
    &:has(.left-panel),
    &:has(.monitor-panel) {
      grid-template-columns: 1fr;
      grid-template-rows: 2fr 1fr;
    }
  }
}

.left-panel,
.monitor-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  
  > * {
    flex: 1;
    min-height: 0;
    min-width: 0;
  }
}

// 隐藏地图卡片的滚动条
.map-card {
  :deep(.card-body) {
    overflow: hidden !important;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>

