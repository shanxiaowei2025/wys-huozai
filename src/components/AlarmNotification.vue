<template>
  <Teleport to="body">
    <Transition name="alarm-slide">
      <div v-if="visible" class="alarm-notification-wrapper">
        <div class="alarm-notification" :class="`alarm-${alarmLevel}`">
          <!-- 顶部装饰条 -->
          <div class="top-decoration">
            <div class="decoration-line"></div>
            <div class="decoration-dots">
              <span></span><span></span><span></span>
            </div>
          </div>

          <!-- 报警图标 -->
          <div class="alarm-icon-container">
            <div class="alarm-icon-outer">
              <div class="alarm-icon-inner">
                <span class="alarm-emoji">{{ alarmIcon }}</span>
              </div>
            </div>
          </div>

          <!-- 报警内容 -->
          <div class="alarm-content">
            <!-- 第一行：报警类型 -->
            <div class="alarm-row alarm-type-row">
              <div class="row-label">报警类型</div>
              <div class="row-value alarm-type-value">{{ alarmType }}</div>
            </div>

            <!-- 第二行：报警地点 -->
            <div class="alarm-row alarm-location-row">
              <div class="row-label">报警地点</div>
              <div class="row-value alarm-location-value">{{ alarmLocation }}</div>
            </div>

            <!-- 第三行：报警时间 -->
            <div class="alarm-row alarm-time-row">
              <div class="row-label">报警时间</div>
              <div class="row-value alarm-time-value">{{ alarmTime }}</div>
            </div>

            <!-- 第四行：视频片段 -->
            <div class="alarm-row alarm-video-row">
              <div class="row-label">视频片段</div>
              <div class="video-container">
                <div class="video-loading">
                  <div class="loading-spinner"></div>
                  <div class="loading-text">正在加载视频...</div>
                  <div class="video-placeholder">
                    <div class="scan-line"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 第五行：操作按钮 -->
            <div class="alarm-actions-row">
              <button class="action-btn later-btn" @click="handleLater">
                <span class="btn-icon">⏰</span>
                <span class="btn-text">稍后处理</span>
              </button>
              <button class="action-btn now-btn" @click="handleNow">
                <span class="btn-icon">⚡</span>
                <span class="btn-text">现在处理</span>
              </button>
            </div>
          </div>

          <!-- 关闭按钮 -->
          <button class="close-btn" @click="close">
            <span>✕</span>
          </button>

          <!-- 底部动画条 -->
          <div class="bottom-progress"></div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 状态修改弹窗（独立传送到body，不受父组件影响） -->
  <Teleport to="body">
    <el-dialog
      v-model="showStatusSelector"
      title="修改报警状态"
      width="500px"
      :close-on-click-modal="false"
      :z-index="10000"
      destroy-on-close
      class="status-dialog"
    >
      <div class="status-dialog-content">
        <div class="alarm-info">
          <div class="info-row">
            <span class="label">报警类型：</span>
            <span class="value">{{ alarmType }}</span>
          </div>
          <div class="info-row">
            <span class="label">报警位置：</span>
            <span class="value">{{ alarmLocation }}</span>
          </div>
          <div class="info-row">
            <span class="label">报警时间：</span>
            <span class="value">{{ alarmTime }}</span>
          </div>
        </div>

        <div class="status-selector">
          <div class="selector-label">选择新状态：</div>
          <div class="status-options">
            <div 
              v-for="status in statusOptions" 
              :key="status.value"
              class="status-option"
              :class="{ active: selectedStatus === status.value }"
              @click="selectedStatus = status.value"
            >
              <div class="status-icon">{{ status.icon }}</div>
              <div class="status-name">{{ status.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showStatusSelector = false">取消</el-button>
          <el-button type="primary" @click="confirmStatusChange">确认修改</el-button>
        </div>
      </template>
    </el-dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useAlarmData } from '@/composables/useAlarmData'

// 定义 props
interface Props {
  visible: boolean
  alarmType: string      // 报警类型（带emoji）
  alarmLocation: string  // 报警地点（小区 + 楼栋 + 层数）
  alarmTime: string      // 报警时间
  alarmLevel: 'danger' | 'warning'  // 报警级别
  alarmId?: string       // 报警ID（用于修改状态）
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  alarmType: '',
  alarmLocation: '',
  alarmTime: '',
  alarmLevel: 'danger',
  alarmId: ''
})

// 定义 emits
const emit = defineEmits<{
  (e: 'close'): void
}>()

