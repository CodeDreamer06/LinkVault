import type { LinkEntity, AISettings } from "./types";

export function getDefaultAISettings(): AISettings {
  return {
    enabled: false,
    baseUrl: process.env.NEXT_PUBLIC_VOIDAI_BASE_URL || "",
    apiKey: process.env.NEXT_PUBLIC_VOIDAI_API_KEY || "",
    model: process.env.NEXT_PUBLIC_VOIDAI_MODEL || "gpt-4o-mini",
    autoEnrich: false,
    privacyMode: "strict",
    featureToggles: {
      tagSuggestions: true,
      summary: true,
      categorization: true,
      relatedLinks: true,
      duplicateDetection: true,
      cleanup: true,
      titleGeneration: true,
      contentType: true,
      priority: true,
      semanticSearch: true,
    },
    timeoutMs: 15000,
    maxRetries: 2,
  };
}

async function callAI(
  settings: AISettings,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  if (!settings.enabled || !settings.apiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), settings.timeoutMs);

    const res = await fetch(`${settings.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages,
        temperature: 0.4,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error("AI request failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return (data.choices?.[0]?.message?.content as string) || null;
  } catch (e) {
    console.error("AI call error:", e);
    return null;
  }
}

export async function suggestTags(
  settings: AISettings,
  link: LinkEntity,
  existingTags: string[]
): Promise<string[]> {
  if (!settings.featureToggles.tagSuggestions) return [];

  const prompt = `Suggest 3-5 concise tags for this link. Return ONLY a JSON array of strings.
URL: ${link.url}
Title: ${link.title}
Description: ${link.description || ""}
Existing tags to avoid duplicating: ${existingTags.join(", ")}`;

  const raw = await callAI(settings, [
    {
      role: "system",
      content:
        "You are a helpful tagging assistant. Respond with a JSON array of tag strings only.",
    },
    { role: "user", content: prompt },
  ]);

  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((t: string) => t.toLowerCase().trim());
  } catch {
    // fallback: split by commas or newlines
    return raw
      .replace(/[\[\]\"]/g, "")
      .split(/[,\n]/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

export async function generateSummary(
  settings: AISettings,
  link: LinkEntity
): Promise<string | null> {
  if (!settings.featureToggles.summary) return null;

  const prompt = `Write a 1-2 sentence summary of what this page is about.
URL: ${link.url}
Title: ${link.title}
Description: ${link.description || ""}`;

  return await callAI(settings, [
    {
      role: "system",
      content:
        "You write concise, factual summaries. Respond with plain text only.",
    },
    { role: "user", content: prompt },
  ]);
}

export async function suggestCategory(
  settings: AISettings,
  link: LinkEntity,
  existingCategories: string[]
): Promise<string | null> {
  if (!settings.featureToggles.categorization) return null;

  const prompt = `Suggest the best category for this link from the existing ones, or propose a new short category name. Return ONLY the category name.
Existing categories: ${existingCategories.join(", ") || "none"}
URL: ${link.url}
Title: ${link.title}`;

  return await callAI(settings, [
    {
      role: "system",
      content:
        "You categorize web content. Respond with a single category name only.",
    },
    { role: "user", content: prompt },
  ]);
}

export async function detectContentType(
  settings: AISettings,
  link: LinkEntity
): Promise<string | null> {
  if (!settings.featureToggles.contentType) return null;

  const prompt = `Classify this link as one of: article, video, tool, repo, documentation, paper, image, audio, other. Return ONLY the word.
URL: ${link.url}
Title: ${link.title}`;

  return await callAI(settings, [
    {
      role: "system",
      content:
        "You classify web content. Respond with a single lowercase word from the allowed list.",
    },
    { role: "user", content: prompt },
  ]);
}
