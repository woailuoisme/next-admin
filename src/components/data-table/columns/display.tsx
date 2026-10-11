import type React from "react";

import type {
  BadgeCellProps,
  ColorCellProps,
  IconCellProps,
  MaskedCellProps,
  NumberCellProps,
  ProgressCellProps,
  RatingCellProps,
  SparklineCellProps,
  TextCellProps,
  UserCellProps,
} from "../cells/display/types";
import type { DataTableColDef, DataTableRenderCellParams } from "../core/types";
import type { OmitRender } from "./types";

import {
  BadgeCell,
  ColorCell,
  DateCell,
  IconCell,
  MaskedCell,
  NumberCell,
  ProgressCell,
  RatingCell,
  SparklineCell,
  TextCell,
  UserCell,
} from "../cells/display";
import { resolveFn, resolveProp } from "./utils";

/**
 * 1. 文本列构造器 (TextColumn)
 */
export function textCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    description?: (row: TData) => React.ReactNode;
    copyable?: boolean | ((row: TData) => string);
    mono?: boolean;
    truncate?: boolean;
    size?: TextCellProps["size"];
    weight?: TextCellProps["weight"];
    tooltip?: (row: TData) => React.ReactNode;
    url?: string | ((row: TData) => string);
    isExternal?: boolean;
    lineClamp?: TextCellProps["lineClamp"];
    highlightText?: string | ((row: TData) => string);
    tag?: React.ReactNode | ((row: TData) => React.ReactNode);
    tagVariant?: TextCellProps["tagVariant"];
    kbd?: string | ((row: TData) => string);
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    description,
    copyable,
    mono,
    truncate,
    size,
    weight,
    tooltip,
    url,
    isExternal,
    lineClamp,
    highlightText,
    tag,
    tagVariant,
    kbd,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "left",
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <TextCell
        value={value}
        description={resolveFn(description, row)}
        copyable={resolveProp(copyable, row)}
        mono={mono}
        truncate={truncate}
        size={size}
        weight={weight}
        tooltip={resolveFn(tooltip, row)}
        url={resolveProp(url, row)}
        isExternal={isExternal}
        lineClamp={lineClamp}
        highlightText={resolveProp(highlightText, row)}
        tag={resolveProp(tag, row)}
        tagVariant={tagVariant}
        kbd={resolveProp(kbd, row)}
      />
    ),
    ...colDef,
  };
}

/**
 * 2. 徽章状态列构造器 (BadgeColumn)
 */
export function badgeCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    variant?: BadgeCellProps["variant"];
    color?: BadgeCellProps["color"];
    maxCount?: number;
    variantMap?: BadgeCellProps["variantMap"];
    labelMap?: BadgeCellProps["labelMap"];
    dot?: boolean | ((row: TData) => boolean);
    pulse?: boolean | ((row: TData) => boolean);
    density?: BadgeCellProps["density"];
    onBadgeClick?: (row: TData, value: any) => void;
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    variant,
    color,
    maxCount,
    variantMap,
    labelMap,
    dot,
    pulse,
    density,
    onBadgeClick,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "left",
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <BadgeCell
        value={value}
        variant={variant || color}
        maxCount={maxCount}
        variantMap={variantMap}
        labelMap={labelMap}
        dot={resolveProp(dot, row)}
        pulse={resolveProp(pulse, row)}
        density={density}
        onBadgeClick={onBadgeClick ? (val) => onBadgeClick(row, val) : undefined}
      />
    ),
    ...colDef,
  };
}

/**
 * 3. 日期时间列构造器 (DateColumn)
 */
export function dateCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    format?: string;
    relative?: boolean;
    showTooltip?: boolean;
    dualLine?: boolean;
    primaryFormat?: "relative" | "absolute";
    showIcon?: boolean;
    overdueAlert?: boolean;
    countdown?: boolean;
    countdownPrefix?: string;
    timezone?: string;
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    format,
    relative,
    showTooltip,
    dualLine,
    primaryFormat,
    showIcon,
    overdueAlert,
    countdown,
    countdownPrefix,
    timezone,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "left",
    renderCell: ({ value }: DataTableRenderCellParams<TData>) => (
      <DateCell
        value={value}
        format={format}
        relative={relative}
        showTooltip={showTooltip}
        dualLine={dualLine}
        primaryFormat={primaryFormat}
        showIcon={showIcon}
        overdueAlert={overdueAlert}
        countdown={countdown}
        countdownPrefix={countdownPrefix}
        timezone={timezone}
      />
    ),
    ...colDef,
  };
}

