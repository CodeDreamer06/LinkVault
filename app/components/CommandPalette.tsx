"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { ViewType, LinkEntity } from "../lib/types";
import { NDModal } from "./NDModal";
import { SearchIcon, LinkIcon, XIcon } from "./Icons";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  links: LinkEntity[];
  onNavigate: (view: ViewType) => void;
  onOpenLink: (link: LinkEntity) => void;
}

const views: { label: string; view: ViewType }[] = [
  { label: "Library", view: "library" },
  { label: "Inbox", view: "inbox" },
  { label: "Favorites", view: "favorites" },
  { label: "Reading List", view: "reading" },
  { label: "Archived", view: "archived" },
  { label: "Analytics", view: "analytics" },
  { label: "Settings", view: "settings" },
  { label: "Maintenance", view: "maintenance" },
  { label: "Capture Link", view: "capture" },
];

export function CommandPalette({ open, onClose, links, onNavigate, onOpenLink }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches: { type: "view" | "link"; label: string; action: () => void }[] = [];

    for (const v of views) {
      if (v.label.toLowerCase().includes(q)) {
        matches.push({ type: "view", label: v.label, action: () => { onNavigate(v.view); onClose(); } });
      }
    }

    for (const link of links.slice(0, 200)) {
      if (link.title.toLowerCase().includes(q) || link.domain.toLowerCase().includes(q)) {
        matches.push({
          type: "link",
          label: link.title,
          action: () => { onOpenLink(link); onClose(); },
        });
      }
    }

    return matches.slice(0, 12);
  }, [query, links, onNavigate, onClose, onOpenLink]);

  return (
    <NDModal open={open} onClose={onClose} maxWidth="560px">
      <div className="relative">
        <SearchIcon size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-text-disabled" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command or link title..."
          className="w-full bg-transparent border-b border-border-visible pl-7 pr-8 py-2 text-[16px] text-text-primary placeholder:text-text-disabled focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-0 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary">
            <XIcon size={16} />
          </button>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex flex-col gap-1">
          {filtered.map((item, i) => (
            <button
              key={`${item.type}-${i}`}
              onClick={item.action}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-surface-raised transition-colors"
            >
              {item.type === "view" ? (
                <span className="font-mono text-[10px] uppercase text-text-disabled w-8">VIEW</span>
              ) : (
                <span className="font-mono text-[10px] uppercase text-text-disabled w-8">LINK</span>
              )}
              <span className="font-sans text-[14px] text-text-primary">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {query && filtered.length === 0 && (
        <p className="mt-4 font-sans text-[14px] text-text-disabled text-center">No matches found</p>
      )}
    </NDModal>
  );
}
