# Domain & Architecture Glossary

This glossary defines the authoritative domain terminology and architectural seams for the project, adhering to deep-module design vocabulary (**module**, **interface**, **implementation**, **depth**, **seam**, **adapter**, **leverage**, **locality**).

---

## 1. Table Architecture Concepts (Data Table Subsystem)

### `DataTable` (Module)

The core high-leverage data grid module. Presents a unified interface to dashboard consumers, encapsulating column rendering, virtualization, selection, expansion, and accessibility behind a stable seam.

### `LayoutSeam` (Seam)

The boundary between high-frequency user interactions (column resizing, reordering, pinning offset calculation) and DOM rendering. Driven via CSS custom properties (`--col-w-*`, `--col-pin-left-*`) injected at the table container, isolating row and cell components from React re-render cascades.

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

---

## 5. Infolist Subsystem

### `Infolist` (Module)

A declarative, data-driven read-only display engine presenting complex business entities across multiple layout topologies (grid, sections, fieldsets, tabs). Connects declarative entry leaves to structured record data without manual prop drilling.

### `InfolistContext` (Interface)

The memoized reactive seam propagating record instances, orientation (`vertical` / `horizontal`), and density tokens (`dense`) down to leaf entries, backed by a cached path-resolution engine (`getNestedValue`).

### `EntryWrapper` (Module)

The universal structural wrapper standardizing labels, help tooltips, responsive grid spans, and helper copy for all infolist entries while adapting smoothly between vertical stacks and horizontal inline pairs.
