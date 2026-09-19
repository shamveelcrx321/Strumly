import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Music, Sparkles, Upload } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import studioImage from "@/assets/strumly-studio.jpg";
import { useAuth } from "@/lib/auth-context";

const myMusicSearchSchema = z.object({
  tab: z.enum(["favorites", "uploads"]).optional().default("favorites"),
});

export const Route = createFileRoute("/my-music")({
  validateSearch: myMusicSearchSchema,
  head: () => ({
    meta: [
      { title: "My Music — Strumly" },
      {
        name: "description",
        content: "View your saved favorites and uploaded chords on Strumly.",
      },
    ],
  }),
  component: MyMusicPage,
});

function MyMusicPage() {
  const { tab } = Route.useSearch();
  const [activeTab, setActiveTab] = React.useState<"favorites" | "uploads">(tab || "favorites");
  const { isAuthenticated, user, isLoading } = useAuth();

  React.useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

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
      <Navbar activeItem="My Music" />

      {/* ── Main Content Container ── */}
      <main className="flex-1 mx-auto max-w-[1440px] w-full px-5 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="animate-flow-2">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-peach">
            PERSONAL LIBRARY
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-extrabold text-cream">
            My Music
          </h1>
          <p className="mt-2 max-w-xl text-sm sm:text-base text-cream/70">
            Keep track of your favorite song chords, custom arrangements, and contributions.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex items-center gap-2 border-b border-glass-border/40 pb-4 animate-flow-3">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition cursor-pointer ${
              activeTab === "favorites"
                ? "border border-glass-border bg-glass text-cream shadow-sm backdrop-blur-md"
                : "text-cream/60 hover:text-cream"
            }`}
          >
            <Heart size={16} className={activeTab === "favorites" ? "text-peach" : ""} />
            Favorites
          </button>
          <button
            onClick={() => setActiveTab("uploads")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition cursor-pointer ${
              activeTab === "uploads"
                ? "border border-glass-border bg-glass text-cream shadow-sm backdrop-blur-md"
                : "text-cream/60 hover:text-cream"
            }`}
          >
            <Upload size={16} className={activeTab === "uploads" ? "text-peach" : ""} />
            My Uploads
          </button>
        </div>

        {/* Body Content */}
        {isAuthenticated ? (
          <div className="mt-10 max-w-lg rounded-2xl border border-glass-border/60 bg-[#171210]/80 p-8 shadow-xl backdrop-blur-xl animate-flow-4 text-center mx-auto">
            <div className="inline-grid size-12 place-items-center rounded-2xl bg-peach/15 text-peach mb-4">
              <Sparkles size={24} />
            </div>
            <h2 className="font-display text-2xl font-bold text-cream">
              {activeTab === "favorites" ? "Your Favorites" : "Your Uploads"}
            </h2>
            <p className="mt-2 text-sm text-cream/75 leading-relaxed">
              Logged in as <span className="font-semibold text-peach">{userName}</span> ({user?.email}).
              Your personal library will automatically synchronize with your Supabase account once user-specific data tables are connected.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="warm" size="hero" className="rounded-xl px-6">
                <Link to="/search">Explore Song Catalog</Link>
              </Button>
              <Button asChild variant="glass" size="hero" className="rounded-xl px-6">
                <Link to="/upload">Upload a New Song</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-10 max-w-lg rounded-2xl border border-glass-border/60 bg-[#171210]/80 p-8 shadow-xl backdrop-blur-xl animate-flow-4 text-center mx-auto">
            <div className="inline-grid size-12 place-items-center rounded-2xl bg-peach/15 text-peach mb-4">
              <Sparkles size={24} />
            </div>
            <h2 className="font-display text-2xl font-bold text-cream">
              {activeTab === "favorites" ? "Save your favorite chords" : "Manage your song uploads"}
            </h2>
            <p className="mt-2 text-sm text-cream/70 leading-relaxed">
              Sign in to sync your personal music library across all your devices. Saved songs and uploads will appear here once connected.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="warm" size="hero" className="rounded-xl px-6">
                <Link to="/login" search={{ redirect: "/my-music" }}>
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="glass" size="hero" className="rounded-xl px-6">
                <Link to="/signup" search={{ redirect: "/my-music" }}>
                  Create Account
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
