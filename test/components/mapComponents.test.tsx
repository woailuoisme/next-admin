import { cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BASEMAP_OPTIONS,
  MapCard,
  MapEmptyState,
  MapSkeleton,
  createLazyMap,
  gcj02ToWgs84,
  isInsideChina,
  resolveBasemapConfig,
  transformCoordinates,
  wgs84ToGcj02,
} from "@/components/map";
import { CLUSTER_SAFE_TEXT_FONT, syncClusterCountLayerFont } from "@/components/map/markers/LocationMarkerClusterView";
import { LruCache, snapCoordinateToGrid } from "@/components/map/picker/amapGeo";
import { transformMapRequest } from "@/components/map/shared/constants";
import { ensureFallbackStyleImage } from "@/components/map/shared/MapAutoResizer";
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

describe("Basemaps Presets & Runtime Guards", () => {
  it("resolves basemap styles properly and degrades tianditu silently when token is unconfigured", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const carto = resolveBasemapConfig("carto");
    expect(carto.blank).toBe(false);
    expect(carto.styles).toBeDefined();

    const blank = resolveBasemapConfig("blank");
    expect(blank.blank).toBe(true);

    const tianditu = resolveBasemapConfig("tianditu");
    expect(tianditu.blank).toBe(false);
    expect(tianditu.degradedFrom).toBe("tianditu");
    expect(tianditu.styles?.light).toBe("https://tiles.openfreemap.org/styles/liberty");
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();

    expect(BASEMAP_OPTIONS.length).toBeGreaterThanOrEqual(5);
  });

  it("rewrites unsupported Open Sans Semibold glyph requests to Noto Sans Regular", () => {
    const rawGlyphUrl = "https://tiles.basemaps.cartocdn.com/v/20261026-01/fonts/Open Sans Semibold/0-255.pbf";
    expect(transformMapRequest(rawGlyphUrl, "Glyphs")).toEqual({
      url: "https://tiles.basemaps.cartocdn.com/v/20261026-01/fonts/Noto%20Sans%20Regular/0-255.pbf",
    });

    const encodedGlyphUrl = "https://tiles.openfreemap.org/fonts/Open%20Sans%20Semibold/0-255.pbf";
    expect(transformMapRequest(encodedGlyphUrl, "Glyphs")).toEqual({
      url: "https://tiles.openfreemap.org/fonts/Noto%20Sans%20Regular/0-255.pbf",
    });

    const tileUrl = "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles/1/1/1.mvt";
    expect(transformMapRequest(tileUrl, "Tile")).toEqual({ url: tileUrl });
  });

  it("syncs cluster-count symbol layers to safe text-font stack", () => {
    const setLayoutProperty = vi.fn();
    const mockMap = {
      getStyle: () => ({
        layers: [
          { id: "clusters-1", type: "circle" },
          { id: "cluster-count-1", type: "symbol" },
        ],
      }),
      getLayoutProperty: () => ["Open Sans Semibold"],
      setLayoutProperty,
    } as any;

    syncClusterCountLayerFont(mockMap);
    expect(setLayoutProperty).toHaveBeenCalledWith("cluster-count-1", "text-font", [...CLUSTER_SAFE_TEXT_FONT]);
  });

  it("registers 1x1 transparent fallback image when sprite icon like circle-11 is missing", () => {
    const addImage = vi.fn();
    const hasImage = vi.fn().mockReturnValue(false);
    const mockMap = { addImage, hasImage } as any;

    ensureFallbackStyleImage(mockMap, "circle-11");
    expect(hasImage).toHaveBeenCalledWith("circle-11");
    expect(addImage).toHaveBeenCalledWith("circle-11", {
      width: 1,
      height: 1,
      data: new Uint8Array([0, 0, 0, 0]),
    });
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
