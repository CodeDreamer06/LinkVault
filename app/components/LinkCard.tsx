"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { LinkEntity } from "../lib/types";
import { formatRelativeTime, truncate } from "../lib/utils";
import { StarIcon, ExternalLinkIcon, ArchiveIcon, TagIcon } from "./Icons";

interface LinkCardProps {
  link: LinkEntity;
  selected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
  onEdit?: () => void;
  onToggleFavorite?: () => void;
  onToggleArchive?: () => void;
  viewMode?: "grid" | "list";
}

function getDefaultFaviconUrl(url: string): string | undefined {
  try {
    return `${new URL(url).origin}/favicon.ico`;
  } catch {
    return undefined;
  }
}

export function LinkCard({
  link,
  selected,
  onSelect,
  onOpen,
  onEdit,
  onToggleFavorite,
  onToggleArchive,
  viewMode = "list",
}: LinkCardProps) {
  const faviconCandidates = useMemo(
    () => Array.from(new Set([link.faviconUrl, getDefaultFaviconUrl(link.url)].filter(Boolean))) as string[],
    [link.faviconUrl, link.url]
  );
  const [faviconIndex, setFaviconIndex] = useState(0);

  useEffect(() => {
    setFaviconIndex(0);
  }, [link.faviconUrl, link.url]);

  const faviconSrc = faviconCandidates[faviconIndex];
  const favicon = faviconSrc ? (
    <img
      src={faviconSrc}
      alt=""
      className="w-4 h-4 shrink-0"
      onError={() => {
        setFaviconIndex((current) => current + 1);
      }}
    />
  ) : (
    <div className="w-4 h-4 rounded-full bg-border shrink-0" />
  );

  const cardContent = (
    <>
      <div className="flex items-start gap-3">
        {onSelect && (
          <span onClick={(e) => e.stopPropagation()} className="mt-1 shrink-0">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect()}
              className="accent-accent cursor-pointer"
            />
          </span>
        )}
        {favicon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-sans text-[15px] text-text-primary truncate leading-snug">
              {truncate(link.title, 120)}
            </h3>
            {link.favorite && <StarIcon size={14} className="text-accent shrink-0" />}
            {link.archived && <ArchiveIcon size={14} className="text-text-disabled shrink-0" />}
          </div>
          <p className="font-mono text-[11px] text-text-disabled mt-0.5 truncate">{link.domain}</p>
          {link.description && (
            <p className="font-sans text-[13px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
              {truncate(link.description, 200)}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {link.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-secondary border border-border px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
            {link.tags.length > 5 && (
              <span className="font-mono text-[10px] text-text-disabled">+{link.tags.length - 5}</span>
            )}
            {link.category && (
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-interactive border border-border px-2 py-0.5 rounded-full">
                {link.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-[10px] text-text-disabled">{formatRelativeTime(link.createdAt)}</span>
            {link.openCount > 0 && (
              <span className="font-mono text-[10px] text-text-disabled">
                {link.openCount} open{link.openCount > 1 ? "s" : ""}
              </span>
            )}
            {link.readStatus === "unread" && (
              <span className="font-mono text-[10px] text-accent">UNREAD</span>
            )}
            {link.aiEnriched && (
              <span className="font-mono text-[10px] text-success">AI</span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`p-1 rounded hover:bg-surface-raised transition-colors ${link.favorite ? "text-accent" : "text-text-disabled"}`}
            >
              <StarIcon size={16} />
            </button>
          )}
          {onOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="p-1 rounded text-text-disabled hover:text-text-primary hover:bg-surface-raised transition-colors"
              title="Open link"
            >
              <ExternalLinkIcon size={16} />
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (viewMode === "grid") {
    return (
      <div
        onClick={onEdit}
        className={`bg-surface border rounded-xl p-4 cursor-pointer transition-colors duration-150 hover:border-border-visible ${selected ? "border-accent" : "border-border"}`}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div
      onClick={onEdit}
      className={`border-b border-border py-4 px-2 cursor-pointer transition-colors duration-150 hover:bg-surface ${selected ? "bg-accent-subtle" : ""}`}
    >
      {cardContent}
    </div>
  );
}
