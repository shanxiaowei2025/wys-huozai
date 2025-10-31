import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const isFullScreen = ref(false)
  const sidebarCollapsed = ref(false)

  const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    isFullScreen,
    sidebarCollapsed,
    toggleFullScreen,
    toggleSidebar
  }
})

