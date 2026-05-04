"use client";

import React from "react";

interface NDEmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function NDEmptyState({ title, description, action, className = "" }: NDEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-24 px-6 ${className}`}>
      <div className="dot-grid-subtle w-16 h-16 opacity-30" />
      <p className="font-sans text-[16px] text-text-secondary">{title}</p>
      {description && <p className="font-sans text-[14px] text-text-disabled max-w-sm text-center">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
