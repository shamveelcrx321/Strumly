import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { songService } from "@/services/song-service";
import type { Song } from "@/services/song-types";

export interface FavoritesContextType {
  favoriteIds: Set<string>;
  favoriteSongs: Song[];
  isLoading: boolean;
  isFavorite: (songIdOrSlug: string) => boolean;
  toggleFavorite: (songIdOrSlug: string, redirectPath?: string) => Promise<boolean>;
  addFavorite: (songIdOrSlug: string, redirectPath?: string) => Promise<boolean>;
  removeFavorite: (songIdOrSlug: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = React.createContext<FavoritesContextType | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [favoriteIds, setFavoriteIds] = React.useState<Set<string>>(
    () => new Set<string>(),
  );
  const [favoriteSongs, setFavoriteSongs] = React.useState<Song[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const pendingRequests = React.useRef<Set<string>>(new Set());

  // Load user favorites from Supabase whenever auth state changes to authenticated
  const loadFavorites = React.useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavoriteIds(new Set());
      setFavoriteSongs([]);
      return;
    }

    setIsLoading(true);
    try {
      const [ids, songs] = await Promise.all([
        songService.getFavoriteSongIds(),
        songService.getFavoriteSongs(),
      ]);

      const combinedIds = new Set<string>(ids);
      for (const s of songs) {
        combinedIds.add(s.id);
      }

      setFavoriteIds(combinedIds);
      setFavoriteSongs(songs);
    } catch (err) {
      console.error("Failed to load user favorites:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  React.useEffect(() => {
    if (!isAuthLoading) {
      void loadFavorites();
    }
  }, [isAuthLoading, isAuthenticated, user?.id, loadFavorites]);

  const isFavorite = React.useCallback(
    (songIdOrSlug: string): boolean => {
      if (!songIdOrSlug) return false;
      const normalized = songIdOrSlug.trim();
      return favoriteIds.has(normalized);
    },
    [favoriteIds],
  );

  const toggleFavorite = React.useCallback(
    async (songIdOrSlug: string, redirectPath?: string): Promise<boolean> => {
      if (!songIdOrSlug) return false;
      const normalized = songIdOrSlug.trim();

      // 1. Authentication check
      if (!isAuthenticated) {
        const destination =
          redirectPath ||
          (typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : "/");

        void navigate({
          to: "/login",
          search: { redirect: destination },
        });
        return false;
      }

      // 2. Prevent duplicate clicks while request is pending
      if (pendingRequests.current.has(normalized)) {
        return isFavorite(normalized);
      }

      pendingRequests.current.add(normalized);

      const currentlyFav = favoriteIds.has(normalized);
      const nextFav = !currentlyFav;

      // 3. Optimistic UI update
      const previousIds = new Set(favoriteIds);
      const previousSongs = [...favoriteSongs];

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (nextFav) {
          next.add(normalized);
        } else {
          next.delete(normalized);
        }
        return next;
      });

      if (!nextFav) {
        setFavoriteSongs((prev) => prev.filter((s) => s.id !== normalized));
      }

      try {
        if (nextFav) {
          await songService.addFavorite(normalized);
          toast.success("Saved to favorites!");
          // Fetch updated songs list in background to pull in full song metadata
          void songService.getFavoriteSongs().then((freshSongs) => {
            setFavoriteSongs(freshSongs);
            // Also update any UUIDs/slugs returned
            setFavoriteIds((prev) => {
              const updated = new Set(prev);
              for (const s of freshSongs) {
                updated.add(s.id);
              }
              return updated;
            });
          });
        } else {
          await songService.removeFavorite(normalized);
          toast.info("Removed from favorites.");
        }
        return nextFav;
      } catch (err) {
        console.error("Failed to toggle favorite:", err);
        // Rollback optimistic update
        setFavoriteIds(previousIds);
        const errorMsg =
          err instanceof Error
            ? err.message
            : (err as { message?: string })?.message ||
              "Failed to update favorites";
        toast.error(errorMsg);
        return currentlyFav;
      } finally {
        pendingRequests.current.delete(normalized);
      }
    },
    [favoriteIds, favoriteSongs, isAuthenticated, isFavorite, navigate],
  );

  const addFavorite = React.useCallback(
    async (songIdOrSlug: string, redirectPath?: string): Promise<boolean> => {
      if (isFavorite(songIdOrSlug)) return true;
      return toggleFavorite(songIdOrSlug, redirectPath);
    },
    [isFavorite, toggleFavorite],
  );

  const removeFavorite = React.useCallback(
    async (songIdOrSlug: string): Promise<boolean> => {
      if (!isFavorite(songIdOrSlug)) return true;
      return toggleFavorite(songIdOrSlug);
    },
    [isFavorite, toggleFavorite],
  );

  const refreshFavorites = React.useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  const value = React.useMemo<FavoritesContextType>(
    () => ({
      favoriteIds,
      favoriteSongs,
      isLoading,
      isFavorite,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      refreshFavorites,
    }),
    [
      favoriteIds,
      favoriteSongs,
      isLoading,
      isFavorite,
      toggleFavorite,
      addFavorite,
      removeFavorite,
      refreshFavorites,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = React.useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
