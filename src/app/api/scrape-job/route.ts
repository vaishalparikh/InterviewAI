import { NextResponse } from "next/server";

export const runtime = "nodejs";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

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

  // Network fetch with timeout
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(parsed.href, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        error: `Page returned HTTP ${res.status}. Try pasting the company + description manually.`,
      });
    }

    const html = await res.text();
    const data = extract(html, parsed);

    // If we got nothing useful, signal to user
    if (!data.company && !data.description) {
      return NextResponse.json({
        ok: false,
        error:
          "We couldn't read this page (it may require JavaScript). Please enter the details manually.",
      });
    }

    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({
      ok: false,
      error: msg.includes("aborted")
        ? "The page took too long to respond."
        : "Couldn't reach that page. Please check the URL.",
    });
  } finally {
    clearTimeout(t);
  }
}

function extract(html: string, url: URL) {
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

  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const ogTitle = meta("og:title");
  const ogDesc = meta("og:description");
  const ogSite = meta("og:site_name");
  const metaDesc = meta("description");

  // Company heuristic — prefer og:site_name, then derived from hostname
  let company =
    ogSite ||
    extractCompanyFromTitle(titleTag) ||
    capitalize(url.hostname.replace(/^www\./, "").split(".")[0]);

  // Title heuristic — strip company suffix when present
  const title = (ogTitle || titleTag || stripTags(h1) || "").trim();
  const cleanTitle = title.replace(new RegExp(`\\s*[-|·–]\\s*${escapeRe(company)}.*$`, "i"), "").trim();

  // Description: prefer og:description, fallback to meta description, fallback to body text snippet
  const bodySnippet = decodeEntities(stripBody(html)).slice(0, 2400);
  const rawDescription = ogDesc || metaDesc || bodySnippet;

  // Stitch a useful description
  const description = [cleanTitle && cleanTitle !== company ? `Role: ${cleanTitle}` : null, rawDescription]
    .filter(Boolean)
    .join("\n\n")
    .replace(/\s+/g, " ")
    .replace(/\n /g, "\n")
    .trim()
    .slice(0, 1500);

  return {
    title: cleanTitle || undefined,
    company: company?.slice(0, 80) || undefined,
    description: description || undefined,
  };
}

function extractCompanyFromTitle(title?: string) {
  if (!title) return undefined;
  // "Senior Engineer at Acme · LinkedIn"  →  "Acme"
  // "Senior Engineer - Acme | Greenhouse" →  "Acme"
  const at = title.match(/\bat\s+([A-Z][A-Za-z0-9& .]+?)(?:\s*[-|·•–]|\s*$)/);
  if (at) return at[1].trim();
  return undefined;
}

function stripTags(s?: string) {
  return s
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
