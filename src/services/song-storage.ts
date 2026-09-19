import type { SongDetail } from "./song-types";

const STORAGE_KEY = "strumly_uploaded_songs";

/**
 * Storage abstraction for user-uploaded songs.
 * Safely accesses localStorage in browser environments, returning an empty list during SSR.
 */
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
};
