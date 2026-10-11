import { Check, X } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { PasswordRequirement } from "../core";

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
} {
  if (!password) {
    return { score: 0, label: "Empty", colorClass: STRENGTH_COLOR_CLASSES.empty };
  }

  let passedChecks = 0;
  if (password.length >= 8) passedChecks += 1;
  if (password.length >= 12) passedChecks += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) passedChecks += 1;
  if (/\d/.test(password)) passedChecks += 1;
  if (/[^A-Za-z0-9]/.test(password)) passedChecks += 1;

  // Normalize to 0 - 4
  if (passedChecks <= 1) {
    return { score: 1, label: "Weak", colorClass: STRENGTH_COLOR_CLASSES.weak };
  }
  if (passedChecks === 2) {
    return { score: 2, label: "Fair", colorClass: STRENGTH_COLOR_CLASSES.fair };
  }
  if (passedChecks <= 4) {
    return { score: 3, label: "Good", colorClass: STRENGTH_COLOR_CLASSES.good };
  }
  return { score: 4, label: "Strong", colorClass: STRENGTH_COLOR_CLASSES.strong };
}

export const PasswordStrengthMeter = memo(function PasswordStrengthMeter({
  password = "",
  requirements = DEFAULT_PASSWORD_REQUIREMENTS,
  showScoreLabel = true,
  showRequirements = true,
  className,
}: PasswordStrengthMeterProps) {
  const { score, label, colorClass } = calculatePasswordStrength(password);

  if (!password) {
    return null;
  }

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
