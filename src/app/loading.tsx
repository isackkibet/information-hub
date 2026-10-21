import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-4 h-64 w-full" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
