import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  Guitar,
  Heart,
  Music2,
  Music4,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Song,
  type SearchFilters,
  type SortOption,
  type Genre,
  type Difficulty,
  searchSongs,
  suggestedSearches,
  musicQuotes,
} from "@/services/catalog";

import studioImage from "@/assets/strumly-studio.jpg";

// ─── Route ────────────────────────────────────────────────────────────────────

const searchParamsSchema = z.object({
  q: z.string().optional().default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchParamsSchema,
  head: () => ({
    meta: [
      {
        title: "Search Songs & Chords — Strumly",
      },
      {
        name: "description",
        content: "Search for guitar chords and lyrics on Strumly.",
      },
    ],
  }),
  component: SearchPage,
});

// ─── Constants ────────────────────────────────────────────────────────────────

const GENRES: Genre[] = [
  "Pop", "Rock", "Acoustic", "Indie", "Classical",
  "Anime", "Malayalam", "Bollywood", "R&B", "Alternative",
];
const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];
const KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F",
  "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Am", "Dm", "Em",
];
const CAPO_OPTIONS = [
  { label: "Any Capo", value: "any" },
  { label: "No Capo", value: "0" },
  { label: "Capo 1", value: "1" },
  { label: "Capo 2", value: "2" },
  { label: "Capo 3", value: "3" },
  { label: "Capo 4", value: "4" },
  { label: "Capo 5", value: "5" },
];
const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Relevance", value: "relevance" },
  { label: "Most Popular", value: "popular" },
  { label: "Recently Added", value: "recently-added" },
];
const CONTENT_TABS = ["All", "Chords", "Lyrics", "Tabs"] as const;
type ContentTab = (typeof CONTENT_TABS)[number];

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner:     "bg-emerald-900/50 text-emerald-300 border-emerald-700/30",
  Intermediate: "bg-amber-900/50 text-amber-300 border-amber-700/30",
  Advanced:     "bg-rose-900/50 text-rose-300 border-rose-700/30",
};

const RECOMMENDED_IDS = [
  "until-i-found-you",
  "perfect",
  "die-with-a-smile",
  "a-sky-full-of-stars",
  "kesariya",
  "numb",
];

const POPULAR_IDS = [
  "creep",
  "yellow",
  "blinding-lights",
  "channa-mereya",
  "believer",
  "faint",
];

