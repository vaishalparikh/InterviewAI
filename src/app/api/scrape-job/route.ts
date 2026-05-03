import { NextResponse } from "next/server";

export const runtime = "nodejs";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

type ScrapeResult = {
  company?: string;
  description?: string;
  title?: string;
};

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ ok: false, error: "URL is required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
  } catch {
    return NextResponse.json({ ok: false, error: "That doesn't look like a valid URL." }, { status: 400 });
  }

  // 1) Try direct fetch + HTML parse — fast, works on SSR pages
  const direct = await tryDirect(parsed.href).catch(() => null);

  // 2) If direct didn't return enough, fall back to Jina AI Reader (free, runs headless browser)
  const isThin = !direct || !direct.description || direct.description.trim().length < 80;
  let result: ScrapeResult | null = direct;

  if (isThin) {
    const jina = await tryJina(parsed.href).catch(() => null);
    if (jina) {
      result = {
        // prefer Jina's longer description; fall back to direct values
        company: direct?.company || jina.company,
        title: jina.title || direct?.title,
        description: jina.description || direct?.description,
      };
    }
  }

  if (!result || (!result.company && !result.description)) {
    return NextResponse.json({
      ok: false,
      error:
        "We couldn't read this page. Please paste the company and description manually.",
    });
  }

  return NextResponse.json({ ok: true, ...result });
}

/* ----------------------- direct HTML fetch ----------------------- */

async function tryDirect(url: string): Promise<ScrapeResult | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const html = await res.text();
    return extractFromHtml(html, new URL(url));
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractFromHtml(html: string, url: URL): ScrapeResult {
  const meta = (key: string) => {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${key}["']`, "i"),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m) return decodeEntities(m[1]).trim();
    }
    return undefined;
  };

  const titleTag = decodeEntities(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "");
  const ogTitle = meta("og:title");
  const ogDesc = meta("og:description");
  const ogSite = meta("og:site_name");
  const metaDesc = meta("description");

  const company =
    ogSite ||
    extractCompanyFromTitle(titleTag) ||
    capitalize(url.hostname.replace(/^www\./, "").split(".")[0]);

  const title = (ogTitle || titleTag).trim();
  const cleanTitle = title
    .replace(new RegExp(`\\s*[-|·–]\\s*${escapeRe(company)}.*$`, "i"), "")
    .trim();

  const bodySnippet = decodeEntities(stripBody(html)).slice(0, 2400);
  const rawDescription = ogDesc || metaDesc || bodySnippet;

  const description = compose(cleanTitle, company, rawDescription);

  return {
    title: cleanTitle || undefined,
    company: cleanCompany(company)?.slice(0, 80) || undefined,
    description: description || undefined,
  };
}

/* ----------------------- Jina AI Reader fallback ----------------------- */
// https://r.jina.ai converts any URL to clean LLM-friendly text. Free without API key.

