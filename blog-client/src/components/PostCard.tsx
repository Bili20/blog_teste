import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Post } from "@/types/post";

export const PostCard: React.FC<{
  post: Post;
  onRead: (slug: string) => void;
}> = ({ post, onRead }) => {
  return (
    <article
      className="group cursor-pointer border-b border-stone-200 pb-8 last:border-0"
      onClick={() => onRead(post.slug)}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs tracking-widest uppercase text-stone-400 font-semibold">
          {post.category}
        </span>
        <span className="text-stone-300">·</span>
        <span className="text-xs text-stone-400">{post.date}</span>
        <span className="text-stone-300">·</span>
        <span className="text-xs text-stone-400">{post.readTime} read</span>
      </div>
      <h3 className="font-serif text-2xl font-bold text-stone-900 group-hover:text-amber-700 transition-colors mb-2 leading-tight">
        {post.title}
      </h3>
      <p className="text-stone-500 text-sm font-serif italic mb-3">
        {post.subtitle}
      </p>
      <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 mb-4">
        {post.excerpt}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-stone-200 text-stone-600">
              {post.author.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-stone-500">{post.author.name}</span>
        </div>
        <div className="flex gap-2">
          {post.tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-xs border-stone-200 text-stone-400 rounded-none"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>
    </article>
  );
};
