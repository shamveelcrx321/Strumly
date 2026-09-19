import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Compass,
  Heart,
  LogIn,
  LogOut,
  Music,
  Settings,
  Upload,
  User,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";

interface AccountDropdownProps {
  /**
   * Optional override for storyboarding / testing.
   * Defaults to live Supabase auth state from useAuth().
   */
  isLoggedIn?: boolean;
  userName?: string;
  userEmail?: string;
  avatarInitials?: string;
  className?: string;
}

export function AccountDropdown({
  isLoggedIn,
  userName,
  userEmail,
  avatarInitials,
  className = "",
}: AccountDropdownProps) {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const effectiveLoggedIn = isLoggedIn !== undefined ? isLoggedIn : isAuthenticated;

  const rawName =
    userName ||
    (user?.user_metadata?.full_name as string) ||
    (user?.email ? user.email.split("@")[0] : undefined) ||
    "Musician";

  const displayEmail = userEmail || user?.email || undefined;

  // Generate 2-letter initials from name or email
  const computedInitials = React.useMemo(() => {
    if (avatarInitials) return avatarInitials;
    if (!effectiveLoggedIn) return "PA";
    const parts = rawName.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return rawName.slice(0, 2).toUpperCase();
  }, [avatarInitials, effectiveLoggedIn, rawName]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    void navigate({ to: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`group flex items-center gap-1.5 outline-none cursor-pointer ${className}`}
          aria-label="Open profile menu"
        >
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-glass-border bg-primary text-xs font-bold text-primary-foreground shadow-sm transition group-hover:scale-105 group-hover:border-primary/80">
            {computedInitials}
          </span>
          <ChevronDown
            size={15}
            className="hidden text-foreground/70 transition group-hover:text-foreground sm:block"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="z-50 w-60 rounded-2xl border border-glass-border bg-[#181311]/95 p-2 text-cream shadow-2xl backdrop-blur-2xl animate-flow-1"
      >
        {effectiveLoggedIn ? (
          <>
            {/* ── Logged In Header ── */}
            <div className="border-b border-glass-border/40 px-3 py-2.5">
              <p className="truncate text-sm font-bold text-cream">{rawName}</p>
              {displayEmail && (
                <p className="truncate text-xs text-cream/60">{displayEmail}</p>
              )}
            </div>

            <div className="py-1">
              <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-sm font-medium text-cream/90 transition hover:bg-glass hover:text-peach cursor-pointer">
                <Link to="/my-music" className="flex items-center gap-2.5 w-full">
                  <Music size={15} className="text-peach" />
                  <span>My Music</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-sm font-medium text-cream/90 transition hover:bg-glass hover:text-peach cursor-pointer">
                <Link to="/my-music" search={{ tab: "favorites" }} className="flex items-center gap-2.5 w-full">
                  <Heart size={15} className="text-peach" />
                  <span>Favorites</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-sm font-medium text-cream/90 transition hover:bg-glass hover:text-peach cursor-pointer">
                <Link to="/my-music" search={{ tab: "uploads" }} className="flex items-center gap-2.5 w-full">
                  <Upload size={15} className="text-peach" />
                  <span>My Uploads</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-sm font-medium text-cream/90 transition hover:bg-glass hover:text-peach cursor-pointer">
                <Link to="/settings" className="flex items-center gap-2.5 w-full">
                  <Settings size={15} className="text-peach" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-glass-border/40 my-1" />

            <DropdownMenuItem
              className="rounded-xl px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-destructive/20 hover:text-red-300 cursor-pointer"
              onClick={handleSignOut}
            >
              <div className="flex items-center gap-2.5 w-full">
                <LogOut size={15} />
                <span>Log Out</span>
              </div>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {/* ── Logged Out (Guest) Header ── */}
            <div className="border-b border-glass-border/40 px-3 py-2.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-peach">
                Welcome to Strumly
              </p>
              <p className="mt-0.5 text-xs text-cream/65">
                Sign in to save favorites & upload chords.
              </p>
            </div>

            <div className="py-1">
              <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-sm font-semibold text-cream transition hover:bg-glass hover:text-peach cursor-pointer">
                <Link to="/login" className="flex items-center gap-2.5 w-full">
                  <LogIn size={15} className="text-peach" />
                  <span>Sign In</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-sm font-semibold text-cream transition hover:bg-glass hover:text-peach cursor-pointer">
                <Link to="/signup" className="flex items-center gap-2.5 w-full">
                  <UserPlus size={15} className="text-peach" />
                  <span>Create Account</span>
                </Link>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-glass-border/40 my-1" />

            <div className="py-0.5">
              <DropdownMenuItem asChild className="rounded-xl px-3 py-1.5 text-xs font-medium text-cream/75 transition hover:bg-glass hover:text-cream cursor-pointer">
                <Link to="/search" className="flex items-center gap-2.5 w-full">
                  <Compass size={14} className="text-cream/50" />
                  <span>Explore Songs</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-xl px-3 py-1.5 text-xs font-medium text-cream/75 transition hover:bg-glass hover:text-cream cursor-pointer">
                <Link to="/upload" className="flex items-center gap-2.5 w-full">
                  <Upload size={14} className="text-cream/50" />
                  <span>Upload Chords</span>
                </Link>
              </DropdownMenuItem>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
