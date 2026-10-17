import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { InfolistCallout } from "@/components/infolist";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CalloutsShowcaseCard() {
  return (
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
          <span className="text-muted-foreground text-xs font-semibold">紧凑单行模式 (compact=true)</span>
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
                  onClick: () => toast.info("触发操作演示：查看系统更新日志"),
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
                  onClick: () => toast.success("触发操作演示：API 密钥已轮换"),
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
                  onClick: () => toast.info("触发操作演示：已提交存储扩容请求"),
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
                  onClick: () => toast.warning("触发操作演示：已下发容器集群紧急恢复指令"),
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
                  onClick: () => toast.info("触发操作演示：打开安全加密参数配置"),
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
  );
}
