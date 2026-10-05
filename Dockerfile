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

# 客户端构建变量（构建期内联注入 HTML/JS 产物）
ARG NEXT_PUBLIC_ENABLE_MOCK="true"
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_AMAP_KEY=""
ARG NEXT_PUBLIC_TIANDITU_TOKEN=""
ARG NEXT_PUBLIC_CENTRIFUGE_WS_URL=""
ARG NEXT_PUBLIC_GLITCHTIP_DSN=""

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NEXT_PUBLIC_ENABLE_MOCK=$NEXT_PUBLIC_ENABLE_MOCK \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_AMAP_KEY=$NEXT_PUBLIC_AMAP_KEY \
    NEXT_PUBLIC_TIANDITU_TOKEN=$NEXT_PUBLIC_TIANDITU_TOKEN \
    NEXT_PUBLIC_CENTRIFUGE_WS_URL=$NEXT_PUBLIC_CENTRIFUGE_WS_URL \
    NEXT_PUBLIC_GLITCHTIP_DSN=$NEXT_PUBLIC_GLITCHTIP_DSN

RUN bun run build

# 3. 生产运行阶段 (全栈纯 Bun 极速独立容器)
FROM oven/bun:${BUN_VERSION} AS runner
WORKDIR /app

RUN apk add --no-cache tzdata
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3200 \
    HOSTNAME="0.0.0.0" \
    TZ=Asia/Shanghai

# 创建无特权安全运行用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs

# 仅拷贝 Standalone 独立服务端产物与公共静态资源 (体积缩减至几十 MB)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3200

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD bun -e 'fetch("http://127.0.0.1:" + (process.env.PORT || 3200) + "/api/health").then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))'

CMD ["bun", "server.js"]
