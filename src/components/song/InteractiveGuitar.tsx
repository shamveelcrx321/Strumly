import { useState } from "react";
import { ChevronDown, ChevronUp, Music2, Sparkles } from "lucide-react";
import { getChordDefinition } from "./chord-dataset";
import { Button } from "@/components/ui/button";

interface InteractiveGuitarProps {
  activeChord?: string;
  onSelectChord?: (chord: string) => void;
  availableChords?: string[];
  className?: string;
}

export function InteractiveGuitar({
  activeChord,
  onSelectChord,
  availableChords = [],
  className = "",
}: InteractiveGuitarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [vibratingStrings, setVibratingStrings] = useState<number[]>([]);
  const [isStrumming, setIsStrumming] = useState(false);

  const selectedChord = activeChord || (availableChords.length > 0 ? availableChords[0] : "Em");
  const definition = getChordDefinition(selectedChord);

  const stringNames = ["E", "A", "D", "G", "B", "e"]; // Strings 6 to 1 (Low E to High e)
  const fretCount = 12; // frets 1 to 12
  const inlays = [3, 5, 7, 9, 12];

  const handleStringPluck = (stringIndex: number) => {
    setVibratingStrings((prev) => [...prev, stringIndex]);
    setTimeout(() => {
      setVibratingStrings((prev) => prev.filter((idx) => idx !== stringIndex));
    }, 400);
  };

  const handleStrum = () => {
    if (isStrumming) return;
    setIsStrumming(true);
    // Strum strings with slight stagger
    [0, 1, 2, 3, 4, 5].forEach((sIdx, i) => {
      setTimeout(() => {
        handleStringPluck(sIdx);
      }, i * 45);
    });
    setTimeout(() => {
      setIsStrumming(false);
    }, 400);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-glass-border bg-glass/50 p-4 shadow-xl backdrop-blur-md transition-all duration-300 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/20 text-peach shadow-sm">
            <Music2 size={16} />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-cream">Interactive Fretboard</h3>
            <p className="text-[11px] text-warm-muted">
              Showing fingering for <span className="font-bold text-peach">{selectedChord}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={handleStrum}
            disabled={isStrumming}
            className="h-7 text-xs px-2.5 text-peach hover:text-cream cursor-pointer"
          >
            <Sparkles size={13} className={isStrumming ? "animate-spin" : ""} />
            Strum
          </Button>

          {/* Mobile Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="grid size-7 place-items-center rounded-lg border border-glass-border bg-glass/40 text-cream/70 hover:text-cream sm:hidden cursor-pointer"
            aria-label={isCollapsed ? "Expand guitar" : "Collapse guitar"}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Available Chords Selector Bar */}
      {availableChords.length > 0 && !isCollapsed && (
        <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
          {availableChords.map((ch) => (
            <button
              key={ch}
              onClick={() => onSelectChord?.(ch)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                ch === selectedChord
                  ? "bg-primary text-primary-foreground shadow-warm"
                  : "border border-glass-border bg-glass/30 text-cream/70 hover:bg-glass hover:text-cream"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      )}

      {/* Fretboard Graphic Viewport */}
      {!isCollapsed && (
        <div className="mt-3 overflow-x-auto no-scrollbar rounded-xl border border-white/10 bg-gradient-to-r from-[oklch(0.18_0.03_45)] via-[oklch(0.20_0.03_42)] to-[oklch(0.16_0.02_40)] p-3 shadow-inner">
          <div className="relative min-w-[540px] select-none py-1">
            {/* Nut (Left Edge) */}
            <div className="absolute left-7 top-0 bottom-0 w-2.5 rounded-sm bg-gradient-to-r from-amber-100 to-amber-200 shadow-md border-r border-amber-900/30" />

            {/* Inlay Markers */}
            {inlays.map((fret) => {
              const leftPercent = ((fret - 0.5) / fretCount) * 88 + 9;
              return (
                <div
                  key={`inlay-${fret}`}
                  className="absolute top-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-3 z-0"
                  style={{ left: `${leftPercent}%` }}
                >
                  {fret === 12 ? (
                    <div className="flex flex-col gap-5">
                      <div className="size-1.5 rounded-full bg-cream/40 shadow-sm" />
                      <div className="size-1.5 rounded-full bg-cream/40 shadow-sm" />
                    </div>
                  ) : (
                    <div className="size-2 rounded-full bg-cream/35 shadow-sm" />
                  )}
                </div>
              );
            })}

            {/* Strings (6 horizontal lines: 0 = Low E at bottom or top, standard is low E at bottom or top; let's put low E top or bottom) */}
            <div className="space-y-4 relative z-10">
              {stringNames.map((sName, sIdx) => {
                const fret = definition.frets[sIdx];
                const isMuted = fret === -1;
                const isOpen = fret === 0;
                const isVibrating = vibratingStrings.includes(sIdx);
                // String gauge thickness (string 0 is Low E = thickest, string 5 is High e = thinnest)
                const thickness = 2.8 - sIdx * 0.35;

                return (
                  <div
                    key={`string-row-${sIdx}`}
                    onClick={() => handleStringPluck(sIdx)}
                    className="group flex items-center h-4 relative cursor-pointer"
                    title={`String ${sName} (Click to pluck)`}
                  >
                    {/* String Name & Nut Status (Left) */}
                    <div className="w-7 shrink-0 text-left flex items-center gap-1">
                      <span className="font-mono text-[11px] font-bold text-peach/80">
                        {sName}
                      </span>
                      {isMuted && <span className="text-[9px] font-bold text-rose-400">✕</span>}
                      {isOpen && (
                        <span className="size-1.5 rounded-full border border-primary bg-primary/40 inline-block" />
                      )}
                    </div>

                    {/* Fretboard track for this string */}
                    <div className="relative flex-1 h-full flex items-center ml-2.5">
                      {/* Metal String line */}
                      <div
                        className={`w-full bg-gradient-to-r from-amber-200/75 via-zinc-200/90 to-amber-200/60 transition-all ${
                          isVibrating ? "animate-pulse brightness-150 scale-y-150 shadow-[0_0_8px_oklch(0.81_0.105_55)]" : ""
                        }`}
                        style={{ height: `${thickness}px` }}
                      />

                      {/* Finger position indicator if pressed on this string */}
                      {fret > 0 && fret <= fretCount && (
                        <div
                          className="absolute -translate-x-1/2 flex items-center justify-center z-20"
                          style={{
                            left: `${((fret - 0.5) / fretCount) * 100}%`,
                          }}
                        >
                          <div className="relative flex size-5 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-bold text-primary-foreground shadow-[0_2px_8px_rgba(0,0,0,0.6)] ring-2 ring-peach/80 animate-scale-in">
                            {definition.fingers ? definition.fingers[sIdx] || fret : fret}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fret Wire Vertical Lines & Fret Number Markers */}
            <div className="relative mt-2 ml-9 flex justify-between text-[10px] text-cream/40 font-mono select-none">
              {Array.from({ length: fretCount }).map((_, f) => (
                <div key={`fret-num-${f}`} className="flex-1 text-center">
                  <span className={inlays.includes(f + 1) ? "font-bold text-peach/80" : ""}>
                    {f + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
