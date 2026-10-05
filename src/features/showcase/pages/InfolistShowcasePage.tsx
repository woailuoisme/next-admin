"use client";

import { Code2, FileText, Layers, Package, Palette, Sparkles, User } from "lucide-react";
import * as React from "react";

import { BackToTop } from "@/components/back-to-top";
import {
  CodeEntry,
  ColorEntry,
  IconEntry,
  ImageEntry,
  Infolist,
  InfolistCallout,
  InfolistFieldset,
  InfolistSection,
  InfolistTabs,
  KeyValueEntry,
  RepeatableEntry,
  TextEntry,
} from "@/components/infolist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const sampleUserData = {
  id: "USR-94820",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 234-5678",
  website: "https://alexmorgan.dev",
  role: "Lead Platform Architect",
  status: "active",
  isVerified: true,
  isTwoFactorEnabled: true,
  balance: 12450.75,
  reputation: 98.6,
  joinedAt: "2024-03-15T09:30:00Z",
  themeColor: "#6366f1",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  portfolio: [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&auto=format&fit=crop&q=80",
  ],
  systemConfig: {
    runtime: "Bun 1.4",
    framework: "Next.js 16 + TanStack Query",
    region: "us-east-1",
    maxConcurrency: 100,
  },
  metadata: {
    department: "Infrastructure Core",
    clearanceLevel: "Level 4 (High)",
    costCenter: "CC-409",
    lastAudit: "2026-08-30",
  },
  recentOrders: [
    {
      orderNo: "ORD-2026-001",
      title: "Enterprise Server Node X1",
      amount: 3200,
      status: "Delivered",
      date: "2026-09-01",
    },
    {
      orderNo: "ORD-2026-002",
      title: "Edge Gateway Appliance Pro",
      amount: 1450,
      status: "Shipped",
      date: "2026-09-04",
    },
    {
      orderNo: "ORD-2026-003",
      title: "High-Throughput NVMe Storage Array",
      amount: 5800,
      status: "Processing",
      date: "2026-09-08",
    },
  ],
};

