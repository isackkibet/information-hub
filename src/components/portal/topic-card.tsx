import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Fish, Users, Scale } from "lucide-react";
import type { Category } from "@/types";

export function TopicCard({ category }: { category: Category }) {
  const iconMap: Record<string, React.ReactNode> = {
    "environment-conservation": <Droplets className="h-6 w-6 text-cyan-600" />,
    "blue-economy": <Fish className="h-6 w-6 text-cyan-600" />,
    "community-development": <Users className="h-6 w-6 text-cyan-600" />,
    "human-rights": <Scale className="h-6 w-6 text-cyan-600" />,
  };

  return (
    <Link href={`/portal/topics/${category.slug}`} className="block">
      <Card className="h-full transition hover:shadow-md">
        <CardContent className="flex items-start gap-3 p-5">
          <div className="rounded-lg bg-cyan-50 p-3 dark:bg-cyan-950/50">
            {iconMap[category.slug] || <Droplets className="h-6 w-6 text-cyan-600" />}
          </div>
          <div>
            <p className="font-medium">{category.name}</p>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{category.description}</p>
            <span className="mt-2 inline-block text-sm text-primary hover:underline">Explore stories</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
