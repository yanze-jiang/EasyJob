#!/bin/bash

# EasyJob 快速更新部署脚本
# 用于在服务器上快速拉取最新代码并重启服务

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  EasyJob 快速更新部署"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取项目根目录（假设脚本在项目根目录运行）
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "项目目录: $PROJECT_DIR"
echo ""

# 步骤 1: 拉取最新代码
echo "步骤 1: 拉取最新代码..."
if git pull origin main; then
    echo -e "${GREEN}✓${NC} 代码更新成功"
else
    echo -e "${RED}✗${NC} 代码更新失败"
    exit 1
fi
echo ""

# 步骤 2: 检查是否有新的依赖
echo "步骤 2: 检查并安装依赖..."

# 后端依赖
echo "检查后端依赖..."
cd backend
if [ -f "package.json" ]; then
    # 检查 package.json 是否有变化
    if git diff HEAD@{1} HEAD -- package.json > /dev/null 2>&1 || [ -n "$(git diff HEAD@{1} HEAD -- package-lock.json)" ]; then
        echo "检测到依赖变化，正在安装..."
        npm install
        echo -e "${GREEN}✓${NC} 后端依赖安装完成"
    else
        echo "后端依赖无变化，跳过安装"
    fi
else
    echo -e "${YELLOW}⚠${NC} package.json 不存在"
fi
cd ..

# 前端依赖
echo "检查前端依赖..."
cd frontend
if [ -f "package.json" ]; then
    if git diff HEAD@{1} HEAD -- package.json > /dev/null 2>&1 || [ -n "$(git diff HEAD@{1} HEAD -- package-lock.json)" ]; then
        echo "检测到依赖变化，正在安装..."
        npm install
        echo -e "${GREEN}✓${NC} 前端依赖安装完成"
    else
        echo "前端依赖无变化，跳过安装"
    fi
else
    echo -e "${YELLOW}⚠${NC} package.json 不存在"
fi
cd ..
echo ""

# 步骤 3: 构建后端
echo "步骤 3: 构建后端..."
cd backend
if npm run build; then
    echo -e "${GREEN}✓${NC} 后端构建成功"
else
    echo -e "${RED}✗${NC} 后端构建失败"
    exit 1
fi
cd ..
echo ""

# 步骤 4: 重启后端服务
echo "步骤 4: 重启后端服务..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "easyjob-backend"; then
        echo "重启 PM2 服务..."
        pm2 restart easyjob-backend
        echo -e "${GREEN}✓${NC} 后端服务已重启"
    else
        echo "启动新的 PM2 服务..."
        cd backend
        pm2 start dist/server.js --name easyjob-backend
        cd ..
        echo -e "${GREEN}✓${NC} 后端服务已启动"
    fi
    
    # 显示服务状态
    echo ""
    echo "服务状态:"
    pm2 status easyjob-backend
else
    echo -e "${YELLOW}⚠${NC} PM2 未安装，请手动重启后端服务"
    echo "  运行: cd backend && node dist/server.js"
fi
echo ""

# 步骤 5: 构建前端
echo "步骤 5: 构建前端..."
cd frontend
if npm run build; then
    echo -e "${GREEN}✓${NC} 前端构建成功"
else
    echo -e "${RED}✗${NC} 前端构建失败"
    exit 1
fi
cd ..
echo ""

# 步骤 6: 验证
echo "步骤 6: 验证部署..."
echo "等待服务启动..."
sleep 2

# 检查后端健康状态
if command -v curl &> /dev/null; then
    echo "检查后端健康状态..."
    if curl -s http://localhost:4000/api/health > /dev/null; then
        echo -e "${GREEN}✓${NC} 后端服务运行正常"
        curl -s http://localhost:4000/api/health | head -c 100
        echo ""
    else
        echo -e "${YELLOW}⚠${NC} 无法连接到后端服务，请检查日志"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl 未安装，跳过健康检查"
fi
echo ""

# 步骤 7: 显示日志
echo "步骤 7: 显示最近的服务日志..."
if command -v pm2 &> /dev/null; then
    echo "最近 20 行日志:"
    pm2 logs easyjob-backend --lines 20 --nostream
else
    echo -e "${YELLOW}⚠${NC} PM2 未安装，无法显示日志"
fi
echo ""

# 完成
echo "=========================================="
echo -e "${GREEN}部署更新完成！${NC}"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 检查前端文件是否需要更新到 Web 服务器目录"
echo "2. 如果使用 Nginx，确保前端 dist 目录已更新"
echo "3. 测试功能是否正常"
echo ""
echo "查看实时日志: pm2 logs easyjob-backend"
echo "查看服务状态: pm2 status"
