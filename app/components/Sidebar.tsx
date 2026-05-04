"use client";

import React from "react";
import type { ViewType } from "../lib/types";
import {
  InboxIcon,
  StarIcon,
  BookOpenIcon,
  ArchiveIcon,
  BarChartIcon,
  SettingsIcon,
  PlusIcon,
  CommandIcon,
  WrenchIcon,
  GlobeIcon,
  FolderIcon,
  TagIcon,
  LinkIcon,
  BellIcon,
  ActivityIcon,
  FilterIcon,
  LayersIcon,
  KeyboardIcon,
} from "./Icons";
import { ShortcutHint } from "./ShortcutHint";

interface SidebarProps {
  view: ViewType;
  onChangeView: (v: ViewType) => void;
  onOpenCapture: () => void;
  onOpenCommand: () => void;
  onOpenShortcuts?: () => void;
  counts: {
    library: number;
    inbox: number;
    favorites: number;
    reading: number;
    archived: number;
    reminders: number;
  };
}

const navItems: { view: ViewType; label: string; icon: React.FC<Parameters<typeof LinkIcon>[0]> }[] = [
  { view: "library", label: "Library", icon: LinkIcon },
  { view: "inbox", label: "Inbox", icon: InboxIcon },
  { view: "favorites", label: "Favorites", icon: StarIcon },
  { view: "reading", label: "Reading", icon: BookOpenIcon },
  { view: "archived", label: "Archived", icon: ArchiveIcon },
  { view: "reminders", label: "Reminders", icon: BellIcon },
  { view: "workspaces", label: "Workspaces", icon: LayersIcon },
  { view: "domains", label: "Domains", icon: GlobeIcon },
  { view: "collections", label: "Collections", icon: FolderIcon },
  { view: "tags", label: "Tags", icon: TagIcon },
  { view: "categories", label: "Categories", icon: TagIcon },
  { view: "filters", label: "Filters", icon: FilterIcon },
  { view: "analytics", label: "Analytics", icon: BarChartIcon },
  { view: "activity", label: "Activity", icon: ActivityIcon },
  { view: "maintenance", label: "Maintenance", icon: WrenchIcon },
  { view: "settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar({ view, onChangeView, onOpenCapture, onOpenCommand, onOpenShortcuts, counts }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-[220px] border-r border-border bg-black shrink-0">
      <div className="p-5 border-b border-border">
        <h1
          className="font-display text-[28px] tracking-tight text-text-display cursor-pointer"
          onClick={() => onChangeView("library")}
        >
          LinkVault
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-disabled mt-1">
          Local-first intelligence
        </p>
      </div>

      <div className="p-3">
        <button
          onClick={onOpenCapture}
          className="w-full flex items-center justify-center gap-2 bg-text-display text-black font-mono uppercase text-[13px] tracking-[0.06em] rounded-full py-2.5 hover:opacity-90 transition-opacity"
        >
          <PlusIcon size={18} strokeWidth={2} />
          Capture Link
          <span className="ml-1 opacity-60">
            <ShortcutHint keys={["mod", "shift", "n"]} />
          </span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {navItems.map((item) => {
          const active = view === item.view;
          const count =
            item.view === "library"
              ? counts.library
              : item.view === "inbox"
                ? counts.inbox
                : item.view === "favorites"
                  ? counts.favorites
                  : item.view === "reading"
                    ? counts.reading
                    : item.view === "archived"
                      ? counts.archived
                      : item.view === "reminders"
                        ? counts.reminders
                        : undefined;
          return (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-150
                ${active ? "bg-surface-raised text-text-display" : "text-text-secondary hover:text-text-primary hover:bg-surface"}
              `}
            >
              <item.icon size={18} className={active ? "text-text-display" : "text-text-secondary"} />
              <span className="font-sans text-[14px]">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className="ml-auto font-mono text-[11px] text-text-disabled">{count}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border flex flex-col gap-1">
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors text-left"
        >
          <CommandIcon size={16} />
          <span className="font-mono text-[11px] uppercase tracking-[0.08em]">Command</span>
          <span className="ml-auto">
            <ShortcutHint keys={["mod", "k"]} />
          </span>
        </button>
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors text-left"
          >
            <KeyboardIcon size={16} />
            <span className="font-mono text-[11px] uppercase tracking-[0.08em]">Shortcuts</span>
            <span className="ml-auto">
              <ShortcutHint keys={["mod", "/"]} />
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
