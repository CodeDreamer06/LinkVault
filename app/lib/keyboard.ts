"use client";

import { useEffect, useCallback, useState } from "react";

export type Platform = "mac" | "windows" | "linux" | "unknown";

export function getPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("mac") || userAgent.includes("darwin")) return "mac";
  if (userAgent.includes("win")) return "windows";
  if (userAgent.includes("linux")) return "linux";
  return "unknown";
}

export function isMac(): boolean {
  return getPlatform() === "mac";
}

export function formatShortcut(keys: string[]): string {
  const platform = getPlatform();
  const isMacOS = platform === "mac";

  return keys.map((key) => {
    const lower = key.toLowerCase();
    if (lower === "mod" || lower === "meta" || lower === "cmd" || lower === "ctrl") {
      return isMacOS ? "⌘" : "Ctrl";
    }
    if (lower === "alt" || lower === "option") {
      return isMacOS ? "⌥" : "Alt";
    }
    if (lower === "shift") {
      return isMacOS ? "⇧" : "Shift";
    }
    if (lower === "escape" || lower === "esc") {
      return isMacOS ? "⎋" : "Esc";
    }
    if (lower === "enter" || lower === "return") {
      return "↵";
    }
    if (lower === "delete" || lower === "backspace") {
      return isMacOS ? "⌫" : "Del";
    }
    if (lower === "slash" || lower === "/") {
      return "/";
    }
    if (lower === "arrowup") return "↑";
    if (lower === "arrowdown") return "↓";
    if (lower === "arrowleft") return "←";
    if (lower === "arrowright") return "→";
    return key.toUpperCase();
  }).join(isMacOS ? "" : "+");
}

export interface ShortcutDefinition {
  id: string;
  keys: string[];
  description: string;
  context: "global" | "library" | "modal" | "selection";
  action: () => boolean | void;
}

export interface ShortcutGroup {
  name: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

export function getShortcutsForPlatform(platform: Platform = getPlatform()): ShortcutGroup[] {
  const mod = platform === "mac" ? "⌘" : "Ctrl";
  const alt = platform === "mac" ? "⌥" : "Alt";
  const shift = platform === "mac" ? "⇧" : "Shift";
  const esc = platform === "mac" ? "⎋" : "Esc";
  const del = platform === "mac" ? "⌫" : "Del";
  const enter = "↵";

  const separator = platform === "mac" ? "" : "+";
  const join = (keys: string[]) => keys.join(separator);

  return [
    {
      name: "Navigation",
      shortcuts: [
        { keys: [mod, "K"], description: "Open command palette" },
        { keys: [mod, "/"], description: "Show keyboard shortcuts" },
        { keys: [mod, "1"], description: "Go to Library" },
        { keys: [mod, "2"], description: "Go to Inbox" },
        { keys: [mod, "3"], description: "Go to Favorites" },
        { keys: [mod, "4"], description: "Go to Reading" },
        { keys: [mod, "5"], description: "Go to Archived" },
        { keys: [mod, "6"], description: "Go to Reminders" },
        { keys: [mod, "7"], description: "Go to Analytics" },
        { keys: [mod, "8"], description: "Go to Settings" },
        { keys: [esc], description: "Close modal / Clear selection" },
      ],
    },
    {
      name: "Actions",
      shortcuts: [
        { keys: [mod, "N"], description: "Capture new link" },
        { keys: [mod, "F"], description: "Focus search" },
        { keys: ["/"], description: "Focus search (vim-style)" },
        { keys: [enter], description: "Open selected link" },
        { keys: ["E"], description: "Edit selected link" },
        { keys: ["F"], description: "Toggle favorite" },
        { keys: ["A"], description: "Toggle archive" },
        { keys: ["R"], description: "Toggle read status" },
        { keys: [del], description: "Delete selected" },
        { keys: [mod, shift, "A"], description: "Select all visible" },
      ],
    },
    {
      name: "Selection",
      shortcuts: [
        { keys: ["↑"], description: "Select previous link" },
        { keys: ["↓"], description: "Select next link" },
        { keys: [shift, "↑"], description: "Add previous to selection" },
        { keys: [shift, "↓"], description: "Add next to selection" },
        { keys: ["Space"], description: "Toggle selection" },
      ],
    },
    {
      name: "Bulk Actions",
      shortcuts: [
        { keys: [mod, "."], description: "Archive selected" },
        { keys: [mod, shift, "."], description: "Unarchive selected" },
        { keys: [mod, "S"], description: "Favorite selected" },
        { keys: [mod, shift, "S"], description: "Unfavorite selected" },
        { keys: [mod, shift, "D"], description: "Delete selected" },
      ],
    },
  ];
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutDefinition[],
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const keys = shortcut.keys.map((k) => k.toLowerCase());
        const hasMod = keys.includes("mod") || keys.includes("meta") || keys.includes("cmd") || keys.includes("ctrl");
        const hasShift = keys.includes("shift");
        const hasAlt = keys.includes("alt") || keys.includes("option");

        const mainKey = keys.find((k) => 
          !["mod", "meta", "cmd", "ctrl", "shift", "alt", "option"].includes(k)
        );

        if (!mainKey) continue;

        const modMatch = hasMod ? (e.metaKey || e.ctrlKey) : !(e.metaKey || e.ctrlKey);
        const shiftMatch = hasShift ? e.shiftKey : !e.shiftKey;
        const altMatch = hasAlt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === mainKey || e.code.toLowerCase() === `key${mainKey}`;

        if (modMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          const result = shortcut.action();
          if (result !== false) {
            break;
          }
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function useFocusOnKey(
  targetRef: React.RefObject<HTMLElement | null>,
  key: string,
  requireMod: boolean = false
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const keyMatch = e.key.toLowerCase() === key.toLowerCase();
      const modMatch = requireMod ? (e.metaKey || e.ctrlKey) : true;
      
      if (keyMatch && modMatch) {
        e.preventDefault();
        targetRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [targetRef, key, requireMod]);
}
