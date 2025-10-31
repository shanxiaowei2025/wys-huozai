<template>
  <div class="data-card">
    <div class="card-body">
      <slot name="top"></slot>
      <div class="card-header">
        <div class="header-left">
          <div class="icon-wrapper">
            <el-icon :size="18">
              <component :is="iconComponent" />
            </el-icon>
          </div>
          <span class="card-title">{{ title }}</span>
        </div>
        <div class="header-right">
          <slot name="header-actions"></slot>
          <div class="header-decoration"></div>
        </div>
      </div>
      <slot name="header-bottom"></slot>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Icons from '@element-plus/icons-vue'

interface Props {
  title: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'Document'
})

const iconComponent = computed(() => {
  return (Icons as any)[props.icon] || Icons.Document
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.data-card {
  background: linear-gradient(135deg, rgba(26, 31, 58, 0.9) 0%, rgba(20, 26, 53, 0.9) 100%);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 8px;
  padding: 5px;
  height: 100%;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  min-width: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #409EFF, transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    border-color: rgba(64, 158, 255, 0.5);
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);

    &::before {
      opacity: 1;
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 12px 8px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .icon-wrapper {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(64, 158, 255, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409EFF;
  }

  .card-title {
    font-size: 18px;
    font-weight: bold;
    color: $text-primary;
    letter-spacing: 0.8px;
  }

  .header-decoration {
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #409EFF, transparent);
  }
}

.card-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: visible;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(64, 158, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(64, 158, 255, 0.5);
    }
  }
}
</style>

