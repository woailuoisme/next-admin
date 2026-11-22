import { resolveGridClassName } from "@/components/shared/grid";

import type { GridProps } from "./types";

/**
 * 通用响应式栅格容器：统一替代 `FormGrid` 与 `InfolistGrid`。
 */
export function Grid({ columns = 1, gap = "md", className, children, ...props }: GridProps) {
	return (
		<div className={resolveGridClassName(columns, gap, className)} {...props}>
			{children}
		</div>
	);
}
