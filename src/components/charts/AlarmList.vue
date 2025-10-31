<template>
  <div class="alarm-list-container">
    <!-- 列表标题 -->
    <div class="alarm-list-header">
      <div class="header-left">
        <span class="header-icon">📋</span>
        <span class="header-title">实时报警列表</span>
      </div>
      <button class="test-alarm-btn" @click="testAlarm">
        🔔 测试报警
      </button>
    </div>
    
    <!-- 报警列表 -->
    <div class="alarm-list">
      <div 
        v-for="(alarm, index) in sortedAlarms" 
        :key="alarm.id" 
        class="alarm-item"
        :class="`status-${alarm.status}`"
      >
        <div class="alarm-left-bar" :class="`bar-${alarm.status}`"></div>
        <div class="alarm-content" @click="handleAlarmClick(alarm)">
          <div class="alarm-title">{{ alarm.title }}</div>
          <div class="alarm-location">{{ alarm.location }}</div>
          <div class="alarm-bottom">
            <div class="alarm-time">{{ alarm.time }}</div>
            <span class="status-tag" :class="`status-${alarm.status}`">
              {{ getStatusText(alarm.status) }}
            </span>
          </div>
        </div>
        <div class="alarm-actions">
          <button 
            class="status-change-button" 
            @click.stop="openStatusDialog(alarm)"
          >
            修改状态
          </button>
        </div>
      </div>
    </div>

    <!-- 状态修改对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="修改报警状态"
      :width="500"
      class="status-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-content" v-if="currentAlarm">
        <div class="alarm-info">
          <div class="info-item">
            <span class="info-label">报警类型：</span>
            <span class="info-value">
              <span v-if="currentAlarm.title.includes('火灾')">🔥</span>
              <span v-else-if="currentAlarm.title.includes('抛物')">📋</span>
              <span v-else>🔥</span>
              {{ currentAlarm.title }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">报警位置：</span>
            <span class="info-value">{{ currentAlarm.location }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">报警时间：</span>
            <span class="info-value">{{ currentAlarm.time }}</span>
          </div>
        </div>

        <div class="status-selection">
          <div class="selection-label">选择新状态：</div>
          <div class="status-buttons">
            <button 
              class="status-option-btn"
              :class="['status-pending', { active: selectedStatus === 'pending' }]"
              @click="selectedStatus = 'pending'"
            >
              未处置
            </button>
            <button 
              class="status-option-btn"
              :class="['status-processing', { active: selectedStatus === 'processing' }]"
              @click="selectedStatus = 'processing'"
            >
              处置中
            </button>
            <button 
              class="status-option-btn"
              :class="['status-resolved', { active: selectedStatus === 'resolved' }]"
              @click="selectedStatus = 'resolved'"
            >
              已处置
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="dialogVisible = false">取消</button>
          <button class="confirm-btn" @click="confirmStatusChange">确认修改</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useAlarmData } from '@/composables/useAlarmData'

// 定义事件
const emit = defineEmits<{
  (e: 'test-alarm'): void
  (e: 'alarm-click', alarm: any): void
}>()

// 使用共享的报警数据
const { globalAlarms } = useAlarmData()

// 测试报警按钮点击事件
const testAlarm = () => {
  emit('test-alarm')
}

// 对话框相关状态
const dialogVisible = ref(false)
const currentAlarm = ref<any>(null)
const selectedStatus = ref<'pending' | 'processing' | 'resolved'>('pending')

// 转换为兼容的格式并添加唯一ID
const alarms = computed(() => {
  return globalAlarms.value.map((alarm, index) => ({
    id: `alarm-${index}-${alarm.time}`,
    title: alarm.title,
    location: alarm.location,
    time: alarm.time,
    level: alarm.level,
    status: alarm.status,
    community: alarm.community,
    building: alarm.building,
    floor: alarm.floor
  }))
})

// 按时间倒序排列（最新的在前）
const sortedAlarms = computed(() => {
  return [...alarms.value].sort((a, b) => {
    return new Date(b.time).getTime() - new Date(a.time).getTime()
  })
})

// 获取报警图标
const getAlarmIcon = (alarm: any) => {
  if (alarm.title.includes('火灾') && !alarm.title.includes('误报')) {
    return '🔥'
  } else if (alarm.title.includes('高空抛物')) {
    return '🏢'
  } else if (alarm.title.includes('误报')) {
    return '✅'
  }
  return '⚠️'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '未处置',
    'processing': '处置中',
    'resolved': '已处置'
  }
  return statusMap[status] || '未知'
}

