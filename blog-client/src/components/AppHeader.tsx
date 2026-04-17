import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, FileText, Users, Tag, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const NAV_LINK_BASE =
  "text-sm font-medium transition-colors hover:text-stone-900";

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.roles.includes("admin") ?? false;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link
          to="/"
          className="font-serif text-2xl font-bold tracking-tight text-stone-900 hover:text-amber-700 transition-colors"
        >
          The Margin
        </Link>

        {/* ── Desktop nav ──────────────────────────────────────────────────── */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            to="/"
            className={cn(
              NAV_LINK_BASE,
              location.pathname === "/"
                ? "text-stone-900"
                : "text-stone-500",
            )}
          >
            Archive
          </Link>

          <Link
            to="/about"
            className={cn(
              NAV_LINK_BASE,
              location.pathname === "/about"
                ? "text-stone-900"
                : "text-stone-500",
            )}
          >
            About
          </Link>

          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                  aria-label="Open user menu"
                >
                  <Avatar className="h-8 w-8 rounded-none cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarFallback className="rounded-none bg-stone-900 text-white text-xs font-bold tracking-wider">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {/* User info */}
                <DropdownMenuLabel className="font-normal py-2">
                  <p className="text-sm font-semibold text-stone-900 leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 leading-none">
                    {user.email}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className="text-[10px] tracking-widest uppercase px-1.5 py-0 h-4 rounded-sm"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Admin links */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() => navigate("/admin/posts")}
                  >
                    <FileText className="h-4 w-4 text-stone-400" />
                    <span>Posts</span>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem
                      className="cursor-pointer gap-2"
                      onClick={() => navigate("/admin/authors")}
                    >
                      <Users className="h-4 w-4 text-stone-400" />
                      <span>Authors</span>
                    </DropdownMenuItem>
                  )}

                  {isAdmin && (
                    <DropdownMenuItem
                      className="cursor-pointer gap-2"
                      onClick={() => navigate("/admin/tags")}
                    >
                      <Tag className="h-4 w-4 text-stone-400" />
                      <span>Tags</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-red-700 focus:text-red-700 focus:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* ── Mobile nav ───────────────────────────────────────────────────── */}
        <div className="flex sm:hidden items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="text-stone-700 hover:text-stone-900 transition-colors p-1"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="px-6 py-5 border-b border-stone-200">
                <SheetTitle className="font-serif text-xl font-bold text-stone-900 text-left">
                  The Margin
                </SheetTitle>
              </SheetHeader>

              <div className="px-4 py-4 flex flex-col gap-0.5">
                {/* Public links */}
                <Link
                  to="/"
                  onClick={closeMobile}
                  className={cn(
                    "px-3 py-2.5 rounded-sm text-sm font-medium transition-colors hover:bg-stone-50",
                    location.pathname === "/"
                      ? "text-stone-900 bg-stone-50"
                      : "text-stone-500 hover:text-stone-900",
                  )}
                >
                  Archive
                </Link>

                <Link
                  to="/about"
                  onClick={closeMobile}
                  className={cn(
                    "px-3 py-2.5 rounded-sm text-sm font-medium transition-colors hover:bg-stone-50",
                    location.pathname === "/about"
                      ? "text-stone-900 bg-stone-50"
                      : "text-stone-500 hover:text-stone-900",
                  )}
                >
                  About
                </Link>

                {/* Authenticated section */}
                {isAuthenticated && user && (
                  <>
                    <Separator className="my-3" />

                    <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest uppercase text-stone-400">
                      Admin
                    </p>

                    <Link
                      to="/admin/posts"
                      onClick={closeMobile}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors hover:bg-stone-50",
                        location.pathname.startsWith("/admin/posts")
                          ? "text-stone-900 bg-stone-50"
                          : "text-stone-500 hover:text-stone-900",
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      Posts
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/authors"
                        onClick={closeMobile}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors hover:bg-stone-50",
                          location.pathname.startsWith("/admin/authors")
                            ? "text-stone-900 bg-stone-50"
                            : "text-stone-500 hover:text-stone-900",
                        )}
                      >
                        <Users className="h-4 w-4" />
                        Authors
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/tags"
                        onClick={closeMobile}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors hover:bg-stone-50",
                          location.pathname.startsWith("/admin/tags")
                            ? "text-stone-900 bg-stone-50"
                            : "text-stone-500 hover:text-stone-900",
                        )}
                      >
                        <Tag className="h-4 w-4" />
                        Tags
                      </Link>
                    )}

                    <Separator className="my-3" />

                    {/* User info */}
                    <div className="px-3 py-2 mb-1">
                      <p className="text-sm font-semibold text-stone-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {user.email}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="text-[10px] tracking-widest uppercase px-1.5 py-0 h-4 rounded-sm"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        closeMobile();
                        handleLogout();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm font-medium text-red-700 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
