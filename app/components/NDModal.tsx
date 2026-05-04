"use client";

import React, { useEffect } from "react";
import { XIcon } from "./Icons";

interface NDModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function NDModal({ open, onClose, title, children, maxWidth = "480px" }: NDModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border-visible rounded-2xl p-6 w-full relative my-8"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          {title ? (
            <h2 className="font-sans text-[18px] tracking-tight text-text-display">{title}</h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
