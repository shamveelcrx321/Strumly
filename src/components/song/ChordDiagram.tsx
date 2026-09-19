import React from "react";
import { getChordDefinition, type ChordDefinition } from "./chord-dataset";

interface ChordDiagramProps {
  chord: string;
  selected?: boolean;
  onClick?: (chord: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ChordDiagram({
  chord,
  selected = false,
  onClick,
  className = "",
  size = "md",
}: ChordDiagramProps) {
  const definition: ChordDefinition = getChordDefinition(chord);

  // SVG grid dimensions
  // 6 strings -> 5 intervals between strings
  const width = size === "sm" ? 72 : size === "lg" ? 110 : 90;
  const height = size === "sm" ? 90 : size === "lg" ? 135 : 110;

  const paddingX = 14;
  const paddingTop = 26;
  const paddingBottom = 12;

  const gridWidth = width - paddingX * 2;
  const gridHeight = height - paddingTop - paddingBottom;

  const stringCount = 6;
  const fretCount = 4;

  const stringSpacing = gridWidth / (stringCount - 1);
  const fretSpacing = gridHeight / fretCount;

  // Compute positions
  const baseFret = definition.baseFret || 1;
  const isNut = baseFret === 1;

  return (
    <div
      onClick={() => onClick?.(chord)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(chord);
        }
      }}
      className={`group relative flex flex-col items-center rounded-xl border p-2 transition-all duration-200 select-none ${
        selected
          ? "border-primary/80 bg-primary/15 shadow-warm ring-1 ring-primary/40"
          : "border-glass-border bg-glass/30 hover:border-peach/50 hover:bg-glass/50 hover:-translate-y-0.5"
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {/* Chord Name Header */}
      <span className="font-display text-sm font-bold text-cream group-hover:text-peach transition-colors">
        {chord}
      </span>

      {/* SVG Diagram */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-label={`Chord diagram for ${chord}`}
      >
        {/* Nut (Thick line if baseFret === 1) */}
        {isNut ? (
          <line
            x1={paddingX - 1}
            y1={paddingTop}
            x2={paddingX + gridWidth + 1}
            y2={paddingTop}
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-cream/90"
          />
        ) : (
          <>
            <line
              x1={paddingX}
              y1={paddingTop}
              x2={paddingX + gridWidth}
              y2={paddingTop}
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-cream/40"
            />
            {/* Fret label for high-position chords (e.g. 4fr) */}
            <text
              x={paddingX - 4}
              y={paddingTop + fretSpacing * 0.7}
              textAnchor="end"
              className="fill-peach/80 text-[10px] font-semibold"
            >
              {baseFret}fr
            </text>
          </>
        )}

        {/* Fret horizontal lines */}
        {Array.from({ length: fretCount }).map((_, f) => (
          <line
            key={`fret-${f}`}
            x1={paddingX}
            y1={paddingTop + (f + 1) * fretSpacing}
            x2={paddingX + gridWidth}
            y2={paddingTop + (f + 1) * fretSpacing}
            stroke="currentColor"
            strokeWidth="1"
            className="text-cream/25"
          />
        ))}

        {/* Strings vertical lines */}
        {Array.from({ length: stringCount }).map((_, s) => (
          <line
            key={`string-${s}`}
            x1={paddingX + s * stringSpacing}
            y1={paddingTop}
            x2={paddingX + s * stringSpacing}
            y2={paddingTop + gridHeight}
            stroke="currentColor"
            strokeWidth={1.2 - s * 0.12} // thicker on low strings
            className="text-cream/40"
          />
        ))}

        {/* Barre if present */}
        {definition.barre && (
          <rect
            x={paddingX + (6 - definition.barre.to) * stringSpacing - 4}
            y={paddingTop + (definition.barre.fret - baseFret + 0.25) * fretSpacing}
            width={(definition.barre.to - definition.barre.from) * stringSpacing + 8}
            height={fretSpacing * 0.5}
            rx={fretSpacing * 0.25}
            className="fill-peach/70"
          />
        )}

        {/* String indicators: Open (o), Muted (x), or Dots */}
        {definition.frets.map((fret, stringIdx) => {
          const x = paddingX + stringIdx * stringSpacing;
          const finger = definition.fingers ? definition.fingers[stringIdx] : 0;

          if (fret === -1) {
            // Muted string (x)
            return (
              <text
                key={`mute-${stringIdx}`}
                x={x}
                y={paddingTop - 7}
                textAnchor="middle"
                className="fill-warm-muted/70 text-[10px] font-bold"
              >
                ✕
              </text>
            );
          }

          if (fret === 0) {
            // Open string (o)
            return (
              <circle
                key={`open-${stringIdx}`}
                cx={x}
                cy={paddingTop - 10}
                r="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-peach/80"
              />
            );
          }

          // Fretted note dot
          const relativeFret = fret - baseFret + 1;
          if (relativeFret >= 1 && relativeFret <= fretCount) {
            const y = paddingTop + (relativeFret - 0.5) * fretSpacing;
            return (
              <g key={`dot-${stringIdx}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={size === "sm" ? 4.2 : 5.2}
                  className="fill-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                />
                {finger > 0 && (
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    className="fill-primary-foreground text-[8px] font-bold pointer-events-none"
                  >
                    {finger}
                  </text>
                )}
              </g>
            );
          }

          return null;
        })}
      </svg>
    </div>
  );
}
