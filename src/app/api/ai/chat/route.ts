type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatContext = { articleTitle?: string; articleHref?: string };
type PublishedArticle = { title: string; slug: string; summary: string; content: string };

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 8_000;
const MAX_TOTAL_LENGTH = 24_000;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return jsonError(
      "The AI assistant is not configured. Add GROQ_API_KEY to .env and restart the dev server.",
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

  let sourceArticles: PublishedArticle[] = [];
  try {
    const { getArticleBySlug, searchAssistantArticles } = await import("@/backend/queries");
    const recentQuestions = messages
      .filter((message) => message.role === "user")
      .slice(-2)
      .map((message) => message.content)
      .join(" ")
      .slice(-1_000);
    sourceArticles = await searchAssistantArticles(recentQuestions);

    const contextSlug = context?.articleHref?.match(/^\/portal\/articles\/([a-z0-9-]+)\/?$/i)?.[1];
    if (contextSlug) {
      const contextualArticle = await getArticleBySlug(contextSlug);
      if (contextualArticle?.status === "published") {
        sourceArticles = [
          {
            title: contextualArticle.title,
            slug: contextualArticle.slug,
            summary: contextualArticle.summary,
            content: contextualArticle.content.slice(0, 1_800),
          },
          ...sourceArticles.filter((article) => article.slug !== contextualArticle.slug),
        ].slice(0, 4);
      }
    }
  } catch {
    // Keep general chat available if article search is temporarily unavailable.
  }

  const articleEvidence = sourceArticles.length
    ? sourceArticles.map((article, index) =>
        `[${index + 1}] ${article.title}\nSummary: ${article.summary}\nArticle text: ${article.content}`
      ).join("\n\n")
    : "No matching published SIHU articles were found for this turn.";

  const systemPrompt = [
    "You are the SIHU AI Assistant for the Sango Information Hub, a community information project serving Kenya's Lake Victoria Basin.",
    "Be clear, useful, and respectful. Keep answers focused. Use the published SIHU article material below when it helps answer the user's question or summarize an article.",
    "Do not invent SIHU article facts, quotations, or sources, or infer causes and outcomes beyond what an article says. If the supplied articles do not answer the question, say so and distinguish general background from SIHU reporting. Cite relevant article titles in your answer.",
    "You may help explain topics, summarize text the user provides, and discuss Lake Victoria community issues. You cannot approve articles, verify reports, publish content, or make account changes.",
    `Published SIHU articles retrieved for this question:\n${articleEvidence}`,
    context && !sourceArticles.some((article) => `/portal/articles/${article.slug}` === context.articleHref)
      ? `The user opened an article titled ${context.articleTitle}, but its published text was not available. Do not infer its contents.`
      : "",
  ].filter(Boolean).join("\n");

  let upstream: Response;
  try {
    upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_completion_tokens: 1_200,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return jsonError("Could not reach the AI service. Check your connection and try again.", 502);
  }

  if (!upstream.ok) {
    return jsonError(
      upstream.status === 401 || upstream.status === 403
        ? "Groq rejected the API key. Check GROQ_API_KEY in .env."
        : `The AI service could not complete the request (HTTP ${upstream.status}). Try again shortly.`,
      502
    );
  }

  let response: {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  try {
    response = await upstream.json();
  } catch {
    return jsonError("The AI service returned an unreadable response. Please try again.", 502);
  }

  const reply = response.choices?.[0]?.message?.content?.trim();

  if (!reply) return jsonError("The AI service returned an empty response. Please try again.", 502);

  const sources = sourceArticles.map((article) => ({
    label: article.title,
    href: `/portal/articles/${article.slug}`,
  }));
  return Response.json({ reply, sources });
}
