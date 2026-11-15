# Domain & Architecture Glossary

This glossary defines the authoritative domain terminology and architectural seams for the project, adhering to deep-module design vocabulary (**module**, **interface**, **implementation**, **depth**, **seam**, **adapter**, **leverage**, **locality**).

---

## 1. Table Architecture Concepts (Data Table Subsystem)

### `DataTable` (Module)

The core high-leverage data grid module. Presents a unified interface to dashboard consumers, encapsulating column rendering, virtualization, selection, expansion, and accessibility behind a stable seam.

### `LayoutSeam` (Seam)

The boundary between high-frequency user interactions (column resizing, reordering, pinning offset calculation) and DOM rendering. Driven via CSS custom properties (`--col-w-*`, `--col-left-*`, `--col-right-*`) injected at the table container, isolating row and cell components from React re-render cascades.

### `TableStateAdapter` (Adapter)

An adapter fulfilling the table state interface at the state seam. Provides pagination, sorting, filtering, and search coordination.

- **`UrlTableStateAdapter`**: Drives state through Next.js App Router query parameters with debounced server fetching via TanStack Query.
- **`ClientTableStateAdapter`**: Manages state in-memory for client-side sorting, filtering, and slicing.

### `SelectionSet` (Module)

An $O(1)$ set-based row selection representation (`Set<DataTableRowId>`) replacing linear array scanning (`selection.includes(id)`), isolating selection updates to only the toggled row.

### `DataTableConfigContext` (Interface)

A static, memoized context providing column metadata, row identifiers, density tokens, and customization slots to the table tree without invalidating on transient drag or selection events.

### `FilterRegistry` (Module)

A consolidated schema-driven control mapper that maps filter definitions directly to shadcn UI controls, dissolving multi-tier pass-through layout wrappers.

---

## 2. Dialog & Overlay Subsystem

### `ModalFrame` (Module)

A deep polymorphic overlay module consolidating shadcn Dialog and Sheet primitives behind a single declarative interface. Encapsulates fullscreen toggling, responsive breakpoint adaptation, and header/footer action slots so callers focus solely on domain content.

---

## 3. Form Architecture Concepts

### `FormFieldEngine` (Module)

A high-leverage field binding module connecting headless TanStack Form reactive state with shadcn UI design tokens (`Field`, `FieldLabel`, `FieldError`, `FieldDescription`), eliminating redundant wrapper ceremonies across all 20+ form inputs.

---

## 4. Charting Subsystem

### `ChartFrame` (Module)

The responsive container seam for data visualizations. Drives Recharts SVG gradients and axis colors directly through CSS custom properties (`--chart-1..5`), avoiding JavaScript theme recalculation re-renders.

### `ChartFullscreenDialog` (Module)

An on-demand dynamically split modal seam decoupling `ChartCard` from static Radix Dialog bundle weight. Only evaluates and mounts Dialog dependencies when the user actively triggers fullscreen mode.

### `CartesianScaffold` (Module)

The shared Cartesian visualization scaffold unifying `ChartFrame`, grid lines, X/Y/dual axes, tooltips, reference lines, and timeline brushes across `AreaTrendChart`, `BarTrendChart`, `ComposedTrendChart`, `LineTrendChart`, `ScatterMetricChart`, and `WaterfallFinancialChart`.

### `ChartContext` (Interface)

The height propagation seam (`ChartProvider` / `useChartHeight`) allowing `ChartCard` and `ChartFullscreenDialog` to control descendant chart height as a single source of truth, overriding explicit card heights automatically during fullscreen expansion.

---

## 5. Infolist Subsystem

### `Infolist` (Module)

A declarative, data-driven read-only display engine presenting complex business entities across multiple layout topologies (grid, sections, fieldsets, tabs). Connects declarative entry leaves to structured record data without manual prop drilling.

### `InfolistContext` (Interface)

The memoized reactive seam propagating record instances, orientation (`vertical` / `horizontal`), and density tokens (`dense`) down to leaf entries, backed by a cached path-resolution engine (`getNestedValue`).

### `EntryWrapper` (Module)

The universal structural wrapper standardizing labels, help tooltips, responsive grid spans, and helper copy for all infolist entries while adapting smoothly between vertical stacks and horizontal inline pairs.

---

## 6. Stats & KPI Subsystem

### `SparklineEngine` (Module)

The pure TypeScript, framework-agnostic SVG geometry kernel at `src/components/shared/sparkline/sparklineEngine.ts`. Filters non-finite inputs in a single pass, normalizes single-point baselines cleanly without emitting empty gradient definitions, and serves both KPI `MiniSparkline` and dashboard `MetricSparkline` adapters.

### `StatCardContext` (Interface)

The unified configuration seam hosted at `StatCardRoot`. Absorbs grid-level layout defaults (`density`, `sparklineLayout`) from `StatsGridContext` and propagates card theme and interactivity downward so compound slots never leak redundant context hops or duplicate `density` prop drilling. Uses the Stretched-Link sibling pattern to separate primary navigation from elevated (`z-10`) interactive controls.

### `TrendEngine` (Module)

The pure calculation core (`resolveTrendInfo` in `src/components/stats/shared/trendEngine.ts`) shared across `StatCard`, `ProgressStatCard`, and `MultiMetricStatCard` (`StatCardTrend` `badge` and `inline` variants). Evaluates finite numeric values strictly, supports explicit semantic `tone` overrides (`positive` | `negative` | `neutral`), and provides localized screen-reader status keys.

### `LiveTelemetrySeam` (Interface)

