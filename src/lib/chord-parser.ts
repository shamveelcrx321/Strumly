import type { LyricLine, SongSection } from "../services/song-types";

/**
 * Normalizes unicode accidental symbols into standard ASCII characters
 * so that downstream transposition and chord charts function reliably.
 */
export function normalizeAccidentals(str: string): string {
  return str.replace(/♯/g, "#").replace(/♭/g, "b");
}

/**
 * Strips outer punctuation, brackets, parentheses, and bar-lines from a chord token.
 */
export function cleanChordToken(rawToken: string): string {
  let token = rawToken.trim();

  // Strip enclosing brackets or parentheses: e.g. "(Am)", "[C#m7]"
  if (
    (token.startsWith("(") && token.endsWith(")")) ||
    (token.startsWith("[") && token.endsWith("]"))
  ) {
    token = token.slice(1, -1).trim();
  }

  // Strip delimiter and punctuation characters from edges: e.g. "|Am|", "G,", "D:"
  token = token.replace(/^[,;:.|/]+/, "").replace(/[,;:.|/]+$/, "");
  return normalizeAccidentals(token);
}

/**
 * Allowed guitar chord qualities and extensions:
 * - Major: "", "maj", "maj7", "maj9", "maj11", "maj13", "M7", "Δ", "6", "6/9"
 * - Minor: "m", "min", "m6", "m7", "m9", "m11", "m13", "m7b5", "ø", "-"
 * - 7th / Dominant: "7", "9", "11", "13", "7b5", "7#5", "7b9", "7#9", "7alt"
 * - Suspended: "sus", "sus2", "sus4", "7sus", "7sus4", "2", "4"
 * - Added: "add9", "add2", "add4", "add11"
 * - Diminished: "dim", "dim7", "°", "o7" (requires 7 if 'o' to avoid collision with words like 'Do'/'Go')
 * - Augmented: "aug", "aug7", "+", "+7"
 * - Power chords: "5"
 */
