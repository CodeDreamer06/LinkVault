"use client";

import React from "react";
import { NDButton } from "./NDButton";
import { NDTag } from "./NDTag";
import { ArchiveIcon, StarIcon, TrashIcon, TagIcon, XIcon } from "./Icons";
import { ShortcutHint } from "./ShortcutHint";

interface BulkActionsProps {
  selectedCount: number;
  onArchive: () => void;
  onUnarchive: () => void;
  onFavorite: () => void;
  onUnfavorite: () => void;
  onDelete: () => void;
  onTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onClear: () => void;
  availableTags: string[];
}

export function BulkActions({
  selectedCount,
  onArchive,
  onUnarchive,
  onFavorite,
  onUnfavorite,
  onDelete,
  onTag,
  onRemoveTag,
  onClear,
  availableTags,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col gap-3 p-3 bg-surface-raised border border-border rounded-xl">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">
          {selectedCount} selected
        </span>
        <button onClick={onClear} className="text-text-disabled hover:text-text-primary transition-colors">
          <XIcon size={16} />
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <NDButton size="sm" variant="secondary" onClick={onFavorite}>
          <StarIcon size={14} /> Favorite
          <ShortcutHint keys={["mod", "s"]} className="ml-1.5 opacity-60" />
        </NDButton>
        <NDButton size="sm" variant="secondary" onClick={onUnfavorite}>
          <StarIcon size={14} /> Unfavorite
          <ShortcutHint keys={["mod", "shift", "s"]} className="ml-1.5 opacity-60" />
        </NDButton>
        <NDButton size="sm" variant="secondary" onClick={onArchive}>
          <ArchiveIcon size={14} /> Archive
          <ShortcutHint keys={["mod", "."]} className="ml-1.5 opacity-60" />
        </NDButton>
        <NDButton size="sm" variant="secondary" onClick={onUnarchive}>
          <ArchiveIcon size={14} /> Unarchive
          <ShortcutHint keys={["mod", "shift", "."]} className="ml-1.5 opacity-60" />
        </NDButton>
        <NDButton size="sm" variant="destructive" onClick={onDelete}>
          <TrashIcon size={14} /> Delete
          <ShortcutHint keys={["mod", "shift", "d"]} className="ml-1.5 opacity-60" />
        </NDButton>
      </div>
      {availableTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase text-text-disabled">Tag:</span>
          {availableTags.map((tag) => (
            <NDTag key={tag} label={tag} onClick={() => onTag(tag)} />
          ))}
        </div>
      )}
    </div>
  );
}
