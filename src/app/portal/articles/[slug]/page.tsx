import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Sparkles, AlertCircle } from "lucide-react";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleActions } from "@/components/articles/article-actions";

import { AuthGuard } from "@/components/layout/auth-guard";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  const related = articles
    .filter((a) => a.slug !== slug && a.categorySlug === article.categorySlug && a.status === "published")
    .slice(0, 3);

  return (
    <AuthGuard type="auth">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/portal" className="hover:underline">Portal</Link>
          <span>/</span>
          <Link href={`/portal/topics/${article.categorySlug}`} className="hover:underline">{article.categoryName}</Link>
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{article.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {article.authorName && <span>By {article.authorName}</span>}
          {article.publishedAt && <span>Published {formatDate(article.publishedAt)}</span>}
          {article.updatedAt && <span>Updated {formatDate(article.updatedAt)}</span>}
          {article.location && <span>Location: {article.location}</span>}
        </div>

        {/* Client-side interactive actions */}
        <ArticleActions slug={article.slug} title={article.title} />

        <Link
          href={`/ai-assistant?context=${encodeURIComponent(article.title)}&href=${encodeURIComponent(`/portal/articles/${article.slug}`)}`}
          className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI about this article
        </Link>

        <p className="mt-2 text-xs text-muted-foreground">
          Language distinction: English/Swahili listening controls are represented. Actual playback requires a
          connected speech service.
        </p>

        {article.image && (
          <div className="relative mt-6 h-72 w-full overflow-hidden rounded-lg">
            <Image src={article.image} alt={article.imageAlt || article.title} fill className="object-cover" />
          </div>
        )}

        <p className="mt-6 text-lg text-muted-foreground">{article.summary}</p>

        <article className="prose prose-slate mt-6 max-w-none dark:prose-invert">
          <p>{article.content}</p>
          {article.tags && article.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {article.sourceUrl && (
          <a href={article.sourceUrl} className="mt-4 inline-block text-sm text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            Source link
          </a>
        )}

        <Card className="mt-8">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Report a correction or concern</p>
              <p className="text-sm text-muted-foreground">
                If you notice an issue with this article, please{" "}
                <Link href="/submit" className="text-primary hover:underline">submit a report</Link> with details.
              </p>
            </div>
          </CardContent>
        </Card>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Related stories</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <ArticleCard key={r.id} article={r} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
