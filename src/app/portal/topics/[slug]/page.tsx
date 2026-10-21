import { notFound } from "next/navigation";
import { getArticles, getCategories } from "@/backend/queries";
import { ArticleCard } from "@/components/articles/article-card";
import { AuthGuard } from "@/components/layout/auth-guard";

export const instant = false;

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const categories = await getCategories(true);
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const list = await getArticles({ categorySlug: slug, status: "published" });

  return (
    <AuthGuard type="auth">
      <div className="container mx-auto px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">{cat.name}</h1>
          <p className="mt-1 text-muted-foreground">{cat.description}</p>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="mt-6 text-muted-foreground">No published articles in this topic yet.</p>
        )}
      </div>
    </AuthGuard>
  );
}
