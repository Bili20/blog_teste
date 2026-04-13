import { Button } from "@/components/ui/button";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  itemLabel?: string;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  page,
  totalPages,
  totalItems,
  itemLabel = "items",
  isLoading = false,
  onPageChange,
}: AdminPaginationProps) {
  const hasItems = totalItems > 0;
  const canGoPrevious = !isLoading && page > 1;
  const canGoNext = !isLoading && page < totalPages;

  const handlePrevious = () => {
    if (!canGoPrevious) return;
    onPageChange(page - 1);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    onPageChange(page + 1);
  };

  if (!hasItems) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-stone-200 px-6 py-4 bg-stone-50">
      <div className="text-xs tracking-widest uppercase text-stone-500">
        Page {page} of {totalPages} · {totalItems} {itemLabel}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!canGoPrevious}
          onClick={handlePrevious}
          className="rounded-none text-xs tracking-widest uppercase"
        >
          Previous
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={!canGoNext}
          onClick={handleNext}
          className="rounded-none text-xs tracking-widest uppercase"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
