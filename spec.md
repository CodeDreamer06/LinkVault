# LinkVault Rewrite Specification

## Product Summary

LinkVault is a local-first link knowledge vault for saving, organizing, enriching, rediscovering, and exporting web links. The rewrite removes all cloud dependencies and account concepts. The app runs as a single-user product with on-device persistence and optional AI assistance through VoidAI, an OpenAI-compatible provider.

## Rewrite Constraints

- No authentication, accounts, sessions, or user profiles.
- No cloud database, no Supabase, and no remote persistence layer.
- All primary data must be stored locally on the device.
- AI features must use VoidAI through an OpenAI-compatible interface.
- The spec should define product capabilities only, not UI implementation details.

## Storage Model

- Local-first persistence for all saved links, tags, categories, collections, settings, and AI-generated metadata.
- Data must remain available offline after it has been saved locally.
- Data import and export must remain the portability and backup mechanism.
- Corrupt or invalid imported records should be skipped with error reporting instead of crashing the import.
- Local data should be versioned so future schema migrations are possible.

## Core Entities

### Link

- Unique local ID.
- URL.
- Normalized URL.
- Canonical URL.
- Original captured URL.
- Domain.
- Hostname.
- Title.
- Description or notes.
- Separate personal note field.
- Separate AI summary field.
- Tags.
- Category.
- Collection or folder membership.
- Favicon URL or cached favicon reference.
- Optional site metadata snapshot.
- Snapshot checksum or content version.
- Content type.
- Language.
- Created timestamp.
- Updated timestamp.
- Last opened timestamp.
- Open count.
- Archived state.
- Favorite or pinned state.
- Read status.
- Broken-link status.
- Reminder status.
- Source type.
- Priority.
- Confidence or usefulness rating.

### Supporting Entities

- Categories.
- Tags.
- Collections or folders.
- Smart saved filters.
- Workspaces or vault sections.
- Templates.
- Reminder rules.
- Domain profiles.
- Custom fields.
- Link relations.
- Saved searches.
- Import/export history.
- Backup snapshots.
- Activity log.
- AI settings.
- Local app settings.

## Feature Set

### 1. Link Capture and Creation

- Add a new link manually.
- Save a URL with optional title, notes, tags, and category.
- Auto-normalize entered URLs.
- Prevent obviously invalid URLs from being stored.
- Auto-fetch metadata from the target page when possible.
- Extract page title.
- Extract page description.
- Extract favicon.
- Preserve manual edits even when metadata is fetched later.
- Support quick-add flows using only a URL.
- Support duplicate detection when the same normalized URL already exists.
- Allow users to keep duplicates intentionally after warning.
- Capture links from plain text that contains one or more URLs.
- Capture browser-shared URLs or pasted share payloads.
- Create links from bookmark HTML import sources.
- Support templated capture rules for repeated research workflows.
- Auto-apply default tags or collections during capture based on domain or rule matches.
- Save draft link entries before final confirmation.

### 2. Link Library Management

- View all saved links in a single library.
- Edit any saved link.
- Delete a saved link.
- Bulk delete multiple links.
- Duplicate an existing link.
- Archive a link without deleting it.
- Restore archived links.
- Favorite or pin important links.
- Track created and updated timestamps.
- Track last-opened time.
- Track number of times a link was opened.
- Soft delete with recovery window.
- Permanent delete for explicit cleanup.
- Duplicate a link into another collection or project context.
- Open original link in browser.
- Copy original URL.
- Copy normalized or cleaned URL.
- Share or export an individual link record.

### 3. Organization

- Assign one category to a link.
- Assign multiple tags to a link.
- Create, rename, merge, and delete categories.
- Create, rename, merge, and delete tags.
- Create collections or folders for manual grouping.
- Allow a link to belong to multiple collections.
- Support project-based workspaces for grouping links by initiative.
- Support status lanes such as inbox, active, reading, referenced, and archived.
- Support uncategorized and untagged links.
- Support nested notes or long-form annotations on each link.
- Store custom highlights such as why the link matters.
- Support custom fields for user-defined metadata.
- Support domain-level default tags, categories, and collections.
- Support templates for repeated content types such as papers, tutorials, tools, and videos.

### 4. Search, Filters, and Discovery

- Full-text search across URL, title, notes, description, category, collection names, and tags.
- Search by domain.
- Search by exact tag match.
- Search by negative filters such as excluding a tag or category.
- Search by date ranges.
- Search by source type.
- Search by reminder state.
- Search by broken-link state.
- Filter by category.
- Filter by tag.
- Filter by collection.
- Filter by workspace.
- Filter by favorites.
- Filter by archived status.
- Filter by recently added.
- Filter by recently opened.
- Filter by unread or unreviewed items.
- Filter by AI-enriched versus manual-only links.
- Filter by import source.
- Combine multiple filters at once.
- Save reusable filter presets.
- Save reusable searches.
- Sort by newest, oldest, updated, alphabetic, most opened, and last opened.
- Sort by domain, priority, reminder date, and usefulness rating.
- Show links with missing metadata.
- Show duplicate or near-duplicate links.
- Show orphan tags and empty categories.
- Surface resurfacing candidates that have not been opened for a long time.

