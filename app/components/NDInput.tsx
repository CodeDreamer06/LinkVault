"use client";

import React from "react";

interface NDInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  type?: "text" | "url" | "email" | "password" | "textarea" | "number";
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
}

export function NDInput({
  value,
  onChange,
  placeholder,
  label,
  type = "text",
  className = "",
  autoFocus,
  onKeyDown,
  disabled,
}: NDInputProps) {
  const common =
    "w-full bg-transparent text-text-primary placeholder:text-text-disabled font-sans focus:outline-none";

  const border =
    "border-b border-border-visible focus:border-text-primary transition-colors duration-200";

  const inputCls = `${common} ${border} py-2 text-[15px] leading-relaxed`;
  const textareaCls = `${common} ${border} py-2 text-[15px] leading-relaxed resize-y min-h-[80px]`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">
          {label}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={textareaCls}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          disabled={disabled}
        />
      )}
    </div>
  );
}
