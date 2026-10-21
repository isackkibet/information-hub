"use client";
import { Button } from "@/components/ui/button";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">A global error occurred.</p>
          <Button className="mt-4" onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
