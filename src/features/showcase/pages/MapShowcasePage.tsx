"use client";

import {
  Activity,
  Cpu,
  Flame,
  Globe,
  MapPin,
  Navigation,
  Network,
  PieChart,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { FormLocationPicker } from "@/components/form";
import {
  ArcFlightMap,
  BASEMAP_OPTIONS,
  type BasemapStyleKey,
  type CoordinateSystem,
  type FlightArcItem,
  GeoDistributionMap,
  GeoHeatmapMap,
  type HeatmapColorRamp,
  type HeatmapPoint,
  type LocationMarkerItem,
  type LocationPickerValue,
  LocationMarkerMap,
  type RouteStop,
  RouteTrackingMap,
} from "@/components/map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DemoState = "normal" | "loading" | "empty" | "error";

// 1. Mock Locations for LocationMarkerMap
const MOCK_LOCATIONS: LocationMarkerItem[] = [
  {
    id: "loc-1",
    title: "North China Regional Logistics Hub",
    coordinates: [116.4074, 39.9042],
    category: "hub",
    address: "No. 88 Logistics Park Ave, Daxing District, Beijing",
    phone: "010-88886666",
    badge: "Primary Hub",
    extra: { capacity: "50,000 m²", activeShipments: 1240 },
  },
  {
    id: "loc-2",
    title: "East China Distribution Center",
    coordinates: [121.4737, 31.2304],
    category: "warehouse",
    address: "No. 500 Free Trade Zone Rd, Pudong New Area, Shanghai",
    phone: "021-66668888",
    badge: "Smart Warehouse",
    extra: { capacity: "85,000 m²", activeShipments: 2180 },
  },
  {
    id: "loc-3",
    title: "South China Port Terminal",
    coordinates: [113.2644, 23.1291],
    category: "hub",
    address: "No. 12 Huangpu Port Blvd, Guangzhou",
    phone: "020-83332211",
    badge: "Port Express",
    extra: { capacity: "62,000 m²", activeShipments: 1890 },
  },
  {
    id: "loc-4",
    title: "Greater Bay Area Innovation Store",
    coordinates: [114.0579, 22.5431],
    category: "store",
    address: "No. 1001 High-Tech South Rd, Nanshan, Shenzhen",
    phone: "0755-86669999",
    badge: "Flagship Store",
    extra: { dailyFootfall: 4500, stockRate: "98.5%" },
  },
  {
    id: "loc-5",
    title: "West China Inland Distribution Hub",
    coordinates: [104.0668, 30.5728],
    category: "warehouse",
    address: "No. 68 Airport Logistics Ave, Shuangliu, Chengdu",
    phone: "028-85551234",
    badge: "Regional Depot",
    extra: { capacity: "42,000 m²", activeShipments: 980 },
  },
  {
    id: "loc-6",
    title: "Central China Transshipment Hub",
    coordinates: [114.3055, 30.5928],
    category: "hub",
    address: "No. 200 Optics Valley Logistics Blvd, Jiangxia, Wuhan",
    phone: "027-87774321",
    badge: "Rail-Air Joint Hub",
    extra: { capacity: "38,000 m²", activeShipments: 1120 },
  },
  {
    id: "loc-7",
    title: "Zhejiang Retail Fulfillment Center",
    coordinates: [120.1551, 30.2741],
    category: "store",
    address: "No. 888 Xixi Rd, Xihu District, Hangzhou",
    phone: "0571-88880000",
    badge: "Direct Store",
    extra: { dailyFootfall: 6200, stockRate: "99.1%" },
  },
];

// 2. Mock Trajectory & Stops for RouteTrackingMap
const MOCK_ROUTE_COORDS: [number, number][] = [
  [116.3972, 39.9165],
  [116.4855, 39.8821],
  [116.7512, 39.5213],
  [117.2008, 39.0841],
  [117.5123, 38.6412],
  [117.9823, 37.8921],
  [118.4215, 36.9812],
  [118.7969, 36.0612],
  [119.5123, 34.8912],
  [120.2134, 33.6821],
  [120.8912, 32.5123],
  [121.4737, 31.2304],
];

const MOCK_ROUTE_STOPS: RouteStop[] = [
  {
    id: "stop-1",
    name: "Beijing Dispatch Terminal",
    coordinates: [116.3972, 39.9165],
    status: "completed",
    arrivalTime: "08:30 AM",
    description: "Cargo checked & seal verified",
  },
  {
    id: "stop-2",
    name: "Tianjin Port Waypoint",
    coordinates: [117.2008, 39.0841],
    status: "completed",
    arrivalTime: "10:15 AM",
    description: "Customs transit inspection passed",
  },
  {
    id: "stop-3",
    name: "Shandong Central Depot",
    coordinates: [118.4215, 36.9812],
    status: "current",
    arrivalTime: "14:20 PM (Estimated)",
    description: "Battery swap & safety check in progress",
  },
  {
    id: "stop-4",
    name: "Jiangsu Relay Hub",
    coordinates: [120.2134, 33.6821],
    status: "pending",
    arrivalTime: "18:45 PM",
    description: "Scheduled container transfer",
  },
  {
    id: "stop-5",
    name: "Shanghai Central Fulfillment",
    coordinates: [121.4737, 31.2304],
    status: "pending",
    arrivalTime: "22:00 PM",
    description: "Final distribution destination",
  },
];

// 3. Mock GeoJSON data for GeoDistributionMap
const MOCK_GEOJSON_DATA: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "BJ",
      properties: { id: "BJ", name: "Beijing", value: 890, orders: 154200 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [115.4, 39.4],
            [117.5, 39.4],
            [117.5, 41.1],
            [115.4, 41.1],
            [115.4, 39.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: "SH",
      properties: { id: "SH", name: "Shanghai", value: 960, orders: 218900 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [120.8, 30.6],
            [122.2, 30.6],
            [122.2, 31.9],
            [120.8, 31.9],
            [120.8, 30.6],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: "GD",
      properties: { id: "GD", name: "Guangdong", value: 1250, orders: 341000 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [109.6, 20.2],
            [117.3, 20.2],
            [117.3, 25.5],
            [109.6, 25.5],
            [109.6, 20.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: "ZJ",
      properties: { id: "ZJ", name: "Zhejiang", value: 820, orders: 198500 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [118.0, 27.0],
            [123.0, 27.0],
            [123.0, 31.2],
            [118.0, 31.2],
            [118.0, 27.0],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: "SC",
      properties: { id: "SC", name: "Sichuan", value: 580, orders: 112000 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [97.3, 26.0],
            [108.5, 26.0],
            [108.5, 34.3],
            [97.3, 34.3],
            [97.3, 26.0],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: "HB",
      properties: { id: "HB", name: "Hubei", value: 640, orders: 135000 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [108.3, 29.0],
            [116.1, 29.0],
            [116.1, 33.3],
            [108.3, 33.3],
            [108.3, 29.0],
          ],
        ],
      },
    },
  ],
};

// 4. Mock Arcs for ArcFlightMap
const MOCK_FLIGHT_ARCS: FlightArcItem[] = [
  {
    id: "arc-1",
    from: [116.4074, 39.9042],
    to: [121.4737, 31.2304],
    fromName: "Beijing (PEK)",
    toName: "Shanghai (PVG)",
    value: 1240,
    category: "Express Trunk",
  },
  {
    id: "arc-2",
    from: [116.4074, 39.9042],
    to: [113.2644, 23.1291],
    fromName: "Beijing (PEK)",
    toName: "Guangzhou (CAN)",
    value: 980,
    category: "Express Trunk",
  },
  {
    id: "arc-3",
    from: [121.4737, 31.2304],
    to: [114.0579, 22.5431],
    fromName: "Shanghai (SHA)",
    toName: "Shenzhen (SZX)",
    value: 1450,
    category: "High-Frequency Shuttle",
  },
  {
    id: "arc-4",
    from: [121.4737, 31.2304],
    to: [104.0668, 30.5728],
    fromName: "Shanghai (PVG)",
    toName: "Chengdu (TFU)",
    value: 820,
    category: "Western Corridor",
  },
  {
    id: "arc-5",
    from: [114.3055, 30.5928],
    to: [116.4074, 39.9042],
    fromName: "Wuhan (WUH)",
    toName: "Beijing (PKX)",
    value: 650,
    category: "Central Trunk",
  },
];

// 5. Mock Heatmap points for GeoHeatmapMap
const MOCK_HEATMAP_POINTS: HeatmapPoint[] = [
  { coordinates: [116.4074, 39.9042], weight: 0.95 },
  { coordinates: [116.45, 39.92], weight: 0.8 },
  { coordinates: [116.38, 39.88], weight: 0.7 },
  { coordinates: [121.4737, 31.2304], weight: 1.0 },
  { coordinates: [121.52, 31.22], weight: 0.85 },
  { coordinates: [121.43, 31.18], weight: 0.75 },
  { coordinates: [113.2644, 23.1291], weight: 0.9 },
  { coordinates: [114.0579, 22.5431], weight: 0.92 },
  { coordinates: [113.93, 22.53], weight: 0.78 },
  { coordinates: [120.1551, 30.2741], weight: 0.82 },
  { coordinates: [120.21, 30.29], weight: 0.65 },
  { coordinates: [104.0668, 30.5728], weight: 0.75 },
  { coordinates: [114.3055, 30.5928], weight: 0.7 },
  { coordinates: [118.7969, 32.0603], weight: 0.68 },
  { coordinates: [106.5516, 29.563], weight: 0.62 },
  { coordinates: [108.9398, 34.3416], weight: 0.6 },
];

/**
 * 演示用站点分类：按索引轮转 hub / warehouse / store
 */
function pickDenseCategory(index: number): string {
  if (index % 3 === 1) return "warehouse";
  if (index % 3 === 2) return "store";
  return "hub";
}

// 6. Mock Dense Locations (320 items) for Auto-Tiering verification
const MOCK_DENSE_LOCATIONS: LocationMarkerItem[] = Array.from({ length: 320 }, (_, i) => ({
  id: `dense-${i + 1}`,
  title: `Terminal Depot #${i + 1}`,
  coordinates: [
    121.47 + Math.sin(i * 0.7) * 0.15 + ((i % 17) - 8) * 0.012,
    31.23 + Math.cos(i * 0.5) * 0.12 + ((i % 13) - 6) * 0.015,
  ],
  category: pickDenseCategory(i),
  badge: i % 5 === 0 ? "High Capacity" : undefined,
}));

/** 主 Tab 配置（图标 + 文案，纯静态） */
const MAP_TABS = [
  { value: "markers", icon: MapPin, label: "网点分布 (Markers)" },
  { value: "route", icon: Navigation, label: "物流轨迹 (Route)" },
  { value: "geo", icon: PieChart, label: "区划热力 (Choropleth)" },
  { value: "arc", icon: Network, label: "干线飞线 (Arc)" },
  { value: "heatmap", icon: Flame, label: "核密度热力 (GPU Heatmap)" },
  { value: "bigdata", icon: Cpu, label: "海量降级 (320+ 点)" },
  { value: "coords", icon: Globe, label: "双轨坐标与底图" },
  { value: "picker", icon: Activity, label: "表单高阶拾取 (FormPicker)" },
] as const;

export function MapShowcasePage() {
  const [demoState, setDemoState] = useState<DemoState>("normal");
  const [formPickerVal, setFormPickerVal] = useState<LocationPickerValue>({
    lng: 116.4074,
    lat: 39.9042,
    address: "Beijing City Center",
  });
  const [heatmapRamp, setHeatmapRamp] = useState<HeatmapColorRamp>("thermal");
  const [bigDataRenderMode, setBigDataRenderMode] = useState<"auto" | "dom" | "canvas">("auto");
  const [activeBasemap, setActiveBasemap] = useState<BasemapStyleKey>("carto");
  const [activeCoordSys, setActiveCoordSys] = useState<CoordinateSystem>("WGS84");

  const isLoading = demoState === "loading";
  const isEmpty = demoState === "empty";
  const isError = demoState === "error";

  const handleRetry = () => {
    setDemoState("normal");
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
              Map Components Showcase
            </h1>
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
              @mapcn/map 封装
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            企业级高阶地图套件：网点聚合分布、车辆轨迹回放、行政区划热力着色、拓扑飞线与表单坐标拾取器
          </p>
        </div>

        {/* State Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="border-border bg-card flex items-center rounded-lg border p-0.5 text-xs">
            {(["normal", "loading", "empty", "error"] as const).map((st) => (
              <Button
                key={st}
                variant={demoState === st ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs capitalize"
                onClick={() => setDemoState(st)}
              >
                {st}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleRetry}>
            <RefreshCw className="size-3.5" />
            Reset State
          </Button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-muted/20 flex items-center gap-3 p-3.5">
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
            <MapPin className="size-4" />
          </div>
          <div className="text-xs">
            <div className="text-foreground font-semibold">网点检索与联动</div>
            <div className="text-muted-foreground">品类过滤、列表联动与平滑飞入</div>
          </div>
        </Card>

        <Card className="border-border/60 bg-muted/20 flex items-center gap-3 p-3.5">
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
            <Navigation className="size-4" />
          </div>
          <div className="text-xs">
            <div className="text-foreground font-semibold">物流沿线与进度滑块</div>
            <div className="text-muted-foreground">轨迹插值、站点状态与自动回放</div>
          </div>
        </Card>

        <Card className="border-border/60 bg-muted/20 flex items-center gap-3 p-3.5">
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
            <PieChart className="size-4" />
          </div>
          <div className="text-xs">
            <div className="text-foreground font-semibold">分级着色 Choropleth</div>
            <div className="text-muted-foreground">数值色阶图例与悬浮气泡卡片</div>
          </div>
        </Card>

        <Card className="border-border/60 bg-muted/20 flex items-center gap-3 p-3.5">
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
            <Network className="size-4" />
          </div>
          <div className="text-xs">
            <div className="text-foreground font-semibold">干线拓扑与表单拾取</div>
            <div className="text-muted-foreground">大圆贝塞尔飞线与经纬度拾取器</div>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="markers" className="space-y-6">
        {/*
					用响应式栅格而非 flex-wrap：TabsList 基础样式含 `group-data-horizontal/tabs:h-8`
					（32px 定高），换行后的第二行会溢出灰色圆角底之外；且基础 justify-center 会把
					落单的最后一个 Tab 居中。栅格 + `h-auto!` 让行数自适应，8 个 Tab 在桌面端
					恰好 4×2 无落单项。
				*/}
        <TabsList className="bg-muted/60 grid h-auto! w-full grid-cols-2 gap-1 border p-1 md:grid-cols-4">
          {MAP_TABS.map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-1.5 px-2 py-1.5 text-center text-xs whitespace-normal"
            >
              <Icon className="size-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab 1: LocationMarkerMap */}
        <TabsContent value="markers" className="space-y-4">
          <LocationMarkerMap
            locations={MOCK_LOCATIONS}
            height={520}
            center={[114, 30]}
            zoom={4.5}
            showSearch={true}
            showCategoryFilter={true}
            showSidebarList={true}
            isLoading={isLoading}
            isEmpty={isEmpty}
            isError={isError}
            onRetry={handleRetry}
            cardProps={{
              title: "全国自营仓储与旗舰网点分布",
              description: "支持品类徽章筛选、智能关键词检索、侧边网点卡片与平滑视口平移飞入",
            }}
          />
        </TabsContent>

        {/* Tab 2: RouteTrackingMap */}
        <TabsContent value="route" className="space-y-4">
          <RouteTrackingMap
            coordinates={MOCK_ROUTE_COORDS}
            stops={MOCK_ROUTE_STOPS}
            vehicle={{
              id: "v-01",
              name: "Heavy Freight EV-800",
              licensePlate: "京A·88888",
              speed: 76,
              statusText: "On-schedule delivery",
            }}
            defaultProgress={0.48}
            autoPlay={false}
            playbackDuration={20}
            showScrubber={true}
            height={500}
            center={[118.5, 35.5]}
            zoom={5.5}
            isLoading={isLoading}
            isEmpty={isEmpty}
            isError={isError}
            onRetry={handleRetry}
            cardProps={{
              title: "京沪干线重卡冷链物流监控",
              description: "载具沿线动态脉冲指示、里程进度滑条与沿途枢纽站点状态联动",
            }}
          />
        </TabsContent>

        {/* Tab 3: GeoDistributionMap */}
        <TabsContent value="geo" className="space-y-4">
          <GeoDistributionMap
            data={MOCK_GEOJSON_DATA}
            valueKey="value"
            labelKey="name"
            unit="万元"
            colorScheme="primary"
            legendTitle="区域销售总额分级 (万元)"
            height={500}
            center={[114, 31]}
            zoom={4}
            isLoading={isLoading}
            isEmpty={isEmpty}
            isError={isError}
            onRetry={handleRetry}
            cardProps={{
              title: "省区商业体量密度分级 (Choropleth)",
              description: "GeoJSON 几何渲染、5级离散色阶图例与鼠标悬浮区域卡片",
            }}
          />
        </TabsContent>

        {/* Tab 4: ArcFlightMap */}
        <TabsContent value="arc" className="space-y-4">
          <ArcFlightMap
            arcs={MOCK_FLIGHT_ARCS}
            curvature={0.25}
            arcWidth={2.5}
            showNodeMarkers={true}
            height={500}
            center={[114, 32]}
            zoom={4}
            isLoading={isLoading}
            isEmpty={isEmpty}
            isError={isError}
            onRetry={handleRetry}
            cardProps={{
              title: "全国航空与城际干线拓扑网络",
              description: "大圆贝塞尔弯曲飞线、枢纽端点脉冲光晕与航段流量浮层",
            }}
          />
        </TabsContent>

        {/* Tab 5: GeoHeatmapMap */}
        <TabsContent value="heatmap" className="space-y-4">
          <div className="border-border/70 bg-card flex items-center justify-between rounded-lg border p-3 shadow-xs">
            <div className="space-y-0.5">
              <div className="text-foreground text-xs font-semibold">GPU KDE 核密度渐变色板</div>
              <div className="text-muted-foreground text-[11px]">
                高精度 WebGL 原生核密度估计，支持微秒级色板与权重插值平滑切换
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {(["thermal", "viridis", "spectral", "plasma", "mono"] as const).map((ramp) => (
                <Button
                  key={ramp}
                  variant={heatmapRamp === ramp ? "default" : "outline"}
                  size="xs"
                  className="text-xs capitalize"
                  onClick={() => setHeatmapRamp(ramp)}
                >
                  {ramp}
                </Button>
              ))}
            </div>
          </div>

          <GeoHeatmapMap
            data={MOCK_HEATMAP_POINTS}
            colorRamp={heatmapRamp}
            radius={32}
            maxIntensity={1}
            center={[116.5, 31.5]}
            zoom={4.6}
            height={500}
            isLoading={isLoading}
            isEmpty={isEmpty}
            isError={isError}
            onRetry={handleRetry}
            cardProps={{
              title: "全国业务密度核密度热力 (GPU KDE)",
              description: "MapLibre GL 原生 WebGL 热力图层，实时核密度估计与动态密度图例",
            }}
          />
        </TabsContent>

        {/* Tab 6: BigData Auto-Tiering */}
        <TabsContent value="bigdata" className="space-y-4">
          <div className="border-border/70 bg-card flex items-center justify-between rounded-lg border p-3 shadow-xs">
            <div className="space-y-0.5">
              <div className="text-foreground text-xs font-semibold">
                自适应降级模式控制 (Auto-Tiering Engine)
              </div>
              <div className="text-muted-foreground text-[11px]">
                当前加载 320 个真实节点：阈值 200。可在 Auto（自动降级为 GPU WebGL）、DOM 与 Canvas
                之间强制切换
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {(["auto", "dom", "canvas"] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={bigDataRenderMode === mode ? "default" : "outline"}
                  size="xs"
                  className="text-xs uppercase"
                  onClick={() => setBigDataRenderMode(mode)}
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          <LocationMarkerMap
            locations={MOCK_DENSE_LOCATIONS}
            renderMode={bigDataRenderMode}
            tierThreshold={200}
            height={520}
            center={[121.47, 31.23]}
            zoom={11.5}
            showSearch={true}
            showCategoryFilter={true}
            showSidebarList={true}
            isLoading={isLoading}
            isEmpty={isEmpty}
            isError={isError}
            onRetry={handleRetry}
            cardProps={{
              title: "超大容量自适应降级感知渲染 (320+ 点)",
              description:
                "自动触发 GPU WebGL 矢量聚合图层，点击集群自动展开；选中点自动晋升为交互式 DOM 脉冲标点",
            }}
          />
        </TabsContent>

        {/* Tab 7: Domestic Basemaps & Coordinate Systems */}
        <TabsContent value="coords" className="space-y-4">
          <div className="border-border/70 bg-card flex flex-col gap-3 rounded-lg border p-4 shadow-xs md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="text-foreground text-xs font-semibold">
                零依赖双轨坐标系转换 (WGS-84 ⇋ GCJ-02 ⇋ BD-09)
              </div>
              <div className="text-muted-foreground text-[11px]">
                支持高德地图瓦片、天地图国家公共服务平台与国际标准底图的无缝切换与高精度纠偏
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">数据坐标系:</span>
                <div className="border-border flex rounded-md border p-0.5">
                  {(["WGS84", "GCJ02", "BD09"] as const).map((cs) => (
                    <Button
                      key={cs}
                      variant={activeCoordSys === cs ? "default" : "ghost"}
                      size="xs"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => setActiveCoordSys(cs)}
                    >
                      {cs}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">底图服务:</span>
                <div className="border-border flex rounded-md border p-0.5">
                  {BASEMAP_OPTIONS.map((bm) => (
                    <Button
                      key={bm.value}
                      variant={activeBasemap === bm.value ? "default" : "ghost"}
                      size="xs"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => setActiveBasemap(bm.value)}
                    >
                      {bm.label.split(" ")[0]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <LocationMarkerMap
            locations={MOCK_LOCATIONS}
            coordinateSystem={activeCoordSys}
            basemap={activeBasemap}
            height={500}
            center={[116.4, 39.9]}
            zoom={10}
            showSearch={true}
            showSidebarList={false}
            cardProps={{
              title: `双轨坐标纠偏验证 (输入: ${activeCoordSys} | 底图: ${activeBasemap})`,
              description:
                "坐标变换引擎自动将输入纠偏至目标底图标准，保证标点在卫星、道路和高德地图上的绝对精准贴合",
            }}
          />
        </TabsContent>

        {/* Tab 8: Form Location Picker Integration */}
        <TabsContent value="picker" className="space-y-4">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-foreground text-base font-semibold">
                表单高阶组件与坐标拾取器 (FormLocationPicker)
              </h3>
              <p className="text-muted-foreground text-xs">
                完整适配 Filament v5 / TanStack Form
                体系：快捷热门城市预设、一键复制经纬度、标点拖拽与校验反馈
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FormLocationPicker
                  label="企业注册驻地经纬度"
                  helperText="支持在地图上任意点击或拖拽微调定位，可点击上方城市快速定位"
                  value={formPickerVal}
                  onChange={setFormPickerVal}
                  height={380}
                  zoom={11}
                  showCoordinatesInput={true}
                  showReset={true}
                  showAddressSearch={true}
                  showCopyButton={true}
                />
              </div>

              <div className="border-border bg-muted/20 flex flex-col justify-between rounded-lg border p-4">
                <div>
                  <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    TanStack Form 状态镜像
                  </h4>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">经度 (Longitude)</span>
                      <span className="text-primary font-mono font-semibold">
                        {formPickerVal.lng.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">纬度 (Latitude)</span>
                      <span className="text-primary font-mono font-semibold">
                        {formPickerVal.lat.toFixed(6)}
                      </span>
                    </div>
                    {formPickerVal.address && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">地址解析</span>
                        <span className="text-foreground max-w-44 truncate text-right">
                          {formPickerVal.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-primary/20 bg-primary/10 text-primary mt-4 rounded-md border p-2.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Sparkles className="size-3.5" />
                    <span>设计系统无缝融合</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    遵循全站 FieldWrapper 规范，支持 Zod 国际化校验报错、ColSpan 栅格排版与受控 TanStack Form
                    双向绑定。
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
