"use client";

import { useMemoizedFn } from "ahooks";
import { debounce, type DebouncedFunction } from "es-toolkit";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { type AmapPlace, searchPlaces } from "./amapGeo";
import { LocationSearchDropdown } from "./LocationSearchDropdown";
import { useGeocodeProxyAvailability } from "./useGeocodeProxyAvailability";

export interface LocationAddressSearchProps {
	disabled?: boolean;
	readOnly?: boolean;
	/** 搜索输入框自定义占位提示 */
	placeholder?: string;
	/** 选中候选点（坐标为 GCJ-02），由调用方负责坐标系转换 */
	onSelect: (place: AmapPlace) => void;
}

const SEARCH_DEBOUNCE_MS = 300;

export function LocationAddressSearch({
	disabled = false,
	readOnly = false,
	placeholder,
	onSelect,
}: LocationAddressSearchProps) {
	const t = useTranslations("map");
	const listboxId = useId();
	const apiEnabled = useGeocodeProxyAvailability();
	const blocked = disabled || readOnly || !apiEnabled;

	const [keyword, setKeyword] = useState("");
	const [places, setPlaces] = useState<AmapPlace[]>([]);
	const [error, setError] = useState<string | undefined>();
	const [hasSearched, setHasSearched] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);

	const containerRef = useRef<HTMLDivElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const debouncedSearchRef = useRef<DebouncedFunction<(searchKey: string) => void> | null>(null);

	useEffect(() => {
		const debounced = debounce(async (searchKey: string) => {
			abortControllerRef.current?.abort();
			const controller = new AbortController();
			abortControllerRef.current = controller;

			setIsSearching(true);
			setHasSearched(false);
			try {
				const result = await searchPlaces(searchKey, controller.signal);
				if (!controller.signal.aborted) {
					setPlaces(result.places);
					setError(result.error);
					setActiveIndex(result.places.length > 0 ? 0 : -1);
					setHasSearched(true);
					setIsSearching(false);
					setIsOpen(true);
				}
			} catch {
				if (!controller.signal.aborted) {
					setPlaces([]);
					setError(t("picker_search_error"));
					setActiveIndex(-1);
					setHasSearched(true);
					setIsSearching(false);
					setIsOpen(true);
				}
			}
		}, SEARCH_DEBOUNCE_MS);

		debouncedSearchRef.current = debounced;
		return () => {
			debounced.cancel();
			abortControllerRef.current?.abort();
		};
	}, [t]);

	useEffect(() => {
		if (!isOpen) return;
		const handlePointerDown = (event: MouseEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
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

	const handleClear = useMemoizedFn(() => {
		debouncedSearchRef.current?.cancel();
		abortControllerRef.current?.abort();
		setKeyword("");
		setPlaces([]);
		setError(undefined);
		setHasSearched(false);
		setIsSearching(false);
		setIsOpen(false);
		setActiveIndex(-1);
	});

	const handleKeywordChange = useMemoizedFn((event: React.ChangeEvent<HTMLInputElement>) => {
		const nextKeyword = event.target.value;
		setKeyword(nextKeyword);
		if (blocked) return;

		const trimmed = nextKeyword.trim();
		if (!trimmed) {
			setPlaces([]);
			setError(undefined);
			setHasSearched(false);
			setIsSearching(false);
			setIsOpen(false);
			setActiveIndex(-1);
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
		setPlaces([]);
		setError(undefined);
		setHasSearched(false);
		setActiveIndex(-1);
		setIsOpen(false);
	});

	const showEmptyNotice =
		isOpen && hasSearched && !isSearching && !error && places.length === 0 && keyword.trim().length > 0;
	const isDropdownVisible = !blocked && isOpen && (places.length > 0 || Boolean(error) || showEmptyNotice);
	const activeOptionId = activeIndex >= 0 && places[activeIndex] ? `${listboxId}-opt-${activeIndex}` : undefined;

	return (
		<div ref={containerRef} className="relative">
			<Search
				aria-hidden="true"
				className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
			/>
			<Input
				role="combobox"
				aria-autocomplete="list"
				aria-expanded={isDropdownVisible}
				aria-controls={listboxId}
				aria-activedescendant={isDropdownVisible ? activeOptionId : undefined}
				aria-label={t("picker_search_aria")}
				value={keyword}
				disabled={blocked}
				placeholder={apiEnabled ? (placeholder ?? t("picker_search_placeholder")) : t("picker_search_disabled")}
				onChange={handleKeywordChange}
				onFocus={() => {
					if (places.length > 0 || error) setIsOpen(true);
				}}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						setIsOpen(false);
						setActiveIndex(-1);
					} else if (event.key === "ArrowDown" && places.length > 0) {
						event.preventDefault();
						setIsOpen(true);
						setActiveIndex((prev) => (prev + 1) % places.length);
					} else if (event.key === "ArrowUp" && places.length > 0) {
						event.preventDefault();
						setIsOpen(true);
						setActiveIndex((prev) => (prev <= 0 ? places.length - 1 : prev - 1));
					} else if (event.key === "Home" && places.length > 0 && isOpen) {
						event.preventDefault();
						setActiveIndex(0);
					} else if (event.key === "End" && places.length > 0 && isOpen) {
						event.preventDefault();
						setActiveIndex(places.length - 1);
					} else if (event.key === "Enter" && places.length > 0) {
						event.preventDefault();
						const target = activeIndex >= 0 ? places[activeIndex] : places[0];
						if (target) handleSelect(target);
					}
				}}
				className="h-8 pr-8 pl-8 text-xs"
			/>

			{isSearching ? (
				<Spinner
					role={undefined}
					aria-hidden="true"
					className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 motion-reduce:animate-none"
				/>
			) : keyword && !blocked ? (
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					onClick={handleClear}
					aria-label={t("picker_clear_search")}
					className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 -translate-y-1/2"
				>
					<X aria-hidden="true" />
				</Button>
			) : null}

			{isDropdownVisible ? (
				<LocationSearchDropdown
					listboxId={listboxId}
					places={places}
					activeIndex={activeIndex}
					error={error}
					showEmptyNotice={showEmptyNotice}
					onHighlight={setActiveIndex}
					onSelect={handleSelect}
				/>
			) : null}
		</div>
	);
}
