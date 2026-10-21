import { Suspense } from "react";
import Link from "next/link";
import { searchService } from "@/frontend/services";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type Result = { type: string; id: string; slug?: string; title: string; category?: string; excerpt: string };

async function SearchResults({ q }: { q: string }) {
  const results = await searchService.search(q) as Result[];
  if (!q) return <p className="text-muted-foreground">Enter a search term to find stories, reports or media.</p>;
  if (results.length === 0) return <p className="text-muted-foreground">No results found for &quot;{q}&quot;.</p>;
  return (
    <div className="mt-6 space-y-3">
      {results.map((r, i: number) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="capitalize">{r.type}</span>
              {r.category && <span>{r.category}</span>}
            </div>
            {r.slug ? <Link href={`/portal/articles/${r.slug}`} className="mt-1 block font-medium hover:underline">{r.title}</Link> : <p className="mt-1 font-medium">{r.title}</p>}
            <p className="mt-1 text-sm text-muted-foreground">{r.excerpt}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { AuthGuard } from "@/components/layout/auth-guard";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q || "";
  return (
    <AuthGuard type="auth">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Search</h1>
        <form action="/portal/search" className="mt-4 flex gap-2 max-w-xl">
          <Input name="q" defaultValue={q} placeholder="Search..." />
          <Button type="submit"><Search className="h-4 w-4" />Search</Button>
        </form>
        <Suspense fallback={<p className="mt-6 text-muted-foreground">Searching...</p>}>
          <SearchResults q={q} />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
