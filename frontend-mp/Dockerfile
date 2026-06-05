# Dockerfile for 乡村文化库 Mock Server
# 支持 ARM64 和 AMD64 架构

# 使用官方 Node.js 镜像（支持多架构）
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 生产阶段
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 从构建阶段复制 node_modules
COPY --from=builder /app/node_modules ./node_modules

# 复制应用代码
COPY mock/ ./mock/
COPY package.json ./

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 启动命令
CMD ["node", "mock/server.js"]
