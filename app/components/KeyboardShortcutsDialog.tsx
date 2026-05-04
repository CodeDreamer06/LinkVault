"use client";

import React from "react";
import {
  formatShortcut,
  getPlatform,
  getShortcutsForPlatform,
} from "../lib/keyboard";
import { NDModal } from "./NDModal";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

function ShortcutKey({ keys }: { keys: string[] }) {
  const display = formatShortcut(keys);
  const isMultiKey =
    display.length > 1 &&
    (display.includes("+") ||
      display.includes("⌘") ||
      display.includes("⇧") ||
      display.includes("⌥"));

  return (
    <kbd
      className={`
      font-mono text-[12px] tracking-tight
      ${
        isMultiKey
          ? "text-text-primary"
          : "text-text-secondary border border-border px-1.5 py-0.5 rounded bg-surface-raised min-w-[24px] text-center inline-block"
      }
    `}
    >
      {display}
    </kbd>
  );
}

function ShortcutRow({
  keys,
  description,
}: {
  keys: string[];
  description: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2 border-b border-border last:border-b-0">
      <span className="font-sans text-[13px] leading-snug text-text-secondary">
        {description}
      </span>
      <div className="flex items-center gap-1 justify-self-end">
        {keys.map((key, i) => {
          const isMod = ["mod", "meta", "cmd", "ctrl"].includes(
            key.toLowerCase(),
          );
          const isSpecial = [
            "shift",
            "alt",
            "option",
            "escape",
            "esc",
            "delete",
            "backspace",
            "enter",
            "return",
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",
          ].includes(key.toLowerCase());

          if (isMod || isSpecial || key.length === 1) {
            return (
              <React.Fragment key={`${description}-${key}`}>
                {i > 0 && (
                  <span className="text-text-disabled mx-0.5">
                    {getPlatform() === "mac" ? "" : "+"}
                  </span>
                )}
                <ShortcutKey keys={[key]} />
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={`${description}-${key}`}>
              {i > 0 && <span className="text-text-disabled mx-0.5">+</span>}
              <kbd className="font-mono text-[11px] text-text-secondary uppercase">
                {key}
              </kbd>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function KeyboardShortcutsDialog({
  open,
  onClose,
}: KeyboardShortcutsDialogProps) {
  const platform = getPlatform();
  const groups = getShortcutsForPlatform(platform);
  const platformLabel =
    platform === "mac"
      ? "macOS"
      : platform === "windows"
        ? "Windows"
        : platform === "linux"
          ? "Linux"
          : "Your platform";

  return (
    <NDModal open={open} onClose={onClose} maxWidth="920px">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="font-sans text-[20px] tracking-tight text-text-display">
              Keyboard Shortcuts
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-0.5">
              {platformLabel} shortcuts detected
            </p>
          </div>
          <kbd className="font-mono text-[11px] text-text-disabled border border-border px-2 py-1 rounded">
            {formatShortcut(["mod", "/"])}
          </kbd>
        </div>

        <div className="grid gap-x-8 gap-y-5 mt-4 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.name}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-disabled mb-2">
                {group.name}
              </h3>
              <div className="flex flex-col">
                {group.shortcuts.map((shortcut) => (
                  <ShortcutRow
                    key={`${group.name}-${shortcut.description}`}
                    keys={shortcut.keys}
                    description={shortcut.description}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-border">
          <p className="font-mono text-[10px] text-text-disabled leading-relaxed">
            Press <ShortcutKey keys={[platform === "mac" ? "escape" : "esc"]} />{" "}
            to close this dialog. Shortcuts work across the app—context-aware
            where possible.
          </p>
        </div>
      </div>
    </NDModal>
  );
}
