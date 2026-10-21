import Image from "next/image";
import Link from "next/link";
import { getArticles, getMediaItems } from "@/backend/queries";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const instant = false;

const filters = [
  ["all", "All content"],
  ["articles", "Articles"],
  ["videos", "Videos"],
  ["podcasts", "Podcasts"],
  ["images", "Images & Photos"],
] as const;

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [{ type = "all" }, articles, media] = await Promise.all([
    searchParams,
    getArticles({ status: "published", limit: 100 }),
    getMediaItems(),
  ]);

  const filteredArticles = type === "all" || type === "articles" ? articles : [];
  const filteredMedia = media.filter((item) => {
    if (type === "all") return true;
    if (type === "videos") return item.type === "video";
    if (type === "podcasts") return item.type === "podcast" || item.type === "radio";
    if (type === "images") return item.type === "image";
    if (type === "articles") return item.type === "newspaper";
    return false;
  });

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Sango Information Hub</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Media Content</h1>
        <p className="mt-3 text-muted-foreground">Browse published stories, videos, podcasts, and photos from communities around Lake Victoria.</p>
      </div>

      <nav aria-label="Filter media content" className="mt-6 flex flex-wrap gap-2">
        {filters.map(([value, label]) => (
          <Link key={value} href={value === "all" ? "/portal/media" : `/portal/media?type=${value}`} aria-current={type === value ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${type === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}>
            {label}
          </Link>
        ))}
      </nav>

      <section aria-label="Published media content" className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <Link key={`article-${article.id}`} href={`/portal/articles/${article.slug}`} className="group">
            <Card className="h-full overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-md">
              {article.image && <div className="group/image relative h-48 overflow-hidden"><Image src={article.image} alt={article.imageAlt || article.title} fill unoptimized className="object-cover transition-transform duration-500 group-hover/image:scale-105" /></div>}
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Article · {article.categoryName}</p>
                <h2 className="mt-2 text-lg font-semibold group-hover:text-primary">{article.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.summary}</p>
                {article.publishedAt && <p className="mt-3 text-xs text-muted-foreground">{formatDate(article.publishedAt)}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
        {filteredMedia.map((item) => (
          <Link key={item.id} href={`/portal/media/${item.id}`} className="group">
            <Card className="h-full overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-md">
              {item.image && <div className="relative h-48"><Image src={item.image} alt={item.title} fill unoptimized className="object-cover" /></div>}
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {item.type === "image" ? "Images & Photos" : item.type === "radio" ? "Podcast" : item.type}
                  {item.category ? ` · ${item.category}` : ""}
                </p>
                <h2 className="mt-2 text-lg font-semibold group-hover:text-primary">{item.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">{formatDate(item.publishedAt)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filteredArticles.length === 0 && filteredMedia.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3"><CardContent className="p-8 text-center text-muted-foreground">No published content in this category yet.</CardContent></Card>
        )}
      </section>
    </main>
  );
}