// 使用报警数据管理
const { globalAlarms } = useAlarmData()

// 状态选择器显示控制
const showStatusSelector = ref(false)
const selectedStatus = ref<'pending' | 'processing' | 'resolved'>('processing')


// 状态选项
const statusOptions = [
  { value: 'pending' as 'pending', label: '未处置', icon: '🔴' },
  { value: 'processing' as 'processing', label: '处置中', icon: '🟡' },
  { value: 'resolved' as 'resolved', label: '已处置', icon: '🟢' }
]

// 处理"稍后处理"按钮
const handleLater = () => {
  close()
}

// 处理"现在处理"按钮
const handleNow = () => {
  // 先显示状态修改弹窗
  showStatusSelector.value = true
  selectedStatus.value = 'processing'
  // 然后关闭报警通知弹窗
  emit('close')
}

// 确认状态修改
const confirmStatusChange = () => {
  // 使用报警内容来查找，更可靠
  const alarm = globalAlarms.value.find(a => 
    a.title === props.alarmType && 
    a.location === props.alarmLocation && 
    a.time === props.alarmTime
  )

  if (alarm) {
    alarm.status = selectedStatus.value
    
    const statusText = statusOptions.find(s => s.value === selectedStatus.value)?.label || '未知'
    ElMessage.success(`状态已更新为：${statusText}`)
    
    // 只关闭状态修改弹窗（报警通知已在点击"现在处理"时关闭）
    showStatusSelector.value = false
  } else {
    ElMessage.error('未找到对应的报警记录')
  }
}

// 根据报警级别显示不同的图标
const alarmIcon = computed(() => {
  return props.alarmLevel === 'danger' ? '🔥' : '🪟'
})

// 关闭报警通知弹窗
const close = () => {
  // 不重置状态选择器，因为它可能是独立显示的
  emit('close')
}

// 播放提示音
const playAlertSound = () => {
  try {
    // 使用 Web Audio API 生成提示音
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // 创建三次"哔哔"声
    const beepCount = 3
    const beepDuration = 0.15  // 每次哔声持续时间
    const beepInterval = 0.2   // 哔声间隔
    
    for (let i = 0; i < beepCount; i++) {
      const startTime = audioContext.currentTime + (i * beepInterval)
      
      // 创建振荡器（音调发生器）
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      // 设置音调频率（危险级别用更高的频率）
      oscillator.frequency.value = props.alarmLevel === 'danger' ? 880 : 660  // A5 或 E5
      oscillator.type = 'sine'  // 正弦波，声音更柔和
      
      // 设置音量包络（淡入淡出效果）
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)  // 淡入
      gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration)  // 淡出
      
      // 连接节点
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // 播放
      oscillator.start(startTime)
      oscillator.stop(startTime + beepDuration)
    }
  } catch (error) {
    console.warn('无法播放提示音:', error)
  }
}

// 自动关闭（10秒后）
let autoCloseTimer: number | null = null

watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 播放提示音
    playAlertSound()
    
    // 清除之前的定时器
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
    }
    // 10秒后自动关闭
    autoCloseTimer = window.setTimeout(() => {
      close()
    }, 10000)
  } else {
    // 弹窗关闭时清除定时器
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
      autoCloseTimer = null
    }
  }
})
</script>

<style lang="scss" scoped>
// 弹窗容器
.alarm-notification-wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  pointer-events: auto;
}

