"use client";

import React, { useState, useEffect } from "react";
import type { VaultData, LinkEntity } from "../lib/types";
import { NDModal } from "./NDModal";
import { NDInput } from "./NDInput";
import { NDButton } from "./NDButton";
import { NDTag } from "./NDTag";
import { updateLink, upsertCategory, upsertTag, upsertCollection } from "../lib/db";
import { formatDate } from "../lib/utils";
import { CheckIcon, XIcon, TrashIcon, ExternalLinkIcon, CopyIcon } from "./Icons";
import { fetchMetadata, enrichLinkWithMetadata } from "../lib/metadata";

interface LinkEditViewProps {
  link: LinkEntity | null;
  onClose: () => void;
  data: VaultData;
  onUpdate: (d: VaultData) => void;
  onDelete: (id: string) => void;
}

export function LinkEditView({ link, onClose, data, onUpdate, onDelete }: LinkEditViewProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [collections, setCollections] = useState<string[]>([]);
  const [priority, setPriority] = useState<LinkEntity["priority"]>("medium");
  const [readStatus, setReadStatus] = useState<LinkEntity["readStatus"]>("unread");
  const [favorite, setFavorite] = useState<boolean>(false);
  const [archived, setArchived] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (link) {
      const tagNames = link.tags.map((tid) => data.tags.find((t) => t.id === tid)?.name || tid);
      const catName = data.categories.find((c) => c.id === link.category)?.name || link.category || "";
      const colNames = link.collections.map((cid) => data.collections.find((c) => c.id === cid)?.name || cid);
      setTitle(link.title);
      setDescription(link.description || "");
      setNote(link.note || "");
      setTags(tagNames);
      setCategory(catName);
      setCollections(colNames);
      setPriority(link.priority);
      setReadStatus(link.readStatus);
      setFavorite(link.favorite);
      setArchived(link.archived);
    }
  }, [link, data]);

  if (!link) return null;

  const handleSave = () => {
    let next = data;
    let catId = link.category;
    if (category && category !== data.categories.find((c) => c.id === link.category)?.name) {
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

    const updated = updateLink(next, link.id, {
      title,
      description: description || undefined,
      note: note || undefined,
      tags: tagIds,
      category: catId || undefined,
      collections: colIds,
      priority,
      readStatus,
      favorite,
      archived,
    });

    onUpdate(updated);
    onClose();
  };

  const handleRefreshMeta = async () => {
    setRefreshing(true);
    const meta = await fetchMetadata(link.url, data.settings.metadataFetchTimeout);
    let next = data;
    const patch = enrichLinkWithMetadata(link, meta);
    if (patch.title && !title) setTitle(patch.title);
    if (patch.description && !description) setDescription(patch.description);
    setRefreshing(false);
  };

  const handleOpen = () => {
    window.open(link.url, "_blank");
    const updated = updateLink(data, link.id, {
      openCount: link.openCount + 1,
      lastOpenedAt: new Date().toISOString(),
    });
    onUpdate(updated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link.url);
  };

  return (
    <NDModal open={!!link} onClose={onClose} title="Edit Link" maxWidth="600px">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <NDButton size="sm" variant="secondary" onClick={handleOpen}>
            <ExternalLinkIcon size={14} /> Open
          </NDButton>
          <NDButton size="sm" variant="secondary" onClick={handleCopy}>
            <CopyIcon size={14} /> Copy URL
          </NDButton>
          <NDButton size="sm" variant="secondary" onClick={handleRefreshMeta} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh Metadata"}
          </NDButton>
          <NDButton size="sm" variant="destructive" onClick={() => { onDelete(link.id); onClose(); }}>
            <TrashIcon size={14} /> Delete
          </NDButton>
        </div>

        <NDInput label="Title" value={title} onChange={setTitle} />
        <NDInput label="Description" value={description} onChange={setDescription} type="textarea" />
        <NDInput label="Personal Note" value={note} onChange={setNote} type="textarea" />
        <NDInput label="URL" value={link.url} onChange={() => {}} disabled />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary block mb-1">Priority</label>
            <div className="flex gap-2 flex-wrap">
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
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary block mb-1">Read Status</label>
            <div className="flex gap-2 flex-wrap">
              {(["unread", "reading", "read"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setReadStatus(s)}
                  className={`font-mono text-[11px] uppercase tracking-[0.06em] px-3 py-1.5 rounded-full border transition-colors ${readStatus === s ? "bg-text-display text-black border-text-display" : "border-border-visible text-text-secondary hover:text-text-primary"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFavorite(!favorite)}
            className={`font-mono text-[11px] uppercase tracking-[0.06em] px-3 py-1.5 rounded-full border transition-colors ${favorite ? "bg-accent text-white border-accent" : "border-border-visible text-text-secondary"}`}
          >
            Favorite
          </button>
          <button
            onClick={() => setArchived(!archived)}
            className={`font-mono text-[11px] uppercase tracking-[0.06em] px-3 py-1.5 rounded-full border transition-colors ${archived ? "bg-text-secondary text-black border-text-secondary" : "border-border-visible text-text-secondary"}`}
          >
            Archived
          </button>
        </div>

        <NDInput label="Category" value={category} onChange={setCategory} />
        <NDInput
          label="Tags"
          value={tags.join(", ")}
          onChange={(v) => setTags(v.split(",").map((t) => t.trim()).filter(Boolean))}
        />
        <NDInput
          label="Collections"
          value={collections.join(", ")}
          onChange={(v) => setCollections(v.split(",").map((t) => t.trim()).filter(Boolean))}
        />

        <div className="flex items-center gap-2 text-text-disabled font-mono text-[10px]">
          <span>Created {formatDate(link.createdAt)}</span>
          <span>|</span>
          <span>Updated {formatDate(link.updatedAt)}</span>
          <span>|</span>
          <span>Opened {link.openCount} times</span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <NDButton variant="primary" onClick={handleSave}>
            <CheckIcon size={16} /> Save Changes
          </NDButton>
          <NDButton variant="ghost" onClick={onClose}>
            <XIcon size={16} /> Cancel
          </NDButton>
        </div>
      </div>
    </NDModal>
  );
}
