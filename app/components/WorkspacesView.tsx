"use client";

import React, { useState } from "react";
import type { VaultData, Workspace, LinkEntity } from "../lib/types";
import { NDEmptyState } from "./NDEmptyState";
import { NDButton } from "./NDButton";
import { NDInput } from "./NDInput";
import { TrashIcon, PlusIcon, LinkIcon } from "./Icons";
import { generateId } from "../lib/utils";
import { updateLink } from "../lib/db";

interface WorkspacesViewProps {
  data: VaultData;
  onUpdate: (d: VaultData) => void;
  onEditLink?: (link: LinkEntity) => void;
}

export function WorkspacesView({ data, onUpdate, onEditLink }: WorkspacesViewProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name.trim()) return;
    const ws: Workspace = {
      id: generateId(),
      name: name.trim(),
      description: desc.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    onUpdate({ ...data, workspaces: [...data.workspaces, ws] });
    setName("");
    setDesc("");
    setCreating(false);
  };

  const handleDelete = (id: string) => {
    const workspaces = data.workspaces.filter((w) => w.id !== id);
    const links = data.links.map((l) =>
      l.workspace === id ? { ...l, workspace: undefined, updatedAt: new Date().toISOString() } : l
    );
    onUpdate({ ...data, workspaces, links });
  };

  const workspaceLinks = (wsId: string) => data.links.filter((l) => l.workspace === wsId);

  if (data.workspaces.length === 0 && !creating) {
    return (
      <div className="flex flex-col gap-8 p-6">
        <div>
          <h2 className="font-sans text-[24px] tracking-tight text-text-display">Workspaces</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-1">Project-based link groupings</p>
        </div>
        <NDEmptyState title="No workspaces" description="Create workspaces to organize links by initiative or project." />
        <div>
          <NDButton variant="primary" onClick={() => setCreating(true)}>
            <PlusIcon size={14} /> Create Workspace
          </NDButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-sans text-[24px] tracking-tight text-text-display">Workspaces</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-1">Project-based link groupings</p>
        </div>
        <NDButton variant="primary" onClick={() => setCreating(true)}>
          <PlusIcon size={14} /> New Workspace
        </NDButton>
      </div>

      {creating && (
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary">New Workspace</span>
          <NDInput label="Name" value={name} onChange={setName} placeholder="e.g. Research Q3" />
          <NDInput label="Description" value={desc} onChange={setDesc} placeholder="Optional context" />
          <div className="flex gap-2">
            <NDButton variant="primary" onClick={handleCreate}>Save</NDButton>
            <NDButton variant="ghost" onClick={() => { setCreating(false); setName(""); setDesc(""); }}>Cancel</NDButton>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {data.workspaces.map((ws) => {
          const links = workspaceLinks(ws.id);
          const isOpen = selectedWorkspace === ws.id;
          return (
            <div key={ws.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-raised transition-colors"
                onClick={() => setSelectedWorkspace(isOpen ? null : ws.id)}
              >
                <div className="min-w-0">
                  <div className="font-sans text-[14px] text-text-primary">{ws.name}</div>
                  {ws.description && (
                    <div className="font-sans text-[13px] text-text-secondary mt-0.5">{ws.description}</div>
                  )}
                  <div className="font-mono text-[10px] text-text-disabled mt-1">{links.length} links</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <NDButton size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(ws.id); }}>
                    <TrashIcon size={14} />
                  </NDButton>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-border px-4 py-3 flex flex-col gap-2">
                  {links.length === 0 ? (
                    <span className="font-sans text-[13px] text-text-disabled">No links assigned to this workspace.</span>
                  ) : (
                    links.map((link) => (
                      <div key={link.id} className="flex items-center justify-between py-1">
                        <button
                          onClick={() => onEditLink?.(link)}
                          className="font-sans text-[13px] text-text-primary truncate text-left hover:underline max-w-[400px]"
                        >
                          {link.title}
                        </button>
                        <span className="font-mono text-[10px] text-text-disabled">{link.domain}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
