import { Activity, Cpu, Flame, Globe, MapPin, Navigation, Network, PieChart } from "lucide-react";

import type { LocationMarkerItem, RouteStop } from "@/components/map";

export * from "./geoDatasets";

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
