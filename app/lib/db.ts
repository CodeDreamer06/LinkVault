import type {
  VaultData,
  LinkEntity,
  Category,
  Tag,
  Collection,
  Workspace,
  SavedFilter,
  DomainProfile,
  ActivityLogEntry,
  AppSettings,
  AISettings,
  FilterState,
  SortOption,
} from "./types";
import { getDefaultAISettings } from "./ai";
import { generateId } from "./utils";

const STORAGE_KEY = "linkvault_v2";
const SCHEMA_VERSION = 2;

export function getDefaultVaultData(): VaultData {
  return {
    version: SCHEMA_VERSION,
    links: [],
    categories: [],
    tags: [],
    collections: [],
    workspaces: [],
    savedFilters: [],
    domainProfiles: [],
    activityLog: [],
    settings: {
      theme: "dark",
      defaultSort: "newest",
      defaultView: "list",
      showFavicons: true,
      showPreviews: false,
      metadataFetchTimeout: 10000,
      confirmDestructive: true,
      keyboardShortcuts: {},
    },
    aiSettings: getDefaultAISettings(),
  };
}

function loadRaw(): VaultData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VaultData;
    return parsed;
  } catch {
    return null;
  }
}

function migrate(data: VaultData): VaultData {
  if (data.version === SCHEMA_VERSION) return data;
  const defaults = getDefaultVaultData();
  return {
    ...defaults,
    ...data,
    version: SCHEMA_VERSION,
    settings: { ...defaults.settings, ...data.settings },
    aiSettings: { ...defaults.aiSettings, ...data.aiSettings },
  };
}

export function loadVault(): VaultData {
  const raw = loadRaw();
  if (!raw) return getDefaultVaultData();
  return migrate(raw);
}

