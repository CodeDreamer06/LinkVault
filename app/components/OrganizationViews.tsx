"use client";

import React, { useState } from "react";
import type { VaultData, ViewType } from "../lib/types";
import { NDInput } from "./NDInput";
import { NDButton } from "./NDButton";
import { NDTag } from "./NDTag";
import { NDCard } from "./NDCard";
import { NDEmptyState } from "./NDEmptyState";
import { upsertCategory, upsertTag, upsertCollection, removeCategory, removeTag, removeCollection } from "../lib/db";
import { PlusIcon, TrashIcon } from "./Icons";

interface OrgViewProps {
  data: VaultData;
  onUpdate: (d: VaultData) => void;
  onFilterByTag?: (tag: string) => void;
  onFilterByCategory?: (cat: string) => void;
  onFilterByCollection?: (col: string) => void;
}

export function TagsView({ data, onUpdate, onFilterByTag }: OrgViewProps) {
  const [newTag, setNewTag] = useState("");
  const tagCounts = new Map<string, number>();
  for (const link of data.links) {
    for (const tid of link.tags) {
      tagCounts.set(tid, (tagCounts.get(tid) || 0) + 1);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-[24px] tracking-tight text-text-display">Tags</h2>
        <div className="flex items-center gap-2">
          <NDInput value={newTag} onChange={setNewTag} placeholder="New tag" className="w-48" />
          <NDButton variant="secondary" size="sm" onClick={() => {
            if (!newTag.trim()) return;
            const [next] = upsertTag(data, newTag.trim());
            onUpdate(next);
            setNewTag("");
          }}>
            <PlusIcon size={14} /> Add
          </NDButton>
        </div>
      </div>
      {data.tags.length === 0 ? (
        <NDEmptyState title="No tags yet" description="Tags help you organize links across categories." />
      ) : (
        <div className="flex flex-wrap gap-2">
          {data.tags.map((tag) => {
            const count = tagCounts.get(tag.id) || 0;
            return (
              <div key={tag.id} className="flex items-center gap-1 bg-surface border border-border rounded-full px-3 py-1.5">
                <button onClick={() => onFilterByTag?.(tag.name)} className="font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary hover:text-text-primary">
                  {tag.name}
                </button>
                <span className="font-mono text-[10px] text-text-disabled">{count}</span>
                <button onClick={() => onUpdate(removeTag(data, tag.id))} className="text-text-disabled hover:text-accent ml-1">
                  <TrashIcon size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CategoriesView({ data, onUpdate, onFilterByCategory }: OrgViewProps) {
  const [newCat, setNewCat] = useState("");
  const catCounts = new Map<string, number>();
  for (const link of data.links) {
    if (link.category) catCounts.set(link.category, (catCounts.get(link.category) || 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-[24px] tracking-tight text-text-display">Categories</h2>
        <div className="flex items-center gap-2">
          <NDInput value={newCat} onChange={setNewCat} placeholder="New category" className="w-48" />
          <NDButton variant="secondary" size="sm" onClick={() => {
            if (!newCat.trim()) return;
            const [next] = upsertCategory(data, newCat.trim());
            onUpdate(next);
            setNewCat("");
          }}>
            <PlusIcon size={14} /> Add
          </NDButton>
        </div>
      </div>
      {data.categories.length === 0 ? (
        <NDEmptyState title="No categories yet" description="Categories group links by topic or purpose." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.categories.map((cat) => {
            const count = catCounts.get(cat.id) || 0;
            return (
              <NDCard key={cat.id} onClick={() => onFilterByCategory?.(cat.name)}>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[15px] text-text-primary">{cat.name}</span>
                  <span className="font-mono text-[12px] text-text-secondary">{count}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdate(removeCategory(data, cat.id)); }}
                  className="mt-2 text-text-disabled hover:text-accent font-mono text-[10px] uppercase flex items-center gap-1"
                >
                  <TrashIcon size={12} /> Remove
                </button>
              </NDCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CollectionsView({ data, onUpdate, onFilterByCollection }: OrgViewProps) {
  const [newCol, setNewCol] = useState("");
  const colCounts = new Map<string, number>();
  for (const link of data.links) {
    for (const cid of link.collections) {
      colCounts.set(cid, (colCounts.get(cid) || 0) + 1);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-[24px] tracking-tight text-text-display">Collections</h2>
        <div className="flex items-center gap-2">
          <NDInput value={newCol} onChange={setNewCol} placeholder="New collection" className="w-48" />
          <NDButton variant="secondary" size="sm" onClick={() => {
            if (!newCol.trim()) return;
            const [next] = upsertCollection(data, newCol.trim());
            onUpdate(next);
            setNewCol("");
          }}>
            <PlusIcon size={14} /> Add
          </NDButton>
        </div>
      </div>
      {data.collections.length === 0 ? (
        <NDEmptyState title="No collections yet" description="Collections are manual groupings of related links." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.collections.map((col) => {
            const count = colCounts.get(col.id) || 0;
            return (
              <NDCard key={col.id} onClick={() => onFilterByCollection?.(col.name)}>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[15px] text-text-primary">{col.name}</span>
                  <span className="font-mono text-[12px] text-text-secondary">{count}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdate(removeCollection(data, col.id)); }}
                  className="mt-2 text-text-disabled hover:text-accent font-mono text-[10px] uppercase flex items-center gap-1"
                >
                  <TrashIcon size={12} /> Remove
                </button>
              </NDCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DomainsView({ data, onFilterByTag }: OrgViewProps) {
  const domains = new Map<string, { count: number; openCount: number }>();
  for (const link of data.links) {
    const existing = domains.get(link.domain) || { count: 0, openCount: 0 };
    existing.count += 1;
    existing.openCount += link.openCount;
    domains.set(link.domain, existing);
  }

  const sorted = Array.from(domains.entries()).sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="font-sans text-[24px] tracking-tight text-text-display">Domains</h2>
      {sorted.length === 0 ? (
        <NDEmptyState title="No domains yet" description="Save some links to see domain breakdowns." />
      ) : (
        <div className="flex flex-col gap-1">
          {sorted.map(([domain, stats]) => (
            <div key={domain} className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center font-mono text-[10px] text-text-secondary uppercase">
                  {domain.slice(0, 2)}
                </div>
                <span className="font-sans text-[14px] text-text-primary">{domain}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] text-text-secondary">{stats.count} links</span>
                <span className="font-mono text-[11px] text-text-disabled">{stats.openCount} opens</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
