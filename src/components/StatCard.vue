<template>
  <div class="stat-card" :style="{ background: `linear-gradient(135deg, ${color}dd 0%, ${color}66 100%)` }">
    <div class="stat-title">
      <span class="title-icon">{{ icon }}</span>
      {{ title }}
    </div>
    <div class="stat-value">
      {{ value }}<span class="stat-unit" v-if="unit">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number | string
  unit?: string
  icon?: string
  color?: string
}

withDefaults(defineProps<Props>(), {
  unit: '',
  icon: '📊',
  color: '#409EFF'
})
</script>

<style lang="scss" scoped>
.stat-card {
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  cursor: pointer;
  height: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.05);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    
    &::before {
      opacity: 1;
    }
  }

  .stat-title {
    font-size: 11px;
    color: #fff;
    margin-bottom: 4px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 3px;
    opacity: 0.95;
    
    .title-icon {
      font-size: 13px;
    }
  }

  .stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #fff;
    font-family: 'DIN Alternate', 'Courier New', monospace;
    line-height: 1;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    
    .stat-unit {
      font-size: 13px;
      margin-left: 3px;
      opacity: 0.9;
    }
  }
}
</style>

