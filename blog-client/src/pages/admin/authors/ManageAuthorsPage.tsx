import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { AdminPagination } from "@/components/AdminPagination";
import {
  deleteAuthor,
  listAuthors,
  type Author,
} from "@/services/authorService";
import { useAuth } from "@/hooks/useAuth";

const AUTHORS_PER_PAGE = 8;

function formatAuthorDate(dateValue: string): string {
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

  return "Unable to load authors right now.";
}

export default function ManageAuthorsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingAuthorId, setDeletingAuthorId] = useState<string | null>(null);
  const [authorPendingDelete, setAuthorPendingDelete] = useState<Author | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadAuthors() {
      setIsLoadingAuthors(true);
      setErrorMessage(null);

      try {
        const loadedAuthors = await listAuthors();

        if (!isMounted) return;

        setAuthors(loadedAuthors);
      } catch (error) {
        if (!isMounted) return;

        setAuthors([]);
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoadingAuthors(false);
        }
      }
    }

    if (!isAuthLoading && isAuthenticated) {
      void loadAuthors();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isAuthenticated]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim().toLowerCase());
      setCurrentPage(1);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const filteredAuthors = useMemo(() => {
    if (!searchQuery) {
      return authors;
    }

    return authors.filter((author) => {
      const normalizedName = author.name.toLowerCase();
      const normalizedEmail = author.email.toLowerCase();
      const normalizedInitials = author.initials.toLowerCase();

      return (
        normalizedName.includes(searchQuery) ||
        normalizedEmail.includes(searchQuery) ||
        normalizedInitials.includes(searchQuery)
      );
    });
  }, [authors, searchQuery]);

  const totalAuthors = filteredAuthors.length;
  const totalPages = Math.max(1, Math.ceil(totalAuthors / AUTHORS_PER_PAGE));

  const paginatedAuthors = useMemo(() => {
    const startIndex = (currentPage - 1) * AUTHORS_PER_PAGE;
    const endIndex = startIndex + AUTHORS_PER_PAGE;

    return filteredAuthors.slice(startIndex, endIndex);
  }, [filteredAuthors, currentPage]);

  const pageStart =
    totalAuthors === 0 ? 0 : (currentPage - 1) * AUTHORS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * AUTHORS_PER_PAGE, totalAuthors);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDeleteAuthor = async () => {
    if (!authorPendingDelete) return;

    setDeletingAuthorId(authorPendingDelete.id);
    setErrorMessage(null);

    try {
      await deleteAuthor(authorPendingDelete.id);
      setAuthors((current) =>
        current.filter((author) => author.id !== authorPendingDelete.id),
      );
      setAuthorPendingDelete(null);
      toast.success("Author deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete the author right now.";

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setDeletingAuthorId(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          Admin
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Checking session...
        </h1>
        <p className="text-stone-500">
          Please wait while we verify your authentication status.
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          Restricted area
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Authentication required
        </h1>
        <p className="text-stone-500 mb-8">Please sign in to manage authors.</p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-stone-900 text-white rounded-none uppercase text-xs tracking-widest font-semibold hover:bg-amber-700 transition-colors"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const isAdmin = user.roles.includes("admin");

  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          Restricted area
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Access denied
        </h1>
        <p className="text-stone-500 mb-8">
          Only administrators can manage authors.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-stone-900 text-white rounded-none uppercase text-xs tracking-widest font-semibold hover:bg-amber-700 transition-colors"
        >
          Back to archive
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-2">
              Admin
            </p>
            <h1 className="font-serif text-4xl font-bold text-stone-900">
              Manage authors
            </h1>
            <p className="text-stone-500 mt-2">
              Create, edit, and remove authors of the publication.
            </p>
          </div>

          <Link to="/admin/authors/new">
            <Button className="rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold">
              New author
            </Button>
          </Link>
        </div>

        <div className="border border-stone-200 bg-stone-50 p-4 sm:p-5 mb-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="author-search"
              className="text-xs tracking-widest uppercase text-stone-500 font-semibold"
            >
              Search authors
            </label>
            <Input
              id="author-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, email, or initials"
              className="rounded-none bg-white"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs tracking-widest uppercase text-stone-400">
              {searchQuery ? "Search filter is active" : "Showing all authors"}
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              disabled={!searchQuery}
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
          {isLoadingAuthors ? (
            <div className="px-6 py-16 text-center">
              <p className="text-xs tracking-widest uppercase text-stone-400">
                Loading authors...
              </p>
            </div>
          ) : authors.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                No authors found
              </h2>
              <p className="text-stone-500 mb-6">
                {searchQuery
                  ? "No authors match the current search."
                  : "Start by creating your first author."}
              </p>
              <Link to="/admin/authors/new">
                <Button className="rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold">
                  Create author
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-stone-50">
                <p className="text-xs tracking-widest uppercase text-stone-500">
                  Showing {pageStart}–{pageEnd} of {totalAuthors} authors
                </p>
                <p className="text-xs tracking-widest uppercase text-stone-400">
                  Page {currentPage} of {totalPages}
                </p>
              </div>

              <div className="divide-y divide-stone-200">
                {paginatedAuthors.map((author) => {
                  const isDeleting = deletingAuthorId === author.id;
                  const isSelf = author.id === user.id;

                  return (
                    <div
                      key={author.id}
                      className="px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-stone-400">
                          <span className="tracking-widest uppercase font-semibold text-amber-700">
                            {author.initials}
                          </span>
                          <span>·</span>
                          <span>{formatAuthorDate(author.createdAt)}</span>
                          {author.roles.length > 0 && (
                            <>
                              <span>·</span>
                              <div className="flex flex-wrap items-center gap-1">
                                {author.roles.map((role) => (
                                  <Badge
                                    key={role.id}
                                    variant="outline"
                                    className="rounded-sm border-stone-300 text-[10px] tracking-widest uppercase text-stone-700"
                                  >
                                    {role.name}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                          {isSelf && (
                            <>
                              <span>·</span>
                              <Badge
                                variant="secondary"
                                className="rounded-sm text-[10px] tracking-widest uppercase"
                              >
                                You
                              </Badge>
                            </>
                          )}
                        </div>

                        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">
                          {author.name}
                        </h2>

                        <p className="text-stone-500 text-sm mb-2">
                          {author.email}
                        </p>

                        {author.bio && (
                          <p className="text-stone-400 text-xs line-clamp-2">
                            {author.bio}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Link to={`/admin/authors/${author.id}/edit`}>
                          <Button
                            variant="outline"
                            className="rounded-none text-xs tracking-widest uppercase"
                          >
                            Edit
                          </Button>
                        </Link>

                        <Button
                          type="button"
                          variant="outline"
                          disabled={isDeleting}
                          onClick={() => setAuthorPendingDelete(author)}
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
                totalItems={totalAuthors}
                itemLabel="authors"
                isLoading={isLoadingAuthors}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      <DeleteConfirmDialog
        open={Boolean(authorPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setAuthorPendingDelete(null);
          }
        }}
        title="Delete author"
        description={
          authorPendingDelete
            ? `Are you sure you want to delete "${authorPendingDelete.name}"? This will also remove all associated data. This action cannot be undone.`
            : ""
        }
        isDeleting={Boolean(authorPendingDelete && deletingAuthorId)}
        onConfirm={handleDeleteAuthor}
      />
    </>
  );
}
