# 多阶段构建 Dockerfile
# 第一阶段：构建阶段
FROM node:18-alpine as builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production --silent

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：生产阶段
FROM nginx:alpine as production

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]

# 开发阶段（可选）
FROM node:18-alpine as development

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci --silent

# 复制源代码
COPY . .

# 暴露开发服务器端口
EXPOSE 3001

# 启动开发服务器
CMD ["npm", "run", "dev"]