// 报警弹窗
.alarm-notification {
  width: 550px;
  background: linear-gradient(135deg, rgba(10, 15, 30, 0.95), rgba(20, 25, 45, 0.95));
  border-radius: 16px;
  padding: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  
  // 火灾报警样式
  &.alarm-danger {
    border: 2px solid rgba(245, 108, 108, 0.5);
    box-shadow: 
      0 20px 60px rgba(245, 108, 108, 0.3),
      0 0 40px rgba(245, 108, 108, 0.2),
      0 0 0 1px rgba(245, 108, 108, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
    .alarm-icon-outer {
      background: radial-gradient(circle, rgba(245, 108, 108, 0.3), transparent);
      box-shadow: 0 0 30px rgba(245, 108, 108, 0.5);
    }
    
    .alarm-icon-inner {
      background: linear-gradient(135deg, rgba(245, 108, 108, 0.8), rgba(220, 38, 38, 0.8));
      box-shadow: 
        0 0 20px rgba(245, 108, 108, 0.8),
        inset 0 0 20px rgba(255, 255, 255, 0.2);
      animation: dangerPulse 2s infinite;
    }
  }
  
  // 高空抛物报警样式
  &.alarm-warning {
    border: 2px solid rgba(230, 162, 60, 0.5);
    box-shadow: 
      0 20px 60px rgba(230, 162, 60, 0.3),
      0 0 40px rgba(230, 162, 60, 0.2),
      0 0 0 1px rgba(230, 162, 60, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
    .alarm-icon-outer {
      background: radial-gradient(circle, rgba(230, 162, 60, 0.3), transparent);
      box-shadow: 0 0 30px rgba(230, 162, 60, 0.5);
    }
    
    .alarm-icon-inner {
      background: linear-gradient(135deg, rgba(230, 162, 60, 0.8), rgba(217, 119, 6, 0.8));
      box-shadow: 
        0 0 20px rgba(230, 162, 60, 0.8),
        inset 0 0 20px rgba(255, 255, 255, 0.2);
      animation: warningPulse 2s infinite;
    }
  }
}

// 顶部装饰
.top-decoration {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.2);
  background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.1), transparent);
}

.decoration-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.5), transparent);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(64, 158, 255, 0.8), transparent);
    animation: scanLine 2s infinite;
  }
}

.decoration-dots {
  display: flex;
  gap: 6px;
  margin-left: 12px;
  
  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(64, 158, 255, 0.6);
    animation: dotBlink 1.5s infinite;
    
    &:nth-child(2) {
      animation-delay: 0.5s;
    }
    
    &:nth-child(3) {
      animation-delay: 1s;
    }
  }
}

// 报警图标
.alarm-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0 20px;
}

.alarm-icon-outer {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.alarm-icon-inner {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.alarm-emoji {
  font-size: 48px;
  animation: iconFloat 3s ease-in-out infinite;
}

// 报警内容
.alarm-content {
  padding: 0 24px 24px;
}

.alarm-row {
  padding: 16px;
  margin-bottom: 12px;
  background: rgba(64, 158, 255, 0.05);
  border-left: 4px solid rgba(64, 158, 255, 0.5);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: rgba(64, 158, 255, 0.1);
    transform: translateX(4px);
    
    &::before {
      left: 100%;
    }
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.row-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.row-value {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.alarm-type-value {
  font-size: 20px;
  color: #F56C6C;
  text-shadow: 0 0 10px rgba(245, 108, 108, 0.5);
}

.alarm-location-value {
  color: #409EFF;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

.alarm-time-value {
  font-family: 'Courier New', monospace;
  color: #67C23A;
  text-shadow: 0 0 10px rgba(103, 194, 58, 0.5);
}

// 视频行样式
.alarm-video-row {
  margin-top: 20px;
  
  .row-label {
    margin-bottom: 12px;
  }
}

// 视频容器
.video-container {
  width: 100%;
  height: 200px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(64, 158, 255, 0.3);
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
}

// 视频加载状态
.video-loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

// 加载动画
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(64, 158, 255, 0.2);
  border-top-color: #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
  z-index: 2;
  position: relative;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 加载文字
.loading-text {
  color: #409EFF;
  font-size: 14px;
  letter-spacing: 1px;
  z-index: 2;
  position: relative;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
  animation: textPulse 2s ease-in-out infinite;
}

@keyframes textPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

// 视频占位符
.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    repeating-linear-gradient(
      0deg,
      rgba(64, 158, 255, 0.03) 0px,
      rgba(64, 158, 255, 0.03) 2px,
      transparent 2px,
      transparent 4px
    );
  z-index: 1;
}

// 扫描线动画
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(64, 158, 255, 0.8),
    transparent
  );
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.8);
  animation: scan 3s linear infinite;
}

@keyframes scan {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(200px);
  }
}

// 操作按钮行
.alarm-actions-row {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(64, 158, 255, 0.2);
}

// 操作按钮
.action-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  .btn-icon {
    font-size: 18px;
  }
  
  .btn-text {
    letter-spacing: 0.5px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover::before {
    width: 300px;
    height: 300px;
  }
}

