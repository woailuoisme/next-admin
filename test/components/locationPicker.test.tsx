import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FormLocationPicker } from "@/components/form/map/FormLocationPicker";
import { transformCoordinates } from "@/components/map/core";
import { LocationAddressSearch } from "@/components/map/picker/LocationAddressSearch";
import { LocationCoordinatesInput } from "@/components/map/picker/LocationCoordinatesInput";
import { LocationPicker } from "@/components/map/picker/LocationPicker";
import {
	InMemoryGeocodeAdapter,
	isAmapCircuitTripped,
	resetAmapCache,
	resetAmapCircuit,
	reverseGeocode,
	searchPlaces,
	setGeocodeAdapter,
} from "@/components/map/picker/amapGeo";
import zhMessages from "@/messages/zh.json";

vi.mock("@/components/ui/map", () => ({
	useMap: () => ({ map: null, isLoaded: true, resolvedTheme: "light" }),
	Map: ({ children }: { children?: ReactNode }) => <div data-testid="picker-map">{children}</div>,
	MapControls: () => <div data-testid="picker-controls" />,
	MapMarker: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
	MarkerContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
	MarkerPopup: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

function renderIntl(ui: ReactNode) {
	return render(
		<NextIntlClientProvider locale="zh" messages={zhMessages}>
			{ui}
		</NextIntlClientProvider>,
	);
}

describe("GeocodeAdapter, Circuit Breaker & LocationPicker", () => {
	beforeEach(() => {
		resetAmapCircuit();
		resetAmapCache();
		setGeocodeAdapter(null);
	});

	afterEach(() => {
		vi.useRealTimers();
		setGeocodeAdapter(null);
		resetAmapCircuit();
		resetAmapCache();
	});

	it("isolates per-caller AbortSignal across shared in-flight search requests", async () => {
		const adapter = new InMemoryGeocodeAdapter({
			delayMs: 30,
			placesByKeyword: {
				beijing: [{ id: "bj", name: "Beijing Station", address: "Dongcheng", lngLat: [116.427, 39.902] }],
			},
		});
		setGeocodeAdapter(adapter);

		const ctrlA = new AbortController();
		const ctrlB = new AbortController();

		const reqA = searchPlaces("beijing", ctrlA.signal);
		const reqB = searchPlaces("beijing", ctrlB.signal);

		ctrlA.abort();

		const [resA, resB] = await Promise.all([reqA, reqB]);
		expect(resA.places).toEqual([]);
		expect(resB.places).toHaveLength(1);
		expect(resB.places[0]?.name).toBe("Beijing Station");
	});

	it("trips circuit breaker on HTTP 429 / fatal error and transitions to half-open after 60s cooldown", async () => {
		vi.useFakeTimers();
		const failingAdapter = new InMemoryGeocodeAdapter({ httpStatus: 429 });
		setGeocodeAdapter(failingAdapter);

		const first = await searchPlaces("shanghai");
		expect(first.places).toEqual([]);
		expect(isAmapCircuitTripped()).toBe(true);

		// 30s later: still tripped
		vi.advanceTimersByTime(30_000);
		expect(isAmapCircuitTripped()).toBe(true);

		// 60s elapsed: transitions to half-open allowing probe
		vi.advanceTimersByTime(30_000);
		expect(isAmapCircuitTripped()).toBe(false);

		const healthyAdapter = new InMemoryGeocodeAdapter({
			placesByKeyword: {
				shanghai: [{ id: "sh", name: "Shanghai Hongqiao", address: "Minhang", lngLat: [121.32, 31.194] }],
			},
		});
		setGeocodeAdapter(healthyAdapter);

		const recovered = await searchPlaces("shanghai");
		expect(recovered.places).toHaveLength(1);
		expect(isAmapCircuitTripped()).toBe(false);
	});

	it("negative-caches empty regeo responses within TTL", async () => {
		const onCall = vi.fn();
		setGeocodeAdapter(new InMemoryGeocodeAdapter({ onCall }));

		expect(await reverseGeocode([116.4, 39.9])).toBeNull();
		expect(await reverseGeocode([116.4, 39.9])).toBeNull();
		expect(onCall).toHaveBeenCalledTimes(1);
	});

	it("supports ARIA combobox keyboard navigation in LocationAddressSearch", async () => {
		setGeocodeAdapter(
			new InMemoryGeocodeAdapter({
				placesByKeyword: {
					station: [
						{ id: "1", name: "Beijing South", address: "Fengtai", lngLat: [116.379, 39.865] },
						{ id: "2", name: "Beijing West", address: "Fengtai West", lngLat: [116.322, 39.894] },
					],
				},
			}),
		);

		const onSelect = vi.fn();
		renderIntl(<LocationAddressSearch onSelect={onSelect} />);

		const input = screen.getByRole("combobox", { name: zhMessages.map.picker_search_aria });
		fireEvent.change(input, { target: { value: "station" } });

		await waitFor(() => {
			expect(screen.getByRole("listbox")).toBeInTheDocument();
		});

		const options = screen.getAllByRole("option");
		expect(options).toHaveLength(2);
		expect(options[0]).toHaveAttribute("aria-selected", "true");

		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");

		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "2", name: "Beijing West" }));
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("validates strict finite decimals and preserves readOnly focusability in LocationCoordinatesInput", () => {
		const onCoordinatesChange = vi.fn();
		const { rerender } = render(
			<NextIntlClientProvider locale="zh" messages={zhMessages}>
				<LocationCoordinatesInput
					value={{ lng: 116.4, lat: 39.9 }}
					onCoordinatesChange={onCoordinatesChange}
					onReset={vi.fn()}
				/>
			</NextIntlClientProvider>,
		);

		const lngInput = screen.getByLabelText(zhMessages.map.picker_longitude) as HTMLInputElement;
		fireEvent.change(lngInput, { target: { value: "116.4abc" } });
		fireEvent.blur(lngInput);

		expect(onCoordinatesChange).not.toHaveBeenCalled();
		expect(lngInput.value).toBe("116.4");

		rerender(
			<NextIntlClientProvider locale="zh" messages={zhMessages}>
				<LocationCoordinatesInput
					value={{ lng: 116.4, lat: 39.9 }}
					readOnly
					onCoordinatesChange={onCoordinatesChange}
					onReset={vi.fn()}
				/>
			</NextIntlClientProvider>,
		);

		const roLng = screen.getByLabelText(zhMessages.map.picker_longitude);
		expect(roLng).toHaveAttribute("readonly");
		expect(roLng).not.toBeDisabled();
	});

	it("enriches initial address locally without triggering dirty onChange on mount", async () => {
		setGeocodeAdapter(
			new InMemoryGeocodeAdapter({
				addressesByGrid: {
					"116.4136,39.9056": "Dongcheng Square, Beijing",
					"116.4074,39.9042": "Tiananmen, Beijing",
				},
			}),
		);

		const onChange = vi.fn();
		renderIntl(<LocationPicker value={{ lng: 116.4074, lat: 39.9042 }} onChange={onChange} basemap="carto" />);

		await waitFor(
			() => {
				expect(screen.getAllByText(/Dongcheng Square, Beijing/).length).toBeGreaterThan(0);
			},
			{ timeout: 2000 },
		);

		expect(onChange).not.toHaveBeenCalled();
	});

	it("converts WGS84 quickPresets into target CRS and decouples copy button in FormLocationPicker", async () => {
		setGeocodeAdapter(new InMemoryGeocodeAdapter());
		const onChange = vi.fn();
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText },
			configurable: true,
		});

		renderIntl(
			<FormLocationPicker
				name="hq"
				label="HQ"
				coordinateSystem="GCJ02"
				value={{ lng: 116.4, lat: 39.9 }}
				onChange={onChange}
				showAddressSearch={false}
				showCopyButton={true}
				quickPresets={[{ label: "Beijing", coords: { lng: 116.4074, lat: 39.9042 } }]}
			/>,
		);

		// Search input is hidden while Copy button remains visible
		expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
		const copyBtn = screen.getByRole("button", { name: zhMessages.form.location_copy_coords });
		fireEvent.click(copyBtn);
		await waitFor(() => {
			expect(writeText).toHaveBeenCalledWith("116.400000, 39.900000");
			expect(screen.getByText(zhMessages.form.location_copied)).toBeInTheDocument();
		});

		// Clicking WGS84 preset while coordinateSystem="GCJ02" emits GCJ-02 coordinates
		fireEvent.click(screen.getByRole("button", { name: "Beijing" }));
		const [expectedLng, expectedLat] = transformCoordinates([116.4074, 39.9042], "WGS84", "GCJ02");
		expect(onChange).toHaveBeenCalledWith({
			lng: Number(expectedLng.toFixed(6)),
			lat: Number(expectedLat.toFixed(6)),
			address: undefined,
		});
	});

	it("clears stale places when a subsequent search throws an error in LocationAddressSearch", async () => {
		setGeocodeAdapter(
			new InMemoryGeocodeAdapter({
				placesByKeyword: {
					station: [{ id: "1", name: "Beijing South", address: "Fengtai", lngLat: [116.379, 39.865] }],
				},
			}),
		);

		renderIntl(<LocationAddressSearch onSelect={vi.fn()} />);
		const input = screen.getByRole("combobox", { name: zhMessages.map.picker_search_aria });

		fireEvent.change(input, { target: { value: "station" } });
		await waitFor(() => {
			expect(screen.getAllByRole("option")).toHaveLength(1);
		});

		setGeocodeAdapter({
			searchText: vi.fn().mockRejectedValue(new Error("Network down")),
			regeo: vi.fn(),
		});

		fireEvent.change(input, { target: { value: "airport" } });
		await waitFor(() => {
			expect(screen.getByText(zhMessages.map.picker_search_error)).toBeInTheDocument();
		});
		expect(screen.queryAllByRole("option")).toHaveLength(0);
	});

	it("uses accessible button marker and never emits undefined on reset without defaultValue", () => {
		setGeocodeAdapter(new InMemoryGeocodeAdapter());
		const onChange = vi.fn();

		renderIntl(<LocationPicker value={{ lng: 116.4074, lat: 39.9042, address: "Tiananmen" }} onChange={onChange} />);

		const markerButton = screen.getByRole("button", {
			name: `${zhMessages.map.picker_selected_location}: Tiananmen`,
		});
		expect(markerButton).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: zhMessages.map.picker_reset }));
		expect(onChange).not.toHaveBeenCalled();
	});

	it("preserves partial longitude draft on blur when latitude is still empty in LocationCoordinatesInput", () => {
		const onCoordinatesChange = vi.fn();
		renderIntl(<LocationCoordinatesInput onCoordinatesChange={onCoordinatesChange} onReset={vi.fn()} />);

		const lngInput = screen.getByLabelText(zhMessages.map.picker_longitude) as HTMLInputElement;
		const latInput = screen.getByLabelText(zhMessages.map.picker_latitude) as HTMLInputElement;

		fireEvent.change(lngInput, { target: { value: "116.4074" } });
		fireEvent.blur(lngInput);

		expect(onCoordinatesChange).not.toHaveBeenCalled();
		expect(lngInput.value).toBe("116.4074");

		fireEvent.change(latInput, { target: { value: "39.9042" } });
		fireEvent.blur(latInput);

		expect(onCoordinatesChange).toHaveBeenCalledWith({ lng: 116.4074, lat: 39.9042 });
	});
});
