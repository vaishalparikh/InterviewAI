import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Map our display labels to actual OpenAI model IDs.
// Anthropic/Claude labels fall back to a sensible OpenAI default for now.
const MODEL_MAP: Record<string, string> = {
  "GPT-4.1 Mini": "gpt-4o-mini",
  "GPT-4.1": "gpt-4o",
  "GPT-5": "gpt-4o",
  "Claude 4 Sonnet": "gpt-4o-mini",
  "Claude 4 Opus": "gpt-4o",
};

type SessionContext = {
  title: string;
  description: string;
  mode: "interview" | "regular";
  language: string;
  simpleLanguage: boolean;
  extraContext?: string;
  aiModel: string;
  resumeName?: string;
};

type Body = {
  question?: string;
  transcript?: string[];
  session: SessionContext;
  screenshotDataUrl?: string;
};

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "PASTE_FROM_OPENAI") {
    return NextResponse.json(
      {
        error:
          "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { question, transcript = [], session, screenshotDataUrl } = body;
  if (!session) {
    return NextResponse.json({ error: "Missing session context" }, { status: 400 });
  }

  const model = screenshotDataUrl ? "gpt-4o" : MODEL_MAP[session.aiModel] || "gpt-4o-mini";
  const systemPrompt = buildSystemPrompt(session);
  const userPrompt = buildUserPrompt(question, transcript);

  type ContentPart =
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } };

  const userContent: ContentPart[] = [{ type: "text", text: userPrompt }];
  if (screenshotDataUrl) {
    userContent.push({ type: "image_url", image_url: { url: screenshotDataUrl } });
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent.length === 1 ? userPrompt : userContent },
  ];

  let upstream: Response;
  try {
    upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 900,
      }),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Network error reaching OpenAI" },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    let detail = "";
    try {
      detail = await upstream.text();
    } catch {
      /* noop */
    }
    return NextResponse.json(
      { error: `OpenAI ${upstream.status}: ${detail.slice(0, 200) || "request failed"}` },
      { status: upstream.status },
    );
  }

  // Stream the SSE body straight through to the client.
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function buildSystemPrompt(session: SessionContext): string {
  const tone = session.simpleLanguage
    ? "Use simple, clear language. Avoid jargon. Keep sentences short."
    : "Be precise and use appropriate technical vocabulary.";

  const language = session.language || "English";

  if (session.mode === "interview") {
    return [
      `You are an AI interview copilot helping a candidate during a live job interview.`,
      `Company: ${session.title}.`,
      `Role / Job description: ${session.description}.`,
      session.resumeName
        ? `The candidate has uploaded their resume: "${session.resumeName}". Reference it generically.`
        : `The candidate has not uploaded a resume; speak generically about their experience.`,
      ``,
      `Your job: when given the most recent thing the interviewer asked (or the candidate's transcript), produce the answer the candidate should say. Speak in the first person AS THE CANDIDATE.`,
      ``,
      `Guidelines:`,
      `• For behavioral questions, use the STAR framework (Situation, Task, Action, Result).`,
      `• For technical questions, give a structured, confident answer with one or two concrete examples.`,
      `• For coding questions in screenshots, explain your approach + provide working code in a fenced block.`,
      `• Keep most answers under 200 words unless the question is deeply technical.`,
      `• ${tone}`,
      `• Respond in ${language}.`,
      ``,
      session.extraContext ? `Extra instructions from the candidate: ${session.extraContext}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  // Regular call mode
  return [
    `You are an AI call assistant helping with a call titled "${session.title}".`,
    session.description ? `Context: ${session.description}.` : "",
    `When given the recent conversation, suggest what the user should say next.`,
    `Keep replies brief and helpful. ${tone} Respond in ${language}.`,
    session.extraContext ? `Extra instructions: ${session.extraContext}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildUserPrompt(question: string | undefined, transcript: string[]): string {
  const recent = transcript.slice(-12).join("\n");
  if (question && question.trim()) {
    return [
      `The interviewer just asked: "${question.trim()}"`,
      recent ? `\nRecent context (what I've said so far):\n${recent}` : "",
      `\nGenerate my answer.`,
    ].join("");
  }
  if (recent) {
    return [
      `Based on the recent transcript below, infer the question being asked and produce my answer.`,
      `\n\nRecent transcript:\n${recent}`,
    ].join("");
  }
  return `The interview just started. Reply with a brief, professional opener acknowledging the interviewer and inviting them to ask the first question.`;
}
