"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, type ComponentType } from "react";

import { MapSkeleton } from "../shared/MapSkeleton";

export interface CreateLazyMapOptions {
	defaultHeight?: number | string;
}

const LazySkeletonContext = createContext<{ height?: number | string; className?: string }>({});

/**
 * 创建严格客户端拆包与 SSR 安全隔离（ssr: false）的懒加载地图组件，并自带 MapSkeleton 占位。
 */
export function createLazyMap<P extends { height?: number | string; className?: string }>(
	loadComponent: () => Promise<{ default: ComponentType<P> }>,
	options: CreateLazyMapOptions = {},
) {
	const { defaultHeight = 440 } = options;

	function LazyMapLoading() {
		const ctx = useContext(LazySkeletonContext);
		return <MapSkeleton height={ctx.height ?? defaultHeight} className={ctx.className} />;
	}

	const DynamicComponent = dynamic(loadComponent, {
		ssr: false,
		loading: LazyMapLoading,
	});

	return function LazyMapWrapper(props: P) {
		return (
			<LazySkeletonContext.Provider value={{ height: props.height, className: props.className }}>
				<DynamicComponent {...(props as P & object)} />
			</LazySkeletonContext.Provider>
		);
	};
}
