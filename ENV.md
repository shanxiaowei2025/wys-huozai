# 环境变量配置说明

## 📁 文件说明

| 文件名 | 用途 | 是否提交到 Git |
|--------|------|----------------|
| `.env.example` | 环境变量配置模板 | ✅ 是 |
| `.env.development.example` | 开发环境配置模板 | ✅ 是 |
| `.env.production.example` | 生产环境配置模板 | ✅ 是 |
| `.env.development` | 开发环境实际配置 | ❌ 否 |
| `.env.production` | 生产环境实际配置 | ❌ 否 |
| `.env` | 默认环境变量（可选） | ❌ 否 |

## 🚀 快速开始

### 1️⃣ 创建开发环境配置

```bash
# 复制开发环境模板
cp .env.development.example .env.development

# 编辑配置（可选）
nano .env.development
```

### 2️⃣ 创建生产环境配置

```bash
# 复制生产环境模板
cp .env.production.example .env.production

# 编辑配置（必须修改 API 地址）
nano .env.production
```

## 📋 配置项说明

### 基本配置

| 变量名 | 说明 | 示例值 | 必填 |
|--------|------|--------|------|
| `NODE_ENV` | Node.js 环境 | `development` / `production` | ✅ |
| `VITE_APP_ENV` | 应用环境 | `development` / `production` | ✅ |
| `VITE_APP_NAME` | 应用名称 | `火灾监控大屏` | ✅ |
| `VITE_APP_VERSION` | 应用版本 | `1.0.0` | ✅ |
| `VITE_APP_TITLE` | 页面标题 | `火灾监控大屏` | ✅ |

### API 配置

| 变量名 | 说明 | 开发环境示例 | 生产环境示例 |
|--------|------|--------------|--------------|
| `VITE_API_BASE_URL` | API 基础地址 | `http://localhost:8080` | `https://api.yourdomain.com` |
| `VITE_WS_URL` | WebSocket 地址 | `ws://localhost:8080/ws` | `wss://api.yourdomain.com/ws` |

### 开发服务器配置

| 变量名 | 说明 | 默认值 | 备注 |
|--------|------|--------|------|
| `VITE_PORT` | 开发服务器端口 | `5173` | 仅开发环境 |
| `VITE_HOST` | 开发服务器主机 | `0.0.0.0` | 仅开发环境 |

### 功能开关

| 变量名 | 说明 | 开发环境 | 生产环境 |
|--------|------|----------|----------|
| `VITE_ENABLE_MOCK` | 是否启用 Mock 数据 | `true` | `false` |
| `VITE_ENABLE_DEVTOOLS` | 是否启用开发者工具 | `true` | `false` |
| `VITE_LOG_LEVEL` | 日志级别 | `debug` | `error` |

### 系统配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `TZ` | 时区 | `Asia/Shanghai` |

## 💻 在代码中使用环境变量

### Vue 组件中使用

```typescript
// 获取环境变量
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const appName = import.meta.env.VITE_APP_NAME
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

console.log('API地址:', apiBaseUrl)
console.log('应用名称:', appName)
console.log('是否开发环境:', isDev)
```

### TypeScript 类型定义

在 `env.d.ts` 中添加类型定义：

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ENV: 'development' | 'production' | 'test'
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_PORT: string
  readonly VITE_HOST: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_ENABLE_DEVTOOLS: string
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 🏃 运行命令

### 开发环境

```bash
# Vite 会自动加载 .env.development
npm run dev
```

### 生产环境构建

```bash
# Vite 会自动加载 .env.production
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 🐳 Docker 环境变量

### 开发环境

```bash
# 使用 docker-compose.yml
docker-compose up -d
```

### 生产环境

```bash
# 使用 docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d
```

在 Docker 中，可以通过以下方式传递环境变量：

1. **通过 docker-compose.yml**：
```yaml
environment:
  - NODE_ENV=production
  - VITE_API_BASE_URL=https://api.yourdomain.com
```

2. **通过 .env 文件**：
```yaml
env_file:
  - .env.production
```

3. **通过命令行**：
```bash
docker run -e VITE_API_BASE_URL=https://api.yourdomain.com myapp
```

## ⚠️ 重要注意事项

### 1. 安全性

- ❌ **不要**在环境变量中存储敏感信息（密码、私钥等）
- ❌ **不要**提交 `.env.development` 和 `.env.production` 到 Git
- ✅ **务必**将实际配置文件添加到 `.gitignore`
- ✅ **只提交** `.example` 模板文件到 Git

### 2. 前端可见性

- ⚠️ 所有 `VITE_` 开头的变量都会暴露到前端代码中
- ⚠️ 任何人都可以在浏览器中看到这些值
- ⚠️ 不要在前端环境变量中存储 API 密钥等敏感信息

### 3. 构建时注入

- Vite 在**构建时**将环境变量注入到代码中
- 修改 `.env` 文件后需要**重新构建**才能生效
- 已构建的代码不能动态改变环境变量

### 4. 优先级

环境变量加载优先级（从高到低）：

1. `.env.[mode].local` （如 `.env.production.local`）
2. `.env.[mode]` （如 `.env.production`）
3. `.env.local`
4. `.env`

## 🔍 调试环境变量

### 检查当前环境变量

在代码中添加：

```typescript
console.log('当前环境:', import.meta.env.MODE)
console.log('所有环境变量:', import.meta.env)
```

### 检查 Vite 配置

```bash
# 查看 Vite 配置
npx vite --debug
```

## 📚 参考资料

- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [Vue 3 环境变量最佳实践](https://vuejs.org/guide/best-practices/production-deployment.html)

## ❓ 常见问题

### Q: 为什么我的环境变量没有生效？

A: 检查以下几点：
1. 变量名是否以 `VITE_` 开头
2. 是否重启了开发服务器
3. 是否在正确的环境文件中配置
4. 文件名是否正确（`.env.development` 不是 `.env.dev`）

### Q: 如何在不同环境使用不同的 API 地址？

A: 在对应的环境文件中配置：
- `.env.development`: 配置开发环境 API
- `.env.production`: 配置生产环境 API

### Q: Docker 中如何使用环境变量？

A: 有三种方式：
1. 在 `docker-compose.yml` 中通过 `environment` 配置
2. 在 `docker-compose.yml` 中通过 `env_file` 引用
3. 在构建时通过 `ARG` 传入

---

**提示**：首次使用请先复制 `.example` 文件创建实际配置文件！

