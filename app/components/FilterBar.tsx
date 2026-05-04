"use client";

import React, { useState } from "react";
import type { FilterState, SortOption, ContentType, Priority, ReadStatus, LinkHealth } from "../lib/types";
import { NDTag } from "./NDTag";
import {
  ChevronDownIcon,
  StarIcon,
  HeartFilledIcon,
  ArchiveIcon,
  FileTextIcon,
  VideoIcon,
  WrenchToolIcon,
  GitBranchIcon,
  ImageIcon,
  HeadphonesIcon,
  BookOpenIcon,
  SparklesIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  BellIcon,
  XIcon,
  FolderIcon,
  Grid3x3Icon,
  CircleDotIcon,
} from "./Icons";

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

const sortOptions: { value: SortOption; label: string; emoji: string }[] = [
  { value: "newest", label: "Newest", emoji: "◍" },
  { value: "oldest", label: "Oldest", emoji: "◌" },
  { value: "updated", label: "Updated", emoji: "◎" },
  { value: "alpha", label: "A-Z", emoji: "⊕" },
  { value: "mostOpened", label: "Most Opened", emoji: "◐" },
  { value: "lastOpened", label: "Last Opened", emoji: "◑" },
  { value: "domain", label: "Domain", emoji: "◒" },
  { value: "priority", label: "Priority", emoji: "◓" },
  { value: "confidence", label: "Confidence", emoji: "◉" },
];

const contentTypes: { value: ContentType; label: string; icon: React.ReactNode }[] = [
  { value: "article", label: "Article", icon: <FileTextIcon size={14} /> },
  { value: "video", label: "Video", icon: <VideoIcon size={14} /> },
  { value: "tool", label: "Tool", icon: <WrenchToolIcon size={14} /> },
  { value: "repo", label: "Code", icon: <GitBranchIcon size={14} /> },
  { value: "documentation", label: "Docs", icon: <BookOpenIcon size={14} /> },
  { value: "image", label: "Image", icon: <ImageIcon size={14} /> },
  { value: "audio", label: "Audio", icon: <HeadphonesIcon size={14} /> },
];

const priorities: { value: Priority; label: string; dots: number; color: string }[] = [
  { value: "low", label: "Low", dots: 1, color: "text-text-secondary" },
  { value: "medium", label: "Mid", dots: 2, color: "text-text-primary" },
  { value: "high", label: "High", dots: 3, color: "text-accent" },
  { value: "urgent", label: "Now", dots: 4, color: "text-accent" },
];

const readStatuses: { value: ReadStatus; label: string; symbol: string }[] = [
  { value: "unread", label: "Unread", symbol: "○" },
  { value: "reading", label: "Reading", symbol: "◐" },
  { value: "read", label: "Read", symbol: "●" },
];

const healthStatuses: { value: LinkHealth; label: string; icon: React.ReactNode }[] = [
  { value: "active", label: "Active", icon: <ShieldCheckIcon size={12} /> },
  { value: "redirected", label: "Moved", icon: <ClockIcon size={12} /> },
  { value: "broken", label: "Broken", icon: <AlertTriangleIcon size={12} /> },
  { value: "blocked", label: "Blocked", icon: <Grid3x3Icon size={12} /> },
];

