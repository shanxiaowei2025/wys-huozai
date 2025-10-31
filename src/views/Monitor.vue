<template>
  <div class="monitor-page">
    <div class="page-header">
      <h2>监控中心</h2>
      <p>实时监控所有设备运行状态</p>
    </div>

    <div class="monitor-grid">
      <el-card 
        v-for="device in devices" 
        :key="device.id" 
        class="device-card"
        :class="`status-${device.status}`"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <span class="device-name">{{ device.name }}</span>
            <el-tag :type="getStatusType(device.status)" size="small">
              {{ getStatusText(device.status) }}
            </el-tag>
          </div>
        </template>
        
        <div class="device-info">
          <div class="info-item">
            <span class="label">位置：</span>
            <span class="value">{{ device.location }}</span>
          </div>
          <div class="info-item">
            <span class="label">温度：</span>
            <span class="value">{{ device.temperature }}℃</span>
          </div>
          <div class="info-item">
            <span class="label">烟雾浓度：</span>
            <span class="value">{{ device.smoke }}%</span>
          </div>
          <div class="info-item">
            <span class="label">最后更新：</span>
            <span class="value">{{ device.updateTime }}</span>
          </div>
        </div>

        <div class="device-actions">
          <el-button size="small" type="primary">查看详情</el-button>
          <el-button size="small">历史记录</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Device {
  id: string
  name: string
  location: string
  status: 'normal' | 'warning' | 'alarm' | 'offline'
  temperature: number
  smoke: number
  updateTime: string
}

const devices = ref<Device[]>([
  {
    id: '001',
    name: '火灾探测器-001',
    location: 'A区-1楼',
    status: 'normal',
    temperature: 23,
    smoke: 5,
    updateTime: '1分钟前'
  },
  {
    id: '002',
    name: '火灾探测器-002',
    location: 'A区-2楼',
    status: 'warning',
    temperature: 42,
    smoke: 15,
    updateTime: '2分钟前'
  },
  {
    id: '003',
    name: '火灾探测器-003',
    location: 'A区-3楼',
    status: 'alarm',
    temperature: 68,
    smoke: 45,
    updateTime: '刚刚'
  },
  {
    id: '004',
    name: '火灾探测器-004',
    location: 'B区-1楼',
    status: 'normal',
    temperature: 25,
    smoke: 3,
    updateTime: '3分钟前'
  },
  {
    id: '005',
    name: '火灾探测器-005',
    location: 'B区-2楼',
    status: 'offline',
    temperature: 0,
    smoke: 0,
    updateTime: '15分钟前'
  },
  {
    id: '006',
    name: '火灾探测器-006',
    location: 'C区-1楼',
    status: 'normal',
    temperature: 22,
    smoke: 4,
    updateTime: '1分钟前'
  }
])

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    normal: 'success',
    warning: 'warning',
    alarm: 'danger',
    offline: 'info'
  }
  return map[status]
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    normal: '正常',
    warning: '预警',
    alarm: '报警',
    offline: '离线'
  }
  return map[status]
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.monitor-page {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  background: $bg-dark;
}

.page-header {
  margin-bottom: 24px;
  animation: fadeIn 0.6s ease-out;

  h2 {
    font-size: 28px;
    color: $text-primary;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: $text-secondary;
  }
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  animation: fadeIn 0.8s ease-out;
}

.device-card {
  background: $bg-card;
  border: 1px solid $border-color;
  transition: all 0.3s;

  &:hover {
    border-color: $primary-color;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(64, 158, 255, 0.2);
  }

  &.status-alarm {
    border-color: rgba(245, 108, 108, 0.5);
    
    .card-header {
      border-bottom-color: rgba(245, 108, 108, 0.2);
    }
  }

  :deep(.el-card__header) {
    background: rgba(64, 158, 255, 0.05);
    border-bottom: 1px solid $border-color;
    padding: 16px 20px;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .device-name {
    font-size: 16px;
    font-weight: bold;
    color: $text-primary;
  }
}

.device-info {
  margin-bottom: 16px;

  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid $border-color;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: $text-secondary;
      font-size: 14px;
    }

    .value {
      color: $text-primary;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.device-actions {
  display: flex;
  gap: 12px;

  .el-button {
    flex: 1;
  }
}
</style>