export function saveVault(data: VaultData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addActivityLog(
  data: VaultData,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
): VaultData {
  const entry: ActivityLogEntry = {
    id: generateId(),
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  };
  const trimmed = [entry, ...data.activityLog].slice(0, 500);
  return { ...data, activityLog: trimmed };
}

export function createLink(data: VaultData, link: Omit<LinkEntity, "id" | "createdAt" | "updatedAt">): VaultData {
  const now = new Date().toISOString();
  const newLink: LinkEntity = {
    ...link,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  const updated = { ...data, links: [newLink, ...data.links] };
  return addActivityLog(updated, "create", "link", newLink.id, `Created link: ${newLink.title}`);
}

export function updateLink(data: VaultData, id: string, patch: Partial<LinkEntity>): VaultData {
  const links = data.links.map((l) =>
    l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l
  );
  const updated = { ...data, links };
  return addActivityLog(updated, "update", "link", id);
}

export function deleteLink(data: VaultData, id: string): VaultData {
  const links = data.links.filter((l) => l.id !== id);
  const updated = { ...data, links };
  return addActivityLog(updated, "delete", "link", id);
}

export function bulkDeleteLinks(data: VaultData, ids: string[]): VaultData {
  const set = new Set(ids);
  const links = data.links.filter((l) => !set.has(l.id));
  const updated = { ...data, links };
  return addActivityLog(updated, "bulk_delete", "link", undefined, `Deleted ${ids.length} links`);
}

export function bulkUpdateLinks(
  data: VaultData,
  ids: string[],
  patch: Partial<LinkEntity>
): VaultData {
  const set = new Set(ids);
  const now = new Date().toISOString();
  const links = data.links.map((l) =>
    set.has(l.id) ? { ...l, ...patch, updatedAt: now } : l
  );
  return { ...data, links };
}

export function findDuplicateLinks(data: VaultData): [LinkEntity, LinkEntity][] {
  const dupes: [LinkEntity, LinkEntity][] = [];
  const seen = new Map<string, LinkEntity>();
  for (const link of data.links) {
    const key = link.normalizedUrl;
    if (seen.has(key)) {
      dupes.push([seen.get(key)!, link]);
    } else {
      seen.set(key, link);
    }
  }
  return dupes;
}

export function getLinksByFilter(
  data: VaultData,
  filter: FilterState,
  sort: SortOption
): LinkEntity[] {
  let results = data.links.filter((link) => {
    if (filter.query) {
      const q = filter.query.toLowerCase();
      const searchable = [
        link.url,
        link.title,
        link.description || "",
        link.note || "",
        link.category || "",
        link.tags.join(" "),
        link.domain,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    if (filter.category && link.category !== filter.category) return false;
    if (filter.tags.length > 0 && !filter.tags.every((t) => link.tags.includes(t))) return false;
    if (filter.collection && !link.collections.includes(filter.collection)) return false;
    if (filter.workspace && link.workspace !== filter.workspace) return false;
    if (filter.status && link.health !== filter.status && link.readStatus !== filter.status) {
      // status here maps to readStatus for reading mode
      if (filter.status === "reading" && link.readStatus !== "reading") return false;
      if (filter.status === "active" && link.readStatus !== "read" && link.readStatus !== "unread") return false;
    }
    if (filter.favorite !== undefined && link.favorite !== filter.favorite) return false;
    if (filter.archived !== undefined && link.archived !== filter.archived) return false;
    if (filter.readStatus && link.readStatus !== filter.readStatus) return false;
    if (filter.domain && link.domain !== filter.domain) return false;
    if (filter.health && link.health !== filter.health) return false;
    if (filter.aiEnriched !== undefined && link.aiEnriched !== filter.aiEnriched) return false;
    if (filter.priority && link.priority !== filter.priority) return false;
    if (filter.contentType && link.contentType !== filter.contentType) return false;
    if (filter.dateFrom && new Date(link.createdAt) < new Date(filter.dateFrom)) return false;
    if (filter.dateTo && new Date(link.createdAt) > new Date(filter.dateTo)) return false;
    if (filter.hasReminders && (!link.reminders || link.reminders.length === 0)) return false;
    return true;
  });

  results.sort((a, b) => {
    switch (sort) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "updated":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "alpha":
        return a.title.localeCompare(b.title);
      case "mostOpened":
        return b.openCount - a.openCount;
      case "lastOpened": {
        const la = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0;
        const lb = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0;
        return lb - la;
      }
      case "domain":
        return a.domain.localeCompare(b.domain);
      case "priority": {
        const pmap = { urgent: 4, high: 3, medium: 2, low: 1 };
        return pmap[b.priority] - pmap[a.priority];
      }
      case "confidence":
        return b.confidence - a.confidence;
      default:
        return 0;
    }
  });

  return results;
}

export function upsertCategory(data: VaultData, name: string): [VaultData, string] {
  const existing = data.categories.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) return [data, existing.id];
  const cat: Category = { id: generateId(), name, createdAt: new Date().toISOString() };
  return [addActivityLog({ ...data, categories: [...data.categories, cat] }, "create", "category", cat.id), cat.id];
}

export function upsertTag(data: VaultData, name: string): [VaultData, string] {
  const existing = data.tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
  if (existing) return [data, existing.id];
  const tag: Tag = { id: generateId(), name, createdAt: new Date().toISOString() };
  return [addActivityLog({ ...data, tags: [...data.tags, tag] }, "create", "tag", tag.id), tag.id];
}

export function upsertCollection(data: VaultData, name: string): [VaultData, string] {
  const existing = data.collections.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) return [data, existing.id];
  const col: Collection = {
    id: generateId(),
    name,
    pinned: false,
    createdAt: new Date().toISOString(),
  };
  return [
    addActivityLog({ ...data, collections: [...data.collections, col] }, "create", "collection", col.id),
    col.id,
  ];
}

export function removeCategory(data: VaultData, id: string): VaultData {
  const categories = data.categories.filter((c) => c.id !== id);
  const links = data.links.map((l) =>
    l.category === id ? { ...l, category: undefined, updatedAt: new Date().toISOString() } : l
  );
  return addActivityLog({ ...data, categories, links }, "delete", "category", id);
}

export function removeTag(data: VaultData, id: string): VaultData {
  const tags = data.tags.filter((t) => t.id !== id);
  const links = data.links.map((l) =>
    l.tags.includes(id)
      ? { ...l, tags: l.tags.filter((t) => t !== id), updatedAt: new Date().toISOString() }
      : l
  );
  return addActivityLog({ ...data, tags, links }, "delete", "tag", id);
}

export function removeCollection(data: VaultData, id: string): VaultData {
  const collections = data.collections.filter((c) => c.id !== id);
  const links = data.links.map((l) =>
    l.collections.includes(id)
      ? { ...l, collections: l.collections.filter((c) => c !== id), updatedAt: new Date().toISOString() }
      : l
  );
  return addActivityLog({ ...data, collections, links }, "delete", "collection", id);
}

export function exportVault(data: VaultData, includeSecrets = false): string {
  const exportData = { ...data };
  if (!includeSecrets) {
    exportData.aiSettings = { ...exportData.aiSettings, apiKey: "" };
  }
  return JSON.stringify(exportData, null, 2);
}

export function importVault(
  current: VaultData,
  raw: string,
  mode: "merge" | "replace"
): { data: VaultData; errors: string[] } {
  const errors: string[] = [];
  let incoming: VaultData;
  try {
    incoming = JSON.parse(raw);
  } catch {
    errors.push("Invalid JSON format");
    return { data: current, errors };
  }

  if (mode === "replace") {
    const merged = migrate(incoming);
    return { data: addActivityLog(merged, "import", "vault", undefined, "Replaced vault data"), errors };
  }

  // merge mode
  let next = { ...current };

  for (const link of incoming.links || []) {
    if (!link.id || !link.url) {
      errors.push(`Skipped invalid link record`);
      continue;
    }
    const dup = next.links.find((l) => l.normalizedUrl === link.normalizedUrl);
    if (dup) {
      errors.push(`Skipped duplicate link: ${link.url}`);
      continue;
    }
    next.links.push(link);
  }

  for (const cat of incoming.categories || []) {
    if (!next.categories.find((c) => c.id === cat.id || c.name === cat.name)) {
      next.categories.push(cat);
    }
  }
  for (const tag of incoming.tags || []) {
    if (!next.tags.find((t) => t.id === tag.id || t.name === tag.name)) {
      next.tags.push(tag);
    }
  }
  for (const col of incoming.collections || []) {
    if (!next.collections.find((c) => c.id === col.id || c.name === col.name)) {
      next.collections.push(col);
    }
  }

  next = addActivityLog(next, "import", "vault", undefined, `Merged vault data`);
  return { data: next, errors };
}
