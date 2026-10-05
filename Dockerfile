# -----------------------------------------------------------------------------
# Base Image Arguments
# -----------------------------------------------------------------------------
ARG BUN_VERSION=1.4-alpine

# 1. 依赖安装阶段 (利用 Bun 极速包管理器并缓存下载层)
FROM oven/bun:${BUN_VERSION} AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# 2. 编译构建阶段 (Next.js 16 Standalone 模式构建)
FROM oven/bun:${BUN_VERSION} AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

RUN bun run build

# 3. 生产运行阶段 (全栈纯 Bun 极速独立容器)
FROM oven/bun:${BUN_VERSION} AS runner
WORKDIR /app

RUN apk add --no-cache tzdata
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3500 \
    HOSTNAME="0.0.0.0" \
    TZ=Asia/Shanghai

# 仅拷贝 Standalone 独立服务端产物与公共静态资源 (体积缩减至几十 MB)
COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static

# 使用 oven/bun 镜像内置的无特权安全用户 bun (UID 1000 / GID 1000)
USER bun

EXPOSE 3500

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD bun -e 'fetch("http://127.0.0.1:" + (process.env.PORT || 3500) + "/api/health").then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))'

CMD ["bun", "server.js"]