/**
 * 4. 数值列构造器 (NumberColumn)
 */
export function numberCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    compact?: boolean;
    colorize?: boolean;
    trend?: boolean;
    delta?: number | ((row: TData) => number | undefined);
    deltaType?: NumberCellProps["deltaType"];
    deltaDescription?: string | ((row: TData) => string | undefined);
    deltaPrefix?: string;
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    decimals,
    prefix,
    suffix,
    compact,
    colorize,
    trend,
    delta,
    deltaType,
    deltaDescription,
    deltaPrefix,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "right",
    headerAlign: "right",
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <NumberCell
        value={value}
        decimals={decimals}
        prefix={prefix}
        suffix={suffix}
        compact={compact}
        colorize={colorize}
        trend={trend}
        delta={resolveProp(delta, row)}
        deltaType={deltaType}
        deltaDescription={resolveProp(deltaDescription, row)}
        deltaPrefix={deltaPrefix}
      />
    ),
    ...colDef,
  };
}

/**
 * 5. 货币列构造器 (CurrencyColumn)
 */
export function currencyCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    currency?: string;
    currencyCode?: string;
    locale?: string;
    decimals?: number;
    compact?: boolean;
    colorize?: boolean;
    delta?: number | ((row: TData) => number | undefined);
    deltaType?: NumberCellProps["deltaType"];
    deltaDescription?: string | ((row: TData) => string | undefined);
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    currency,
    currencyCode,
    locale,
    decimals,
    compact,
    colorize,
    delta,
    deltaType,
    deltaDescription,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "right",
    headerAlign: "right",
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <NumberCell
        value={value}
        prefix={currency || "$"}
        currencyCode={currencyCode}
        locale={locale}
        decimals={decimals}
        compact={compact}
        colorize={colorize}
        delta={resolveProp(delta, row)}
        deltaType={deltaType}
        deltaDescription={resolveProp(deltaDescription, row)}
      />
    ),
    ...colDef,
  };
}

/**
 * 6. 进度条列构造器 (ProgressColumn)
 */
export function progressCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    max?: number;
    showValue?: boolean;
    colorByValue?: boolean;
    segments?: ProgressCellProps["segments"] | ((row: TData) => ProgressCellProps["segments"]);
    target?: number | ((row: TData) => number | undefined);
    targetLabel?: string;
    showPercentage?: boolean;
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    max,
    showValue,
    colorByValue,
    segments,
    target,
    targetLabel,
    showPercentage,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "left",
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <ProgressCell
        value={value}
        max={max}
        showValue={showValue}
        colorByValue={colorByValue}
        segments={resolveProp(segments, row)}
        target={resolveProp(target, row)}
        targetLabel={targetLabel}
        showPercentage={showPercentage}
      />
    ),
    ...colDef,
  };
}

/**
 * 7. 迷你走势图列构造器 (SparklineColumn)
 */
export function sparklineCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    variant?: SparklineCellProps["variant"];
    color?: SparklineCellProps["color"];
    height?: number;
    width?: number;
    showDot?: boolean;
    showMinMax?: boolean;
    autoTrendColor?: boolean;
    interactive?: boolean;
    barWidth?: number;
    barGap?: number;
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    variant,
    color,
    height,
    width,
    showDot,
    showMinMax,
    autoTrendColor,
    interactive,
    barWidth,
    barGap,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: false,
    filterable: false,
    align: "center",
    headerAlign: "center",
    renderCell: ({ value }: DataTableRenderCellParams<TData>) => (
      <SparklineCell
        data={Array.isArray(value) ? value : []}
        variant={variant}
        color={color}
        height={height}
        width={width}
        showDot={showDot}
        showMinMax={showMinMax}
        autoTrendColor={autoTrendColor}
        interactive={interactive}
        barWidth={barWidth}
        barGap={barGap}
      />
    ),
    ...colDef,
  };
}

