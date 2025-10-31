<template>
  <div class="home-page">
    <div class="welcome-container fade-in">
      <div class="welcome-card">
        <el-icon :size="80" color="#409EFF">
          <TrendCharts />
        </el-icon>
        <h1>欢迎使用火灾监控大屏展示系统</h1>
        <p class="desc">实时监控、智能预警、数据可视化</p>
        <div class="features">
          <div class="feature-item" v-for="item in features" :key="item.title">
            <el-icon :size="32" :color="item.color">
              <component :is="item.icon" />
            </el-icon>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </div>
        <el-button type="primary" size="large" @click="goToDashboard">
          进入大屏展示
          <el-icon class="el-icon--right"><DArrowRight /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { TrendCharts, Monitor, Bell, DataAnalysis, DArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

const features = [
  {
    icon: Monitor,
    title: '实时监控',
    desc: '24小时不间断监控设备状态',
    color: '#409EFF'
  },
  {
    icon: Bell,
    title: '智能预警',
    desc: '异常情况及时推送报警信息',
    color: '#E6A23C'
  },
  {
    icon: DataAnalysis,
    title: '数据分析',
    desc: '多维度数据统计与可视化展示',
    color: '#67C23A'
  }
]

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.home-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: moveBackground 20s linear infinite;
  }
}

@keyframes moveBackground {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

.welcome-container {
  position: relative;
  z-index: 1;
}

.welcome-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 60px 80px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 1000px;

  h1 {
    font-size: 36px;
    margin: 24px 0 16px;
    color: #303133;
  }

  .desc {
    font-size: 18px;
    color: #606266;
    margin-bottom: 48px;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    margin-bottom: 48px;

    .feature-item {
      padding: 24px;
      border-radius: 12px;
      background: #f5f7fa;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      h3 {
        font-size: 20px;
        margin: 16px 0 8px;
        color: #303133;
      }

      p {
        font-size: 14px;
        color: #909399;
        line-height: 1.6;
      }
    }
  }

  .el-button {
    padding: 16px 48px;
    font-size: 16px;
    border-radius: 24px;
  }
}
</style>

