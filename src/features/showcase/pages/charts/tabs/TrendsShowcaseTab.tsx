import { BarTrendChart, CHART_PALETTE, ChartCard, LineTrendChart } from "@/components/chart";
import { TabsContent } from "@/components/ui/tabs";
import { CURRENCY_FORMATTER, PERIOD_OPTIONS } from "../constants";
import type { ChartStateProps, TimeRange, TrendDataPoint } from "../types";

interface TrendsShowcaseTabProps {
  activePeriod: TimeRange;
  onPeriodChange: (newPeriod: string) => void;
  chartStateProps: ChartStateProps;
  trendData: TrendDataPoint[];
}

export function TrendsShowcaseTab({
  activePeriod,
  onPeriodChange,
  chartStateProps,
  trendData,
}: TrendsShowcaseTabProps) {
  return (
    <TabsContent value="trends" className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="单折线趋势带参考基线 (LineTrendChart)"
          description="呈现高频波动趋势，包含参考警戒线与平滑贝塞尔曲线"
          periods={PERIOD_OPTIONS}
          activePeriod={activePeriod}
          onPeriodChange={onPeriodChange}
          {...chartStateProps}
          height={320}
        >
          <LineTrendChart
            data={trendData}
            dataKey="revenue"
            xAxisKey="period"
            height={320}
            valueFormatter={CURRENCY_FORMATTER}
            referenceValue={20000}
            referenceLabel="目标基准线 (¥20,000)"
            theme="secondary"
          />
        </ChartCard>

        <ChartCard
          title="多折线对比趋势 (LineTrendChart)"
          description="多维度指标同步观察，自动计算坐标范围与高亮节点"
          periods={PERIOD_OPTIONS}
          activePeriod={activePeriod}
          onPeriodChange={onPeriodChange}
          {...chartStateProps}
          height={320}
        >
          <LineTrendChart
            data={trendData}
            xAxisKey="period"
            height={320}
            series={[
              {
                dataKey: "orders",
                name: "下单量",
                color: CHART_PALETTE[0],
              },
              {
                dataKey: "refunds",
                name: "退款单量",
                color: CHART_PALETTE[3],
              },
            ]}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="单柱对比分析 (BarTrendChart)"
        description="大尺寸柱状对比，清晰展现多时间段数据变动"
        periods={PERIOD_OPTIONS}
        activePeriod={activePeriod}
        onPeriodChange={onPeriodChange}
        {...chartStateProps}
        height={340}
      >
        <BarTrendChart
          data={trendData}
          dataKey="revenue"
          secondaryDataKey="cost"
          xAxisKey="period"
          height={340}
          valueFormatter={CURRENCY_FORMATTER}
          theme="chart-5"
        />
      </ChartCard>
    </TabsContent>
  );
}