// 稍后处理按钮
.later-btn {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.8), rgba(96, 98, 102, 0.8));
  border: 1px solid rgba(144, 147, 153, 0.5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(144, 147, 153, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, rgba(144, 147, 153, 1), rgba(96, 98, 102, 1));
    border-color: rgba(144, 147, 153, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(144, 147, 153, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// 现在处理按钮
.now-btn {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.8), rgba(30, 128, 255, 0.8));
  border: 1px solid rgba(64, 158, 255, 0.5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, rgba(64, 158, 255, 1), rgba(30, 128, 255, 1));
    border-color: rgba(64, 158, 255, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// 关闭按钮
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(245, 108, 108, 0.8);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 0 20px rgba(245, 108, 108, 0.8);
  }
}

// 底部进度条
.bottom-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 100%;
  background: rgba(64, 158, 255, 0.2);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, 
      rgba(64, 158, 255, 0.8), 
      rgba(103, 194, 58, 0.8)
    );
    animation: progressBar 10s linear;
  }
}

// 动画定义
@keyframes dangerPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(245, 108, 108, 0.8);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 40px rgba(245, 108, 108, 1);
    transform: scale(1.05);
  }
}

@keyframes warningPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(230, 162, 60, 0.8);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 40px rgba(230, 162, 60, 1);
    transform: scale(1.05);
  }
}

@keyframes scanLine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes dotBlink {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes progressBar {
  0% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
}

// 过渡动画（中间位置缩放淡入）
.alarm-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.alarm-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.alarm-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.alarm-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

// 状态修改弹窗样式
.status-dialog {
  z-index: 10000 !important;
}

:deep(.status-dialog) {
  .el-dialog {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 10000;
  }

  .el-dialog__header {
    border-bottom: 1px solid #e5e7eb;
    padding: 20px 24px;
    
    .el-dialog__title {
      color: #409EFF;
      font-size: 20px;
      font-weight: 600;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    border-top: 1px solid #e5e7eb;
    padding: 16px 24px;
  }
}

.status-dialog-content {
  .alarm-info {
    background: linear-gradient(135deg, #5a6c7d 0%, #556575 100%);
    border-left: 4px solid #409EFF;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;

    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #67C5FF;
        font-size: 15px;
        font-weight: 500;
        min-width: 90px;
      }

      .value {
        color: #fff;
        font-size: 15px;
        font-weight: 400;
      }
    }
  }

  .status-selector {
    .selector-label {
      color: #409EFF;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .status-options {
      display: flex;
      gap: 16px;
    }

    .status-option {
      flex: 1;
      background: #f5f5f5;
      border: none;
      border-radius: 12px;
      padding: 20px 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .status-icon {
        font-size: 28px;
        margin-bottom: 8px;
        display: none;
      }

      .status-name {
        color: #666;
        font-size: 16px;
        font-weight: 500;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      // 未处置 - 红色
      &:nth-child(1) {
        background: linear-gradient(135deg, #ffc5c5 0%, #ffb3b3 100%);
        
        .status-name {
          color: #e74c3c;
        }
        
        &.active {
          background: linear-gradient(135deg, #ff9999 0%, #ff8080 100%);
          box-shadow: 0 4px 16px rgba(231, 76, 60, 0.4);
          transform: translateY(-2px) scale(1.02);
        }
      }

      // 处置中 - 黄色
      &:nth-child(2) {
        background: linear-gradient(135deg, #fff4d9 0%, #ffe8b3 100%);
        
        .status-name {
          color: #f39c12;
        }
        
        &.active {
          background: linear-gradient(135deg, #ffd966 0%, #ffcc33 100%);
          box-shadow: 0 4px 16px rgba(243, 156, 18, 0.4);
          transform: translateY(-2px) scale(1.02);
        }
      }

      // 已处置 - 绿色
      &:nth-child(3) {
        background: linear-gradient(135deg, #d4f4dd 0%, #b8f0c8 100%);
        
        .status-name {
          color: #27ae60;
        }
        
        &.active {
          background: linear-gradient(135deg, #90ee90 0%, #7ce87c 100%);
          box-shadow: 0 4px 16px rgba(39, 174, 96, 0.4);
          transform: translateY(-2px) scale(1.02);
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;

  :deep(.el-button) {
    padding: 10px 32px;
    font-size: 15px;
    border-radius: 6px;
    font-weight: 500;

    &:first-child {
      background: #e0e0e0;
      border-color: #e0e0e0;
      color: #666;

      &:hover {
        background: #d0d0d0;
        border-color: #d0d0d0;
      }
    }

    &.el-button--primary {
      background: linear-gradient(135deg, #50b5ff 0%, #409EFF 100%);
      border-color: #409EFF;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);

      &:hover {
        background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
      }
    }
  }
}
</style>

