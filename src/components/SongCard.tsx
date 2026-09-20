import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Music2, Music4 } from "lucide-react";
import type { Difficulty, Song } from "@/services/song-types";
import { useFavorites } from "@/lib/favorites-context";

export const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner: "bg-emerald-900/50 text-emerald-300 border-emerald-700/30",
  Intermediate: "bg-amber-900/50 text-amber-300 border-amber-700/30",
  Advanced: "bg-rose-900/50 text-rose-300 border-rose-700/30",
};

export interface SongCardProps {
  song: Song;
  onFavorite?: (id: string) => void;
  redirectPath?: string;
  className?: string;
}

export function SongCard({
  song,
  onFavorite,
  redirectPath,
  className = "",
}: SongCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const isFav = isFavorite(song.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(song.id);
    } else {
      void toggleFavorite(song.id, redirectPath);
    }
  };

  const handleFavoriteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      if (onFavorite) {
        onFavorite(song.id);
      } else {
        void toggleFavorite(song.id, redirectPath);
      }
    }
  };

  return (
    <Link
      to="/song/$id"
      params={{ id: song.id }}
      className={`group relative flex cursor-pointer gap-0 overflow-hidden rounded-2xl border border-glass-border bg-glass/40 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-glass/60 hover:shadow-[0_8px_32px_oklch(0_0_0/40%)] ${className}`}
      aria-label={`${song.title} by ${song.artist}`}
    >
      {/* Album art thumbnail */}
      <div
        className={`relative size-[110px] shrink-0 overflow-hidden bg-gradient-to-br ${song.artColor}`}
      >
        {/* Subtle lighting overlay & inner shadow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10" />

        {/* Subtle vinyl record groove ring detail */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="size-16 rounded-full border border-white/10 bg-black/15 shadow-inner" />
        </div>

        {/* Perfectly centered music note icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Music2
            size={32}
            className="text-cream/45 drop-shadow-md transition-all duration-300 group-hover:scale-110 group-hover:text-peach/80"
          />
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
            <p className="truncate text-xs text-warm-muted mt-0.5">
              {song.artist}
            </p>
          </div>
          {/* Favorite Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            onKeyDown={handleFavoriteKeyDown}
            className="shrink-0 rounded-full p-1.5 text-foreground/30 transition hover:text-primary cursor-pointer"
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={15}
              className={isFav ? "fill-primary text-primary" : ""}
            />
          </button>
        </div>

        {/* Tags */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md border border-glass-border bg-glass px-2 py-0.5 text-[11px] font-medium text-foreground/70">
            {song.genre}
          </span>
          <span
            className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${DIFFICULTY_STYLES[song.difficulty]}`}
          >
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
