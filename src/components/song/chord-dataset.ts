export interface ChordDefinition {
  name: string;
  baseFret: number;
  /** Frets for strings 6 down to 1 (Low E, A, D, G, B, High e). -1 = muted (x), 0 = open (o) */
  frets: [number, number, number, number, number, number];
  /** Finger numbers 1-4 for each string. 0 = none/open/muted */
  fingers?: [number, number, number, number, number, number];
  barre?: {
    fret: number;
    from: number; // 1-6 (string number, 1 is high e, 6 is low E)
    to: number;
  };
}

export const CHORD_DATABASE: Record<string, ChordDefinition> = {
  // ── Basic Major & Minor ──
  C: {
    name: "C",
    baseFret: 1,
    frets: [-1, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
  },
  D: {
    name: "D",
    baseFret: 1,
    frets: [-1, -1, 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
  },
  E: {
    name: "E",
    baseFret: 1,
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
  },
  F: {
    name: "F",
    baseFret: 1,
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barre: { fret: 1, from: 1, to: 6 },
  },
  G: {
    name: "G",
    baseFret: 1,
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
  },
  A: {
    name: "A",
    baseFret: 1,
    frets: [-1, 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
  },
  B: {
    name: "B",
    baseFret: 2,
    frets: [-1, 2, 4, 4, 4, 2],
    fingers: [0, 1, 2, 3, 4, 1],
    barre: { fret: 2, from: 1, to: 5 },
  },

  // ── Minor Chords ──
  Am: {
    name: "Am",
    baseFret: 1,
    frets: [-1, 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
  },
  Dm: {
    name: "Dm",
    baseFret: 1,
    frets: [-1, -1, 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
  },
  Em: {
    name: "Em",
    baseFret: 1,
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
  },
  Fm: {
    name: "Fm",
    baseFret: 1,
    frets: [1, 3, 3, 1, 1, 1],
    fingers: [1, 3, 4, 1, 1, 1],
    barre: { fret: 1, from: 1, to: 6 },
  },
  Gm: {
    name: "Gm",
    baseFret: 3,
    frets: [3, 5, 5, 3, 3, 3],
    fingers: [1, 3, 4, 1, 1, 1],
    barre: { fret: 3, from: 1, to: 6 },
  },
  Bm: {
    name: "Bm",
    baseFret: 2,
    frets: [-1, 2, 4, 4, 3, 2],
    fingers: [0, 1, 3, 4, 2, 1],
    barre: { fret: 2, from: 1, to: 5 },
  },
  Cm: {
    name: "Cm",
    baseFret: 3,
    frets: [-1, 3, 5, 5, 4, 3],
    fingers: [0, 1, 3, 4, 2, 1],
    barre: { fret: 3, from: 1, to: 5 },
  },

  // ── Sharps & Flats ──
  "C#m": {
    name: "C#m",
    baseFret: 4,
    frets: [-1, 4, 6, 6, 5, 4],
    fingers: [0, 1, 3, 4, 2, 1],
    barre: { fret: 4, from: 1, to: 5 },
  },
  "D#m": {
    name: "D#m",
    baseFret: 6,
    frets: [-1, 6, 8, 8, 7, 6],
    fingers: [0, 1, 3, 4, 2, 1],
    barre: { fret: 6, from: 1, to: 5 },
  },
  Ebm: {
    name: "Ebm",
    baseFret: 6,
    frets: [-1, 6, 8, 8, 7, 6],
    fingers: [0, 1, 3, 4, 2, 1],
    barre: { fret: 6, from: 1, to: 5 },
  },
  "F#m": {
    name: "F#m",
    baseFret: 2,
    frets: [2, 4, 4, 2, 2, 2],
    fingers: [1, 3, 4, 1, 1, 1],
    barre: { fret: 2, from: 1, to: 6 },
  },
  "G#m": {
    name: "G#m",
    baseFret: 4,
    frets: [4, 6, 6, 4, 4, 4],
    fingers: [1, 3, 4, 1, 1, 1],
    barre: { fret: 4, from: 1, to: 6 },
  },
  Abm: {
    name: "Abm",
    baseFret: 4,
    frets: [4, 6, 6, 4, 4, 4],
    fingers: [1, 3, 4, 1, 1, 1],
    barre: { fret: 4, from: 1, to: 6 },
  },
  "A#m": {
    name: "A#m",
    baseFret: 1,
    frets: [-1, 1, 3, 3, 2, 1],
    fingers: [0, 1, 3, 4, 2, 1],
    barre: { fret: 1, from: 1, to: 5 },
  },
  Bbm: {
    name: "Bbm",
    baseFret: 1,
    frets: [-1, 1, 3, 3, 2, 1],
    fingers: [0, 1, 3, 4, 2, 1],
    barre: { fret: 1, from: 1, to: 5 },
  },
  "F#": {
    name: "F#",
    baseFret: 2,
    frets: [2, 4, 4, 3, 2, 2],
    fingers: [1, 3, 4, 2, 1, 1],
    barre: { fret: 2, from: 1, to: 6 },
  },
  Gb: {
    name: "Gb",
    baseFret: 2,
    frets: [2, 4, 4, 3, 2, 2],
    fingers: [1, 3, 4, 2, 1, 1],
    barre: { fret: 2, from: 1, to: 6 },
  },
  "G#": {
    name: "G#",
    baseFret: 4,
    frets: [4, 6, 6, 5, 4, 4],
    fingers: [1, 3, 4, 2, 1, 1],
    barre: { fret: 4, from: 1, to: 6 },
  },
  Ab: {
    name: "Ab",
    baseFret: 4,
    frets: [4, 6, 6, 5, 4, 4],
    fingers: [1, 3, 4, 2, 1, 1],
    barre: { fret: 4, from: 1, to: 6 },
  },
  "A#": {
    name: "A#",
    baseFret: 1,
    frets: [-1, 1, 3, 3, 3, 1],
    fingers: [0, 1, 2, 3, 4, 1],
    barre: { fret: 1, from: 1, to: 5 },
  },
  Bb: {
    name: "Bb",
    baseFret: 1,
    frets: [-1, 1, 3, 3, 3, 1],
    fingers: [0, 1, 2, 3, 4, 1],
    barre: { fret: 1, from: 1, to: 5 },
  },
  "C#": {
    name: "C#",
    baseFret: 4,
    frets: [-1, 4, 6, 6, 6, 4],
    fingers: [0, 1, 2, 3, 4, 1],
    barre: { fret: 4, from: 1, to: 5 },
  },
  Db: {
    name: "Db",
    baseFret: 4,
    frets: [-1, 4, 6, 6, 6, 4],
    fingers: [0, 1, 2, 3, 4, 1],
    barre: { fret: 4, from: 1, to: 5 },
  },
  "D#": {
    name: "D#",
    baseFret: 6,
    frets: [-1, 6, 8, 8, 8, 6],
    fingers: [0, 1, 2, 3, 4, 1],
    barre: { fret: 6, from: 1, to: 5 },
  },
  Eb: {
    name: "Eb",
    baseFret: 6,
    frets: [-1, 6, 8, 8, 8, 6],
    fingers: [0, 1, 2, 3, 4, 1],
    barre: { fret: 6, from: 1, to: 5 },
  },

  // ── 7th / Dominant / Major 7th ──
  C7: {
    name: "C7",
    baseFret: 1,
    frets: [-1, 3, 2, 3, 1, 0],
    fingers: [0, 3, 2, 4, 1, 0],
  },
  D7: {
    name: "D7",
    baseFret: 1,
    frets: [-1, -1, 0, 2, 1, 2],
    fingers: [0, 0, 0, 2, 1, 3],
  },
  E7: {
    name: "E7",
    baseFret: 1,
    frets: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
  },
  G7: {
    name: "G7",
    baseFret: 1,
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
  },
  A7: {
    name: "A7",
    baseFret: 1,
    frets: [-1, 0, 2, 0, 2, 0],
    fingers: [0, 0, 1, 0, 2, 0],
  },
  B7: {
    name: "B7",
    baseFret: 1,
    frets: [-1, 2, 1, 2, 0, 2],
    fingers: [0, 2, 1, 3, 0, 4],
  },
  Cmaj7: {
    name: "Cmaj7",
    baseFret: 1,
    frets: [-1, 3, 2, 0, 0, 0],
    fingers: [0, 3, 2, 0, 0, 0],
  },
  Fmaj7: {
    name: "Fmaj7",
    baseFret: 1,
    frets: [-1, -1, 3, 2, 1, 0],
    fingers: [0, 0, 3, 2, 1, 0],
  },
  Am7: {
    name: "Am7",
    baseFret: 1,
    frets: [-1, 0, 2, 0, 1, 0],
    fingers: [0, 0, 2, 0, 1, 0],
  },
  Em7: {
    name: "Em7",
    baseFret: 1,
    frets: [0, 2, 2, 0, 3, 0],
    fingers: [0, 1, 2, 0, 3, 0],
  },
  Dm7: {
    name: "Dm7",
    baseFret: 1,
    frets: [-1, -1, 0, 2, 1, 1],
    fingers: [0, 0, 0, 2, 1, 1],
  },

  // ── Suspended ──
  Dsus4: {
    name: "Dsus4",
    baseFret: 1,
    frets: [-1, -1, 0, 2, 3, 3],
    fingers: [0, 0, 0, 1, 2, 3],
  },
  Asus4: {
    name: "Asus4",
    baseFret: 1,
    frets: [-1, 0, 2, 2, 3, 0],
    fingers: [0, 0, 1, 2, 3, 0],
  },
  Esus4: {
    name: "Esus4",
    baseFret: 1,
    frets: [0, 2, 2, 2, 0, 0],
    fingers: [0, 2, 3, 4, 0, 0],
  },
  Gsus4: {
    name: "Gsus4",
    baseFret: 1,
    frets: [3, 2, 0, 0, 1, 3],
    fingers: [3, 2, 0, 0, 1, 4],
  },

  // ── Common Slash Chords ──
  "D/F#": {
    name: "D/F#",
    baseFret: 1,
    frets: [2, 0, 0, 2, 3, 2],
    fingers: [1, 0, 0, 2, 4, 3],
  },
  "G/B": {
    name: "G/B",
    baseFret: 1,
    frets: [-1, 2, 0, 0, 0, 3],
    fingers: [0, 1, 0, 0, 0, 2],
  },
  "C/G": {
    name: "C/G",
    baseFret: 1,
    frets: [3, 3, 2, 0, 1, 0],
    fingers: [3, 4, 2, 0, 1, 0],
  },
};

/**
 * Gets chord definition or creates a safe fallback based on root.
 */
export function getChordDefinition(chordName: string): ChordDefinition {
  const clean = chordName.trim();
  if (CHORD_DATABASE[clean]) {
    return CHORD_DATABASE[clean];
  }

  // Check without slash bass note
  const [base] = clean.split("/");
  if (CHORD_DATABASE[base]) {
    return { ...CHORD_DATABASE[base], name: clean };
  }

  // Check simplified version
  const simplified = base.replace(/add9|sus2|sus4|maj7|m7|7|9|dim|aug/, "");
  if (CHORD_DATABASE[simplified]) {
    return { ...CHORD_DATABASE[simplified], name: clean };
  }

  // Generic fallback if unknown
  return {
    name: clean,
    baseFret: 1,
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 1, 2, 0, 0, 0],
  };
}
