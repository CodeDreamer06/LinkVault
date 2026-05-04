"use client";

import React from "react";

interface NDCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function NDCard({ children, className = "", onClick, active }: NDCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-surface border rounded-xl p-4 transition-colors duration-150
        ${active ? "border-accent bg-accent-subtle" : "border-border hover:border-border-visible"}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
