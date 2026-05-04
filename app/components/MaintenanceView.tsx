"use client";

import React, { useMemo } from "react";
import type { VaultData } from "../lib/types";
import { findDuplicateLinks, bulkUpdateLinks, bulkDeleteLinks } from "../lib/db";
import { NDButton } from "./NDButton";
import { NDSegmentedProgress } from "./NDSegmentedProgress";
import { NDEmptyState } from "./NDEmptyState";
import { TrashIcon, CheckIcon } from "./Icons";

interface MaintenanceViewProps {
  data: VaultData;
  onUpdate: (d: VaultData) => void;
}

export function MaintenanceView({ data, onUpdate }: MaintenanceViewProps) {
  const issues = useMemo(() => {
    const duplicates = findDuplicateLinks(data);
    const broken = data.links.filter((l) => l.health === "broken");
    const noMetadata = data.links.filter((l) => !l.description && !l.title);
    const uncategorized = data.links.filter((l) => !l.category && !l.archived);
    const untagged = data.links.filter((l) => l.tags.length === 0 && !l.archived);
    const orphanTags = data.tags.filter((t) => !data.links.some((l) => l.tags.includes(t.id)));
    const emptyCats = data.categories.filter((c) => !data.links.some((l) => l.category === c.id));
    return { duplicates, broken, noMetadata, uncategorized, untagged, orphanTags, emptyCats };
  }, [data]);

  const totalIssues =
    issues.duplicates.length +
    issues.broken.length +
    issues.noMetadata.length +
    issues.uncategorized.length +
    issues.untagged.length +
    issues.orphanTags.length +
    issues.emptyCats.length;

  const markAllBrokenAsArchived = () => {
    const ids = issues.broken.map((l) => l.id);
    if (ids.length === 0) return;
    onUpdate(bulkUpdateLinks(data, ids, { archived: true }));
  };

  const deleteDuplicates = () => {
    const toDelete = issues.duplicates.map(([, second]) => second.id);
    if (toDelete.length === 0) return;
    onUpdate(bulkDeleteLinks(data, toDelete));
  };

  const deleteOrphanTags = () => {
    const ids = issues.orphanTags.map((t) => t.id);
    let next = data;
    for (const id of ids) {
      next = { ...next, tags: next.tags.filter((t) => t.id !== id) };
    }
    onUpdate(next);
  };

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h2 className="font-sans text-[24px] tracking-tight text-text-display">Maintenance</h2>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-1">Vault health and cleanup</p>
      </div>

      {totalIssues === 0 ? (
        <NDEmptyState title="Vault is healthy" description="No issues detected. Great job keeping things tidy." />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-xl p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary block mb-4">Issue Summary</span>
            <NDSegmentedProgress
              value={data.links.length - totalIssues}
              max={data.links.length}
              label="Healthy links"
              color="success"
            />
          </div>

          {issues.duplicates.length > 0 && (
            <IssueSection
              label="Duplicate Links"
              count={issues.duplicates.length}
              action={
                <NDButton size="sm" variant="destructive" onClick={deleteDuplicates}>
                  <TrashIcon size={14} /> Remove Duplicates
                </NDButton>
              }
            >
              <div className="flex flex-col gap-2 mt-2">
                {issues.duplicates.map(([first, second], i) => (
                  <div key={i} className="font-sans text-[13px] text-text-secondary border-b border-border pb-2">
                    <span className="text-text-primary">{first.title}</span>
                    <span className="mx-2 text-text-disabled">=</span>
                    <span className="text-text-primary">{second.title}</span>
                  </div>
                ))}
              </div>
            </IssueSection>
          )}

          {issues.broken.length > 0 && (
            <IssueSection
              label="Broken Links"
              count={issues.broken.length}
              action={
                <NDButton size="sm" variant="secondary" onClick={markAllBrokenAsArchived}>
                  <CheckIcon size={14} /> Archive All
                </NDButton>
              }
            >
              <div className="flex flex-col gap-2 mt-2">
                {issues.broken.map((l) => (
                  <div key={l.id} className="font-sans text-[13px] text-text-secondary">
                    {l.title} <span className="text-text-disabled">{l.domain}</span>
                  </div>
                ))}
              </div>
            </IssueSection>
          )}

          {issues.noMetadata.length > 0 && (
            <IssueSection label="Missing Metadata" count={issues.noMetadata.length}>
              <p className="font-sans text-[13px] text-text-secondary mt-2">
                {issues.noMetadata.length} links are missing titles or descriptions. Use the refresh metadata action on individual links.
              </p>
            </IssueSection>
          )}

          {issues.uncategorized.length > 0 && (
            <IssueSection label="Uncategorized Links" count={issues.uncategorized.length}>
              <p className="font-sans text-[13px] text-text-secondary mt-2">
                {issues.uncategorized.length} active links have no category assigned.
              </p>
            </IssueSection>
          )}

          {issues.untagged.length > 0 && (
            <IssueSection label="Untagged Links" count={issues.untagged.length}>
              <p className="font-sans text-[13px] text-text-secondary mt-2">
                {issues.untagged.length} active links have no tags.
              </p>
            </IssueSection>
          )}

          {issues.orphanTags.length > 0 && (
            <IssueSection
              label="Orphan Tags"
              count={issues.orphanTags.length}
              action={
                <NDButton size="sm" variant="destructive" onClick={deleteOrphanTags}>
                  <TrashIcon size={14} /> Delete Orphans
                </NDButton>
              }
            >
              <div className="flex flex-wrap gap-2 mt-2">
                {issues.orphanTags.map((t) => (
                  <span key={t.id} className="font-mono text-[11px] border border-border px-2 py-1 rounded-full text-text-secondary">{t.name}</span>
                ))}
              </div>
            </IssueSection>
          )}
        </div>
      )}
    </div>
  );
}

function IssueSection({ label, count, action, children }: { label: string; count: number; action?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display text-[36px] leading-none text-accent">{count}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">{label}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
