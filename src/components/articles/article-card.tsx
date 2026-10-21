import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/types";

export function ArticleCard({ article, compact = false, largeImage = false }: { article: Article; compact?: boolean; largeImage?: boolean }) {
  return (
    <Link
      href={`/portal/articles/${article.slug}`}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg">
        {!compact && article.image && (
          <div className={`relative w-full ${largeImage ? "h-64 md:h-72" : "h-48"}`}>
            <Image
              src={article.image}
              alt={article.imageAlt || article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              style={largeImage ? { objectPosition: "center 78%" } : undefined}
            />
          </div>
        )}
        <CardContent className={compact ? "p-4" : "p-5"}>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-primary">{article.categoryName}</span>
            {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          </div>
          <h3 className={`mt-2 font-medium leading-snug hover:underline ${compact ? "text-sm" : "text-lg"}`}>
            {article.title}
          </h3>
          {!compact && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>}
          {!compact && article.location && (
            <p className="mt-2 text-xs text-muted-foreground">{article.location}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
