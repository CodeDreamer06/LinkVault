"use client";

import React from "react";

interface NDSegmentedProgressProps {
  value: number;
  max: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  color?: "neutral" | "success" | "warning" | "accent";
  className?: string;
}

export function NDSegmentedProgress({
  value,
  max,
  label,
  size = "md",
  color = "neutral",
  className = "",
}: NDSegmentedProgressProps) {
  const segments = Math.max(max, 1);
  const filled = Math.min(Math.max(value, 0), segments);

  const sizeCls =
    size === "sm" ? "h-[4px]" : size === "lg" ? "h-[16px]" : "h-[8px]";

  const colorMap = {
    neutral: "bg-text-display",
    success: "bg-success",
    warning: "bg-warning",
    accent: "bg-accent",
  };

  const fillColor = colorMap[color];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">
            {label}
          </span>
          <span className="font-mono text-[12px] text-text-primary">
            {value}
            <span className="text-text-disabled text-[10px] ml-0.5">/{max}</span>
          </span>
        </div>
      )}
      <div className="flex gap-[2px] w-full">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 ${sizeCls} ${i < filled ? fillColor : "bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
