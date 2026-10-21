import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
  });

  const items: (number | string)[] = [];
  let prev = 0;
  for (const p of pages) {
    if (p - prev > 1) items.push("...");
    items.push(p);
    prev = p;
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {items.map((item, i) =>
        typeof item === "number" ? (
          <Button
            key={i}
            variant={item === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ) : (
          <span key={i} className="px-2 text-muted-foreground">
            {item}
          </span>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