const CHORD_QUALITY_REGEX =
  /^(?:maj|min|dim|aug|sus|add|m|M|Δ|°|ø|\+|-)?(?:[0-9]{1,2})?(?:(?:maj|min|m|dim|aug|sus|add|\+|-)[0-9]{0,2})*(?:(?:b|#)[0-9]{1,2})*(?:alt)?$/;

/**
 * Determines whether a given token represents a valid musical chord.
 */
export function isChordToken(rawToken: string): boolean {
  const token = cleanChordToken(rawToken);
  if (!token) return false;

  let mainChord = token;
  // Handle slash chords: e.g. "G/B", "D/F#", "Bb/D"
  if (token.includes("/")) {
    const parts = token.split("/");
    if (parts.length !== 2) return false;
    mainChord = parts[0]!;
    const bass = parts[1]!;
    // Bass note must be a valid root note: A-G with optional accidental
    if (!/^[A-G][#b]?$/.test(bass)) return false;
  }

  // Chord root must start with uppercase [A-G] followed by optional accidental (#, b)
  const match = mainChord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return false;

  const quality = match[2]!;
  if (!quality) return true; // Plain root chord: e.g. "C", "G", "F#", "Bb"

  return CHORD_QUALITY_REGEX.test(quality);
}

export interface SectionHeadingResult {
  isHeading: boolean;
  name: string;
  isMetaHeader: boolean;
}

/**
 * Recognizes section headings such as:
 * - Bracketed: [Verse 1], [Chorus], [Bridge], [Intro], [Outro], [Pre-Chorus], [Instrumental]
 * - Unbracketed: Verse 1, Chorus, Bridge, Intro, Outro, Pre-Chorus, Instrumental, Verse 2, etc.
 * - Metadata headers: [LYRICS], [CHORDS], [TAB], etc. (ignored as section titles)
 */
export function parseSectionHeading(line: string): SectionHeadingResult {
  const trimmed = line.trim();
  if (!trimmed) {
    return { isHeading: false, name: "", isMetaHeader: false };
  }

  // Ignored metadata containers: e.g. [LYRICS], [CHORDS], [TAB], LYRICS:
  if (/^[\[(]?(?:lyrics|chords|tabs?|song)[\])]?:?$/i.test(trimmed)) {
    return { isHeading: true, name: "Lyrics", isMetaHeader: true };
  }

  // 1. Bracketed section headings: [Verse 1], [Chorus], [Bridge], [Intro], etc.
  const bracketMatch = trimmed.match(/^\[([a-zA-Z0-9\s\-_/:.]+)\]$/);
  if (bracketMatch) {
    const name = bracketMatch[1]!.trim();
    // Ensure it's not simply a bracketed chord like [C] or [Gmaj7]
    if (!isChordToken(name)) {
      return { isHeading: true, name, isMetaHeader: false };
    }
  }

  // 2. Unbracketed section headings:
  // Verse 1, Verse 2, Chorus, Chorus 1, Bridge, Intro, Outro, Pre-Chorus, Instrumental, Interlude, Solo
  const headingMatch = trimmed.match(
    /^(Verse(?:\s*\d+)?|Chorus(?:\s*\d+)?|Pre-Chorus(?:\s*\d+)?|Bridge(?:\s*\d+)?|Intro|Outro|Instrumental|Interlude|Hook|Solo|Refrain|Ending)(?:\s*:)?$/i
  );
  if (headingMatch) {
    return { isHeading: true, name: headingMatch[1]!.trim(), isMetaHeader: false };
  }

  return { isHeading: false, name: "", isMetaHeader: false };
}

// Delimiters that can appear between chords in a chord sheet
const DELIMITER_REGEX = /^(\||\/|-|--|---|~|:|\*|\+)+$/;
const CHORD_ANNOTATIONS = /^(?:N\.C\.|NC|\(x\d+\)|x\d+|\(repeat\)|\(\d+x\))$/i;

export interface ChordLineResult {
  isChordLine: boolean;
  chords: string[];
}

/**
 * Determines if a line represents a chord-only line.
 * Evaluates token validity, chord ratio, and context lookahead for ambiguous single tokens.
 */
export function isChordLine(
  line: string,
  context?: { nextLine?: string; prevLine?: string }
): ChordLineResult {
  const trimmed = line.trim();
  if (!trimmed) return { isChordLine: false, chords: [] };

  // Section headings are never chord lines
  if (parseSectionHeading(trimmed).isHeading) {
    return { isChordLine: false, chords: [] };
  }

  // Split into tokens by whitespace
  const rawTokens = trimmed.split(/\s+/);
  const substantiveTokens: string[] = [];

  for (const t of rawTokens) {
    if (DELIMITER_REGEX.test(t)) continue;
    substantiveTokens.push(t);
  }

  if (substantiveTokens.length === 0) {
    return { isChordLine: false, chords: [] };
  }

  const chords: string[] = [];
  let chordMatchesCount = 0;
  let annotationCount = 0;

  for (const token of substantiveTokens) {
    if (CHORD_ANNOTATIONS.test(token)) {
      annotationCount++;
      continue;
    }
    if (isChordToken(token)) {
      chordMatchesCount++;
      chords.push(cleanChordToken(token));
    }
  }

  // Case 1: Single token on the line
  if (substantiveTokens.length === 1) {
    const singleToken = substantiveTokens[0]!;
    const cleaned = cleanChordToken(singleToken);

    if (!isChordToken(singleToken)) {
      return { isChordLine: false, chords: [] };
    }

    // Explicit chord wrappers: [C], (Am), |G|
    if (
      singleToken.startsWith("[") ||
      singleToken.startsWith("(") ||
      singleToken.startsWith("|")
    ) {
      return { isChordLine: true, chords: [cleaned] };
    }

    // Multi-character chords that are NOT English words:
    // e.g. "C#m", "Dsus2", "G/B", "Cadd9", "Am7", "Cmaj7", "G7", "Em", "F#m", "Bb"
    if (
      cleaned.length > 2 ||
      (cleaned.length === 2 && cleaned !== "Am") ||
      cleaned.includes("#") ||
      cleaned.includes("b") ||
      cleaned.includes("/") ||
      /\d/.test(cleaned)
    ) {
      return { isChordLine: true, chords: [cleaned] };
    }

    // Disambiguation for "A" and "Am":
    // Only classify as a chord line if the subsequent line looks like a multi-word lyric line
    if (cleaned === "A" || cleaned === "Am") {
      if (context?.nextLine) {
        const nextTokens = context.nextLine.trim().split(/\s+/);
        if (nextTokens.length >= 2 && !isChordLine(context.nextLine).isChordLine) {
          return { isChordLine: true, chords: [cleaned] };
        }
      }
      return { isChordLine: false, chords: [] };
    }

    // Single letter "C", "D", "E", "F", "G", "B" (not English words)
    if (context?.nextLine) {
      const nextTokens = context.nextLine.trim().split(/\s+/);
      if (nextTokens.length >= 2 && !isChordLine(context.nextLine).isChordLine) {
        return { isChordLine: true, chords: [cleaned] };
      }
    }

    return { isChordLine: true, chords: [cleaned] };
  }

  // Case 2: Multiple tokens on the line
  const meaningfulCount = substantiveTokens.length - annotationCount;
  if (meaningfulCount <= 0) {
    return { isChordLine: false, chords: [] };
  }

  // If 100% of tokens are valid chords
  if (chordMatchesCount === meaningfulCount) {
    return { isChordLine: true, chords };
  }

  // If at least 80% of tokens are valid chords and count >= 2
  if (chordMatchesCount >= 2 && chordMatchesCount / meaningfulCount >= 0.8) {
    return { isChordLine: true, chords };
  }

  return { isChordLine: false, chords: [] };
}

export interface ParsedLyricsResult {
  sections: SongSection[];
  chords: string[];
}

/**
 * Parses raw song lyrics / chord sheets into structured sections and lines.
 *
 * Capabilities:
 * - Detects bracketed and plain section headings (e.g. Verse 1, Chorus, [Intro]).
 * - Distinguishes chord-only lines from lyric lines.
 * - Associates chords with their corresponding lyric line (LyricLine.chords).
 * - Leaves LyricLine.text clean (free of chord strings).
 * - Collects unique chords into the returned chords array.
 * - Backwards-compatible with inline bracketed chords (e.g. [C] or [Am]).
 */
export function parseLyricsIntoSections(lyricsText: string): ParsedLyricsResult {
  const rawLines = lyricsText.split("\n");
  const sections: SongSection[] = [];
  const foundChords = new Set<string>();

  let currentSectionName = "Lyrics";
  let currentLines: LyricLine[] = [];
  let pendingChords: string[] = [];

  const flushPendingChords = () => {
    if (pendingChords.length > 0) {
      currentLines.push({
        text: "",
        chords: [...pendingChords],
      });
      pendingChords = [];
    }
  };

  const flushCurrentSection = () => {
    flushPendingChords();
    if (currentLines.length > 0) {
      sections.push({
        name: currentSectionName,
        lines: currentLines,
      });
      currentLines = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i]!;
    const trimmed = rawLine.trim();

    if (!trimmed) {
      continue;
    }

    // 1. Check if line is a section heading or metadata header
    const headingInfo = parseSectionHeading(trimmed);
    if (headingInfo.isHeading) {
      if (headingInfo.isMetaHeader) {
        // e.g. [LYRICS] - ignored as a container marker
        continue;
      }
      flushCurrentSection();
      currentSectionName = headingInfo.name || "Section";
      continue;
    }

    // Look ahead to next non-empty line for context disambiguation
    let nextNonEmptyLine: string | undefined = undefined;
    for (let j = i + 1; j < rawLines.length; j++) {
      const candidate = rawLines[j]!.trim();
      if (candidate) {
        nextNonEmptyLine = candidate;
        break;
      }
    }

    // 2. Check if line is a chord-only line
    const chordLineResult = isChordLine(trimmed, { nextLine: nextNonEmptyLine });
    if (chordLineResult.isChordLine) {
      for (const ch of chordLineResult.chords) {
        foundChords.add(ch);
      }

      // If we already have pending chords (e.g. instrumental line with no lyrics below),
      // flush the previous chord line as its own row
      if (pendingChords.length > 0) {
        currentLines.push({
          text: "",
          chords: [...pendingChords],
        });
      }

      pendingChords = [...chordLineResult.chords];
      continue;
    }

    // 3. Otherwise, it is a lyric line
    // Check for inline bracketed chords like [C] or [Am] for backward compatibility
    const inlineChords: string[] = [];
    const chordMatches = trimmed.match(/\[([A-G][#b]?[a-zA-Z0-9/]*)\]/g);
    if (chordMatches) {
      for (const m of chordMatches) {
        const chordName = cleanChordToken(m.slice(1, -1));
        if (isChordToken(chordName)) {
          inlineChords.push(chordName);
          foundChords.add(chordName);
        }
      }
    }

    // Clean inline bracketed chords from text
    const cleanText = trimmed
      .replace(/\[([A-G][#b]?[a-zA-Z0-9/]*)\]\s*/g, "")
      .trim();

    // Attach chords to this line
    let lineChords: string[] | undefined = undefined;
    if (inlineChords.length > 0) {
      lineChords = inlineChords;
    } else if (pendingChords.length > 0) {
      lineChords = [...pendingChords];
    }
    pendingChords = [];

    currentLines.push({
      text: cleanText || trimmed,
      chords: lineChords && lineChords.length > 0 ? lineChords : undefined,
    });
  }

  // End of text: flush any remaining pending chords and current section
  flushCurrentSection();

  if (sections.length === 0) {
    sections.push({
      name: currentSectionName,
      lines: [{ text: lyricsText.trim() }],
    });
  }

  return { sections, chords: Array.from(foundChords) };
}
