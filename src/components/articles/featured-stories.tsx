"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import type { Article } from "@/types";

export function FeaturedStories({ stories }: { stories: Article[] }) {
  const [activeCategory, setActiveCategory] = useState("All stories");
  const categories = ["All stories", ...Array.from(new Set(stories.map((story) => story.categoryName)))];
  const filteredStories = activeCategory === "All stories"
    ? stories
    : stories.filter((story) => story.categoryName === activeCategory);
  const visibleStories = filteredStories.slice(0, 3);

  return (
    <section id="featured-stories" className="scroll-mt-24 container mx-auto px-4 py-12" aria-labelledby="featured-stories-title">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="featured-stories-title" className="text-2xl font-semibold tracking-tight">Featured stories</h2>
          <p className="text-muted-foreground">Selected published stories from the SIHU Portal.</p>
        </div>
        <Link href="/portal" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all in Portal <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter featured stories by topic">
        {categories.map((category) => {
          const selected = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={selected}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background/80 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
        Showing {visibleStories.length} of {filteredStories.length} {activeCategory === "All stories" ? "stories" : activeCategory.toLowerCase() + " stories"}
      </p>

      {visibleStories.length > 0 ? (
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleStories.map((article) => <ArticleCard key={article.id} article={article} largeImage />)}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-border bg-background/80 p-5 text-sm text-muted-foreground">
          No published stories are available in this topic yet.
        </p>
      )}
    </section>
  );
}
