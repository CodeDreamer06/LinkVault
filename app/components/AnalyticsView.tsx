"use client";

import React, { useMemo } from "react";
import type { VaultData, LinkEntity } from "../lib/types";
import { formatNumber, groupBy } from "../lib/utils";
import { NDSegmentedProgress } from "./NDSegmentedProgress";
import { NDEmptyState } from "./NDEmptyState";

interface AnalyticsViewProps {
  data: VaultData;
}

function StatCard({ label, value, unit, color = "neutral" }: { label: string; value: string | number; unit?: string; color?: "neutral" | "success" | "warning" | "accent" }) {
  const colorCls = {
    neutral: "text-text-display",
    success: "text-success",
    warning: "text-warning",
    accent: "text-accent",
  }[color];

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary block mb-3">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`font-display text-[48px] leading-none tracking-tight ${colorCls}`}>{value}</span>
        {unit && <span className="font-mono text-[11px] text-text-disabled uppercase tracking-[0.06em]">{unit}</span>}
      </div>
    </div>
  );
}

export function AnalyticsView({ data }: AnalyticsViewProps) {
  const stats = useMemo(() => {
    const links = data.links;
    const total = links.length;
    const archived = links.filter((l) => l.archived).length;
    const favorites = links.filter((l) => l.favorite).length;
    const unread = links.filter((l) => l.readStatus === "unread").length;
    const reading = links.filter((l) => l.readStatus === "reading").length;
    const read = links.filter((l) => l.readStatus === "read").length;
    const aiEnriched = links.filter((l) => l.aiEnriched).length;
    const neverOpened = links.filter((l) => l.openCount === 0).length;
    const broken = links.filter((l) => l.health === "broken").length;

    const tagCounts = new Map<string, number>();
    for (const link of links) {
      for (const tagId of link.tags) {
        const tagName = data.tags.find((t) => t.id === tagId)?.name || tagId;
        tagCounts.set(tagName, (tagCounts.get(tagName) || 0) + 1);
      }
    }
    const topTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const domainCounts = new Map<string, number>();
    for (const link of links) {
      domainCounts.set(link.domain, (domainCounts.get(link.domain) || 0) + 1);
    }
    const topDomains = Array.from(domainCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const catCounts = new Map<string, number>();
    for (const link of links) {
      if (link.category) {
        const catName = data.categories.find((c) => c.id === link.category)?.name || link.category;
        catCounts.set(catName, (catCounts.get(catName) || 0) + 1);
      }
    }

    return { total, archived, favorites, unread, reading, read, aiEnriched, neverOpened, broken, topTags, topDomains, catCounts };
  }, [data]);

  if (data.links.length === 0) {
    return (
      <NDEmptyState
        title="No data yet"
        description="Save some links to see analytics about your vault."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h2 className="font-sans text-[24px] tracking-tight text-text-display">Analytics</h2>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-1">Vault health and usage</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Links" value={formatNumber(stats.total)} />
        <StatCard label="Favorites" value={formatNumber(stats.favorites)} color="success" />
        <StatCard label="Unread" value={formatNumber(stats.unread)} color="warning" />
        <StatCard label="Archived" value={formatNumber(stats.archived)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary block mb-4">Read Status</span>
          <div className="flex flex-col gap-3">
            <NDSegmentedProgress value={stats.read} max={stats.total} label="Read" color="success" />
            <NDSegmentedProgress value={stats.reading} max={stats.total} label="Reading" color="warning" />
            <NDSegmentedProgress value={stats.unread} max={stats.total} label="Unread" color="neutral" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary block mb-4">Vault Quality</span>
          <div className="flex flex-col gap-3">
            <NDSegmentedProgress value={stats.aiEnriched} max={stats.total} label="AI Enriched" color="success" />
            <NDSegmentedProgress value={stats.neverOpened} max={stats.total} label="Never Opened" color="warning" />
            <NDSegmentedProgress value={stats.broken} max={stats.total} label="Broken Links" color="accent" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary block mb-4">Top Tags</span>
          <div className="flex flex-col gap-2">
            {stats.topTags.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="font-sans text-[13px] text-text-primary">{name}</span>
                <span className="font-mono text-[12px] text-text-secondary">{count}</span>
              </div>
            ))}
            {stats.topTags.length === 0 && <span className="text-text-disabled text-[13px]">No tags yet</span>}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary block mb-4">Top Domains</span>
          <div className="flex flex-col gap-2">
            {stats.topDomains.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="font-sans text-[13px] text-text-primary truncate max-w-[200px]">{name}</span>
                <span className="font-mono text-[12px] text-text-secondary">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary block mb-4">Categories</span>
          <div className="flex flex-col gap-2">
            {Array.from(stats.catCounts.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="font-sans text-[13px] text-text-primary">{name}</span>
                <span className="font-mono text-[12px] text-text-secondary">{count}</span>
              </div>
            ))}
            {stats.catCounts.size === 0 && <span className="text-text-disabled text-[13px]">No categories yet</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
