# Docker 部署指南

## 快速开始

### 1. 使用 Docker Compose（推荐）

```bash
# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

访问地址：http://localhost:8080

### 2. 使用 Docker 命令

```bash
# 构建镜像
docker build -t huozaijiankong-dashboard .

# 运行容器
docker run -d \
  --name huozaijiankong \
  -p 8080:80 \
  --restart unless-stopped \
  huozaijiankong-dashboard

# 查看日志
docker logs -f huozaijiankong

# 停止容器
docker stop huozaijiankong

# 删除容器
docker rm huozaijiankong
```

## 配置说明

### 端口映射
- 默认映射：宿主机 8080 -> 容器 80
- 可以在 `docker-compose.yml` 中修改端口映射

### 自定义配置

#### 修改端口
编辑 `docker-compose.yml`：
```yaml
ports:
  - "3000:80"  # 改为你想要的端口
```

#### Nginx 配置
编辑 `nginx.conf` 文件可以自定义 Nginx 配置

## 常用命令

```bash
# 重新构建镜像
docker-compose build --no-cache

# 重启服务
docker-compose restart

# 查看容器状态
docker-compose ps

# 进入容器
docker-compose exec huozaijiankong sh

# 查看 Nginx 日志
docker-compose exec huozaijiankong cat /var/log/nginx/access.log
docker-compose exec huozaijiankong cat /var/log/nginx/error.log
```

## 镜像优化

当前 Dockerfile 使用多阶段构建：
1. 第一阶段：使用 Node.js 构建前端应用
2. 第二阶段：使用 Nginx 提供静态文件服务

这种方式可以：
- 减小最终镜像体积
- 提高部署效率
- 提升生产环境性能

## 故障排查

### 构建失败
```bash
# 清理 Docker 缓存重新构建
docker-compose build --no-cache
```

### 无法访问
1. 检查容器是否运行：`docker-compose ps`
2. 检查端口是否被占用：`lsof -i :8080`
3. 查看容器日志：`docker-compose logs`

### 更新应用
```bash
# 拉取最新代码后
docker-compose down
docker-compose build
docker-compose up -d
```

