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
  addedAt: string; // ISO date string, used for "Recently Added" sort
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

export interface LyricLine {
  text: string;
  chords?: string[] | undefined;
}

export interface SongSection {
  name: string;
  lines: LyricLine[];
}

export interface SongDetail {
  id: string;
  title: string;
  artist: string;
  author?: string;
  album?: string;
  genre: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  key: string;
  capo: number;
  tuning: string;
  duration?: string;
  popularity?: number;
  artColor?: string;
  chordCount?: number;
  chords: string[];
  sections: SongSection[];
}

export interface SongSummary {
  id: string;
  title: string;
  artist: string;
  genre: string;
  key: string;
  capo: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  chordCount: number;
  artColor: string;
}

