import * as React from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Guitar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountDropdown } from "./AccountDropdown";
import { NotificationDropdown } from "./NotificationDropdown";
import { useAuth } from "@/lib/auth-context";

export interface NavbarProps {
  activeItem?: "Home" | "Explore" | "Top Charts" | "Upload" | "My Music" | "none";
  showSearch?: boolean;
  className?: string;
}

export function Navbar({
  activeItem = "none",
  showSearch = true,
  className = "",
}: NavbarProps) {
  const [navSearch, setNavSearch] = React.useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Hide search on Home and Explore pages where dedicated primary search exists
  const isSearchHiddenPage =
    activeItem === "Home" ||
    activeItem === "Explore" ||
    location.pathname === "/" ||
    location.pathname === "/search";

  const shouldShowSearch = showSearch && !isSearchHiddenPage;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = navSearch.trim();
    if (!query) return;
    void navigate({ to: "/search", search: { q: query } });
  };

  const navLinks = [
    { label: "Explore", to: "/search" },
    { label: "Top Charts", to: "/top-charts" },
    {
      label: "Upload",
      to: isAuthenticated ? "/upload" : "/login",
      search: isAuthenticated ? undefined : { redirect: "/upload" },
    },
    {
      label: "My Music",
      to: isAuthenticated ? "/my-music" : "/login",
      search: isAuthenticated ? undefined : { redirect: "/my-music" },
    },
  ];

  return (
    <header
      className={`relative z-30 mx-auto grid h-20 w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-5 px-5 sm:flex sm:px-8 lg:px-12 animate-flow-1 ${className}`}
    >
      {/* ── Brand / Logo ── */}
      <Link to="/" className="flex min-w-0 items-center gap-3 group" aria-label="Strumly home">
        <span className="grid size-10 shrink-0 rotate-[-8deg] place-items-center rounded-[42%_42%_52%_52%] bg-primary text-primary-foreground shadow-warm transition-transform group-hover:scale-105">
          <Guitar size={20} />
        </span>
        <div className="min-w-0">
          <span className="block truncate font-display text-2xl font-extrabold leading-none text-cream">
            Strumly
          </span>
        </div>
      </Link>

      {/* ── Primary Navigation ── */}
      <nav className="ml-7 hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
        {navLinks.map((item) => {
          const isActive = activeItem === item.label;
          return (
            <Link
              key={item.label}
              to={item.to}
              {...(item.search ? { search: item.search } : {})}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "border border-glass-border bg-glass text-foreground backdrop-blur-md"
                  : "text-foreground/75 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Right Actions ── */}
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Quick Search Pill */}
        {shouldShowSearch && (
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/50 pointer-events-none"
              size={14}
            />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search songs, chords..."
              className="h-9 w-48 lg:w-60 rounded-full border border-glass-border bg-glass/40 pl-9 pr-4 text-xs text-cream placeholder:text-cream/40 backdrop-blur-md outline-none transition focus:border-peach focus:ring-1 focus:ring-peach/30"
              aria-label="Search songs and chords"
            />
          </form>
        )}

        {/* Notifications Bell & Dropdown */}
        <NotificationDropdown />

        {/* Profile Dropdown Menu */}
        <AccountDropdown />
      </div>
    </header>
  );
}