### 5. Metadata Enrichment

- Fetch metadata locally through an internal metadata pipeline.
- Re-fetch metadata on demand.
- Refresh metadata for a single link.
- Refresh metadata in bulk for selected links.
- Resolve relative favicon URLs correctly.
- Fall back to `/favicon.ico` when explicit favicon metadata is missing.
- Keep a metadata fetch timeout to avoid hanging requests.
- Record metadata fetch failures without breaking link creation.
- Detect redirect targets and store final canonical destination.
- Capture Open Graph title, description, and preview image references when available.
- Capture page author and published date when available.
- Detect site language where possible.
- Detect content type such as article, video, tool, repo, documentation, or paper.
- Flag pages that block metadata fetches.

### 6. AI Features via VoidAI

- AI-powered tag suggestions from title, description, notes, or URL context.
- One-click insertion of suggested tags into the link record.
- AI-generated category suggestions.
- AI-generated short summaries of saved pages.
- AI-generated “why this matters” note drafts.
- AI-generated related-link suggestions from the local vault.
- AI-powered duplicate detection based on semantic similarity.
- AI-generated cleanup suggestions for inconsistent tags or categories.
- AI-generated titles when metadata is poor or missing.
- AI-generated content type classification.
- AI-generated priority suggestions.
- AI-generated revisit suggestions for stale but important links.
- AI-generated collection placement suggestions.
- AI-generated project grouping suggestions across the vault.
- AI-powered semantic search over local content.
- AI-assisted note condensation for long personal notes.
- AI-generated “what changed” summary when metadata is refreshed for an existing page.
- AI-powered recommendation feed for rediscovering forgotten links.
- AI features must fail safely and never block core non-AI workflows.
- AI features must be configurable and optionally disableable.
- AI outputs should be stored locally once accepted.

### 7. Local Knowledge Features

- Support personal notes on every link.
- Support manual status fields such as unread, reviewing, referenced, or archived.
- Support source-type labels such as article, video, tool, repo, paper, or doc.
- Support reading priority.
- Support reminder date for revisiting a link.
- Support manual relationship links between saved items.
- Support backlinking between related links.
- Support quotes or excerpt snippets copied from a source.
- Support decision notes such as use later, reject, compare, or adopt.
- Support research-session context notes.
- Support timeline history for meaningful edits on a link record.
- Support manual confidence scoring for whether a link is still useful.

### 8. Import, Export, Backup, and Portability

- Export the entire vault as JSON.
- Import JSON exports back into the vault.
- Validate imported structure before applying it.
- Support merge import mode.
- Support replace-all import mode.
- Support duplicate-handling rules during import.
- Export selected subsets by filter, collection, or manual selection.
- Include metadata, notes, tags, categories, and timestamps in exports.
- Generate dated export filenames.
- Support local backup snapshots.
- Support restore from backup snapshot.
- Import browser bookmark HTML files.
- Import common CSV formats.
- Import newline-separated URL lists.
- Export bookmarks HTML for browser compatibility.
- Export CSV for spreadsheet workflows.
- Support dry-run import preview with validation results.
- Support field mapping for non-native imports.

### 9. Bulk Actions

- Multi-select links.
- Bulk tag assignment.
- Bulk tag removal.
- Bulk category assignment.
- Bulk move to collection.
- Bulk archive.
- Bulk unarchive.
- Bulk delete.
- Bulk metadata refresh.
- Bulk AI tagging.
- Bulk export selected links.
- Bulk merge duplicates.
- Bulk set reminders.
- Bulk mark as read or unread.
- Bulk move between workspaces.
- Bulk priority changes.
- Bulk source-type classification.

### 10. Local Preferences and App Settings

- Persist local app settings on device.
- Persist theme or appearance preference.
- Persist sort preference.
- Persist default export options.
- Persist AI provider configuration for VoidAI.
- Store VoidAI base URL, API key, model choice, and feature toggles locally.
- Provide clear separation between content data and local configuration data.
- Persist saved workspace context.
- Persist last-used import and export options.
- Persist keyboard shortcut preferences where supported.
- Persist metadata refresh policies.
- Persist privacy controls for what can be sent to AI.

### 11. Reliability and Offline Behavior

- Core vault operations must work fully offline except metadata fetch and AI calls.
- The app must remain usable if VoidAI is unavailable.
- The app must remain usable if metadata fetching fails.
- Writes should be resilient to refreshes and accidental tab closes.
- Local data writes should be atomic enough to avoid partial corruption.
- The app should detect schema version mismatches and migrate local data safely.
- Background tasks should be resumable after restart where possible.
- Long-running imports should report progress and partial failures.
- Failed metadata or AI jobs should be retryable.

### 12. Privacy and Security

- No user data is sent to a cloud database.
- Only AI-triggered text should be sent to VoidAI, and only when the user invokes AI features or enables automatic AI enrichment.
- Sensitive local settings such as API keys should be stored separately from exportable vault content unless the user explicitly chooses to export them.
- Export files should exclude secrets by default.
- Users should be able to inspect what text will be sent to VoidAI before optional AI actions if they enable strict privacy mode.
- Local diagnostic logs should be clearable.

