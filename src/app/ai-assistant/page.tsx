"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { aiService } from "@/frontend/services";
import { Plus, Send, MessageSquare, Sparkles, AlertTriangle, RotateCcw } from "lucide-react";
import { AuthGuard } from "@/components/layout/auth-guard";

const starters = [
  "Find a story about wetland restoration",
  "Summarise a published SIHU article",
  "What are communities doing to protect Lake Victoria?",
  "Explore a Sustainable Development Goal",
];

type Msg = {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ label: string; href: string }>;
};

function AssistantContent() {
  const sp = useSearchParams();
  const ctxTitle = (sp.get("context") || "").slice(0, 300);
  const ctxHref = (sp.get("href") || "").slice(0, 500);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const history = [{ id: "h1", title: "New Chat" }];

  const send = useCallback(async (retry = false) => {
    if (loading || (!retry && !input.trim())) return;
    const conversation = retry
      ? messages
      : [...messages, { role: "user" as const, content: input.trim() }];
    if (!retry) {
      setMessages(conversation);
      setInput("");
    }
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.chat(
        conversation,
        ctxTitle ? { articleTitle: ctxTitle, articleHref: ctxHref } : undefined
      );
      setMessages((m) => [...m, { role: "assistant", content: res.reply, sources: res.sources }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [input, messages, ctxTitle, ctxHref, loading]);

  const newChat = () => {
    setMessages([]);
    setInput("");
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions, find published SIHU stories, and get article summaries with links to sources.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={newChat} disabled={loading}>
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Chat history sidebar */}
        <Card className="hidden lg:block">
          <CardContent className="p-3">
            <p className="text-sm font-medium">Chat history</p>
            <div className="mt-2 space-y-1">
              {history.map((h) => (
                  <div key={h.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  {h.title}
                  </div>
              ))}
              <p className="px-2 pt-2 text-xs text-muted-foreground">Chat history is not saved yet.</p>
            </div>
          </CardContent>
        </Card>

        {/* Main chat area */}
        <Card>
          <CardContent className="flex h-[65vh] flex-col p-0">
            <div className="flex-1 overflow-auto p-4">
              {ctxTitle && (
                <div className="mb-4 rounded-md border border-border bg-muted/50 p-3 text-sm">
                  <p className="font-medium">Article context</p>
                  <p className="mt-1 text-muted-foreground">{ctxTitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">The assistant will use this published article and link to it when available.</p>
                </div>
              )}

              {messages.length === 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Suggested starter questions</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {starters.map((s) => (
                      <button
                        key={s}
                        className="rounded-md border border-border p-3 text-left text-sm hover:bg-muted"
                        onClick={() => setInput(s)}
                      >
                        <Sparkles className="mb-1 h-4 w-4 text-primary" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[80%] rounded-lg bg-primary px-4 py-2 text-primary-foreground"
                        : "max-w-[80%] rounded-lg bg-muted px-4 py-2"
                    }
                  >
                    <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {m.sources.map((s, j) => (
                          <a key={j} href={s.href} className="block text-xs underline opacity-90">
                            Source: {s.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
                    Groq is thinking...
                  </div>
                )}

                {error && (
                  <div className="max-w-[80%] rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm dark:border-rose-800 dark:bg-rose-950">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="mt-1 text-rose-600 dark:text-rose-400">{error}</p>
                    <Button size="sm" variant="outline" className="mt-2" disabled={loading} onClick={() => send(true)}>
                      <RotateCcw className="h-3 w-3" />
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about a topic or published SIHU story..."
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void send();
                    }
                  }}
                />
                <Button onClick={() => send()} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                AI cannot approve articles, verify reports, publish content, or access private SIHU data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AiAssistantPage() {
  return (
    <AuthGuard type="auth">
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-6">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          </div>
        }
      >
        <AssistantContent />
      </Suspense>
    </AuthGuard>
  );
}
