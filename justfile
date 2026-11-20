set shell := ["bash", "-euo", "pipefail", "-c"]
# 不加载 .env：just 的 dotenv 解析比 @next/env 严格（含空格的值必须加引号），
# 而 next / vitest / bun 都会自行读取 .env，这里再解析一次只会引发启动失败。

# 列出所有命令
default:
    @just --list

# 启动开发服务器（next dev）
dev:
    @bun run dev

# 生产构建（next build）
build:
    @bun run build

# 启动生产服务（next start）
start:
    @bun run start

# oxlint 静态检查并自动修复
lint:
    @bun run lint

# oxfmt 格式化
fmt:
    @bun run fmt

# TypeScript 类型检查
typecheck:
    @bun run typecheck

# 全量检查：oxlint + oxfmt + tsc
check:
    @bun run check

# 运行单元测试（vitest run）
test:
    @bun run test

# 覆盖率测试，对应 package.json 的 test:coverage（just 不支持冒号，用连字符）
test-coverage:
    @bun run test:coverage

# 密钥泄漏扫描
gitleaks:
    @bun run gitleaks

# 暂存区密钥扫描，对应 package.json 的 gitleaks:staged
gitleaks-staged:
    @bun run gitleaks:staged
