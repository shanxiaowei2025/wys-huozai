/**
 * 环境变量配置文件
 * 
 * 这个文件展示了如何在项目中使用环境变量
 * 环境变量定义在项目根目录的 .env 文件中
 */

// ==========================================
// 什么是 import.meta.env？
// ==========================================
// 这是 Vite 提供的特殊对象，用于访问环境变量
// 所有以 VITE_ 开头的环境变量都会被暴露到这个对象中

/**
 * 应用标题
 * 来自环境变量：VITE_APP_TITLE
 * 
 * 示例：
 * - 开发环境：火灾监控大屏展示系统（开发）
 * - 生产环境：火灾监控大屏展示系统
 */
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || '火灾监控系统'

/**
 * 开发服务器端口
 * 来自环境变量：VITE_PORT
 * 
 * 用途：开发时服务器监听的端口号
 * 默认值：3001
 */
export const DEV_PORT = Number(import.meta.env.VITE_PORT) || 3001

/**
 * API 基础地址
 * 来自环境变量：VITE_API_BASE_URL
 * 
 * 实际使用场景：
 * - 开发环境：http://localhost:8080/api （本地后端）
 * - 测试环境：http://test-server.com/api （测试服务器）
 * - 生产环境：http://api.production.com/api （正式服务器）
 * 
 * 好处：切换环境时不需要修改代码，只需要修改 .env 文件！
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/**
 * WebSocket 地址
 * 来自环境变量：VITE_WS_URL
 * 
 * 用途：实时数据推送的 WebSocket 连接地址
 */
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'

/**
 * 数据刷新间隔（毫秒）
 * 来自环境变量：VITE_DATA_REFRESH_INTERVAL
 * 
 * 实际使用场景：
 * - 开发环境：可以设置为 10000（10秒）方便调试
 * - 生产环境：可以设置为 3000（3秒）实时性更强
 */
export const DATA_REFRESH_INTERVAL = Number(import.meta.env.VITE_DATA_REFRESH_INTERVAL) || 5000

/**
 * 是否启用报警声音
 * 来自环境变量：VITE_ALARM_SOUND_ENABLED
 * 
 * 用途：在某些环境下可能需要关闭声音（比如演示时）
 */
export const ALARM_SOUND_ENABLED = import.meta.env.VITE_ALARM_SOUND_ENABLED === 'true'

/**
 * 是否使用 Mock 数据
 * 来自环境变量：VITE_USE_MOCK
 * 
 * 实际使用场景：
 * - 后端还没开发好：设置为 true，使用假数据
 * - 后端已经完成：设置为 false，使用真实 API
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 当前环境
 * 
 * 可能的值：
 * - 'development'：开发环境（npm run dev）
 * - 'production'：生产环境（npm run build）
 */
export const IS_DEV = import.meta.env.DEV
export const IS_PROD = import.meta.env.PROD
export const NODE_ENV = import.meta.env.MODE

// ==========================================
// 打印环境信息（方便调试）
// ==========================================
console.group('🔧 环境变量配置')
console.log('📌 当前环境:', NODE_ENV)
console.log('📌 应用标题:', APP_TITLE)
console.log('📌 API 地址:', API_BASE_URL)
console.log('📌 WebSocket 地址:', WS_URL)
console.log('📌 数据刷新间隔:', DATA_REFRESH_INTERVAL, 'ms')
console.log('📌 报警声音:', ALARM_SOUND_ENABLED ? '已启用' : '已禁用')
console.log('📌 使用 Mock 数据:', USE_MOCK ? '是' : '否')
console.groupEnd()

// ==========================================
// 使用示例
// ==========================================

/**
 * 示例 1：根据环境显示不同的日志
 */
export function debugLog(message: string, ...args: any[]) {
  if (IS_DEV) {
    console.log(`[DEBUG] ${message}`, ...args)
  }
  // 生产环境不打印日志，保护敏感信息
}

/**
 * 示例 2：API 请求函数
 */
export async function fetchAPI(endpoint: string) {
  const url = `${API_BASE_URL}${endpoint}`
  
  if (USE_MOCK) {
    // 使用 Mock 数据
    console.log('📦 使用 Mock 数据:', endpoint)
    return getMockData(endpoint)
  } else {
    // 调用真实 API
    console.log('🌐 调用真实 API:', url)
    return fetch(url).then(res => res.json())
  }
}

/**
 * 示例 3：获取 Mock 数据
 */
function getMockData(endpoint: string) {
  // 返回假数据
  return Promise.resolve({ 
    success: true, 
    data: '这是 Mock 数据',
    endpoint 
  })
}

/**
 * 示例 4：根据环境设置不同的超时时间
 */
export const REQUEST_TIMEOUT = IS_DEV ? 10000 : 5000 // 开发环境 10秒，生产环境 5秒

