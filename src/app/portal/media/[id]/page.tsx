import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mediaItems } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Radio, Mic, Video, Newspaper, Play } from "lucide-react";
import { AuthGuard } from "@/components/layout/auth-guard";

export default async function MediaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = mediaItems.find((m) => m.id === id);
  if (!item) notFound();
  return (
    <AuthGuard type="auth">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
        <Link href="/portal/media" className="text-sm text-primary hover:underline">Back to Media</Link>
        <h1 className="mt-3 text-2xl font-semibold">{item.title}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          {item.type==="radio"&&<Radio className="h-4 w-4"/>}{item.type==="podcast"&&<Mic className="h-4 w-4"/>}{item.type==="video"&&<Video className="h-4 w-4"/>}{item.type==="newspaper"&&<Newspaper className="h-4 w-4"/>}
          <span className="capitalize">{item.type}</span>{item.duration&&<span>• {item.duration}</span>}<span>• {formatDate(item.publishedAt)}</span>
        </div>
        {item.image && <div className="relative mt-6 h-64 w-full overflow-hidden rounded-lg"><Image src={item.image} alt={item.title} fill className="object-cover" /></div>}
        <p className="mt-4 text-muted-foreground">{item.description}</p>
        <Card className="mt-6">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Playback (Demo)</p>
              <p className="text-sm text-muted-foreground">No media player backend connected. This is a placeholder for radio/podcast/video/newspaper content.</p>
            </div>
            <Button variant="outline"><Play className="h-4 w-4" />Play</Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </AuthGuard>
  );
}
