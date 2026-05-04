# LinkVault

> *For the curious minds who collect fragments of the internet, knowing that somewhere in the pile lies something precious — if only they could find it again.*

LinkVault is a local-first sanctuary for the links that matter to you. In a world where everything wants to live in the cloud, we built something that lives in your hands. No accounts. No tracking. No subscriptions. Just you and your carefully curated corner of the internet, stored safely on your device, enriched by AI only when you ask for it.

![LinkVault](public/screenshot.png)

## Why We Built This

We've all been there. That moment when you know you saved that article — the one with the perfect solution, the inspiring essay, the tool you swore you'd try later. You can almost feel it, somewhere in the digital clutter. But the browser bookmarks have become a canyon of forgotten URLs. The read-later app became a guilt pile. The cloud service you trusted changed its terms, or disappeared entirely.

**LinkVault asks a different question:** What if saving links wasn't about hoarding, but about *cultivation*?

What if your digital library felt less like a dumping ground and more like a garden — something you tend, prune, and return to with pleasure? Where the act of organizing becomes a form of thinking, and rediscovery feels like running into an old friend?

This is software for the long haul. For the researchers, the writers, the developers, the dreamers who know that a link saved today might change their thinking five years from now. We built it because we needed it. We hope it serves you well.

## The Philosophy Beneath

There's a quiet radicalism in keeping your own data. In a time when every interaction is mined, analyzed, and monetized, LinkVault chooses a different path:

- **Sovereignty over convenience** — Your vault lives where you can touch it: on your device, in a file you can open, understand, and move elsewhere. Cloud sync is lovely until the company changes hands, changes terms, or simply changes its mind. Your links are too precious for that volatility.

- **Offline as freedom** — The core experience works anywhere. On a plane. In a cabin. In that café with terrible WiFi. The internet gave us infinite information; LinkVault gives you infinite organization, even when the connection drops.

- **AI as assistant, not oracle** — We believe AI is a remarkable tool — for suggesting tags, summarizing content, finding patterns. But it's your tool, running through providers you choose, touching only the data you allow. No black boxes. No mystery training. Just augmentation, thoughtfully applied.

- **The joy of curation** — There's a particular pleasure in organizing things well. Not obsessive perfection, but intentional care. Tagging a link. Writing a note. Setting a reminder to revisit something later. These small acts of attention compound into something valuable: a personal knowledge base that reflects *your* mind, not an algorithm's guess at what you might like.

## What You Can Do

### Capture — The Moment of Discovery
That spark when you find something worth keeping. We make it frictionless:
- Add links manually with full metadata editing
- Auto-normalize URLs, stripping the tracking noise
- Fetch page title, description, favicon, and preview image
- Extract multiple links from pasted text (paste a whole email, get the gems)
- Duplicate detection (with the wisdom to let you keep both if you want)
- Quick-add mode for when you're in flow
- Draft links before committing — because sometimes you need to think about it

### Curate — The Art of Organization
This is where the magic happens. Not rigid folders, but flexible thinking:
- **Categories** — One per link, for the big buckets of your mind
- **Tags** — Multiple per link, because nothing fits in just one box
- **Collections** — Project-based grouping, for things that belong together
- **Workspaces** — Different contexts, different vault views
- **Read status** — Unread, reading, read. Simple. Honest.
- **Priority** — From "someday" to "right now"
- **Personal notes** — Your thoughts, your words, attached to every link
- **Domain profiles** — Auto-organize by source, because some sites just keep giving

### Rediscover — The Joy of Returning
The best saved link is the one you find when you need it:
- Full-text search across everything — URLs, titles, notes, tags, the works
- Visual filters with dot-matrix precision: content type, read status, priority, AI-enriched, health status, reminders
- Sort by relevance, recency, popularity, or your own confidence rating
- Surface links you've forgotten — those gems waiting in the digital dust
- Find duplicates and near-duplicates (because we save the same thing twice, often)
- Orphan tag detection — tags that lost their links, links that lost their tags

### Reading Spaces — Modes of Attention
Different moods, different views:
- **Inbox** — The unprocessed. Everything waiting for your attention.
- **Favorites** — The loved ones. Links you return to again and again.
- **Reading List** — Currently in progress. The open tabs of your mind.
- **Archived** — Not gone, just resting. Soft deletion for the uncertain.

