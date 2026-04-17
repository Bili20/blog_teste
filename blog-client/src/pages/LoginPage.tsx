import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/lib/schemas";

function getErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Unable to sign in right now. Please try again.";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname ?? "/";
  }, [location.state]);

  if (!isAuthLoading && isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const onSubmit = async (data: LoginFormValues) => {
    setApiErrorMessage(null);

    try {
      await login({
        email: data.email,
        password: data.password,
      });

      navigate(redirectPath, { replace: true });
    } catch (error) {
      setApiErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-6 py-12 bg-stone-50">
      <div className="w-full max-w-md border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-3">
            Admin access
          </p>
          <h1 className="font-serif text-4xl font-bold text-stone-900 mb-3">
            Sign in
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            Use your admin credentials to access protected actions in the blog
            dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-stone-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="mara@themargin.com"
              {...register("email")}
              disabled={isSubmitting}
              className="rounded-none border-stone-200 focus-visible:ring-0 focus-visible:border-stone-400"
            />
            {errors.email && (
              <p className="text-sm text-red-700">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-stone-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
              disabled={isSubmitting}
              className="rounded-none border-stone-200 focus-visible:ring-0 focus-visible:border-stone-400"
            />
            {errors.password && (
              <p className="text-sm text-red-700">{errors.password.message}</p>
            )}
          </div>

          {apiErrorMessage && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiErrorMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 border-t border-stone-200 pt-5">
          <p className="text-xs text-stone-400">
            Back to{" "}
            <Link to="/" className="text-stone-700 hover:text-amber-700">
              archive
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
