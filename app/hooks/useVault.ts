"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { VaultData, LinkEntity, FilterState, SortOption, ViewType } from "../lib/types";
import { loadVault, saveVault } from "../lib/db";

export function useVault() {
  const [data, setData] = useState<VaultData | null>(null);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const vault = loadVault();
    setData(vault);
    setReady(true);
  }, []);

  const persist = useCallback(
    (next: VaultData) => {
      setData(next);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveVault(next), 300);
    },
    []
  );

  const mutate = useCallback(
    (updater: (draft: VaultData) => VaultData) => {
      if (!data) return;
      persist(updater(data));
    },
    [data, persist]
  );

  return { data, ready, setData: persist, mutate };
}

export function useViewState() {
  const [view, setView] = useState<ViewType>("library");
  const [filter, setFilter] = useState<FilterState>({
    query: "",
    tags: [],
  });
  const [sort, setSort] = useState<SortOption>("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
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
  };
}