// ─── Shared Navbar ────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <header className="relative z-30 mx-auto grid h-20 max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-5 px-5 sm:flex sm:px-8 lg:px-12">
      <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Strumly home">
        <span className="grid size-10 shrink-0 rotate-[-8deg] place-items-center rounded-[42%_42%_52%_52%] bg-primary text-primary-foreground shadow-warm">
          <Guitar size={20} />
        </span>
        <div className="min-w-0">
          <span className="block truncate font-display text-2xl font-extrabold leading-none">Strumly</span>
        </div>
      </Link>
      <nav className="ml-7 hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
        {["Explore", "Top Charts", "Upload", "My Music"].map((item, i) => (
          <a
            key={item}
            href={item === "Explore" ? "/search" : item === "Upload" ? "/upload" : `/#${item.toLowerCase().replace(" ", "-")}`}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${i === 0 ? "border border-glass-border bg-glass text-foreground backdrop-blur-md" : "text-foreground/75 hover:text-foreground"}`}
          >
            {item}
          </a>
        ))}
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
        </Button>
        <button className="size-9 overflow-hidden rounded-full border border-glass-border bg-primary text-xs font-bold text-primary-foreground" aria-label="Open profile">PA</button>
        <ChevronDown size={15} className="hidden text-foreground/70 sm:block" />
      </div>
    </header>
  );
}

// ─── Custom Glassmorphism Dropdowns ───────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(val) => onChange(val === "all" ? "" : val)}
    >
      <SelectTrigger className="h-9 w-full rounded-xl border border-glass-border bg-background/30 px-3 py-2 text-sm text-foreground backdrop-blur-md transition hover:bg-glass focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border border-glass-border bg-[oklch(0.18_0.02_50/96%)] text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1 min-w-[140px]">
        <SelectItem
          value="all"
          className="text-xs sm:text-sm text-cream/80 hover:bg-primary/20 hover:text-peach data-[state=checked]:bg-primary/25 data-[state=checked]:text-peach data-[state=checked]:font-semibold rounded-lg cursor-pointer py-2 transition-colors"
        >
          {placeholder}
        </SelectItem>
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="text-xs sm:text-sm text-cream/80 hover:bg-primary/20 hover:text-peach data-[state=checked]:bg-primary/25 data-[state=checked]:text-peach data-[state=checked]:font-semibold rounded-lg cursor-pointer py-2 transition-colors"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SortSelect({
  value,
  onChange,
  options,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
  options: { label: string; value: SortOption }[];
}) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as SortOption)}>
      <SelectTrigger className="h-9 min-w-[140px] rounded-xl border border-glass-border bg-glass/50 px-3 py-2 text-sm text-foreground backdrop-blur-md transition hover:bg-glass-hover focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent className="border border-glass-border bg-[oklch(0.18_0.02_50/96%)] text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1 min-w-[140px]">
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="text-xs sm:text-sm text-cream/80 hover:bg-primary/20 hover:text-peach data-[state=checked]:bg-primary/25 data-[state=checked]:text-peach data-[state=checked]:font-semibold rounded-lg cursor-pointer py-2 transition-colors"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

function FilterSidebar({
  filters,
  onChange,
  onClear,
}: {
  filters: SearchFilters;
  onChange: (key: keyof SearchFilters, value: string) => void;
  onClear: () => void;
}) {
  const hasActive = filters.genre || filters.difficulty || filters.key || filters.capo;

  return (
    <aside className="hidden lg:block w-[240px] shrink-0">
      <div className="rounded-2xl border border-glass-border bg-glass/50 p-5 backdrop-blur-md">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-cream">
            <SlidersHorizontal size={15} className="text-peach" />
            Filters
          </div>
          {hasActive && (
            <button
              onClick={onClear}
              className="text-xs text-foreground/50 transition hover:text-peach"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-5">
          <FilterGroup label="Genre">
            <FilterSelect
              value={filters.genre}
              onChange={(v) => onChange("genre", v)}
              options={GENRES.map((g) => ({ label: g, value: g }))}
              placeholder="All Genres"
            />
          </FilterGroup>

          <FilterGroup label="Difficulty">
            <FilterSelect
              value={filters.difficulty}
              onChange={(v) => onChange("difficulty", v)}
              options={DIFFICULTIES.map((d) => ({ label: d, value: d }))}
              placeholder="All Levels"
            />
          </FilterGroup>

          <FilterGroup label="Key">
            <FilterSelect
              value={filters.key}
              onChange={(v) => onChange("key", v)}
              options={KEYS.map((k) => ({ label: k, value: k }))}
              placeholder="All Keys"
            />
          </FilterGroup>

          <FilterGroup label="Capo">
            <FilterSelect
              value={filters.capo}
              onChange={(v) => onChange("capo", v)}
              options={CAPO_OPTIONS}
              placeholder="Any Capo"
            />
          </FilterGroup>
        </div>
      </div>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">{label}</p>
      {children}
    </div>
  );
}

// ─── Song Card ────────────────────────────────────────────────────────────────

function SongCard({ song, onFavorite }: { song: Song; onFavorite: (id: string) => void }) {
  return (
    <Link
      to="/song/$id"
      params={{ id: song.id }}
      className="group relative flex cursor-pointer gap-0 overflow-hidden rounded-2xl border border-glass-border bg-glass/40 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-glass/60 hover:shadow-[0_8px_32px_oklch(0_0_0/40%)]"
      aria-label={`${song.title} by ${song.artist}`}
    >
      {/* Album art thumbnail */}
      <div className={`relative size-[110px] shrink-0 overflow-hidden bg-gradient-to-br ${song.artColor}`}>
        {/* Subtle lighting overlay & inner shadow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10" />

        {/* Subtle vinyl record groove ring detail */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="size-16 rounded-full border border-white/10 bg-black/15 shadow-inner" />
        </div>

        {/* Perfectly centered music note icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Music2 size={32} className="text-cream/45 drop-shadow-md transition-all duration-300 group-hover:scale-110 group-hover:text-peach/80" />
        </div>

        {/* Right side shade transition into card body */}
        <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-r from-transparent to-black/40" />
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-display text-[15px] font-bold leading-snug text-cream group-hover:text-primary transition-colors">
              {song.title}
            </p>
            <p className="truncate text-xs text-warm-muted mt-0.5">{song.artist}</p>
          </div>
          {/* Favorite */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFavorite(song.id); }}
            className="shrink-0 rounded-full p-1.5 text-foreground/30 transition hover:text-primary"
            aria-label={song.isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={15} className={song.isFavorited ? "fill-primary text-primary" : ""} />
          </button>
        </div>

        {/* Tags */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md border border-glass-border bg-glass px-2 py-0.5 text-[11px] font-medium text-foreground/70">
            {song.genre}
          </span>
          <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${DIFFICULTY_STYLES[song.difficulty]}`}>
            {song.difficulty}
          </span>
        </div>

        {/* Bottom meta */}
        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-foreground/50">
          <span className="flex items-center gap-1">
            <Music4 size={11} />
            {song.chordCount} chords
          </span>
          <span className="flex items-center gap-1">
            <span className="text-peach/70">♩</span>
            Key: {song.key}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-glass-border bg-glass/30">
      <Skeleton className="size-[110px] shrink-0 rounded-none bg-foreground/8" />
      <div className="flex flex-1 flex-col justify-between p-3.5 gap-2">
        <div className="flex justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5 rounded-lg bg-foreground/8" />
            <Skeleton className="h-3 w-2/5 rounded-lg bg-foreground/8" />
          </div>
          <Skeleton className="size-6 rounded-full bg-foreground/8" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-12 rounded-md bg-foreground/8" />
          <Skeleton className="h-5 w-20 rounded-md bg-foreground/8" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16 rounded bg-foreground/8" />
          <Skeleton className="h-3 w-14 rounded bg-foreground/8" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  variant,
  onClear,
  onSuggest,
}: {
  variant: "no-query" | "no-results";
  onClear?: () => void;
  onSuggest?: (s: string) => void;
}) {
  if (variant === "no-query") {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 grid size-16 place-items-center rounded-[42%_42%_52%_52%] bg-glass border border-glass-border shadow-warm">
          <Search size={24} className="text-peach/70" />
        </div>
        <h2 className="font-display text-lg font-semibold text-cream">Search for a song</h2>
        <p className="mt-1.5 max-w-xs text-sm text-warm-muted">
          Type a song, artist, or genre above to discover guitar chords and lyrics.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {suggestedSearches.map((s) => (
            <button
              key={s}
              onClick={() => onSuggest?.(s)}
              className="rounded-full border border-glass-border bg-glass px-3 py-1.5 text-xs text-foreground/70 backdrop-blur-md transition hover:bg-glass-hover hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-[42%_42%_52%_52%] bg-glass border border-glass-border shadow-warm">
        <Search size={24} className="text-peach/70" />
      </div>
      <h2 className="font-display text-lg font-semibold text-cream">No songs found</h2>
      <p className="mt-1.5 max-w-xs text-sm text-warm-muted">
        Try another song, artist, or genre.
      </p>
      {onClear && (
        <Button variant="glass" size="sm" className="mt-4" onClick={onClear}>
          <X size={13} /> Clear filters
        </Button>
      )}
    </div>
  );
}

// ─── Mobile Filter Bar ────────────────────────────────────────────────────────

function MobileFilterBar({
  filters,
  onChange,
  onClear,
}: {
  filters: SearchFilters;
  onChange: (key: keyof SearchFilters, value: string) => void;
  onClear: () => void;
}) {
  const hasActive = filters.genre || filters.difficulty || filters.key || filters.capo;
  return (
    <div className="flex items-center gap-2 lg:hidden">
      <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
        <FilterSelect
          value={filters.genre}
          onChange={(v) => onChange("genre", v)}
          options={GENRES.map((g) => ({ label: g, value: g }))}
          placeholder="Genre"
        />
        <FilterSelect
          value={filters.difficulty}
          onChange={(v) => onChange("difficulty", v)}
          options={DIFFICULTIES.map((d) => ({ label: d, value: d }))}
          placeholder="Level"
        />
        <FilterSelect
          value={filters.key}
          onChange={(v) => onChange("key", v)}
          options={KEYS.map((k) => ({ label: k, value: k }))}
          placeholder="Key"
        />
        <FilterSelect
          value={filters.capo}
          onChange={(v) => onChange("capo", v)}
          options={CAPO_OPTIONS}
          placeholder="Capo"
        />
      </div>
      {hasActive && (
        <button onClick={onClear} className="shrink-0 text-xs text-foreground/50 hover:text-peach transition">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: SearchFilters = { genre: "", difficulty: "", key: "", capo: "" };

function SearchPage() {
  const { q: initialQ } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });

  const [inputValue, setInputValue] = useState(initialQ);
  const [query, setQuery] = useState(initialQ);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [activeTab, setActiveTab] = useState<ContentTab>("All");
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [randomQuote] = useState(
    () => musicQuotes[Math.floor(Math.random() * musicQuotes.length)] || musicQuotes[0],
  );
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set<string>());
  const [catalogSongs, setCatalogSongs] = useState<Song[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const pool = catalogSongs.length > 0 ? catalogSongs : songs;

  const recommendedSongs = RECOMMENDED_IDS.map((id) => {
    const s = pool.find((item) => item.id === id);
    return s ? { ...s, isFavorited: favorites.has(s.id) } : null;
  }).filter(Boolean) as Song[];

  const popularSongs = POPULAR_IDS.map((id) => {
    const s = pool.find((item) => item.id === id);
    return s ? { ...s, isFavorited: favorites.has(s.id) } : null;
  }).filter(Boolean) as Song[];

  // Run search on query/filters/sort change
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const isDefaultCatalog =
      !query &&
      !filters.genre &&
      !filters.difficulty &&
      !filters.key &&
      !filters.capo;

    const timeout = setTimeout(async () => {
      try {
        const results = await searchSongs(query, filters, sort);
        if (isCancelled) return;

        const withFavs = results.map((s) => ({
          ...s,
          isFavorited: favorites.has(s.id),
        }));

        setSongs(withFavs);
        if (isDefaultCatalog) {
          setCatalogSongs(withFavs);
        }
        setIsLoading(false);
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to search songs:", err);
          setIsLoading(false);
        }
      }
    }, 450);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters, sort]);

  // Sync URL → state
  useEffect(() => {
    setInputValue(initialQ);
    setQuery(initialQ);
  }, [initialQ]);

  const handleSearch = () => {
    const cleaned = inputValue.trim();
    setQuery(cleaned);
    void navigate({ search: { q: cleaned } });
  };

  const handleClear = () => {
    setInputValue("");
    setQuery("");
    setFilters(DEFAULT_FILTERS);
    void navigate({ search: { q: "" } });
    inputRef.current?.focus();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorited: !s.isFavorited } : s)),
    );
    setCatalogSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorited: !s.isFavorited } : s)),
    );
  };


  const handleSuggest = (s: string) => {
    setInputValue(s);
    setQuery(s);
    void navigate({ search: { q: s } });
  };

  const hasActiveFilters = !!(filters.genre || filters.difficulty || filters.key || filters.capo);

  return (
    <div className="relative h-screen max-h-screen flex flex-col overflow-hidden text-foreground">

      {/* ── Fixed Full-page Search Background ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-background">
        <img
          src={studioImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
          width={1920}
          height={1080}
        />

        {/* Readability overlay */}
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      </div>

      {/* ── Fixed Navbar ── */}
      <div className="relative z-10 shrink-0 animate-flow-1">
        <NavBar />
      </div>

      {/* ── Workspace Container ── */}
      <div className="relative z-10 flex-1 min-h-0 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 w-full flex flex-col pb-4">

        {/* ── Fixed Header Block: Page Title & Search Bar ── */}
        <div className="shrink-0">
          <div className="relative mb-3 mt-1 animate-flow-2">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-peach sm:text-sm">
              {query ? "Search Results" : "Search"}
            </p>
            <h1 className="mt-1 max-w-2xl font-display text-3xl font-extrabold leading-tight text-cream sm:text-4xl">
              {query ? (
                <>
                  Results for{" "}
                  <span className="text-peach">"{query}"</span>
                </>
              ) : (
                "Find the songs you want to play."
              )}
            </h1>
            {query && !isLoading && (
              <p className="mt-1 text-xs text-warm-muted sm:text-sm">
                {songs.length} songs found{" "}
                <span className="text-foreground/30">•</span>{" "}
                Discover chords, lyrics and more
              </p>
            )}
          </div>

          {/* Search Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="mb-3 flex h-[50px] items-center gap-3 rounded-[18px] border border-glass-border bg-glass/50 px-5 shadow-xl backdrop-blur-lg animate-flow-3"
          >
            <Search className="shrink-0 text-foreground/50" size={18} />
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40 sm:text-base"
              placeholder="Search songs, artists, genres..."
              aria-label="Search songs, artists, and genres"
              autoComplete="off"
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="shrink-0 rounded-full p-1.5 text-foreground/40 transition hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <Button variant="warm" size="sm" type="submit" className="shrink-0 h-9 px-5 text-sm">
              Search <ArrowRight size={14} />
            </Button>
          </form>

          {/* Mobile Filters */}
          <div className="mb-3 lg:hidden animate-flow-3">
            <MobileFilterBar filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
          </div>
        </div>

        {/* ── Main Workspace Row: Sidebar + Content Column ── */}
        <div className="flex gap-6 lg:gap-8 flex-1 min-h-0">

          {/* Desktop Sidebar (Fixed) */}
          <div className="hidden lg:block shrink-0 animate-flow-4">
            <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
          </div>

          {/* Content Column */}
          <div className="min-w-0 flex-1 flex flex-col min-h-0">

            {/* Tab row + Sort (Fixed) */}
            <div className="mb-3 flex shrink-0 items-center justify-between gap-4 animate-flow-4">
              {/* Content tabs */}
              <div className="no-scrollbar flex gap-1 overflow-x-auto">
                {CONTENT_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground shadow-warm"
                        : "border border-glass-border bg-glass/40 text-foreground/70 backdrop-blur-sm hover:bg-glass-hover hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex shrink-0 items-center gap-2 text-sm text-foreground/70 whitespace-nowrap">
                <span className="shrink-0 font-medium whitespace-nowrap">Sort by</span>
                <SortSelect value={sort} onChange={setSort} options={SORT_OPTIONS} />
              </div>
            </div>

            {/* ── Scrollable Card Area (ONLY THIS SECTION SCROLLS!) ── */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 custom-scrollbar">
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 animate-flow-5">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : !query && !hasActiveFilters ? (
                <div className="space-y-6 pb-6 animate-flow-5">
                  {/* Recommended Section */}
                  <section aria-label="Recommended for you">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-display text-base font-bold text-cream sm:text-lg flex items-center gap-2">
                        <Sparkles size={16} className="text-peach" />
                        Recommended for you
                      </h2>
                      <span className="text-xs text-warm-muted">Handpicked arrangements</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {recommendedSongs.map((song, idx) => (
                        <div
                          key={song.id}
                          className="animate-card-flow"
                          style={{ animationDelay: `${80 + Math.min(idx, 6) * 20}ms` }}
                        >
                          <SongCard song={song} onFavorite={toggleFavorite} />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Popular Section */}
                  <section aria-label="Popular on Strumly" className="pt-2">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-display text-base font-bold text-cream sm:text-lg flex items-center gap-2">
                        <TrendingUp size={16} className="text-peach" />
                        Popular on Strumly
                      </h2>
                      <span className="text-xs text-warm-muted">Top played this week</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {popularSongs.map((song, idx) => (
                        <div
                          key={song.id}
                          className="animate-card-flow"
                          style={{ animationDelay: `${100 + Math.min(idx, 6) * 20}ms` }}
                        >
                          <SongCard song={song} onFavorite={toggleFavorite} />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Suggested searches when empty */}
                  <div className="mt-6 border-t border-glass-border pt-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground/40">
                      Try searching for
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSuggest(s)}
                          className="rounded-full border border-glass-border bg-glass px-4 py-2 text-sm text-foreground/70 backdrop-blur-md transition hover:bg-glass-hover hover:text-foreground cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer quote */}
                  <footer className="mt-8 mb-4 flex items-center justify-center gap-3 border-t border-glass-border/40 pt-4 text-center">
                    <blockquote className="text-xs text-cream/50">
                      <span className="italic">"{randomQuote?.quote}"</span>{" "}
                      <span className="text-warm-muted/70">— {randomQuote?.author}</span>
                    </blockquote>
                  </footer>
                </div>
              ) : songs.length === 0 ? (
                <div className="animate-flow-5">
                  <EmptyState variant="no-results" onClear={() => { clearFilters(); handleClear(); }} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {songs.map((song, idx) => (
                      <div
                        key={song.id}
                        className="animate-card-flow"
                        style={{ animationDelay: `${140 + Math.min(idx, 8) * 20}ms` }}
                      >
                        <SongCard song={song} onFavorite={toggleFavorite} />
                      </div>
                    ))}
                  </div>

                  {/* "Didn't find what you're looking for?" CTA */}
                  {!isLoading && query && songs.length > 0 && (
                    <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-glass-border bg-glass/40 p-4 backdrop-blur-sm animate-flow-6">
                      <div className="flex items-center gap-4">
                        <div className="grid size-10 shrink-0 place-items-center rounded-[42%_42%_52%_52%] bg-primary/20 text-primary">
                          <Guitar size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-cream text-sm">Didn't find what you're looking for?</p>
                          <p className="text-xs text-warm-muted mt-0.5">
                            Try a different search term, or check out our top charts for popular songs.
                          </p>
                        </div>
                      </div>
                      <Button variant="warm" size="sm" className="shrink-0">
                        Explore Top Charts <ArrowRight size={14} />
                      </Button>
                    </div>
                  )}

                  {/* Footer quote */}
                  <footer className="mt-8 mb-4 flex items-center justify-center gap-3 border-t border-glass-border/40 pt-4 text-center animate-flow-6">
                    <blockquote className="text-xs text-cream/50">
                      <span className="italic">"{randomQuote?.quote}"</span>{" "}
                      <span className="text-warm-muted/70">— {randomQuote?.author}</span>
                    </blockquote>
                  </footer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
