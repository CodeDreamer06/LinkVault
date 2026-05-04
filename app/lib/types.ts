export type ContentType =
  | "article"
  | "video"
  | "tool"
  | "repo"
  | "documentation"
  | "paper"
  | "image"
  | "audio"
  | "other";

export type LinkStatus =
  | "inbox"
  | "active"
  | "reading"
  | "referenced"
  | "archived";

export type LinkHealth = "active" | "redirected" | "broken" | "blocked";

export type ReadStatus = "unread" | "reading" | "read";

export type Priority = "low" | "medium" | "high" | "urgent";

export type ReminderType = "one-time" | "recurring";

export interface LinkReminder {
  id: string;
  type: ReminderType;
  date: string;
  snoozedUntil?: string;
  completed: boolean;
}

export interface LinkEntity {
  id: string;
  url: string;
  normalizedUrl: string;
  canonicalUrl?: string;
  originalUrl: string;
  domain: string;
  hostname: string;
  title: string;
  description?: string;
  note?: string;
  aiSummary?: string;
  tags: string[];
  category?: string;
  collections: string[];
  workspace?: string;
  faviconUrl?: string;
  previewImage?: string;
  siteMetadata?: Record<string, string>;
  contentType: ContentType;
  language?: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  openCount: number;
  archived: boolean;
  favorite: boolean;
  readStatus: ReadStatus;
  health: LinkHealth;
  reminders: LinkReminder[];
  sourceType?: string;
  priority: Priority;
  confidence: number;
  aiEnriched: boolean;
  duplicateOf?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  pinned: boolean;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  query?: string;
  filters: FilterState;
  sort: SortOption;
  createdAt: string;
}

export interface DomainProfile {
  domain: string;
  defaultTags: string[];
  defaultCategory?: string;
  defaultCollections: string[];
  notes?: string;
  muted: boolean;
  saveCount: number;
  openCount: number;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  timestamp: string;
}

export interface AISettings {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  model: string;
  autoEnrich: boolean;
  privacyMode: "strict" | "relaxed";
  featureToggles: Record<string, boolean>;
  timeoutMs: number;
  maxRetries: number;
}

export interface AppSettings {
  theme: "dark" | "light" | "system";
  defaultSort: SortOption;
  defaultView: "grid" | "list";
  showFavicons: boolean;
  showPreviews: boolean;
  metadataFetchTimeout: number;
  confirmDestructive: boolean;
  keyboardShortcuts: Record<string, string>;
}

export interface VaultData {
  version: number;
  links: LinkEntity[];
  categories: Category[];
  tags: Tag[];
  collections: Collection[];
  workspaces: Workspace[];
  savedFilters: SavedFilter[];
  domainProfiles: DomainProfile[];
  activityLog: ActivityLogEntry[];
  settings: AppSettings;
  aiSettings: AISettings;
}

export interface FilterState {
  query: string;
  category?: string;
  tags: string[];
  collection?: string;
  workspace?: string;
  status?: LinkStatus;
  favorite?: boolean;
  archived?: boolean;
  readStatus?: ReadStatus;
  domain?: string;
  health?: LinkHealth;
  aiEnriched?: boolean;
  priority?: Priority;
  contentType?: ContentType;
  dateFrom?: string;
  dateTo?: string;
  hasReminders?: boolean;
}

export type SortOption =
  | "newest"
  | "oldest"
  | "updated"
  | "alpha"
  | "mostOpened"
  | "lastOpened"
  | "domain"
  | "priority"
  | "confidence";

export type ViewType =
  | "library"
  | "inbox"
  | "favorites"
  | "reading"
  | "archived"
  | "analytics"
  | "settings"
  | "capture"
  | "maintenance"
  | "domains"
  | "collections"
  | "tags"
  | "categories";
