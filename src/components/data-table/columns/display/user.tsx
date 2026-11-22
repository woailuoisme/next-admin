import type React from "react";

import type { UserCellProps } from "../../cells/display/types";
import type { DataTableColDef, DataTableRenderCellParams } from "../../core/types";
import type { OmitRender } from "../types";

import { UserCell } from "../../cells/display/UserCell";
import { resolveFn } from "../utils";

/** 用户资料复合列构造器 (UserColumn) */
export function userCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: OmitRender<TData> & {
		headerDescription?: string;
		name?: (row: TData) => React.ReactNode;
		nameField?: keyof TData & string;
		subtitle?: (row: TData) => React.ReactNode;
		subtitleField?: keyof TData & string;
		avatarSrc?: (row: TData) => string;
		avatarUrl?: (row: TData) => string;
		avatarField?: keyof TData & string;
		fallback?: (row: TData) => string;
		shape?: UserCellProps["shape"];
		size?: UserCellProps["size"];
		status?: (row: TData) => UserCellProps["status"];
		getStatus?: (row: TData) => UserCellProps["status"];
		statusField?: keyof TData & string;
		autoColor?: boolean;
		verified?: boolean | ((row: TData) => boolean);
		verifiedField?: keyof TData & string;
		copyableSubtitle?: boolean;
		allowUnassigned?: boolean;
		unassignedText?: string;
		badge?: (row: TData) => React.ReactNode;
		onClick?: (row: TData) => void;
	},
): DataTableColDef<TData> {
	const {
		headerDescription,
		name,
		nameField,
		subtitle,
		subtitleField,
		avatarSrc,
		avatarUrl,
		avatarField,
		fallback,
		shape,
		size,
		status,
		getStatus = status,
		statusField,
		autoColor,
		verified,
		verifiedField,
		copyableSubtitle,
		allowUnassigned,
		unassignedText,
		badge,
		onClick,
		...colDef
	} = options || {};

	return {
		field,
		headerName,
		description: headerDescription,
		sortable: true,
		filterable: true,
		align: "left",
		renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => {
			const userObj = typeof value === "object" && value !== null ? value : {};
			const resolvedName = name
				? resolveFn(name, row)
				: nameField && row
					? (row as any)[nameField]
					: (userObj.name ?? (typeof value === "string" ? value : undefined));
			const resolvedSubtitle = subtitle
				? resolveFn(subtitle, row)
				: subtitleField && row
					? (row as any)[subtitleField]
					: userObj.subtitle;
			const resolvedAvatarSrc = avatarSrc
				? resolveFn(avatarSrc, row)
				: avatarUrl
					? resolveFn(avatarUrl, row)
					: avatarField && row
						? (row as any)[avatarField]
						: userObj.avatarSrc || userObj.avatarUrl;
			const resolvedFallback = fallback ? resolveFn(fallback, row) : userObj.fallback || userObj.avatarFallback;
			const resolvedStatus = getStatus
				? getStatus(row)
				: statusField && row
					? (row as any)[statusField]
					: userObj.status;
			const resolvedVerified =
				typeof verified === "function"
					? verified(row)
					: verifiedField && row
						? (row as any)[verifiedField]
						: (verified ?? userObj.verified);
			const resolvedBadge = badge ? resolveFn(badge, row) : userObj.badge;

			return (
				<UserCell
					name={resolvedName}
					subtitle={resolvedSubtitle}
					avatarSrc={resolvedAvatarSrc}
					fallback={resolvedFallback}
					shape={shape}
					size={size}
					status={resolvedStatus}
					autoColor={autoColor}
					verified={resolvedVerified}
					copyableSubtitle={copyableSubtitle}
					allowUnassigned={allowUnassigned}
					unassignedText={unassignedText}
					badge={resolvedBadge}
					align={colDef.align}
					onClick={onClick ? () => onClick(row) : undefined}
				/>
			);
		},
		...colDef,
	};
}
