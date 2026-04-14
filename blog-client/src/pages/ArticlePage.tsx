import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getPostBySlug } from "@/services/postService";
import type { Post } from "@/types/post";
import "@/styles/tiptap.css";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Unable to load this article right now.";
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug ?? "";

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPostBySlug() {
      if (!slug) {
        if (isMounted) {
          setPost(null);
          setErrorMessage("Article not found.");
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const loadedPost = await getPostBySlug(slug);

        if (!isMounted) {
          return;
        }

        setPost(loadedPost);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPost(null);
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPostBySlug();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const sanitizedBody = useMemo(() => {
    if (!post) return "";
    return DOMPurify.sanitize(post.body, {
      ALLOWED_TAGS: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "br",
        "strong",
        "em",
        "u",
        "s",
        "ul",
        "ol",
        "li",
        "blockquote",
        "hr",
        "a",
        "img",
      ],
      ALLOWED_ATTR: [
        "href",
        "target",
        "rel",
        "src",
        "alt",
        "width",
        "height",
        "data-media-id",
      ],
    });
  }, [post]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          Loading article
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Fetching content...
        </h1>
        <p className="text-stone-500">
          Please wait while we load the article from the API.
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Article not found
        </h1>
        <p className="text-stone-500 mb-8">
          {errorMessage ?? "We couldn't find the article you're looking for."}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-amber-700 text-white rounded-none uppercase text-xs tracking-widest font-semibold"
        >
          Back to archive
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        to="/"
        className="text-sm text-stone-400 hover:text-stone-700 transition-colors mb-8 sm:mb-10 inline-flex items-center gap-2"
      >
        ← Back to archive
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
        <span className="text-xs tracking-widest uppercase text-amber-700 font-semibold">
          {post.category}
        </span>
        <span className="text-stone-300">·</span>
        <span className="text-xs text-stone-400">{post.date}</span>
        <span className="text-stone-300">·</span>
        <span className="text-xs text-stone-400">{post.readTime} read</span>
      </div>

      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 leading-tight mb-4 break-words">
        {post.title}
      </h1>
      <p className="font-serif text-lg sm:text-xl text-stone-500 italic mb-8">
        {post.subtitle}
      </p>

      <div className="flex items-center gap-3 mb-8 sm:mb-10">
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-stone-200 text-stone-600 text-sm">
            {post.author.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-stone-800">
            {post.author.name}
          </p>
          <p className="text-xs text-stone-400">Contributing editor</p>
        </div>
      </div>

      <Separator className="mb-10 bg-stone-200" />

      <div
        className="tiptap prose-stone max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedBody }}
      />

      <Separator className="my-10 bg-stone-200" />

      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="text-xs border-stone-300 text-stone-500 rounded-none"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
