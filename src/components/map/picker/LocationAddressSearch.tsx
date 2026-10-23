import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { debounce, type DebouncedFunction } from "es-toolkit";
import { Loader2, MapPin, Search } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

import { type AmapPlace, isAmapApiEnabled, searchPlaces } from "./amapGeo";

interface LocationAddressSearchProps {
  disabled?: boolean;
  readOnly?: boolean;
  /** 选中候选点（坐标为 GCJ-02），由调用方负责坐标系转换 */
  onSelect: (place: AmapPlace) => void;
}

/** 输入防抖时长（毫秒）：采用 es-toolkit debounce 阻断高频字符输入刷接口 */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * 地名关键字搜索定位
 *
 * 依赖高德 Web 服务 API；未配置 `NEXT_PUBLIC_AMAP_KEY` 时输入框禁用并给出配置提示，
 * 以免出现「能输入但永远搜不到」的静默失败。
 * 防护机制：基于 es-toolkit debounce + LRU 缓存 + 在途请求去重 + 会话熔断。
 */
export const LocationAddressSearch = memo(function LocationAddressSearch({
  disabled = false,
  readOnly = false,
  onSelect,
}: LocationAddressSearchProps) {
  const t = useTranslations("map");
  const apiEnabled = isAmapApiEnabled();
  const blocked = disabled || readOnly || !apiEnabled;

  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState<AmapPlace[]>([]);
  /** 高德接口失败原因（如 key 平台类型不匹配），直接展示给使用者 */
  const [error, setError] = useState<string | undefined>();
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 稳定化的 es-toolkit 防抖搜索句柄
  const debouncedSearchRef = useRef<DebouncedFunction<(searchKey: string) => void> | null>(null);

  useEffect(() => {
    const debounced = debounce(async (searchKey: string) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsSearching(true);
      try {
        const result = await searchPlaces(searchKey, controller.signal);
        if (!controller.signal.aborted) {
          setPlaces(result.places);
          setError(result.error);
          setIsSearching(false);
          setIsOpen(true);
        }
      } catch {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    debouncedSearchRef.current = debounced;

    return () => {
      debounced.cancel();
      abortControllerRef.current?.abort();
    };
  }, []);

  // 点击组件外部关闭结果面板
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (blocked) {
      debouncedSearchRef.current?.cancel();
      abortControllerRef.current?.abort();
    }
  }, [blocked]);

  const handleKeywordChange = useMemoizedFn((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextKeyword = event.target.value;
    setKeyword(nextKeyword);

    if (blocked) return;

    const trimmed = nextKeyword.trim();
    if (!trimmed) {
      setPlaces([]);
      setError(undefined);
      setIsSearching(false);
      debouncedSearchRef.current?.cancel();
      return;
    }

    debouncedSearchRef.current?.(trimmed);
  });

  const handleSelect = useMemoizedFn((place: AmapPlace) => {
    debouncedSearchRef.current?.cancel();
    abortControllerRef.current?.abort();
    onSelect(place);
    setKeyword(place.name);
    setIsOpen(false);
  });

  return (
    <div ref={containerRef} className="relative">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
      <Input
        value={keyword}
        disabled={blocked}
        placeholder={apiEnabled ? t("picker_search_placeholder") : t("picker_search_disabled")}
        onChange={handleKeywordChange}
        onFocus={() => {
          if (places.length > 0) setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
            return;
          }
          // 回车直接采用首个候选，省去鼠标操作
          if (event.key === "Enter" && places.length > 0) {
            event.preventDefault();
            handleSelect(places[0]);
          }
        }}
        className="h-8 pl-8 text-xs"
        aria-label={t("picker_search_aria")}
      />
      {isSearching ? (
        <Loader2 className="text-muted-foreground absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 animate-spin" />
      ) : null}

      {isOpen && (places.length > 0 || error) ? (
        <div className="border-border/80 bg-popover absolute top-full left-0 z-30 mt-1 max-h-56 w-full min-w-64 overflow-y-auto rounded-md border p-1 shadow-md">
          {error ? <p className="text-destructive px-2 py-1.5 text-[11px] leading-snug">{error}</p> : null}
          {places.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => handleSelect(place)}
              className="hover:bg-accent flex w-full cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors"
            >
              <MapPin className="text-primary mt-0.5 size-3.5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="text-foreground block truncate font-medium">{place.name}</span>
                {place.address ? (
                  <span className="text-muted-foreground block truncate text-[11px]">{place.address}</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
});
