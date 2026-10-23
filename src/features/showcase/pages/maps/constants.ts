import { Activity, Cpu, Flame, Globe, MapPin, Navigation, Network, PieChart } from "lucide-react";
import type { FlightArcItem, HeatmapPoint, LocationMarkerItem, RouteStop } from "@/components/map";

// 1. Mock Locations for LocationMarkerMap
export const MOCK_LOCATIONS: LocationMarkerItem[] = [
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
export const MOCK_ROUTE_COORDS: [number, number][] = [
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

export const MOCK_ROUTE_STOPS: RouteStop[] = [
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
export const MOCK_GEOJSON_DATA: GeoJSON.FeatureCollection = {
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
export const MOCK_FLIGHT_ARCS: FlightArcItem[] = [
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
export const MOCK_HEATMAP_POINTS: HeatmapPoint[] = [
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
export function pickDenseCategory(index: number): string {
  if (index % 3 === 1) return "warehouse";
  if (index % 3 === 2) return "store";
  return "hub";
}

// 6. Mock Dense Locations (320 items) for Auto-Tiering verification
export const MOCK_DENSE_LOCATIONS: LocationMarkerItem[] = Array.from({ length: 320 }, (_, i) => ({
  id: `dense-${i + 1}`,
  title: `Terminal Depot #${i + 1}`,
  coordinates: [
    121.47 + Math.sin(i * 0.7) * 0.15 + ((i % 17) - 8) * 0.012,
    31.23 + Math.cos(i * 0.5) * 0.12 + ((i % 13) - 6) * 0.015,
  ],
  category: pickDenseCategory(i),
  badge: i % 5 === 0 ? "High Capacity" : undefined,
}));

/** 主 Tab 配置（图标 + 国际化文案键） */
export const MAP_TABS = [
  { value: "markers", icon: MapPin, labelKey: "map_tab_markers" },
  { value: "route", icon: Navigation, labelKey: "map_tab_route" },
  { value: "geo", icon: PieChart, labelKey: "map_tab_geo" },
  { value: "arc", icon: Network, labelKey: "map_tab_arc" },
  { value: "heatmap", icon: Flame, labelKey: "map_tab_heatmap" },
  { value: "bigdata", icon: Cpu, labelKey: "map_tab_bigdata" },
  { value: "coords", icon: Globe, labelKey: "map_tab_coords" },
  { value: "picker", icon: Activity, labelKey: "map_tab_picker" },
] as const;
