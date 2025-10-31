import dayjs from 'dayjs'
import { COMMUNITIES, FLOOR_RANGES } from '@/config/communities'

export interface AlarmData {
  title: string
  location: string
  time: string
  level: 'danger' | 'warning'
  status: 'pending' | 'processing' | 'resolved'
  community: string
  building: string
  floor: number
  address?: string
}

// 报警信息池
const alarmPool = [
  // 火灾类报警
  { title: '🔥 火焰探测报警', type: 'fire', level: 'danger' as const },
  { title: '🔥 烟雾浓度异常', type: 'smoke', level: 'danger' as const },
  { title: '🔥 温度超标报警', type: 'temperature', level: 'danger' as const },
  { title: '🔥 燃气泄漏报警', type: 'gas', level: 'danger' as const },
  { title: '🔥 电气火灾报警', type: 'electric', level: 'danger' as const },
  { title: '🔥 可燃气体报警', type: 'combustible', level: 'danger' as const },
  { title: '🔥 高温预警', type: 'heat', level: 'danger' as const },
  { title: '🔥 消防通道阻塞', type: 'blockage', level: 'danger' as const },
  
  // 高空抛物类报警
  { title: '🪟 高空抛物报警', type: 'throw', level: 'warning' as const },
  { title: '🪟 空调外机脱落', type: 'ac_fall', level: 'warning' as const },
  { title: '🪟 窗户玻璃破碎', type: 'glass_break', level: 'warning' as const },
  { title: '🪟 阳台物品坠落', type: 'balcony_fall', level: 'warning' as const },
  { title: '🪟 广告牌松动', type: 'sign_loose', level: 'warning' as const }
]

// 使用统一的小区配置（从配置文件导入）
// 这样可以确保报警列表和监控画面使用相同的小区、栋数、层数 信息，确保数据一致性 防止数据不一致导致报警列表和监控画面不一致       

// 全局报警数据
const globalAlarms = ref<AlarmData[]>([])

// 生成最近30分钟内的随机时间
const generateRandomTime = () => {
  const now = dayjs()
  const minutesAgo = Math.floor(Math.random() * 30) + 1
  return now.subtract(minutesAgo, 'minute').format('YYYY-MM-DD HH:mm:ss')
}

// 生成随机报警数据
const generateRandomAlarms = (): AlarmData[] => {
  
  // 处理状态选项（增加"未处置"和"处置中"的概率）
  const statusOptions: ('pending' | 'processing' | 'resolved')[] = ['pending', 'processing', 'pending', 'processing', 'resolved']
  
  const selectedAlarms: AlarmData[] = []
  const usedCommunities = new Set<string>()
  
  // 确保每个小区至少有一个报警，生成10-15个报警
  const targetCount = Math.floor(Math.random() * 6) + 10 // 10-15个报警
  while (selectedAlarms.length < targetCount && selectedAlarms.length < COMMUNITIES.length) {
    const randomAlarm = alarmPool[Math.floor(Math.random() * alarmPool.length)]
    const randomCommunity = COMMUNITIES[Math.floor(Math.random() * COMMUNITIES.length)]
    
    // 避免同一个小区重复报警
    if (usedCommunities.has(randomCommunity.name)) continue
    usedCommunities.add(randomCommunity.name)
    
    // 计算该小区实际有摄像头监控的楼栋和楼层范围
    // 每栋楼有5个楼层段，根据摄像头数量计算监控范围
    const cameraCount = randomCommunity.cameraCount
    const floorsPerBuilding = FLOOR_RANGES.length  // 每栋楼的楼层段数（5个）
    
    // 完整监控的楼栋数（每栋5个摄像头）
    const fullBuildingCount = Math.floor(cameraCount / floorsPerBuilding)
    // 最后一栋楼监控的楼层段数
    const lastBuildingFloorCount = cameraCount % floorsPerBuilding
    
    // 计算实际可用的楼栋数
    const availableBuildingCount = lastBuildingFloorCount > 0 ? fullBuildingCount + 1 : fullBuildingCount
    
    // 确保至少有1栋楼可用
    if (availableBuildingCount === 0) continue
    
    // 从实际有摄像头监控的楼栋中随机选择
    const buildingIndex = Math.floor(Math.random() * availableBuildingCount)
    const randomBuilding = randomCommunity.buildings[buildingIndex]
    
    // 根据选择的楼栋，确定可用的楼层段
    let availableFloorRanges: typeof FLOOR_RANGES
    if (buildingIndex < fullBuildingCount) {
      // 完整监控的楼栋，所有楼层段都可用
      availableFloorRanges = FLOOR_RANGES
    } else {
      // 最后一栋楼，只有部分楼层段可用
      availableFloorRanges = FLOOR_RANGES.slice(0, lastBuildingFloorCount)
    }
    
    // 从可用的楼层段中随机选择
    const randomFloorRange = availableFloorRanges[Math.floor(Math.random() * availableFloorRanges.length)]
    
    const randomTime = generateRandomTime()
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)]
    
    selectedAlarms.push({
      title: randomAlarm.title,
      // 统一格式：小区名称 栋号(楼层范围)
      // 楼层范围从统一配置的 FLOOR_RANGES 中获取
      location: `${randomCommunity.name} ${randomBuilding}栋(${randomFloorRange.label})`,
      time: randomTime,
      level: randomAlarm.level,
      status: randomStatus,
      community: randomCommunity.name,
      building: randomBuilding,
      floor: randomFloorRange.id,  // 存储楼层段ID
      address: randomCommunity.address
    })
  }
  
  // 按时间排序（最新的在前面）
  return selectedAlarms.sort((a, b) => {
    const timeA = parseInt(a.time)
    const timeB = parseInt(b.time)
    return timeA - timeB
  })
}

// 初始化报警数据
const initializeAlarms = () => {
  globalAlarms.value = generateRandomAlarms()
}

// 获取特定小区的报警信息
const getCommunityAlarm = (communityName: string) => {
  return globalAlarms.value.find(alarm => alarm.community === communityName)
}

// 获取所有报警的社区状态映射
// 地图状态现在根据报警的处理状态（status）来显示，而不是报警级别（level）
const communityStatusMap = computed(() => {
  const statusMap: Record<string, { status: 'normal' | 'warning' | 'alarm', alarmData?: AlarmData }> = {}
  
  // 初始化所有小区为正常状态（使用统一的小区配置）
  COMMUNITIES.forEach(community => {
    statusMap[community.name] = { status: 'normal' }
  })
  
  // 根据报警数据的处理状态更新地图显示状态
  globalAlarms.value.forEach(alarm => {
    // 根据报警的处理状态映射到地图状态
    let mapStatus: 'normal' | 'warning' | 'alarm'
    if (alarm.status === 'pending') {
      // 未处置 → 红色报警状态
      mapStatus = 'alarm'
    } else if (alarm.status === 'processing') {
      // 处置中 → 橙色预警状态
      mapStatus = 'warning'
    } else {
      // 已处置 → 绿色正常状态
      mapStatus = 'normal'
    }
    statusMap[alarm.community] = { status: mapStatus, alarmData: alarm }
  })
  
  return statusMap
})

export function useAlarmData() {
  // 如果还没有初始化，则初始化
  if (globalAlarms.value.length === 0) {
    initializeAlarms()
  }
  
  return {
    globalAlarms,
    generateRandomAlarms,
    initializeAlarms,
    getCommunityAlarm,
    communityStatusMap
  }
}
