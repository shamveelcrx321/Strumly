import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Flame,
  Flower2,
  Guitar,
  Heart,
  Landmark,
  Leaf,
  Music2,
  Sparkles,
  TrendingUp,
  Waves,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { songService } from "@/services/song-service";
import type { Song } from "@/services/song-types";
import studioImage from "@/assets/strumly-studio.jpg";
import popImage from "@/assets/genre-pop.jpg";
import rockImage from "@/assets/genre-rock.jpg";
import acousticImage from "@/assets/genre-acoustic.jpg";
import indieImage from "@/assets/genre-indie.jpg";
import classicalImage from "@/assets/genre-classical.jpg";
import animeImage from "@/assets/genre-anime.jpg";
import malayalamImage from "@/assets/genre-malayalam.jpg";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/top-charts")({
  head: () => ({
    meta: [
      { title: "Top Charts — Strumly" },
      {
        name: "description",
        content:
          "Discover the most popular songs on Strumly — trending, most played, and newly added.",
      },
      { property: "og:title", content: "Top Charts — Strumly" },
      {
        property: "og:description",
        content:
          "Discover the most popular songs on Strumly — trending, most played, and newly added.",
      },
    ],
  }),
  component: TopChartsPage,
});

// ─── Constants ────────────────────────────────────────────────────────────────

type ChartTab = "Trending" | "Most Played" | "Most Loved" | "New & Hot";

const CHART_TABS: ChartTab[] = ["Trending", "Most Played", "Most Loved", "New & Hot"];

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-900/50 text-emerald-300 border-emerald-700/30",
  Intermediate: "bg-amber-900/50 text-amber-300 border-amber-700/30",
  Advanced: "bg-rose-900/50 text-rose-300 border-rose-700/30",
};

const GENRES = [
  { name: "Pop", image: popImage, Icon: BarChart3 },
  { name: "Rock", image: rockImage, Icon: Zap },
  { name: "Acoustic", image: acousticImage, Icon: Guitar },
  { name: "Indie", image: indieImage, Icon: Leaf },
  { name: "Classical", image: classicalImage, Icon: Landmark },
  { name: "Anime", image: animeImage, Icon: Flower2 },
  { name: "Malayalam", image: malayalamImage, Icon: Waves },
];

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-glass-border bg-glass/30 p-3.5">
      <Skeleton className="h-6 w-5 shrink-0 rounded bg-foreground/8" />
      <Skeleton className="size-[52px] shrink-0 rounded-lg bg-foreground/8" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/5 rounded bg-foreground/8" />
        <Skeleton className="h-3 w-1/4 rounded bg-foreground/8" />
      </div>
      <div className="hidden gap-2 sm:flex">
        <Skeleton className="h-5 w-14 rounded-full bg-foreground/8" />
        <Skeleton className="h-5 w-18 rounded-full bg-foreground/8" />
      </div>
      <Skeleton className="size-7 rounded-full bg-foreground/8" />
    </div>
  );
}

// ─── Interactive Ranked Song Row (Compact by default, expands on hover / tap) ─

interface ChartSongRowProps {
  song: Song;
  rank: number;
  isExpanded: boolean;
  isFav: boolean;
  onFavorite: (id: string) => void;
  onMouseEnter: () => void;
  onExpand: () => void;
}

