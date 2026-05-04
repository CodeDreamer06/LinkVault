import type { LinkEntity } from "./types";
import { normalizeUrl, extractDomain, extractHostname } from "./utils";

export interface FetchedMetadata {
  title?: string;
  description?: string;
  faviconUrl?: string;
  previewImage?: string;
  canonicalUrl?: string;
  author?: string;
  publishedDate?: string;
  language?: string;
  contentType?: string;
  siteMetadata?: Record<string, string>;
}

function resolveFavicon(baseUrl: string, favicon?: string): string | undefined {
  if (!favicon) {
    try {
      const u = new URL(baseUrl);
      return `${u.origin}/favicon.ico`;
    } catch {
      return undefined;
    }
  }
  if (favicon.startsWith("http")) return favicon;
  try {
    const u = new URL(baseUrl);
    return new URL(favicon, u.origin).toString();
  } catch {
    return undefined;
  }
}

export async function fetchMetadata(
  url: string,
  timeoutMs = 10000
): Promise<FetchedMetadata> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LinkVault/1.0)" },
    });
    clearTimeout(timer);

    if (!res.ok) return {};

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const getMeta = (name: string) =>
      doc.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ||
      doc.querySelector(`meta[property="og:${name}"]`)?.getAttribute("content") ||
      doc.querySelector(`meta[property="twitter:${name}"]`)?.getAttribute("content");

    const title =
      getMeta("title") ||
      doc.querySelector("title")?.textContent ||
      undefined;

    const description =
      getMeta("description") || undefined;

    const favicon =
      doc.querySelector('link[rel*="icon"]')?.getAttribute("href") ||
      doc.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ||
      undefined;

    const previewImage =
      doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
      undefined;

    const canonicalUrl =
      doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
      undefined;

    const author =
      doc.querySelector('meta[name="author"]')?.getAttribute("content") ||
      undefined;

    const publishedDate =
      doc.querySelector('meta[property="article:published_time"]')?.getAttribute("content") ||
      undefined;

    const language = doc.documentElement.lang || undefined;

    const contentType = guessContentType(url, title || "");

    return {
      title: title?.trim() || undefined,
      description: description?.trim() || undefined,
      faviconUrl: resolveFavicon(url, favicon),
      previewImage,
      canonicalUrl,
      author,
      publishedDate,
      language,
      contentType,
      siteMetadata: {
        ogTitle: getMeta("title") || "",
        ogDescription: getMeta("description") || "",
      },
    };
  } catch {
    clearTimeout(timer);
    return {};
  }
}

function guessContentType(url: string, title: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("vimeo.com") || u.includes("youtu.be")) return "video";
  if (u.includes("github.com")) return "repo";
  if (u.includes("docs.") || u.includes("documentation")) return "documentation";
  if (u.includes("arxiv.org") || title.toLowerCase().includes("paper")) return "paper";
  if (u.includes("medium.com") || u.includes("blog.") || title.toLowerCase().includes("blog")) return "article";
  return "article";
}

export function enrichLinkWithMetadata(
  link: Partial<LinkEntity>,
  meta: FetchedMetadata
): Partial<LinkEntity> {
  const enriched: Partial<LinkEntity> = { ...link };
  if (meta.title && !link.title) enriched.title = meta.title;
  if (meta.description && !link.description) enriched.description = meta.description;
  if (meta.faviconUrl) enriched.faviconUrl = meta.faviconUrl;
  if (meta.previewImage) enriched.previewImage = meta.previewImage;
  if (meta.canonicalUrl) enriched.canonicalUrl = meta.canonicalUrl;
  if (meta.language) enriched.language = meta.language;
  if (meta.contentType) enriched.contentType = meta.contentType as LinkEntity["contentType"];
  if (meta.siteMetadata) enriched.siteMetadata = meta.siteMetadata;
  enriched.normalizedUrl = normalizeUrl(link.url || "");
  enriched.domain = extractDomain(link.url || "");
  enriched.hostname = extractHostname(link.url || "");
  return enriched;
}
