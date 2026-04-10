import React from "react";

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
}

export interface PostsContextValue {
  posts: PostSummary[];
  categories: string[];
}

export const PostsContext = React.createContext<PostsContextValue | null>({
  posts: [],
  categories: [],
});
