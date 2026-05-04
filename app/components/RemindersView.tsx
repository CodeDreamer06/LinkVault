"use client";

import React, { useMemo, useState } from "react";
import type { VaultData, LinkEntity, LinkReminder } from "../lib/types";
import { updateLink } from "../lib/db";
import { NDEmptyState } from "./NDEmptyState";
import { NDButton } from "./NDButton";
import { NDToggle } from "./NDToggle";
import { formatDate, formatRelativeTime } from "../lib/utils";
import { CheckIcon, ExternalLinkIcon, TrashIcon } from "./Icons";

interface RemindersViewProps {
  data: VaultData;
  onUpdate: (d: VaultData) => void;
  onOpenLink?: (link: LinkEntity) => void;
  onEditLink?: (link: LinkEntity) => void;
}

export function RemindersView({ data, onUpdate, onOpenLink, onEditLink }: RemindersViewProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  const reminders = useMemo(() => {
    const list: { link: LinkEntity; reminder: LinkReminder }[] = [];
    for (const link of data.links) {
      for (const r of link.reminders) {
        if (!showCompleted && r.completed) continue;
        if (r.snoozedUntil && new Date(r.snoozedUntil) > new Date()) continue;
        list.push({ link, reminder: r });
      }
    }
    list.sort((a, b) => new Date(a.reminder.date).getTime() - new Date(b.reminder.date).getTime());
    return list;
  }, [data.links, showCompleted]);

  const handleComplete = (link: LinkEntity, reminderId: string) => {
    const updatedReminders = link.reminders.map((r) =>
      r.id === reminderId ? { ...r, completed: true } : r
    );
    onUpdate(updateLink(data, link.id, { reminders: updatedReminders }));
  };

  const handleDeleteReminder = (link: LinkEntity, reminderId: string) => {
    const updatedReminders = link.reminders.filter((r) => r.id !== reminderId);
    onUpdate(updateLink(data, link.id, { reminders: updatedReminders }));
  };

  const overdueCount = reminders.filter((r) => !r.reminder.completed && new Date(r.reminder.date) < new Date()).length;

  if (reminders.length === 0) {
    return (
      <div className="flex flex-col gap-8 p-6">
        <div>
          <h2 className="font-sans text-[24px] tracking-tight text-text-display">Reminders</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-1">Revisit and review links</p>
        </div>
        <NDEmptyState title="No reminders" description="Set reminders on links to surface them later." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-sans text-[24px] tracking-tight text-text-display">Reminders</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary mt-1">Revisit and review links</p>
        </div>
        <div className="flex items-center gap-3">
          {overdueCount > 0 && (
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
              {overdueCount} overdue
            </span>
          )}
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-text-secondary cursor-pointer">
            <NDToggle checked={showCompleted} onChange={setShowCompleted} />
            Show completed
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {reminders.map(({ link, reminder }) => {
          const isOverdue = !reminder.completed && new Date(reminder.date) < new Date();
          return (
            <div
              key={reminder.id}
              className={`bg-surface border rounded-xl p-4 flex items-start gap-4 transition-colors ${isOverdue ? "border-accent" : "border-border"}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => onEditLink?.(link)}
                    className="font-sans text-[14px] text-text-primary truncate hover:underline text-left"
                  >
                    {link.title}
                  </button>
                  {reminder.completed && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-success border border-success/30 px-1.5 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                  {isOverdue && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-accent border border-accent/30 px-1.5 py-0.5 rounded-full">
                      Overdue
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-text-secondary">
                  <span>{formatDate(reminder.date)}</span>
                  <span className="text-text-disabled">|</span>
                  <span>{formatRelativeTime(reminder.date)}</span>
                  <span className="text-text-disabled">|</span>
                  <span className="truncate max-w-[200px]">{link.domain}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!reminder.completed && (
                  <NDButton size="sm" variant="secondary" onClick={() => handleComplete(link, reminder.id)}>
                    <CheckIcon size={14} />
                  </NDButton>
                )}
                <NDButton size="sm" variant="ghost" onClick={() => onOpenLink?.(link)}>
                  <ExternalLinkIcon size={14} />
                </NDButton>
                <NDButton size="sm" variant="ghost" onClick={() => handleDeleteReminder(link, reminder.id)}>
                  <TrashIcon size={14} />
                </NDButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