// 处理报警点击事件
const handleAlarmClick = (alarm: any) => {
  // 发出点击事件，让父组件显示报警弹窗
  emit('alarm-click', alarm)
  
  // 这里可以添加联动视频和地图的逻辑
  console.log('联动报警:', alarm)
}

// 打开状态修改对话框
const openStatusDialog = (alarm: any) => {
  currentAlarm.value = alarm
  selectedStatus.value = alarm.status
  dialogVisible.value = true
}

// 确认修改状态
const confirmStatusChange = () => {
  if (!currentAlarm.value) return
  
  // 在全局数据中找到对应的报警项并修改状态
  const alarmItem = globalAlarms.value.find(item => 
    item.title === currentAlarm.value.title && 
    item.location === currentAlarm.value.location && 
    item.time === currentAlarm.value.time
  )
  
  if (alarmItem) {
    alarmItem.status = selectedStatus.value
    const statusTextMap: Record<string, string> = {
      'pending': '已标记为未处置',
      'processing': '已开始处置',
      'resolved': '已处置完成'
    }
    ElMessage.success(statusTextMap[selectedStatus.value] || '状态已更新')
    dialogVisible.value = false
  }
}
</script>

<style lang="scss" scoped>
.alarm-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(10, 14, 39, 0.8);
  border-radius: 8px;
  overflow: hidden;
}

.alarm-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px;
  background: rgba(64, 158, 255, 0.1);
  border-bottom: 1px solid rgba(64, 158, 255, 0.2);
  flex-shrink: 0;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .header-icon {
    font-size: 22px;
    color: #a0aec0;
  }
  
  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: #409EFF;
    letter-spacing: 0.5px;
  }
}

// 测试报警按钮
.test-alarm-btn {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.8), rgba(220, 38, 38, 0.8));
  border: 1px solid rgba(245, 108, 108, 0.5);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
  
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
  
  &:hover {
    background: linear-gradient(135deg, rgba(245, 108, 108, 1), rgba(220, 38, 38, 1));
    border-color: rgba(245, 108, 108, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(245, 108, 108, 0.5);
    
    &::before {
      width: 200px;
      height: 200px;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.4);
  }
}

.alarm-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 8px;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(64, 158, 255, 0.3);
    border-radius: 2px;
    
    &:hover {
      background: rgba(64, 158, 255, 0.5);
    }
  }
}

.alarm-item {
  background: rgba(30, 35, 55, 0.9);
  border-radius: 10px;
  padding: 12px 8px 12px 18px;
  display: flex;
  align-items: stretch;
  gap: 8px;
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease-out;
  flex-shrink: 0;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
  border: 1px solid rgba(64, 158, 255, 0.1);
  min-height: 85px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    background: rgba(30, 35, 55, 1);
    border-color: rgba(64, 158, 255, 0.3);
  }

  // 根据状态设置左侧条和标题颜色
  &.status-pending {
    .alarm-left-bar {
      background: #F56C6C;
    }
    
    .alarm-title {
      color: #F56C6C;
    }
  }

  &.status-processing {
    .alarm-left-bar {
      background: #E6A23C;
    }
    
    .alarm-title {
      color: #E6A23C;
    }
  }
  
  &.status-resolved {
    .alarm-left-bar {
      background: #67c23a;
    }
    
    .alarm-title {
      color: #67c23a;
    }
  }
}

