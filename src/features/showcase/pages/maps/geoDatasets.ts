import type { ArcFlightItem, HeatmapPoint, LocationMarkerItem } from "@/components/map";

function rectFeature(
  id: string,
  name: string,
  value: number,
  orders: number,
  w: number,
  s: number,
  e: number,
  n: number,
): GeoJSON.Feature {
  return {
    type: "Feature",
    id,
    properties: { id, name, value, orders },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [w, s],
          [e, s],
          [e, n],
          [w, n],
          [w, s],
        ],
      ],
    },
  };
}

// 3. Mock GeoJSON data for GeoDistributionMap
export const MOCK_GEOJSON_DATA: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    rectFeature("BJ", "Beijing", 890, 154200, 115.4, 39.4, 117.5, 41.1),
    rectFeature("SH", "Shanghai", 960, 218900, 120.8, 30.6, 122.2, 31.9),
    rectFeature("GD", "Guangdong", 1250, 341000, 109.6, 20.2, 117.3, 25.5),
    rectFeature("ZJ", "Zhejiang", 820, 198500, 118.0, 27.0, 123.0, 31.2),
    rectFeature("SC", "Sichuan", 580, 112000, 97.3, 26.0, 108.5, 34.3),
    rectFeature("HB", "Hubei", 640, 135000, 108.3, 29.0, 116.1, 33.3),
  ],
};

// 4. Mock Arcs for ArcFlightMap
export const MOCK_FLIGHT_ARCS: ArcFlightItem[] = [
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
