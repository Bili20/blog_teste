import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { deleteTag, listTags } from "@/services/tagService";
import type { Tag } from "@/types/tag";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { AdminPagination } from "@/components/AdminPagination";

const TAGS_PER_PAGE = 8;

function formatTagDate(dateValue: string): string {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Unable to load tags right now.";
}

export default function ManageTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const [tagPendingDelete, setTagPendingDelete] = useState<Tag | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadTags() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const loadedTags = await listTags();

        if (!isMounted) {
          return;
        }

        setTags(loadedTags);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setTags([]);
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTags();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim().toLowerCase());
      setCurrentPage(1);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const filteredTags = useMemo(() => {
    if (!searchQuery) {
      return tags;
    }

    return tags.filter((tag) => {
      const normalizedName = tag.name.toLowerCase();
      const normalizedSlug = tag.slug.toLowerCase();

      return (
        normalizedName.includes(searchQuery) ||
        normalizedSlug.includes(searchQuery)
      );
    });
  }, [searchQuery, tags]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTags.length / TAGS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTags = useMemo(() => {
    const startIndex = (currentPage - 1) * TAGS_PER_PAGE;
    return filteredTags.slice(startIndex, startIndex + TAGS_PER_PAGE);
  }, [currentPage, filteredTags]);

  const paginationLabel = useMemo(() => {
    if (filteredTags.length === 0) {
      return searchQuery ? "No matching tags" : "No tags";
    }

    const start = (currentPage - 1) * TAGS_PER_PAGE + 1;
    const end = Math.min(currentPage * TAGS_PER_PAGE, filteredTags.length);

    return `Showing ${start}-${end} of ${filteredTags.length} tags`;
  }, [currentPage, filteredTags.length, searchQuery]);

  const handleDeleteTag = async () => {
    if (!tagPendingDelete) {
      return;
    }

    setDeletingTagId(tagPendingDelete.id);
    setErrorMessage(null);

    try {
      await deleteTag(tagPendingDelete.id);
      setTags((currentTags) =>
        currentTags.filter(
          (currentTag) => currentTag.id !== tagPendingDelete.id,
        ),
      );
      setTagPendingDelete(null);
      toast.success("Tag deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete the tag right now.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setDeletingTagId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-2">
            Admin
          </p>
          <h1 className="font-serif text-4xl font-bold text-stone-900">
            Manage tags
          </h1>
          <p className="text-stone-500 mt-2">
            Create and remove tags used across your posts.
          </p>
        </div>

        <Link to="/admin/tags/new">
          <Button className="rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold">
            New tag
          </Button>
        </Link>
      </div>

      <div className="border border-stone-200 bg-stone-50 p-4 sm:p-5 mb-6 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="tag-search"
            className="text-xs tracking-widest uppercase text-stone-500 font-semibold"
          >
            Search
          </label>
          <Input
            id="tag-search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by tag name or slug"
            className="rounded-none bg-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs tracking-widest uppercase text-stone-400">
            {searchQuery ? "Search filter is active" : "Showing all tags"}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchInput("");
              setSearchQuery("");
              setCurrentPage(1);
            }}
            disabled={!searchInput.trim()}
            className="rounded-none text-xs tracking-widest uppercase self-start sm:self-auto"
          >
            Clear search
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
          {errorMessage}
        </div>
      )}

      <div className="border border-stone-200 bg-white">
        {isLoading ? (
          <div className="px-6 py-16 text-center">
            <p className="text-xs tracking-widest uppercase text-stone-400">
              Loading tags...
            </p>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
              No tags found
            </h2>
            <p className="text-stone-500 mb-6">
              {searchQuery
                ? "No tags match the current search."
                : "Start by creating your first tag."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="rounded-none text-xs tracking-widest uppercase"
                >
                  Clear search
                </Button>
              )}
              <Link to="/admin/tags/new">
                <Button className="rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold">
                  Create tag
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-stone-200">
              <p className="text-xs tracking-widest uppercase text-stone-400">
                {paginationLabel}
              </p>
            </div>

            <div className="divide-y divide-stone-200">
              {paginatedTags.map((tag) => {
                const isDeleting = deletingTagId === tag.id;

                return (
                  <div
                    key={tag.id}
                    className="px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-stone-400">
                        <Badge
                          variant="outline"
                          className="rounded-sm border-amber-200 text-amber-700 tracking-widest uppercase"
                        >
                          Tag
                        </Badge>
                        <span>·</span>
                        <span>{formatTagDate(tag.createdAt)}</span>
                      </div>

                      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                        {tag.name}
                      </h2>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
                        <Badge
                          variant="outline"
                          className="rounded-sm border-stone-200 text-stone-600 font-mono"
                        >
                          {tag.slug}
                        </Badge>
                        <span>·</span>
                        <span>ID: {tag.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isDeleting}
                        onClick={() => setTagPendingDelete(tag)}
                        className="rounded-none text-xs tracking-widest uppercase border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <AdminPagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filteredTags.length}
              itemLabel="tags"
              isLoading={isLoading}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <DeleteConfirmDialog
        open={Boolean(tagPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setTagPendingDelete(null);
          }
        }}
        title="Delete tag"
        description={
          tagPendingDelete
            ? `Are you sure you want to delete "${tagPendingDelete.name}"? This action cannot be undone.`
            : ""
        }
        isDeleting={Boolean(
          tagPendingDelete && deletingTagId === tagPendingDelete.id,
        )}
        onConfirm={handleDeleteTag}
      />
    </div>
  );
}
