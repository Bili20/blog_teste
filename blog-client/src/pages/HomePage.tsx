import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FeaturedPost } from "@/components/FeaturedPost";
import { PostCard } from "@/components/PostCard";
import {
  getFeaturedPost,
  getPostBySlug,
  listPosts,
} from "@/services/postService";
import type { Post, PostSummary } from "@/types/post";

const CATEGORY_OPTIONS = ["All", "Essay", "Practice", "Work", "Tools"] as const;

export default function HomePage() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] =
    useState<(typeof CATEGORY_OPTIONS)[number]>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [isLoadingFeaturedPost, setIsLoadingFeaturedPost] =
    useState<boolean>(true);
  const [postsErrorMessage, setPostsErrorMessage] = useState<string | null>(
    null,
  );
  const [featuredPostErrorMessage, setFeaturedPostErrorMessage] = useState<
    string | null
  >(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFeaturedPost() {
      setIsLoadingFeaturedPost(true);
      setFeaturedPostErrorMessage(null);

      try {
        const featuredPostSummary = await getFeaturedPost();

        if (!isMounted) {
          return;
        }

        setFeaturedPost({
          ...featuredPostSummary,
          body: "",
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFeaturedPost(null);
        setFeaturedPostErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the featured post right now.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingFeaturedPost(false);
        }
      }
    }

    void loadFeaturedPost();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      setIsLoadingPosts(true);
      setPostsErrorMessage(null);

      try {
        const response = await listPosts({
          published: true,
          page: 1,
          limit: 20,
        });

        if (!isMounted) {
          return;
        }

        setPosts(response.data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPosts([]);
        setPostsErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load posts right now.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingPosts(false);
        }
      }
    }

    void loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      const matchesSearch =
        !normalizedQuery ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.excerpt.toLowerCase().includes(normalizedQuery) ||
        post.tags.some((tag) =>
          tag.name.toLowerCase().includes(normalizedQuery),
        );

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, posts, searchQuery]);

  const longReadPosts = useMemo(() => {
    return posts.slice(0, 4);
  }, [posts]);

  const handleRead = async (slug: string) => {
    if (featuredPost?.slug === slug && featuredPost.body) {
      navigate(`/post/${slug}`);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const fullPost = await getPostBySlug(slug);

      if (featuredPost?.slug === slug) {
        setFeaturedPost(fullPost);
      }

      navigate(`/post/${slug}`, {
        state: {
          post: fullPost,
        },
      });
      window.scrollTo(0, 0);
    } catch {
      navigate(`/post/${slug}`);
      window.scrollTo(0, 0);
    }
  };

  const isInitialLoading = isLoadingPosts || isLoadingFeaturedPost;

  return (
    <>
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 text-xs text-stone-400 overflow-x-auto">
          <span className="text-amber-700 font-semibold tracking-widest uppercase whitespace-nowrap">
            Long reads
          </span>

          {isLoadingPosts ? (
            <span className="whitespace-nowrap px-4 py-2">Loading...</span>
          ) : longReadPosts.length === 0 ? (
            <span className="whitespace-nowrap px-4 py-2">
              No posts available
            </span>
          ) : (
            longReadPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => void handleRead(post.slug)}
                className="hover:text-stone-700 transition-colors whitespace-nowrap px-4 py-2 max-w-[200px] sm:max-w-xs"
                title={post.title}
              >
                {post.title}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {featuredPostErrorMessage && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-8">
            {featuredPostErrorMessage}
          </div>
        )}

        {!isLoadingFeaturedPost && featuredPost && (
          <FeaturedPost post={featuredPost} onRead={handleRead} />
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex gap-0 border border-stone-200 flex-wrap w-full md:w-auto">
            {CATEGORY_OPTIONS.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-1 md:flex-none px-3 sm:px-4 py-2 text-[10px] sm:text-xs tracking-widest uppercase font-semibold transition-colors border-r border-stone-200 last:border-0 ${
                  activeCategory === category
                    ? "bg-stone-900 text-white"
                    : "text-stone-400 hover:text-stone-700 hover:bg-stone-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="px-4 py-2 text-sm border border-stone-200 focus:outline-none focus:border-stone-400 bg-white w-full md:w-48"
          />
        </div>

        {postsErrorMessage && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-8">
            {postsErrorMessage}
          </div>
        )}

        <div className="space-y-8">
          {isInitialLoading ? (
            <p className="text-stone-400 font-serif italic text-lg py-12 text-center">
              Loading posts...
            </p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-stone-400 font-serif italic text-lg py-12 text-center">
              No posts found.
            </p>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, body: "" }}
                onRead={handleRead}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
