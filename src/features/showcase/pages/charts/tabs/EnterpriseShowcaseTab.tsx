import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  AreaTrendChart,
  ChartCard,
  FunnelConversionChart,
  HeatmapMatrixChart,
  MetricSparkline,
  ScatterMetricChart,
  TreemapDistributionChart,
  WaterfallFinancialChart,
} from "@/components/chart";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  BRUSH_TIMELINE_DATA,
  CURRENCY_FORMATTER,
  ENTERPRISE_FUNNEL_DATA,
  ENTERPRISE_HEATMAP_DATA,
  ENTERPRISE_SCATTER_DATA,
  ENTERPRISE_TREEMAP_DATA,
  ENTERPRISE_WATERFALL_DATA,
  SPARKLINE_DEFECT,
  SPARKLINE_PIPELINE,
  SPARKLINE_REVENUE,
} from "../constants";
import type { ChartStateProps } from "../types";

interface EnterpriseShowcaseTabProps {
  chartStateProps: ChartStateProps;
}

export function EnterpriseShowcaseTab({ chartStateProps }: EnterpriseShowcaseTabProps) {
  return (
    <TabsContent value="enterprise" className="space-y-6">
      {/* Metric Sparkline KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs font-medium">主营实时营收</span>
            <div className="text-2xl font-bold tracking-tight">¥1,250,000</div>
            <div className="text-primary flex items-center gap-1 text-xs font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+18.4% 环比增长</span>
            </div>
          </div>
          <div className="h-12 w-28">
            <MetricSparkline
              data={SPARKLINE_REVENUE}
              color="var(--primary)"
              height={48}
              width={112}
              fill={true}
              showEndpointDot={true}
            />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs font-medium">活跃商机规模</span>
            <div className="text-2xl font-bold tracking-tight">3,450 席</div>
            <div className="text-primary flex items-center gap-1 text-xs font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+24.6% 环比上扬</span>
            </div>
          </div>
          <div className="h-12 w-28">
            <MetricSparkline
              data={SPARKLINE_PIPELINE}
              color="var(--chart-2)"
              height={48}
              width={112}
              fill={true}
              showEndpointDot={true}
            />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs font-medium">异常告警频次</span>
            <div className="text-2xl font-bold tracking-tight">3 次/日</div>
            <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
              <ArrowDownRight className="text-destructive h-3.5 w-3.5" />
              <span className="text-destructive">-45.2% 持续收敛</span>
            </div>
          </div>
          <div className="h-12 w-28">
            <MetricSparkline
              data={SPARKLINE_DEFECT}
              color="var(--destructive)"
              height={48}
              width={112}
              fill={true}
              showEndpointDot={true}
            />
          </div>
        </Card>
      </div>

      {/* Funnel + Waterfall */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="商机全链路转化漏斗 (FunnelConversionChart)"
          description="自动计算阶段转化率、留存率与流失率，直观呈现销售管道流转效率"
          showFullscreen={true}
          {...chartStateProps}
          height={340}
        >
          <FunnelConversionChart
            data={ENTERPRISE_FUNNEL_DATA}
            valueFormatter={(val) => `${val.toLocaleString()} 人`}
            height={320}
          />
        </ChartCard>

        <ChartCard
          title="企业财务损益结构瀑布图 (WaterfallFinancialChart)"
          description="解析主营收入、采购成本、研发与营销扣减，区分正负增量与汇总柱"
          showFullscreen={true}
          {...chartStateProps}
          height={340}
        >
          <WaterfallFinancialChart
            data={ENTERPRISE_WATERFALL_DATA}
            valueFormatter={CURRENCY_FORMATTER}
            height={320}
          />
        </ChartCard>
      </div>

      {/* Scatter + Treemap */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="客户价值矩阵 (ScatterMetricChart)"
          description="获客成本 vs 客户生命周期价值，气泡大小映射订单量，内置四象限基准线"
          showFullscreen={true}
          {...chartStateProps}
          height={340}
        >
          <ScatterMetricChart
            data={ENTERPRISE_SCATTER_DATA}
            xAxisKey="x"
            yAxisKey="y"
            zAxisKey="z"
            nameKey="name"
            xAxisLabel="获客成本 (CAC)"
            yAxisLabel="生命周期价值 (LTV)"
            zAxisLabel="订单频次"
            xReferenceLine={7000}
            yReferenceLine={45000}
            xValueFormatter={CURRENCY_FORMATTER}
            yValueFormatter={CURRENCY_FORMATTER}
            height={320}
          />
        </ChartCard>

        <ChartCard
          title="产品矩阵营收层级树图 (TreemapDistributionChart)"
          description="多层级板块面积权重分布，支持悬浮占比卡片与自适应布局"
          showFullscreen={true}
          {...chartStateProps}
          height={340}
        >
          <TreemapDistributionChart
            data={ENTERPRISE_TREEMAP_DATA}
            valueFormatter={CURRENCY_FORMATTER}
            height={320}
          />
        </ChartCard>
      </div>

      {/* Heatmap + Brush Area Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="7×24 周活跃热力矩阵 (HeatmapMatrixChart)"
          description="纯矢量 SVG 栅格矩阵，清晰识别访问高峰与调度维护窗口"
          showFullscreen={true}
          {...chartStateProps}
          height={340}
        >
          <HeatmapMatrixChart
            data={ENTERPRISE_HEATMAP_DATA}
            xKey="hour"
            yKey="day"
            valueKey="value"
            xLabel="时段"
            yLabel="星期"
            valueFormatter={(val) => `${val} QPS 负载`}
            height={320}
          />
        </ChartCard>

        <ChartCard
          title="时序缩放与基准参考线 (AreaTrendChart + Brush & ReferenceLines)"
          description="内置 Recharts 微缩滑块 (Brush) 与多目标预警参考线，满足自由时序缩放"
          showFullscreen={true}
          {...chartStateProps}
          height={340}
        >
          <AreaTrendChart
            data={BRUSH_TIMELINE_DATA}
            dataKey="revenue"
            secondaryDataKey="cost"
            xAxisKey="period"
            height={320}
            valueFormatter={CURRENCY_FORMATTER}
            theme="chart-1"
            showBrush={true}
            referenceLines={[
              {
                y: 100000,
                label: "目标冲刺线",
                stroke: "var(--destructive)",
                strokeDasharray: "4 4",
              },
              {
                y: 60000,
                label: "保底基准线",
                stroke: "var(--chart-2)",
                strokeDasharray: "3 3",
              },
            ]}
          />
        </ChartCard>
      </div>
    </TabsContent>
  );
}
