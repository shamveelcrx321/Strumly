import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function NotificationDropdown({ className = "" }: { className?: string }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleLogIn = () => {
    setIsOpen(false);
    const redirectPath =
      typeof window !== "undefined" ? window.location.pathname : "/";
    if (redirectPath && redirectPath !== "/login") {
      void navigate({
        to: "/login",
        search: { redirect: redirectPath },
      });
    } else {
      void navigate({ to: "/login" });
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* ── Bell Trigger Button (exact Navbar appearance and sizing) ── */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative grid size-9 place-items-center rounded-md text-cream/80 transition hover:bg-glass/50 hover:text-cream cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Bell size={18} />
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-glass-border bg-[#181311]/96 p-0 text-cream shadow-2xl backdrop-blur-2xl animate-flow-1"
        >
          {isAuthenticated ? (
            /* ── Authenticated User State ── */
            <div>
              <div className="flex items-center justify-between border-b border-glass-border/40 px-4 py-3">
                <span className="font-display text-sm font-bold text-cream">
                  Notifications
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="mb-3 grid size-12 place-items-center rounded-full border border-glass-border bg-glass/40 text-cream/40">
                  <Bell size={20} />
                </div>
                <p className="font-display text-sm font-bold text-cream">
                  No notifications yet
                </p>
                <p className="mt-1 text-xs text-warm-muted max-w-[200px] leading-relaxed">
                  Your Strumly activity will appear here.
                </p>
              </div>
            </div>
          ) : (
            /* ── Guest User State ── */
            <div className="p-5 text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full border border-glass-border bg-glass/60 text-peach shadow-sm">
                <Bell size={20} />
              </div>
              <h3 className="font-display text-base font-bold text-cream">
                Notifications
              </h3>
              <p className="mt-1 text-xs text-cream/70 leading-relaxed">
                Sign in to view your notifications.
              </p>
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleLogIn}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-warm transition hover:bg-primary-hover active:scale-[0.99] cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Log In</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
