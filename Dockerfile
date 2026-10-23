# -----------------------------------------------------------------------------
# Base Image Arguments
# -----------------------------------------------------------------------------
ARG BUN_VERSION=1.4-alpine
ARG NODE_VERSION=24-alpine

# =============================================================================
# Stage 1: 依赖安装阶段 (利用 Bun 极速包管理器与构建缓存)
# =============================================================================
FROM oven/bun:${BUN_VERSION} AS deps
WORKDIR /app

# 仅拷贝依赖清单，最大限度命中 Docker 缓存
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# =============================================================================
# Stage 2: 编译构建阶段 (Next.js 16 Standalone 独立模式)
# =============================================================================
FROM oven/bun:${BUN_VERSION} AS builder
WORKDIR /app

# 禁用构建期 Next.js 遥测，加速构建
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# 预留 CI/CD 多环境动态注入的公共构建参数
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENABLE_MOCK

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 挂载 Next.js 编译缓存，大幅加速 CI/CD 迭代构建
RUN --mount=type=cache,target=/app/.next/cache \
    bun run build

# =============================================================================
# Stage 3: 生产运行阶段 (Node.js 24 Alpine 独立运行基座)
# =============================================================================
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

# 1. 固化上海时区并清理包缓存，确保零残留额外体积
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

# 2. 生产运行时环境配置
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3500 \
    HOSTNAME="0.0.0.0" \
    TZ=Asia/Shanghai

# 3. 仅拷贝 Standalone 独立服务端产物与公共静态资源 (体积缩减至几十 MB 级别)
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# 4. 切换为 Node 官方镜像自带的非特权安全用户 (UID 1000)
USER node

EXPOSE 3500

# 5. 利用 Node.js 24 原生内置 global fetch 实现零依赖健康检查探针
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e 'fetch("http://127.0.0.1:" + (process.env.PORT || 3500) + "/api/health").then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))'

CMD ["node", "server.js"]
