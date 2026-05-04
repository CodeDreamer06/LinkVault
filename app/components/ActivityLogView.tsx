"use client";

import React, { useMemo } from "react";
import type { VaultData } from "../lib/types";
import { NDEmptyState } from "./NDEmptyState";
import { NDTable } from "./NDTable";
import { formatRelativeTime } from "../lib/utils";

interface ActivityLogViewProps {
  data: VaultData;
}

export function ActivityLogView({ data }: ActivityLogViewProps) {
  const entries = useMemo(() => {
    return [...data.activityLog].slice(0, 200);
  }, [data.activityLog]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col gap-8 p-6">
        <div>
          <h2 className="font-sans text-[24px] tracking-tight text-text-display">Activity Log</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-1">Recent vault operations</p>
        </div>
        <NDEmptyState title="No activity yet" description="Actions you take will appear here." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-sans text-[24px] tracking-tight text-text-display">Activity Log</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-1">Recent vault operations</p>
        </div>
        <span className="font-mono text-[11px] text-text-disabled">{entries.length} entries</span>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 overflow-hidden">
        <NDTable
          columns={[
            {
              key: "action",
              header: "Action",
              render: (row) => (
                <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-text-primary">
                  {row.action}
                </span>
              ),
            },
            {
              key: "entity",
              header: "Entity",
              render: (row) => (
                <span className="font-mono text-[12px] text-text-secondary">
                  {row.entityType}
                </span>
              ),
            },
            {
              key: "details",
              header: "Details",
              render: (row) => (
                <span className="font-sans text-[13px] text-text-secondary truncate max-w-[300px] block">
                  {row.details || "—"}
                </span>
              ),
            },
            {
              key: "time",
              header: "Time",
              align: "right",
              render: (row) => (
                <span className="font-mono text-[11px] text-text-disabled">
                  {formatRelativeTime(row.timestamp)}
                </span>
              ),
            },
          ]}
          data={entries}
          keyExtractor={(row) => row.id}
        />
      </div>
    </div>
  );
}
