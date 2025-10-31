/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// 全局类型定义，用于解决 Vue 3 script setup 的类型识别问题

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

// 扩展全局类型以支持 script setup 的自动绑定导出
declare global {
  // Vue 3 script setup 会自动将所有顶层绑定暴露给模板
  // 这个声明告诉 TypeScript 信任这种行为
  interface Window {
    [key: string]: any
  }
}

export {}

