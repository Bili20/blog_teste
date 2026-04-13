import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Post } from "@/types/post";

export const FeaturedPost: React.FC<{
  post: Post;
  onRead: (slug: string) => void;
}> = ({ post, onRead }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border border-stone-200 mb-12">
      <div className="md:col-span-3 bg-stone-900 p-10 flex flex-col justify-between min-h-[380px]">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs tracking-widest uppercase text-amber-400 font-semibold">
              Featured
            </span>
            <span className="text-stone-500 text-xs">·</span>
            <span className="text-xs tracking-widest uppercase text-stone-400">
              {post.category}
            </span>
          </div>
          <h2 className="font-serif text-4xl font-bold text-white leading-tight mb-4 line-clamp-3 break-words">
            {post.title}
          </h2>
          <p className="text-stone-400 text-lg leading-relaxed font-serif italic">
            {post.subtitle}
          </p>
        </div>
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 bg-amber-700">
              <AvatarFallback className="text-white text-xs bg-amber-700">
                {post.author.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">
                {post.author.name}
              </p>
              <p className="text-stone-500 text-xs">
                {post.date} · {post.readTime} read
              </p>
            </div>
          </div>
          <Button
            onClick={() => onRead(post.slug)}
            variant="outline"
            className="border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white rounded-none text-xs tracking-widest uppercase"
          >
            Read →
          </Button>
        </div>
      </div>
      <div className="md:col-span-2 bg-amber-50 p-10 flex flex-col justify-center border-l border-stone-200">
        <p className="font-serif text-stone-700 text-lg leading-relaxed italic">
          "{post.excerpt}"
        </p>
        <div className="flex flex-wrap gap-2 mt-6">
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
    </div>
  );
};
