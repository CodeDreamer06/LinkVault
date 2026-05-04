"use client";

import React from "react";
import type { FilterState, SortOption } from "../lib/types";
import { NDTag } from "./NDTag";
import { ChevronDownIcon } from "./Icons";

interface FilterBarProps {
  filter: FilterState;
  sort: SortOption;
  onChangeFilter: (f: FilterState) => void;
  onChangeSort: (s: SortOption) => void;
  categories: string[];
  tags: string[];
  collections: string[];
  domains: string[];
  className?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "updated", label: "Updated" },
  { value: "alpha", label: "A-Z" },
  { value: "mostOpened", label: "Most Opened" },
  { value: "lastOpened", label: "Last Opened" },
  { value: "domain", label: "Domain" },
  { value: "priority", label: "Priority" },
  { value: "confidence", label: "Confidence" },
];

export function FilterBar({
  filter,
  sort,
  onChangeFilter,
  onChangeSort,
  categories,
  tags,
  collections,
  domains,
  className = "",
}: FilterBarProps) {
  const activeFilters = [
    filter.category && `Category: ${filter.category}`,
    filter.collection && `Collection: ${filter.collection}`,
    filter.domain && `Domain: ${filter.domain}`,
    filter.readStatus && `Read: ${filter.readStatus}`,
    filter.priority && `Priority: ${filter.priority}`,
    ...(filter.tags.map((t) => `Tag: ${t}`)),
  ].filter(Boolean) as string[];

  const clearAll = () => {
    onChangeFilter({ query: filter.query, tags: [] });
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onChangeSort(e.target.value as SortOption)}
            className="appearance-none bg-surface border border-border rounded-lg pl-3 pr-8 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary focus:outline-none focus:border-border-visible cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
        </div>

        {categories.length > 0 && (
          <div className="relative">
            <select
              value={filter.category || ""}
              onChange={(e) => onChangeFilter({ ...filter, category: e.target.value || undefined })}
              className="appearance-none bg-surface border border-border rounded-lg pl-3 pr-8 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary focus:outline-none focus:border-border-visible cursor-pointer"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
          </div>
        )}

        {tags.length > 0 && (
          <div className="relative">
            <select
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                if (!filter.tags.includes(e.target.value)) {
                  onChangeFilter({ ...filter, tags: [...filter.tags, e.target.value] });
                }
              }}
              className="appearance-none bg-surface border border-border rounded-lg pl-3 pr-8 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary focus:outline-none focus:border-border-visible cursor-pointer"
            >
              <option value="">Add tag filter</option>
              {tags
                .filter((t) => !filter.tags.includes(t))
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
            <ChevronDownIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
          </div>
        )}

        {domains.length > 0 && (
          <div className="relative">
            <select
              value={filter.domain || ""}
              onChange={(e) => onChangeFilter({ ...filter, domain: e.target.value || undefined })}
              className="appearance-none bg-surface border border-border rounded-lg pl-3 pr-8 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary focus:outline-none focus:border-border-visible cursor-pointer"
            >
              <option value="">All domains</option>
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
          </div>
        )}

        <div className="relative">
          <select
            value={filter.readStatus || ""}
            onChange={(e) => onChangeFilter({ ...filter, readStatus: (e.target.value as any) || undefined })}
            className="appearance-none bg-surface border border-border rounded-lg pl-3 pr-8 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary focus:outline-none focus:border-border-visible cursor-pointer"
          >
            <option value="">All read states</option>
            <option value="unread">Unread</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
          </select>
          <ChevronDownIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filter.tags.map((tag) => (
            <NDTag key={tag} label={tag} active onRemove={() => onChangeFilter({ ...filter, tags: filter.tags.filter((t) => t !== tag) })} />
          ))}
          {filter.category && (
            <NDTag label={`Cat: ${filter.category}`} active onRemove={() => onChangeFilter({ ...filter, category: undefined })} />
          )}
          {filter.collection && (
            <NDTag label={`Col: ${filter.collection}`} active onRemove={() => onChangeFilter({ ...filter, collection: undefined })} />
          )}
          {filter.domain && (
            <NDTag label={`Dom: ${filter.domain}`} active onRemove={() => onChangeFilter({ ...filter, domain: undefined })} />
          )}
          {filter.readStatus && (
            <NDTag label={`Read: ${filter.readStatus}`} active onRemove={() => onChangeFilter({ ...filter, readStatus: undefined })} />
          )}
          {filter.priority && (
            <NDTag label={`Prio: ${filter.priority}`} active onRemove={() => onChangeFilter({ ...filter, priority: undefined })} />
          )}
          <button onClick={clearAll} className="font-mono text-[11px] text-accent hover:underline">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
