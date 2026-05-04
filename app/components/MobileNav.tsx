"use client";

import React, { useState } from "react";
import type { ViewType } from "../lib/types";
import {
  LinkIcon,
  InboxIcon,
  StarIcon,
  BookOpenIcon,
  ArchiveIcon,
  BarChartIcon,
  SettingsIcon,
  PlusIcon,
  MenuIcon,
  XIcon,
  BellIcon,
  CommandIcon,
  KeyboardIcon,
} from "./Icons";

interface MobileNavProps {
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

const mainViews: { view: ViewType; label: string; icon: React.FC<Parameters<typeof LinkIcon>[0]> }[] = [
  { view: "library", label: "Library", icon: LinkIcon },
  { view: "inbox", label: "Inbox", icon: InboxIcon },
  { view: "favorites", label: "Favs", icon: StarIcon },
  { view: "reading", label: "Reading", icon: BookOpenIcon },
  { view: "reminders", label: "Alerts", icon: BellIcon },
];

const moreViews: { view: ViewType; label: string; icon: React.FC<Parameters<typeof LinkIcon>[0]> }[] = [
  { view: "archived", label: "Archived", icon: ArchiveIcon },
  { view: "analytics", label: "Analytics", icon: BarChartIcon },
  { view: "settings", label: "Settings", icon: SettingsIcon },
];

export function MobileNav({ view, onChangeView, onOpenCapture, onOpenCommand, onOpenShortcuts, counts }: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleViewChange = (v: ViewType) => {
    onChangeView(v);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-display text-[22px] tracking-tight text-text-display">LinkVault</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCapture}
              className="p-2 rounded-lg bg-text-display text-black"
            >
              <PlusIcon size={20} strokeWidth={2} />
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface"
            >
              <MenuIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {mainViews.map((item) => {
            const active = view === item.view;
            const count =
              item.view === "library" ? counts.library
              : item.view === "inbox" ? counts.inbox
              : item.view === "favorites" ? counts.favorites
              : item.view === "reading" ? counts.reading
              : item.view === "reminders" ? counts.reminders
              : undefined;
            return (
              <button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  active ? "text-text-display" : "text-text-secondary"
                }`}
              >
                <item.icon size={20} className={active ? "text-text-display" : "text-text-secondary"} />
                <span className="font-mono text-[9px] uppercase tracking-[0.06em]">{item.label}</span>
                {count !== undefined && count > 0 && (
                  <span className="absolute -mt-1 ml-3 w-4 h-4 rounded-full bg-accent text-black text-[9px] flex items-center justify-center font-mono">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="font-sans text-[18px] tracking-tight text-text-display">Menu</h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface"
            >
              <XIcon size={20} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-2">
            {/* More Views */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-disabled px-2 mb-1">Views</span>
              {moreViews.map((item) => {
                const active = view === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => handleViewChange(item.view)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      active ? "bg-surface-raised text-text-display" : "text-text-secondary hover:text-text-primary hover:bg-surface"
                    }`}
                  >
                    <item.icon size={20} className={active ? "text-text-display" : "text-text-secondary"} />
                    <span className="font-sans text-[14px]">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 mt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-disabled px-2 mb-1">Actions</span>
              <button
                onClick={() => { onOpenCommand(); setMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-left text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              >
                <CommandIcon size={20} />
                <span className="font-sans text-[14px]">Command Palette</span>
              </button>
              {onOpenShortcuts && (
                <button
                  onClick={() => { onOpenShortcuts(); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-left text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                >
                  <KeyboardIcon size={20} />
                  <span className="font-sans text-[14px]">Keyboard Shortcuts</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
