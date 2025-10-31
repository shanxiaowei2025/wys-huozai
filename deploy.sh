#!/bin/bash

###############################################################################
# 生产环境部署脚本
# 用途：自动化部署 Docker 容器到生产环境
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
IMAGE_NAME="huozaijiankong-dashboard"
CONTAINER_NAME="huozaijiankong-prod"
COMPOSE_FILE="docker-compose.prod.yml"

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    print_message "检查 Docker 环境..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    print_message "Docker 环境检查通过 ✓"
}

# 备份当前运行的容器
backup_current() {
    print_message "检查是否存在旧容器..."
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        print_warning "发现运行中的容器，准备备份..."
        docker commit $CONTAINER_NAME ${IMAGE_NAME}-backup:$(date +%Y%m%d_%H%M%S)
        print_message "容器备份完成 ✓"
    fi
}

# 停止并删除旧容器
stop_old_container() {
    print_message "停止旧容器..."
    docker-compose -f $COMPOSE_FILE down
    print_message "旧容器已停止 ✓"
}

# 构建新镜像
build_image() {
    print_message "开始构建生产环境镜像..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    print_message "镜像构建完成 ✓"
}

# 启动新容器
start_container() {
    print_message "启动新容器..."
    docker-compose -f $COMPOSE_FILE up -d
    print_message "容器启动完成 ✓"
}

# 健康检查
health_check() {
    print_message "等待容器启动（30秒）..."
    sleep 30
    
    print_message "执行健康检查..."
    if docker exec $CONTAINER_NAME wget --quiet --tries=1 --spider http://localhost/health; then
        print_message "健康检查通过 ✓"
    else
        print_error "健康检查失败！"
        print_message "查看容器日志："
        docker-compose -f $COMPOSE_FILE logs --tail=50
        exit 1
    fi
}

# 清理旧镜像
cleanup() {
    print_message "清理未使用的镜像..."
    docker image prune -f
    print_message "清理完成 ✓"
}

# 显示部署信息
show_info() {
    echo ""
    echo "========================================="
    print_message "部署成功！"
    echo "========================================="
    echo "容器名称: $CONTAINER_NAME"
    echo "镜像名称: $IMAGE_NAME"
    echo "访问地址: http://localhost"
    echo ""
    echo "常用命令："
    echo "  查看日志: docker-compose -f $COMPOSE_FILE logs -f"
    echo "  重启服务: docker-compose -f $COMPOSE_FILE restart"
    echo "  停止服务: docker-compose -f $COMPOSE_FILE down"
    echo "========================================="
}

# 主函数
main() {
    echo ""
    echo "========================================="
    echo "   火灾监控大屏 - 生产环境部署"
    echo "========================================="
    echo ""
    
    check_docker
    backup_current
    stop_old_container
    build_image
    start_container
    health_check
    cleanup
    show_info
}

# 执行主函数
main

