# 🔥 火灾监控大屏展示系统

一个基于 Vue 3 + TypeScript + Vite + ECharts 的专业大屏数据可视化展示系统。

## ✨ 特性

- 🎨 **现代化 UI 设计** - 采用深色主题，科技感十足的界面设计
- 📱 **响应式布局** - 支持不同尺寸屏幕自适应缩放
- 🖥️ **全屏展示** - 一键进入/退出全屏模式，完美适配大屏展示场景
- 📊 **数据可视化** - 基于 ECharts 5 的丰富图表组件
- ⚡ **高性能** - Vite 构建，开发和生产环境都极速运行
- 🎯 **TypeScript** - 完整的类型支持，提升开发体验
- 🔄 **实时更新** - 时钟、数据等实时刷新展示
- 🎭 **流畅动画** - 精心设计的过渡和动画效果

## 🛠️ 技术栈

- **前端框架**: Vue 3.4+
- **开发语言**: TypeScript
- **构建工具**: Vite 5
- **UI 组件库**: Element Plus
- **数据可视化**: ECharts 5
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **样式预处理**: SCSS
- **全屏支持**: screenfull.js
- **时间处理**: dayjs

## 📦 安装

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 pnpm >= 8.0.0

### 克隆项目

```bash
git clone <repository-url>
cd huozaijiankong
```

### 安装依赖

使用 npm:
```bash
npm install
```

或使用 pnpm (推荐):
```bash
pnpm install
```

## 🚀 运行

### 开发模式

```bash
npm run dev
```

项目将在 http://localhost:3000 启动

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist` 目录

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
huozaijiankong/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 资源文件（图片、字体等）
│   ├── components/        # 公共组件
│   │   ├── charts/       # 图表组件
│   │   ├── DataCard.vue  # 数据卡片组件
│   │   ├── StatCard.vue  # 统计卡片组件
│   │   ├── ScreenAdapter.vue    # 大屏自适应组件
│   │   └── FullScreenButton.vue # 全屏按钮组件
│   ├── layout/            # 布局组件
│   │   ├── index.vue     # 主布局
│   │   └── components/   # 布局子组件
│   │       └── Sidebar.vue      # 侧边栏
│   ├── router/            # 路由配置
│   ├── stores/            # 状态管理
│   ├── styles/            # 全局样式
│   │   ├── index.scss    # 入口样式
│   │   └── variables.scss       # 样式变量
│   ├── views/             # 页面视图
│   │   ├── Home.vue      # 首页
│   │   ├── Dashboard.vue # 大屏展示
│   │   ├── Monitor.vue   # 监控中心
│   │   └── Alarm.vue     # 报警记录
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── index.html             # HTML 模板
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
├── package.json           # 项目配置
└── README.md              # 项目文档
```

## 🎯 核心功能

### 1. 大屏展示 (Dashboard)

- **自适应缩放**: 基于 1920x1080 设计稿，自动适配不同尺寸屏幕
- **实时数据**: 展示实时监控数据、统计信息
- **数据可视化**: 
  - 设备状态饼图
  - 报警统计柱状图
  - 温度趋势折线图
  - 区域分布散点图
  - 最新报警列表
- **全屏模式**: 右下角浮动按钮，支持一键全屏

### 2. 监控中心 (Monitor)

- 设备列表展示
- 实时状态监控
- 设备详细信息查看

### 3. 报警记录 (Alarm)

- 报警记录表格展示
- 多条件筛选功能
- 报警处理流程

### 4. 左侧导航栏

- 可折叠设计
- 路由导航
- 图标 + 文字展示

## 🎨 核心组件说明

### ScreenAdapter - 大屏自适应组件

自动将内容按比例缩放适配不同尺寸屏幕，确保大屏展示效果统一。

```vue
<ScreenAdapter :width="1920" :height="1080">
  <!-- 你的大屏内容 -->
</ScreenAdapter>
```

### FullScreenButton - 全屏按钮

提供一键全屏功能，基于 screenfull.js 实现跨浏览器兼容。

```vue
<FullScreenButton />
```

### DataCard - 数据卡片

统一的卡片容器，带有标题、图标和悬浮效果。

```vue
<DataCard title="标题" icon="Monitor">
  <!-- 卡片内容 -->
</DataCard>
```

### StatCard - 统计卡片

用于展示统计数据的小卡片组件。

```vue
<StatCard 
  title="在线设备"
  :value="128"
  unit="台"
  icon="📱"
  color="#409EFF"
/>
```

## 🎨 样式变量

项目使用 SCSS 变量统一管理主题色、尺寸等：

```scss
// 主题颜色
$primary-color: #409EFF;
$success-color: #67C23A;
$warning-color: #E6A23C;
$danger-color: #F56C6C;

// 大屏尺寸 (16:9)
$screen-width: 1920px;
$screen-height: 1080px;
```

## 📊 图表配置

所有图表组件都基于 ECharts 5，支持：

- 响应式自适应
- 深色主题配置
- 自定义配色方案
- 动画效果
- 交互提示

## 🔧 配置说明

### Vite 配置

- 自动导入 Vue API 和 Element Plus 组件
- 路径别名: `@` 指向 `src` 目录
- 代码分割优化
- 开发服务器配置

### TypeScript 配置

- 严格模式开启
- 完整的类型检查
- 路径映射配置

## 📝 开发规范

1. **组件命名**: 使用 PascalCase
2. **文件命名**: 组件文件使用 PascalCase，其他使用 kebab-case
3. **代码风格**: 遵循 Vue 3 Composition API 风格
4. **类型定义**: 所有组件 props、事件都应有完整类型定义

## 🌐 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件

---

⭐ 如果这个项目对你有帮助，请给个 Star！

