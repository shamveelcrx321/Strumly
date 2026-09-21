// ─── Types ────────────────────────────────────────────────────────────────────

export type Genre =
  | "Pop"
  | "Rock"
  | "Acoustic"
  | "Indie"
  | "Classical"
  | "Anime"
  | "Malayalam"
  | "Bollywood"
  | "R&B"
  | "Alternative";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type SortOption = "relevance" | "popular" | "recently-added";

export type Song = {
  id: string;
  title: string;
  artist: string;
  genre: Genre;
  key: string;
  capo: number;
  difficulty: Difficulty;
  chordCount: number;
  popularity: number; // 0-100, used for "Popular" sort
  addedAt: string;   // ISO date string, used for "Recently Added" sort
  isFavorited: boolean;
  album?: string;
  /** Tailwind-compatible warm gradient class for the album art placeholder */
  artColor: string;
};

export type SearchFilters = {
  genre: Genre | "";
  difficulty: Difficulty | "";
  key: string;
  capo: string; // "any" | "0" | "1" | "2" | ...
};

// ─── Mock Song Data (Retained temporarily as reference/fallback) ──────────────

export const mockSongs: Song[] = [
  {
    id: "1",
    title: "Perfect",
    artist: "Ed Sheeran",
    genre: "Pop",
    key: "G",
    capo: 0,
    difficulty: "Beginner",
    chordCount: 4,
    popularity: 98,
    addedAt: "2024-01-15",
    isFavorited: false,
    artColor: "from-amber-800 to-orange-900",
  },
  {
    id: "2",
    title: "Until I Found You",
    artist: "Stephen Sanchez",
    genre: "Indie",
    key: "C",
    capo: 2,
    difficulty: "Beginner",
    chordCount: 4,
    popularity: 92,
    addedAt: "2024-02-10",
    isFavorited: true,
    artColor: "from-stone-700 to-amber-900",
  },
  {
    id: "3",
    title: "Die With A Smile",
    artist: "Lady Gaga & Bruno Mars",
    genre: "Pop",
    key: "Ab",
    capo: 1,
    difficulty: "Intermediate",
    chordCount: 6,
    popularity: 97,
    addedAt: "2024-03-20",
    isFavorited: false,
    artColor: "from-rose-900 to-orange-900",
  },
  {
    id: "4",
    title: "A Sky Full of Stars",
    artist: "Coldplay",
    genre: "Pop",
    key: "E",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 8,
    popularity: 91,
    addedAt: "2023-11-05",
    isFavorited: false,
    artColor: "from-indigo-900 to-purple-900",
  },
  {
    id: "5",
    title: "Creep",
    artist: "Radiohead",
    genre: "Alternative",
    key: "G",
    capo: 0,
    difficulty: "Beginner",
    chordCount: 4,
    popularity: 88,
    addedAt: "2023-09-12",
    isFavorited: false,
    artColor: "from-slate-800 to-zinc-900",
  },
  {
    id: "6",
    title: "Tu Hai Kahan",
    artist: "AUR",
    genre: "Indie",
    key: "D",
    capo: 2,
    difficulty: "Beginner",
    chordCount: 4,
    popularity: 95,
    addedAt: "2024-04-01",
    isFavorited: true,
    artColor: "from-teal-800 to-emerald-900",
  },
  {
    id: "7",
    title: "Kesariya",
    artist: "Arijit Singh",
    genre: "Bollywood",
    key: "C",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 6,
    popularity: 96,
    addedAt: "2023-12-18",
    isFavorited: false,
    artColor: "from-yellow-800 to-amber-900",
  },
  {
    id: "8",
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    genre: "Bollywood",
    key: "Db",
    capo: 1,
    difficulty: "Beginner",
    chordCount: 4,
    popularity: 94,
    addedAt: "2023-08-22",
    isFavorited: false,
    artColor: "from-pink-900 to-rose-900",
  },
  {
    id: "9",
    title: "Believer",
    artist: "Imagine Dragons",
    genre: "Rock",
    key: "E",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 5,
    popularity: 90,
    addedAt: "2023-10-14",
    isFavorited: false,
    artColor: "from-red-900 to-orange-900",
  },
  {
    id: "10",
    title: "Let Her Go",
    artist: "Passenger",
    genre: "Acoustic",
    key: "G",
    capo: 0,
    difficulty: "Beginner",
    chordCount: 5,
    popularity: 89,
    addedAt: "2023-07-30",
    isFavorited: false,
    artColor: "from-amber-700 to-stone-800",
  },
  {
    id: "11",
    title: "Yellow",
    artist: "Coldplay",
    genre: "Pop",
    key: "B",
    capo: 0,
    difficulty: "Beginner",
    chordCount: 4,
    popularity: 93,
    addedAt: "2023-06-15",
    isFavorited: true,
    artColor: "from-yellow-700 to-amber-800",
  },
  {
    id: "12",
    title: "Fix You",
    artist: "Coldplay",
    genre: "Rock",
    key: "Eb",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 7,
    popularity: 91,
    addedAt: "2023-05-20",
    isFavorited: false,
    artColor: "from-sky-900 to-blue-900",
  },
  {
    id: "13",
    title: "Enna Sona",
    artist: "Arijit Singh",
    genre: "Bollywood",
    key: "G",
    capo: 2,
    difficulty: "Intermediate",
    chordCount: 6,
    popularity: 87,
    addedAt: "2024-01-05",
    isFavorited: false,
    artColor: "from-orange-800 to-red-900",
  },
  {
    id: "14",
    title: "Njandukalude Naattil Oridavela",
    artist: "Vineeth Sreenivasan",
    genre: "Malayalam",
    key: "G",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 5,
    popularity: 85,
    addedAt: "2023-04-10",
    isFavorited: false,
    artColor: "from-green-800 to-teal-900",
  },
  {
    id: "15",
    title: "Raasaathi",
    artist: "Sid Sriram",
    genre: "Indie",
    key: "Am",
    capo: 0,
    difficulty: "Advanced",
    chordCount: 9,
    popularity: 86,
    addedAt: "2023-11-25",
    isFavorited: false,
    artColor: "from-violet-900 to-purple-900",
  },
  {
    id: "16",
    title: "Guruvayoorappan",
    artist: "K.J. Yesudas",
    genre: "Classical",
    key: "C",
    capo: 0,
    difficulty: "Advanced",
    chordCount: 10,
    popularity: 82,
    addedAt: "2023-03-15",
    isFavorited: false,
    artColor: "from-amber-900 to-yellow-900",
  },
  {
    id: "17",
    title: "Unravel",
    artist: "TK from Ling Tosite Sigure",
    genre: "Anime",
    key: "Am",
    capo: 0,
    difficulty: "Advanced",
    chordCount: 11,
    popularity: 88,
    addedAt: "2024-02-28",
    isFavorited: true,
    artColor: "from-slate-900 to-zinc-800",
  },
  {
    id: "18",
    title: "Gurenge",
    artist: "LiSA",
    genre: "Anime",
    key: "D",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 7,
    popularity: 90,
    addedAt: "2024-03-05",
    isFavorited: false,
    artColor: "from-rose-800 to-pink-900",
  },
  {
    id: "19",
    title: "Blue Bird",
    artist: "Ikimono-gakari",
    genre: "Anime",
    key: "A",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 6,
    popularity: 87,
    addedAt: "2023-10-01",
    isFavorited: false,
    artColor: "from-cyan-800 to-sky-900",
  },
  {
    id: "20",
    title: "Photograph",
    artist: "Ed Sheeran",
    genre: "Pop",
    key: "E",
    capo: 0,
    difficulty: "Beginner",
    chordCount: 4,
    popularity: 92,
    addedAt: "2024-01-20",
    isFavorited: false,
    artColor: "from-amber-700 to-orange-800",
  },
  {
    id: "21",
    title: "Hotel California",
    artist: "Eagles",
    genre: "Rock",
    key: "Am",
    capo: 0,
    difficulty: "Advanced",
    chordCount: 10,
    popularity: 94,
    addedAt: "2023-08-08",
    isFavorited: false,
    artColor: "from-stone-700 to-amber-800",
  },
  {
    id: "22",
    title: "Kaun Tujhe",
    artist: "Palak Muchhal",
    genre: "Bollywood",
    key: "E",
    capo: 0,
    difficulty: "Beginner",
    chordCount: 4,
    popularity: 84,
    addedAt: "2024-04-12",
    isFavorited: false,
    artColor: "from-pink-800 to-rose-900",
  },
  {
    id: "23",
    title: "Channa Mereya",
    artist: "Arijit Singh",
    genre: "Bollywood",
    key: "G",
    capo: 3,
    difficulty: "Intermediate",
    chordCount: 6,
    popularity: 93,
    addedAt: "2023-09-30",
    isFavorited: true,
    artColor: "from-orange-700 to-amber-800",
  },
  {
    id: "24",
    title: "Blinding Lights",
    artist: "The Weeknd",
    genre: "Pop",
    key: "F",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 4,
    popularity: 97,
    addedAt: "2024-03-15",
    isFavorited: false,
    artColor: "from-red-800 to-pink-900",
  },
  {
    id: "26",
    title: "Numb",
    artist: "Linkin Park",
    genre: "Rock",
    key: "Em",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 12,
    popularity: 96,
    addedAt: "2024-05-01",
    isFavorited: false,
    artColor: "from-slate-700 to-zinc-900",
  },
  {
    id: "27",
    title: "In the End",
    artist: "Linkin Park",
    genre: "Rock",
    key: "Cm",
    capo: 0,
    difficulty: "Beginner",
    chordCount: 10,
    popularity: 97,
    addedAt: "2024-05-02",
    isFavorited: false,
    artColor: "from-stone-700 to-slate-900",
  },
  {
    id: "28",
    title: "What I've Done",
    artist: "Linkin Park",
    genre: "Rock",
    key: "Gm",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 11,
    popularity: 91,
    addedAt: "2024-05-03",
    isFavorited: false,
    artColor: "from-zinc-700 to-stone-900",
  },
  {
    id: "29",
    title: "Somewhere I Belong",
    artist: "Linkin Park",
    genre: "Rock",
    key: "Am",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 10,
    popularity: 90,
    addedAt: "2024-05-04",
    isFavorited: false,
    artColor: "from-neutral-700 to-slate-900",
  },
  {
    id: "30",
    title: "Breaking the Habit",
    artist: "Linkin Park",
    genre: "Rock",
    key: "Dm",
    capo: 0,
    difficulty: "Advanced",
    chordCount: 13,
    popularity: 89,
    addedAt: "2024-05-05",
    isFavorited: false,
    artColor: "from-slate-800 to-zinc-900",
  },
  {
    id: "31",
    title: "Faint",
    artist: "Linkin Park",
    genre: "Rock",
    key: "Fm",
    capo: 0,
    difficulty: "Intermediate",
    chordCount: 11,
    popularity: 88,
    addedAt: "2024-05-06",
    isFavorited: false,
    artColor: "from-zinc-800 to-neutral-900",
  },
];

