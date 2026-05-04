"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useVault, useViewState } from "./hooks/useVault";
import { Sidebar } from "./components/Sidebar";
import { LibraryView } from "./components/LibraryView";
import { CaptureView } from "./components/CaptureView";
import { LinkEditView } from "./components/LinkEditView";
import { CommandPalette } from "./components/CommandPalette";
import { AnalyticsView } from "./components/AnalyticsView";
import { SettingsView } from "./components/SettingsView";
import { MaintenanceView } from "./components/MaintenanceView";
import { TagsView, CategoriesView, CollectionsView, DomainsView } from "./components/OrganizationViews";
import { updateLink, deleteLink } from "./lib/db";
import type { LinkEntity, ViewType } from "./lib/types";

export default function Home() {
  const { data, ready, setData } = useVault();
  const {
    view,
    setView,
    filter,
    setFilter,
    sort,
    setSort,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
  } = useViewState();

  const [captureOpen, setCaptureOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkEntity | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    if (!ready || !data) return;
    const theme = data.settings.theme;
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [ready, data?.settings.theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const counts = {
    library: data?.links.filter((l) => !l.archived).length || 0,
    inbox: data?.links.filter((l) => !l.category && !l.archived).length || 0,
    favorites: data?.links.filter((l) => l.favorite && !l.archived).length || 0,
    reading: data?.links.filter((l) => l.readStatus === "reading" && !l.archived).length || 0,
    archived: data?.links.filter((l) => l.archived).length || 0,
  };

  const handleOpenLink = useCallback(
    (link: LinkEntity) => {
      if (!data) return;
      window.open(link.url, "_blank");
      setData(updateLink(data, link.id, { openCount: link.openCount + 1, lastOpenedAt: new Date().toISOString() }));
    },
    [data, setData]
  );

  const handleDeleteLink = useCallback(
    (id: string) => {
      if (!data) return;
      if (!confirm("Delete this link?")) return;
      setData(deleteLink(data, id));
    },
    [data, setData]
  );

  const navigate = useCallback(
    (v: ViewType) => {
      setView(v);
      clearSelection();
    },
    [setView, clearSelection]
  );

  const handleFilterByTag = useCallback(
    (tag: string) => {
      setFilter({ query: "", tags: [tag] });
      setView("library");
    },
    [setFilter, setView]
  );

  const handleFilterByCategory = useCallback(
    (cat: string) => {
      setFilter({ query: "", tags: [], category: cat });
      setView("library");
    },
    [setFilter, setView]
  );

  const handleFilterByCollection = useCallback(
    (col: string) => {
      setFilter({ query: "", tags: [], collection: col });
      setView("library");
    },
    [setFilter, setView]
  );

  if (!ready || !data) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="dot-grid w-8 h-8" />
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-secondary">[LOADING]</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex">
      <Sidebar
        view={view}
        onChangeView={navigate}
        onOpenCapture={() => setCaptureOpen(true)}
        onOpenCommand={() => setCommandOpen(true)}
        counts={counts}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {view === "library" && (
          <LibraryView
            data={data}
            onUpdate={setData}
            filter={filter}
            sort={sort}
            onChangeFilter={setFilter}
            onChangeSort={setSort}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onOpenCapture={() => setCaptureOpen(true)}
            onEditLink={setEditingLink}
          />
        )}
        {view === "inbox" && (
          <LibraryView
            data={data}
            onUpdate={setData}
            filter={{ ...filter, query: "", category: undefined }}
            sort={sort}
            onChangeFilter={setFilter}
            onChangeSort={setSort}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onOpenCapture={() => setCaptureOpen(true)}
            onEditLink={setEditingLink}
            title="Inbox"
            subtitle="Uncategorized links"
            prefiltered={data.links.filter((l) => !l.category && !l.archived).map((l) => l.id)}
          />
        )}
        {view === "favorites" && (
          <LibraryView
            data={data}
            onUpdate={setData}
            filter={{ ...filter, query: "" }}
            sort={sort}
            onChangeFilter={setFilter}
            onChangeSort={setSort}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onOpenCapture={() => setCaptureOpen(true)}
            onEditLink={setEditingLink}
            title="Favorites"
            subtitle="Pinned links"
            prefiltered={data.links.filter((l) => l.favorite && !l.archived).map((l) => l.id)}
          />
        )}
        {view === "reading" && (
          <LibraryView
            data={data}
            onUpdate={setData}
            filter={{ ...filter, query: "" }}
            sort={sort}
            onChangeFilter={setFilter}
            onChangeSort={setSort}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onOpenCapture={() => setCaptureOpen(true)}
            onEditLink={setEditingLink}
            title="Reading List"
            subtitle="Links marked as reading"
            prefiltered={data.links.filter((l) => l.readStatus === "reading" && !l.archived).map((l) => l.id)}
          />
        )}
        {view === "archived" && (
          <LibraryView
            data={data}
            onUpdate={setData}
            filter={{ ...filter, query: "" }}
            sort={sort}
            onChangeFilter={setFilter}
            onChangeSort={setSort}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onOpenCapture={() => setCaptureOpen(true)}
            onEditLink={setEditingLink}
            title="Archived"
            subtitle="Archived links"
            prefiltered={data.links.filter((l) => l.archived).map((l) => l.id)}
          />
        )}
        {view === "analytics" && <AnalyticsView data={data} />}
        {view === "settings" && <SettingsView data={data} onUpdate={setData} />}
        {view === "maintenance" && <MaintenanceView data={data} onUpdate={setData} />}
        {view === "tags" && <TagsView data={data} onUpdate={setData} onFilterByTag={handleFilterByTag} />}
        {view === "categories" && <CategoriesView data={data} onUpdate={setData} onFilterByCategory={handleFilterByCategory} />}
        {view === "collections" && <CollectionsView data={data} onUpdate={setData} onFilterByCollection={handleFilterByCollection} />}
        {view === "domains" && <DomainsView data={data} onUpdate={setData} />}
      </div>

      <CaptureView open={captureOpen} onClose={() => setCaptureOpen(false)} data={data} onUpdate={setData} />
      <LinkEditView link={editingLink} onClose={() => setEditingLink(null)} data={data} onUpdate={setData} onDelete={handleDeleteLink} />
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        links={data.links}
        onNavigate={navigate}
        onOpenLink={handleOpenLink}
      />
    </main>
  );
}
