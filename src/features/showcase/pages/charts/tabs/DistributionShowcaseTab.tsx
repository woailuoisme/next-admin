import { ChartCard, DonutDistributionChart, HorizontalBarChart } from "@/components/chart";
import { TabsContent } from "@/components/ui/tabs";
import { CATEGORY_DISTRIBUTION, CURRENCY_FORMATTER, TRAFFIC_CHANNELS } from "../constants";
import type { ChartStateProps } from "../types";

interface DistributionShowcaseTabProps {
  chartStateProps: ChartStateProps;
}

export function DistributionShowcaseTab({ chartStateProps }: DistributionShowcaseTabProps) {
  return (
    <TabsContent value="distribution" className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="环形占比分布 (DonutDistributionChart)"
          description="支持自定义内外半径、居中合计文本、单切片悬浮动画"
          {...chartStateProps}
          height={320}
        >
          <DonutDistributionChart
            data={CATEGORY_DISTRIBUTION}
            centerLabel="总品类数"
            centerValue="6 大类别"
            valueFormatter={CURRENCY_FORMATTER}
            height={320}
          />
        </ChartCard>

        <ChartCard
          title="长尾分布横向排名 (HorizontalBarChart)"
          description="横向条形图，极佳适配长文本标签，支持内置百分比展示"
          {...chartStateProps}
          height={320}
        >
          <HorizontalBarChart
            data={TRAFFIC_CHANNELS}
            valueFormatter={(v) => `${v.toLocaleString()} UV`}
            showPercentage={true}
            theme="chart-2"
            height={320}
          />
        </ChartCard>
      </div>
    </TabsContent>
  );
}