import { getSongsFromSupabase } from "./song-service";

// ─── Search Function ──────────────────────────────────────────────────────────

export async function searchSongs(
  query: string,
  filters: SearchFilters,
  sort: SortOption,
): Promise<Song[]> {
  const q = query.trim().toLowerCase();

  const dbSongs = await getSongsFromSupabase();

  const allSongs: Song[] = (dbSongs || []).map((row: any) => ({
    id: row.slug || "",
    title: row.title || "",
    artist: row.artist || "",
    genre: (row.genre as Genre) || "Pop",
    key: row.song_key || "C",
    capo: typeof row.capo === "number" ? row.capo : 0,
    difficulty: (row.difficulty as Difficulty) || "Beginner",
    chordCount: typeof row.chord_count === "number" ? row.chord_count : 0,
    popularity: typeof row.popularity === "number" ? row.popularity : 0,
    addedAt: row.added_at || "",
    isFavorited: false,
    album: row.album ?? undefined,
    artColor: row.art_color || "from-amber-800 to-orange-950",
  }));

  let results = allSongs.filter((song) => {
    // Text search
    const matchesQuery =
      !q ||
      song.title.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q) ||
      song.genre.toLowerCase().includes(q) ||
      (song.album ? song.album.toLowerCase().includes(q) : false);

    // Filter: genre
    const matchesGenre = !filters.genre || song.genre === filters.genre;

    // Filter: difficulty
    const matchesDifficulty =
      !filters.difficulty || song.difficulty === filters.difficulty;

    // Filter: key
    const matchesKey = !filters.key || song.key === filters.key;

    // Filter: capo
    const matchesCapo =
      !filters.capo ||
      filters.capo === "any" ||
      song.capo === parseInt(filters.capo, 10);

    return (
      matchesQuery &&
      matchesGenre &&
      matchesDifficulty &&
      matchesKey &&
      matchesCapo
    );
  });

  // Sort
  if (sort === "popular") {
    results = [...results].sort((a, b) => b.popularity - a.popularity);
  } else if (sort === "recently-added") {
    results = [...results].sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    );
  }
  // "relevance" keeps filter order (which already scores by query match above)

  return results;
}


