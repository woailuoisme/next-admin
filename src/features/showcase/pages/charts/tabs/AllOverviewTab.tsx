import {
  AreaTrendChart,
  BarTrendChart,
  CHART_PALETTE,
  ChartCard,
  ComposedTrendChart,
  DonutDistributionChart,
  HorizontalBarChart,
  RadarMetricChart,
  RadialGaugeChart,
} from "@/components/chart";
import { TabsContent } from "@/components/ui/tabs";
import {
  ARCHITECTURE_RADAR_DATA,
  CATEGORY_DISTRIBUTION,
  CURRENCY_FORMATTER,
  PERIOD_OPTIONS,
  TRAFFIC_CHANNELS,
} from "../constants";
import type { ChartStateProps, TimeRange, TrendDataPoint } from "../types";

interface AllOverviewTabProps {
  activePeriod: TimeRange;
  onPeriodChange: (newPeriod: string) => void;
  chartStateProps: ChartStateProps;
  trendData: TrendDataPoint[];
}

export function AllOverviewTab({
  activePeriod,
  onPeriodChange,
  chartStateProps,
  trendData,
}: AllOverviewTabProps) {
  return (
    <TabsContent value="all" className="space-y-6">
      {/* Row 1: Area Trend + Donut Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="经营收支趋势分析 (AreaTrendChart)"
            description="双序列渐变面积图，支持平滑样条曲线、自定义格式化与周期过滤"
            periods={PERIOD_OPTIONS}
            activePeriod={activePeriod}
            onPeriodChange={onPeriodChange}
            {...chartStateProps}
            height={320}
          >
            <AreaTrendChart
              data={trendData}
              dataKey="revenue"
              secondaryDataKey="cost"
              xAxisKey="period"
              height={320}
              valueFormatter={CURRENCY_FORMATTER}
              theme="chart-1"
            />
          </ChartCard>
        </div>

        <div>
          <ChartCard
            title="类目销售构成 (DonutDistributionChart)"
            description="带中心聚合指标与圆环图例的高性能切片分布"
            {...chartStateProps}
            height={320}
          >
            <DonutDistributionChart
              data={CATEGORY_DISTRIBUTION}
              centerLabel="销售总额"
              centerValue="¥109.1k"
              valueFormatter={CURRENCY_FORMATTER}
              height={320}
              innerRadius={65}
              outerRadius={95}
            />
          </ChartCard>
        </div>
      </div>

      {/* Row 2: Bar Trend + Horizontal Bar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="订单量与退单分布 (BarTrendChart)"
          description="多维度柱状图，支持圆角顶柱、自适应刻度及对比"
          periods={PERIOD_OPTIONS}
          activePeriod={activePeriod}
          onPeriodChange={onPeriodChange}
          {...chartStateProps}
          height={300}
        >
          <BarTrendChart
            data={trendData}
            dataKey="orders"
            secondaryDataKey="refunds"
            xAxisKey="period"
            height={300}
            theme="chart-2"
          />
        </ChartCard>

        <ChartCard
          title="全渠道流量来源贡献 (HorizontalBarChart)"
          description="支持内置排序 (es-toolkit.orderBy)、百分比聚合与最大项目截断"
          {...chartStateProps}
          height={300}
        >
          <HorizontalBarChart
            data={TRAFFIC_CHANNELS}
            valueFormatter={(val) => `${val.toLocaleString()} 次`}
            showPercentage={true}
            maxItems={6}
            theme="chart-4"
            height={300}
          />
        </ChartCard>
      </div>

      {/* Row 3: Composed Trend + Gauge & Radar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="营收规模与转化率组合分析 (ComposedTrendChart)"
            description="柱线融合图表：柱状分析绝对规模，折线追踪转化比率，支持多轴对齐"
            periods={PERIOD_OPTIONS}
            activePeriod={activePeriod}
            onPeriodChange={onPeriodChange}
            {...chartStateProps}
            height={300}
          >
            <ComposedTrendChart
              data={trendData}
              xAxisKey="period"
              height={300}
              bars={[
                {
                  dataKey: "revenue",
                  name: "营收",
                  color: CHART_PALETTE[0],
                },
              ]}
              lines={[
                {
                  dataKey: "profit",
                  name: "净利润",
                  color: CHART_PALETTE[1],
                  strokeWidth: 2.5,
                },
              ]}
            />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
          <ChartCard
            title="核心系统健康度 (RadialGaugeChart)"
            description="径向半圆仪表盘，支持阈值自适应着色与指标标签"
            {...chartStateProps}
            height={140}
          >
            <RadialGaugeChart
              value={99.85}
              max={100}
              label="核心 API 可用率"
              unit="%"
              theme="chart-2"
              height={130}
            />
          </ChartCard>

          <ChartCard
            title="架构审计维度评分 (RadarMetricChart)"
            description="六维雷达网状图，支持基准线对比"
            {...chartStateProps}
            height={160}
          >
            <RadarMetricChart
              data={ARCHITECTURE_RADAR_DATA}
              height={160}
              series={[
                {
                  dataKey: "score",
                  name: "当前指标",
                  color: CHART_PALETTE[7],
                },
                {
                  dataKey: "benchmark",
                  name: "行业基准",
                  color: "#94a3b8",
                },
              ]}
            />
          </ChartCard>
        </div>
      </div>
    </TabsContent>
  );
}
