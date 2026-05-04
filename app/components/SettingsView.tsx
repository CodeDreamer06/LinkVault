"use client";

import React from "react";
import type { VaultData } from "../lib/types";
import { NDInput } from "./NDInput";
import { NDButton } from "./NDButton";
import { SunIcon, MoonIcon, DownloadIcon, UploadIcon, LinkIcon } from "./Icons";
import { exportVault, importVault, createLink, upsertCategory, upsertCollection } from "../lib/db";
import { downloadFile, readFileAsText, exportLinksToCSV, parseBookmarkHTML, normalizeUrl, extractDomain } from "../lib/utils";

interface SettingsViewProps {
  data: VaultData;
  onUpdate: (d: VaultData) => void;
}

export function SettingsView({ data, onUpdate }: SettingsViewProps) {
  const handleTheme = (theme: "dark" | "light") => {
    document.documentElement.setAttribute("data-theme", theme);
    onUpdate({ ...data, settings: { ...data.settings, theme } });
  };

  const handleExport = () => {
    const json = exportVault(data, false);
    const filename = `linkvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(json, filename, "application/json");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await readFileAsText(file);
    const { data: next, errors } = importVault(data, text, "merge");
    if (errors.length > 0) {
      alert(`Import completed with ${errors.length} errors. Check console for details.`);
      console.error("Import errors:", errors);
    } else {
      alert("Import successful!");
    }
    onUpdate(next);
  };

  const handleExportCSV = () => {
    const csv = exportLinksToCSV(
      data.links.map((l) => ({
        title: l.title,
        url: l.url,
        description: l.description,
        tags: l.tags.map((tid) => data.tags.find((t) => t.id === tid)?.name || tid),
        category: data.categories.find((c) => c.id === l.category)?.name,
        createdAt: l.createdAt,
      }))
    );
    const filename = `linkvault-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadFile(csv, filename, "text/csv");
  };

  const handleImportBookmarks = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await readFileAsText(file);
    const bookmarks = parseBookmarkHTML(text);
    let next = data;
    let imported = 0;
    for (const bm of bookmarks) {
      const normalized = normalizeUrl(bm.url);
      const dup = next.links.find((l) => l.normalizedUrl === normalized);
      if (dup) continue;
      let catId: string | undefined;
      if (bm.folder) {
        const [d, id] = upsertCategory(next, bm.folder);
        next = d;
        catId = id;
      }
      const colIds: string[] = [];
      if (bm.folder) {
        const [d, id] = upsertCollection(next, bm.folder);
        next = d;
        colIds.push(id);
      }
      next = createLink(next, {
        url: normalized,
        normalizedUrl: normalized,
        originalUrl: bm.url,
        domain: extractDomain(normalized),
        hostname: new URL(normalized).hostname,
        title: bm.title || normalized,
        description: undefined,
        note: undefined,
        tags: [],
        category: catId,
        collections: colIds,
        contentType: "article",
        openCount: 0,
        archived: false,
        favorite: false,
        readStatus: "unread",
        health: "active",
        reminders: [],
        priority: "medium",
        confidence: 0,
        aiEnriched: false,
      });
      imported++;
    }
    onUpdate(next);
    alert(`Imported ${imported} bookmarks`);
  };

  const handleAIChange = (field: keyof typeof data.aiSettings, value: unknown) => {
    onUpdate({ ...data, aiSettings: { ...data.aiSettings, [field]: value } });
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-2xl">
      <div>
        <h2 className="font-sans text-[24px] tracking-tight text-text-display">Settings</h2>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-1">Preferences and configuration</p>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">Appearance</h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleTheme("dark")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-[13px] uppercase tracking-[0.06em] transition-colors ${data.settings.theme === "dark" ? "bg-text-display text-black border-text-display" : "border-border-visible text-text-secondary"}`}
          >
            <MoonIcon size={16} /> Dark
          </button>
          <button
            onClick={() => handleTheme("light")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-[13px] uppercase tracking-[0.06em] transition-colors ${data.settings.theme === "light" ? "bg-text-display text-black border-text-display" : "border-border-visible text-text-secondary"}`}
          >
            <SunIcon size={16} /> Light
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">Data</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <NDButton variant="secondary" onClick={handleExport}>
            <DownloadIcon size={16} /> Export JSON
          </NDButton>
          <label className="cursor-pointer">
            <NDButton variant="secondary" onClick={() => {}}>
              <UploadIcon size={16} /> Import JSON
            </NDButton>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <NDButton variant="secondary" onClick={handleExportCSV}>
            <DownloadIcon size={16} /> Export CSV
          </NDButton>
          <label className="cursor-pointer">
            <NDButton variant="secondary" onClick={() => {}}>
              <LinkIcon size={16} /> Import Bookmarks
            </NDButton>
            <input type="file" accept=".html" onChange={handleImportBookmarks} className="hidden" />
          </label>
        </div>
        <p className="font-sans text-[13px] text-text-disabled">
          Your data is stored locally in your browser. Export regularly to keep backups.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">AI Configuration (VoidAI)</h3>
        <div className="flex items-center gap-2">
          <label className="font-mono text-[11px] uppercase text-text-secondary">Enable AI</label>
          <button
            onClick={() => handleAIChange("enabled", !data.aiSettings.enabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${data.aiSettings.enabled ? "bg-text-display" : "bg-border-visible"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${data.aiSettings.enabled ? "translate-x-5" : ""}`} />
          </button>
        </div>
        <NDInput label="Base URL" value={data.aiSettings.baseUrl} onChange={(v) => handleAIChange("baseUrl", v)} placeholder="https://api.openai.com/v1" />
        <NDInput label="API Key" value={data.aiSettings.apiKey} onChange={(v) => handleAIChange("apiKey", v)} type="password" placeholder="sk-..." />
        <NDInput label="Model" value={data.aiSettings.model} onChange={(v) => handleAIChange("model", v)} placeholder="gpt-4o-mini" />
        <div className="flex items-center gap-2">
          <label className="font-mono text-[11px] uppercase text-text-secondary">Auto-enrich on capture</label>
          <button
            onClick={() => handleAIChange("autoEnrich", !data.aiSettings.autoEnrich)}
            className={`relative w-11 h-6 rounded-full transition-colors ${data.aiSettings.autoEnrich ? "bg-text-display" : "bg-border-visible"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${data.aiSettings.autoEnrich ? "translate-x-5" : ""}`} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-mono text-[11px] uppercase text-text-secondary">Privacy mode</label>
          <select
            value={data.aiSettings.privacyMode}
            onChange={(e) => handleAIChange("privacyMode", e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase text-text-secondary"
          >
            <option value="strict">Strict</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">Danger Zone</h3>
        <NDButton
          variant="destructive"
          onClick={() => {
            if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
              localStorage.removeItem("linkvault_v2");
              window.location.reload();
            }
          }}
        >
          Clear All Data
        </NDButton>
      </section>
    </div>
  );
}
