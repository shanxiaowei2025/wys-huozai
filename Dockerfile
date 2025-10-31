# 多阶段构建
# 第一阶段：构建应用
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 接收构建参数（环境变量）
ARG NODE_ENV=development
ARG VITE_APP_ENV=development
ARG VITE_APP_TITLE
ARG VITE_APP_NAME
ARG VITE_APP_VERSION
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ARG VITE_ENABLE_MOCK
ARG VITE_ENABLE_DEVTOOLS
ARG VITE_LOG_LEVEL

# 将 ARG 转换为 ENV，以便 Vite 能够读取
ENV NODE_ENV=${NODE_ENV}
ENV VITE_APP_ENV=${VITE_APP_ENV}
ENV VITE_APP_TITLE=${VITE_APP_TITLE}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_ENABLE_MOCK=${VITE_ENABLE_MOCK}
ENV VITE_ENABLE_DEVTOOLS=${VITE_ENABLE_DEVTOOLS}
ENV VITE_LOG_LEVEL=${VITE_LOG_LEVEL}

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production=false

# 复制源代码
COPY . .

# 构建应用
RUN npm run build:skip-check

# 第二阶段：运行应用
FROM nginx:alpine

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

