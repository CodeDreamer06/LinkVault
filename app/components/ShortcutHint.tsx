"use client";

import React from "react";
import { formatShortcut } from "../lib/keyboard";

interface ShortcutHintProps {
  keys: string[];
  className?: string;
  show?: boolean;
}

export function ShortcutHint({ keys, className = "", show = true }: ShortcutHintProps) {
  if (!show) return null;
  
  const display = formatShortcut(keys);
  
  return (
    <kbd 
      className={`
        font-mono text-[10px] text-text-disabled 
        border border-border px-1 py-0.5 rounded 
        bg-surface-raised
        inline-flex items-center justify-center
        min-w-[20px]
        ${className}
      `}
    >
      {display}
    </kbd>
  );
}

interface ShortcutBadgeProps {
  keys: string[];
  className?: string;
}

export function ShortcutBadge({ keys, className = "" }: ShortcutBadgeProps) {
  const display = formatShortcut(keys);
  
  return (
    <span 
      className={`
        font-mono text-[10px] uppercase tracking-[0.06em]
        text-text-secondary
        ${className}
      `}
    >
      {display}
    </span>
  );
}

interface ShortcutLabelProps {
  label: string;
  shortcut: string[];
  className?: string;
}

export function ShortcutLabel({ label, shortcut, className = "" }: ShortcutLabelProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-sans text-[13px] text-text-secondary">{label}</span>
      <ShortcutHint keys={shortcut} />
    </div>
  );
}