export function InfolistShowcasePage() {
  const [orientation, setOrientation] = React.useState<"vertical" | "horizontal">("vertical");
  const [dense, setDense] = React.useState(false);
  const [repeatableVariant, setRepeatableVariant] = React.useState<"card" | "grid" | "table">(
    "card",
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Infolists & Callouts Showcase
            </h1>
            <span className="border-primary/20 bg-primary/10 text-primary rounded-md border px-2 py-0.5 text-xs font-semibold">
              Filament v5 Standard
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            对标 Filament v5 Infolists 与 Callouts 规范，全站统一的只读数据展示系统与提示卡片套件。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={orientation === "vertical" ? "default" : "outline"}
            size="sm"
            className="h-8 cursor-pointer text-xs"
            onClick={() => setOrientation("vertical")}
          >
            上下堆叠
          </Button>
          <Button
            variant={orientation === "horizontal" ? "default" : "outline"}
            size="sm"
            className="h-8 cursor-pointer text-xs"
            onClick={() => setOrientation("horizontal")}
          >
            行内水平
          </Button>
          <Button
            variant={dense ? "default" : "outline"}
            size="sm"
            className="h-8 cursor-pointer text-xs"
            onClick={() => setDense(!dense)}
          >
            {dense ? "紧凑模式" : "宽松排版"}
          </Button>
        </div>
      </div>

      {/* Section 1: Callouts Showcase */}
      <Card className="border-border shadow-xs">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary size-4" />
            <CardTitle className="text-base font-semibold">
              Callouts 提示卡片矩阵 (Schemas / Callouts)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            基于 6 大 Tailwind 语义色彩 Token，支持标题、多行内容、动作按钮、可关闭及行内紧凑模式。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {/* Compact Mode Row */}
          <div className="space-y-2">
            <span className="text-muted-foreground text-xs font-semibold">
              紧凑单行模式 (compact=true)
            </span>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfolistCallout
                compact
                color="primary"
                title="系统更新提醒"
                description="核心内核已升级至最新版本"
                actions={[
                  {
                    label: "查看日志",
                    variant: "outline",
                    onClick: () => {},
                  },
                ]}
              />
              <InfolistCallout
                compact
                color="success"
                title="支付验证已通过"
                description="账户自动续订成功"
                dismissible
              />
            </div>
          </div>

          {/* Rich Standard Cards */}
          <div className="space-y-2 pt-2">
            <span className="text-muted-foreground text-xs font-semibold">
              标准卡片模式 (包含操作按钮、自定义图标与可关闭交互)
            </span>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InfolistCallout
                color="info"
                title="API 接入密钥即将过期"
                description="您的生产环境专用令牌将于 7 天后到期，请尽快前往开发者平台轮换。"
                dismissible
                actions={[
                  {
                    label: "立即轮换",
                    variant: "default",
                    onClick: () => {},
                  },
                  {
                    label: "开发文档",
                    variant: "ghost",
                    href: "#",
                    external: true,
                  },
                ]}
              />

              <InfolistCallout
                color="warning"
                title="存储容量临界警告"
                description="当前主节点 NVMe 阵列使用率已达 88.4%，系统将在超过 95% 时限制写入。"
                actions={[
                  {
                    label: "扩容配额",
                    variant: "default",
                    onClick: () => {},
                  },
                ]}
              />

              <InfolistCallout
                color="destructive"
                title="节点失联故障 (3 个容器离线)"
                description="集群位于 us-west-2 的工作节点失去心跳响应，自动故障转移已触发。"
                dismissible
                actions={[
                  {
                    label: "紧急恢复",
                    variant: "default",
                    onClick: () => {},
                  },
                ]}
              />

              <InfolistCallout
                color="neutral"
                title="配置生效说明"
                description="所有安全审计策略的改动将在下次轮询生效，预计生效延时不超过 60 秒。"
              />

              <InfolistCallout
                color="primary"
                title="已启用端到端加密保护"
                description="全链路 TLS 1.3 与 KMS 硬件主密钥双重校验已就绪，保障数据安全。"
                actions={[
                  {
                    label: "配置参数",
                    variant: "outline",
                    onClick: () => {},
                  },
                ]}
              />

              <InfolistCallout
                color="success"
                title="安全合规审计通过"
                description="恭喜！本系统已顺利通过 SOC2 Type II 与 ISO 27001 年度合规核验。"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Infolist Complete Record Showcase */}
      <Card className="border-border shadow-xs">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="text-primary size-4" />
              <CardTitle className="text-base font-semibold">
                Infolist 完整只读详情面板 (Context + Declarative Entries)
              </CardTitle>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span>数据驱动 Context:</span>
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono">
                record=sampleUserData
              </code>
            </div>
          </div>
          <CardDescription className="text-xs">
            基于 InfolistContext 自动解析 name 属性路径，支持 Text, Badge, Currency, Image, Color,
            Code, KeyValue, Repeatable 等全谱系条目。
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Infolist
            record={sampleUserData}
            orientation={orientation}
            dense={dense}
            className="space-y-6"
          >
            {/* Top Section: User Profile & Status */}
            <InfolistSection
              title="用户主体与基本档案"
              description="系统用户的基本通讯、权限定位与认证状态"
              icon={<User className="size-4" />}
              columns={{ sm: 1, md: 2, lg: 4 }}
            >
              <TextEntry
                name="id"
                label="用户唯一识别码"
                copyable
                tooltip="不可变更的系统唯一主键 UUID"
              />
              <TextEntry name="name" label="真实全名" helperText="由身份提供商 SSO 自动同步" />
              <TextEntry name="email" label="企业电子邮箱" format="email" copyable />
              <TextEntry name="phone" label="手机联系方式" format="phone" />
              <TextEntry name="website" label="个人主页站点" format="url" />
              <TextEntry name="role" label="职权角色" format="badge" color="primary" />
              <IconEntry name="isVerified" label="实名认证" text="已完成企业实名" />
              <IconEntry name="isTwoFactorEnabled" label="双因子认证 (2FA)" text="硬件密钥保护" />
            </InfolistSection>

            {/* Middle Section: Financial & Design Assets */}
            <InfolistSection
              title="财务指标与视觉媒体"
              description="涉及资金流水、品牌主题色及相册 Lightbox 放大预览"
              icon={<Palette className="size-4" />}
              columns={{ sm: 1, md: 3 }}
              collapsible
            >
              <TextEntry
                name="balance"
                label="授信钱包余额"
                format="currency"
                currency="USD"
                decimals={2}
                tooltip="支持实时提现与抵扣订单"
              />
              <TextEntry
                name="reputation"
                label="信誉得分指数"
                format="number"
                decimals={1}
                suffix="/ 100"
              />
              <TextEntry name="joinedAt" label="系统入驻时间" format="date" />
              <ColorEntry name="themeColor" label="品牌偏好主色" showText copyable />
              <ImageEntry name="avatar" label="用户个人头像" shape="circular" size="md" lightbox />
              <ImageEntry
                name="portfolio"
                label="项目图库 (点击 Lightbox 放大)"
                shape="rounded"
                size="md"
                lightbox
                colSpan={1}
              />
            </InfolistSection>

            {/* System Metadata Fieldset */}
            <InfolistFieldset
              legend="企业架构元数据 (Fieldset 嵌套)"
              description="收敛于组织部门、审计跟踪及内部成本中心的结构化数据"
              columns={{ sm: 1, md: 2 }}
            >
              <KeyValueEntry name="metadata" label="组织元数据清单 (List 模式)" variant="list" />
              <KeyValueEntry
                name="systemConfig"
                label="底层系统参数 (Table 模式)"
                variant="table"
              />
            </InfolistFieldset>

            {/* Raw JSON Code Block */}
            <InfolistSection
              title="开发者数据预览 (CodeEntry)"
              description="以高亮格式化的 JSON 代码块完整展现当前 record"
              icon={<Code2 className="size-4" />}
              collapsible
              defaultCollapsed
            >
              <CodeEntry
                name="systemConfig"
                label="运行时环境描述符 (JSON)"
                language="json"
                copyable
              />
            </InfolistSection>

            {/* Repeatable Entry: Orders */}
            <InfolistSection
              title="关联历史订单列表 (RepeatableEntry)"
              description="支持卡片、网格、表格三种形态，支持项标题、折叠以及空状态处理"
              icon={<Package className="size-4" />}
              action={
                <div className="flex items-center gap-1">
                  <Button
                    variant={repeatableVariant === "card" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => setRepeatableVariant("card")}
                  >
                    卡片
                  </Button>
                  <Button
                    variant={repeatableVariant === "grid" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => setRepeatableVariant("grid")}
                  >
                    网格
                  </Button>
                  <Button
                    variant={repeatableVariant === "table" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => setRepeatableVariant("table")}
                  >
                    表格
                  </Button>
                </div>
              }
            >
              <RepeatableEntry
                name="recentOrders"
                variant={repeatableVariant}
                gridCols={3}
                collapsible={repeatableVariant === "card"}
                itemTitle={(item) => `${item.orderNo} · ${item.title}`}
                tableHeaders={
                  repeatableVariant === "table"
                    ? ["关联订单 / 标的", "订单金额", "履约状态", "创建日期"]
                    : undefined
                }
              >
                {(item) => (
                  <div
                    className={cn(
                      "grid gap-2 text-xs",
                      repeatableVariant === "table"
                        ? "grid-cols-3 items-center"
                        : "grid-cols-1 sm:grid-cols-3",
                    )}
                  >
                    <div>
                      {repeatableVariant !== "table" && (
                        <span className="text-muted-foreground block text-[11px]">订单金额</span>
                      )}
                      <span className="text-primary font-mono font-semibold">
                        ${item.amount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      {repeatableVariant !== "table" && (
                        <span className="text-muted-foreground block text-[11px]">履约状态</span>
                      )}
                      <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium">
                        {item.status}
                      </span>
                    </div>
                    <div>
                      {repeatableVariant !== "table" && (
                        <span className="text-muted-foreground block text-[11px]">创建日期</span>
                      )}
                      <span className="text-foreground">{item.date}</span>
                    </div>
                  </div>
                )}
              </RepeatableEntry>
            </InfolistSection>

            {/* Infolist Tabs Layout */}
            <InfolistSection
              title="分标签页展示 (InfolistTabs)"
              description="多维度复杂数据按 Tab 分类分页承载"
              icon={<FileText className="size-4" />}
            >
              <InfolistTabs
                tabs={[
                  {
                    value: "overview",
                    label: "档案概览",
                    columns: { sm: 1, md: 3 },
                    children: (
                      <>
                        <TextEntry name="id" label="识别码" />
                        <TextEntry name="name" label="姓名" />
                        <TextEntry name="role" label="岗位" format="badge" color="primary" />
                      </>
                    ),
                  },
                  {
                    value: "security",
                    label: "安全合规",
                    badge: "Verified",
                    columns: { sm: 1, md: 2 },
                    children: (
                      <>
                        <IconEntry name="isVerified" label="实名认证" text="已核准" />
                        <IconEntry name="isTwoFactorEnabled" label="2FA 状态" text="已开启" />
                      </>
                    ),
                  },
                  {
                    value: "system",
                    label: "机器配置",
                    columns: 1,
                    children: <KeyValueEntry name="systemConfig" variant="table" />,
                  },
                ]}
              />
            </InfolistSection>
          </Infolist>
        </CardContent>
      </Card>

      <BackToTop />
    </div>
  );
}
