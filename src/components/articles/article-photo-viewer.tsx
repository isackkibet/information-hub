"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X, Expand } from "lucide-react";

export function ArticlePhotoViewer({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <figure className="mt-6">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open full-size article photo" className="group relative block aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-lg shadow-slate-950/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Image src={src} alt={alt} fill unoptimized sizes="(max-width: 768px) 100vw, 900px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-medium text-white opacity-90 transition group-hover:bg-slate-950">
            <Expand className="h-3.5 w-3.5" /> View photo
          </span>
        </button>
        {caption && <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>}
      </figure>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 p-4" role="dialog" aria-modal="true" aria-label="Full-size article photo" onClick={() => setOpen(false)}>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close full-size photo" className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/40 p-2 text-white transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[85vh] w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <Image src={src} alt={alt} fill unoptimized sizes="100vw" className="object-contain" priority />
          </div>
          {caption && <p className="absolute bottom-4 max-w-3xl px-4 text-center text-sm text-white/80">{caption}</p>}
        </div>
      )}
    </>
  );
}
