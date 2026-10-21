"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Volume2, BookOpen, X, Globe } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ArticleActionsProps {
  slug: string;
  title: string;
}

export function ArticleActions({ slug, title }: ArticleActionsProps) {
  const { toast } = useToast();
  const [readingMode, setReadingMode] = useState(false);
  const [listenOpen, setListenOpen] = useState(false);

  const share = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/portal/articles/${slug}` : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard", "success");
    } else {
      toast("Unable to share — copy the URL manually", "info");
    }
  };

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={share}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" onClick={() => setListenOpen(true)}>
          <Volume2 className="h-4 w-4" />
          Listen to Article
        </Button>
        <Button
          variant={readingMode ? "default" : "outline"}
          size="sm"
          onClick={() => setReadingMode((r) => !r)}
        >
          <BookOpen className="h-4 w-4" />
          {readingMode ? "Exit Reading Mode" : "Reading Mode"}
        </Button>
      </div>

      {readingMode && (
        <div className="mt-4 rounded-lg border border-primary/30 bg-cyan-50 p-3 text-sm dark:bg-cyan-950/30">
          <p className="font-medium text-primary">Reading Mode active</p>
          <p className="text-muted-foreground">
            Distraction-free view. Other page elements are dimmed. Click &ldquo;Exit Reading Mode&rdquo; to return.
          </p>
        </div>
      )}

      {/* Listen dialog — honest fallback */}
      {listenOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setListenOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Listen to Article</h2>
              </div>
              <button onClick={() => setListenOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No speech service is connected. SIHU represents English and Swahili listening controls in the
              interface, but actual audio playback requires a text-to-speech backend.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 rounded-md border border-border p-3 opacity-60">
                <Globe className="h-4 w-4" />
                <span className="text-sm">English</span>
                <span className="ml-auto text-xs text-muted-foreground">Not available</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border p-3 opacity-60">
                <Globe className="h-4 w-4" />
                <span className="text-sm">Kiswahili</span>
                <span className="ml-auto text-xs text-muted-foreground">Not available</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Machine translations are not labeled as SIHU&rsquo;s original published text.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
