# Docker 环境变量配置说明

## 📋 概述

现在 Docker Compose 已经配置为能够自动识别和使用 `.env.development` 和 `.env.production` 文件中的环境变量。

## 🔄 工作原理

### 环境变量传递流程

```
.env 文件 → docker-compose.yml → Dockerfile (ARG) → 构建时环境变量 (ENV) → Vite 构建 → 最终应用
```

1. **Docker Compose 读取环境文件**：通过 `env_file` 指令加载对应的 `.env` 文件
2. **传递给 Docker 构建**：通过 `build.args` 将环境变量传递给 Dockerfile
3. **Dockerfile 接收参数**：使用 `ARG` 接收构建参数
4. **转换为环境变量**：将 `ARG` 转换为 `ENV`，供 Vite 读取
5. **Vite 构建**：Vite 在构建时将环境变量注入到代码中

## 📁 文件对应关系

| 环境 | Docker Compose 文件 | Dockerfile | 环境变量文件 | 端口 |
|------|---------------------|------------|--------------|------|
| 开发 | `docker-compose.yml` | `Dockerfile` | `.env.development` | 3000 |
| 生产 | `docker-compose.prod.yml` | `Dockerfile.prod` | `.env.production` | 80 |

## 🚀 使用方法

### 开发环境

```bash
# 1. 确保 .env.development 文件存在
ls -la .env.development

# 2. 构建并启动（会自动加载 .env.development）
docker-compose up -d --build

# 3. 查看日志
docker-compose logs -f

# 4. 访问应用
open http://localhost:3000
```

### 生产环境

```bash
# 1. 确保 .env.production 文件存在并已配置正确的 API 地址
nano .env.production

# 2. 构建并启动（会自动加载 .env.production）
docker-compose -f docker-compose.prod.yml up -d --build

# 3. 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 4. 访问应用
open http://localhost
```

## 🔧 配置详解

### docker-compose.yml（开发环境）

```yaml
services:
  huozaijiankong:
    build:
      args:
        # 从 .env.development 读取变量并传递给构建过程
        - VITE_API_BASE_URL=${VITE_API_BASE_URL}
        - VITE_WS_URL=${VITE_WS_URL}
        # ... 其他变量
    env_file:
      - .env.development  # 加载开发环境变量文件
```

### docker-compose.prod.yml（生产环境）

```yaml
services:
  huozaijiankong:
    build:
      args:
        # 从 .env.production 读取变量并传递给构建过程
        - VITE_API_BASE_URL=${VITE_API_BASE_URL}
        - VITE_WS_URL=${VITE_WS_URL}
        # ... 其他变量
    env_file:
      - .env.production  # 加载生产环境变量文件
```

### Dockerfile 中的环境变量处理

```dockerfile
# 1. 接收构建参数
ARG VITE_API_BASE_URL
ARG VITE_WS_URL

# 2. 转换为环境变量（Vite 才能读取）
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

# 3. 执行构建（Vite 会使用这些环境变量）
RUN npm run build
```

## 📝 支持的环境变量

以下环境变量会从 `.env` 文件传递到 Docker 构建过程：

| 变量名 | 说明 | 开发环境默认值 | 生产环境默认值 |
|--------|------|----------------|----------------|
| `NODE_ENV` | Node 环境 | `development` | `production` |
| `VITE_APP_ENV` | 应用环境 | `development` | `production` |
| `VITE_APP_TITLE` | 应用标题 | - | - |
| `VITE_APP_NAME` | 应用名称 | - | - |
| `VITE_APP_VERSION` | 应用版本 | - | - |
| `VITE_API_BASE_URL` | API 地址 | `http://localhost:8080` | 需配置 |
| `VITE_WS_URL` | WebSocket 地址 | `ws://localhost:8080/ws` | 需配置 |
| `VITE_ENABLE_MOCK` | 启用 Mock | `true` | `false` |
| `VITE_ENABLE_DEVTOOLS` | 启用开发工具 | `true` | `false` |
| `VITE_LOG_LEVEL` | 日志级别 | `debug` | `error` |

## 🔍 验证环境变量

### 方法 1：查看构建日志

```bash
# 开发环境
docker-compose build 2>&1 | grep VITE_

# 生产环境
docker-compose -f docker-compose.prod.yml build 2>&1 | grep VITE_
```

### 方法 2：进入容器检查

