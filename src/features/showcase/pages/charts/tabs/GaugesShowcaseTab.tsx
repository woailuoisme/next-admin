import { CHART_PALETTE, ChartCard, RadarMetricChart, RadialGaugeChart } from "@/components/chart";
import { TabsContent } from "@/components/ui/tabs";
import { ARCHITECTURE_RADAR_DATA } from "../constants";
import type { ChartStateProps } from "../types";

interface GaugesShowcaseTabProps {
  chartStateProps: ChartStateProps;
}

export function GaugesShowcaseTab({ chartStateProps }: GaugesShowcaseTabProps) {
  return (
    <TabsContent value="gauges" className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ChartCard
          title="SLA 达成率 (Emerald 仪表盘)"
          description="安全健康指标推荐配色"
          {...chartStateProps}
          height={200}
        >
          <RadialGaugeChart value={99.9} max={100} label="正常运行时间" unit="%" theme="chart-2" height={180} />
        </ChartCard>

        <ChartCard
          title="系统负载率 (Amber 仪表盘)"
          description="资源负载与预警建议配色"
          {...chartStateProps}
          height={200}
        >
          <RadialGaugeChart value={78.4} max={100} label="集群内存消耗" unit="%" theme="chart-3" height={180} />
        </ChartCard>

        <ChartCard
          title="客户满意度 (Purple 仪表盘)"
          description="自定义 formattedValue 重写"
          {...chartStateProps}
          height={200}
        >
          <RadialGaugeChart
            value={92}
            max={100}
            formattedValue="4.6 / 5.0"
            label="CSAT 评分"
            theme="chart-4"
            height={180}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="多维系统架构审计雷达图 (RadarMetricChart)"
        description="评估架构健全度，支持填充多边形半透明重叠展示与自适应网格"
        {...chartStateProps}
        height={340}
      >
        <RadarMetricChart
          data={ARCHITECTURE_RADAR_DATA}
          height={340}
          series={[
            {
              dataKey: "score",
              name: "当前审计得分",
              color: CHART_PALETTE[0],
            },
            {
              dataKey: "benchmark",
              name: "业界标杆水准",
              color: CHART_PALETTE[3],
            },
          ]}
        />
      </ChartCard>
    </TabsContent>
  );
}
