import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMediaItemById } from "@/backend/queries";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Radio, Mic, Video, Newspaper, Image as ImageIcon } from "lucide-react";

export const instant = false;

export default async function MediaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getMediaItemById(id);
  if (!item) notFound();
  return (
    <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
        <Link href="/portal/media" className="text-sm text-primary hover:underline">Back to Media</Link>
        <h1 className="mt-3 text-2xl font-semibold">{item.title}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          {item.type==="radio"&&<Radio className="h-4 w-4"/>}{item.type==="podcast"&&<Mic className="h-4 w-4"/>}{item.type==="video"&&<Video className="h-4 w-4"/>}{item.type==="newspaper"&&<Newspaper className="h-4 w-4"/>}{item.type==="image"&&<ImageIcon className="h-4 w-4"/>}
          <span className="capitalize">{item.type}</span>{item.duration&&<span>• {item.duration}</span>}<span>• {formatDate(item.publishedAt)}</span>
        </div>
        {item.image && <div className="relative mt-6 h-64 w-full overflow-hidden rounded-lg"><Image src={item.image} alt={item.title} fill unoptimized className="object-cover" /></div>}
        <p className="mt-4 text-muted-foreground">{item.description}</p>
        {item.mediaUrl && (item.type === "video" || item.type === "podcast" || item.type === "radio") ? (
          <div className="mt-6 overflow-hidden rounded-lg border border-border bg-black">
            {item.type === "video" && /\.(mp4|webm)(\?|$)/i.test(item.mediaUrl) ? (
              <video className="max-h-[70vh] w-full" controls playsInline poster={item.image} src={item.mediaUrl}>Your browser does not support video playback.</video>
            ) : (item.type === "podcast" || item.type === "radio") && /\.(mp3|m4a|ogg|wav)(\?|$)/i.test(item.mediaUrl) ? (
              <audio className="w-full" controls src={item.mediaUrl}>Your browser does not support audio playback.</audio>
            ) : (
              <iframe className="aspect-video w-full" src={item.mediaUrl} title={item.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            )}
          </div>
        ) : null}
        {!item.mediaUrl && (item.type === "video" || item.type === "podcast" || item.type === "radio") && <Card className="mt-6"><CardContent className="p-4"><p className="font-medium">Playback</p><p className="text-sm text-muted-foreground">A playback link has not been added for this item yet.</p></CardContent></Card>}
      </div>
    </main>
  );
}
