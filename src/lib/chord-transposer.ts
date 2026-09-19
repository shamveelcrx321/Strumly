// ─── Chromatic Scale Definitions ─────────────────────────────────────────────

const SHARP_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_SCALE = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0, "B#": 0,
  "C#": 1, Db: 1,
  D: 2,
  "D#": 3, Eb: 3,
  E: 4, Fb: 4,
  F: 5, "E#": 5,
  "F#": 6, Gb: 6,
  G: 7,
  "G#": 8, Ab: 8,
  A: 9,
  "A#": 10, Bb: 10,
  B: 11, Cb: 11,
};

// Determines if key or chord traditionally prefers flats
function prefersFlats(keyOrChord: string): boolean {
  return /^(F|Bb|Eb|Ab|Db|Gb|Dm|Gm|Cm|Fm|Bbm|Ebm)$/.test(keyOrChord) || keyOrChord.includes("b");
}

/**
 * Transposes a single note by a given number of semitones.
 */
export function transposeNote(note: string, semitones: number, useFlats = false): string {
  const currentSemitone = NOTE_TO_SEMITONE[note];
  if (currentSemitone === undefined) return note;

  const normalized = ((currentSemitone + semitones) % 12 + 12) % 12;
  const scale = useFlats ? FLAT_SCALE : SHARP_SCALE;
  return scale[normalized];
}

/**
 * Parses a chord into root, quality/extension, and optional bass note.
 * Examples:
 * - "C#m7" -> { root: "C#", quality: "m7", bass: undefined }
 * - "D/F#" -> { root: "D", quality: "", bass: "F#" }
 * - "Bbmaj7/D" -> { root: "Bb", quality: "maj7", bass: "D" }
 */
export function parseChord(chord: string): { root: string; quality: string; bass?: string } | null {
  const trimmed = chord.trim();
  if (!trimmed) return null;

  // Check for slash chord
  const parts = trimmed.split("/");
  const chordPart = parts[0];
  const bassPart = parts[1];

  const match = chordPart.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return null;

  return {
    root: match[1],
    quality: match[2],
    bass: bassPart ? bassPart.trim() : undefined,
  };
}

/**
 * Transposes a chord string (e.g. "C#m", "D/F#", "Bb7") by semitones.
 */
export function transposeChord(chord: string, semitones: number, targetKeyPreference?: boolean): string {
  if (semitones === 0) return chord;
  const parsed = parseChord(chord);
  if (!parsed) return chord;

  const useFlats = targetKeyPreference !== undefined ? targetKeyPreference : prefersFlats(parsed.root);
  const newRoot = transposeNote(parsed.root, semitones, useFlats);

  let newBass = "";
  if (parsed.bass) {
    newBass = "/" + transposeNote(parsed.bass, semitones, useFlats);
  }

  return `${newRoot}${parsed.quality}${newBass}`;
}

/**
 * Transposes a key signature string by semitones.
 * e.g. "C#m" + 1 -> "Dm", "G" + 2 -> "A"
 */
export function transposeKey(key: string, semitones: number): string {
  if (!key || semitones === 0) return key;
  const match = key.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return key;

  const useFlats = prefersFlats(key);
  const newRoot = transposeNote(match[1], semitones, useFlats);
  return `${newRoot}${match[2]}`;
}

/**
 * Simplifies a chord by removing complex extensions.
 * e.g. "Cmaj7" -> "C", "Dm7" -> "Dm", "Gsus4" -> "G", "F#m9" -> "F#m", "Aadd9" -> "A"
 */
export function simplifyChord(chord: string): string {
  const parsed = parseChord(chord);
  if (!parsed) return chord;

  let quality = parsed.quality;
  // Keep minor indicator if it was minor, but strip extensions
  if (/^m(?!aj)/.test(quality)) {
    quality = "m";
  } else if (/^dim/.test(quality)) {
    quality = "dim";
  } else if (/^aug/.test(quality)) {
    quality = "aug";
  } else {
    quality = "";
  }

  return `${parsed.root}${quality}`;
}
