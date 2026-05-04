"use client";

import React from "react";

interface NDButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  title?: string;
}

export function NDButton({
  children,
  variant = "secondary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  type = "button",
  title,
}: NDButtonProps) {
  const base =
    "inline-flex items-center justify-center font-mono uppercase tracking-[0.06em] transition-opacity duration-150 ease-out cursor-pointer";

  const sizeCls =
    size === "sm"
      ? "text-[11px] px-3 py-1.5 min-h-[36px]"
      : size === "lg"
        ? "text-[14px] px-6 py-3 min-h-[52px]"
        : "text-[13px] px-5 py-2.5 min-h-[44px]";

  const variantCls =
    variant === "primary"
      ? "bg-text-display text-black rounded-full border-none"
      : variant === "destructive"
        ? "bg-transparent text-accent border border-accent rounded-full"
        : variant === "ghost"
          ? "bg-transparent text-text-secondary border-none rounded-none hover:text-text-primary"
          : "bg-transparent text-text-primary border border-border-visible rounded-full";

  const disabledCls = disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-90";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${sizeCls} ${variantCls} ${disabledCls} ${className}`}
    >
      {children}
    </button>
  );
}
