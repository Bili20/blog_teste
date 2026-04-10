import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "./providers/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ArticlePage from "./pages/ArticlePage";
import LoginPage from "./pages/LoginPage";

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="border-b border-stone-200 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="font-serif text-2xl font-bold tracking-tight text-stone-900 hover:text-amber-700 transition-colors"
            aria-current={location.pathname === "/" ? "page" : undefined}
          >
            The Margin
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium text-stone-500">
            <Link
              to="/"
              className="hover:text-stone-900 transition-colors"
              aria-current={location.pathname === "/" ? "page" : undefined}
            >
              Archive
            </Link>
            <Link
              to="/about"
              className="hover:text-stone-900 transition-colors"
              aria-current={location.pathname === "/about" ? "page" : undefined}
            >
              About
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-stone-500">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="bg-stone-900 text-white rounded-none text-xs tracking-widest uppercase font-semibold px-4 py-2 hover:bg-amber-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-stone-900 text-white rounded-none text-xs tracking-widest uppercase font-semibold px-4 py-2 hover:bg-amber-700 transition-colors"
                aria-current={
                  location.pathname === "/login" ? "page" : undefined
                }
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

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
      </BrowserRouter>
    </AuthProvider>
  );
}