The strict separation between production telemetry UI (`LiveStatCard` with `"online"` / `"warning"` / `"error"` / `"stale"` / `"offline"` status states, localized `Date | number` timestamp formatting, and sibling `onRetry` error recovery) and showcase simulation adapters (`useDemoTelemetryTicker` + split `DemoTelemetryContext`, isolating 2.5s tick updates to leaf showcase cards).

---

## 7. Geospatial & Map Infrastructure

### `MapFrame` (Deep Shell)

The unified deep wrapper in [`src/components/map/frame/MapFrame.tsx`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/components/map/frame/MapFrame.tsx) hosting all five visualization families (`LocationMarkerMap`, `RouteTrackingMap`, `GeoDistributionMap`, `ArcFlightMap`, `GeoHeatmapMap`). Owns the single loading/error/empty state machine, runtime MapLibre `error` listener with dismissible degraded-tile banner, `MapAutoResizer` / `MapFitBounds` viewport lifecycle, and optional `MapCard` chrome backed by persistent portal mounting (`MapCard` + `MapFullscreenDialog`) so fullscreen transitions never destroy the WebGL canvas. The MapLibre worker uses the `ui/map.tsx` default (unpkg CDN); no self-hosted worker is shipped.

### `GeoEngine` (Pure Module)

The framework-agnostic spatial geometry and projection calculation kernel (`src/components/map/utils/coordinates.ts` and `src/components/map/utils/geoEngine.ts`). Provides finite/Mercator coordinate validation (`isValidCoordinate`), 6-round iterative inverse projection convergence (`gcj02ToWgs84`), out-of-China BD-09 identity guards, antimeridian-aware bounding boxes (`computeBounds`), Mercator international date line arc splitting (`buildSplitArcSegments`), non-mutating `transformGeoJSON`, and decimal-preserving choropleth step generation (`buildChoroplethSteps`). Re-exported cleanly from `@/components/map/core` with zero WebGL runtime weight.

### `TokenBridge` (Style Adapter)

The runtime CSS token normalizer (`src/components/map/shared/tokenBridge.ts`). Resolves dynamic Tailwind v4 / CSS custom properties (`var(--primary)`, OKLCH, `color-mix`) through an offscreen 2D Canvas normalizer into concrete hex/RGBA strings readable by MapLibre GL paint specifications (`resolveCssColorToHex`, `buildAdaptiveSchemeRamp`), synchronized with DOM theme toggles via a singleton `MutationObserver` and `useSyncExternalStore` (`useMapThemeTokens`).

### `GeocodeAdapter` (Proxy & Test Double)

The client-server boundary for Amap POI search and reverse geocoding (`src/components/map/picker/geocodeAdapter.ts` paired with Next.js Route Handler `src/app/api/geocode/route.ts`). Keeps `AMAP_KEY` server-only via `HttpGeocodeAdapter` while enabling deterministic offline testing through `InMemoryGeocodeAdapter`. Layered under `amapGeo.ts` with per-caller `AbortSignal` isolation across shared in-flight requests, 60-second cooldown half-open circuit breaking, and short-TTL negative caching.

---

## 8. Core UI Shell, Dialogs & Notifications

### `ModalFrame` (Polymorphic Overlay Shell)

The shared container seam at [`src/components/dialogs/ModalFrame.tsx`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/components/dialogs/ModalFrame.tsx) unifying shadcn `Dialog` and `Sheet` (`variant="dialog" | "sheet"`) with fullscreen expansion (`FullscreenToggle`), localized accessibility titles, and lazy body mounting when closed (`{open ? children : null}`). Paired with [`useFormHostSync`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/components/dialogs/hooks/useFormHostSync.ts) and [`UnsavedChangesDialog`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/components/dialogs/UnsavedChangesDialog.tsx) across both `FormDialog` and `ResourceFormPage` to provide consistent `defaultValues`-over-`entity` precedence and reactive TanStack Form dirty guards.

### `ResourceHost` (Polymorphic Presentation Seam)

The unified resource CRUD boundary (`ResourceFormHost` and `ResourceViewHost` in `src/components/resource/`) switching cleanly between `"dialog"`, `"drawer"`, and `"page"` presentations with prop-aligned submit/title/fullscreen/dirty-guard behavior, driven by the framework-agnostic modal controller (`useResourceModalStateWithPort` / `useResourceModalState` in [`useResourceModalState.ts`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/components/dialogs/hooks/useResourceModalState.ts)).

### `NotificationsCache` (Query Filter & Stretched-Row Seam)

The normalized TanStack Query key & cache-routing seam (`normalizeNotificationFilters`, `extractNotificationFiltersFromKey`, `doesNotificationMatchFilters` in `src/features/notifications/`) that deduplicates `"all"` queries, prevents cross-tab cache pollution on realtime inserts/reads, and updates unread badge counts atomically across tabs. Paired with the stretched-trigger sibling row pattern in [`NotificationItemRow.tsx`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/components/notifications/item/NotificationItemRow.tsx) separating primary selection from floating row actions.

### `ShellMenuSeam` (Authorized Navigation Seam)

The memoized RBAC navigation boundary (`useAuthorizedMenuGroups` and `useAuthorizedFlatNavItems` in [`menu.config.ts`](file:///Users/seaside/Projects/frontend/nextjs/next-admin/src/components/layout/sidebar/menu.config.ts)) consumed by both `AppSidebar` and `GlobalSearchDialog`, ensuring single-source role filtering alongside isolated root theme subscriptions (`AppToaster`, `ThemeColorPicker`, and guarded `usePreferencesStore` persistence).
