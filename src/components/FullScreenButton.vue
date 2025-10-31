<template>
  <el-tooltip :content="isFullscreen ? '退出全屏' : '进入全屏'" placement="left">
    <div class="fullscreen-button" @click="toggleFullScreen">
      <el-icon :size="24">
        <FullScreen v-if="!isFullscreen" />
        <Close v-else />
      </el-icon>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
import screenfull from 'screenfull'
import { ElMessage } from 'element-plus'
import { FullScreen, Close } from '@element-plus/icons-vue'

const isFullscreen = ref(false)

const toggleFullScreen = () => {
  if (!screenfull.isEnabled) {
    ElMessage.warning('您的浏览器不支持全屏模式')
    return
  }

  try {
    screenfull.toggle()
  } catch (error) {
    console.error('全屏切换失败:', error)
    ElMessage.error('全屏切换失败')
  }
}

const handleFullscreenChange = () => {
  if (screenfull.isEnabled) {
    isFullscreen.value = screenfull.isFullscreen
  }
}

onMounted(() => {
  if (screenfull.isEnabled) {
    screenfull.on('change', handleFullscreenChange)
  }
})

onUnmounted(() => {
  if (screenfull.isEnabled) {
    screenfull.off('change', handleFullscreenChange)
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.fullscreen-button {
  position: absolute;
  right: 24px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 9999;
  color: white;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>

