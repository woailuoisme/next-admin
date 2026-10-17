import { Code2, FileText, Layers, Package, Palette, User } from "lucide-react";
import * as React from "react";
import {
  CodeEntry,
  ColorEntry,
  IconEntry,
  ImageEntry,
  Infolist,
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
import { SAMPLE_USER_DATA } from "../constants";

interface RecordDetailsShowcaseCardProps {
  orientation: "vertical" | "horizontal";
  dense: boolean;
}

export function RecordDetailsShowcaseCard({ orientation, dense }: RecordDetailsShowcaseCardProps) {
  const [repeatableVariant, setRepeatableVariant] = React.useState<"card" | "grid" | "table">("card");

  return (
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
          基于 InfolistContext 自动解析 name 属性路径，支持 Text, Badge, Currency, Image, Color, Code,
          KeyValue, Repeatable 等全谱系条目。
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Infolist record={SAMPLE_USER_DATA} orientation={orientation} dense={dense} className="space-y-6">
          {/* Top Section: User Profile & Status */}
          <InfolistSection
            title="用户主体与基本档案"
            description="系统用户的基本通讯、权限定位与认证状态"
            icon={<User className="size-4" />}
            columns={{ sm: 1, md: 2, lg: 4 }}
          >
            <TextEntry name="id" label="用户唯一识别码" copyable tooltip="不可变更的系统唯一主键 UUID" />
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
            <TextEntry name="reputation" label="信誉得分指数" format="number" decimals={1} suffix="/ 100" />
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
            <KeyValueEntry name="systemConfig" label="底层系统参数 (Table 模式)" variant="table" />
          </InfolistFieldset>

          {/* Raw JSON Code Block */}
          <InfolistSection
            title="开发者数据预览 (CodeEntry)"
            description="以高亮格式化的 JSON 代码块完整展现当前 record"
            icon={<Code2 className="size-4" />}
            collapsible
            defaultCollapsed
          >
            <CodeEntry name="systemConfig" label="运行时环境描述符 (JSON)" language="json" copyable />
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
                    repeatableVariant === "table" ? "grid-cols-3 items-center" : "grid-cols-1 sm:grid-cols-3",
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
  );
}
