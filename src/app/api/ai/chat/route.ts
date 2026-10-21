type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatContext = { articleTitle?: string; articleHref?: string };

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 8_000;
const MAX_TOTAL_LENGTH = 24_000;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return jsonError(
      "Grok is not configured. Add XAI_API_KEY to .env.local and restart the dev server.",
      503
    );
  }

  let body: { messages?: unknown; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("The chat request must contain valid JSON.", 400);
  }

  if (!body || typeof body !== "object" || !Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    return jsonError(`Send between 1 and ${MAX_MESSAGES} chat messages.`, 400);
  }

  const messages: ChatMessage[] = [];
  let totalLength = 0;
  for (const item of body.messages) {
    if (
      !item ||
      typeof item !== "object" ||
      !("role" in item) ||
      !("content" in item) ||
      (item.role !== "user" && item.role !== "assistant") ||
      typeof item.content !== "string" ||
      !item.content.trim() ||
      item.content.length > MAX_MESSAGE_LENGTH
    ) {
      return jsonError("Each message needs a user or assistant role and non-empty text under 8,000 characters.", 400);
    }
    totalLength += item.content.length;
    if (totalLength > MAX_TOTAL_LENGTH) {
      return jsonError("This conversation is too long. Start a new chat and try again.", 400);
    }
    messages.push({ role: item.role, content: item.content.trim() });
  }

  const rawContext = body.context;
  let context: ChatContext | undefined;
  if (rawContext && typeof rawContext === "object") {
    const value = rawContext as Record<string, unknown>;
    const articleTitle = typeof value.articleTitle === "string" ? value.articleTitle.trim().slice(0, 300) : "";
    const articleHref = typeof value.articleHref === "string" && value.articleHref.startsWith("/portal/articles/")
      ? value.articleHref.slice(0, 500)
      : "";
    if (articleTitle) context = { articleTitle, articleHref };
  }

  const systemPrompt = [
    "You are the SIHU AI Assistant for the Sango Information Hub, a community information project serving Kenya's Lake Victoria Basin.",
    "Be clear, useful, and respectful. Keep answers focused. Do not claim to have searched SIHU's article database or live news unless that information is present in the conversation.",
    "Do not invent facts, article details, quotations, or sources. If you are uncertain or the user asks for information that needs current verification, say so plainly.",
    "You may help explain topics, summarize text the user provides, and discuss Lake Victoria community issues. You cannot approve articles, verify reports, publish content, or make account changes.",
    context ? `The user opened this SIHU article: ${context.articleTitle}. Only its title and link are available; do not imply that you have read its full contents.` : "",
  ].filter(Boolean).join("\n");

  let upstream: Response;
  try {
    upstream = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || "grok-4.7",
        input: [{ role: "system", content: systemPrompt }, ...messages],
        max_output_tokens: 1_200,
        store: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return jsonError("Could not reach Grok. Check your connection and try again.", 502);
  }

  if (!upstream.ok) {
    return jsonError(
      upstream.status === 401 || upstream.status === 403
        ? "Grok rejected the API key. Check XAI_API_KEY in .env.local."
        : `Grok could not complete the request (HTTP ${upstream.status}). Try again shortly.`,
      502
    );
  }

  let response: {
    output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  };
  try {
    response = await upstream.json();
  } catch {
    return jsonError("Grok returned an unreadable response. Please try again.", 502);
  }

  const reply = response?.output
    ?.filter((item) => item.type === "message")
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text)
    .join("\n")
    .trim();

  if (!reply) return jsonError("Grok returned an empty response. Please try again.", 502);

  const sources = context?.articleTitle && context.articleHref
    ? [{ label: context.articleTitle, href: context.articleHref }]
    : [];
  return Response.json({ reply, sources });
}