.alarm-left-bar {
  width: 8px;
  height: 100%;
  border-radius: 4px;
  flex-shrink: 0;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
}

.alarm-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}

.alarm-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 85px;
  
  .status-change-button {
    padding: 8px 14px;
    border-radius: 6px;
    border: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

.alarm-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.alarm-location {
  font-size: 13px;
  color: #cbd5e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.alarm-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 1px;
}

.alarm-time {
  font-size: 12px;
  color: #a0aec0;
  white-space: nowrap;
  line-height: 1.3;
}

.status-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  min-width: 55px;
  text-align: center;
  
  &.status-pending {
    background: #F56C6C;
    color: #fff;
    border: 1px solid #F56C6C;
  }
  
  &.status-processing {
    background: #E6A23C;
    color: #fff;
    border: 1px solid #E6A23C;
  }
  
  &.status-resolved {
    background: #67c23a;
    color: #fff;
    border: 1px solid #67c23a;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 对话框样式
:deep(.status-dialog) {
  .el-dialog {
    background: linear-gradient(135deg, rgba(20, 30, 48, 0.98) 0%, rgba(36, 59, 85, 0.98) 100%);
    border: 2px solid rgba(64, 158, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  }

  .el-dialog__header {
    border-bottom: 1px solid rgba(64, 158, 255, 0.2);
    padding: 20px 24px;
  }

  .el-dialog__title {
    color: #00d4ff;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .el-dialog__close {
    color: #fff;
    font-size: 20px;
    
    &:hover {
      color: #00d4ff;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 0 24px 20px;
    border-top: 1px solid rgba(64, 158, 255, 0.2);
  }
}

.dialog-content {
  .alarm-info {
    background: rgba(10, 20, 40, 0.6);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-left: 4px solid #00d4ff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 14px;
    font-size: 15px;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .info-label {
    color: #00d4ff;
    font-weight: 600;
    min-width: 90px;
    font-size: 15px;
  }

  .info-value {
    color: #fff;
    flex: 1;
    font-size: 15px;
  }

  .status-selection {
    .selection-label {
      color: #00d4ff;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .status-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .status-option-btn {
      padding: 16px 20px;
      border-radius: 10px;
      border: 2px solid transparent;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &.status-pending {
        background: rgba(245, 108, 108, 0.15);
        color: #F56C6C;
        border-color: rgba(245, 108, 108, 0.3);

        &:hover {
          background: rgba(245, 108, 108, 0.25);
          border-color: #F56C6C;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 108, 108, 0.4);
        }

        &.active {
          background: #F56C6C;
          color: #fff;
          border-color: #F56C6C;
          box-shadow: 0 4px 16px rgba(245, 108, 108, 0.5);
        }
      }

      &.status-processing {
        background: rgba(230, 162, 60, 0.15);
        color: #E6A23C;
        border-color: rgba(230, 162, 60, 0.3);

        &:hover {
          background: rgba(230, 162, 60, 0.25);
          border-color: #E6A23C;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(230, 162, 60, 0.4);
        }

        &.active {
          background: #E6A23C;
          color: #fff;
          border-color: #E6A23C;
          box-shadow: 0 4px 16px rgba(230, 162, 60, 0.5);
        }
      }

      &.status-resolved {
        background: rgba(103, 194, 58, 0.15);
        color: #67c23a;
        border-color: rgba(103, 194, 58, 0.3);

        &:hover {
          background: rgba(103, 194, 58, 0.25);
          border-color: #67c23a;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
        }

        &.active {
          background: #67c23a;
          color: #fff;
          border-color: #67c23a;
          box-shadow: 0 4px 16px rgba(103, 194, 58, 0.5);
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;

  button {
    padding: 12px 32px;
    border-radius: 8px;
    border: none;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cancel-btn {
    background: rgba(100, 100, 100, 0.3);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(100, 100, 100, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  .confirm-btn {
    background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 198, 255, 0.4);

    &:hover {
      background: linear-gradient(135deg, #0072ff 0%, #00c6ff 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 198, 255, 0.6);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>

