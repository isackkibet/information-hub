import Link from "next/link";
import Image from "next/image";
import { mediaItems } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Radio, Mic, Video, Newspaper } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function MediaPage() {
  return (
    <AuthGuard type="auth">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Media &amp; Community Knowledge</h1>
            <p className="text-muted-foreground">Radio, podcasts, audio, videos and community newspapers (demo content).</p>
          </div>
          <Link href="/portal" className="text-sm text-primary hover:underline">Back to Portal</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mediaItems.map((m) => (
            <Link key={m.id} href={`/portal/media/${m.id}`}>
              <Card className="overflow-hidden transition hover:shadow-md">
                {m.image && (
                  <div className="relative h-40 w-full">
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
                  <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(m.publishedAt)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
