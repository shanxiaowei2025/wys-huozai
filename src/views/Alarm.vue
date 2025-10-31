<template>
  <div class="alarm-page">
    <div class="page-header">
      <h2>报警记录</h2>
      <p>查看和管理所有报警信息</p>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterLevel" placeholder="选择级别" style="width: 150px">
        <el-option label="全部" value="all"></el-option>
        <el-option label="危险" value="danger"></el-option>
        <el-option label="警告" value="warning"></el-option>
      </el-select>
      
      <el-select v-model="filterStatus" placeholder="选择状态" style="width: 150px">
        <el-option label="全部" value="all"></el-option>
        <el-option label="待处理" value="pending"></el-option>
        <el-option label="处理中" value="processing"></el-option>
        <el-option label="已处理" value="resolved"></el-option>
      </el-select>
    </div>

    <div class="alarm-table">
      <el-table 
        :data="filteredAlarms" 
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#1a1f3a', color: '#fff' }"
      >
        <el-table-column type="index" label="序号" width="60" />
        
        <el-table-column prop="title" label="报警内容" min-width="200">
          <template #default="{ row }">
            <div class="alarm-title-cell">
              <el-icon :size="18" :color="row.level === 'danger' ? '#F56C6C' : '#E6A23C'">
                <WarningFilled v-if="row.level === 'danger'" />
                <Warning v-else />
              </el-icon>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="location" label="位置" width="150" />
        
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="row.level === 'danger' ? 'danger' : 'warning'" size="small">
              {{ row.level === 'danger' ? '危险' : '警告' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="time" label="发生时间" width="180" />
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'pending'"
              type="primary" 
              size="small"
              @click="openStatusDialog(row)"
            >
              处理
            </el-button>
            <el-button 
              v-if="row.status === 'processing'"
              type="success" 
              size="small"
              @click="openStatusDialog(row)"
            >
              修改状态
            </el-button>
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="10"
          :total="alarms.length"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 状态修改弹窗 -->
    <el-dialog
      v-model="statusDialogVisible"
      :title="`修改报警状态 - ${currentAlarm?.title}`"
      width="500px"
      :close-on-click-modal="false"
      class="status-dialog"
    >
      <div class="status-dialog-content">
        <div class="alarm-info">
          <div class="info-row">
            <span class="label">报警内容：</span>
            <span class="value">{{ currentAlarm?.title }}</span>
          </div>
          <div class="info-row">
            <span class="label">报警位置：</span>
            <span class="value">{{ currentAlarm?.location }}</span>
          </div>
          <div class="info-row">
            <span class="label">报警时间：</span>
            <span class="value">{{ currentAlarm?.time }}</span>
          </div>
          <div class="info-row">
            <span class="label">当前状态：</span>
            <el-tag :type="getStatusType(currentAlarm?.status || 'pending')" size="small">
              {{ getStatusText(currentAlarm?.status || 'pending') }}
            </el-tag>
          </div>
        </div>

        <div class="status-selector">
          <div class="selector-label">选择新状态：</div>
          <div class="status-options">
            <div 
              v-for="status in STATUS_OPTIONS" 
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
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmStatusChange">确认修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { WarningFilled, Warning } from '@element-plus/icons-vue'

// 常量定义
const STATUS_OPTIONS = [
  { value: 'pending', label: '待处理', icon: '🔴' },
  { value: 'processing', label: '处理中', icon: '🟡' },
  { value: 'resolved', label: '已处理', icon: '🟢' }
]

const STATUS_TYPE_MAP = {
  pending: 'danger',
  processing: 'warning',
  resolved: 'success'
}

const STATUS_TEXT_MAP = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已处理'
}

// 响应式数据
const filterLevel = ref('all')
const filterStatus = ref('all')
const currentPage = ref(1)

// 状态修改弹窗相关
const statusDialogVisible = ref(false)
const currentAlarm = ref(null)
const selectedStatus = ref('pending')

const alarms = ref([
  {
    id: '001',
    title: '温度超标报警',
    location: 'A区-3楼',
    level: 'danger',
    status: 'pending',
    time: '2024-10-26 14:30:25'
  },
  {
    id: '002',
    title: '烟雾浓度异常',
    location: 'B区-2楼',
    level: 'warning',
    status: 'processing',
    time: '2024-10-26 14:25:18'
  },
  {
    id: '003',
    title: '设备离线告警',
    location: 'C区-1楼',
    level: 'warning',
    status: 'resolved',
    time: '2024-10-26 14:20:42'
  },
  {
    id: '004',
    title: '火焰探测报警',
    location: 'E区-4楼',
    level: 'danger',
    status: 'pending',
    time: '2024-10-26 14:15:33'
  },
  {
    id: '005',
    title: '通讯故障',
    location: 'D区-5楼',
    level: 'warning',
    status: 'resolved',
    time: '2024-10-26 14:10:15'
  }
])

// 计算属性
const filteredAlarms = computed(() => 
  alarms.value.filter(alarm => 
    (filterLevel.value === 'all' || alarm.level === filterLevel.value) &&
    (filterStatus.value === 'all' || alarm.status === filterStatus.value)
  )
)

// 工具函数
const getStatusType = (status) => STATUS_TYPE_MAP[status] || 'info'
const getStatusText = (status) => STATUS_TEXT_MAP[status] || '未知'

// 事件处理函数
/**
 * 打开状态修改弹窗
 * @param {Object} row - 报警记录行数据
 */
const openStatusDialog = (row) => {
  currentAlarm.value = row
  selectedStatus.value = row.status
  statusDialogVisible.value = true
}

/**
 * 确认状态修改
 */
const confirmStatusChange = () => {
  if (!currentAlarm.value) return
  
  currentAlarm.value.status = selectedStatus.value
  
  const statusText = STATUS_OPTIONS.find(s => s.value === selectedStatus.value)?.label || '未知'
  ElMessage.success(`状态已更新为：${statusText}`)
  
  statusDialogVisible.value = false
}

/**
 * 查看报警详情
 * @param {Object} row - 报警记录行数据
 */
const viewDetail = (row) => {
  ElMessage.info(`查看报警详情: ${row.title}`)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.alarm-page {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  background: $bg-dark;
  display: flex;
  flex-direction: column;
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

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  animation: fadeIn 0.8s ease-out;
}

.alarm-table {
  flex: 1;
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: $border-radius-large;
  padding: 20px;
  animation: fadeIn 1s ease-out;

  :deep(.el-table) {
    background: transparent;
    color: $text-primary;

    &::before {
      display: none;
    }

    th {
      background: $bg-card !important;
      color: $text-primary !important;
      border-bottom: 1px solid $border-color;
    }

    tr {
      background: transparent;

      &:hover > td {
        background: rgba(64, 158, 255, 0.05) !important;
      }
    }

    td {
      border-bottom: 1px solid $border-color;
    }

    .el-table__row--striped td {
      background: rgba(255, 255, 255, 0.02);
    }
  }
}

.alarm-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;

  :deep(.el-pagination) {
    --el-pagination-bg-color: transparent;
    --el-pagination-button-bg-color: rgba(64, 158, 255, 0.1);
    --el-pagination-hover-color: #409EFF;
  }
}

// 状态修改弹窗样式
:deep(.status-dialog) {
  .el-dialog {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

