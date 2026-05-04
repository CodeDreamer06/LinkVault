"use client";

import React from "react";

interface NDGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: "neutral" | "success" | "warning" | "accent";
  label?: string;
  showValue?: boolean;
}

export function NDGauge({
  value,
  max = 100,
  size = 96,
  strokeWidth = 4,
  color = "neutral",
  label,
  showValue = true,
}: NDGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const dashoffset = circumference * (1 - pct);

  const colorMap = {
    neutral: "text-text-display",
    success: "text-success",
    warning: "text-warning",
    accent: "text-accent",
  };

  const colorCls = colorMap[color];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className={colorCls}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ transition: "stroke-dashoffset 400ms ease-out" }}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-mono text-[16px] leading-none ${colorCls}`}>
              {Math.round(pct * 100)}
              <span className="text-[10px] text-text-disabled">%</span>
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary text-center">
          {label}
        </span>
      )}
    </div>
  );
}
