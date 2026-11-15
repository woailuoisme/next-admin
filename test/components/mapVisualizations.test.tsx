import type * as GeoJSON from "geojson";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ArcFlightMap, GeoDistributionMap, GeoHeatmapMap, LocationMarkerMap, RouteTrackingMap } from "@/components/map";
import { MapFrame } from "@/components/map/frame/MapFrame";
import zhMessages from "@/messages/zh.json";

const mapMocks = vi.hoisted(() => {
  const sources = new Map<string, { data: unknown; setData: ReturnType<typeof vi.fn> }>();
  const layers = new Set<string>();
  const eventHandlers = new Map<string, Set<(e: unknown) => void>>();

  const fakeMap = {
    addSource: vi.fn((id: string, opts: { data: unknown }) => {
      const sourceObj = {
        data: opts.data,
        setData: vi.fn((next: unknown) => {
          sourceObj.data = next;
        }),
      };
      sources.set(id, sourceObj);
    }),
    getSource: vi.fn((id: string) => sources.get(id)),
    removeSource: vi.fn((id: string) => {
      sources.delete(id);
    }),
    addLayer: vi.fn((spec: { id: string }) => {
      layers.add(spec.id);
    }),
    getLayer: vi.fn((id: string) => (layers.has(id) ? { id } : undefined)),
    removeLayer: vi.fn((id: string) => {
      layers.delete(id);
    }),
    setPaintProperty: vi.fn(),
    setFeatureState: vi.fn(),
    fitBounds: vi.fn(),
    flyTo: vi.fn(),
    resize: vi.fn(),
    getCanvas: vi.fn(() => ({ style: { cursor: "" } })),
    on: vi.fn((event: string, layerOrCb: unknown, maybeCb?: unknown) => {
      const cb =
        typeof layerOrCb === "function" ? (layerOrCb as (e: unknown) => void) : (maybeCb as (e: unknown) => void);
      if (!eventHandlers.has(event)) eventHandlers.set(event, new Set());
      eventHandlers.get(event)?.add(cb);
    }),
    off: vi.fn((event: string, layerOrCb: unknown, maybeCb?: unknown) => {
      const cb =
        typeof layerOrCb === "function" ? (layerOrCb as (e: unknown) => void) : (maybeCb as (e: unknown) => void);
      eventHandlers.get(event)?.delete(cb);
    }),
    emit(event: string, payload: unknown) {
      for (const cb of eventHandlers.get(event) ?? []) {
        cb(payload);
      }
    },
    reset() {
      sources.clear();
      layers.clear();
      eventHandlers.clear();
      fakeMap.addSource.mockClear();
      fakeMap.removeSource.mockClear();
      fakeMap.addLayer.mockClear();
      fakeMap.removeLayer.mockClear();
      fakeMap.setPaintProperty.mockClear();
      fakeMap.fitBounds.mockClear();
      fakeMap.flyTo.mockClear();
      fakeMap.resize.mockClear();
    },
  };

  return { fakeMap };
});

vi.mock("@/components/ui/map", () => {
  return {
    useMap: () => ({ map: mapMocks.fakeMap, isLoaded: true, resolvedTheme: "light" }),
    Map: ({ children, className }: { children?: ReactNode; className?: string }) => (
      <div data-testid="mock-map-canvas" className={className}>
        {children}
      </div>
    ),
    MapControls: () => <div data-testid="mock-map-controls" />,
    MapMarker: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
      <div data-testid="mock-map-marker" onClick={onClick}>
        {children}
      </div>
    ),
    MarkerContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    MarkerPopup: ({ children }: { children?: ReactNode }) => <div data-testid="mock-marker-popup">{children}</div>,
    MarkerTooltip: ({ children }: { children?: ReactNode }) => <div data-testid="mock-marker-tooltip">{children}</div>,
    MapClusterLayer: ({ data }: { data: GeoJSON.FeatureCollection }) => (
      <div data-testid="mock-cluster-layer" data-count={data.features.length} />
    ),
    MapRoute: ({ children, coordinates }: { children?: ReactNode; coordinates: [number, number][] }) => (
      <div data-testid="mock-map-route" data-points={coordinates.length}>
        {children}
      </div>
    ),
    RouteProgress: ({ color }: { color?: string }) => <div data-testid="mock-route-progress" data-color={color} />,
    RouteMarker: ({ children }: { children?: ReactNode }) => <div data-testid="mock-route-marker">{children}</div>,
    MapGeoJSON: ({ data }: { data: GeoJSON.GeoJSON }) => <div data-testid="mock-map-geojson" data-type={data.type} />,
    MapArc: ({
      data,
      onHover,
    }: {
      data: Array<{ id: string | number }>;
      onHover?: (e: { arc: { id: string | number } } | null) => void;
    }) => (
      <div
        data-testid="mock-map-arc"
        data-count={data.length}
        onMouseEnter={() => onHover?.({ arc: data[0] })}
        onMouseLeave={() => onHover?.(null)}
      />
    ),
  };
});

