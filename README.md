![Next Admin logo](src/app/icon.svg)

# Next Admin

面向中后台的企业级前端基座：Next.js 16 + React 19 + TanStack + shadcn/ui，内置数据表格、表单引擎、图表、地图与实时通知子系统。

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Bun](https://img.shields.io/badge/Bun-1.x-f472b6?logo=bun&logoColor=white)](https://bun.sh)
[![Docker](https://img.shields.io/badge/Image-ghcr.io-2496ED?logo=docker&logoColor=white)](https://github.com/woailuoisme/next-admin/pkgs/container/next-admin)

## 特性

- **资源 CRUD 范式**：产品、分类、订单、客户四套领域切片，统一的列表 / 表单 / 详情 / 批量操作 / 导出链路。
- **`DataTable` 子系统**：虚拟滚动、列宽拖拽、列重排与固定、列可见性、筛选与搜索、URL 状态同步、Excel 导出。
- **`FormFieldEngine`**：TanStack Form + zod，20+ 输入控件（文本、选择、日期、富文本、文件、Repeater、KeyValue、地图选点、密码强度、OTP）。
- **`Infolist` 只读引擎**：grid / sections / fieldsets / tabs 多种拓扑，声明式描述复杂实体详情。
- **可视化**：14 类 Recharts 图表 + 全屏对话框（按需分屏加载）、指标卡、趋势/进度/实时卡片、MapLibre 地图（高德 / 天地图底图与坐标系转换）。
- **实时通知**：Centrifugo WebSocket 订阅，配 `NotificationBell` 与演示页。
- **主题系统**：6 套主题 × 明暗模式，全部基于语义化 CSS 令牌动态换肤，零硬编码色值。
- **国际化**：`next-intl` 中英双语，Cookie 持久化，无路由前缀。
- **Mock 优先**：MSW + `@msw/data` + faker 确定性种子，开箱即跑，无需后端。
- **工程护栏**：oxlint / oxfmt / tsc / vitest / gitleaks 由 Lefthook 钩子与 Conventional Commits 把关。

## 技术栈

| 领域       | 选型                                                                                       |
| :--------- | :----------------------------------------------------------------------------------------- |
| 框架       | Next.js 16（App Router、Standalone 输出、`proxy.ts` 路由鉴权）、React 19                   |
| UI 基础    | shadcn/ui（`radix-nova`）+ `@base-ui/react`、lucide-react、sonner                          |
| 样式       | Tailwind CSS v4、tweakcn 主题令牌、next-themes                                             |
| 数据与状态 | TanStack Query（SSR 预取 + Hydration）、nuqs（URL 状态）、zustand                          |
| 表单       | TanStack Form、zod                                                                         |
| 表格与图表 | TanStack Table + Virtual、Recharts                                                         |
| 地图       | MapLibre GL + 高德 / 天地图                                                                |
| 实时       | Centrifugo（centrifuge 客户端 + Route Handler 签发 JWT）                                   |
| 国际化     | next-intl                                                                                  |
| Mock       | MSW 3 + `@msw/data` + `@faker-js/faker`                                                    |
| 测试       | Vitest + happy-dom + Testing Library                                                       |
| 质量工具   | oxlint、oxfmt、TypeScript、gitleaks、lefthook、rumdl                                       |
| 运行时     | Bun（开发与构建）、Node.js 24（生产运行）、Docker / GitHub Container Registry              |

## 快速开始

**前置要求**：Bun 1.4+（开发与构建）、Node.js 24+（生产运行）。

```bash
bun install
cp .env.example .env
bun run dev
```

打开 <http://localhost:3000>。开发环境默认启用 MSW，使用内置演示账号登录：

```text
邮箱：admin@example.com
密码：admin123
```

> [!NOTE]
> `next dev` 默认监听 `3000`，且不读取 `.env` 中的 `PORT`；需要固定端口请显式传入：`PORT=3500 bun run dev`。容器内由环境变量 `PORT=3500` 生效。
>
> 若 `NEXT_PUBLIC_ENABLE_MOCK=false`，前端将通过 `NEXT_PUBLIC_API_URL` 请求真实后端，接口契约见 [`api.md`](./api.md)。

### 环境变量

| 变量                                      | 作用域 | 默认值                | 说明                                     |
| :---------------------------------------- | :----- | :-------------------- | :--------------------------------------- |
| `PORT`                                    | 服务端 | `3500`                | 服务监听端口                             |
| `SERVER_URL`                              | 服务端 | `http://localhost:3500` | SSR 阶段拼接绝对 API 地址                |
| `NEXT_PUBLIC_APP_TITLE`                   | 客户端 | `Admin Panel`         | 应用标题                                 |
| `NEXT_PUBLIC_APP_URL`                     | 客户端 | 空                    | 站点绝对地址，用于 metadata              |
| `NEXT_PUBLIC_ENABLE_MOCK`                 | 客户端 | 开发环境 `true`       | 是否启用 MSW 拦截                        |
| `NEXT_PUBLIC_API_URL`                     | 客户端 | 空（相对 `/v1`）      | 真实后端基地址                           |
| `NEXT_PUBLIC_AMAP_KEY`                    | 客户端 | 空                    | 高德地图浏览器端 Key                     |
| `NEXT_PUBLIC_TIANDITU_TOKEN`              | 客户端 | 空                    | 天地图 Token                             |
| `NEXT_PUBLIC_CENTRIFUGE_WS_URL`           | 客户端 | 空                    | Centrifugo WebSocket 地址                |
| `CENTRIFUGO_API_URL`                      | 服务端 | 空                    | Centrifugo HTTP API 地址                 |
| `CENTRIFUGO_HTTP_API_KEY`                 | 服务端 | 空                    | 服务端发布消息鉴权 Key                   |
| `CENTRIFUGO_CLIENT_TOKEN_HMAC_SECRET_KEY` | 服务端 | 空                    | 客户端连接令牌签名密钥，需与服务端一致   |
| `NEXT_PUBLIC_GLITCHTIP_DSN`               | 客户端 | 空                    | 异常监控 DSN（GlitchTip / Sentry 兼容）  |

所有变量在 [`src/env.ts`](./src/env.ts) 中经 zod 校验，缺失或格式错误会在启动时显式报错。

## 常用脚本

| 命令                  | 说明                                        |
| :-------------------- | :------------------------------------------ |
| `bun run dev`         | 启动开发服务器                              |
| `bun run build`       | 生产构建（standalone）                      |
| `bun run start`       | 运行生产构建产物                            |
| `bun run check`       | 一键修复 + 校验：oxlint → oxfmt → tsc       |
| `bun run lint`        | oxlint 静态检查                             |
| `bun run fmt`         | oxfmt 格式化                                |
| `bun run typecheck`   | TypeScript 类型检查                         |
| `bun run test`        | Vitest 单次运行                             |
| `bun run test:watch`  | Vitest 监听模式                             |
| `bun run test:coverage` | 生成覆盖率报告                            |
| `bun run gitleaks`    | 全量密钥泄露扫描                            |
| `bunx shadcn@latest add <component>` | 新增基础 UI 组件（唯一合法方式） |

## 目录结构

```text
src/
├── app/                    # App Router
│   ├── (app)/              # 受保护工作区：overview / products / categories / orders / users / showcase
│   ├── (auth)/             # 登录、忘记密码（验证码 + 重置）
│   └── api/                # health、realtime/token、realtime/publish
├── components/
│   ├── ui/                 # shadcn CLI 生成，禁止手改
│   ├── data-table/         # 表格子系统（core / hooks / columns / cells / resource-table）
│   ├── form/               # 表单引擎（basic / choice / datetime / media / composite / layout / map / security）
│   ├── chart/ stats/ map/ infolist/ dialogs/ layout/ notifications/ shared/
│   └── resource/           # 资源页宿主与操作编排
├── features/               # 领域切片：api / queries / hooks / schemas / components / pages
├── mocks/                  # MSW handlers、内存数据库、数据工厂、seeded 假数据
├── lib/                    # apiClient / queryClient / excel / security / slug / zod
├── stores/                 # zustand：auth、preferences（主题）
├── i18n/ messages/         # next-intl 配置与 zh / en 词条
├── styles/themes/          # supabase / catppuccin / caffeine / twitter / vercel 主题令牌
├── types/                  # 共享类型
└── proxy.ts                # 路由级鉴权、根路径与登录态重定向
```

## 架构要点

- **SSR 首屏 + 客户端缓存**：页面在 Server Component 中 `prefetchQuery` 并 `HydrationBoundary` 注水，客户端复用同一 QueryClient 单例；查询默认 `staleTime` 60s。
- **表格双状态适配器**：`UrlTableStateAdapter` 以 URL 为唯一状态源（nuqs），`ClientTableStateAdapter` 服务纯内存场景，二者共享同一状态接口。
- **布局缝隙渲染**：列宽、固定偏移通过 CSS 自定义属性（`--col-w-*`、`--col-pin-left-*`）注入容器，高频交互不触发整表重渲染。
- **请求层统一**：`ky` + `apiClient` 负责请求 ID、鉴权头、401 会话清理、错误提示与响应解包。
- **主题零硬编码**：所有颜色走 `globals.css` / 主题包的语义化令牌，支持明暗与动态换肤。

术语与设计约定详见 [`GLOSSARY.md`](./GLOSSARY.md)。

## 测试

```bash
bun run test           # 全量单测与组件测试
bun run test:coverage  # 覆盖率报告（html / lcov）
```

测试分为 `test/unit`（工具函数、store、proxy、i18n 词条对齐、硬编码色值守卫等）、`test/components`（组件与页面行为）、`test/hooks`，环境为 happy-dom。`pre-push` 钩子会自动执行全量测试。

## 部署

### Docker（推荐）

```bash
docker build -t next-admin:latest .
docker run -p 3500:3500 --env-file .env.production next-admin:latest
```

镜像为多阶段构建：Bun 安装依赖并构建 → 拷贝 `.next/standalone` 至 `node:24-alpine` → 非 root 用户运行，暴露 `3500`，内置 `/api/health` 健康检查（`HEALTHCHECK` 每 30s 探测）。

### Docker Compose

```bash
docker network create frontend   # 仅首次
docker compose up -d --build
```

`docker-compose.yml` 复用外部 `frontend` 网络，便于与反向代理、Centrifugo 等服务编排在同一网络内。CI 在 push 到 `main` 或打 `v*.*.*` 标签时构建并推送镜像至 GHCR。

**实时能力（可选）**：需额外部署 Centrifugo 服务并配置上述 `CENTRIFUGO_*` 变量；`/api/realtime/token` 依据 HMAC 密钥签发客户端连接令牌，`/api/realtime/publish` 供服务端主动广播。

## 开发约定

- 基础组件统一通过 shadcn CLI 生成，`src/components/ui` 严禁手改，扩展一律在业务层组合包装。
- 样式只使用语义化设计令牌（`bg-background`、`text-muted-foreground`、`bg-primary` 等），禁止硬编码 HEX / RGB。
- 导入统一使用 `@/` 别名，类名合并使用 `cn`（来自 `cn` 包）。
- 提交信息遵循 Conventional Commits，`pre-commit` 自动执行 oxlint / oxfmt / tsc / gitleaks。

完整规范见 [`AGENTS.md`](./AGENTS.md)，接口接入指南见 [`api.md`](./api.md)。
