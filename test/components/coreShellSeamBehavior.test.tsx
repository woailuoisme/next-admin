import { QueryClientProvider } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { act, renderHook } from "@testing-library/react";
import { Profiler, type ReactNode, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TableRouterPort } from "@/components/data-table/adapters/types";
import { FormDialog } from "@/components/dialogs/FormDialog";
import { useResourceModalStateWithPort } from "@/components/dialogs/hooks/useResourceModalState";
import { ResourceFormPage } from "@/components/resource/ResourceFormPage";
import { BackToTop } from "@/components/shared/BackToTop";
import {
  extractNotificationFiltersFromKey,
  normalizeNotificationFilters,
  notificationKeys,
  useMarkAsReadMutation,
  useRealtimeNotifications,
} from "@/features/notifications/hooks";
import { EMPTY_NOTIFICATION_FILTERS } from "@/features/notifications/resource";
import type { NotificationItem, NotificationListResponse } from "@/features/notifications/types";
import { THEME_MODE_STORAGE_KEY, THEME_RADIUS_STORAGE_KEY, usePreferencesStore } from "@/stores/preferences";
import { createTestQueryClient, renderWithProviders, screen, waitFor } from "test/test-utils";

const subscriptionListeners = new Set<(pub: { data: unknown }) => void>();

vi.mock("@/integrations/centrifuge", () => ({
  useCentrifuge: () => ({ isConnected: true }),
  useSubscription: (_channel: string, onPublication: (pub: { data: unknown }) => void) => {
    subscriptionListeners.add(onPublication);
  },
}));

vi.mock("@/features/notifications/resource", async (importOriginal) => {
  const actual =
    typeof importOriginal === "function"
      ? await importOriginal<typeof import("@/features/notifications/resource")>()
      : await import("@/features/notifications/resource");
  return {
    ...actual,
    fetchNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(async (id: string) => ({ id, read: true })),
    markAllNotificationsAsRead: vi.fn(async () => ({ success: true, count: 1 })),
    deleteNotification: vi.fn(async () => undefined),
  };
});

function makeNotification(overrides: Partial<NotificationItem> & { id: string }): NotificationItem {
  return {
    title: `通知 ${overrides.id}`,
    description: "测试详情",
    category: "system",
    severity: "info",
    read: false,
    createdAt: "2026-11-15T10:00:00Z",
    ...overrides,
  };
}

