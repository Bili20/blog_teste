import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { deletePost, listPosts } from "@/services/postService";
import type { PostSummary } from "@/types/post";

export default function ManagePostsPage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  useEffect(() => {
    void loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await listPosts({
        published: true,
        page: 1,
        limit: 50,
      });

      setPosts(response.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load posts right now.",
      );
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    const shouldDelete = window.confirm(
      `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingPostId(postId);
    setErrorMessage(null);

    try {
      await deletePost(postId);
      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete the post right now.",
      );
    } finally {
      setDeletingPostId(null);
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
            Manage posts
          </h1>
          <p className="text-stone-500 mt-2">
            Create, edit, and remove published content.
          </p>
        </div>

        <Link to="/admin/posts/new">
          <Button className="rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold">
            New post
          </Button>
        </Link>
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
              Loading posts...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-3">
              No posts found
            </h2>
            <p className="text-stone-500 mb-6">
              Start by creating your first post.
            </p>
            <Link to="/admin/posts/new">
              <Button className="rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold">
                Create post
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {posts.map((post) => {
              const isDeleting = deletingPostId === post.id;

              return (
                <div
                  key={post.id}
                  className="px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-stone-400">
                      <span className="tracking-widest uppercase font-semibold text-amber-700">
                        {post.category}
                      </span>
                      <span>·</span>
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime} read</span>
                      {post.featured && (
                        <>
                          <span>·</span>
                          <span className="tracking-widest uppercase font-semibold text-stone-700">
                            Featured
                          </span>
                        </>
                      )}
                      {!post.published && (
                        <>
                          <span>·</span>
                          <span className="tracking-widest uppercase font-semibold text-red-600">
                            Draft
                          </span>
                        </>
                      )}
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

                    <Link to={`/admin/posts/${post.id}/edit`}>
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
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="rounded-none text-xs tracking-widest uppercase border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