### Enrichment — Making Links Understandable
Raw URLs are cryptic. Enriched links are useful:
- Fetch metadata on demand, in bulk, or automatically
- Detect redirects and canonical URLs — follow the trail
- Extract Open Graph data for rich previews
- Detect content type: article, video, tool, repo, documentation, paper, image, audio
- Language detection for the multilingual vault
- Graceful failure handling — because the web is messy

### AI Augmentation — Intelligence, On Your Terms
Optional. Configurable. Yours to control:
- AI-suggested tags from titles, descriptions, URLs
- AI-generated summaries for quick scanning
- AI content-type classification when metadata fails
- AI duplicate detection using semantic similarity
- Privacy modes: strict (review everything) or relaxed (automate freely)
- Per-feature toggles — use AI where it helps, skip it where it doesn't

*AI requires your own OpenAI-compatible provider. We don't bundle, track, or monetize your usage. Configure once, enrich forever.*

### Portability — Your Data, Your Rules
The vault is yours. Truly:
- Export everything as JSON — human-readable, machine-parseable
- Import back, merging or replacing as you choose
- Dated exports for versioned backups
- Dry-run imports to preview changes
- No lock-in. No proprietary formats. Just data, where you want it.

### Bulk Power — Taming the Many
When organization means moving mountains:
- Multi-select with checkboxes
- Bulk tagging, categorizing, collecting
- Bulk archive, unarchive, favorite, unfavorite
- Bulk metadata refresh
- Bulk delete (with confirmation, because we're careful)
- Bulk priority changes

### Insight — Understanding Your Vault
Numbers that tell stories:
- Total links, favorites, unread, archived
- Reading progress with segmented visual bars
- Vault health: AI coverage, never-opened links, broken links
- Top tags, dominant domains, category balance
- Metadata coverage tracking
- Activity patterns — how you save, when you return

### Maintenance — Keeping Things Healthy
Software for tidying:
- **Duplicate detector** — Find the twins and near-twins
- **Broken link checker** — Know when destinations disappear
- **Missing metadata finder** — Surface the mysteries
- **Uncategorized hunter** — Inbox items waiting for homes
- **Untagged scout** — Links that need labeling
- **Orphan tag cleanup** — Tags without links, links without tags
- **Empty category pruning** — Clean slate for clean thinking

### Settings — Make It Yours
- **Theme** — Dark (OLED black), light (warm paper), or follow the system
- **Default view** — List or grid, your preference
- **Favicon display** — Show site icons or go minimal
- **Metadata timeout** — How long to wait for the web
- **Destructive confirmation** — Safety nets, optional
- **AI configuration** — Your provider, your key, your model
- **Keyboard shortcuts** — `Cmd/Ctrl + K` command palette for speed

### Command Palette — Speed of Thought
`Cmd/Ctrl + K` from anywhere:
- Jump to any view instantly
- Search and open links by title or domain
- Navigate without the mouse
- The fastest path to what you need

## The Craft Behind LinkVault

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 |
| Fonts | Doto (display), Space Grotesk (body), Space Mono (data/labels) |
| Linting | [Biome](https://biomejs.dev/) |
| Icons | Custom monoline SVG set (Lucide-inspired) |
| State | React hooks with localStorage persistence |
| AI | OpenAI-compatible API (VoidAI, OpenAI, etc.) |

### Design System — Nothing, But Warmer

LinkVault draws from the industrial precision of Nothing's aesthetic, then adds a human pulse:

- **Monochrome foundation** — OLED black, layered grays, white heat for accents. Color when you need attention, absence when you need calm.
- **Typography as architecture** — Space Grotesk carries meaning; Space Mono handles data. Doto appears for moments of display.
- **Dot-matrix rhythm** — Those tiny grids of light that suggest instrumentation, measurement, care.
- **Segmented progress** — Not smooth gradients but discrete steps, honest about approximation.
- **Flat surfaces, honest borders** — No shadows pretending depth, no blur hiding imprecision. What you see is what exists.
- **Asymmetric balance** — Heavy elements paired with vast emptiness. Confidence through contrast.

## Getting Started

### What You Need
- Node.js 20+
- A terminal
- Curiosity

### Bring It To Life

```bash
# Clone the repository
git clone https://github.com/yourusername/LinkVault.git
cd LinkVault

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The vault awaits.

### Build for Production

```bash
npm run build
```

Static export lands in `out/`. Portable. Self-contained. Yours.

### Keep It Clean

```bash
npm run lint
npm run lint:fix
npm run format
```

## Configuration

### Environment (Optional, for AI)

Create `.env.local`:

```bash
# AI configuration — entirely optional
VOIDAI_BASE_URL=https://api.openai.com/v1
VOIDAI_API_KEY=your-api-key-here
VOIDAI_MODEL=gpt-4o-mini
VOIDAI_AUTO_ENRICH=false
```

**Important:** LinkVault is complete without AI. Every feature works offline, forever.

### Enabling AI

1. Settings → AI Configuration
2. Enable, provide your endpoint
3. Choose what AI touches (tags? summaries? everything?)
4. Set privacy mode: strict (review each request) or relaxed (automate freely)
5. Your data, your provider, your terms

## Data Architecture

Everything lives in `localStorage` under `linkvault_v2`. Versioned. Migrations handled automatically.

### The Entities

- **Link** — The core. URLs, metadata, organization, history, health.
- **Category** — Broad buckets (one per link)
- **Tag** — Flexible labels (many per link)
- **Collection** — Project folders (many per link)
- **Workspace** — Context switches
- **Domain Profile** — Rules per source site
- **Activity Log** — What happened, when

### Portability

Export anytime. JSON format, human-readable. API keys stripped by default. Move between devices. Archive offline. Keep forever.

## How It's Built

```
app/
├── components/          # UI pieces, designed with care
├── hooks/               # State management, vault logic
├── lib/
│   ├── types.ts         # TypeScript contracts
│   ├── db.ts            # localStorage layer
│   ├── utils.ts         # URL parsing, formatting
│   ├── metadata.ts      # Web page enrichment
│   └── ai.ts            # AI integration
├── page.tsx             # The app
├── layout.tsx           # Root shell, fonts
└── globals.css          # Design tokens
```

### Decisions We Stand By

- **Client-side only** — No server handling your data. Privacy by architecture.
- **Debounced persistence** — 300ms batching. Responsive feel, safe saves.
- **Immutable updates** — Predictable state, predictable UI.
- **Graceful degradation** — AI fails? Metadata times out? Core app continues.
- **Schema versioning** — Future you will thank present you.

## Privacy — The Non-Negotiable

- **No cloud** — Your device, your data.
- **No tracking** — No analytics, cookies, beacons, or telemetry.
- **AI on your terms** — Only what you approve, only where you point it.
- **Export safety** — API keys don't travel with exports unless you explicitly include them.

## What's Here, What's Coming

### Now
- [x] Local-first data, versioned, migratable
- [x] Link capture with rich metadata fetching
- [x] Full-text search across everything
- [x] Creative visual filters with dot-matrix precision
- [x] Tags, categories, collections, workspaces
- [x] Favorites, archive, read status, priority
- [x] Bulk operations for power users
- [x] JSON import/export, merge or replace
- [x] Analytics and vault health insights
- [x] Maintenance center for cleanup
- [x] Command palette (`Cmd/Ctrl + K`)
- [x] Dark/light/system themes
- [x] Optional AI enrichment (tags, summaries, categorization)
- [x] Domain intelligence and profiles

### Next
- [ ] Browser bookmark HTML import/export
- [ ] CSV workflows
- [ ] Saved filter presets, smart collections
- [ ] Reminder system with revisit queues
- [ ] Automatic broken-link detection
- [ ] Rule-based auto-organization
- [ ] Link relations and backlinking
- [ ] Research session notes
- [ ] Custom keyboard shortcuts
- [ ] PWA for true offline installation

## Contributing

Issues and pull requests welcome. For significant changes, open an issue first — let's discuss.

## License

MIT — See [LICENSE](./LICENSE) for details.

---

*Built with precision. Kept with care. Yours forever.*
