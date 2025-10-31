# 生产环境部署文档

## 📋 目录
- [快速部署](#快速部署)
- [配置说明](#配置说明)
- [安全最佳实践](#安全最佳实践)
- [性能优化](#性能优化)
- [监控和日志](#监控和日志)
- [故障排查](#故障排查)

## 🚀 快速部署

### 方法一：使用自动化部署脚本（推荐）

```bash
# 给脚本添加执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 方法二：手动部署

```bash
# 1. 构建生产镜像
docker-compose -f docker-compose.prod.yml build --no-cache

# 2. 启动容器
docker-compose -f docker-compose.prod.yml up -d

# 3. 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

## ⚙️ 配置说明

### 文件结构

```
.
├── Dockerfile              # 开发环境 Dockerfile
├── Dockerfile.prod         # 生产环境 Dockerfile ⭐
├── docker-compose.yml      # 开发环境配置
├── docker-compose.prod.yml # 生产环境配置 ⭐
├── nginx.conf             # Nginx 主配置（生产）⭐
├── nginx.prod.conf        # Nginx 虚拟主机配置 ⭐
├── .env.production        # 生产环境变量 ⭐
└── deploy.sh              # 自动化部署脚本 ⭐
```

### 环境变量配置

1. 复制环境变量模板：
```bash
cp .env.production .env.production.local
```

2. 修改 `.env.production.local`：
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_WS_URL=wss://your-api-domain.com/ws
```

### 域名配置

修改 `nginx.prod.conf`：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改为你的域名
    # ...
}
```

## 🔒 安全最佳实践

### 1. HTTPS 配置

#### 获取 SSL 证书（Let's Encrypt）

```bash
# 安装 certbot
apt-get install certbot

# 生成证书
certbot certonly --standalone -d your-domain.com
```

#### 配置 SSL

1. 创建证书目录：
```bash
mkdir -p ./ssl
```

2. 复制证书：
```bash
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
```

3. 在 `docker-compose.prod.yml` 中启用 HTTPS：
```yaml
ports:
  - "80:80"
  - "443:443"
volumes:
  - ./ssl:/etc/nginx/ssl:ro
```

4. 在 `nginx.prod.conf` 中取消 HTTPS 配置的注释

### 2. 防火墙配置

```bash
# Ubuntu/Debian
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# CentOS/RHEL
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

### 3. 定期更新

```bash
# 更新系统
apt update && apt upgrade -y

# 更新 Docker 镜像
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## ⚡ 性能优化

### 1. 资源限制

生产配置已设置：
- CPU 限制：1 核心
- 内存限制：512MB

根据实际情况调整 `docker-compose.prod.yml`：
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'      # 增加 CPU
      memory: 1024M    # 增加内存
```

### 2. 多副本部署

使用 Docker Swarm：
```bash
# 初始化 Swarm
docker swarm init

# 部署服务（3 个副本）
docker stack deploy -c docker-compose.prod.yml huozaijiankong
```

### 3. CDN 配置

对于静态资源，建议使用 CDN：
- 阿里云 CDN
- 腾讯云 CDN
- Cloudflare

## 📊 监控和日志

### 查看日志

```bash
# 实时查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看最近 100 行
docker-compose -f docker-compose.prod.yml logs --tail=100

# 查看特定服务
docker-compose -f docker-compose.prod.yml logs huozaijiankong
```

### 日志文件位置

日志存储在 Docker 卷中：
```bash
# 查看日志卷
docker volume ls | grep nginx-logs

# 查看日志内容
docker run --rm -v huozaijiankong_nginx-logs:/logs alpine ls -la /logs
```

### 健康检查

```bash
# 检查容器健康状态
docker ps

# 手动执行健康检查
curl http://localhost/health
```

### 监控工具集成

推荐使用：
- **Prometheus + Grafana**：指标监控
- **ELK Stack**：日志分析
- **Sentry**：错误追踪

## 🔧 故障排查

### 容器无法启动

```bash
# 查看容器状态
docker-compose -f docker-compose.prod.yml ps

# 查看详细日志
docker-compose -f docker-compose.prod.yml logs

# 检查配置文件语法
docker-compose -f docker-compose.prod.yml config
```

### 网站无法访问

1. 检查容器是否运行：
```bash
docker ps | grep huozaijiankong
```

2. 检查端口是否开放：
```bash
netstat -tlnp | grep :80
```

3. 测试容器内部：
```bash
docker exec huozaijiankong-prod wget -O- http://localhost
```

### 性能问题

```bash
# 查看资源使用情况
docker stats huozaijiankong-prod

# 查看容器详细信息
docker inspect huozaijiankong-prod
```

## 🔄 回滚操作

如果新版本有问题，快速回滚：

```bash
# 查看备份镜像
docker images | grep backup

# 停止当前容器
docker-compose -f docker-compose.prod.yml down

# 运行备份版本
docker run -d \
  --name huozaijiankong-prod \
  -p 80:80 \
  --restart always \
  huozaijiankong-dashboard-backup:20231030_120000
```

## 📝 常用运维命令

```bash
# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 查看运行状态
docker-compose -f docker-compose.prod.yml ps

# 更新服务
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# 清理未使用的资源
docker system prune -a
```

## 🌐 生产环境检查清单

部署前请确认：

- [ ] 已修改域名配置
- [ ] 已配置 SSL 证书（如需要）
- [ ] 已设置防火墙规则
- [ ] 已配置环境变量
- [ ] 已设置资源限制
- [ ] 已配置日志收集
- [ ] 已设置监控告警
- [ ] 已准备备份策略
- [ ] 已测试健康检查
- [ ] 已编写回滚方案

## 📞 技术支持

如遇问题，请检查：
1. 容器日志
2. Nginx 错误日志
3. 系统资源使用情况
4. 网络连接状态

---

**注意**：生产环境部署需要根据实际情况调整配置，建议先在测试环境验证。