function DotMatrix({ count = 6, active = false }: { count?: number; active?: boolean }) {
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-[3px] h-[3px] rounded-full transition-all duration-200 ${
            active ? "bg-text-display" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function SegmentedButton({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em]
        border transition-all duration-150
        ${active 
          ? "bg-text-display text-black border-text-display" 
          : "bg-transparent text-text-secondary border-border hover:border-text-secondary hover:text-text-primary"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

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
  const [showMore, setShowMore] = useState(false);

  const activeFilters = [
    filter.category && { type: "category", label: filter.category, key: `cat-${filter.category}` },
    filter.collection && { type: "collection", label: filter.collection, key: `col-${filter.collection}` },
    filter.domain && { type: "domain", label: filter.domain, key: `dom-${filter.domain}` },
    filter.readStatus && { type: "read", label: filter.readStatus, key: `read-${filter.readStatus}` },
    filter.priority && { type: "priority", label: filter.priority, key: `prio-${filter.priority}` },
    filter.contentType && { type: "type", label: filter.contentType, key: `type-${filter.contentType}` },
    filter.health && { type: "health", label: filter.health, key: `health-${filter.health}` },
    filter.favorite === true && { type: "favorite", label: "Favorites", key: "fav" },
    filter.archived === true && { type: "archived", label: "Archived", key: "arch" },
    filter.aiEnriched === true && { type: "ai", label: "AI Enhanced", key: "ai" },
    filter.hasReminders === true && { type: "reminders", label: "Has Reminders", key: "rem" },
    ...filter.tags.map((t) => ({ type: "tag", label: t, key: `tag-${t}` })),
  ].filter(Boolean) as { type: string; label: string; key: string }[];

  const clearAll = () => {
    onChangeFilter({ query: filter.query, tags: [] });
  };

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case "category":
        onChangeFilter({ ...filter, category: undefined });
        break;
      case "collection":
        onChangeFilter({ ...filter, collection: undefined });
        break;
      case "domain":
        onChangeFilter({ ...filter, domain: undefined });
        break;
      case "read":
        onChangeFilter({ ...filter, readStatus: undefined });
        break;
      case "priority":
        onChangeFilter({ ...filter, priority: undefined });
        break;
      case "type":
        onChangeFilter({ ...filter, contentType: undefined });
        break;
      case "health":
        onChangeFilter({ ...filter, health: undefined });
        break;
      case "tag":
        onChangeFilter({ ...filter, tags: filter.tags.filter((t) => t !== value) });
        break;
      case "favorite":
        onChangeFilter({ ...filter, favorite: undefined });
        break;
      case "archived":
        onChangeFilter({ ...filter, archived: undefined });
        break;
      case "ai":
        onChangeFilter({ ...filter, aiEnriched: undefined });
        break;
      case "reminders":
        onChangeFilter({ ...filter, hasReminders: undefined });
        break;
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Primary Filter Row - The Essentials */}
      <div className="flex items-start gap-4 flex-wrap">
        {/* Sort Control - Dot Matrix Style */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Sort</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onChangeSort(e.target.value as SortOption)}
              className="appearance-none bg-surface border border-border pl-3 pr-8 py-2 font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary focus:outline-none focus:border-text-display cursor-pointer hover:border-text-secondary transition-colors"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.emoji} {o.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
            <DotMatrix count={4} active={false} />
          </div>
        </div>

        {/* Status Toggles - Segmented Control */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Status</span>
          <div className="flex">
            <SegmentedButton
              active={filter.favorite === true}
              onClick={() => onChangeFilter({ ...filter, favorite: filter.favorite === true ? undefined : true })}
              className="rounded-l-full border-r-0"
            >
              <HeartFilledIcon size={12} />
              <span className="hidden sm:inline">Loved</span>
            </SegmentedButton>
            <SegmentedButton
              active={filter.archived === true}
              onClick={() => onChangeFilter({ ...filter, archived: filter.archived === true ? undefined : true })}
              className="rounded-r-full"
            >
              <ArchiveIcon size={12} />
              <span className="hidden sm:inline">Archived</span>
            </SegmentedButton>
          </div>
        </div>

        {/* Read Status - Three State Toggle */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Read</span>
          <div className="flex bg-surface border border-border p-0.5">
            {readStatuses.map((status, idx) => (
              <button
                key={status.value}
                onClick={() => onChangeFilter({ 
                  ...filter, 
                  readStatus: filter.readStatus === status.value ? undefined : status.value 
                })}
                className={`
                  px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-all
                  ${filter.readStatus === status.value 
                    ? "bg-text-display text-black" 
                    : "text-text-secondary hover:text-text-primary"
                  }
                  ${idx === 0 ? "" : ""}
                `}
              >
                <span className="mr-1">{status.symbol}</span>
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Dots - Visual Intensity */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Priority</span>
          <div className="flex items-center gap-1">
            {priorities.map((p) => (
              <button
                key={p.value}
                onClick={() => onChangeFilter({ 
                  ...filter, 
                  priority: filter.priority === p.value ? undefined : p.value 
                })}
                className={`
                  flex flex-col items-center gap-1 px-2 py-1.5 border transition-all
                  ${filter.priority === p.value 
                    ? "border-text-display bg-surface" 
                    : "border-border hover:border-text-secondary"
                  }
                `}
                title={p.label}
              >
                <div className="flex gap-[2px]">
                  {Array.from({ length: p.dots }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-[4px] h-[4px] rounded-full ${
                        filter.priority === p.value ? "bg-accent" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <span className={`font-mono text-[8px] uppercase tracking-[0.1em] ${
                  filter.priority === p.value ? "text-text-display" : "text-text-disabled"
                }`}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Filters - AI & Reminders */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Special</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => onChangeFilter({ ...filter, aiEnriched: filter.aiEnriched === true ? undefined : true })}
              className={`
                flex items-center gap-1.5 px-3 py-2 border transition-all
                ${filter.aiEnriched 
                  ? "bg-text-display text-black border-text-display" 
                  : "border-border text-text-secondary hover:border-text-secondary hover:text-text-primary"
                }
              `}
              title="AI Enhanced"
            >
              <SparklesIcon size={14} />
              <span className="font-mono text-[10px] uppercase tracking-[0.08em]">AI</span>
            </button>
            <button
              onClick={() => onChangeFilter({ ...filter, hasReminders: filter.hasReminders === true ? undefined : true })}
              className={`
                flex items-center gap-1.5 px-3 py-2 border transition-all
                ${filter.hasReminders 
                  ? "bg-text-display text-black border-text-display" 
                  : "border-border text-text-secondary hover:border-text-secondary hover:text-text-primary"
                }
              `}
              title="Has Reminders"
            >
              <BellIcon size={14} />
              <span className="font-mono text-[10px] uppercase tracking-[0.08em]">Reminder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Type - Icon Grid */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Content Type</span>
          <DotMatrix count={8} active={!!filter.contentType} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {contentTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onChangeFilter({ 
                ...filter, 
                contentType: filter.contentType === type.value ? undefined : type.value 
              })}
              className={`
                flex items-center gap-2 px-3 py-2 border transition-all
                ${filter.contentType === type.value 
                  ? "bg-surface border-text-display text-text-display" 
                  : "border-border text-text-secondary hover:border-text-secondary hover:text-text-primary"
                }
              `}
            >
              {type.icon}
              <span className="font-mono text-[10px] uppercase tracking-[0.08em]">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filters - Expandable */}
      {!showMore ? (
        <button
          onClick={() => setShowMore(true)}
          className="self-start flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <DotMatrix count={3} active={false} />
          <span className="font-mono text-[10px] uppercase tracking-[0.1em]">More Filters</span>
          <ChevronDownIcon size={12} />
        </button>
      ) : (
        <div className="flex flex-col gap-4 border-l-2 border-border pl-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Refine Further</span>
            <button onClick={() => setShowMore(false)} className="text-text-disabled hover:text-text-secondary">
              <XIcon size={14} />
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Category Dropdown */}
            {categories.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Category</span>
                <div className="relative">
                  <select
                    value={filter.category || ""}
                    onChange={(e) => onChangeFilter({ ...filter, category: e.target.value || undefined })}
                    className="appearance-none bg-surface border border-border pl-3 pr-8 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary focus:outline-none focus:border-text-display cursor-pointer min-w-[140px]"
                  >
                    <option value="">All</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDownIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
                </div>
              </div>
            )}

            {/* Collection Dropdown */}
            {collections.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Collection</span>
                <div className="relative">
                  <select
                    value={filter.collection || ""}
                    onChange={(e) => onChangeFilter({ ...filter, collection: e.target.value || undefined })}
                    className="appearance-none bg-surface border border-border pl-3 pr-8 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary focus:outline-none focus:border-text-display cursor-pointer min-w-[140px]"
                  >
                    <option value="">All</option>
                    {collections.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <FolderIcon size={14} className="absolute right-7 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
                  <ChevronDownIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
                </div>
              </div>
            )}

            {/* Domain Dropdown */}
            {domains.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Domain</span>
                <div className="relative">
                  <select
                    value={filter.domain || ""}
                    onChange={(e) => onChangeFilter({ ...filter, domain: e.target.value || undefined })}
                    className="appearance-none bg-surface border border-border pl-3 pr-8 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary focus:outline-none focus:border-text-display cursor-pointer min-w-[160px]"
                  >
                    <option value="">All domains</option>
                    {domains.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDownIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
                </div>
              </div>
            )}

            {/* Health Status */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Link Health</span>
              <div className="flex flex-wrap gap-1">
                {healthStatuses.map((h) => (
                  <button
                    key={h.value}
                    onClick={() => onChangeFilter({ 
                      ...filter, 
                      health: filter.health === h.value ? undefined : h.value 
                    })}
                    className={`
                      flex items-center gap-1.5 px-2 py-1 border transition-all
                      ${filter.health === h.value 
                        ? "border-text-display text-text-display bg-surface" 
                        : "border-border text-text-secondary hover:border-text-secondary"
                      }
                    `}
                  >
                    {h.icon}
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em]">{h.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Date Range</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filter.dateFrom || ""}
                  onChange={(e) => onChangeFilter({ ...filter, dateFrom: e.target.value || undefined })}
                  className="bg-surface border border-border px-2 py-1.5 font-mono text-[10px] text-text-secondary focus:outline-none focus:border-text-display"
                />
                <span className="text-text-disabled">→</span>
                <input
                  type="date"
                  value={filter.dateTo || ""}
                  onChange={(e) => onChangeFilter({ ...filter, dateTo: e.target.value || undefined })}
                  className="bg-surface border border-border px-2 py-1.5 font-mono text-[10px] text-text-secondary focus:outline-none focus:border-text-display"
                />
              </div>
            </div>

            {/* Tag Multi-Select */}
            {tags.length > 0 && (
              <div className="flex flex-col gap-1.5 w-full">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-disabled">Add Tags</span>
                <div className="relative max-w-[200px]">
                  <select
                    value=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      if (!filter.tags.includes(e.target.value)) {
                        onChangeFilter({ ...filter, tags: [...filter.tags, e.target.value] });
                      }
                    }}
                    className="w-full appearance-none bg-surface border border-border pl-3 pr-8 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary focus:outline-none focus:border-text-display cursor-pointer"
                  >
                    <option value="">Select tag...</option>
                    {tags.filter((t) => !filter.tags.includes(t)).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDownIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters - Visual Pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <CircleDotIcon size={10} className="text-accent" />
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-secondary">
              {activeFilters.length} Active Filter{activeFilters.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((af) => (
              <NDTag
                key={af.key}
                label={af.label}
                active
                onRemove={() => removeFilter(af.type, af.label)}
              />
            ))}
            <button 
              onClick={clearAll} 
              className="font-mono text-[10px] text-accent hover:text-text-display transition-colors ml-2"
            >
              [CLEAR ALL]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

