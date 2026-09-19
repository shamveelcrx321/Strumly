// ─── Types (re-exported from song-types to prevent circular imports) ───────────

export type {
  Genre,
  Difficulty,
  SortOption,
  Song,
  SearchFilters,
} from "./song-types";

import type { Genre, SearchFilters, SortOption, Song } from "./song-types";
import { songService } from "./song-service";
import { songStorage } from "./song-storage";

// ─── Search & Catalog ─────────────────────────────────────────────────────────

/**
 * Searches the song catalog by querying Supabase public.songs through songService
 * and combining with any locally stored/uploaded songs from songStorage.
 */
export async function searchSongs(
  query: string,
  filters: SearchFilters,
  sort: SortOption,
): Promise<Song[]> {
  const q = query.trim().toLowerCase();

  const databaseSongs = await songService.getSongs();

  const storedSongs: Song[] = songStorage.getStoredSongs().map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    genre: (s.genre as Genre) || "Pop",
    key: s.key,
    capo: s.capo,
    difficulty: s.difficulty,
    chordCount: s.chords.length,
    popularity: s.popularity ?? 90,
    addedAt: new Date().toISOString().split("T")[0] || "",
    isFavorited: false,
    artColor: s.artColor || "from-amber-800 to-orange-950",
  }));

  // Deduplicate by ID (preserving user uploaded songs if id clashes)
  const seen = new Set<string>();
  const allSongs: Song[] = [];

  for (const song of [...storedSongs, ...databaseSongs]) {
    if (!seen.has(song.id)) {
      seen.add(song.id);
      allSongs.push(song);
    }
  }

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