```bash
# 开发环境
docker exec -it huozaijiankong-dashboard sh
cat /usr/share/nginx/html/assets/*.js | grep -o "http://localhost:8080" | head -1

# 生产环境
docker exec -it huozaijiankong-prod sh
cat /usr/share/nginx/html/assets/*.js | grep -o "https://api" | head -1
```

### 方法 3：浏览器检查

打开浏览器开发者工具 → Network → 查看 API 请求地址

## ⚠️ 重要注意事项

### 1. 环境变量在构建时注入

```bash
# ❌ 错误：修改 .env 文件后直接启动容器
docker-compose up -d

# ✅ 正确：需要重新构建
docker-compose up -d --build
```

### 2. 环境变量是公开的

- ⚠️ 所有 `VITE_` 开头的变量都会暴露到前端代码中
- ⚠️ 不要在 `.env` 文件中存储敏感信息（API 密钥、密码等）

### 3. 默认值处理

在 `docker-compose.yml` 中使用了默认值：

```yaml
- VITE_ENABLE_MOCK=${VITE_ENABLE_MOCK:-true}
#                                      ^^^^ 如果未设置，使用此默认值
```

### 4. 构建缓存

如果环境变量没有生效，尝试清除构建缓存：

```bash
# 清除缓存并重新构建
docker-compose build --no-cache

# 或
docker-compose -f docker-compose.prod.yml build --no-cache
```

## 🔄 常用命令

### 开发环境

```bash
# 构建并启动
docker-compose up -d --build

# 停止
docker-compose down

# 重启
docker-compose restart

# 查看日志
docker-compose logs -f

# 进入容器
docker exec -it huozaijiankong-dashboard sh
```

### 生产环境

```bash
# 构建并启动
docker-compose -f docker-compose.prod.yml up -d --build

# 停止
docker-compose -f docker-compose.prod.yml down

# 重启
docker-compose -f docker-compose.prod.yml restart

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 进入容器
docker exec -it huozaijiankong-prod sh
```

### 清理

```bash
# 停止并删除容器、网络
docker-compose down

# 停止并删除容器、网络、镜像
docker-compose down --rmi all

# 清理所有未使用的 Docker 资源
docker system prune -a
```

## 🐛 故障排查

### 问题 1：环境变量没有生效

**症状**：应用仍然使用默认配置或旧配置

**解决方案**：
```bash
# 1. 确认 .env 文件存在
ls -la .env.development .env.production

# 2. 清除缓存并重新构建
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 3. 检查构建日志
docker-compose logs
```

### 问题 2：API 地址不正确

**症状**：前端无法连接到后端 API

**解决方案**：
```bash
# 1. 检查 .env 文件中的 API 地址
cat .env.production | grep VITE_API_BASE_URL

# 2. 确认构建时使用了正确的环境变量
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. 检查浏览器网络请求
# 打开浏览器开发者工具 → Network → 查看实际请求地址
```

### 问题 3：容器无法启动

**症状**：`docker-compose up` 失败

**解决方案**：
```bash
# 1. 查看详细日志
docker-compose logs

# 2. 检查端口是否被占用
lsof -i :3000  # 开发环境
lsof -i :80    # 生产环境

# 3. 检查 Docker 是否正常运行
docker ps
docker info
```

### 问题 4：找不到 .env 文件

**症状**：`ERROR: Couldn't find env file`

**解决方案**：
```bash
# 复制示例文件创建实际配置
cp .env.development.example .env.development
cp .env.production.example .env.production

# 编辑配置
nano .env.development
nano .env.production
```

## 📚 参考资料

- [Docker Compose 环境变量文档](https://docs.docker.com/compose/environment-variables/)
- [Dockerfile ARG vs ENV](https://docs.docker.com/engine/reference/builder/#arg)
- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)

## ✅ 检查清单

在部署前，请确认：

- [ ] `.env.development` 文件已创建
- [ ] `.env.production` 文件已创建并配置正确的 API 地址
- [ ] 生产环境的 `VITE_API_BASE_URL` 已修改为实际地址
- [ ] 生产环境的 `VITE_WS_URL` 已修改为实际地址
- [ ] 已使用 `--build` 参数重新构建镜像
- [ ] 端口 3000（开发）或 80（生产）未被占用
- [ ] Docker 服务正常运行

---

**快速开始**：
```bash
# 开发环境
docker-compose up -d --build

# 生产环境
docker-compose -f docker-compose.prod.yml up -d --build
```

