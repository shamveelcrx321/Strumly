import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from "react";
import {
  ArrowRight,
  Compass,
  Disc,
  Edit3,
  FileText,
  Guitar,
  Home,
  Info,
  MessageSquare,
  Music,
  Music2,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Upload as UploadIcon,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccountDropdown } from "@/components/AccountDropdown";
import { useAuth } from "@/lib/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import studioImage from "@/assets/strumly-studio.jpg";
import { songService } from "@/services/song-service";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload a Song — Strumly" },
      { name: "description", content: "Share your lyrics and arrangements with the Strumly guitar community." },
    ],
  }),
  component: UploadPage,
});

// ─── Dropdown Options ─────────────────────────────────────────────────────────

const GENRES = [
  "Pop",
  "Rock",
  "Acoustic",
  "Indie",
  "Classical",
  "Anime",
  "Malayalam",
  "Bollywood",
  "Alternative",
  "Other",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Am", "Dm", "Em",
];

const CAPO_OPTIONS = Array.from({ length: 13 }, (_, i) => i.toString());

const TUNING_OPTIONS = [
  "Standard",
  "Drop D",
  "Drop C",
  "D Standard",
  "Open G",
  "Open D",
  "Other",
];

// ─── Upload Page Component ───────────────────────────────────────────────────

function UploadPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast.info("Please sign in to upload songs to Strumly.");
      void navigate({ to: "/login", search: { redirect: "/upload" } });
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  // Mode: "type" | "file"
  const [inputMode, setInputMode] = useState<"type" | "file">("type");

  // Form Fields
  const [lyrics, setLyrics] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [keySignature, setKeySignature] = useState("C");
  const [capo, setCapo] = useState("0");
  const [tuning, setTuning] = useState("Standard");

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search input in navbar
  const [navSearch, setNavSearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag & Drop
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".txt")) {
      toast.error("Please upload a .txt lyrics file.");
      return;
    }

    if (file.size > 200 * 1024) {
      toast.error("File is too large. Maximum size is 200KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content || !content.trim()) {
        toast.error("The selected file is empty.");
        return;
      }

      if (content.length > 10000) {
        toast.warning("Lyrics truncated to 10,000 characters.");
        setLyrics(content.slice(0, 10000));
      } else {
        setLyrics(content);
      }

      setUploadedFileName(file.name);
      toast.success(`Loaded lyrics from ${file.name}`);
    };

    reader.onerror = () => {
      toast.error("Failed to read file.");
    };

    reader.readAsText(file);
  };

  const handleRemoveFile = () => {
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNavSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = navSearch.trim();
    if (q) {
      void navigate({ to: "/search", search: { q } });
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a song title.");
      return;
    }
    if (!artist.trim()) {
      toast.error("Please enter the artist/owner.");
      return;
    }
    if (!author.trim()) {
      toast.error("Please enter the author/songwriter.");
      return;
    }
    if (!genre) {
      toast.error("Please select a genre.");
      return;
    }
    if (!lyrics.trim()) {
      toast.error("Please add lyrics.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newSongId = await songService.createSong({
        title: title.trim(),
        artist: artist.trim(),
        author: author.trim(),
        genre,
        difficulty: difficulty as "Beginner" | "Intermediate" | "Advanced",
        key: keySignature,
        capo: parseInt(capo, 10) || 0,
        tuning,
        lyricsText: lyrics.trim(),
      });

      toast.success("Your song has been added to Strumly.");

      // Navigate to the newly created song detail page
      void navigate({ to: "/song/$id", params: { id: newSongId } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create song. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Truncated lyrics preview helper
  const previewLines = lyrics
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="relative min-h-screen text-foreground selection:bg-primary/30 selection:text-cream">
      {/* ── Fixed Static Strumly Background ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-background">
        <img
          src={studioImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-[58%_center]"
          width={1920}
          height={1080}
        />
        <div className="hero-vignette absolute inset-0 -z-20" />
        <div className="absolute inset-0 bg-black/45 bg-gradient-to-b from-black/40 via-black/25 to-black/60" />
      </div>

      {/* ── Navbar Matching Reference ── */}
      <header className="relative z-30 mx-auto grid h-20 max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-6 px-5 sm:px-8 lg:px-12 animate-flow-1">
        {/* Left: Strumly Branding with subtext */}
        <Link to="/" className="flex shrink-0 items-center gap-3 group" aria-label="Strumly home">
          <span className="grid size-10 shrink-0 rotate-[-8deg] place-items-center rounded-[42%_42%_52%_52%] bg-primary text-primary-foreground shadow-warm transition-transform group-hover:scale-105">
            <Guitar size={20} />
          </span>
          <div className="min-w-0">
            <span className="block font-display text-2xl font-extrabold leading-none text-cream">
              Strumly
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links with Icons */}
        <nav className="hidden md:flex items-center justify-center gap-1 lg:gap-2" aria-label="Primary navigation">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-foreground/75 transition hover:text-foreground"
          >
            <Home size={16} />
            Home
          </Link>

          <Link
            to="/search"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-foreground/75 transition hover:text-foreground"
          >
            <Compass size={16} />
            Explore
          </Link>

          {/* Upload: Active Navigation Item */}
          <Link
            to="/upload"
            className="flex items-center gap-2 rounded-xl border-b-2 border-peach bg-glass/60 px-4 py-2 text-sm font-semibold text-cream shadow-sm backdrop-blur-md"
          >
            <UploadIcon size={16} className="text-peach" />
            Upload
          </Link>

          <a
            href="/#community"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-foreground/75 transition hover:text-foreground"
          >
            <Users size={16} />
            Community
          </a>

          <Link
            to="/login"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-foreground/75 transition hover:text-foreground"
          >
            <Music size={16} />
            My Music
          </Link>
        </nav>

        {/* Right: Search Pill & Avatar */}
        <div className="flex shrink-0 items-center gap-3">
          <form onSubmit={handleNavSearchSubmit} className="relative hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/50" size={15} />
            <input
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search songs, artists, genres..."
              className="h-9 w-60 lg:w-72 rounded-full border border-glass-border bg-glass/40 pl-9 pr-4 text-xs text-cream placeholder:text-cream/40 backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-primary/40 transition"
            />
          </form>

          <AccountDropdown />
        </div>
      </header>

      {/* ── Main Scrollable Content ── */}
      <main className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 pb-24 pt-4">
        {/* Page Intro Header */}
        <div className="animate-flow-2">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-peach">
            SHARE YOUR MUSIC
          </p>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl font-extrabold text-cream leading-tight">
            Upload a Song
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-cream/75 leading-relaxed">
            Add lyrics, share your arrangement, and make it a part of the Strumly community. Because every song has a home here.
          </p>
        </div>

        {/* Two-Column Landscape Layout */}
        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] items-start animate-flow-3">
          {/* ── LEFT COLUMN: Form Panels ── */}
          <div className="space-y-6">
            {/* 1. Add Your Lyrics Panel */}
            <section
              aria-label="Add Your Lyrics"
              className="rounded-2xl border border-glass-border bg-glass/45 p-6 backdrop-blur-md shadow-xl"
            >
              <h2 className="font-display text-lg font-bold text-cream">
                1. Add Your Lyrics
              </h2>
              <p className="mt-1 text-xs text-warm-muted">
                Choose how you want to add your lyrics. You can type or paste them, or upload a .txt file.
              </p>

              {/* Tabs Row */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-glass-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInputMode("type")}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      inputMode === "type"
                        ? "border border-peach/80 bg-glass/70 text-cream shadow-sm"
                        : "border border-glass-border/50 bg-glass/30 text-cream/70 hover:bg-glass/50 hover:text-cream"
                    }`}
                  >
                    <Edit3 size={14} className="text-peach" />
                    Type / Paste Lyrics
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputMode("file")}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      inputMode === "file"
                        ? "border border-peach/80 bg-glass/70 text-cream shadow-sm"
                        : "border border-glass-border/50 bg-glass/30 text-cream/70 hover:bg-glass/50 hover:text-cream"
                    }`}
                  >
                    <UploadIcon size={14} className="text-peach" />
                    Upload .TXT File
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-warm-muted">
                  <span>TXT files only</span>
                  <Info size={13} className="text-warm-muted/80" />
                </div>
              </div>

              {/* Tab 1: Type / Paste Lyrics */}
              {inputMode === "type" && (
                <div className="mt-4 relative">
                  <textarea
                    value={lyrics}
                    onChange={(e) => {
                      if (e.target.value.length <= 10000) {
                        setLyrics(e.target.value);
                      }
                    }}
                    placeholder={"Paste or type your lyrics here...\n\nYou can include chords in square brackets like [C], [Am] etc."}
                    className="h-64 sm:h-72 w-full rounded-xl border border-glass-border bg-[oklch(0.12_0.015_50/70%)] p-4 text-cream placeholder:text-cream/35 focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono text-sm leading-relaxed resize-y custom-scrollbar"
                  />
                  <div className="mt-1.5 flex justify-end text-xs font-mono text-warm-muted">
                    <span>{lyrics.length}/10000</span>
                  </div>
                </div>
              )}

              {/* Tab 2: Upload .TXT File */}
              {inputMode === "file" && (
                <div className="mt-4 space-y-3">
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition cursor-pointer ${
                      isDragging
                        ? "border-peach bg-primary/20 scale-[0.99]"
                        : "border-glass-border bg-glass/25 hover:border-peach/50 hover:bg-glass/40"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    <div className="grid size-12 place-items-center rounded-full bg-glass/60 border border-glass-border text-peach shadow-sm mb-3">
                      <UploadIcon size={22} />
                    </div>

                    <p className="font-display text-sm font-bold text-cream">
                      Drop your lyrics here
                    </p>
                    <p className="text-xs text-warm-muted my-1">or</p>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-glass-border bg-glass/60 px-3 py-1 text-xs font-semibold text-cream hover:bg-glass-hover">
                      Choose a .txt file
                    </span>
                    <p className="mt-3 text-[11px] text-warm-muted/70">
                      TXT files only (max 10,000 characters)
                    </p>
                  </div>

                  {/* Uploaded File Status Badge */}
                  {uploadedFileName && (
                    <div className="flex items-center justify-between rounded-xl border border-glass-border bg-glass/50 p-3 text-xs">
                      <div className="flex items-center gap-2 text-cream">
                        <FileText size={16} className="text-peach" />
                        <span className="font-semibold">{uploadedFileName}</span>
                        <span className="text-warm-muted">({lyrics.length} characters)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-xs text-warm-muted hover:text-rose-400 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Lyrics editor preview under file upload */}
                  {lyrics && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5 text-xs text-warm-muted">
                        <span>Imported lyrics (editable):</span>
                        <span className="font-mono">{lyrics.length}/10000</span>
                      </div>
                      <textarea
                        value={lyrics}
                        onChange={(e) => {
                          if (e.target.value.length <= 10000) {
                            setLyrics(e.target.value);
                          }
                        }}
                        className="h-44 w-full rounded-xl border border-glass-border bg-[oklch(0.12_0.015_50/70%)] p-3 text-cream placeholder:text-cream/35 focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono text-xs leading-relaxed resize-y custom-scrollbar"
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 2. Song Information Panel */}
            <section
              aria-label="Song Information"
              className="rounded-2xl border border-glass-border bg-glass/45 p-6 backdrop-blur-md shadow-xl"
            >
              <h2 className="font-display text-lg font-bold text-cream">
                2. Song Information
              </h2>
              <p className="mt-1 text-xs text-warm-muted">
                Tell us about the song so others can find and enjoy it.
              </p>

              {/* Row 1: Title, Artist, Author */}
              <div className="mt-5 grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cream/90 mb-1.5">
                    Song Title <span className="text-peach">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Numb"
                    className="h-10 w-full rounded-xl border border-glass-border bg-[oklch(0.12_0.015_50/70%)] px-3.5 text-xs sm:text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:ring-1 focus:ring-primary/50 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream/90 mb-1.5">
                    Artist / Owner <span className="text-peach">*</span>
                  </label>
                  <input
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Linkin Park"
                    className="h-10 w-full rounded-xl border border-glass-border bg-[oklch(0.12_0.015_50/70%)] px-3.5 text-xs sm:text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:ring-1 focus:ring-primary/50 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream/90 mb-1.5">
                    Author / Songwriter <span className="text-peach">*</span>
                  </label>
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Chester Bennington"
                    className="h-10 w-full rounded-xl border border-glass-border bg-[oklch(0.12_0.015_50/70%)] px-3.5 text-xs sm:text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:ring-1 focus:ring-primary/50 transition"
                  />
                </div>
              </div>

              {/* Row 2: Genre, Difficulty, Key, Capo, Tuning */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* Genre */}
                <div>
                  <label className="block text-xs font-semibold text-cream/90 mb-1.5">
                    Genre <span className="text-peach">*</span>
                  </label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="h-10 w-full rounded-xl border border-glass-border bg-[oklch(0.12_0.015_50/70%)] px-3 py-2 text-xs text-cream hover:bg-glass focus:ring-1 focus:ring-primary/40 cursor-pointer">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="border border-glass-border bg-[oklch(0.18_0.02_50/96%)] text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1">
                      {GENRES.map((g) => (
                        <SelectItem
                          key={g}
                          value={g}
                          className="text-xs text-cream/80 hover:bg-primary/20 hover:text-peach data-[state=checked]:bg-primary/25 data-[state=checked]:text-peach data-[state=checked]:font-semibold rounded-lg cursor-pointer py-1.5"
                        >
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-semibold text-cream/90 mb-1.5">
                    Difficulty
                  </label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="h-10 w-full rounded-xl border border-glass-border bg-[oklch(0.12_0.015_50/70%)] px-3 py-2 text-xs text-cream hover:bg-glass focus:ring-1 focus:ring-primary/40 cursor-pointer">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="border border-glass-border bg-[oklch(0.18_0.02_50/96%)] text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1">
                      {DIFFICULTIES.map((d) => (
                        <SelectItem
                          key={d}
                          value={d}
                          className="text-xs text-cream/80 hover:bg-primary/20 hover:text-peach data-[state=checked]:bg-primary/25 data-[state=checked]:text-peach data-[state=checked]:font-semibold rounded-lg cursor-pointer py-1.5"
                        >
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Key */}
                <div>
                  <label className="block text-xs font-semibold text-cream/90 mb-1.5">
                    Key
                  </label>
                  <Select value={keySignature} onValueChange={setKeySignature}>
                    <SelectTrigger className="h-10 w-full rounded-xl border border-glass-border bg-[oklch(0.12_0.015_50/70%)] px-3 py-2 text-xs text-cream hover:bg-glass focus:ring-1 focus:ring-primary/40 cursor-pointer">
                      <SelectValue placeholder="Key" />
                    </SelectTrigger>
                    <SelectContent className="border border-glass-border bg-[oklch(0.18_0.02_50/96%)] text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1 max-h-56">
                      {KEYS.map((k) => (
                        <SelectItem
                          key={k}
                          value={k}
                          className="text-xs text-cream/80 hover:bg-primary/20 hover:text-peach data-[state=checked]:bg-primary/25 data-[state=checked]:text-peach data-[state=checked]:font-semibold rounded-lg cursor-pointer py-1.5"
                        >
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Capo */}
                <div>
                  <label className="block text-xs font-semibold text-cream/90 mb-1.5">
                    Capo
                  </label>
                  <Select value={capo} onValueChange={setCapo}>
                    <SelectTrigger className="h-10 w-full rounded-xl border border-glass-border bg-[oklch(0.12_0.015_50/70%)] px-3 py-2 text-xs text-cream hover:bg-glass focus:ring-1 focus:ring-primary/40 cursor-pointer">
                      <SelectValue placeholder="Capo" />
                    </SelectTrigger>
                    <SelectContent className="border border-glass-border bg-[oklch(0.18_0.02_50/96%)] text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1 max-h-56">
                      {CAPO_OPTIONS.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="text-xs text-cream/80 hover:bg-primary/20 hover:text-peach data-[state=checked]:bg-primary/25 data-[state=checked]:text-peach data-[state=checked]:font-semibold rounded-lg cursor-pointer py-1.5"
                        >
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tuning */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-cream/90 mb-1.5">
                    Tuning
                  </label>
                  <Select value={tuning} onValueChange={setTuning}>
                    <SelectTrigger className="h-10 w-full rounded-xl border border-glass-border bg-[oklch(0.12_0.015_50/70%)] px-3 py-2 text-xs text-cream hover:bg-glass focus:ring-1 focus:ring-primary/40 cursor-pointer">
                      <SelectValue placeholder="Tuning" />
                    </SelectTrigger>
                    <SelectContent className="border border-glass-border bg-[oklch(0.18_0.02_50/96%)] text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1">
                      {TUNING_OPTIONS.map((t) => (
                        <SelectItem
                          key={t}
                          value={t}
                          className="text-xs text-cream/80 hover:bg-primary/20 hover:text-peach data-[state=checked]:bg-primary/25 data-[state=checked]:text-peach data-[state=checked]:font-semibold rounded-lg cursor-pointer py-1.5"
                        >
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate({ to: "/search" })}
                className="rounded-xl border border-glass-border bg-glass/40 px-6 py-2.5 text-sm font-semibold text-cream hover:bg-glass hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex flex-col items-center sm:items-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-peach px-8 py-3 text-sm font-display font-bold text-black shadow-warm hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <PlusCircle size={18} />
                  <span>{isSubmitting ? "Creating Song..." : "Create Song"}</span>
                  <ArrowRight size={16} />
                </button>
                <p className="mt-1.5 text-xs text-warm-muted text-center sm:text-right">
                  Your song will be added to Strumly and will be visible in Explore.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Live Preview Panel ── */}
          <aside
            aria-label="Live preview"
            className="rounded-2xl border border-glass-border bg-glass/45 p-5 backdrop-blur-md shadow-xl lg:sticky lg:top-24 space-y-4"
          >
            {/* Preview Header */}
            <div>
              <div className="flex items-center gap-2 text-cream font-bold text-sm">
                <Music2 size={16} className="text-peach" />
                <span>Preview</span>
              </div>
              <p className="text-xs text-warm-muted mt-0.5">
                A quick look at how your song will appear.
              </p>
            </div>

            {/* Song Card Artwork with Sunset Studio View */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-[16/10] shadow-lg group">
              <img
                src={studioImage}
                alt=""
                className="h-full w-full object-cover object-[58%_center] transition duration-500 group-hover:scale-105"
              />
              {/* Sunset ambient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Card Titles overlay */}
              <div className="absolute inset-x-3.5 bottom-3.5">
                <p className="truncate font-display text-lg font-extrabold text-cream leading-snug">
                  {title.trim() || "Your Song Title"}
                </p>
                <p className="truncate text-xs text-warm-muted mt-0.5">
                  {artist.trim() || "Artist Name"}
                </p>
              </div>
            </div>

            {/* Metadata Rows with Icons */}
            <div className="space-y-2.5 text-xs text-cream/80 border-b border-glass-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-warm-muted">
                  <MessageSquare size={14} className="text-peach/80" />
                  <span>Genre</span>
                </div>
                <span className="font-semibold text-cream">{genre || "—"}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-warm-muted">
                  <Sun size={14} className="text-peach/80" />
                  <span>Difficulty</span>
                </div>
                <span className="font-semibold text-cream">{difficulty || "—"}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-warm-muted">
                  <Music2 size={14} className="text-peach/80" />
                  <span>Key</span>
                </div>
                <span className="font-semibold text-cream">{keySignature || "—"}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-warm-muted">
                  <Disc size={14} className="text-peach/80" />
                  <span>Capo</span>
                </div>
                <span className="font-semibold text-cream">
                  {capo !== undefined ? (capo === "0" ? "0 (No Capo)" : `${capo}th fret`) : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-warm-muted">
                  <SlidersHorizontal size={14} className="text-peach/80" />
                  <span>Tuning</span>
                </div>
                <span className="font-semibold text-cream">{tuning || "—"}</span>
              </div>
            </div>

            {/* Lyrics Preview Section */}
            <div>
              <p className="text-xs font-semibold text-cream/90 mb-2">
                Lyrics Preview
              </p>
              <div className="rounded-xl border border-glass-border bg-glass/30 p-3 flex items-start gap-2.5 min-h-[76px]">
                <Music size={15} className="text-peach/70 mt-0.5 shrink-0" />
                {previewLines.length > 0 ? (
                  <div className="space-y-1 text-xs text-cream/80 font-mono leading-relaxed">
                    {previewLines.map((line, idx) => (
                      <p key={idx} className="truncate">{line}</p>
                    ))}
                    {lyrics.split("\n").filter(Boolean).length > 4 && (
                      <p className="text-[10px] text-warm-muted italic">...</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-warm-muted/60 italic self-center">
                    Your lyrics will appear here...
                  </p>
                )}
              </div>
            </div>
          </aside>
        </form>
      </main>

      {/* ── Footer Matching Reference ── */}
      <footer className="relative z-20 border-t border-glass-border/40 bg-black/30 backdrop-blur-md py-6 text-xs text-cream/60">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Logo */}
          <div className="flex items-center gap-2">
            <span className="grid size-7 rotate-[-8deg] place-items-center rounded-[42%_42%_52%_52%] bg-primary text-primary-foreground shadow-sm">
              <Guitar size={14} />
            </span>
            <div>
              <span className="font-display font-extrabold text-sm text-cream leading-none">Strumly</span>
              <span className="block text-[8px] font-bold tracking-[0.2em] text-warm-muted uppercase">
                PLAY • LEARN • BELONG
              </span>
            </div>
          </div>

          {/* Center Quote */}
          <blockquote className="text-center text-cream/60 text-xs">
            <span>“Music gives a soul to the universe.”</span>
            <span className="text-warm-muted ml-1.5">— Plato</span>
          </blockquote>

          {/* Right Community / Socials */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-cream/70">
              {/* YouTube */}
              <a href="#" className="hover:text-peach transition" aria-label="YouTube">
                <svg className="size-4 fill-currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="hover:text-peach transition" aria-label="Instagram">
                <svg className="size-4 fill-currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              {/* X */}
              <a href="#" className="hover:text-peach transition" aria-label="X">
                <svg className="size-3.5 fill-currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Discord */}
              <a href="#" className="hover:text-peach transition" aria-label="Discord">
                <svg className="size-4 fill-currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              </a>
            </div>

            <span className="text-peach text-xs font-semibold flex items-center gap-1">
              A Kinder Music Community 🧡
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
