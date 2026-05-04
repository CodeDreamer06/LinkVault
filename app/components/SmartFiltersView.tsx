"use client";

import React, { useState } from "react";
import type { VaultData, SavedFilter, FilterState, SortOption } from "../lib/types";
import { NDEmptyState } from "./NDEmptyState";
import { NDButton } from "./NDButton";
import { NDInput } from "./NDInput";
import { TrashIcon, ZapIcon } from "./Icons";
import { generateId } from "../lib/utils";

interface SmartFiltersViewProps {
  data: VaultData;
  onUpdate: (d: VaultData) => void;
  onApplyFilter?: (filter: FilterState, sort: SortOption) => void;
}

export function SmartFiltersView({ data, onUpdate, onApplyFilter }: SmartFiltersViewProps) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleDelete = (id: string) => {
    onUpdate({ ...data, savedFilters: data.savedFilters.filter((f) => f.id !== id) });
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const filter: SavedFilter = {
      id: generateId(),
      name: name.trim(),
      filters: { query: "", tags: [] },
      sort: "newest",
      createdAt: new Date().toISOString(),
    };
    onUpdate({ ...data, savedFilters: [...data.savedFilters, filter] });
    setName("");
    setCreating(false);
  };

  const formatFilterSummary = (f: SavedFilter) => {
    const parts: string[] = [];
    if (f.filters.query) parts.push(`q:"${f.filters.query}"`);
    if (f.filters.category) parts.push(`cat:${f.filters.category}`);
    if (f.filters.tags.length) parts.push(`tags:${f.filters.tags.length}`);
    if (f.filters.collection) parts.push(`col:${f.filters.collection}`);
    if (f.filters.domain) parts.push(`domain:${f.filters.domain}`);
    if (f.filters.readStatus) parts.push(`read:${f.filters.readStatus}`);
    if (f.filters.priority) parts.push(`pri:${f.filters.priority}`);
    if (f.filters.archived !== undefined) parts.push(f.filters.archived ? "archived" : "active");
    if (parts.length === 0) return "All links";
    return parts.join(" · ");
  };

  if (data.savedFilters.length === 0 && !creating) {
    return (
      <div className="flex flex-col gap-8 p-6">
        <div>
          <h2 className="font-sans text-[24px] tracking-tight text-text-display">Smart Filters</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-1">Saved search presets</p>
        </div>
        <NDEmptyState title="No saved filters" description="Create filter presets to quickly access common views." />
        <div>
          <NDButton variant="primary" onClick={() => setCreating(true)}>
            <ZapIcon size={14} /> Create Filter
          </NDButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-sans text-[24px] tracking-tight text-text-display">Smart Filters</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-1">Saved search presets</p>
        </div>
        <NDButton variant="primary" onClick={() => setCreating(true)}>
          <ZapIcon size={14} /> New Filter
        </NDButton>
      </div>

      {creating && (
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary">New Filter</span>
          <NDInput label="Name" value={name} onChange={setName} placeholder="e.g. High priority articles" />
          <div className="flex gap-2">
            <NDButton variant="primary" onClick={handleCreate}>Save</NDButton>
            <NDButton variant="ghost" onClick={() => { setCreating(false); setName(""); }}>Cancel</NDButton>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {data.savedFilters.map((f) => (
          <div
            key={f.id}
            className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between group hover:border-border-visible transition-colors"
          >
            <div className="min-w-0">
              <div className="font-sans text-[14px] text-text-primary">{f.name}</div>
              <div className="font-mono text-[11px] text-text-secondary mt-0.5 truncate">{formatFilterSummary(f)}</div>
              <div className="font-mono text-[10px] text-text-disabled mt-1">Sort: {f.sort}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <NDButton size="sm" variant="secondary" onClick={() => onApplyFilter?.(f.filters, f.sort)}>
                Apply
              </NDButton>
              <NDButton size="sm" variant="ghost" onClick={() => handleDelete(f.id)}>
                <TrashIcon size={14} />
              </NDButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
