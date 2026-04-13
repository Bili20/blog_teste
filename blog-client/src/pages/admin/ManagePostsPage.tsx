import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { AdminPagination } from "@/components/AdminPagination";
import { deletePost, listManagedPosts } from "@/services/postService";
import { useAuth } from "@/hooks/useAuth";
import {
  POST_CATEGORIES,
  type ListPostsParams,
  type PostSummary,
} from "@/types/post";

const POSTS_PER_PAGE = 10;

type PostStatusFilter = "all" | "published" | "draft";

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

  return "Unable to load posts right now.";
}

export default function ManagePostsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [postPendingDelete, setPostPendingDelete] =
    useState<PostSummary | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [serverTotal, setServerTotal] = useState<number>(0);
  const [serverTotalPages, setServerTotalPages] = useState<number>(1);

  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<PostStatusFilter>("all");

  const isAdmin = user?.roles.includes("admin") ?? false;
  const isAuthor = user?.roles.includes("author") ?? false;

  const visiblePosts = useMemo(() => posts, [posts]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setCurrentPage(1);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      setIsLoadingPosts(true);
      setErrorMessage(null);

      const params: ListPostsParams = {
        page: currentPage,
        limit: POSTS_PER_PAGE,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (categoryFilter !== "all") {
        params.category = categoryFilter as (typeof POST_CATEGORIES)[number];
      }

      if (statusFilter === "published") {
        params.published = true;
      } else if (statusFilter === "draft") {
        params.published = false;
      }

      try {
        const response = await listManagedPosts(params);

        if (!isMounted) {
          return;
        }

        setPosts(response.data);
        setServerTotal(response.total);
        setServerTotalPages(response.totalPages);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPosts([]);
        setServerTotal(0);
        setServerTotalPages(1);
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoadingPosts(false);
        }
      }
    }

    if (!isAuthLoading && isAuthenticated && user) {
      void loadPosts();
    }

    return () => {
      isMounted = false;
    };
  }, [
    currentPage,
    searchQuery,
    categoryFilter,
    statusFilter,
    isAuthLoading,
    isAuthenticated,
    user,
  ]);

  useEffect(() => {
    if (!isAuthor || isAdmin) {
      return;
    }

    if (currentPage > 1 && !isLoadingPosts && visiblePosts.length === 0) {
      setCurrentPage((previousPage) => Math.max(1, previousPage - 1));
    }
  }, [currentPage, isAdmin, isAuthor, isLoadingPosts, visiblePosts.length]);

  const hasActiveFilters =
    searchInput.trim().length > 0 ||
    categoryFilter !== "all" ||
    statusFilter !== "all";

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleDeletePost = async () => {
    if (!postPendingDelete) {
      return;
    }

    setDeletingPostId(postPendingDelete.id);
    setErrorMessage(null);

    try {
      await deletePost(postPendingDelete.id);

      const deletedPostTitle = postPendingDelete.title;
      const nextPosts = posts.filter(
        (post) => post.id !== postPendingDelete.id,
      );
      setPosts(nextPosts);
      setPostPendingDelete(null);

      if (nextPosts.length === 0 && currentPage > 1) {
        setCurrentPage((previousPage) => Math.max(1, previousPage - 1));
      } else {
        setServerTotal((previousTotal) => Math.max(0, previousTotal - 1));
      }

      toast.success("Post deleted", {
        description: `"${deletedPostTitle}" was removed successfully.`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete the post right now.";

      setErrorMessage(message);
      toast.error("Unable to delete post", {
        description: message,
      });
    } finally {
      setDeletingPostId(null);
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
        <p className="text-stone-500 mb-8">Please sign in to manage posts.</p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-stone-900 text-white rounded-none uppercase text-xs tracking-widest font-semibold hover:bg-amber-700 transition-colors"
        >
          Go to login
        </Link>
      </div>
    );
  }

  if (!isAdmin && !isAuthor) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          Restricted area
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Access denied
        </h1>
        <p className="text-stone-500 mb-8">
          Your account does not have permission to manage posts.
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
              {isAdmin ? "Admin" : "Author"}
            </p>
            <h1 className="font-serif text-4xl font-bold text-stone-900">
              {isAdmin ? "Manage posts" : "Your posts"}
            </h1>
            <p className="text-stone-500 mt-2">
              {isAdmin
                ? "Create, edit, and remove published content across the publication."
                : "Create, edit, and remove only the posts that belong to your account."}
            </p>
          </div>

          <Link to="/admin/posts/new">
            <Button className="rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold">
              New post
            </Button>
          </Link>
        </div>

        <div className="border border-stone-200 bg-stone-50 p-4 sm:p-5 mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label
                htmlFor="post-search"
                className="text-xs tracking-widest uppercase text-stone-500 font-semibold"
              >
                Search
              </label>
              <Input
                id="post-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by title, subtitle, or excerpt"
                className="rounded-none bg-white"
              />
            </div>

            <div className="w-full lg:w-52 space-y-2">
              <label className="text-xs tracking-widest uppercase text-stone-500 font-semibold">
                Category
              </label>
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value)}
              >
                <SelectTrigger className="rounded-none bg-white">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all" className="rounded-none">
                    All categories
                  </SelectItem>
                  {POST_CATEGORIES.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="rounded-none"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-44 space-y-2">
              <label className="text-xs tracking-widest uppercase text-stone-500 font-semibold">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as PostStatusFilter)
                }
              >
                <SelectTrigger className="rounded-none bg-white">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all" className="rounded-none">
                    All statuses
                  </SelectItem>
                  <SelectItem value="published" className="rounded-none">
                    Published
                  </SelectItem>
                  <SelectItem value="draft" className="rounded-none">
                    Draft
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs tracking-widest uppercase text-stone-400">
              {hasActiveFilters
                ? "Filters are active"
                : "Showing all managed posts"}
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="rounded-none text-xs tracking-widest uppercase self-start sm:self-auto"
            >
              Clear filters
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
            {errorMessage}
          </div>
        )}

        <div className="border border-stone-200 bg-white">
          {isLoadingPosts ? (
            <div className="px-6 py-16 text-center">
              <p className="text-xs tracking-widest uppercase text-stone-400">
                Loading posts...
              </p>
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                No posts found
              </h2>
              <p className="text-stone-500 mb-6">
                {hasActiveFilters
                  ? "No posts match the current filters."
                  : isAdmin
                    ? "There are no posts on this page."
                    : "You do not own any posts on this page."}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="rounded-none text-xs tracking-widest uppercase"
                  >
                    Clear filters
                  </Button>
                )}
                <Link to="/admin/posts/new">
                  <Button className="rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold">
                    Create post
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-stone-200">
              {visiblePosts.map((post) => {
                const isDeleting = deletingPostId === post.id;
                const canManagePost = isAdmin || post.authorId === user.id;

                return (
                  <div
                    key={post.id}
                    className="px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-stone-400">
                        <Badge
                          variant="outline"
                          className="rounded-none border-amber-200 text-amber-700 tracking-widest uppercase font-semibold"
                        >
                          {post.category}
                        </Badge>

                        <span>{post.date}</span>
                        <span>·</span>
                        <span>{post.readTime} read</span>

                        {post.featured && (
                          <Badge
                            variant="outline"
                            className="rounded-none border-stone-300 text-stone-700 tracking-widest uppercase font-semibold"
                          >
                            Featured
                          </Badge>
                        )}

                        <Badge
                          variant="outline"
                          className={
                            post.published
                              ? "rounded-none border-emerald-200 text-emerald-700 tracking-widest uppercase font-semibold"
                              : "rounded-none border-red-200 text-red-600 tracking-widest uppercase font-semibold"
                          }
                        >
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      </div>

                      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                        {post.title}
                      </h2>

                      <p className="text-stone-500 text-sm mb-3">
                        {post.subtitle}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
                        <span>Author: {post.author.name}</span>
                        <span>·</span>
                        <span>Slug: {post.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link to={`/post/${post.slug}`}>
                        <Button
                          variant="outline"
                          className="rounded-none text-xs tracking-widest uppercase"
                        >
                          View
                        </Button>
                      </Link>

                      {canManagePost && (
                        <Link to={`/admin/posts/${post.id}/edit`}>
                          <Button
                            variant="outline"
                            className="rounded-none text-xs tracking-widest uppercase"
                          >
                            Edit
                          </Button>
                        </Link>
                      )}

                      {canManagePost && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isDeleting}
                          onClick={() => setPostPendingDelete(post)}
                          className="rounded-none text-xs tracking-widest uppercase border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <AdminPagination
          page={currentPage}
          totalPages={Math.max(serverTotalPages, 1)}
          totalItems={serverTotal}
          itemLabel="posts"
          isLoading={isLoadingPosts}
          onPageChange={setCurrentPage}
        />
      </div>

      <DeleteConfirmDialog
        open={Boolean(postPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPostPendingDelete(null);
          }
        }}
        title="Delete post"
        description={
          postPendingDelete
            ? `Are you sure you want to delete "${postPendingDelete.title}"? This action cannot be undone.`
            : ""
        }
        isDeleting={
          Boolean(postPendingDelete) && deletingPostId === postPendingDelete?.id
        }
        onConfirm={handleDeletePost}
      />
    </>
  );
}
