<template>
  <div class="sidebar-container" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-header">
      <transition name="fade">
        <div v-if="!appStore.sidebarCollapsed" class="logo-wrapper">
          <el-icon :size="32" color="#409EFF">
            <TrendCharts />
          </el-icon>
          <span class="logo-text">火灾监控</span>
        </div>
        <el-icon v-else :size="32" color="#409EFF">
          <TrendCharts />
        </el-icon>
      </transition>
    </div>

    <div class="sidebar-menu">
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        background-color="#141a35"
        text-color="#a0aec0"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <el-menu-item index="/dashboard">
          <el-icon><Monitor /></el-icon>
          <template #title>大屏展示</template>
        </el-menu-item>

        <el-menu-item index="/monitor">
          <el-icon><View /></el-icon>
          <template #title>监控中心</template>
        </el-menu-item>

        <el-menu-item index="/alarm">
          <el-icon><Bell /></el-icon>
          <template #title>报警记录</template>
        </el-menu-item>
      </el-menu>
    </div>

    <div class="sidebar-footer">
      <el-button
        :icon="appStore.sidebarCollapsed ? Expand : Fold"
        circle
        @click="appStore.toggleSidebar"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { Fold, Expand, HomeFilled, Monitor, View, Bell, TrendCharts } from '@element-plus/icons-vue'

const route = useRoute()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.sidebar-container {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: $sidebar-width;
  background: $sidebar-bg;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  transition: width 0.3s;
  z-index: 1000;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid $border-color;
  padding: 0 $spacing-md;

  .logo-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo-text {
      font-size: 20px;
      font-weight: bold;
      color: $text-primary;
      white-space: nowrap;
    }
  }
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: $spacing-md 0;

  :deep(.el-menu) {
    border: none;
  }

  :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
    margin: 4px 12px;
    border-radius: $border-radius;
    transition: all 0.3s;

    &:hover {
      background-color: rgba(64, 158, 255, 0.1) !important;
    }

    &.is-active {
      background-color: rgba(64, 158, 255, 0.2) !important;
      border-left: 3px solid $primary-color;
    }
  }

  :deep(.el-menu--collapse) {
    .el-menu-item {
      margin: 4px 8px;
    }
  }
}

.sidebar-footer {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid $border-color;
  padding: 0 $spacing-md;

  :deep(.el-button) {
    background: rgba(64, 158, 255, 0.1);
    border-color: $primary-color;
    color: $primary-color;

    &:hover {
      background: rgba(64, 158, 255, 0.2);
    }
  }
}
</style>