### 13. Reminders and Review Loops

- Set one-time reminders on links.
- Set recurring reminders on links.
- Snooze reminders.
- Mark reminders complete.
- Review links by due date.
- Review links by stale age.
- Review links by unread backlog.
- Support spaced resurfacing for important links.

### 14. Domain Intelligence

- Group links by domain or site.
- Track per-domain save counts.
- Track per-domain open counts.
- Create domain notes.
- Mute noisy domains from suggestion surfaces.
- Auto-apply domain rules for tags, categories, and collections.
- Detect duplicate links across mobile and desktop variants of the same site.

### 15. Saved Workflows

- Quick-capture mode for rapid inboxing.
- Review mode for triaging uncategorized links.
- Research mode for comparing related links side by side at the data level.
- Cleanup mode for duplicates, empty tags, and broken links.
- Export mode for creating curated bundles from subsets of the vault.
- Reading-list mode for queueing and completing learning material.

### 16. Analytics and Insight Features

- Track total links saved.
- Track save volume over time.
- Track most-used tags.
- Track fastest-growing categories.
- Track dormant collections.
- Track most-opened links.
- Track links never opened after saving.
- Track metadata coverage percentage.
- Track AI-enrichment coverage percentage.
- Track duplicate density across the vault.

### 17. Automation and Rules

- Rule-based auto-tagging by domain, keyword, or URL pattern.
- Rule-based auto-categorization.
- Rule-based collection assignment.
- Rule-based reminder assignment.
- Rule-based archive suggestions for stale content.
- Rule simulation before saving changes.
- Enable and disable rules individually.
- Keep rule execution local.

### 18. Data Quality and Maintenance

- Detect malformed URLs.
- Detect unreachable links.
- Detect empty records.
- Detect inconsistent tag casing.
- Detect near-identical categories.
- Suggest metadata refresh for stale records.
- Provide a maintenance view for cleanup operations.
- Keep an undoable audit trail for destructive bulk changes.

## Parity Features From the Current Project

- Landing experience for first-time use.
- Redirect into the main vault when a session-equivalent local state already exists.
- Add link flow.
- Edit link flow.
- Delete link flow with confirmation.
- Search across saved content.
- Filter by category.
- Filter by tag.
- Auto-fetch metadata on URL entry.
- Favicon extraction and display support.
- AI tag suggestions.
- Import from JSON.
- Export to JSON.
- Theme preference.
- Toast-style feedback for long-running and success/error operations.

## Creative Additions for the Rewrite

- Inbox mode for uncategorized or unprocessed links.
- Smart collections generated from saved filters.
- Broken-link checker.
- Redirect checker.
- Read-later queue.
- Stale-link resurfacing for links not opened in a long time.
- Weekly digest generated from recently saved links.
- “Continue research” view that groups related links by topic.
- Auto-cluster links into topics using AI.
- Duplicate cleanup center.
- Tag hygiene assistant that suggests merges and canonical naming.
- Local usage analytics such as most visited domains, most used tags, and dormant collections.
- Domain-level grouping and filtering.
- Quick capture parser that can ingest a block of text containing multiple URLs.
- Link health state such as active, redirected, broken, or blocked.
- Snapshot support for storing a lightweight captured summary when a page changes later.
- Manual reminders for revisit dates.
- Session notes for temporary research bursts.
- Pinned collections for active projects.
- Command palette actions for fast vault operations.
- Canonicalizer that detects and cleans tracking-heavy URLs.
- “Decision memory” fields for why a link was saved, adopted, or rejected.
- Domain reputation notes maintained by the user.
- Vault health dashboard for duplicates, broken links, missing metadata, and uncategorized items.
- Capture recipes for repeated workflows such as saving GitHub repos, papers, docs, and videos with different default fields.
- Revisit queue that balances stale items, favorites, and due reminders.
- AI-generated comparison sets for competing tools or articles on the same topic.
- Knowledge trails that chain related links in the order they were discovered or consumed.

## VoidAI Integration Requirements

- Use an OpenAI-compatible client contract.
- Support configurable base URL.
- Support configurable API key.
- Support configurable default model.
- Support per-feature model overrides if needed later.
- Standardize prompts for tags, summaries, categorization, and related-link suggestions.
- Log AI errors locally for debugging without exposing secrets in exports.
- Support a model capability map so lightweight and heavier models can be assigned to different AI features.
- Support timeout and retry controls for AI calls.
- Support privacy presets that restrict what fields are included in prompts.

## Suggested Non-Goals

- Multi-user collaboration.
- Remote sync in the first rewrite.
- Social sharing features.
- OAuth, email auth, or account recovery.
- Cloud-hosted analytics.
- Mandatory online-only behavior.

## Success Criteria

- A user can save, organize, search, enrich, and export links entirely offline except for optional metadata fetches and VoidAI calls.
- The rewritten product matches all current core capabilities.
- The rewritten product improves organization, bulk workflows, automation, and rediscovery without adding cloud complexity.
