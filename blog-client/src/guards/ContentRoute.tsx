import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Route guard that allows access to content management routes.
 *
 * Permitted roles: "admin" | "author"
 *
 * - Unauthenticated users are redirected to /login (with return location).
 * - Authenticated users without either role are redirected to /.
 * - Admin-only areas (e.g. tag management) should continue to use AdminRoute.
 */
export function ContentRoute() {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-stone-500 text-sm tracking-widest uppercase">
          Checking session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const hasContentAccess =
    (user?.roles.includes("admin") ?? false) ||
    (user?.roles.includes("author") ?? false);

  if (!hasContentAccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
