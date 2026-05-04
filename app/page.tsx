"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { RemindersView } from "./components/RemindersView";
import { ActivityLogView } from "./components/ActivityLogView";
import { SmartFiltersView } from "./components/SmartFiltersView";
import { WorkspacesView } from "./components/WorkspacesView";
import { KeyboardShortcutsDialog } from "./components/KeyboardShortcutsDialog";
import { MobileNav } from "./components/MobileNav";
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
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

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

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;
      const key = e.key.toLowerCase();

      // Command palette: Cmd/Ctrl + K
      if (isMod && key === "k" && !isShift) {
        e.preventDefault();
        setCommandOpen((o) => !o);
        return;
      }

      // Keyboard shortcuts dialog: Cmd/Ctrl + /
      if (isMod && key === "/" && !isShift) {
        e.preventDefault();
        setShortcutsOpen((o) => !o);
        return;
      }

      // Capture new link: Cmd/Ctrl + Shift + N (avoid collision with new window)
      if (isMod && isShift && key === "n") {
        e.preventDefault();
        setCaptureOpen(true);
        return;
      }

      // Focus search: Cmd/Ctrl + Shift + F (avoid collision with browser find) or /
      if ((isMod && isShift && key === "f") || (key === "/" && !isMod && !isShift)) {
        // Don't trigger if in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      // Navigation shortcuts Cmd/Ctrl + Shift + 1-8 for views (avoid collision with browser tabs)
      if (isMod && isShift && key >= "1" && key <= "8") {
        e.preventDefault();
        const viewMap: Record<string, ViewType> = {
          "1": "library",
          "2": "inbox",
          "3": "favorites",
          "4": "reading",
          "5": "archived",
          "6": "reminders",
          "7": "analytics",
          "8": "settings",
        };
        const targetView = viewMap[key];
        if (targetView) {
          setView(targetView);
          clearSelection();
          setSelectedLinkId(null);
        }
        return;
      }

      // Escape: close modals and clear selection
      if (key === "escape") {
        if (shortcutsOpen) {
          setShortcutsOpen(false);
          return;
        }
        if (commandOpen) {
          setCommandOpen(false);
          return;
        }
        if (captureOpen) {
          setCaptureOpen(false);
          return;
        }
        if (editingLink) {
          setEditingLink(null);
          return;
        }
        if (selectedIds.size > 0) {
          clearSelection();
          return;
        }
        if (selectedLinkId) {
          setSelectedLinkId(null);
          return;
        }
        return;
      }

      // Don't process link-specific shortcuts if no link selected or in input
      if (!selectedLinkId || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const link = data?.links.find((l) => l.id === selectedLinkId);
      if (!link) return;

      // E: Edit selected link
      if (key === "e" && !isMod) {
        e.preventDefault();
        setEditingLink(link);
        return;
      }

      // F: Toggle favorite
      if (key === "f" && !isMod) {
        e.preventDefault();
        if (data) {
          setData(updateLink(data, link.id, { favorite: !link.favorite }));
        }
        return;
      }

      // A: Toggle archive
      if (key === "a" && !isMod) {
        e.preventDefault();
        if (data) {
          setData(updateLink(data, link.id, { archived: !link.archived }));
        }
        return;
      }

      // R: Toggle read status
      if (key === "r" && !isMod) {
        e.preventDefault();
        if (data) {
          const nextStatus = link.readStatus === "unread" ? "reading" : link.readStatus === "reading" ? "read" : "unread";
          setData(updateLink(data, link.id, { readStatus: nextStatus }));
        }
        return;
      }

      // Enter: Open link
      if (key === "enter" && !isMod) {
        e.preventDefault();
        window.open(link.url, "_blank");
        if (data) {
          setData(updateLink(data, link.id, { openCount: link.openCount + 1, lastOpenedAt: new Date().toISOString() }));
        }
        return;
      }

      // Delete: Delete link
      if ((key === "delete" || key === "backspace") && !isMod) {
        e.preventDefault();
        if (data && confirm("Delete this link?")) {
          setData(deleteLink(data, link.id));
          setSelectedLinkId(null);
        }
        return;
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [commandOpen, shortcutsOpen, captureOpen, editingLink, selectedLinkId, selectedIds, data, setData, setView, clearSelection]);

  const counts = {
    library: data?.links.filter((l) => !l.archived).length || 0,
    inbox: data?.links.filter((l) => !l.category && !l.archived).length || 0,
    favorites: data?.links.filter((l) => l.favorite && !l.archived).length || 0,
    reading: data?.links.filter((l) => l.readStatus === "reading" && !l.archived).length || 0,
    archived: data?.links.filter((l) => l.archived).length || 0,
    reminders: data?.links.reduce((acc, l) => acc + l.reminders.filter((r) => !r.completed && (!r.snoozedUntil || new Date(r.snoozedUntil) <= new Date())).length, 0) || 0,
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
      <MobileNav
        view={view}
        onChangeView={navigate}
        onOpenCapture={() => setCaptureOpen(true)}
        onOpenCommand={() => setCommandOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        counts={counts}
      />

      <Sidebar
        view={view}
        onChangeView={navigate}
        onOpenCapture={() => setCaptureOpen(true)}
        onOpenCommand={() => setCommandOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        counts={counts}
      />

      <div className="flex-1 flex flex-col overflow-hidden pt-[60px] md:pt-0 pb-[64px] md:pb-0">
        {view === "library" && (
          <LibraryView
            ref={searchRef}
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
            ref={searchRef}
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
            ref={searchRef}
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
            ref={searchRef}
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
            ref={searchRef}
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
        {view === "reminders" && <RemindersView data={data} onUpdate={setData} onOpenLink={handleOpenLink} onEditLink={setEditingLink} />}
        {view === "activity" && <ActivityLogView data={data} />}
        {view === "filters" && <SmartFiltersView data={data} onUpdate={setData} onApplyFilter={(f, s) => { setFilter(f); setSort(s); setView("library"); }} />}
        {view === "workspaces" && <WorkspacesView data={data} onUpdate={setData} onEditLink={setEditingLink} />}
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
      <KeyboardShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </main>
  );
}
