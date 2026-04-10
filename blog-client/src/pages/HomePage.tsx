import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FeaturedPost } from "../components/FeaturedPost";
import { PostCard } from "../components/PostCard";
import { type Post } from "../mocks/posts";
import { POSTS, CATEGORIES } from "../mocks/posts";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const navigate = useNavigate();

  const featuredPost = useMemo(
    () => POSTS.find((post) => post.featured) as Post,
    [],
  );
  const remainingPosts = useMemo(
    () => POSTS.filter((post) => !post.featured),
    [],
  );

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return remainingPosts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [remainingPosts, activeCategory, searchQuery]);

  const handleRead = (slug: string) => {
    navigate(`/post/${slug}`);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4 text-xs text-stone-400 overflow-x-auto">
          <span className="text-amber-700 font-semibold tracking-widest uppercase whitespace-nowrap">
            Long reads
          </span>
          {POSTS.map((post) => (
            <button
              key={post.id}
              onClick={() => handleRead(post.slug)}
              className="hover:text-stone-700 transition-colors whitespace-nowrap px-4 py-2"
            >
              {post.title}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {featuredPost && (
          <FeaturedPost post={featuredPost} onRead={handleRead} />
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-0 border border-stone-200">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-xs tracking-widest uppercase font-semibold transition-colors border-r border-stone-200 last:border-0 ${
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
            className="px-4 py-2 text-sm border border-stone-200 focus:outline-none focus:border-stone-400 bg-white w-full sm:w-48"
          />
        </div>

        <div className="space-y-8">
          {filteredPosts.length === 0 ? (
            <p className="text-stone-400 font-serif italic text-lg py-12 text-center">
              No posts found.
            </p>
          ) : (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onRead={handleRead} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