async function tryJina(url: string): Promise<ScrapeResult | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Accept: "text/plain",
        "User-Agent": UA,
      },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const md = await res.text();
    return extractFromMarkdown(md, new URL(url));
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractFromMarkdown(md: string, url: URL): ScrapeResult {
  // Jina's response format:
  //   Title: <page title>
  //   URL Source: <url>
  //   Markdown Content:
  //   <actual content>
  const titleMatch = md.match(/^Title:\s*(.+)$/m);
  const contentStart = md.indexOf("Markdown Content:");
  let content =
    contentStart >= 0 ? md.slice(contentStart + "Markdown Content:".length) : md;

  const headerTitle = titleMatch?.[1]?.trim();

  // 1) Skip past site navigation — find a "real content" landmark
  const landmark = findContentLandmark(content);
  if (landmark > 0) {
    content = content.slice(landmark);
  }

  // 1.5) Truncate before footer-ish stops (Apply now / Equal opportunity / etc.)
  const stop = findContentEnd(content);
  if (stop > 200) {
    content = content.slice(0, stop);
  }

  // 2) Strip markdown formatting
  let plain = content
    .replace(/!\[.*?\]\(.*?\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → label only
    .replace(/`{1,3}[^`]*`{1,3}/g, " ") // code
    .replace(/^#+\s*/gm, "") // heading markers
    .replace(/^[*\-+]\s+/gm, "• ") // bullet markers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/^\s*\|.*\|\s*$/gm, ""); // table rows

  // 3) De-duplicate consecutive identical lines (Jina often repeats title 3-4×)
  plain = dedupeLines(plain);

  // 4) Drop nav-like lines (very short, single-word, list of links)
  plain = dropNavNoise(plain);

  // 5) Final whitespace normalization
  plain = plain
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Company detection
  const company =
    extractCompanyFromTitle(headerTitle) ||
    capitalize(url.hostname.replace(/^www\./, "").split(".")[0]);

  // Clean role title (strip company suffix)
  const cleanTitle = (headerTitle ?? "")
    .replace(new RegExp(`\\s*[-|·–]\\s*${escapeRe(company)}.*$`, "i"), "")
    .trim();

  const description = compose(cleanTitle, company, plain.slice(0, 2500));

  return {
    title: cleanTitle || undefined,
    company: cleanCompany(company)?.slice(0, 80) || undefined,
    description: description || undefined,
  };
}

// Find where the actual job content starts on a page — common headings.
// Searches in priority tiers — most JD-specific markers first; broad fallbacks last.
function findContentLandmark(content: string): number {
  // Match landmark phrase at the start of a line, allowing markdown wrappers
  // (##, **, >, _, -) and any trailing punctuation/content.
  const wrap = (phrase: string) =>
    new RegExp(`(?:^|\\n)[\\s*#>_\\-]*${phrase}\\b`, "i");

  // Tier 1 — explicit job-description headings. These almost always sit right above
  // the actual JD body.
  const tier1 = [
    "job description",
    "key job responsibilities",
    "key responsibilities",
    "main responsibilities",
    "primary responsibilities",
    "responsibilities and qualifications",
    "what you['']?ll do",
    "what you will do",
    "what you['']?ll be doing",
    "what you will be doing",
    "what you['']?d be doing",
    "your responsibilities",
    "duties and responsibilities",
    "role description",
    "role overview",
    "position description",
    "position summary",
    "position overview",
    "job summary",
    "job overview",
    "job purpose",
    "the opportunity",
  ];

  // Tier 2 — context headings; usually sit just before the JD body.
  const tier2 = [
    "about (?:the|this) (?:team|role|position|job)",
    "the role",
    "responsibilities",
    "what we['']?re looking for",
    "your impact",
    "your mission",
  ];

  // Tier 3 — generic catch-alls. Avoid when better markers exist (these can match
  // a company "About us" section that comes before nav chrome).
  const tier3 = [
    "about (?:the )?company",
    "about us",
    "overview",
    "description",
  ];

  for (const tier of [tier1, tier2, tier3]) {
    let earliest = -1;
    for (const phrase of tier) {
      const re = wrap(phrase);
      const m = content.match(re);
      if (m && m.index !== undefined) {
        if (earliest === -1 || m.index < earliest) earliest = m.index;
      }
    }
    if (earliest !== -1) return earliest;
  }
  return -1;
}

// Truncate after the JD ends — when we hit a clear "footer-ish" section.
function findContentEnd(content: string): number {
  const stops = [
    /(?:^|\n)\s*#*\s*(?:apply now|apply for this job|how to apply)\b/i,
    /(?:^|\n)\s*#*\s*equal (?:employment|opportunity)\b/i,
    /(?:^|\n)\s*#*\s*(?:our )?diversity (?:and inclusion|statement)\b/i,
    /(?:^|\n)\s*#*\s*privacy (?:policy|notice)\b/i,
    /(?:^|\n)\s*#*\s*cookie (?:policy|notice)\b/i,
    /(?:^|\n)\s*#*\s*terms (?:of service|of use|and conditions)\b/i,
    /(?:^|\n)\s*#*\s*(?:share this job|share this role)\b/i,
    /(?:^|\n)\s*#*\s*follow us\b/i,
    /(?:^|\n)\s*#*\s*subscribe\b/i,
    /(?:^|\n)\s*#*\s*join our (?:talent )?community\b/i,
  ];
  let earliest = -1;
  for (const re of stops) {
    const m = content.match(re);
    if (m && m.index !== undefined) {
      if (earliest === -1 || m.index < earliest) earliest = m.index;
    }
  }
  return earliest;
}

// Collapse runs of identical lines (case-insensitive)
function dedupeLines(s: string): string {
  const lines = s.split("\n");
  const out: string[] = [];
  let prev = "";
  for (const line of lines) {
    const k = line.trim().toLowerCase();
    if (k && k === prev) continue;
    out.push(line);
    if (k) prev = k;
  }
  return out.join("\n");
}

// Drop lines that look like navigation chrome — short bullets, single words, empty headings
function dropNavNoise(s: string): string {
  const lines = s.split("\n");
  const out: string[] = [];
  let consecutiveShortBullets = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      out.push("");
      consecutiveShortBullets = 0;
      continue;
    }

    const isShortBullet = /^•\s+/.test(line) && line.length < 30;
    if (isShortBullet) {
      consecutiveShortBullets++;
      // Drop runs of short bullets (typical nav lists)
      if (consecutiveShortBullets >= 2) continue;
    } else {
      consecutiveShortBullets = 0;
    }

    // Drop very short standalone lines that are typical of menus
    if (line.length < 15 && !/[.?!:]$/.test(line) && /^[A-Z]/.test(line)) {
      // Probably a menu label like "Jobs", "Companies", "Services"
      // Only drop if surrounded by similar-looking lines (likely navigation block)
      const prev = out[out.length - 1]?.trim() ?? "";
      const isPrevAlsoShort = prev && prev.length < 25;
      if (isPrevAlsoShort) continue;
    }

    out.push(raw);
  }
  return out.join("\n");
}

/* ----------------------- helpers ----------------------- */

function compose(title: string, company: string, body: string) {
  const reformatted = reformatJD(body);
  const lines = [
    title && title.toLowerCase() !== company.toLowerCase() ? `Role: ${title}` : null,
    reformatted,
  ].filter(Boolean);
  return lines
    .join("\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 2500);
}

// Many extracted pages (esp. Amazon.jobs via Jina) return JD as one big paragraph
// with no newlines before section headings or bullets. Re-introduce structure.
function reformatJD(text: string): string {
  // 1) Sentence break — lowercase letter immediately followed by Capital letter
  //    after a period (no space). Avoids splitting on abbreviations like "U.S."
  //    because we require lowercase before the period.
  text = text.replace(/([a-z])\.([A-Z])/g, "$1.\n\n$2");

  // 2) Paragraph break before known JD section headings when joined into prose.
  //    Sorted longest-first so "Key job responsibilities" splits before
  //    a shorter phrase ever has a chance to match its inner words.
  //    Bare ambiguous words ("Responsibilities", "Qualifications", "Description")
  //    are intentionally excluded — they collide with longer phrases.
  const sections = [
    "Key job responsibilities",
    "Duties and responsibilities",
    "Responsibilities and qualifications",
    "What you['']?ll be doing",
    "What you will be doing",
    "What you['']?d be doing",
    "What we['']?re looking for",
    "Preferred qualifications",
    "Required qualifications",
    "Minimum qualifications",
    "Position description",
    "Position overview",
    "Position summary",
    "Primary responsibilities",
    "Main responsibilities",
    "Your responsibilities",
    "Key responsibilities",
    "Basic qualifications",
    "About the position",
    "About the company",
    "About this role",
    "About the team",
    "About the role",
    "About the job",
    "Role description",
    "Role overview",
    "Job description",
    "Job overview",
    "Job summary",
    "Job purpose",
    "What you['']?ll do",
    "What you will do",
    "The opportunity",
    "Nice to have",
    "Your impact",
    "Your mission",
    "Compensation",
    "Benefits",
    "Why join",
    "About us",
    "The role",
  ];

  for (const phrase of sections) {
    // Lookbehind: previous char must be lowercase letter, digit, or sentence punctuation.
    //   This prevents matching the inner "Responsibilities" inside "Key job
    //   Responsibilities" because the char before would be space, not a word/punct.
    // Lookahead: next char must be whitespace, capital letter, or end of string.
    //   Catches "About the teamShipTech" (capital S after "team").
    const re = new RegExp(
      `(?<=[a-z0-9\\.\\)!\\?])\\s+(${phrase})(?=\\s|[A-Z]|$)`,
      "gi",
    );
    text = text.replace(re, (_full, head) => `\n\n${head}\n`);
  }

  // 3) Split inline bullets — Jina sometimes glues `- Item1- Item2- Item3`.
  text = text.replace(/([^\n\-])\s*-\s+([A-Z])/g, "$1\n- $2");

  // 4) Whitespace normalization
  text = text
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

// Strip common domain/junk suffixes from auto-detected company name
function cleanCompany(c?: string): string | undefined {
  if (!c) return c;
  return c
    .replace(/\.(jobs|careers|com|io|net|org|co|app|ai)$/i, "")
    .replace(/\s+(?:home page|jobs home|careers|jobs)\s*$/i, "")
    .trim();
}

function extractCompanyFromTitle(title?: string) {
  if (!title) return undefined;
  const at = title.match(/\bat\s+([A-Z][A-Za-z0-9& .]+?)(?:\s*[-|·•–]|\s*$)/);
  if (at) return at[1].trim();
  return undefined;
}

function stripBody(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(s: string) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