describe("Core UI Shell & Dialogs Seams", () => {
  const initialPreferencesSnapshot = {
    theme: usePreferencesStore.getState().theme,
    mode: usePreferencesStore.getState().mode,
    resolvedMode: usePreferencesStore.getState().resolvedMode,
    radius: usePreferencesStore.getState().radius,
    activeThemeMeta: usePreferencesStore.getState().activeThemeMeta,
  };

  beforeEach(() => {
    subscriptionListeners.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.removeItem(THEME_MODE_STORAGE_KEY);
    window.localStorage.removeItem(THEME_RADIUS_STORAGE_KEY);
    usePreferencesStore.setState(initialPreferencesSnapshot);
  });

  describe("FormDialog & ResourceFormPage sync, reactive dirty guard & close paths", () => {
    it("skips rendering body subtree when closed, prioritizes defaultValues over entity, and syncs same-ID enrichment", () => {
      const mountSpy = vi.fn();
      function ProbeChild() {
        mountSpy();
        return <div data-testid="probe-child">Mounted</div>;
      }

      function Harness({
        open,
        entity,
      }: {
        open: boolean;
        entity: { id: string; name: string; role: string; bio?: string };
      }) {
        const form = useForm({
          defaultValues: { name: "base", role: "viewer", bio: "" },
          onSubmit: async () => {},
        });
        return (
          <div>
            <form.Subscribe selector={(s) => s.values}>
              {(values) => <span data-testid="form-values">{JSON.stringify(values)}</span>}
            </form.Subscribe>
            <FormDialog
              open={open}
              onOpenChange={vi.fn()}
              form={form}
              entity={entity}
              defaultValues={{ name: "Override Default" }}
              entityName="成员"
            >
              <ProbeChild />
            </FormDialog>
          </div>
        );
      }

      const { rerender } = renderWithProviders(
        <Harness open={false} entity={{ id: "1", name: "Raw Entity", role: "editor" }} />,
      );
      expect(mountSpy).not.toHaveBeenCalled();

      rerender(<Harness open={true} entity={{ id: "1", name: "Raw Entity", role: "editor" }} />);
      expect(mountSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("probe-child")).toBeInTheDocument();
      const firstParsed = JSON.parse(screen.getByTestId("form-values").textContent || "{}");
      expect(firstParsed.name).toBe("Override Default");
      expect(firstParsed.role).toBe("editor");

      // Same-ID async entity enrichment while form is clean must reset new fields
      rerender(<Harness open={true} entity={{ id: "1", name: "Raw Entity", role: "admin", bio: "Enriched" }} />);
      const enrichedParsed = JSON.parse(screen.getByTestId("form-values").textContent || "{}");
      expect(enrichedParsed.role).toBe("admin");
      expect(enrichedParsed.bio).toBe("Enriched");
    });

    it("distinguishes Cancel vs Escape Dismiss, supports staying, and clears discard modal when externally closed", async () => {
      const onOpenChange = vi.fn();
      const onCancel = vi.fn();
      let setFieldDirty!: () => void;

      function DirtyHarness({ open = true }: { open?: boolean }) {
        const form = useForm({
          defaultValues: { title: "Initial" },
          onSubmit: async () => {},
        });
        setFieldDirty = () => form.setFieldValue("title", "Modified Title");
        return (
          <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            onCancel={onCancel}
            form={form}
            enableDirtyGuard={true}
            title="编辑文章"
          >
            <div data-testid="dirty-body">Form Body</div>
          </FormDialog>
        );
      }

      const { user, rerender } = renderWithProviders(<DirtyHarness open={true} />);

      act(() => {
        setFieldDirty();
      });

      // Clicking Cancel -> stay keeps dialog open without calling onCancel
      await user.click(screen.getByRole("button", { name: "取消" }));
      expect(screen.getByText("放弃未保存的修改？")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "继续编辑" }));
      await waitFor(() => {
        expect(screen.queryByText("放弃未保存的修改？")).not.toBeInTheDocument();
      });
      expect(onOpenChange).not.toHaveBeenCalled();

      // Dismissing via Escape triggers dirty guard and confirms WITHOUT calling onCancel
      await user.keyboard("{Escape}");
      expect(screen.getByText("放弃未保存的修改？")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "放弃修改" }));
      await waitFor(() => {
        expect(onCancel).not.toHaveBeenCalled();
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });

      onOpenChange.mockClear();

      // External open=false while UnsavedChangesDialog is open cleans it up and prevents stale onCancel
      await user.click(screen.getByRole("button", { name: "取消" }));
      expect(screen.getByText("放弃未保存的修改？")).toBeInTheDocument();
      rerender(<DirtyHarness open={false} />);
      await waitFor(() => {
        expect(screen.queryByText("放弃未保存的修改？")).not.toBeInTheDocument();
      });
      expect(onCancel).not.toHaveBeenCalled();

      // Confirming via Cancel button invokes onCancel once
      rerender(<DirtyHarness open={true} />);
      act(() => {
        setFieldDirty();
      });
      await user.click(screen.getByRole("button", { name: "取消" }));
      await user.click(screen.getByRole("button", { name: "放弃修改" }));
      await waitFor(() => {
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("guards ResourceFormPage unsaved edits with AlertDialog and beforeunload without explicit isDirty prop", async () => {
      const onCancel = vi.fn();
      let setFieldDirty!: () => void;

      function PageHarness() {
        const form = useForm({
          defaultValues: { name: "初始名称" },
          onSubmit: async () => {},
        });
        setFieldDirty = () => form.setFieldValue("name", "已修改名称");
        return (
          <ResourceFormPage title="编辑客户" form={form} onCancel={onCancel}>
            <div>Page Field</div>
          </ResourceFormPage>
        );
      }

      const { user } = renderWithProviders(<PageHarness />);
      act(() => {
        setFieldDirty();
      });

      const beforeUnloadEvent = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(beforeUnloadEvent);
      expect(beforeUnloadEvent.defaultPrevented).toBe(true);

      await user.click(screen.getByRole("button", { name: "取消" }));
      expect(screen.getByText("放弃未保存的修改？")).toBeInTheDocument();
      expect(onCancel).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "放弃并离开" }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("useResourceModalStateWithPort isolation and lifecycle actions", () => {
    it("manages create/edit/view/single-delete/batch-delete cleanly and ignores stale empty batchDelete URL", () => {
      function useMemoryModal(initial: TableRouterPort["searchParams"] = {}) {
        const [searchParams, setSearchParams] = useState<TableRouterPort["searchParams"]>(initial);
        const navigate: TableRouterPort["navigate"] = (updater) => {
          setSearchParams((prev) => updater(prev) as TableRouterPort["searchParams"]);
        };
        const modal = useResourceModalStateWithPort({
          syncWithUrl: true,
          router: { searchParams, navigate },
        });
        return { modal, searchParams, setSearchParams };
      }

      // Stale ?batchDelete=true with zero selected IDs must not open empty delete modal
      const stale = renderHook(() => useMemoryModal({ batchDelete: true }));
      expect(stale.result.current.modal.isBatchDelete).toBe(false);
      expect(stale.result.current.modal.isDeleteOpen).toBe(false);

      const { result } = renderHook(() => useMemoryModal());

      act(() => result.current.modal.openCreate());
      expect(result.current.modal.isCreateOpen).toBe(true);
      expect(result.current.searchParams.create).toBe(true);

      act(() => result.current.modal.openEdit("e-42"));
      expect(result.current.modal.isEditOpen).toBe(true);
      expect(result.current.modal.editId).toBe("e-42");
      expect(result.current.modal.isCreateOpen).toBe(false);
      expect(result.current.searchParams.create).toBeUndefined();

      act(() => result.current.modal.closeFormDialog());
      expect(result.current.modal.isCreateOpen).toBe(false);
      expect(result.current.modal.isEditOpen).toBe(false);
      expect(result.current.searchParams.create).toBeUndefined();
      expect(result.current.searchParams.editId).toBeUndefined();

      act(() => result.current.modal.openView("v-7"));
      expect(result.current.modal.isViewOpen).toBe(true);
      expect(result.current.modal.viewId).toBe("v-7");
      act(() => result.current.modal.closeView());
      expect(result.current.modal.isViewOpen).toBe(false);

      act(() => result.current.modal.openDelete("d-9"));
      expect(result.current.modal.isDeleteOpen).toBe(true);
      expect(result.current.modal.isBatchDelete).toBe(false);
      expect(result.current.modal.deleteCount).toBe(1);
      act(() => result.current.modal.closeDelete());
      expect(result.current.modal.isDeleteOpen).toBe(false);

      act(() => result.current.modal.openBatchDelete(["10", "20"]));
      expect(result.current.modal.isBatchDelete).toBe(true);
      expect(result.current.modal.isDeleteOpen).toBe(true);
      expect(result.current.modal.deleteCount).toBe(2);
      expect(result.current.searchParams.batchDelete).toBe(true);

      // External URL removal clears batch delete synchronously
      act(() => result.current.setSearchParams({}));
      expect(result.current.modal.isBatchDelete).toBe(false);
      expect(result.current.modal.deleteIds).toEqual([]);
      expect(result.current.modal.isDeleteOpen).toBe(false);
    });
  });

  describe("Notifications cache normalization, realtime isolation & cross-tab unread consistency", () => {
    it("normalizes 'all' category to EMPTY_NOTIFICATION_FILTERS and extracts filters safely from keys", () => {
      expect(normalizeNotificationFilters({ category: "all" as never, unreadOnly: false })).toBe(
        EMPTY_NOTIFICATION_FILTERS,
      );
      const key = notificationKeys.list({ category: "order", unreadOnly: true });
      expect(extractNotificationFiltersFromKey(key)).toEqual({ category: "order", unreadOnly: true });
    });

    it("routes realtime alerts only to matching list caches, deduplicates, and preserves cross-tab unreadCount", async () => {
      const queryClient = createTestQueryClient();
      const allKey = notificationKeys.list();
      const orderKey = notificationKeys.list({ category: "order" });
      const unreadKey = notificationKeys.list({ unreadOnly: true });

      const initialOrder = makeNotification({ id: "n-1", category: "order", read: false });
      queryClient.setQueryData<NotificationListResponse>(allKey, { total: 1, unreadCount: 1, items: [initialOrder] });
      queryClient.setQueryData<NotificationListResponse>(orderKey, { total: 1, unreadCount: 1, items: [initialOrder] });
      queryClient.setQueryData<NotificationListResponse>(unreadKey, {
        total: 1,
        unreadCount: 1,
        items: [initialOrder],
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      renderHook(() => useRealtimeNotifications({ enableToast: false }), { wrapper });
      const markReadHook = renderHook(() => useMarkAsReadMutation(), { wrapper });

      const listener = Array.from(subscriptionListeners).at(-1)!;
      expect(listener).toBeTypeOf("function");

      const systemItem = makeNotification({ id: "n-2", category: "system", read: false });
      act(() => {
        listener({ data: systemItem });
        listener({ data: systemItem });
      });

      expect(queryClient.getQueryData<NotificationListResponse>(allKey)?.items.map((i) => i.id)).toEqual([
        "n-2",
        "n-1",
      ]);
      expect(queryClient.getQueryData<NotificationListResponse>(unreadKey)?.items.map((i) => i.id)).toEqual([
        "n-2",
        "n-1",
      ]);
      expect(queryClient.getQueryData<NotificationListResponse>(orderKey)?.items.map((i) => i.id)).toEqual(["n-1"]);
      expect(queryClient.getQueryData<NotificationListResponse>(allKey)?.unreadCount).toBe(2);
      expect(queryClient.getQueryData<NotificationListResponse>(orderKey)?.unreadCount).toBe(2);
      expect(queryClient.getQueryData<NotificationListResponse>(unreadKey)?.unreadCount).toBe(2);

      await act(async () => {
        await markReadHook.result.current.mutateAsync("n-2");
      });

      expect(queryClient.getQueryData<NotificationListResponse>(orderKey)?.unreadCount).toBe(1);
      expect(queryClient.getQueryData<NotificationListResponse>(unreadKey)?.items.map((i) => i.id)).toEqual(["n-1"]);
      expect(queryClient.getQueryData<NotificationListResponse>(allKey)?.items.find((i) => i.id === "n-2")?.read).toBe(
        true,
      );
    });
  });

  describe("Preferences store storage safety, system mode normalization & radius whitelist", () => {
    it("normalizes 'system' mode during initTheme, rejects invalid radius, and handles getItem/setItem errors", () => {
      const store = usePreferencesStore.getState();
      const prevRadius = store.radius;

      store.setRadius("999rem");
      expect(usePreferencesStore.getState().radius).toBe(prevRadius);

      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, "system");
      window.localStorage.setItem(THEME_RADIUS_STORAGE_KEY, "invalid-radius");
      const cleanup = usePreferencesStore.getState().initTheme();
      expect(usePreferencesStore.getState().mode).toBe("auto");
      expect(usePreferencesStore.getState().radius).toBe("0.45rem");
      cleanup();

      const originalLocalStorage = window.localStorage;
      const getItemSpy = vi.fn(() => {
        throw new Error("SecurityError");
      });
      const setItemSpy = vi.fn(() => {
        throw new Error("QuotaExceededError");
      });
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: getItemSpy,
          setItem: setItemSpy,
          removeItem: vi.fn(),
          clear: vi.fn(),
          key: vi.fn(() => null),
          length: 0,
        },
        configurable: true,
      });

      try {
        expect(() => {
          const stop = usePreferencesStore.getState().initTheme();
          stop();
        }).not.toThrow();
        expect(getItemSpy).toHaveBeenCalled();

        expect(() => usePreferencesStore.getState().setMode("dark")).not.toThrow();
        expect(usePreferencesStore.getState().mode).toBe("dark");
        expect(setItemSpy).toHaveBeenCalled();
      } finally {
        Object.defineProperty(window, "localStorage", {
          value: originalLocalStorage,
          configurable: true,
        });
      }
    });
  });

  describe("BackToTop scroll optimization, showProgress sync & scrollTo", () => {
    it("emits zero BackToTop commits below threshold, updates progress on visibility, and scrolls to top", () => {
      const container = document.createElement("div");
      const scrollToSpy = vi.fn();
      Object.defineProperty(container, "scrollTo", { value: scrollToSpy, configurable: true });
      Object.defineProperty(container, "scrollHeight", { value: 2000, configurable: true });
      Object.defineProperty(container, "clientHeight", { value: 500, configurable: true });
      let currentScrollTop = 0;
      Object.defineProperty(container, "scrollTop", {
        get: () => currentScrollTop,
        configurable: true,
      });

      const onRenderSpy = vi.fn();
      function Harness({ showProgress }: { showProgress: boolean }) {
        return (
          <Profiler id="back-to-top" onRender={onRenderSpy}>
            <BackToTop target={() => container} threshold={300} showProgress={showProgress} />
          </Profiler>
        );
      }

      const { rerender } = renderWithProviders(<Harness showProgress={false} />);
      const commitsAfterMount = onRenderSpy.mock.calls.length;

      // Scroll events below threshold must produce zero commits inside BackToTop
      act(() => {
        currentScrollTop = 50;
        container.dispatchEvent(new Event("scroll"));
        currentScrollTop = 200;
        container.dispatchEvent(new Event("scroll"));
      });
      expect(onRenderSpy).toHaveBeenCalledTimes(commitsAfterMount);
      expect(screen.queryByRole("button", { name: "回到顶部" })).not.toBeInTheDocument();

      // Crossing threshold renders BackToTop
      act(() => {
        currentScrollTop = 750;
        container.dispatchEvent(new Event("scroll"));
      });
      const btn = screen.getByRole("button", { name: "回到顶部" });
      expect(btn).toBeInTheDocument();

      // Toggling showProgress on while visible recomputes quantized SVG progress
      rerender(<Harness showProgress={true} />);
      const circle = btn.querySelectorAll("circle")[1];
      expect(circle).toBeDefined();
      expect(Number(circle.getAttribute("stroke-dashoffset"))).toBeGreaterThan(0);

      // Clicking triggers scrollTo
      btn.click();
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

      // Scrolling back below threshold unmounts button
      act(() => {
        currentScrollTop = 100;
        container.dispatchEvent(new Event("scroll"));
      });
      expect(screen.queryByRole("button", { name: "回到顶部" })).not.toBeInTheDocument();
    });
  });
});
