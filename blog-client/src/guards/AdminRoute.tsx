import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AdminRoute() {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-stone-500 text-sm tracking-widest uppercase">
          Checking admin access...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isAdmin = user?.roles.includes("admin") ?? false;

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          Restricted area
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Admin access required
        </h1>
        <p className="text-stone-500 mb-8">
          Your account is authenticated, but it does not have permission to
          access this area.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return <Outlet />;
}
