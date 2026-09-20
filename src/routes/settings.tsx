import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Settings as SettingsIcon, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import studioImage from "@/assets/strumly-studio.jpg";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings — Strumly" },
      {
        name: "description",
        content: "Manage your Strumly profile, preferences, and account settings.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { isAuthenticated, user } = useAuth();
  const { favoriteSongs } = useFavorites();

  const userName =
    (user?.user_metadata?.full_name as string) ||
    (user?.email ? user.email.split("@")[0] : undefined) ||
    "Musician";

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-background text-foreground flex flex-col">
      {/* ── Exact Strumly Homepage Background ── */}
      <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
        <img
          src={studioImage}
          alt="A warm acoustic guitar studio overlooking a sunset lake"
          className="h-full w-full object-cover object-[58%_center]"
          width={1920}
          height={1080}
        />
        <div className="hero-vignette absolute inset-0 -z-20" />
        <div className="bottom-shade absolute inset-x-0 bottom-0 -z-10 h-[45%]" />
        <div className="absolute inset-0 -z-10 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* ── Reusable Strumly Navbar ── */}
      <Navbar />

      {/* ── Main Content Container ── */}
      <main className="flex-1 mx-auto max-w-[1440px] w-full px-5 sm:px-8 lg:px-12 py-8">
        <div className="animate-flow-2">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-peach">
            PREFERENCES
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-extrabold text-cream">
            Account Settings
          </h1>
          <p className="mt-2 max-w-xl text-sm sm:text-base text-cream/70">
            Manage your Strumly profile, display options, and security settings.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="mt-10 max-w-lg rounded-2xl border border-glass-border/60 bg-[#171210]/80 p-8 shadow-xl backdrop-blur-xl animate-flow-4 text-center mx-auto">
            <div className="inline-grid size-12 place-items-center rounded-2xl bg-peach/15 text-peach mb-4">
              <User size={24} />
            </div>
            <h2 className="font-display text-2xl font-bold text-cream">
              {userName}
            </h2>
            <p className="mt-1 text-xs text-warm-muted">{user?.email}</p>
            <p className="mt-3 text-sm text-cream/70 leading-relaxed">
              Your Strumly profile and account are active. Manage your saved favorites and uploaded chords below.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="warm" size="hero" className="rounded-xl px-6">
                <Link to="/my-music" search={{ tab: "favorites" }}>
                  <Heart size={16} className="text-peach mr-1" />
                  View Favorites ({favoriteSongs.length})
                </Link>
              </Button>
              <Button asChild variant="glass" size="hero" className="rounded-xl px-6">
                <Link to="/my-music" search={{ tab: "uploads" }}>
                  <Upload size={16} className="mr-1" />
                  My Uploads
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-10 max-w-lg rounded-2xl border border-glass-border/60 bg-[#171210]/80 p-8 shadow-xl backdrop-blur-xl animate-flow-4 text-center mx-auto">
            <div className="inline-grid size-12 place-items-center rounded-2xl bg-peach/15 text-peach mb-4">
              <SettingsIcon size={24} />
            </div>
            <h2 className="font-display text-2xl font-bold text-cream">
              Personal Account Settings
            </h2>
            <p className="mt-2 text-sm text-cream/70 leading-relaxed">
              Settings will become accessible once you log in with Supabase Auth.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="warm" size="hero" className="rounded-xl px-6">
                <Link to="/login" search={{ redirect: "/settings" }}>Sign In</Link>
              </Button>
              <Button asChild variant="glass" size="hero" className="rounded-xl px-6">
                <Link to="/signup" search={{ redirect: "/settings" }}>Create Account</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
