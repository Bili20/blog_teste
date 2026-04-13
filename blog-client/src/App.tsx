import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./providers/AuthProvider";
import { AdminRoute } from "./guards/AdminRoute";
import { ContentRoute } from "./guards/ContentRoute";
import { AppHeader } from "./components/AppHeader";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ArticlePage from "./pages/ArticlePage";
import LoginPage from "./pages/LoginPage";
import CreatePostPage from "@/pages/admin/CreatePostPage";
import EditPostPage from "@/pages/admin/EditPostPage";
import ManagePostsPage from "@/pages/admin/ManagePostsPage";
import CreateTagPage from "./pages/admin/tags/CreateTagPage";
import ManageTagsPage from "./pages/admin/tags/ManageTagsPage";
import ManageAuthorsPage from "./pages/admin/authors/ManageAuthorsPage";
import CreateAuthorPage from "./pages/admin/authors/CreateAuthorPage";
import EditAuthorPage from "./pages/admin/authors/EditAuthorPage";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <AppHeader />

      <main>{children}</main>

      <footer className="border-t border-stone-200 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-serif text-stone-900 font-bold text-lg">
            The Margin
          </p>
          <p className="text-xs text-stone-400">
            Independent since 2026 · Made with care
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/post/:slug" element={<ArticlePage />} />

            <Route element={<ContentRoute />}>
              <Route path="/admin/posts" element={<ManagePostsPage />} />
              <Route path="/admin/posts/new" element={<CreatePostPage />} />
              <Route path="/admin/posts/:id/edit" element={<EditPostPage />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin/tags" element={<ManageTagsPage />} />
              <Route path="/admin/tags/new" element={<CreateTagPage />} />
              <Route path="/admin/authors" element={<ManageAuthorsPage />} />
              <Route path="/admin/authors/new" element={<CreateAuthorPage />} />
              <Route
                path="/admin/authors/:id/edit"
                element={<EditAuthorPage />}
              />
            </Route>

            <Route path="/:slug" element={<Navigate to="/" replace />} />
            <Route
              path="*"
              element={
                <div className="max-w-3xl mx-auto px-6 py-24 text-center">
                  <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
                    Page not found
                  </h1>
                  <p className="text-stone-500 mb-8">
                    The page you requested does not exist.
                  </p>
                  <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-amber-700 text-white rounded-none uppercase text-xs tracking-widest font-semibold"
                  >
                    Back to archive
                  </Link>
                </div>
              }
            />
          </Routes>
        </Layout>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
