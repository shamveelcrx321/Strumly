import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from "react";
import {
  ArrowRight,
  Disc,
  Edit3,
  FileText,
  Guitar,
  Info,
  Music,
  Music2,
  PlusCircle,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Upload as UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
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
      {
        name: "description",
        content: "Share your lyrics and arrangements with the Strumly guitar community.",
      },
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

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-900/50 text-emerald-300 border-emerald-700/30",
  Intermediate: "bg-amber-900/50 text-amber-300 border-amber-700/30",
  Advanced: "bg-rose-900/50 text-rose-300 border-rose-700/30",
};

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

// Helper to highlight bracketed chords in preview text
function renderPreviewLine(line: string) {
  const parts = line.split(/(\[[A-Ga-g][#b]?[a-zA-Z0-9/]*\])/g);
  return parts.map((part, idx) => {
    if (/^\[[A-Ga-g][#b]?[a-zA-Z0-9/]*\]$/.test(part)) {
      return (
        <span key={idx} className="font-bold text-peach drop-shadow-sm">
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

// ─── Upload Page Component ───────────────────────────────────────────────────

function UploadPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
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
    .slice(0, 6);

  // Count unique bracketed chords found in lyrics
  const detectedChordsCount = new Set(
    (lyrics.match(/\[[A-Ga-g][#b]?[a-zA-Z0-9/]*\]/g) || []).map((c) => c.slice(1, -1))
  ).size;

  return (
    <div className="relative min-h-screen overflow-x-hidden text-foreground selection:bg-primary/30 selection:text-cream">
      {/* ── Fixed Static Strumly Studio Background (Identical to Home) ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-background">
        <img
          src={studioImage}
          alt="A warm acoustic guitar studio overlooking a sunset lake"
          aria-hidden="true"
          className="h-full w-full object-cover object-[58%_center]"
          width={1920}
          height={1080}
        />
        <div className="hero-vignette absolute inset-0 -z-20" />
        <div className="bottom-shade absolute inset-x-0 bottom-0 -z-10 h-[45%]" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* ── Reused Exact Strumly Navbar Component (Active on Upload) ── */}
      <Navbar activeItem="Upload" />

      {/* ── Main Scrollable Content ── */}
      <main className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 pb-24 pt-2">
        {/* Page Intro / Hero Header (Consistent with Home hierarchy) */}
        <section className="pb-6 pt-4 animate-flow-2 sm:pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-peach sm:text-sm">
            SHARE YOUR MUSIC
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight text-cream sm:text-5xl lg:text-[52px]">
            Upload a <span className="text-peach">Song</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-cream/75">
            Add lyrics, share your arrangement, and make it a part of the Strumly community. Because every song has a home here.
          </p>
        </section>

        {/* Two-Column Landscape Layout */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] items-start animate-flow-3"
        >
          {/* ── LEFT COLUMN: Workspace Panels ── */}
          <div className="space-y-6">
            {/* 1. Add Your Lyrics Panel */}
            <section
              aria-label="Add Your Lyrics"
              className="rounded-2xl border border-glass-border bg-glass/40 p-6 backdrop-blur-md shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-cream">
                    1. Add Your Lyrics
                  </h2>
                  <p className="mt-1 text-xs text-warm-muted">
                    Type or paste your lyrics with chord annotations, or upload a .txt file.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-glass-border bg-glass/50 px-2.5 py-1 text-[11px] font-medium text-peach">
                  <Sparkles size={12} />
                  <span>Chord brackets supported</span>
                </span>
              </div>

              {/* Tabs Row */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-glass-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInputMode("type")}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      inputMode === "type"
                        ? "border border-peach/80 bg-primary/20 text-peach shadow-sm backdrop-blur-md"
                        : "border border-glass-border bg-glass/30 text-cream/70 hover:bg-glass/50 hover:text-cream"
                    }`}
                  >
                    <Edit3 size={14} className={inputMode === "type" ? "text-peach" : "text-cream/50"} />
                    <span>Type / Paste Lyrics</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputMode("file")}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      inputMode === "file"
                        ? "border border-peach/80 bg-primary/20 text-peach shadow-sm backdrop-blur-md"
                        : "border border-glass-border bg-glass/30 text-cream/70 hover:bg-glass/50 hover:text-cream"
                    }`}
                  >
                    <UploadIcon size={14} className={inputMode === "file" ? "text-peach" : "text-cream/50"} />
                    <span>Upload .TXT File</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-warm-muted">
                  <span>TXT files up to 200KB</span>
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
                    placeholder={"Paste or type your lyrics here...\n\nYou can include chords in square brackets like [C], [Am], [G] etc."}
                    className="h-72 sm:h-80 w-full rounded-xl border border-glass-border bg-[#130f0d]/85 p-4 font-mono text-sm leading-relaxed text-cream placeholder:text-cream/35 outline-none transition focus:border-peach focus:ring-1 focus:ring-peach/30 resize-y custom-scrollbar"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-warm-muted">
                    <span className="text-[11px] text-warm-muted/80">
                      Tip: Place chords like <code className="text-peach">[Em]</code> inline or above lyric words.
                    </span>
                    <span className="font-mono">{lyrics.length}/10000</span>
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
                        className="h-44 w-full rounded-xl border border-glass-border bg-[#130f0d]/85 p-3 text-cream placeholder:text-cream/35 outline-none transition focus:border-peach focus:ring-1 focus:ring-peach/30 font-mono text-xs leading-relaxed resize-y custom-scrollbar"
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 2. Song Information Panel */}
            <section
              aria-label="Song Information"
              className="rounded-2xl border border-glass-border bg-glass/40 p-6 backdrop-blur-md shadow-xl"
            >
              <h2 className="font-display text-lg font-bold text-cream">
                2. Song Information
              </h2>
              <p className="mt-1 text-xs text-warm-muted">
                Metadata helps other musicians discover, filter, and play your song.
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
                    placeholder="e.g. Hotel California"
                    className="h-10 w-full rounded-xl border border-glass-border bg-[#130f0d]/85 px-3.5 text-xs sm:text-sm text-cream placeholder:text-cream/35 outline-none transition focus:border-peach focus:ring-1 focus:ring-peach/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream/90 mb-1.5">
                    Artist / Band <span className="text-peach">*</span>
                  </label>
                  <input
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Eagles"
                    className="h-10 w-full rounded-xl border border-glass-border bg-[#130f0d]/85 px-3.5 text-xs sm:text-sm text-cream placeholder:text-cream/35 outline-none transition focus:border-peach focus:ring-1 focus:ring-peach/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream/90 mb-1.5">
                    Author / Songwriter <span className="text-peach">*</span>
                  </label>
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Don Henley, Glenn Frey"
                    className="h-10 w-full rounded-xl border border-glass-border bg-[#130f0d]/85 px-3.5 text-xs sm:text-sm text-cream placeholder:text-cream/35 outline-none transition focus:border-peach focus:ring-1 focus:ring-peach/30"
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
                    <SelectTrigger className="h-10 w-full rounded-xl border border-glass-border bg-[#130f0d]/85 px-3 py-2 text-xs text-cream hover:bg-glass focus:ring-1 focus:ring-peach/30 cursor-pointer">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="border border-glass-border bg-[#181311]/96 text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1">
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
                    <SelectTrigger className="h-10 w-full rounded-xl border border-glass-border bg-[#130f0d]/85 px-3 py-2 text-xs text-cream hover:bg-glass focus:ring-1 focus:ring-peach/30 cursor-pointer">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="border border-glass-border bg-[#181311]/96 text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1">
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
                    <SelectTrigger className="h-10 w-full rounded-xl border border-glass-border bg-[#130f0d]/85 px-3 py-2 text-xs text-cream hover:bg-glass focus:ring-1 focus:ring-peach/30 cursor-pointer">
                      <SelectValue placeholder="Key" />
                    </SelectTrigger>
                    <SelectContent className="border border-glass-border bg-[#181311]/96 text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1 max-h-56">
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
                    <SelectTrigger className="h-10 w-full rounded-xl border border-glass-border bg-[#130f0d]/85 px-3 py-2 text-xs text-cream hover:bg-glass focus:ring-1 focus:ring-peach/30 cursor-pointer">
                      <SelectValue placeholder="Capo" />
                    </SelectTrigger>
                    <SelectContent className="border border-glass-border bg-[#181311]/96 text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1 max-h-56">
                      {CAPO_OPTIONS.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="text-xs text-cream/80 hover:bg-primary/20 hover:text-peach data-[state=checked]:bg-primary/25 data-[state=checked]:text-peach data-[state=checked]:font-semibold rounded-lg cursor-pointer py-1.5"
                        >
                          {c === "0" ? "0 (No Capo)" : `Capo ${c}`}
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
                    <SelectTrigger className="h-10 w-full rounded-xl border border-glass-border bg-[#130f0d]/85 px-3 py-2 text-xs text-cream hover:bg-glass focus:ring-1 focus:ring-peach/30 cursor-pointer">
                      <SelectValue placeholder="Tuning" />
                    </SelectTrigger>
                    <SelectContent className="border border-glass-border bg-[#181311]/96 text-cream backdrop-blur-xl shadow-2xl rounded-xl z-50 p-1">
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
                className="w-full sm:w-auto rounded-xl border border-glass-border bg-glass/40 px-6 py-2.5 text-sm font-semibold text-cream hover:bg-glass hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-display font-bold text-primary-foreground shadow-warm hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <PlusCircle size={18} />
                  <span>{isSubmitting ? "Adding Song..." : "Create Song"}</span>
                  <ArrowRight size={16} />
                </button>
                <p className="mt-1.5 text-xs text-warm-muted text-center sm:text-right">
                  Your song will be instantly available in the Strumly library.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Live Song Detail Preview ── */}
          <aside
            aria-label="Live preview"
            className="rounded-2xl border border-glass-border bg-glass/40 p-5 backdrop-blur-md shadow-xl lg:sticky lg:top-24 space-y-4"
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between border-b border-glass-border/50 pb-3">
              <div className="flex items-center gap-2 text-cream font-bold text-sm">
                <Music2 size={16} className="text-peach" />
                <span>Live Preview</span>
              </div>
              <span className="rounded-full border border-peach/40 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-peach">
                Songbook Preview
              </span>
            </div>

            {/* Song Card Artwork with Strumly Studio View & Vinyl Texture */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-[16/10] bg-gradient-to-br from-amber-900 to-orange-950 shadow-lg group">
              <img
                src={studioImage}
                alt=""
                className="h-full w-full object-cover object-[58%_center] transition duration-500 group-hover:scale-105"
              />
              {/* Dark Warm Ambient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Vinyl Groove Rings Indicator */}
              <div className="absolute right-3 top-3 size-8 rounded-full border border-white/15 bg-black/20 backdrop-blur-sm grid place-items-center">
                <Guitar size={14} className="text-peach/80" />
              </div>

              {/* Card Titles Overlay */}
              <div className="absolute inset-x-3.5 bottom-3.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-peach mb-0.5">
                  Arrangement
                </p>
                <p className="truncate font-display text-lg font-extrabold text-cream leading-snug">
                  {title.trim() || "Your Song Title"}
                </p>
                <p className="truncate text-xs text-warm-muted mt-0.5">
                  {artist.trim() || "Artist Name"}
                  {author.trim() ? ` • by ${author.trim()}` : ""}
                </p>
              </div>
            </div>

            {/* Metadata Tags Ribbon (Matches Song Detail Badges) */}
            <div className="space-y-2 border-b border-glass-border/50 pb-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-warm-muted flex items-center gap-1.5">
                  <Disc size={13} className="text-peach/70" />
                  Genre
                </span>
                <span className="font-semibold text-cream">{genre || "Not selected"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-warm-muted flex items-center gap-1.5">
                  <Sun size={13} className="text-peach/70" />
                  Difficulty
                </span>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${
                    DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES["Intermediate"]
                  }`}
                >
                  {difficulty}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-warm-muted flex items-center gap-1.5">
                  <Music2 size={13} className="text-peach/70" />
                  Key
                </span>
                <span className="font-bold text-peach">{keySignature}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-warm-muted flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-peach/70" />
                  Capo
                </span>
                <span className="font-medium text-cream">
                  {capo === "0" ? "None (0)" : `Fret ${capo}`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-warm-muted flex items-center gap-1.5">
                  <Guitar size={13} className="text-peach/70" />
                  Tuning
                </span>
                <span className="font-medium text-cream">{tuning}</span>
              </div>

              {detectedChordsCount > 0 && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-warm-muted flex items-center gap-1.5">
                    <Sparkles size={13} className="text-peach/70" />
                    Detected Chords
                  </span>
                  <span className="font-bold text-peach text-[11px]">
                    {detectedChordsCount} unique
                  </span>
                </div>
              )}
            </div>

            {/* Lyrics Preview Section */}
            <div>
              <p className="text-xs font-semibold text-cream/90 mb-2 flex items-center justify-between">
                <span>Lyrics & Chord Strum Preview</span>
                {previewLines.length > 0 && (
                  <span className="text-[10px] text-warm-muted">First 6 lines</span>
                )}
              </p>
              <div className="rounded-xl border border-glass-border bg-[#130f0d]/80 p-3.5 min-h-[96px]">
                {previewLines.length > 0 ? (
                  <div className="space-y-1 font-mono text-xs text-cream/85 leading-relaxed">
                    {previewLines.map((line, idx) => (
                      <p key={idx} className="truncate">
                        {renderPreviewLine(line)}
                      </p>
                    ))}
                    {lyrics.split("\n").filter(Boolean).length > 6 && (
                      <p className="text-[10px] text-warm-muted italic pt-1">...</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Music size={18} className="text-warm-muted/40 mb-1" />
                    <p className="text-xs text-warm-muted/60 italic">
                      Lyrics and bracketed chords will render here live...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}
