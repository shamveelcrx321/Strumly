import { supabase } from "@/lib/supabase";
import type {
  SongDetail,
  SongSummary,
  Song,
  Genre,
  Difficulty,
} from "./song-types";
import { songStorage } from "./song-storage";

export async function getSongsFromSupabase() {
  const { data, error } = await supabase
    .from("songs")
    .select(`
      slug,
      title,
      artist,
      genre,
      difficulty,
      song_key,
      capo,
      tuning,
      chord_count,
      popularity,
      album,
      art_color,
      added_at
    `)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load songs: ${error.message}`);
  }

  return data ?? [];
}

export interface CreateSongInput {
  title: string;
  artist: string;
  author: string;
  genre: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  key?: string;
  capo?: number;
  tuning?: string;
  lyricsText: string;
}

export interface FavoriteRecord {
  id: string;
  user_id: string;
  song_id: string;
  created_at: string;
}

export interface SongService {
  getSongs(forceRefresh?: boolean): Promise<Song[]>;
  getSong(id: string): Promise<SongDetail | null>;
  getRelatedSongs(currentSong: SongDetail, limit?: number): Promise<SongSummary[]>;
  getAllSongs(): Promise<SongSummary[]>;
  createSong(input: CreateSongInput): Promise<string>;
  resolveSongUuid(songIdOrSlug: string): Promise<string | null>;
  getFavorites(): Promise<FavoriteRecord[]>;
  getFavoriteSongs(): Promise<Song[]>;
  getFavoriteSongIds(): Promise<string[]>;
  isFavorite(songIdOrSlug: string): Promise<boolean>;
  addFavorite(songIdOrSlug: string): Promise<boolean>;
  removeFavorite(songIdOrSlug: string): Promise<boolean>;
  toggleFavorite(songIdOrSlug: string): Promise<boolean>;
}

function parseLyricsIntoSections(lyricsText: string): {
  sections: SongDetail["sections"];
  chords: string[];
} {
  const lines = lyricsText.split("\n");
  const sections: SongDetail["sections"] = [];
  const foundChords = new Set<string>();

  let currentSectionName = "Lyrics";
  let currentLines: SongDetail["sections"][0]["lines"] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Check if line is a section heading like [Verse 1] or [Chorus]
    const headingMatch = trimmed.match(/^\[([a-zA-Z0-9\s-_]+)\]$/);
    if (headingMatch) {
      if (currentLines.length > 0) {
        sections.push({ name: currentSectionName, lines: currentLines });
        currentLines = [];
      }
      currentSectionName = headingMatch[1] || "Section";
      continue;
    }

    if (!trimmed) {
      continue;
    }

    // Check for inline bracketed chords like [C] or [Am]
    const lineChords: string[] = [];
    const chordMatches = trimmed.match(/\[([A-G][#b]?[a-zA-Z0-9/]*)\]/g);
    if (chordMatches) {
      for (const m of chordMatches) {
        const chordName = m.slice(1, -1);
        lineChords.push(chordName);
        foundChords.add(chordName);
      }
    }

    // Clean text by removing the inline chord markers for clean lyric rendering
    const cleanText = trimmed
      .replace(/\[([A-G][#b]?[a-zA-Z0-9/]*)\]\s*/g, "")
      .trim();

    currentLines.push({
      text: cleanText || trimmed,
      chords: lineChords.length > 0 ? lineChords : undefined,
    });
  }

  if (currentLines.length > 0 || sections.length === 0) {
    sections.push({
      name: currentSectionName,
      lines:
        currentLines.length > 0
          ? currentLines
          : [{ text: lyricsText.trim() }],
    });
  }

  return { sections, chords: Array.from(foundChords) };
}

interface DatabaseSongRow {
  id: string;
  slug?: string | null;
  title?: string | null;
  artist?: string | null;
  genre?: string | null;
  difficulty?: string | null;
  song_key?: string | null;
  capo?: number | null;
  tuning?: string | null;
  chord_count?: number | null;
  popularity?: number | null;
  album?: string | null;
  art_color?: string | null;
  added_at?: string | null;
  created_at?: string | null;
  duration?: string | null;
  chords?: unknown;
  sections?: unknown;
  lyrics?: string | null;
  author?: string | null;
}

interface FavoriteQueryRow {
  id: string;
  user_id: string;
  song_id: string;
  created_at: string;
  songs?: DatabaseSongRow | null;
}

class SupabaseSongService implements SongService {
  private cachedSongs: Song[] | null = null;

  /**
   * Fetches main catalog songs from Supabase PostgreSQL (public.songs).
   * Maps snake_case database schema to frontend Song model.
   */
  async getSongs(forceRefresh = false): Promise<Song[]> {
    if (!forceRefresh && this.cachedSongs) {
      return this.cachedSongs;
    }

    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        console.error("Failed to fetch songs from Supabase:", error.message);
        if (this.cachedSongs) return this.cachedSongs;
        return this.getFallbackCatalogSongs();
      }

      if (!data || data.length === 0) {
        return this.getFallbackCatalogSongs();
      }

      const mapped: Song[] = data.map((row) => ({
        id: row.slug,
        title: row.title ?? "",
        artist: row.artist ?? "",
        genre: (row.genre as Genre) || "Pop",
        key: row.song_key ?? "C",
        capo: typeof row.capo === "number" ? row.capo : 0,
        difficulty: (row.difficulty as Difficulty) || "Intermediate",
        chordCount: typeof row.chord_count === "number" ? row.chord_count : 0,
        popularity: typeof row.popularity === "number" ? row.popularity : 0,
        addedAt:
          row.added_at ||
          (row.created_at
            ? row.created_at.split("T")[0]
            : new Date().toISOString().split("T")[0]),
        isFavorited: false,
        ...(row.album ? { album: row.album } : {}),
        artColor: row.art_color || "from-stone-700 to-amber-900",
      }));

      this.cachedSongs = mapped;
      return mapped;
    } catch (err) {
      console.error("Unexpected error fetching songs from Supabase:", err);
      if (this.cachedSongs) return this.cachedSongs;
      return this.getFallbackCatalogSongs();
    }
  }

  private getFallbackCatalogSongs(): Song[] {
    return songStorage.getStoredSongs().map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      genre: (s.genre as Genre) || "Pop",
      key: s.key,
      capo: s.capo,
      difficulty: s.difficulty,
      chordCount: s.chords.length,
      popularity: s.popularity ?? 85,
      addedAt: "2024-01-01",
      isFavorited: false,
      ...(s.album ? { album: s.album } : {}),
      artColor: s.artColor || "from-stone-700 to-amber-900",
    }));
  }

  /**
   * Retrieves song detail by slug or Supabase UUID directly from Supabase public.songs.
   */
  async getSong(id: string): Promise<SongDetail | null> {
    if (!id || typeof id !== "string") {
      return null;
    }

    const normalized = id.toLowerCase().trim();
    if (!normalized) {
      return null;
    }

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        normalized
      );

    // 1. Primary: Load song metadata and rich content from Supabase by UUID or slug
    try {
      let data: any = null;

      if (isUuid) {
        const { data: byId, error: idError } = await supabase
          .from("songs")
          .select("*")
          .eq("id", normalized)
          .maybeSingle();

        if (idError) {
          console.warn("Supabase query error by ID:", idError.message);
        } else if (byId) {
          data = byId;
        }
      }

      if (!data) {
        const { data: bySlug, error: slugError } = await supabase
          .from("songs")
          .select("*")
          .eq("slug", normalized)
          .maybeSingle();

        if (slugError) {
          console.warn("Supabase query error by slug:", slugError.message);
        } else if (bySlug) {
          data = bySlug;
        }
      }

      if (data) {
        // 1. Sections priority: Supabase data.sections -> parseLyricsIntoSections fallback -> empty []
        let sections: SongDetail["sections"] = [];
        if (Array.isArray(data.sections) && data.sections.length > 0) {
          sections = data.sections.map((sec: any) => ({
            name: typeof sec?.name === "string" ? sec.name : "Section",
            lines: Array.isArray(sec?.lines)
              ? sec.lines.map((line: any) => ({
                  text: typeof line?.text === "string" ? line.text : "",
                  chords: Array.isArray(line?.chords) ? line.chords : undefined,
                }))
              : [],
          }));
        } else if (
          data.lyrics &&
          typeof data.lyrics === "string" &&
          data.lyrics.trim().length > 0
        ) {
          const parsed = parseLyricsIntoSections(data.lyrics);
          sections = parsed.sections;
        }

        // 2. Chords priority: Supabase data.chords -> derived from sections -> empty []
        let chords: string[] = [];
        if (Array.isArray(data.chords) && data.chords.length > 0) {
          chords = data.chords.filter((c: any) => typeof c === "string" && c.trim().length > 0);
        } else if (sections.length > 0) {
          const derived = new Set<string>();
          for (const sec of sections) {
            for (const line of sec.lines || []) {
              for (const ch of line.chords || []) {
                if (ch && typeof ch === "string") derived.add(ch);
              }
            }
          }
          chords = Array.from(derived);
        }

        // 3. Duration: Supabase data.duration -> undefined
        const duration =
          (typeof data.duration === "string" && data.duration.trim()) ||
          undefined;

        const songDetail: SongDetail = {
          id: data.slug || data.id || normalized,
          title: data.title ?? "",
          artist: data.artist ?? "",
          author:
            (data.author && data.author.trim()) ||
            undefined,
          album:
            (data.album && data.album.trim()) ||
            undefined,
          genre: (data.genre as Genre) || "Pop",
          difficulty:
            (data.difficulty as "Beginner" | "Intermediate" | "Advanced") ||
            "Intermediate",
          key: data.song_key ?? "C",
          capo:
            typeof data.capo === "number"
              ? data.capo
              : 0,
          tuning: data.tuning ?? "Standard",
          duration,
          popularity:
            typeof data.popularity === "number"
              ? data.popularity
              : undefined,
          artColor:
            data.art_color ||
            "from-stone-700 to-amber-900",
          chordCount:
            typeof data.chord_count === "number"
              ? data.chord_count
              : chords.length || 0,
          chords,
          sections,
        };

        return songDetail;
      }
    } catch (err) {
      console.warn("Error retrieving song from Supabase:", err);
    }

    // 2. Check user-uploaded locally stored song (songStorage)
    const stored = songStorage.getStoredSongs();
    const storedMatch = stored.find(
      (s) =>
        s.id.toLowerCase() === normalized ||
        s.title.toLowerCase().replace(/[^a-z0-9]/g, "-") === normalized
    );
    if (storedMatch) {
      return JSON.parse(JSON.stringify(storedMatch));
    }

    return null;
  }

  async getRelatedSongs(
    currentSong: SongDetail,
    limit = 4
  ): Promise<SongSummary[]> {
    const all = await this.getAllSongs();
    const candidates = all.filter((s) => s.id !== currentSong.id);

    const sameArtist = candidates.filter(
      (s) => s.artist.toLowerCase() === currentSong.artist.toLowerCase()
    );

    const sameGenre = candidates.filter(
      (s) =>
        s.artist.toLowerCase() !== currentSong.artist.toLowerCase() &&
        s.genre === currentSong.genre
    );

    const others = candidates.filter(
      (s) =>
        s.artist.toLowerCase() !== currentSong.artist.toLowerCase() &&
        s.genre !== currentSong.genre
    );

    return [...sameArtist, ...sameGenre, ...others].slice(0, limit);
  }

  async getAllSongs(): Promise<SongSummary[]> {
    const databaseSongs = await this.getSongs();
    const stored = songStorage.getStoredSongs();

    const storedSummaries: SongSummary[] = stored.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      genre: s.genre,
      key: s.key,
      capo: s.capo,
      difficulty: s.difficulty,
      chordCount: s.chords.length,
      artColor: s.artColor || "from-stone-700 to-amber-900",
    }));

    const dbSummaries: SongSummary[] = databaseSongs.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      genre: s.genre,
      key: s.key,
      capo: s.capo,
      difficulty: s.difficulty,
      chordCount: s.chordCount,
      artColor: s.artColor || "from-stone-700 to-amber-900",
    }));

    const seen = new Set<string>();
    const combined: SongSummary[] = [];
    for (const item of [...storedSummaries, ...dbSummaries]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        combined.push(item);
      }
    }
    return combined;
  }

  async createSong(input: CreateSongInput): Promise<string> {
    const rawSlug = `${input.title}-${input.artist}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Ensure unique slug
    const existing = await this.getAllSongs();
    let finalId = rawSlug || `song-${Date.now()}`;
    if (existing.some((s) => s.id === finalId)) {
      finalId = `${finalId}-${Math.floor(Math.random() * 1000)}`;
    }

    const { sections, chords } = parseLyricsIntoSections(input.lyricsText);

    const newSong: SongDetail = {
      id: finalId,
      title: input.title.trim(),
      artist: input.artist.trim(),
      author: input.author.trim(),
      genre: input.genre || "Pop",
      difficulty: input.difficulty || "Intermediate",
      key: input.key || "C",
      capo: input.capo ?? 0,
      tuning: input.tuning || "Standard",
      popularity: 88,
      artColor: "from-amber-800 to-orange-950",
      chordCount: chords.length,
      chords,
      sections,
    };

    songStorage.saveStoredSong(newSong);
    this.cachedSongs = null; // Invalidate catalog cache
    return finalId;
  }

  // ─── Favorites Implementation ──────────────────────────────────────────

  private slugToUuidMap = new Map<string, string>();
  private uuidToSlugMap = new Map<string, string>();
  private readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  async resolveSongUuid(songIdOrSlug: string): Promise<string | null> {
    if (!songIdOrSlug || typeof songIdOrSlug !== "string") return null;
    const trimmed = songIdOrSlug.trim();
    if (!trimmed) return null;

    if (this.UUID_REGEX.test(trimmed)) {
      return trimmed;
    }

    if (this.slugToUuidMap.has(trimmed)) {
      return this.slugToUuidMap.get(trimmed)!;
    }

    try {
      const { data, error } = await supabase
        .from("songs")
        .select("id, slug")
        .eq("slug", trimmed)
        .maybeSingle();

      if (!error && data?.id) {
        this.slugToUuidMap.set(trimmed, data.id);
        if (data.slug) this.uuidToSlugMap.set(data.id, data.slug);
        return data.id;
      }
    } catch (err) {
      console.warn("Failed to resolve song UUID by slug:", err);
    }

    return null;
  }

  private async getEffectiveUser(): Promise<{ id: string } | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) return user;
    } catch {
      // ignore
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) return session.user;
    } catch {
      // ignore
    }
    return null;
  }

  async getFavorites(): Promise<FavoriteRecord[]> {
    try {
      const user = await this.getEffectiveUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("favorites")
        .select("id, user_id, song_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load favorites:", error.message);
        return [];
      }
      return data ?? [];
    } catch (err) {
      console.error("Unexpected error loading favorites:", err);
      return [];
    }
  }

  async getFavoriteSongs(): Promise<Song[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      const currentUser =
        user || (await supabase.auth.getSession()).data?.session?.user;

      console.log("Current user:", currentUser?.id);
      if (userError) {
        console.warn("Supabase getUser error in getFavoriteSongs:", userError);
      }

      if (!currentUser) {
        return [];
      }

      // Step 1: Fetch user's favorites from public.favorites
      const { data: favorites, error: favError } = await supabase
        .from("favorites")
        .select(`
          id,
          song_id,
          created_at
        `)
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (favError) {
        console.error("Failed to fetch favorites from Supabase:", favError);
        return [];
      }

      console.log("Favorites from Supabase:", favorites);

      if (!favorites || favorites.length === 0) {
        console.log("Favorite song IDs:", []);
        console.log("Resolved songs:", []);
        return [];
      }

      // Step 2: Extract the song UUIDs
      const songIds = favorites.map((favorite) => favorite.song_id).filter(Boolean);
      console.log("Favorite song IDs:", songIds);

      if (songIds.length === 0) {
        console.log("Resolved songs:", []);
        return [];
      }

      // Step 3: Resolve song UUIDs against public.songs.id
      const { data: songs, error: songsError } = await supabase
        .from("songs")
        .select("*")
        .in("id", songIds);

      if (songsError) {
        console.error("Failed to fetch songs from public.songs:", songsError);
        return [];
      }

      console.log("Resolved songs:", songs);

      const typedSongs = (songs || []) as DatabaseSongRow[];
      const songMap = new Map<string, DatabaseSongRow>();
      for (const s of typedSongs) {
        songMap.set(s.id, s);
      }

      // Step 4: Map to application Song shape preserving user's favorite order (created_at DESC)
      const mappedSongs: Song[] = [];
      for (const fav of favorites) {
        const row = songMap.get(fav.song_id);
        if (!row) continue;

        // Cache slug <-> UUID mappings
        if (row.slug && row.id) {
          this.slugToUuidMap.set(row.slug, row.id);
          this.uuidToSlugMap.set(row.id, row.slug);
        }

        mappedSongs.push({
          id: row.slug || row.id, // Application UI/catalog identifier (slug)
          title: row.title ?? "",
          artist: row.artist ?? "",
          genre: (row.genre as Genre) || "Pop",
          key: row.song_key ?? "C",
          capo: typeof row.capo === "number" ? row.capo : 0,
          difficulty: (row.difficulty as Difficulty) || "Intermediate",
          chordCount: typeof row.chord_count === "number" ? row.chord_count : 0,
          popularity: typeof row.popularity === "number" ? row.popularity : 0,
          addedAt:
            row.added_at ||
            (row.created_at
              ? row.created_at.split("T")[0]
              : new Date().toISOString().split("T")[0]),
          isFavorited: true,
          ...(row.album ? { album: row.album } : {}),
          artColor: row.art_color || "from-stone-700 to-amber-900",
        });
      }

      return mappedSongs;
    } catch (err) {
      console.error("Unexpected error fetching favorite songs:", err);
      return [];
    }
  }

  async getFavoriteSongIds(): Promise<string[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const currentUser =
        user || (await supabase.auth.getSession()).data?.session?.user;

      if (!currentUser) return [];

      const { data: favorites, error: favError } = await supabase
        .from("favorites")
        .select("song_id")
        .eq("user_id", currentUser.id);

      if (favError || !favorites) {
        console.error("Error retrieving favorite IDs from Supabase:", favError);
        return [];
      }

      const songUuids = favorites.map((f) => f.song_id).filter(Boolean);
      if (songUuids.length === 0) return [];

      const ids = new Set<string>(songUuids);

      // Resolve slugs for all song UUIDs so that UI lookups with slug also match
      const missingUuids: string[] = [];
      for (const uuid of songUuids) {
        const cachedSlug = this.uuidToSlugMap.get(uuid);
        if (cachedSlug) {
          ids.add(cachedSlug);
        } else {
          missingUuids.push(uuid);
        }
      }

      if (missingUuids.length > 0) {
        const { data: songsData } = await supabase
          .from("songs")
          .select("id, slug")
          .in("id", missingUuids);

        for (const s of songsData || []) {
          if (s.slug) {
            ids.add(s.slug);
            this.slugToUuidMap.set(s.slug, s.id);
            this.uuidToSlugMap.set(s.id, s.slug);
          }
        }
      }

      return Array.from(ids);
    } catch (err) {
      console.error("Error retrieving favorite song IDs:", err);
      return [];
    }
  }

  async isFavorite(songIdOrSlug: string): Promise<boolean> {
    try {
      const user = await this.getEffectiveUser();
      if (!user) return false;

      const songUuid = await this.resolveSongUuid(songIdOrSlug);
      if (!songUuid) return false;

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("song_id", songUuid)
        .maybeSingle();

      return !error && Boolean(data);
    } catch (err) {
      console.error("Error checking favorite status:", err);
      return false;
    }
  }

  async addFavorite(songIdOrSlug: string): Promise<boolean> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Favorite auth error:", authError);
    }
    console.log("Favorite auth user:", user?.id);

    const effectiveUser =
      user || (await supabase.auth.getSession()).data?.session?.user;

    if (!effectiveUser) {
      throw new Error("User must be authenticated to add favorites");
    }

    console.log("Favorite song_id (input):", songIdOrSlug);
    const actualSupabaseSongUuid = await this.resolveSongUuid(songIdOrSlug);
    console.log("Favorite resolved UUID:", actualSupabaseSongUuid);

    if (!actualSupabaseSongUuid) {
      const notFoundErr = new Error(`Could not resolve Supabase song ID for '${songIdOrSlug}'`);
      console.error(notFoundErr.message);
      throw notFoundErr;
    }

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: effectiveUser.id,
        song_id: actualSupabaseSongUuid,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase favorites error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // 23505 = unique_violation, song already in favorites
      if (error.code === "23505") {
        return true;
      }
      throw error;
    }

    return true;
  }

  async removeFavorite(songIdOrSlug: string): Promise<boolean> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Favorite auth error:", authError);
    }
    console.log("Favorite auth user:", user?.id);

    const effectiveUser =
      user || (await supabase.auth.getSession()).data?.session?.user;

    if (!effectiveUser) {
      throw new Error("User must be authenticated to remove favorites");
    }

    console.log("Favorite song_id (input):", songIdOrSlug);
    const actualSupabaseSongUuid = await this.resolveSongUuid(songIdOrSlug);
    console.log("Favorite resolved UUID:", actualSupabaseSongUuid);

    if (!actualSupabaseSongUuid) {
      const notFoundErr = new Error(`Could not resolve Supabase song ID for '${songIdOrSlug}'`);
      console.error(notFoundErr.message);
      throw notFoundErr;
    }

    const { data, error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", effectiveUser.id)
      .eq("song_id", actualSupabaseSongUuid)
      .select();

    if (error) {
      console.error("Supabase favorites error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return true;
  }

  async toggleFavorite(songIdOrSlug: string): Promise<boolean> {
    const isFav = await this.isFavorite(songIdOrSlug);
    if (isFav) {
      await this.removeFavorite(songIdOrSlug);
      return false;
    } else {
      await this.addFavorite(songIdOrSlug);
      return true;
    }
  }
}

export const songService: SongService = new SupabaseSongService();
export const favoriteService = songService;

