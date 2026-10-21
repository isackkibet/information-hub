import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
      <div className="mt-4 flex gap-2">
        <Link href="/"><Button>Go home</Button></Link>
        <Link href="/portal"><Button variant="outline">Go to Portal</Button></Link>
      </div>
    </div>
  );
}
