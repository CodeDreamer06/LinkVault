"use client";

import React, { useState, useRef, useCallback } from "react";
import type { VaultData, LinkEntity } from "../lib/types";
import { NDModal } from "./NDModal";
import { NDInput } from "./NDInput";
import { NDButton } from "./NDButton";
import { NDTag } from "./NDTag";
import { createLink, upsertCategory, upsertTag, upsertCollection, updateLink } from "../lib/db";
import { fetchMetadata, enrichLinkWithMetadata } from "../lib/metadata";
import { normalizeUrl, extractDomain, isValidUrl } from "../lib/utils";
import { XIcon, CheckIcon, AlertIcon, ClockIcon } from "./Icons";
import { suggestTags, generateSummary, suggestCategory, detectContentType } from "../lib/ai";

interface CaptureViewProps {
  open: boolean;
  onClose: () => void;
  data: VaultData;
  onUpdate: (d: VaultData) => void;
}

export function CaptureView({ open, onClose, data, onUpdate }: CaptureViewProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [collections, setCollections] = useState<string[]>([]);
  const [priority, setPriority] = useState<LinkEntity["priority"]>("medium");
  const [status, setStatus] = useState<"fetching" | "done" | "error" | "idle">("idle");
  const [aiStatus, setAiStatus] = useState<string>("");
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  const reset = useCallback(() => {
    setUrl("");
    setTitle("");
    setDescription("");
    setNote("");
    setTags([]);
    setCategory("");
    setCollections([]);
    setPriority("medium");
    setStatus("idle");
    setAiStatus("");
    setSuggestedTags([]);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFetch = useCallback(async () => {
    if (!isValidUrl(url)) return;
    setStatus("fetching");
    const meta = await fetchMetadata(normalizeUrl(url), data.settings.metadataFetchTimeout);
    if (meta.title) setTitle(meta.title);
    if (meta.description) setDescription(meta.description);
    if (meta.contentType) {
      // map content type string
    }
    setStatus("done");

    // AI enrichment if enabled
    if (data.aiSettings.enabled && data.aiSettings.autoEnrich) {
      setAiStatus("Enriching...");
      const partial: Partial<LinkEntity> = {
        url: normalizeUrl(url),
        title: meta.title || url,
        description: meta.description,
      };

      const [tagsResult, summaryResult, catResult, typeResult] = await Promise.all([
        suggestTags(data.aiSettings, partial as LinkEntity, data.tags.map((t) => t.name)),
        generateSummary(data.aiSettings, partial as LinkEntity),
        suggestCategory(data.aiSettings, partial as LinkEntity, data.categories.map((c) => c.name)),
        detectContentType(data.aiSettings, partial as LinkEntity),
      ]);

      if (tagsResult.length > 0) setSuggestedTags(tagsResult);
      if (summaryResult && !description) setDescription(summaryResult);
      if (catResult) setCategory(catResult);
      setAiStatus("Done");
    }
  }, [url, data, description]);

  const handleSave = useCallback(() => {
    const normalized = normalizeUrl(url);
    if (!isValidUrl(normalized)) return;

    let next = data;
    let catId = category;
    if (category) {
      const [d, id] = upsertCategory(next, category);
      next = d;
      catId = id;
    }
    const tagIds: string[] = [];
    for (const t of tags) {
      const [d, id] = upsertTag(next, t);
      next = d;
      tagIds.push(id);
    }
    const colIds: string[] = [];
    for (const c of collections) {
      const [d, id] = upsertCollection(next, c);
      next = d;
      colIds.push(id);
    }

    const link = createLink(next, {
      url: normalized,
      normalizedUrl: normalized,
      originalUrl: url.trim(),
      domain: extractDomain(normalized),
      hostname: new URL(normalized).hostname,
      title: title || normalized,
      description,
      note,
      tags: tagIds,
      category: catId || undefined,
      collections: colIds,
      contentType: "article",
      openCount: 0,
      archived: false,
      favorite: false,
      readStatus: "unread",
      health: "active",
      reminders: [],
      priority,
      confidence: 0,
      aiEnriched: data.aiSettings.enabled && data.aiSettings.autoEnrich,
    });

    onUpdate(link);
    handleClose();
  }, [url, title, description, note, tags, category, collections, priority, data, onUpdate, handleClose]);

  const canSave = isValidUrl(url);

  return (
    <NDModal open={open} onClose={handleClose} title="Capture Link" maxWidth="560px">
      <div className="flex flex-col gap-4">
        <NDInput
          label="URL"
          value={url}
          onChange={setUrl}
          placeholder="https://example.com"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && isValidUrl(url)) handleFetch();
          }}
        />

        {status === "fetching" && (
          <p className="font-mono text-[11px] text-text-secondary">[FETCHING METADATA...]</p>
        )}
        {aiStatus && (
          <p className="font-mono text-[11px] text-text-secondary">[{aiStatus.toUpperCase()}]</p>
        )}

        <NDInput label="Title" value={title} onChange={setTitle} placeholder="Page title" />
        <NDInput label="Description" value={description} onChange={setDescription} placeholder="Brief description" type="textarea" />
        <NDInput label="Personal Note" value={note} onChange={setNote} placeholder="Why this matters to you" type="textarea" />

        <div>
          <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary block mb-1">Priority</label>
          <div className="flex gap-2">
            {(["low", "medium", "high", "urgent"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`font-mono text-[11px] uppercase tracking-[0.06em] px-3 py-1.5 rounded-full border transition-colors ${priority === p ? "bg-text-display text-black border-text-display" : "border-border-visible text-text-secondary hover:text-text-primary"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <NDInput label="Category" value={category} onChange={setCategory} placeholder="e.g. Design, Research" />
        <NDInput
          label="Tags (comma separated)"
          value={tags.join(", ")}
          onChange={(v) => setTags(v.split(",").map((t) => t.trim()).filter(Boolean))}
          placeholder="ai, tutorial, reference"
        />

        {suggestedTags.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase text-text-disabled">Suggested tags:</span>
            <div className="flex gap-2 flex-wrap">
              {suggestedTags.map((t) => (
                <NDTag key={t} label={t} onClick={() => { if (!tags.includes(t)) setTags([...tags, t]); }} />
              ))}
            </div>
          </div>
        )}

        <NDInput
          label="Collections (comma separated)"
          value={collections.join(", ")}
          onChange={(v) => setCollections(v.split(",").map((t) => t.trim()).filter(Boolean))}
          placeholder="Project X, Reading List"
        />

        <div className="flex items-center gap-3 mt-2">
          <NDButton variant="primary" onClick={handleSave} disabled={!canSave}>
            <CheckIcon size={16} /> Save Link
          </NDButton>
          <NDButton variant="secondary" onClick={handleFetch} disabled={!isValidUrl(url)}>
            <ClockIcon size={16} /> Fetch Metadata
          </NDButton>
          <NDButton variant="ghost" onClick={handleClose}>
            <XIcon size={16} /> Cancel
          </NDButton>
        </div>
      </div>
    </NDModal>
  );
}
