"use client";

import React from "react";
import { XIcon } from "./Icons";

interface NDTagProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function NDTag({ label, active = false, onClick, onRemove, className = "" }: NDTagProps) {
  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em]
        border px-3 py-1 rounded-full cursor-pointer transition-colors duration-150
        ${active ? "border-text-display text-text-display" : "border-border-visible text-text-secondary hover:text-text-primary hover:border-text-primary"}
        ${className}
      `}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-accent"
        >
          <XIcon size={12} />
        </button>
      )}
    </span>
  );
}
