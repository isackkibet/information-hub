"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">An error occurred. Please try again.</p>
      <Button className="mt-4" onClick={() => reset()}>Try again</Button>
    </div>
  );
}