function renderMap(ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale="zh" messages={zhMessages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("MapFrame & All 5 Map Families", () => {
  beforeEach(() => {
    mapMocks.fakeMap.reset();
  });

  it("handles runtime error banner dismissal and retry inside MapFrame", () => {
    const onRetry = vi.fn();
    renderMap(
      <MapFrame center={[116.4, 39.9]} zoom={10} onRetry={onRetry}>
        <div>child-layer</div>
      </MapFrame>,
    );

    expect(screen.getByText("child-layer")).toBeInTheDocument();

    act(() => {
      mapMocks.fakeMap.emit("error", { error: { status: 401, message: "Unauthorized tile" } });
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: zhMessages.map.dismiss_notice }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    act(() => {
      mapMocks.fakeMap.emit("error", { error: { status: 401, message: "Unauthorized tile" } });
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: zhMessages.map.retry }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("filters markers, switches to GPU cluster mode when exceeding tierThreshold, and auto-renders empty state", () => {
    const locations = [
      { id: "1", title: "Beijing Hub", coordinates: [116.4, 39.9] as [number, number], category: "hub" },
      { id: "2", title: "Shanghai Store", coordinates: [121.47, 31.23] as [number, number], category: "store" },
    ];

    renderMap(
      <LocationMarkerMap
        locations={locations}
        tierThreshold={200}
        showSearch
        showCategoryFilter
        cardProps={{ title: "Markers Card" }}
      />,
    );

    expect(screen.getAllByTestId("mock-map-marker")).toHaveLength(2);

    const searchInput = screen.getByPlaceholderText(zhMessages.map.markers_search_placeholder);
    fireEvent.change(searchInput, { target: { value: "Shanghai" } });
    expect(screen.getAllByTestId("mock-map-marker")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: zhMessages.map.markers_clear_search }));
    expect(screen.getAllByTestId("mock-map-marker")).toHaveLength(2);

    // Trigger canvas tier mode cleanly with tierThreshold=1
    renderMap(<LocationMarkerMap locations={locations} tierThreshold={1} />);
    expect(screen.getByTestId("mock-cluster-layer")).toHaveAttribute("data-count", "2");
  });

  it("renders RouteTrackingMap with scrubber playback controls and stops", () => {
    renderMap(
      <RouteTrackingMap
        coordinates={[
          [116.4, 39.9],
          [117.2, 39.1],
        ]}
        stops={[
          { id: "s1", name: "Tianjin Stop", coordinates: [117.2, 39.1], status: "pending", arrivalTime: "14:00" },
        ]}
        vehicle={{ id: "veh-1", name: "Express 01", speed: 80 }}
      />,
    );

    expect(screen.getByTestId("mock-map-route")).toHaveAttribute("data-points", "2");
    expect(screen.getByRole("button", { name: zhMessages.map.route_play })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: zhMessages.map.route_reset })).toBeInTheDocument();
  });

  it("renders GeoDistributionMap with choropleth steps and legend", () => {
    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { id: "bj", name: "Beijing", value: 120 },
          geometry: { type: "Point", coordinates: [116.4, 39.9] },
        },
        {
          type: "Feature",
          properties: { id: "sh", name: "Shanghai", value: 240 },
          geometry: { type: "Point", coordinates: [121.4, 31.2] },
        },
      ],
    };

    renderMap(<GeoDistributionMap data={geojson} legendTitle="Regional Metric" />);
    expect(screen.getByTestId("mock-map-geojson")).toHaveAttribute("data-type", "FeatureCollection");
    expect(screen.getByText("Regional Metric")).toBeInTheDocument();
  });

  it("renders ArcFlightMap in both globe mode (MapArc) and mercator mode (ArcSplitLineLayer)", () => {
    const arcs = [{ id: "pac", from: [139.69, 35.68] as [number, number], to: [-122.41, 37.77] as [number, number] }];

    const { rerender } = render(
      <NextIntlClientProvider locale="zh" messages={zhMessages}>
        <ArcFlightMap data={arcs} projection="globe" />
      </NextIntlClientProvider>,
    );
    expect(screen.getByTestId("mock-map-arc")).toHaveAttribute("data-count", "1");

    rerender(
      <NextIntlClientProvider locale="zh" messages={zhMessages}>
        <ArcFlightMap data={arcs} projection="mercator" />
      </NextIntlClientProvider>,
    );
    expect(mapMocks.fakeMap.addSource).toHaveBeenCalledTimes(1);
    expect(mapMocks.fakeMap.addLayer).toHaveBeenCalledTimes(2);
  });

  it("shows and clears the ArcFlightMap hover detail card from the hover leaf store", () => {
    const arcs = [
      {
        id: "pac",
        from: [139.69, 35.68] as [number, number],
        to: [-122.41, 37.77] as [number, number],
        fromLabel: "Tokyo",
        toLabel: "San Francisco",
      },
    ];
    renderMap(<ArcFlightMap data={arcs} projection="globe" />);

    const arcLayer = screen.getByTestId("mock-map-arc");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    fireEvent.mouseEnter(arcLayer);
    const detailCard = screen.getByRole("status");
    expect(detailCard).toHaveTextContent("Tokyo");
    expect(detailCard).toHaveTextContent("San Francisco");

    fireEvent.mouseLeave(arcLayer);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps map children mounted when MapCard enters fullscreen", async () => {
    let mounts = 0;
    let unmounts = 0;
    function MountSpy() {
      useEffect(() => {
        mounts += 1;
        return () => {
          unmounts += 1;
        };
      }, []);
      return <div data-testid="mount-spy" />;
    }

    renderMap(
      <MapFrame center={[116.4, 39.9]} zoom={10} cardProps={{ title: "Fullscreen Card", fullscreenable: true }}>
        <MountSpy />
      </MapFrame>,
    );

    expect(mounts).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: zhMessages.map.fullscreen_title }));

    await waitFor(() => {
      expect(screen.getByText(zhMessages.map.fullscreen_active)).toBeInTheDocument();
    });
    expect(mounts).toBe(1);
    expect(unmounts).toBe(0);
    expect(screen.getByTestId("mount-spy")).toBeInTheDocument();
  });

  it("does not treat a lone errorMessage as a fatal error in MapFrame", () => {
    renderMap(
      <MapFrame center={[116.4, 39.9]} zoom={10} errorMessage="fallback copy">
        <div>child-layer</div>
      </MapFrame>,
    );
    expect(screen.getByText("child-layer")).toBeInTheDocument();
    expect(screen.queryByText("fallback copy")).not.toBeInTheDocument();
  });

  it("updates GeoHeatmapMap paint properties incrementally without tearing down WebGL source", async () => {
    const pts = [
      { coordinates: [116.4, 39.9] as [number, number], weight: 0.9 },
      { coordinates: [121.4, 31.2] as [number, number], weight: 0.6 },
    ];

    const { rerender } = render(
      <NextIntlClientProvider locale="zh" messages={zhMessages}>
        <GeoHeatmapMap data={pts} radius={20} colorRamp="thermal" />
      </NextIntlClientProvider>,
    );

    expect(mapMocks.fakeMap.addSource).toHaveBeenCalledTimes(1);
    expect(mapMocks.fakeMap.addLayer).toHaveBeenCalledTimes(1);

    rerender(
      <NextIntlClientProvider locale="zh" messages={zhMessages}>
        <GeoHeatmapMap data={pts} radius={35} colorRamp="viridis" />
      </NextIntlClientProvider>,
    );

    await waitFor(() => {
      expect(mapMocks.fakeMap.addSource).toHaveBeenCalledTimes(1);
      expect(mapMocks.fakeMap.removeSource).not.toHaveBeenCalled();
      expect(mapMocks.fakeMap.setPaintProperty).toHaveBeenCalled();
    });
  });
});
