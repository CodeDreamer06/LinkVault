"use client";

import React from "react";

interface NDToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function NDToggle({ checked, onChange, label, disabled }: NDToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full
        transition-colors duration-200
        ${checked ? "bg-text-display" : "bg-border-visible"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      <span
        className={`
          inline-block h-[16px] w-[16px] rounded-full bg-black transition-transform duration-200
          ${checked ? "translate-x-[20px]" : "translate-x-[3px]"}
        `}
      />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </button>
  );
}
