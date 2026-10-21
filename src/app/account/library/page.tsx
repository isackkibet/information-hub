"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { contentApi } from "@/frontend/services";
import type { Article } from "@/types";
import { useSession } from "@/hooks/use-session";
import { ArticleCard } from "@/components/articles/article-card";
import { useToast } from "@/components/ui/toast";
import { Trash2, BookmarkX } from "lucide-react";

const STORAGE_KEY = "sihu_library";

function getSavedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setSavedSlugs(slugs: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event("storage"));
}

export default function LibraryPage() {
  const { toast } = useToast();
  const { session, loading } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [saved, setSaved] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return getSavedSlugs();
  });

  useEffect(() => {
    const handler = () => setSaved(getSavedSlugs());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    if (!session.isAuthenticated) return;

    let active = true;
    contentApi
      .getArticles()
      .then((data) => {
        if (active) setArticles(data);
      })
      .catch(() => {
        if (active) setArticles([]);
      });

    return () => {
      active = false;
    };
  }, [session.isAuthenticated]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!session.isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold">Sign-in required</h1>
        <p className="text-muted-foreground">Please sign in to view your library.</p>
        <Link href="/sign-in?redirect=%2Faccount%2Flibrary">
          <Button className="mt-3">Go to Sign in</Button>
        </Link>
      </div>
    );
  }

  const savedArticles = articles.filter((a) => saved.includes(a.slug));

  const removeArticle = (slug: string) => {
    const updated = saved.filter((s) => s !== slug);
    setSavedSlugs(updated);
    setSaved(updated);
    toast("Article removed from library", "info");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Library</h1>
          <p className="text-muted-foreground">
            Saved articles and resources.
          </p>
        </div>
        {savedArticles.length > 0 && (
          <p className="text-sm text-muted-foreground">{savedArticles.length} saved</p>
        )}
      </div>

      {savedArticles.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BookmarkX className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Your library is empty</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Browse the Portal and save articles to your library for quick access later.
              Saved articles are stored locally in your browser.
            </p>
            <Link href="/portal">
              <Button size="sm" className="mt-2">Browse the Portal</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedArticles.map((a) => (
            <div key={a.id} className="relative">
              <ArticleCard article={a} />
              <button
                onClick={() => removeArticle(a.slug)}
                className="absolute right-2 top-2 rounded-full bg-card p-2 shadow-md hover:bg-muted"
                aria-label="Remove from library"
              >
                <Trash2 className="h-4 w-4 text-rose-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
