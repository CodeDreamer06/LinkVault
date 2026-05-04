"use client";

import React, { forwardRef } from "react";
import { SearchIcon, XIcon } from "./Icons";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar({ value, onChange, placeholder = "Search vault...", className = "" }, ref) {
    return (
      <div className={`relative flex items-center ${className}`}>
        <SearchIcon size={18} className="absolute left-3 text-text-disabled pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface border border-border rounded-lg pl-9 pr-9 py-2 text-[14px] text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-border-visible transition-colors"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 text-text-disabled hover:text-text-primary transition-colors"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>
    );
  }
);
