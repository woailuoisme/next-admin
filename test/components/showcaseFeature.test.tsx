import { describe, expect, it } from "vitest";

import { ResourceShowcaseSection } from "@/features/showcase/components/ResourceShowcaseSection";
import { ChartsShowcasePage } from "@/features/showcase/pages/ChartsShowcasePage";
import { FormShowcasePage } from "@/features/showcase/pages/FormShowcasePage";
import { InfolistShowcasePage } from "@/features/showcase/pages/InfolistShowcasePage";
import { RealtimeShowcasePage } from "@/features/showcase/pages/RealtimeShowcasePage";
import { StatsShowcasePage } from "@/features/showcase/pages/StatsShowcasePage";
import { TableShowcasePage } from "@/features/showcase/pages/TableShowcasePage";
import { fireEvent, renderWithProviders, screen } from "test/test-utils";

describe("Showcase Feature Tests", () => {
  it("renders ResourceShowcaseSection with presentation switcher and triggers modes", () => {
    renderWithProviders(<ResourceShowcaseSection />);

    expect(screen.getByText("Filament v5 工业级 Resource CRUD 宿主架构")).toBeInTheDocument();
    expect(screen.getByText("🪟 Dialog (弹窗)")).toBeInTheDocument();
    expect(screen.getByText("📑 Drawer (抽屉)")).toBeInTheDocument();
    expect(screen.getByText("📄 Page (独立页)")).toBeInTheDocument();
    expect(screen.getByText("新建客户 (Create)")).toBeInTheDocument();

    // Switch to page mode to test in-place page preview
    fireEvent.click(screen.getByText("📄 Page (独立页)"));
    expect(screen.getAllByText("Alex Morgan").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("ACTIVE ENTERPRISE")).toBeInTheDocument();
  });

  it("renders FormShowcasePage with tabbed form sections", () => {
    renderWithProviders(<FormShowcasePage />);

    expect(screen.getByRole("tab", { name: /Basic Controls/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Selection & Toggles/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Date & Time/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit Form/i })).toBeInTheDocument();
  });

  it("renders ChartsShowcasePage with highlights and period controls", () => {
    renderWithProviders(<ChartsShowcasePage />);

    expect(screen.getByText("单一职责架构")).toBeInTheDocument();
    expect(screen.getByText("Vercel 性能最佳实践")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /全景图表/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /趋势与混合/i })).toBeInTheDocument();
  });

  it("renders StatsShowcasePage with ticker and stat tabs", () => {
    renderWithProviders(<StatsShowcasePage />);

    expect(screen.getByRole("tab", { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Card Matrix/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Trends/i })).toBeInTheDocument();
  });

  it("renders InfolistShowcasePage with callouts matrix and density controls", () => {
    renderWithProviders(<InfolistShowcasePage />);

    expect(screen.getByText("Callouts 提示卡片矩阵 (Schemas / Callouts)")).toBeInTheDocument();
    expect(screen.getByText("系统更新提醒")).toBeInTheDocument();
    expect(screen.getByText("上下堆叠")).toBeInTheDocument();
    expect(screen.getByText("行内水平")).toBeInTheDocument();
  });

  it("renders RealtimeShowcasePage with health diagnostic bar and telemetry tab", () => {
    renderWithProviders(<RealtimeShowcasePage />);

    expect(screen.getByText("实时通信引擎 (Centrifugo / Centrifuge)")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /高频遥测监控流/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /多席位协同感知/i })).toBeInTheDocument();
  });

  it("renders TableShowcasePage with column controls and filter layouts", () => {
    renderWithProviders(<TableShowcasePage />);

    expect(screen.getByText("Filament v5 Table Columns Showcase")).toBeInTheDocument();
  });
});
