import type { SongDetail } from "./song-types";

const STORAGE_KEY = "strumly_uploaded_songs";

/**
 * Storage abstraction for legacy user-uploaded songs.
 * Supabase public.songs is now the authoritative source of truth.
 * Safely cleans up old localStorage entries on browser initialization.
 */
export function clearLegacyUploadedSongsCache(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    if (window.localStorage.getItem(STORAGE_KEY)) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Failed to clear legacy uploaded songs from localStorage", e);
  }
}

// Auto-run cleanup in browser environments to purge stale legacy items (e.g. old Amazing Grace cards)
if (typeof window !== "undefined") {
  clearLegacyUploadedSongsCache();
}

export const songStorage = {
  getStoredSongs(): SongDetail[] {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }
    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Failed to read songs from localStorage", e);
      return [];
    }
  },

  saveStoredSong(song: SongDetail): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      const existing = songStorage.getStoredSongs();
      // Replace if exists, or append to beginning
      const filtered = existing.filter((s) => s.id !== song.id);
      const updated = [song, ...filtered];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save song to localStorage", e);
    }
  },

  removeStoredSong(id: string): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      const existing = songStorage.getStoredSongs();
      const updated = existing.filter((s) => s.id !== id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to remove song from localStorage", e);
    }
  },

  clearLegacyCache(): void {
    clearLegacyUploadedSongsCache();
  },
};