// ─── Existing exports (unchanged) ────────────────────────────────────────────

export type LegacyGenre = {
  name: string;
  icon:
    | "bars"
    | "bolt"
    | "guitar"
    | "leaf"
    | "landmark"
    | "flower"
    | "waves"
    | "sparkles";
  image: string;
};

export const suggestedSearches = [
  "Arijit Singh",
  "Coldplay",
  "Linkin Park",
  "Ed Sheeran",
  "Anime",
  "Malayalam",
  "Trending",
];

export const musicQuotes = [
  {
    quote: "Music sounds different to the one who plays it.",
    author: "Patrick Rothfuss",
  },
  {
    quote: "Music is an addiction.",
    author: "Miles Davis",
  },
  {
    quote: "The guitar is a small orchestra. It is polyphonic.",
    author: "Andrés Segovia",
  },
  {
    quote: "Guitar is the best form of self-expression I know.",
    author: "Slash",
  },
  {
    quote: "Music is a shorthand of emotion.",
    author: "Leo Tolstoy",
  },
  {
    quote: "Music gives a soul to the universe.",
    author: "Plato",
  },
  {
    quote: "Music is the wine that fills the void in our souls.",
    author: "Robert Fripp",
  },
];

export const stats = [
  { value: "1M+", label: "Songs & Chords", icon: "music" as const },
  { value: "250K+", label: "Community Members", icon: "users" as const },
  { value: "100%", label: "Music Lovers", icon: "heart" as const },
];

/** @deprecated Use searchSongs() instead. Kept for backward compat. */
export async function searchCatalog(query: string) {
  // Replace this mock with the existing REST endpoint when it is connected.
  return Promise.resolve({
    query,
    results: [] as Array<{ id: string; title: string }>,
  });
}