function ChartSongRow({
  song,
  rank,
  isExpanded,
  isFav,
  onFavorite,
  onMouseEnter,
  onExpand,
}: ChartSongRowProps) {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking an interactive child (favorite button or view chords link), let it handle itself
    if ((e.target as HTMLElement).closest("button, a")) {
      return;
    }
    if (!isExpanded) {
      onExpand();
    } else {
      void navigate({ to: "/song/$id", params: { id: song.id } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      if (!isExpanded) {
        e.preventDefault();
        onExpand();
      }
    }
  };

  const rankStr = String(rank).padStart(2, "0");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={onMouseEnter}
      onFocus={onExpand}
      className={`group relative block overflow-hidden rounded-2xl border transition-all duration-300 ease-out cursor-pointer outline-none ${
        isExpanded
          ? "border-primary/50 bg-glass/60 shadow-[0_12px_40px_oklch(0_0_0/40%)]"
          : "border-glass-border bg-glass/30 hover:border-primary/30 hover:bg-glass/50 hover:shadow-[0_6px_24px_oklch(0_0_0/30%)]"
      }`}
      aria-label={`#${rank} — ${song.title} by ${song.artist}`}
    >
      <div
        className={`flex transition-all duration-300 ease-out ${
          isExpanded
            ? "flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-7"
            : "flex-row items-center gap-3 p-3.5 sm:gap-4 sm:p-4"
        }`}
      >
        {/* Rank Column + Artwork */}
        <div className="flex items-center gap-4 sm:gap-5 shrink-0">
          {/* Dedicated Fixed-Width Rank Column */}
          <div className="w-12 sm:w-14 shrink-0 text-center select-none">
            <span
              className={`block font-display font-bold tabular-nums transition-all duration-300 leading-none ${
                isExpanded
                  ? "text-2xl sm:text-3xl lg:text-4xl font-extrabold text-peach/85"
                  : "text-sm sm:text-base text-foreground/45"
              }`}
            >
              {rankStr}
            </span>
          </div>

          {/* Artwork */}
          <div
            className={`relative shrink-0 overflow-hidden bg-gradient-to-br ${song.artColor} transition-all duration-300 ease-out shadow-lg ${
              isExpanded
                ? "size-24 rounded-xl sm:size-32"
                : "size-[52px] rounded-lg"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`rounded-full border border-white/10 bg-black/15 shadow-inner transition-all duration-300 ${
                  isExpanded ? "size-12 sm:size-16" : "size-7"
                }`}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Music2
                className={`transition-all duration-300 ${
                  isExpanded ? "size-7 sm:size-8 text-peach/80" : "size-5 text-cream/40"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p
                className={`font-display font-extrabold leading-tight text-cream transition-all duration-300 truncate ${
                  isExpanded
                    ? "text-xl sm:text-2xl lg:text-3xl group-hover:text-primary"
                    : "text-sm sm:text-base font-semibold group-hover:text-primary"
                }`}
              >
                {song.title}
              </p>
              <p
                className={`truncate text-warm-muted transition-all duration-300 ${
                  isExpanded ? "text-sm mt-1" : "text-xs"
                }`}
              >
                {song.artist}
              </p>
            </div>

            {/* Compact row items (genre, difficulty, heart, arrow) */}
            {!isExpanded && (
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <span className="hidden sm:inline-block rounded-md border border-glass-border bg-glass/50 px-2 py-0.5 text-[10px] font-medium text-foreground/60">
                  {song.genre}
                </span>
                <span
                  className={`hidden sm:inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_STYLES[song.difficulty]}`}
                >
                  {song.difficulty}
                </span>
                <span className="hidden md:inline-block rounded-md border border-glass-border bg-glass/50 px-2 py-0.5 text-[10px] font-medium text-foreground/60">
                  {song.chordCount} chords
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFavorite(song.id);
                  }}
                  className={`shrink-0 rounded-full p-1.5 transition hover:scale-110 cursor-pointer ${
                    isFav ? "text-primary" : "text-foreground/30 hover:text-primary"
                  }`}
                  aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart size={15} className={isFav ? "fill-primary" : ""} />
                </button>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-foreground/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-peach"
                />
              </div>
            )}
          </div>

          {/* Expanded items (details & buttons) */}
          {isExpanded && (
            <div className="mt-3.5 pt-1 animate-flow-1">
              {/* Meta tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-glass-border bg-glass px-2.5 py-0.5 text-[11px] font-medium text-foreground/70">
                  Key: {song.key}
                </span>
                <span className="rounded-full border border-glass-border bg-glass px-2.5 py-0.5 text-[11px] font-medium text-foreground/70">
                  {song.genre}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${DIFFICULTY_STYLES[song.difficulty]}`}
                >
                  {song.difficulty}
                </span>
                <span className="rounded-full border border-glass-border bg-glass px-2.5 py-0.5 text-[11px] font-medium text-foreground/70">
                  {song.chordCount} chords
                </span>
                {song.capo > 0 && (
                  <span className="rounded-full border border-glass-border bg-glass px-2.5 py-0.5 text-[11px] font-medium text-foreground/70">
                    Capo {song.capo}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFavorite(song.id);
                  }}
                  className={`rounded-full border p-2 transition hover:scale-110 cursor-pointer ${
                    isFav
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-glass-border bg-glass text-foreground/50 hover:border-primary/40 hover:text-primary"
                  }`}
                  aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart size={16} className={isFav ? "fill-primary" : ""} />
                </button>
                <Link
                  to="/song/$id"
                  params={{ id: song.id }}
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-peach transition hover:bg-primary/25 group-hover:bg-primary/20"
                >
                  View Chords <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Coming Soon State (for charts without current data) ──────────────────────

function ComingSoonState({ tab }: { tab: ChartTab }) {
  const messages: Record<ChartTab, { icon: React.ReactNode; label: string; sub: string }> = {
    Trending: {
      icon: <TrendingUp size={28} className="text-peach/70" />,
      label: "Trending",
      sub: "",
    },
    "Most Played": {
      icon: <Flame size={28} className="text-peach/70" />,
      label: "Most Played",
      sub: "Play-count data will power this chart soon.",
    },
    "Most Loved": {
      icon: <Heart size={28} className="text-peach/70" />,
      label: "Most Loved",
      sub: "Favourite aggregations will power this chart soon.",
    },
    "New & Hot": {
      icon: <Sparkles size={28} className="text-peach/70" />,
      label: "New & Hot",
      sub: "",
    },
  };
  const m = messages[tab];
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-[42%_42%_52%_52%] border border-glass-border bg-glass shadow-warm">
        {m.icon}
      </div>
      <h3 className="font-display text-lg font-bold text-cream">{m.label} Chart</h3>
      <p className="mt-2 max-w-xs text-sm text-warm-muted">{m.sub}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function TopChartsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ChartTab>("Trending");
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [expandedSongId, setExpandedSongId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  // Load songs from the existing songService (Supabase-backed)
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setShowAll(false);
    setExpandedSongId(null);

    songService
      .getSongs()
      .then((data) => {
        if (cancelled) return;
        setSongs(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load top charts:", err);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Derived ranked list per tab
  const rankedSongs: Song[] = (() => {
    if (activeTab === "Trending" || activeTab === "Most Played") {
      return [...songs].sort((a, b) => b.popularity - a.popularity);
    }
    if (activeTab === "New & Hot") {
      return [...songs].sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
      );
    }
    // Most Loved — no real data yet
    return [];
  })();

  const INITIAL_VISIBLE = 10; // top 10 rows visible before "View Full Chart"
  const visibleSongs = showAll ? rankedSongs : rankedSongs.slice(0, INITIAL_VISIBLE);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenreNavigate = (genre: string) => {
    void navigate({ to: "/search", search: { q: "", genre } });
  };

  const showComingSoon =
    !isLoading && (activeTab === "Most Loved" || rankedSongs.length === 0);

  return (
    <div className="relative h-screen max-h-screen flex flex-col overflow-hidden text-foreground">
      {/* ── Full-page background ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-background">
        <img
          src={studioImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-[58%_center]"
          width={1920}
          height={1080}
        />
        {/* Dark warm overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/70" />
      </div>

      {/* ── Fixed Navbar (transparent overlay floating naturally over background) ── */}
      <div className="relative z-10 shrink-0">
        <Navbar activeItem="Top Charts" />
      </div>

      {/* ── Workspace Container (Identical to Explore) ── */}
      <main className="relative z-10 flex-1 min-h-0 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 w-full flex flex-col pb-2">

        {/* ── Fixed Header Block: Hero ── */}
        <div className="shrink-0 pt-1 pb-3 sm:pt-2 sm:pb-4 animate-flow-2">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-peach sm:text-sm">
            Top Charts
          </p>
          <h1 className="mt-1 max-w-2xl font-display text-3xl font-extrabold leading-tight text-cream sm:text-4xl lg:text-[44px]">
            The songs everyone{" "}
            <span className="text-peach">is playing.</span>
          </h1>
          <p className="mt-1 max-w-lg text-xs leading-5 text-cream/70 sm:text-sm sm:leading-6">
            Discover the songs climbing the charts — from timeless favourites to
            what's trending right now.
          </p>
        </div>

        {/* ── Sub-navbar: Chart Tabs (Identical to Explore tabs structure & styling) ── */}
        <div
          className="mb-3 flex shrink-0 items-center justify-between gap-4 animate-flow-4"
          aria-label="Chart categories"
        >
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {CHART_TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setShowAll(false);
                    setExpandedSongId(null);
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border border-primary/60 bg-primary/25 text-peach shadow-[0_0_16px_oklch(0.76_0.14_55/25%)] font-semibold"
                      : "border border-glass-border bg-glass/40 text-foreground/70 backdrop-blur-sm hover:bg-glass-hover hover:text-foreground"
                  }`}
                  aria-pressed={isActive}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Scrollable Card Area (ONLY THIS SECTION SCROLLS! IDENTICAL TO EXPLORE) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 custom-scrollbar">
          {/* Chart body */}
          <section aria-label={`${activeTab} chart`} className="animate-flow-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </div>
            ) : showComingSoon ? (
              <ComingSoonState tab={activeTab} />
            ) : (
              <div
                className="space-y-3"
                onMouseLeave={() => setExpandedSongId(null)}
              >
                {visibleSongs.map((song, idx) => (
                  <div
                    key={song.id}
                    className="animate-card-flow"
                    style={{ animationDelay: `${120 + Math.min(idx, 10) * 15}ms` }}
                  >
                    <ChartSongRow
                      song={song}
                      rank={idx + 1}
                      isExpanded={expandedSongId === song.id}
                      isFav={favorites.has(song.id)}
                      onFavorite={toggleFavorite}
                      onMouseEnter={() => setExpandedSongId(song.id)}
                      onExpand={() => setExpandedSongId(song.id)}
                    />
                  </div>
                ))}

                {/* View Full Chart */}
                {!showAll && rankedSongs.length > INITIAL_VISIBLE && (
                  <div className="pt-2 text-center animate-flow-6">
                    <button
                      onClick={() => setShowAll(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass/40 px-6 py-2.5 text-sm font-medium text-foreground/70 backdrop-blur-md transition hover:border-primary/30 hover:bg-glass/60 hover:text-foreground cursor-pointer"
                    >
                      View Full Chart <ChevronDown size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── Explore by Genre ── */}
          <section className="mt-12 pb-8 animate-flow-5" aria-label="Explore by genre">
            <div className="mb-1">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-peach sm:text-sm">
                Explore by Genre
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-cream sm:text-3xl">
                Find your vibe.
              </h2>
              <p className="mt-1.5 text-sm text-cream/65">
                Explore songs by your favourite genres.
              </p>
            </div>

            <div className="no-scrollbar mt-5 flex snap-x gap-3 overflow-x-auto pb-2">
              {GENRES.map(({ name, image, Icon }) => (
                <a
                  key={name}
                  href={`/search?genre=${encodeURIComponent(name)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleGenreNavigate(name);
                  }}
                  className="group relative h-[102px] w-[148px] shrink-0 snap-start overflow-hidden rounded-xl border border-glass-border text-left shadow-xl transition duration-300 hover:-translate-y-1 hover:border-primary/70"
                  aria-label={`Explore ${name} songs`}
                >
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    width={480}
                    height={480}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                  <span className="absolute inset-x-3 bottom-3 flex items-center gap-2 text-sm font-semibold text-cream">
                    <Icon size={17} />
                    {name}
                  </span>
                </a>
              ))}
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