/**
 * 8. 敏感数据脱敏列构造器 (MaskedColumn)
 */
export function maskedCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    type?: MaskedCellProps["maskType"];
    maskType?: MaskedCellProps["maskType"];
    customMask?: MaskedCellProps["customMask"];
    allowReveal?: boolean;
    copyable?: boolean;
    allowCopy?: boolean;
    maskChar?: string;
    autoHideDuration?: number;
    mono?: boolean;
  },
): DataTableColDef<TData> {
  const {
    headerDescription,
    type,
    maskType = type,
    customMask,
    allowReveal,
    copyable,
    allowCopy,
    maskChar,
    autoHideDuration,
    mono,
    ...colDef
  } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: false,
    filterable: false,
    align: "left",
    renderCell: ({ value }: DataTableRenderCellParams<TData>) => (
      <MaskedCell
        value={value}
        maskType={maskType}
        customMask={customMask}
        allowReveal={allowReveal}
        copyable={copyable}
        allowCopy={allowCopy}
        maskChar={maskChar}
        autoHideDuration={autoHideDuration}
        mono={mono}
        align={colDef.align}
      />
    ),
    ...colDef,
  };
}

/**
 * 9. 星级/评级列构造器 (RatingColumn)
 */
export function ratingCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    max?: number;
    size?: RatingCellProps["size"];
    showScore?: boolean;
    allowHalf?: boolean;
    iconType?: RatingCellProps["iconType"];
    reviewCount?: number | ((row: TData) => number | undefined);
  },
): DataTableColDef<TData> {
  const { headerDescription, max, size, showScore, allowHalf, iconType, reviewCount, ...colDef } =
    options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "left",
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <RatingCell
        value={value}
        max={max}
        size={size}
        showScore={showScore}
        allowHalf={allowHalf}
        iconType={iconType}
        reviewCount={resolveProp(reviewCount, row)}
      />
    ),
    ...colDef,
  };
}

/**
 * 10. 颜色指示列构造器 (ColorColumn)
 */
export function colorCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    showHex?: boolean;
    copyable?: boolean;
    shape?: ColorCellProps["shape"];
    checkerboard?: boolean;
  },
): DataTableColDef<TData> {
  const { headerDescription, showHex, copyable, shape, checkerboard, ...colDef } = options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "left",
    renderCell: ({ value }: DataTableRenderCellParams<TData>) => (
      <ColorCell
        value={value}
        showHex={showHex}
        copyable={copyable}
        shape={shape}
        checkerboard={checkerboard}
      />
    ),
    ...colDef,
  };
}

/**
 * 11. 图标状态列构造器 (IconColumn)
 */
export function iconCol<TData = any>(
  field: keyof TData & string,
  headerName: string,
  options?: OmitRender<TData> & {
    headerDescription?: string;
    iconMap?: IconCellProps["iconMap"];
    colorMap?: IconCellProps["colorMap"];
    size?: IconCellProps["size"];
    tooltip?: (row: TData) => React.ReactNode;
    container?: IconCellProps["container"];
    label?: React.ReactNode | ((row: TData) => React.ReactNode);
    labelPosition?: IconCellProps["labelPosition"];
  },
): DataTableColDef<TData> {
  const { headerDescription, iconMap, colorMap, size, tooltip, container, label, labelPosition, ...colDef } =
    options || {};

  return {
    field,
    headerName,
    description: headerDescription,
    sortable: true,
    filterable: true,
    align: "center",
    headerAlign: "center",
    renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
      <IconCell
        value={value}
        iconMap={iconMap}
        colorMap={colorMap}
        size={size}
        tooltip={resolveFn(tooltip, row)}
        container={container}
        label={resolveProp(label, row)}
        labelPosition={labelPosition}
      />
    ),
    ...colDef,
  };
}

/**
 * 12. 用户资料复合列构造器 (UserColumn)
 */
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
      const resolvedFallback = fallback
        ? resolveFn(fallback, row)
        : userObj.fallback || userObj.avatarFallback;
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
