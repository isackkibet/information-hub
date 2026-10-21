import Link from "next/link";
import { FooterYear } from "./footer-year";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto grid gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2">
            <div aria-hidden="true" className="h-9 w-9 shrink-0 rounded-md bg-gradient-to-br from-cyan-600 to-teal-500" />
            <div>
              <p className="text-sm font-semibold">Sango Information Hub (SIHU)</p>
              <p className="text-xs text-muted-foreground">We care about Lake Victoria.</p>
            </div>
          </div>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
            Community stories, news, and knowledge for people across Kenya’s Lake Victoria Basin.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            <li><Link href="/" className="transition-colors hover:text-foreground">Home</Link></li>
            <li><Link href="/portal" className="transition-colors hover:text-foreground">Community portal</Link></li>
            <li><Link href="/portal/media" className="transition-colors hover:text-foreground">Media Content</Link></li>
            <li><Link href="/ai-assistant" className="transition-colors hover:text-foreground">AI assistant</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Get involved</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            <li><Link href="/submit" className="transition-colors hover:text-foreground">Submit a report</Link></li>
            <li><Link href="/account/library" className="transition-colors hover:text-foreground">My library</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col gap-1 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© <FooterYear /> Sango Information Hub.</p>
          <p>Serving communities around Lake Victoria.</p>
        </div>
      </div>
    </footer>
  );
}
