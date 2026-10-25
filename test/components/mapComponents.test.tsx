import { cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  BASEMAP_OPTIONS,
  LruCache,
  MapCard,
  MapEmptyState,
  MapSkeleton,
  createLazyMap,
  gcj02ToWgs84,
  isInsideChina,
  resolveBasemapConfig,
  snapCoordinateToGrid,
  transformCoordinates,
  wgs84ToGcj02,
} from "@/components/map";
import { renderWithProviders, screen } from "test/test-utils";

afterEach(() => {
  cleanup();
});

describe("Map Feedback & Skeleton Components", () => {
  it("renders MapSkeleton with localized loading message", () => {
    renderWithProviders(<MapSkeleton height={300} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("正在载入矢量地理数据与底图资源...")).toBeInTheDocument();
  });

  it("renders MapSkeleton in English when locale is en", () => {
    renderWithProviders(<MapSkeleton height={300} />, { locale: "en" });
    expect(screen.getByText("Loading geospatial vector data and basemap resources...")).toBeInTheDocument();
  });

  it("renders MapEmptyState for no-data state", () => {
    renderWithProviders(<MapEmptyState height={300} type="no-data" />);
    expect(screen.getByText("暂无地理坐标数据")).toBeInTheDocument();
    expect(screen.getByText("当前筛选或图层条件下未检索到可显示的地理空间要素或网点")).toBeInTheDocument();
  });

  it("renders MapEmptyState for error state with retry button", () => {
    let retried = false;
    renderWithProviders(
      <MapEmptyState
        height={300}
        type="error"
        actionLabel="重试加载"
        onAction={() => {
          retried = true;
        }}
      />,
    );
    expect(screen.getByText("地图数据加载失败")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /重试加载/ });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(retried).toBe(true);
  });
});

describe("MapCard Container & Basemap Dropdown", () => {
  it("renders MapCard with title, description, and children", () => {
    renderWithProviders(
      <MapCard title="Test Map" description="Test Map Description">
        <div data-testid="map-inner">Map Canvas</div>
      </MapCard>,
    );

    expect(screen.getByText("Test Map")).toBeInTheDocument();
    expect(screen.getByText("Test Map Description")).toBeInTheDocument();
    expect(screen.getByTestId("map-inner")).toBeInTheDocument();
  });

  it("renders basemap selector dropdown and triggers change", async () => {
    let currentBasemap = "carto";
    renderWithProviders(
      <MapCard
        title="Basemap Card"
        basemap={currentBasemap as any}
        showBasemapSelector={true}
        onBasemapChange={(b) => {
          currentBasemap = b;
        }}
      >
        <div>Content</div>
      </MapCard>,
    );

    const selectorBtn = screen.getByRole("button", { name: "底图图层" });
    expect(selectorBtn).toBeInTheDocument();
    fireEvent.pointerDown(selectorBtn, { button: 0 });

    // In Radix Menu, if pointerDown doesn't open it in jsdom without pointer events polyfill, try keyDown
    if (selectorBtn.getAttribute("aria-expanded") !== "true") {
      fireEvent.keyDown(selectorBtn, { key: "ArrowDown" });
    }

    // Amap option is in the menu
    const amapOption = await screen.findByText("高德地图 (Amap)");
    expect(amapOption).toBeInTheDocument();
    fireEvent.click(amapOption);
    expect(currentBasemap).toBe("amap");
  });

  it("renders error state inside MapCard with retry button", () => {
    let retried = false;
    renderWithProviders(
      <MapCard
        title="Error Card"
        isError={true}
        errorMessage="Custom Error Loading Tiles"
        onRetry={() => {
          retried = true;
        }}
      >
        <div>Content</div>
      </MapCard>,
    );

    expect(screen.getByText("Custom Error Loading Tiles")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: "重试加载" });
    fireEvent.click(retryBtn);
    expect(retried).toBe(true);
  });

  it("renders empty state inside MapCard when isEmpty is true", () => {
    renderWithProviders(
      <MapCard title="Empty Card" isEmpty={true} emptyMessage="No Points Recorded">
        <div>Content</div>
      </MapCard>,
    );

    expect(screen.getByText("No Points Recorded")).toBeInTheDocument();
  });
});

describe("Coordinates Transformations & Geographic Utilities", () => {
  it("detects whether coordinates are inside China boundary", () => {
    // Beijing is inside China
    expect(isInsideChina([116.4074, 39.9042])).toBe(true);
    // Tokyo is outside China
    expect(isInsideChina([139.6917, 35.6895])).toBe(false);
  });

  it("transforms WGS84 to GCJ-02 and back with small tolerance", () => {
    const beijingWGS84: [number, number] = [116.4074, 39.9042];
    const gcj02 = wgs84ToGcj02(beijingWGS84);

    // GCJ-02 in Beijing has an offset of roughly ~0.005 degrees
    expect(gcj02[0]).not.toBe(beijingWGS84[0]);
    expect(gcj02[1]).not.toBe(beijingWGS84[1]);

    const revertedWGS84 = gcj02ToWgs84(gcj02);
    expect(revertedWGS84[0]).toBeCloseTo(beijingWGS84[0], 4);
    expect(revertedWGS84[1]).toBeCloseTo(beijingWGS84[1], 4);
  });

  it("transforms coordinate systems using generic transformCoordinates helper", () => {
    const coords: [number, number] = [116.4074, 39.9042];
    const same = transformCoordinates(coords, "WGS84", "WGS84");
    expect(same).toEqual(coords);

    const gcj = transformCoordinates(coords, "WGS84", "GCJ02");
    expect(gcj[0]).toBeGreaterThan(116.4);
  });
});

describe("Basemaps Presets", () => {
  it("resolves basemap styles properly", () => {
    const carto = resolveBasemapConfig("carto");
    expect(carto.blank).toBe(false);
    expect(carto.styles).toBeDefined();

    const blank = resolveBasemapConfig("blank");
    expect(blank.blank).toBe(true);

    expect(BASEMAP_OPTIONS.length).toBeGreaterThanOrEqual(5);
  });
});

describe("AMAP Geo Utilities & LRU Cache", () => {
  it("snaps coordinate to grid key for caching", () => {
    const key1 = snapCoordinateToGrid([116.4074123, 39.9042123]);
    const key2 = snapCoordinateToGrid([116.4074199, 39.9042199]);
    expect(key1).toBe(key2);
  });

  it("operates LRU Cache with capacity eviction", () => {
    const cache = new LruCache<string, number>(3);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);

    expect(cache.get("a")).toBe(1); // accesses 'a', makes 'b' oldest
    cache.set("d", 4); // evicts 'b'

    expect(cache.has("b")).toBe(false);
    expect(cache.get("a")).toBe(1);
    expect(cache.get("c")).toBe(3);
    expect(cache.get("d")).toBe(4);
    expect(cache.size).toBe(3);
  });
});

describe("createLazyMap wrapper", () => {
  it("renders fallback MapSkeleton while lazy map component loads", () => {
    const DummyMap = createLazyMap(
      () =>
        new Promise<{ default: React.ComponentType<{ height?: number }> }>(() => {
          // Never resolves to verify Suspense fallback
        }),
      { defaultHeight: 350 },
    );

    renderWithProviders(<DummyMap height={350} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
