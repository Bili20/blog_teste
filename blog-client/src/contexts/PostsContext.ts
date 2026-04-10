import React from "react";
import type { Post } from "../mocks/posts";

export const PostsContext = React.createContext<{
  posts: Post[];
  categories: string[];
} | null>(null);
