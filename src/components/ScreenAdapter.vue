<template>
  <div class="screen-adapter" :style="wrapperStyle">
    <div class="screen-content" :style="contentStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 1920,
  height: 1080
})

const scale = ref(1)
const contentWidth = ref(props.width)
const contentHeight = ref(props.height)

const wrapperStyle = computed(() => ({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: '#0a0e27'
}))

const contentStyle = computed(() => ({
  width: `${contentWidth.value}px`,
  height: `${contentHeight.value}px`,
  transform: `scale(${scale.value})`,
  transformOrigin: 'left top',
  transition: 'transform 0.3s ease-out'
}))

const updateScale = () => {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  const scaleX = windowWidth / props.width
  const scaleY = windowHeight / props.height
  
  // 使用等比例缩放，取最小值以确保完整显示
  scale.value = Math.min(scaleX, scaleY)
  
  // 居中显示
  const scaledWidth = props.width * scale.value
  const scaledHeight = props.height * scale.value
  const offsetX = (windowWidth - scaledWidth) / 2
  const offsetY = (windowHeight - scaledHeight) / 2
  
  const content = document.querySelector('.screen-content') as HTMLElement
  if (content) {
    content.style.marginLeft = `${offsetX}px`
    content.style.marginTop = `${offsetY}px`
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)
  
  // 使用 ResizeObserver 监听容器大小变化
  const wrapper = document.querySelector('.screen-adapter') as HTMLElement
  if (wrapper) {
    resizeObserver = new ResizeObserver(updateScale)
    resizeObserver.observe(wrapper)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// 暴露给父组件使用
defineExpose({
  updateScale
})
</script>

<style lang="scss" scoped>
.screen-adapter {
  position: relative;
}

.screen-content {
  position: relative;
}
</style>

