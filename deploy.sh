#!/bin/bash

# EasyJob 部署脚本
# 此脚本将逐步引导你完成部署过程

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  EasyJob 部署助手"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 已安装"
        return 0
    else
        echo -e "${RED}✗${NC} $1 未安装"
        return 1
    fi
}

# 步骤 1: 检查环境
echo "步骤 1: 检查环境..."
check_command node
check_command npm
echo ""

# 步骤 2: 检查环境变量文件
echo "步骤 2: 检查环境变量配置..."
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env 文件存在"
else
    echo -e "${YELLOW}⚠${NC} backend/.env 文件不存在，需要创建"
fi

if [ -f "frontend/.env.production" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env.production 文件存在"
else
    echo -e "${YELLOW}⚠${NC} frontend/.env.production 文件不存在，需要创建"
fi
echo ""

# 步骤 3: 安装依赖
echo "步骤 3: 安装依赖..."
echo "正在安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "后端依赖已存在，跳过安装"
fi
cd ..

echo "正在安装前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "前端依赖已存在，跳过安装"
fi
cd ..
echo ""

# 步骤 4: 运行数据库迁移
echo "步骤 4: 数据库迁移..."
echo -e "${YELLOW}提示:${NC} 请确保数据库已启动并可以连接"
read -p "是否现在运行数据库迁移? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    npm run migrate
    cd ..
    echo -e "${GREEN}✓${NC} 数据库迁移完成"
else
    echo -e "${YELLOW}⚠${NC} 跳过数据库迁移，请稍后手动运行: cd backend && npm run migrate"
fi
echo ""

# 步骤 5: 构建应用
echo "步骤 5: 构建应用..."
echo "正在构建后端..."
cd backend
npm run build
if [ -d "dist" ]; then
    echo -e "${GREEN}✓${NC} 后端构建成功"
else
    echo -e "${RED}✗${NC} 后端构建失败"
    exit 1
fi
cd ..

echo "正在构建前端..."
cd frontend
npm run build
if [ -d "dist" ]; then
    echo -e "${GREEN}✓${NC} 前端构建成功"
else
    echo -e "${RED}✗${NC} 前端构建失败"
    exit 1
fi
cd ..
echo ""

# 步骤 6: 完成
echo "=========================================="
echo -e "${GREEN}部署准备完成！${NC}"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 检查构建产物:"
echo "   - backend/dist/ 目录包含编译后的后端代码"
echo "   - frontend/dist/ 目录包含前端静态文件"
echo ""
echo "2. 部署选项:"
echo "   - 使用 PM2: pm2 start backend/dist/server.js --name easyjob-backend"
echo "   - 使用 Nginx: 配置 Nginx 指向 frontend/dist 目录"
echo "   - 参考 DEPLOYMENT.md 获取详细部署说明"
echo ""

