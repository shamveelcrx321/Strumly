import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Guitar,
  Heart,
  Minus,
  Music2,
  Music4,
  Pause,
  Play,
  Plus,
  Sliders,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import studioImage from "@/assets/strumly-studio.jpg";
import { songService } from "@/services/song-service";
import type { SongDetail, SongSummary } from "@/services/song-types";
import {
  transposeChord,
  transposeKey,
  simplifyChord,
} from "@/lib/chord-transposer";
import { ChordDiagram } from "@/components/song/ChordDiagram";
import { InteractiveGuitar } from "@/components/song/InteractiveGuitar";

// ─── Route Definition ─────────────────────────────────────────────────────────

export const Route = createFileRoute("/song/$id")({
  head: () => ({
    meta: [
      { title: "Songbook & Chords — Strumly" },
      { name: "description", content: "Interactive chords, lyrics, and guitar tablature on Strumly." },
    ],
  }),
  component: SongDetailPage,
});

// ─── Difficulty Styles ────────────────────────────────────────────────────────

const DIFFICULTY_STYLES = {
  Beginner: "bg-emerald-900/50 text-emerald-300 border-emerald-700/30",
  Intermediate: "bg-amber-900/50 text-amber-300 border-amber-700/30",
  Advanced: "bg-rose-900/50 text-rose-300 border-rose-700/30",
};


// ─── Main Song Detail Page Component ──────────────────────────────────────────

function SongDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [song, setSong] = useState<SongDetail | null>(null);
  const [relatedSongs, setRelatedSongs] = useState<SongSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Songbook controls state
  const [transposeSteps, setTransposeSteps] = useState(0);
  const [simplified, setSimplified] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(1); // 0: small, 1: medium, 2: large
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeChord, setActiveChord] = useState<string>("");

  const { isAuthenticated } = useAuth();

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to save songs to your favorites.", {
        action: {
          label: "Sign In",
          onClick: () => {
            void navigate({ to: "/login", search: { redirect: `/song/${id}` } });
          },
        },
      });
      return;
    }

    const next = !isFavorited;
    setIsFavorited(next);
    if (next) {
      toast.success("Saved to favorites!");
    } else {
      toast.info("Removed from favorites.");
    }
  };

  // Auto-scroll state
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 1 = normal, 2 = fast
  const scrollRafRef = useRef<number | null>(null);

  const fontSizes = [
    { label: "A−", class: "text-sm sm:text-base leading-7" },
    { label: "A", class: "text-base sm:text-lg leading-8" },
    { label: "A+", class: "text-lg sm:text-xl leading-9" },
  ];

  // Fetch song and related tracks
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setNotFound(false);
    setTransposeSteps(0);
    setAutoScroll(false);

    songService
      .getSong(id)
      .then((data) => {
        if (isCancelled) return;
        if (!data) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        setSong(data);
        setActiveChord(data.chords[0] || "");
        setIsLoading(false);

        // Fetch related songs
        songService.getRelatedSongs(data, 4).then((rel) => {
          if (!isCancelled) setRelatedSongs(rel);
        });
      })
      .catch((err) => {
        console.error("Error loading song:", err);
        if (!isCancelled) {
          setNotFound(true);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [id]);

  // Transposition helper
  const transformChord = useCallback(
    (ch: string): string => {
      let result = transposeChord(ch, transposeSteps);
      if (simplified) {
        result = simplifyChord(result);
      }
      return result;
    },
    [transposeSteps, simplified]
  );

  // Auto-scroll logic
  useEffect(() => {
    if (!autoScroll) {
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();
    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      const pixelsPerSecond = 24 * scrollSpeed;
      window.scrollBy({ top: (pixelsPerSecond * delta) / 1000, behavior: "instant" });

      // If reached bottom, stop
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10) {
        setAutoScroll(false);
        return;
      }

      scrollRafRef.current = requestAnimationFrame(step);
    };

    scrollRafRef.current = requestAnimationFrame(step);

    return () => {
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [autoScroll, scrollSpeed]);

  // Pause auto-scroll on manual wheel interaction
  useEffect(() => {
    const handleWheel = () => {
      if (autoScroll) {
        setAutoScroll(false);
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [autoScroll]);

  // Derived chords list (transposed & deduplicated)
  const currentChords = song
    ? Array.from(new Set(song.chords.map((ch) => transformChord(ch))))
    : [];

  const currentKey = song
    ? transposeKey(song.key, transposeSteps)
    : "";

  return (
    <div className="relative min-h-screen text-foreground selection:bg-primary/30 selection:text-cream">
      {/* ── Fixed Strumly Background (Static behind entire page) ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-background">
        <img
          src={studioImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-[58%_center]"
          width={1920}
          height={1080}
        />
        {/* Cinematic Strumly overlays matching Home & Search */}
        <div className="hero-vignette absolute inset-0 -z-20" />
        <div className="absolute inset-0 bg-black/45 bg-gradient-to-b from-black/40 via-black/25 to-black/60" />
      </div>

      {/* ── Shared Navbar ── */}
      <Navbar />

      {/* ── Page Content (SCROLLS NATURALLY) ── */}
      <main className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 pb-20 pt-3">
        {/* Back Link */}
        <div className="mb-4 animate-flow-2">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-xl border border-glass-border bg-glass/40 px-3.5 py-1.5 text-xs font-medium text-cream/75 backdrop-blur-md transition duration-200 hover:border-primary/40 hover:bg-glass/70 hover:text-cream"
          >
            <ArrowLeft size={14} className="text-peach" />
            Back to Explore
          </Link>
        </div>

        {/* ── Loading Skeleton State ── */}
        {isLoading && (
          <div className="space-y-6 animate-flow-3">
            <div className="flex flex-col gap-5 rounded-3xl border border-glass-border bg-glass/40 p-6 backdrop-blur-md sm:flex-row sm:items-center">
              <Skeleton className="size-28 shrink-0 rounded-2xl bg-foreground/10" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-1/2 rounded-lg bg-foreground/10" />
                <Skeleton className="h-4 w-1/4 rounded-md bg-foreground/10" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-16 rounded-md bg-foreground/10" />
                  <Skeleton className="h-6 w-16 rounded-md bg-foreground/10" />
                  <Skeleton className="h-6 w-16 rounded-md bg-foreground/10" />
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Skeleton className="h-[500px] rounded-3xl bg-foreground/10" />
              <Skeleton className="h-[500px] rounded-3xl bg-foreground/10" />
            </div>
          </div>
        )}

        {/* ── Not Found State ── */}
        {!isLoading && (notFound || !song) && (
          <div className="mx-auto max-w-md py-20 text-center animate-flow-3">
            <div className="mb-5 mx-auto grid size-20 place-items-center rounded-[42%_42%_52%_52%] border border-glass-border bg-glass shadow-warm">
              <Guitar size={32} className="text-peach" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-cream sm:text-3xl">
              Song not found
            </h1>
            <p className="mt-2 text-sm text-warm-muted">
              The arrangement you're looking for isn't available yet in the Strumly catalog.
            </p>
            <div className="mt-6 flex justify-center">
              <Link to="/search">
                <Button variant="warm" size="hero">
                  <ArrowLeft size={16} /> Back to Explore
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Song Detail Main Content ── */}
        {!isLoading && song && (
          <div className="space-y-6">
            {/* 1. Song Header Banner */}
            <section
              aria-label="Song information"
              className="relative overflow-hidden rounded-3xl border border-glass-border bg-glass/45 p-6 backdrop-blur-md shadow-2xl animate-flow-2"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                {/* Artwork + Title & Artist */}
                <div className="flex items-center gap-5 min-w-0">
                  {/* Artwork Badge */}
                  <div
                    className={`relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${
                      song.artColor || "from-stone-700 to-amber-900"
                    } shadow-lg border border-white/10`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/15" />
                    {/* Vinyl Groove Rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="size-16 rounded-full border border-white/10 bg-black/20" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Music2 size={34} className="text-cream/50 drop-shadow-md" />
                    </div>
                  </div>

                  {/* Title, Artist, Album */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-peach">
                      Arrangement
                    </p>
                    <h1 className="truncate font-display text-2xl font-extrabold tracking-normal text-cream sm:text-4xl lg:text-[42px] leading-tight mt-1">
                      {song.title}
                    </h1>
                    <p className="truncate text-sm font-medium text-warm-muted sm:text-base mt-0.5">
                      {song.artist}
                      {song.author && (
                        <span className="text-cream/50"> • Written by {song.author}</span>
                      )}
                      {song.album && (
                        <span className="text-cream/40"> • {song.album}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Favorite & Quick Actions */}
                <div className="flex shrink-0 items-center gap-3 self-start sm:self-center">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={handleToggleFavorite}
                    className="h-10 rounded-xl px-4 gap-2 text-xs font-medium cursor-pointer"
                    aria-label={isFavorited ? "Favorited" : "Add to favorites"}
                  >
                    <Heart
                      size={16}
                      className={isFavorited ? "fill-primary text-primary" : "text-cream/70"}
                    />
                    <span>{isFavorited ? "Saved" : "Favorite"}</span>
                  </Button>
                </div>
              </div>

              {/* Metadata Badges Ribbon */}
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-glass-border/60 pt-4 text-xs">
                <div className="flex items-center gap-1.5 rounded-lg border border-glass-border bg-glass/30 px-3 py-1 text-cream">
                  <span className="text-warm-muted">Key:</span>
                  <span className="font-bold text-peach">{currentKey}</span>
                  {transposeSteps !== 0 && (
                    <span className="text-[10px] text-cream/50">
                      (Orig: {song.key})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-glass-border bg-glass/30 px-3 py-1 text-cream">
                  <span className="text-warm-muted">Capo:</span>
                  <span className="font-semibold text-cream">
                    {song.capo ? `${song.capo}th fret` : "No Capo"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-glass-border bg-glass/30 px-3 py-1 text-cream">
                  <span className="text-warm-muted">Tuning:</span>
                  <span className="font-semibold text-cream">{song.tuning}</span>
                </div>

                <div
                  className={`rounded-lg border px-3 py-1 text-xs font-semibold ${
                    DIFFICULTY_STYLES[song.difficulty]
                  }`}
                >
                  {song.difficulty}
                </div>

                <div className="rounded-lg border border-glass-border bg-glass/30 px-3 py-1 text-warm-muted">
                  {song.genre}
                </div>

                {song.duration && (
                  <div className="rounded-lg border border-glass-border bg-glass/30 px-3 py-1 text-warm-muted">
                    {song.duration}
                  </div>
                )}
              </div>
            </section>

            {/* 2. Songbook Controls Toolbar */}
            <section
              aria-label="Songbook controls"
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-glass-border bg-glass/50 px-5 py-3.5 backdrop-blur-md shadow-xl animate-flow-3"
            >
              {/* Left Controls: Transpose */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Transposition Step Control */}
                <div className="flex items-center gap-1.5 rounded-xl border border-glass-border bg-glass/40 p-1">
                  <span className="px-2 text-xs font-semibold uppercase tracking-wider text-warm-muted">
                    Transpose
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTransposeSteps((prev) => prev - 1)}
                    className="size-7 rounded-lg text-cream/80 hover:bg-primary/20 hover:text-peach cursor-pointer"
                    aria-label="Transpose down 1 semitone"
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="min-w-[28px] text-center font-mono text-xs font-bold text-cream">
                    {transposeSteps > 0 ? `+${transposeSteps}` : transposeSteps}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTransposeSteps((prev) => prev + 1)}
                    className="size-7 rounded-lg text-cream/80 hover:bg-primary/20 hover:text-peach cursor-pointer"
                    aria-label="Transpose up 1 semitone"
                  >
                    <Plus size={14} />
                  </Button>
                </div>

                {/* Simplify Chords Toggle */}
                <button
                  onClick={() => setSimplified(!simplified)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    simplified
                      ? "border-primary/60 bg-primary/20 text-peach shadow-sm"
                      : "border-glass-border bg-glass/40 text-cream/70 hover:bg-glass hover:text-cream"
                  }`}
                  aria-pressed={simplified}
                >
                  <Sliders size={13} />
                  <span>Simplify Chords</span>
                </button>
              </div>

              {/* Right Controls: Font Size & Auto Scroll */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Font Size Selector */}
                <div className="flex items-center gap-1 rounded-xl border border-glass-border bg-glass/40 p-1">
                  <span className="px-2 text-xs font-semibold text-warm-muted">Size</span>
                  {fontSizes.map((fs, idx) => (
                    <button
                      key={fs.label}
                      onClick={() => setFontSizeIndex(idx)}
                      className={`size-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                        fontSizeIndex === idx
                          ? "bg-primary text-primary-foreground shadow-warm"
                          : "text-cream/70 hover:bg-glass hover:text-cream"
                      }`}
                    >
                      {fs.label}
                    </button>
                  ))}
                </div>

                {/* Auto Scroll Button */}
                <div className="flex items-center gap-1">
                  <Button
                    variant={autoScroll ? "warm" : "glass"}
                    size="sm"
                    onClick={() => setAutoScroll(!autoScroll)}
                    className="h-9 gap-2 text-xs font-semibold cursor-pointer"
                    aria-label={autoScroll ? "Pause auto scroll" : "Start auto scroll"}
                  >
                    {autoScroll ? <Pause size={14} /> : <Play size={14} />}
                    <span>{autoScroll ? "Auto Scrolling" : "Auto Scroll"}</span>
                  </Button>

                  {autoScroll && (
                    <button
                      onClick={() => setScrollSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
                      className="rounded-lg border border-glass-border bg-glass/60 px-2 py-1.5 font-mono text-xs font-bold text-peach hover:text-cream cursor-pointer"
                      title="Toggle scroll speed"
                    >
                      {scrollSpeed}x
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* 3. Main Workspace: Songbook (Left) + Tools (Right) */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] items-start animate-flow-4">
              {/* ── Left Column: Digital Guitar Songbook ── */}
              <article
                aria-label="Lyrics and chords"
                className="rounded-3xl border border-glass-border bg-glass/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl"
              >
                <div className="mb-6 flex items-center justify-between border-b border-glass-border/60 pb-4">
                  <div className="flex items-center gap-2">
                    <Music4 size={18} className="text-peach" />
                    <h2 className="font-display text-lg font-bold text-cream sm:text-xl">
                      Lyrics & Chords
                    </h2>
                  </div>
                  <span className="text-xs text-warm-muted">
                    Key of <span className="font-semibold text-peach">{currentKey}</span>
                  </span>
                </div>

                {/* Songbook Sections */}
                <div className={`space-y-8 font-mono ${fontSizes[fontSizeIndex].class}`}>
                  {song.sections.map((section, sIdx) => (
                    <section key={`section-${sIdx}`} className="space-y-3">
                      {/* Section Heading Badge */}
                      <div className="flex items-center gap-3">
                        <span className="rounded-md border border-glass-border bg-glass/70 px-2.5 py-0.5 font-sans text-xs font-bold uppercase tracking-wider text-peach">
                          [{section.name}]
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-glass-border/70 to-transparent" />
                      </div>

                      {/* Section Lines */}
                      <div className="space-y-4 pl-1 sm:pl-2">
                        {section.lines.map((line, lIdx) => (
                          <div key={`line-${sIdx}-${lIdx}`} className="space-y-1">
                            {/* Chords row above text */}
                            {line.chords && line.chords.length > 0 && (
                              <div className="flex flex-wrap gap-4 sm:gap-6 text-peach font-bold">
                                {line.chords.map((ch, cIdx) => {
                                  const transformed = transformChord(ch);
                                  return (
                                    <button
                                      key={`chord-${sIdx}-${lIdx}-${cIdx}`}
                                      onClick={() => setActiveChord(transformed)}
                                      className="rounded hover:underline hover:text-cream cursor-pointer transition-colors"
                                      title={`View ${transformed} chord diagram`}
                                    >
                                      {transformed}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Lyric text line */}
                            <p className="font-sans text-cream/90 select-text">
                              {line.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                {/* Songbook Footer Note */}
                <div className="mt-10 border-t border-glass-border/50 pt-5 text-center text-xs text-warm-muted">
                  <p>
                    Arrangement formatted for Strumly acoustic guitar play-along.
                  </p>
                </div>
              </article>

              {/* ── Right Column: Tools Sidebar ── */}
              <aside aria-label="Guitar tools" className="space-y-6">
                {/* 1. Chords Used Section */}
                <section
                  aria-label="Chords used"
                  className="rounded-3xl border border-glass-border bg-glass/45 p-5 backdrop-blur-md shadow-xl"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-cream flex items-center gap-2">
                      <Music2 size={15} className="text-peach" />
                      Chords Used
                    </h3>
                    <span className="text-xs text-warm-muted">
                      {currentChords.length} chords
                    </span>
                  </div>

                  {currentChords.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5">
                      {currentChords.map((ch) => (
                        <ChordDiagram
                          key={ch}
                          chord={ch}
                          selected={ch === activeChord}
                          onClick={(c) => setActiveChord(c)}
                          size="sm"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-glass-border/60 bg-glass/20 p-5 text-center">
                      <Guitar size={24} className="mx-auto text-peach/60 mb-2" />
                      <p className="text-xs font-semibold text-cream">Chords haven't been added yet</p>
                      <p className="text-[11px] text-warm-muted mt-1">
                        This arrangement was uploaded as lyrics-only. You can still sing or play along!
                      </p>
                    </div>
                  )}
                </section>

                {/* 2. Interactive Guitar Section */}
                {currentChords.length > 0 && (
                  <InteractiveGuitar
                    activeChord={activeChord}
                    onSelectChord={(c) => setActiveChord(c)}
                    availableChords={currentChords}
                  />
                )}

                {/* 3. Related Songs Section */}
                {relatedSongs.length > 0 && (
                  <section
                    aria-label="Related songs"
                    className="rounded-3xl border border-glass-border bg-glass/45 p-5 backdrop-blur-md shadow-xl"
                  >
                    <h3 className="font-display text-sm font-bold text-cream mb-3 flex items-center gap-2">
                      <Sparkles size={15} className="text-peach" />
                      Related Songs
                    </h3>

                    <div className="space-y-2">
                      {relatedSongs.map((rel) => (
                        <Link
                          key={rel.id}
                          to="/song/$id"
                          params={{ id: rel.id }}
                          className="group flex items-center gap-3 rounded-xl border border-glass-border bg-glass/30 p-2.5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-glass/60 hover:shadow-md"
                        >
                          <div
                            className={`relative size-11 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${rel.artColor}`}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Music2
                                size={18}
                                className="text-cream/60 transition-transform group-hover:scale-110"
                              />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-xs font-bold text-cream group-hover:text-primary transition-colors">
                              {rel.title}
                            </p>
                            <p className="truncate text-[11px] text-warm-muted">
                              {rel.artist}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-[10px] font-mono text-peach/80">
                              Key: {rel.key}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
