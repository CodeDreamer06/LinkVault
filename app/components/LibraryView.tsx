"use client";

import React from "react";
import type { VaultData, FilterState, SortOption, LinkEntity } from "../lib/types";
import { getLinksByFilter, updateLink, bulkUpdateLinks, bulkDeleteLinks } from "../lib/db";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import { LinkCard } from "./LinkCard";
import { BulkActions } from "./BulkActions";
import { NDEmptyState } from "./NDEmptyState";
import { formatNumber } from "../lib/utils";
import { PlusIcon } from "./Icons";

interface LibraryViewProps {
  data: VaultData;
  onUpdate: (d: VaultData) => void;
  filter: FilterState;
  sort: SortOption;
  onChangeFilter: (f: FilterState) => void;
  onChangeSort: (s: SortOption) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onOpenCapture: () => void;
  onEditLink: (link: LinkEntity) => void;
  title?: string;
  subtitle?: string;
  prefiltered?: string[];
}

export function LibraryView({
  data,
  onUpdate,
  filter,
  sort,
  onChangeFilter,
  onChangeSort,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onOpenCapture,
  onEditLink,
  title = "Library",
  subtitle = "All saved links",
  prefiltered,
}: LibraryViewProps) {
  const resolvedFilter: FilterState = {
    ...filter,
    tags: filter.tags.map((name) => data.tags.find((t) => t.name === name)?.id).filter(Boolean) as string[],
    category: data.categories.find((c) => c.name === filter.category)?.id || filter.category,
    collection: data.collections.find((c) => c.name === filter.collection)?.id || filter.collection,
  };
  const links = getLinksByFilter(data, resolvedFilter, sort);
  const visibleLinks = prefiltered ? links.filter((l) => prefiltered.includes(l.id)) : links;

  const categories = data.categories.map((c) => c.name);
  const tags = data.tags.map((t) => t.name);
  const collections = data.collections.map((c) => c.name);
  const domains = Array.from(new Set(data.links.map((l) => l.domain)));

  const handleToggleFavorite = (id: string) => {
    const link = data.links.find((l) => l.id === id);
    if (!link) return;
    onUpdate(updateLink(data, id, { favorite: !link.favorite }));
  };

  const handleToggleArchive = (id: string) => {
    const link = data.links.find((l) => l.id === id);
    if (!link) return;
    onUpdate(updateLink(data, id, { archived: !link.archived }));
  };

  const handleOpen = (link: LinkEntity) => {
    window.open(link.url, "_blank");
    onUpdate(updateLink(data, link.id, { openCount: link.openCount + 1, lastOpenedAt: new Date().toISOString() }));
  };

  const handleBulkArchive = () => {
    onUpdate(bulkUpdateLinks(data, Array.from(selectedIds), { archived: true }));
    onClearSelection();
  };

  const handleBulkUnarchive = () => {
    onUpdate(bulkUpdateLinks(data, Array.from(selectedIds), { archived: false }));
    onClearSelection();
  };

  const handleBulkFavorite = () => {
    onUpdate(bulkUpdateLinks(data, Array.from(selectedIds), { favorite: true }));
    onClearSelection();
  };

  const handleBulkUnfavorite = () => {
    onUpdate(bulkUpdateLinks(data, Array.from(selectedIds), { favorite: false }));
    onClearSelection();
  };

  const handleBulkDelete = () => {
    if (data.settings.confirmDestructive && !confirm(`Delete ${selectedIds.size} links?`)) return;
    onUpdate(bulkDeleteLinks(data, Array.from(selectedIds)));
    onClearSelection();
  };

  const handleBulkTag = (tag: string) => {
    const tagObj = data.tags.find((t) => t.name.toLowerCase() === tag.toLowerCase());
    if (!tagObj) return;
    const next = { ...data };
    for (const link of next.links) {
      if (selectedIds.has(link.id) && !link.tags.includes(tagObj.id)) {
        link.tags = [...link.tags, tagObj.id];
        link.updatedAt = new Date().toISOString();
      }
    }
    onUpdate(next);
    onClearSelection();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-sans text-[24px] tracking-tight text-text-display">{title}</h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-0.5">{subtitle}</p>
          </div>
          <span className="font-mono text-[12px] text-text-disabled">{formatNumber(visibleLinks.length)} links</span>
        </div>

        <SearchBar value={filter.query} onChange={(q) => onChangeFilter({ ...filter, query: q })} />

        <FilterBar
          filter={filter}
          sort={sort}
          onChangeFilter={onChangeFilter}
          onChangeSort={onChangeSort}
          categories={categories}
          tags={tags}
          collections={collections}
          domains={domains}
        />

        <BulkActions
          selectedCount={selectedIds.size}
          onArchive={handleBulkArchive}
          onUnarchive={handleBulkUnarchive}
          onFavorite={handleBulkFavorite}
          onUnfavorite={handleBulkUnfavorite}
          onDelete={handleBulkDelete}
          onTag={handleBulkTag}
          onRemoveTag={() => {}}
          onClear={onClearSelection}
          availableTags={tags.slice(0, 10)}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {visibleLinks.length === 0 ? (
          <NDEmptyState
            title="No links found"
            description="Try adjusting your filters or capture a new link."
            action={
              <button
                onClick={onOpenCapture}
                className="flex items-center gap-2 bg-text-display text-black font-mono uppercase text-[13px] tracking-[0.06em] rounded-full px-5 py-2.5 hover:opacity-90 transition-opacity"
              >
                <PlusIcon size={16} /> Capture Link
              </button>
            }
          />
        ) : (
          <div className="flex flex-col">
            {visibleLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                selected={selectedIds.has(link.id)}
                onSelect={() => onToggleSelect(link.id)}
                onOpen={() => handleOpen(link)}
                onEdit={() => onEditLink(link)}
                onToggleFavorite={() => handleToggleFavorite(link.id)}
                onToggleArchive={() => handleToggleArchive(link.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
