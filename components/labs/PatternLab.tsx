"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { playPianoNote, playClickSound, playKick, playSnare, playHiHat } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import type { Lab } from "@/lib/labs";

interface PatternLabProps {
  lab: Lab;
}

type RowType = "kick" | "snare" | "hat" | "melody";

const ROWS: { type: RowType; label: string; color: string; play: () => void }[] = [
  { type: "kick", label: "Kick", color: "from-amber-600 to-orange-600", play: () => void playKick() },
  { type: "snare", label: "Snare", color: "from-rose-600 to-pink-600", play: () => void playSnare() },
  { type: "hat", label: "Hi-Hat", color: "from-cyan-600 to-blue-600", play: () => void playHiHat() },
  { type: "melody", label: "Melody", color: "from-violet-600 to-purple-600", play: () => {} },
];

const MELODY_NOTES = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
const BEATS = 16;

const PRESETS: { name: string; pattern: boolean[][] }[] = [
  {
    name: "Four on Floor",
    pattern: [
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0].map(Boolean),
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0].map(Boolean),
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1].map(Boolean),
      [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0].map(Boolean),
    ],
  },
  {
    name: "Hip-Hop",
    pattern: [
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0].map(Boolean),
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0].map(Boolean),
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0].map(Boolean),
      [0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0].map(Boolean),
    ],
  },
  {
    name: "House",
    pattern: [
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0].map(Boolean),
      [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0].map(Boolean),
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1].map(Boolean),
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0].map(Boolean),
    ],
  },
  {
    name: "Breakbeat",
    pattern: [
      [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0].map(Boolean),
      [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0].map(Boolean),
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0].map(Boolean),
      [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0].map(Boolean),
    ],
  },
];

function playRow(rowIndex: number, beatIndex: number) {
  const row = ROWS[rowIndex];
  if (row.type === "melody") {
    void playPianoNote(MELODY_NOTES[beatIndex % 8], 0.15);
  } else {
    row.play();
  }
}

export default function PatternLab({ lab }: PatternLabProps) {
  const recordActivity = useLabActivity();
  const [pattern, setPattern] = useState<boolean[][]>(
    ROWS.map(() => Array(BEATS).fill(false))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const isPlayingRef = useRef(false);

  const toggleCell = useCallback((rowIndex: number, beatIndex: number) => {
    recordActivity?.(1);
    void playClickSound(400, 0.04);
    setPattern((prev) => {
      const next = prev.map((r, i) =>
        i === rowIndex ? r.map((v, j) => (j === beatIndex ? !v : v)) : r
      );
      return next;
    });
    if (!pattern[rowIndex]![beatIndex]) {
      playRow(rowIndex, beatIndex);
    }
  }, [pattern, recordActivity]);

  const loadPreset = useCallback((preset: typeof PRESETS[0]) => {
    void playClickSound(600, 0.06);
    setPattern(preset.pattern.map((r) => [...r]));
  }, []);

  const playPattern = useCallback(() => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      return;
    }
    isPlayingRef.current = true;
    setIsPlaying(true);

    const interval = 125;
    let beat = 0;
    const loop = () => {
      if (!isPlayingRef.current) return;
      const bi = beat % BEATS;
      setCurrentBeat(bi);

      const p = pattern;
      p.forEach((row, ri) => {
        if (row[bi]) playRow(ri, bi);
      });

      beat++;
      if (isPlayingRef.current) {
        setTimeout(loop, interval);
      } else {
        setCurrentBeat(-1);
        setIsPlaying(false);
      }
    };
    loop();
  }, [pattern]);

  const stopPattern = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentBeat(-1);
  }, []);

  const clearPattern = useCallback(() => {
    void playClickSound(300, 0.04);
    setPattern(ROWS.map(() => Array(BEATS).fill(false)));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-2xl w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
            {lab.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Build beats like a producer</p>
        </motion.div>

        {/* Presets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2"
        >
          {PRESETS.map((preset) => (
            <motion.button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-medium hover:bg-gray-700"
            >
              {preset.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Sequencer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 overflow-x-auto"
        >
          <div className="min-w-[520px] space-y-2">
            {ROWS.map((row, rowIndex) => (
              <div key={row.type} className="flex items-center gap-2">
                <div
                  className={`w-14 h-10 rounded-lg bg-gradient-to-r ${row.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                >
                  {row.label}
                </div>
                <div className="flex gap-1 flex-1">
                  {Array.from({ length: BEATS }).map((_, beatIndex) => (
                    <motion.button
                      key={beatIndex}
                      onClick={() => toggleCell(rowIndex, beatIndex)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      className={`relative h-10 flex-1 min-w-0 rounded-md transition-all ${
                        pattern[rowIndex]?.[beatIndex]
                          ? `bg-gradient-to-r ${row.color}`
                          : "bg-gray-800 hover:bg-gray-750"
                      } ${currentBeat === beatIndex && isPlaying ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-gray-900" : ""}`}
                    >
                      {currentBeat === beatIndex && isPlaying && (
                        <motion.div
                          layoutId="playhead"
                          className="absolute inset-0 rounded-md bg-amber-400/20"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Beat numbers */}
        <div className="flex gap-1 min-w-[520px] px-[4.5rem]">
          {Array.from({ length: BEATS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 text-center text-[10px] ${
                (i + 1) % 4 === 1 ? "text-amber-400" : "text-gray-600"
              }`}
            >
              {(i % 4) + 1}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <motion.button
            onClick={() => (isPlaying ? stopPattern() : playPattern())}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold flex items-center gap-2"
          >
            {isPlaying ? "⏹ Stop" : "▶ Play"}
          </motion.button>
          <motion.button
            onClick={clearPattern}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium"
          >
            Clear
          </motion.button>
        </div>
      </div>
    </div>
  );
}
