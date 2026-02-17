import React from "react";

type DebugBadgeProps = {
  label: string;
  value: boolean;
};

export function DebugBadge({ label, value }: DebugBadgeProps) {
  return (
    <span
      className={`debug-badge debug-badge--${value ? "on" : "off"}`}
      title={`${label}: ${value}`}
      aria-label={`${label}: ${value}`}
    >
      {label}: {value ? "✓" : "✗"}
    </span>
  );
}
