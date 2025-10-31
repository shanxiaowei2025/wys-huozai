<template>
  <div class="video-container">
    <div 
      class="video-grid"
      :style="{
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`
      }"
    >
      <div 
        v-for="video in videos" 
        :key="video.id"
        class="video-item"
        :class="{ 
          'status-pending': video.status === 'pending', 
          'status-processing': video.status === 'processing',
          'status-resolved': video.status === 'resolved'
        }"
        @dblclick="expandVideo(video)"
      >
        <div class="video-header">
          <span class="video-label" :class="{
            'pending-label': video.status === 'pending',
            'processing-label': video.status === 'processing',
            'resolved-label': video.status === 'resolved'
          }">
            {{ getVideoIcon(video) }}
            {{ video.name }}
          </span>
        </div>
        <div class="video-content">
          <div class="camera-icon">📹</div>
          <div class="video-placeholder"></div>
          <div class="dblclick-hint">双击放大</div>
        </div>
      </div>
    </div>

    <!-- 全屏视频显示 -->
    <Teleport to="body">
      <Transition name="fullscreen">
        <div v-if="expandedVideo" class="fullscreen-overlay" @click="closeFullscreen">
          <div class="fullscreen-video" @click.stop>
            <div class="fullscreen-header">
              <div class="fullscreen-title">
                <span class="fullscreen-icon" :class="{
                  'pending-icon': expandedVideo.status === 'pending',
                  'processing-icon': expandedVideo.status === 'processing',
                  'resolved-icon': expandedVideo.status === 'resolved'
                }">
                  {{ getVideoIcon(expandedVideo) }}
                </span>
                <span>{{ expandedVideo.name }}</span>
                <span class="fullscreen-location">{{ expandedVideo.location }}</span>
              </div>
              <button class="close-btn" @click="closeFullscreen" title="关闭 (Esc)">
                <span>✕</span>
              </button>
            </div>
            <div class="fullscreen-content">
              <div class="camera-icon-large">📹</div>
              <div class="video-placeholder"></div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useAlarmData } from '@/composables/useAlarmData'
import { getCommunityByName, FLOOR_RANGES } from '@/config/communities'

interface Video {
  id: number
  name: string
  location: string
  status: 'normal' | 'pending' | 'processing' | 'resolved'
}

interface Props {
  gridMode?: 9 | 16 | 25
  cameraCount?: number
  communityName?: string
}

const props = withDefaults(defineProps<Props>(), {
  gridMode: 9,
  cameraCount: 9,
  communityName: '小区1'
})

// 使用共享的报警数据
const { getCommunityAlarm } = useAlarmData()

// 生成视频数据 - 从统一配置中获取楼栋号和楼层信息
const generateVideos = (count: number): Video[] => {
  // 获取当前小区的配置信息（从统一配置文件）
  const communityConfig = getCommunityByName(props.communityName)
  
  // 如果找不到小区配置，返回空数组
  if (!communityConfig) {
    console.warn(`未找到小区配置: ${props.communityName}`)
    return []
  }
  
  // 获取当前小区的报警信息
  const communityAlarm = getCommunityAlarm(props.communityName)
  
  // 如果有报警信息，找到对应的楼栋
  let alarmBuilding = ''
  let alarmStatus: 'normal' | 'pending' | 'processing' | 'resolved' = 'normal'
  let targetFloorId = 1
  
  if (communityAlarm) {
    // 使用报警的处理状态而不是级别
    alarmStatus = communityAlarm.status
    targetFloorId = communityAlarm.floor  // 楼层段ID（1-5）
    alarmBuilding = communityAlarm.building  // 楼栋号（字符串）
  }
  
  const videos: Video[] = []
  
  // 从小区配置中获取楼栋列表（确保数据同步）
  const buildings = communityConfig.buildings
  
  // 每栋楼按楼层顺序分配摄像头（1-5层、6-10层、11-15层、16-20层、21-25层）
  // 先完成1栋的所有楼层，再到2栋，以此类推
  let currentBuildingIndex = 0
  let currentFloorIndex = 0
  
  for (let i = 0; i < count; i++) {
    // 当前楼栋号
    const buildingNum = buildings[currentBuildingIndex]
    
    // 当前楼层段（从FLOOR_RANGES中按顺序获取）
    const floorRange = FLOOR_RANGES[currentFloorIndex]
    let floorId = floorRange.id
    let status: 'normal' | 'pending' | 'processing' | 'resolved' = 'normal'
    
    // 如果当前摄像头对应报警的楼栋和楼层，设置报警状态
    if (alarmBuilding && buildingNum === alarmBuilding && floorId === targetFloorId) {
      status = alarmStatus
    }
    
    videos.push({
      id: i + 1,
      name: `${buildingNum}栋（${floorRange.label}）`,
      location: `${buildingNum}栋${floorRange.label}`,
      status: status
    })
    
    // 移动到下一个楼层段
    currentFloorIndex++
    
    // 如果当前楼栋的所有楼层段都分配完了，移动到下一栋楼
    if (currentFloorIndex >= FLOOR_RANGES.length) {
      currentFloorIndex = 0  // 重置楼层索引
      currentBuildingIndex++  // 移动到下一栋楼
      
      // 如果所有楼栋都分配完了，重新从第一栋开始
      if (currentBuildingIndex >= buildings.length) {
        currentBuildingIndex = 0
      }
    }
  }
  return videos
}

// 根据摄像头数量计算视频列表
const videos = computed(() => {
  return generateVideos(props.cameraCount)
})

// 获取视频图标
const getVideoIcon = (video: Video): string => {
  if (video.status === 'normal') return ''
  
  // 获取当前小区的报警信息，根据报警类型显示对应图标
  const communityAlarm = getCommunityAlarm(props.communityName)
  
  if (communityAlarm) {
    // 根据报警标题判断图标类型
    if (communityAlarm.title.includes('🔥')) {
      return '🔥'
    } else if (communityAlarm.title.includes('🪟')) {
      return '🪟'
    }
  }
  
  // 默认图标 - 根据报警级别
  return '🔥' // 默认显示火灾图标
}

// 计算网格列数（不再计算行数，让它自动增长）
const gridColumns = computed(() => {
  if (props.gridMode === 9) return 3
  if (props.gridMode === 16) return 4
  return 5
})

// 全屏视频状态
const expandedVideo = ref<Video | null>(null)

// 展开视频
const expandVideo = (video: Video) => {
  expandedVideo.value = video
}

// 关闭全屏
const closeFullscreen = () => {
  expandedVideo.value = null
}

// 键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && expandedVideo.value) {
    closeFullscreen()
  }
}

// 生命周期
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.video-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
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
}

.video-grid {
  width: 100%;
  display: grid;
  gap: 4px;
  padding: 3px;
  align-content: start;
}

.video-item {
  background: rgba(20, 25, 45, 0.8);
  border: 1.5px solid rgba(64, 158, 255, 0.3);
  border-radius: 5px;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  aspect-ratio: 16 / 8.5; // 使用更扁平的宽高比，节省垂直空间

  &:hover {
    transform: scale(1.02);
    border-color: rgba(64, 158, 255, 0.6);
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
    
    .dblclick-hint {
      opacity: 1;
    }
  }

  // 未处置状态 - 红色
  &.status-pending {
    border-color: #F56C6C;
    animation: pendingBlink 1.5s infinite;
    
    .video-header {
      background: rgba(245, 108, 108, 0.2);
    }
  }

  // 处置中状态 - 橙色
  &.status-processing {
    border-color: #E6A23C;
    
    .video-header {
      background: rgba(230, 162, 60, 0.2);
    }
  }

  // 已处置状态 - 绿色
  &.status-resolved {
    border-color: #67c23a;
    
    .video-header {
      background: rgba(103, 194, 58, 0.2);
    }
  }
}

// 未处置状态闪烁动画
@keyframes pendingBlink {
  0%, 100% {
    border-color: #F56C6C;
    box-shadow: 0 0 10px rgba(245, 108, 108, 0.5);
  }
  50% {
    border-color: rgba(245, 108, 108, 0.5);
    box-shadow: 0 0 20px rgba(245, 108, 108, 0.8);
  }
}

.video-header {
  padding: 4px 6px;
  background: rgba(64, 158, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.video-label {
  font-size: 11px;
  color: #fff;
  font-weight: 600;
  
  // 未处置 - 红色
  &.pending-label {
    color: #F56C6C;
  }
  
  // 处置中 - 橙色
  &.processing-label {
    color: #E6A23C;
  }
  
  // 已处置 - 绿色
  &.resolved-label {
    color: #67c23a;
  }
}

.video-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 14, 39, 0.6);
  position: relative;
  min-height: 0;
}

.camera-icon {
  font-size: 24px;
  opacity: 0.3;
  position: absolute;
  z-index: 1;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, rgba(64, 158, 255, 0.03) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(64, 158, 255, 0.03) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(64, 158, 255, 0.03) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(64, 158, 255, 0.03) 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
}

.dblclick-hint {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 10px;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
  backdrop-filter: blur(4px);
}

// 全屏遮罩层
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

// 全屏视频容器
.fullscreen-video {
  width: 90vw;
  height: 85vh;
  max-width: 1600px;
  background: rgba(20, 25, 45, 0.95);
  border: 2px solid rgba(64, 158, 255, 0.5);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.8);
}

// 全屏视频头部
.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(64, 158, 255, 0.1);
  border-bottom: 1px solid rgba(64, 158, 255, 0.3);
  flex-shrink: 0;
}

.fullscreen-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  
  .fullscreen-icon {
    font-size: 24px;
    
    // 未处置 - 红色，带闪烁
    &.pending-icon {
      animation: pulse 1s infinite;
      color: #F56C6C;
    }
    
    // 处置中 - 橙色
    &.processing-icon {
      color: #E6A23C;
      opacity: 0.9;
    }
    
    // 已处置 - 绿色
    &.resolved-icon {
      color: #67c23a;
      opacity: 0.9;
    }
  }
  
  .fullscreen-location {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
    margin-left: 8px;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 108, 108, 0.2);
  border: 1px solid rgba(245, 108, 108, 0.5);
  border-radius: 8px;
  color: #F56C6C;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(245, 108, 108, 0.3);
    border-color: #F56C6C;
    transform: rotate(90deg);
  }
  
  &:active {
    transform: rotate(90deg) scale(0.95);
  }
}

// 全屏视频内容
.fullscreen-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 14, 39, 0.6);
  position: relative;
  min-height: 0;
}

.camera-icon-large {
  font-size: 80px;
  opacity: 0.2;
  position: absolute;
  z-index: 1;
}

// 过渡动画
.fullscreen-enter-active,
.fullscreen-leave-active {
  transition: all 0.3s ease;
}

.fullscreen-enter-from,
.fullscreen-leave-to {
  opacity: 0;
  
  .fullscreen-video {
    transform: scale(0.9);
  }
}

.fullscreen-enter-to,
.fullscreen-leave-from {
  opacity: 1;
  
  .fullscreen-video {
    transform: scale(1);
  }
}
</style>

