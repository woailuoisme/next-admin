import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

import type { PasswordRequirement } from "../core";
import type { MessageKeyOf } from "@/types/i18n";

export interface PasswordStrengthMeterProps {
  password?: string;
  requirements?: PasswordRequirement[];
  showScoreLabel?: boolean;
  showRequirements?: boolean;
  className?: string;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: "At least 8 characters", validator: (p) => p.length >= 8 },
  { label: "Contains uppercase & lowercase", validator: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "Contains at least 1 number", validator: (p) => /\d/.test(p) },
  { label: "Contains at least 1 symbol", validator: (p) => /[^A-Za-z0-9]/.test(p) },
];

/**
 * 密码强度等级 → 进度条配色（warning 功能色统一收敛于此表）
 */
const STRENGTH_COLOR_CLASSES = {
  empty: "bg-muted",
  weak: "bg-destructive",
  fair: "bg-amber-500",
  good: "bg-primary/80",
  strong: "bg-primary",
} as const;

export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  colorClass: string;
  scoreKey: MessageKeyOf<"form">;
} {
  if (!password) {
    return { score: 0, label: "Empty", colorClass: STRENGTH_COLOR_CLASSES.empty, scoreKey: "password_empty" };
  }

  let passedChecks = 0;
  if (password.length >= 8) passedChecks += 1;
  if (password.length >= 12) passedChecks += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) passedChecks += 1;
  if (/\d/.test(password)) passedChecks += 1;
  if (/[^A-Za-z0-9]/.test(password)) passedChecks += 1;

  // Normalize to 0 - 4
  if (passedChecks <= 1) {
    return { score: 1, label: "Weak", colorClass: STRENGTH_COLOR_CLASSES.weak, scoreKey: "password_weak" };
  }
  if (passedChecks === 2) {
    return { score: 2, label: "Fair", colorClass: STRENGTH_COLOR_CLASSES.fair, scoreKey: "password_fair" };
  }
  if (passedChecks <= 4) {
    return { score: 3, label: "Good", colorClass: STRENGTH_COLOR_CLASSES.good, scoreKey: "password_good" };
  }
  return {
    score: 4,
    label: "Strong",
    colorClass: STRENGTH_COLOR_CLASSES.strong,
    scoreKey: "password_strong",
  };
}

export const PasswordStrengthMeter = memo(function PasswordStrengthMeter({
  password = "",
  requirements: propRequirements,
  showScoreLabel = true,
  showRequirements = true,
  className,
}: PasswordStrengthMeterProps) {
  const t = useTranslations("form");
  const { score, colorClass, scoreKey } = calculatePasswordStrength(password);

  const defaultRequirements = useMemo<PasswordRequirement[]>(
    () => [
      { label: t("password_req_length"), validator: (p) => p.length >= 8 },
      { label: t("password_req_case"), validator: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
      { label: t("password_req_number"), validator: (p) => /\d/.test(p) },
      { label: t("password_req_symbol"), validator: (p) => /[^A-Za-z0-9]/.test(p) },
    ],
    [t],
  );

  const requirements = propRequirements ?? defaultRequirements;

  if (!password) {
    return null;
  }

  const label = t(scoreKey);

  return (
    <div className={cn("space-y-2 pt-1 text-xs", className)}>
      {/* Segmented meter bars */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              step <= score ? colorClass : "bg-muted",
            )}
          />
        ))}
        {showScoreLabel && (
          <span className="text-muted-foreground min-w-10 text-right text-[11px] font-medium">{label}</span>
        )}
      </div>

      {/* Requirements list */}
      {showRequirements && requirements.length > 0 && (
        <ul className="grid grid-cols-1 gap-1 pt-0.5 sm:grid-cols-2">
          {requirements.map((req) => {
            const isPassed = req.validator(password);
            return (
              <li
                key={req.label}
                className={cn(
                  "flex items-center gap-1.5 transition-colors",
                  isPassed ? "font-medium text-primary" : "text-muted-foreground",
                )}
              >
                {isPassed ? (
                  <Check className="text-primary size-3.5 shrink-0" />
                ) : (
                  <X className="text-muted-foreground/60 size-3.5 shrink-0" />
                )}
                <span>{req.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
