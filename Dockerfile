# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine AS base

# 全局安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 安装依赖阶段
FROM base AS deps
WORKDIR /app

# 设置 pnpm store 目录
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 复制 package.json 和 lockfile
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 禁用遥测
ENV NEXT_TELEMETRY_DISABLED=1

# 构建应用
RUN pnpm build

# 生产阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]