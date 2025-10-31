/**
 * 小区统一配置文件
 * 所有小区的信息都在这里统一管理，确保数据一致性
 */

// 小区配置接口定义
export interface CommunityConfig {
  id: number              // 小区ID
  name: string            // 小区名称
  buildings: string[]     // 楼栋号列表
  cameraCount: number     // 摄像头数量
  address: string         // 详细地址
  maxFloor?: number       // 最大楼层数（可选，默认20层）
}

// 楼层段配置（统一定义）
export interface FloorRange {
  id: number
  label: string           // 显示标签，如 "1-5层"
  min: number            // 最小楼层
  max: number            // 最大楼层
}

/**
 * 统一的楼层段配置
 * 所有报警的楼层范围都从这里获取
 */
export const FLOOR_RANGES: FloorRange[] = [
  { id: 1, label: '1-5层', min: 1, max: 5 },
  { id: 2, label: '6-10层', min: 6, max: 10 },
  { id: 3, label: '11-15层', min: 11, max: 15 },
  { id: 4, label: '16-20层', min: 16, max: 20 },
  { id: 5, label: '21-25层', min: 21, max: 25 }
]

/**
 * 15个小区的完整配置
 * 每个小区包含：ID、名称、楼栋列表、摄像头数量、地址
 */
export const COMMUNITIES: CommunityConfig[] = [
  {
    id: 1,
    name: '恒源御景',
    buildings: ['1', '2', '3', '4', '5'],  // 从1开始编号
    cameraCount: 9,
    address: '河北省保定市定兴县通兴东路26号'
  },
  {
    id: 2,
    name: '盛世华庭',
    buildings: ['1', '2', '3', '4', '5', '6'],  // 从1开始编号
    cameraCount: 12,
    address: '河北省保定市定兴县迎宾街18号'
  },
  {
    id: 3,
    name: '锦绣家园',
    buildings: ['1', '2', '3', '4', '5', '6'],  // 从1开始编号
    cameraCount: 16,
    address: '河北省保定市定兴县建设路88号'
  },
  {
    id: 4,
    name: '阳光花园',
    buildings: ['1', '2', '3', '4', '5', '6', '7'],  // 从1开始编号
    cameraCount: 20,
    address: '河北省保定市定兴县育才街56号'
  },
  {
    id: 5,
    name: '龙泉小区',
    buildings: ['1', '2', '3', '4', '5', '6', '7', '8'],  // 从1开始编号
    cameraCount: 25,
    address: '河北省保定市定兴县永安路99号'
  },
  {
    id: 6,
    name: '碧水云天',
    buildings: ['1', '2', '3', '4', '5', '6'],  // 从1开始编号
    cameraCount: 15,
    address: '河北省保定市定兴县兴华路108号'
  },
  {
    id: 7,
    name: '金色家园',
    buildings: ['1', '2', '3', '4', '5', '6'],  // 从1开始编号
    cameraCount: 18,
    address: '河北省保定市定兴县文化街66号'
  },
  {
    id: 8,
    name: '翠竹苑',
    buildings: ['1', '2', '3', '4', '5'],  // 从1开始编号
    cameraCount: 10,
    address: '河北省保定市定兴县康乐路128号'
  },
  {
    id: 9,
    name: '紫荆花园',
    buildings: ['1', '2', '3', '4', '5', '6'],  // 从1开始编号
    cameraCount: 14,
    address: '河北省保定市定兴县繁荣街77号'
  },
  {
    id: 10,
    name: '枫林雅居',
    buildings: ['1', '2', '3', '4', '5', '6', '7', '8'],  // 从1开始编号
    cameraCount: 22,
    address: '河北省保定市定兴县和平路168号'
  },
  {
    id: 11,
    name: '海棠湾',
    buildings: ['1', '2', '3', '4', '5', '6'],  // 从1开始编号
    cameraCount: 16,
    address: '河北省保定市定兴县幸福街188号'
  },
  {
    id: 12,
    name: '梧桐苑',
    buildings: ['1', '2', '3', '4', '5', '6'],  // 从1开始编号
    cameraCount: 13,
    address: '河北省保定市定兴县兴业路218号'
  },
  {
    id: 13,
    name: '兰亭序',
    buildings: ['1', '2', '3', '4', '5', '6', '7'],  // 从1开始编号
    cameraCount: 19,
    address: '河北省保定市定兴县文明街138号'
  },
  {
    id: 14,
    name: '芳华园',
    buildings: ['1', '2', '3', '4', '5'],  // 从1开始编号
    cameraCount: 11,
    address: '河北省保定市定兴县锦绣路98号'
  },
  {
    id: 15,
    name: '锦江花园',
    buildings: ['1', '2', '3', '4', '5', '6', '7', '8'],  // 从1开始编号
    cameraCount: 24,
    address: '河北省保定市定兴县滨河路258号'
  }
]

/**
 * 根据小区名称查找配置
 */
export function getCommunityByName(name: string): CommunityConfig | undefined {
  return COMMUNITIES.find(c => c.name === name)
}

/**
 * 根据ID查找小区配置
 */
export function getCommunityById(id: number): CommunityConfig | undefined {
  return COMMUNITIES.find(c => c.id === id)
}

