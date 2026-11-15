"use client";

import { clamp } from "es-toolkit";
import { AlertTriangle, CheckCircle2, Clock, type LucideIcon } from "lucide-react";
import { useMemo } from "react";

import type { PacingStatus } from "./types";

import { parseNumericValue } from "../shared/utils";

interface UseProgressStatOptions {
  value: number | string;
  targetValue?: number | string;
  progress?: number;
  pacingStatus?: PacingStatus;
  pacingLabel?: string;
}

export interface PacingInfo {
  status: PacingStatus;
  colorClass: string;
  PacingIcon: LucideIcon;
}

export interface ProgressStatResult {
  calculatedProgress: number;
  displayProgress: number;
  pacingInfo: PacingInfo | null;
}

const PACING_COLORS: Record<PacingStatus, string> = {
  ahead: "text-chart-2 bg-chart-2/10 border-chart-2/20",
  behind: "text-destructive bg-destructive/10 border-destructive/20",
  on_track: "text-chart-1 bg-chart-1/10 border-chart-1/20",
};

const PACING_ICONS: Record<PacingStatus, LucideIcon> = {
  ahead: CheckCircle2,
  behind: AlertTriangle,
  on_track: Clock,
};

export function computeProgressStat({
  value,
  targetValue,
  progress,
  pacingStatus,
  pacingLabel,
}: UseProgressStatOptions): ProgressStatResult {
  let rawProgress = 0;

  if (typeof progress === "number" && Number.isFinite(progress)) {
    rawProgress = Math.max(0, progress);
  } else {
    const numVal = parseNumericValue(value);
    const numTarget = parseNumericValue(targetValue);

    if (Number.isFinite(numVal) && Number.isFinite(numTarget) && numTarget > 0) {
      const ratio = (numVal / numTarget) * 100;
      rawProgress = Number.isFinite(ratio) ? Math.max(0, ratio) : 0;
    }
  }

  // Progress bar width clamped to 100% for visual sanity
  const calculatedProgress = clamp(Math.round(rawProgress), 0, 100);
  const displayProgress = Math.round(rawProgress);

  let pacingInfo: PacingInfo | null = null;
  if (pacingStatus || pacingLabel) {
    const status: PacingStatus =
      pacingStatus ?? (displayProgress >= 100 ? "ahead" : displayProgress >= 80 ? "on_track" : "behind");

    pacingInfo = {
      status,
      colorClass: PACING_COLORS[status],
      PacingIcon: PACING_ICONS[status],
    };
  }

  return {
    calculatedProgress,
    displayProgress,
    pacingInfo,
  };
}

export function useProgressStat({
  value,
  targetValue,
  progress,
  pacingStatus,
  pacingLabel,
}: UseProgressStatOptions): ProgressStatResult {
  return useMemo(
    () => computeProgressStat({ value, targetValue, progress, pacingStatus, pacingLabel }),
    [value, targetValue, progress, pacingStatus, pacingLabel],
  );
}
