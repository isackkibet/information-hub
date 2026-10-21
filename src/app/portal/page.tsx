import Link from "next/link";
import Image from "next/image";
import { Search, Radio, Mic, Video, Newspaper, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { articles, categories, mediaItems } from "@/data";
import { formatDate } from "@/lib/utils";
import { TopicCard } from "@/components/portal/topic-card";
import { ArticleCard } from "@/components/articles/article-card";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function PortalPage() {
  const published = articles.filter((a) => a.status === "published");
  const latest = published.slice(0, 4);
  const featured = published[0];
  const cats = categories.filter((c) => c.enabled);
  const media = mediaItems.slice(0, 4);

  return (
    <AuthGuard type="auth">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Portal</h1>
            <p className="text-muted-foreground">
              Community news, stories, reports and knowledge for the Lake Victoria Basin.
            </p>
          </div>
          <form action="/portal/search" className="flex w-full max-w-md gap-2">
            <Input name="q" placeholder="Search stories, reports, media..." />
            <Button type="submit">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Topics</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cats.map((c) => (
              <TopicCard key={c.id} category={c} />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Featured article</h2>
              <Link href="/ai-assistant" className="text-sm text-primary hover:underline">
                Ask AI about stories
              </Link>
            </div>
            {featured && (
              <Card className="mt-4 overflow-hidden">
                {featured.image && (
                  <div className="relative h-64 w-full">
                    <Image
                      src={featured.image}
                      alt={featured.imageAlt || featured.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-medium text-primary">{featured.categoryName}</span>
                    {featured.publishedAt && <span>{formatDate(featured.publishedAt)}</span>}
                  </div>
                  <Link
                    href={`/portal/articles/${featured.slug}`}
                    className="mt-2 block text-2xl font-semibold hover:underline"
                  >
                    {featured.title}
                  </Link>
                  <p className="mt-2 text-muted-foreground">{featured.summary}</p>
                  {featured.location && (
                    <p className="mt-1 text-sm text-muted-foreground">{featured.location}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/portal/articles/${featured.slug}`}>
                      <Button>Read article</Button>
                    </Link>
                    <Link
                      href={`/ai-assistant?context=${encodeURIComponent(featured.title)}&href=${encodeURIComponent(`/portal/articles/${featured.slug}`)}`}
                    >
                      <Button variant="outline">Ask AI about this article</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold">Latest published</h2>
            <div className="mt-4 space-y-3">
              {latest.map((a) => (
                <ArticleCard key={a.id} article={a} compact />
              ))}
            </div>
            <Link
              href="/portal/search"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Browse all stories <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Radio, Podcasts, Videos & Community Newspapers</h2>
            <Link href="/portal/media" className="text-sm text-primary hover:underline">
              View all media
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {media.map((m) => (
              <Link key={m.id} href={`/portal/media/${m.id}`}>
                <Card className="overflow-hidden transition hover:shadow-md">
                  {m.image && (
                    <div className="relative h-36 w-full">
                      <Image src={m.image} alt={m.title} fill className="object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {m.type === "radio" && <Radio className="h-3 w-3" />}
                      {m.type === "podcast" && <Mic className="h-3 w-3" />}
                      {m.type === "video" && <Video className="h-3 w-3" />}
                      {m.type === "newspaper" && <Newspaper className="h-3 w-3" />}
                      <span className="capitalize">{m.type}</span>
                      {m.duration && <span>• {m.duration}</span>}
                    </div>
                    <p className="mt-1 font-medium">{m.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Approved community reports (Demo)</h2>
          <p className="text-sm text-muted-foreground">
            Community reports appear here when marked approved in the workflow (demo data only).
          </p>
          <Card className="mt-4">
            <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              No approved community reports are marked as published in the current demo set. Use{" "}
              <Link href="/submit" className="text-primary hover:underline">
                Submit a Report
              </Link>{" "}
              to see the reporting flow.
            </CardContent>
          </Card>
        </section>
      </div>
    </AuthGuard>
  );
}
