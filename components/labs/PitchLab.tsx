"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playPianoNote } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import type { Lab } from "@/lib/labs";

interface PitchLabProps {
  lab: Lab;
}

type Mode = "explore" | "find";

const PIANO_KEYS = [
  { note: "C", frequency: 261.63, isSharp: false },
  { note: "C#", frequency: 277.18, isSharp: true },
  { note: "D", frequency: 293.66, isSharp: false },
  { note: "D#", frequency: 311.13, isSharp: true },
  { note: "E", frequency: 329.63, isSharp: false },
  { note: "F", frequency: 349.23, isSharp: false },
  { note: "F#", frequency: 369.99, isSharp: true },
  { note: "G", frequency: 392, isSharp: false },
  { note: "G#", frequency: 415.3, isSharp: true },
  { note: "A", frequency: 440, isSharp: false },
  { note: "A#", frequency: 466.16, isSharp: true },
  { note: "B", frequency: 493.88, isSharp: false },
  { note: "C5", frequency: 523.25, isSharp: false },
];

const WHITE_INDICES = [0, 2, 4, 5, 7, 9, 11, 12];
const WHITE_KEY_WIDTH = 48;
const BLACK_KEY_WIDTH = 32;
const WHITE_KEY_HEIGHT = 180;
const BLACK_KEY_HEIGHT = 110;

export default function PitchLab({ lab }: PitchLabProps) {
  const recordActivity = useLabActivity();
  const [mode, setMode] = useState<Mode>("explore");
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [targetNote, setTargetNote] = useState<typeof PIANO_KEYS[0] | null>(null);
  const [hue, setHue] = useState(280);
  const [found, setFound] = useState<boolean | null>(null);

  const handleKeyPress = useCallback(
    (note: string, frequency: number) => {
      recordActivity?.(1);
      void playPianoNote(frequency, 0.4);
      setLastPlayed(note);
      setActiveKeys((prev) => new Set([...prev, note]));
      setHue(280 + (frequency - 261) * 2);
      setTimeout(() => setActiveKeys((prev) => {
        const n = new Set(prev);
        n.delete(note);
        return n;
      }), 280);

      if (mode === "find" && targetNote) {
        const key = PIANO_KEYS.find((k) => k.note === note);
        if (key && Math.abs(key.frequency - targetNote.frequency) < 1) {
          setFound(true);
          setTimeout(() => {
            const next = PIANO_KEYS[Math.floor(Math.random() * PIANO_KEYS.length)]!;
            setTargetNote(next);
            setFound(null);
            void playPianoNote(next.frequency, 0.5);
          }, 800);
        } else {
          setFound(false);
          setTimeout(() => setFound(null), 600);
        }
      }
    },
    [recordActivity, mode, targetNote]
  );

  const startFindMode = useCallback(() => {
    setMode("find");
    const next = PIANO_KEYS[Math.floor(Math.random() * PIANO_KEYS.length)]!;
    setTargetNote(next);
    setFound(null);
    setTimeout(() => void playPianoNote(next.frequency, 0.6), 300);
  }, []);

  useEffect(() => {
    const map: Record<string, { note: string; frequency: number }> = {};
    "asdfghjklzxcvbnm".split("").forEach((k, i) => {
      const w = PIANO_KEYS[WHITE_INDICES[i]];
      if (w) map[k] = { note: w.note, frequency: w.frequency };
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const m = map[e.key.toLowerCase()];
      if (m) {
        e.preventDefault();
        handleKeyPress(m.note, m.frequency);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleKeyPress]);

  const whiteKeys = PIANO_KEYS.filter((k) => !k.isSharp);
  const blackKeys = PIANO_KEYS.filter((k) => k.isSharp);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 pb-24 transition-colors duration-300"
      style={{
        background: `linear-gradient(180deg, hsl(${hue} 30% 6%) 0%, hsl(${hue} 25% 4%) 100%)`,
      }}
    >
      <div className="w-full max-w-lg space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
            {lab.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{lab.description}</p>
        </motion.div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode("explore")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium ${
              mode === "explore" ? "bg-purple-500/30 text-purple-300" : "bg-gray-800 text-gray-500"
            }`}
          >
            Explore
          </button>
          <motion.button
            onClick={startFindMode}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 rounded-xl text-sm font-medium bg-pink-500/20 text-pink-300 border border-pink-500/30"
          >
            Find the Note
          </motion.button>
        </div>

        {mode === "find" && targetNote && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/60 border border-purple-500/20"
          >
            <span className="text-gray-400">Listen, then find:</span>
            <AnimatePresence mode="wait">
              {found === true ? (
                <motion.span
                  key="correct"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-emerald-400 font-bold"
                >
                  ✓ Correct!
                </motion.span>
              ) : found === false ? (
                <motion.span
                  key="wrong"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-rose-400"
                >
                  Try again
                </motion.span>
              ) : (
                <motion.span
                  key="target"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-mono font-bold text-purple-300"
                >
                  {targetNote.note}
                </motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={() => void playPianoNote(targetNote.frequency, 0.5)}
              className="px-3 py-1 rounded-lg bg-purple-500/30 text-sm"
            >
              🔊 Play
            </button>
          </motion.div>
        )}

        {/* Piano - fixed dimensions for equal keys */}
        <div className="flex justify-center overflow-x-auto">
          <div
            className="relative"
            style={{
              width: whiteKeys.length * WHITE_KEY_WIDTH,
              height: WHITE_KEY_HEIGHT,
            }}
          >
            {/* White keys - all equal width */}
            <div className="flex border border-gray-300 rounded-b-lg overflow-hidden">
              {whiteKeys.map((key) => {
                const isActive = activeKeys.has(key.note);
                const isLast = lastPlayed === key.note;
                const isTarget = mode === "find" && targetNote?.note === key.note && found === null;
                return (
                  <motion.button
                    key={key.note}
                    onClick={() => handleKeyPress(key.note, key.frequency)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      backgroundColor: isActive || isLast
                        ? "rgba(192, 132, 252, 0.5)"
                        : isTarget
                          ? "rgba(251, 113, 133, 0.2)"
                          : "rgb(250, 250, 250)",
                    }}
                    className="flex flex-col justify-end items-center pb-2 border-r border-gray-300 last:border-r-0 touch-manipulation"
                    style={{
                      width: WHITE_KEY_WIDTH,
                      height: WHITE_KEY_HEIGHT,
                    }}
                  >
                    <span className="text-xs font-semibold text-gray-600">{key.note}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Black keys - positioned between white keys */}
            {blackKeys.map((key) => {
              const keyIdx = PIANO_KEYS.findIndex((k) => k.note === key.note);
              let whiteCount = 0;
              for (let i = 0; i < keyIdx; i++) {
                if (!PIANO_KEYS[i]!.isSharp) whiteCount++;
              }
              // Center black key in the gap between white keys
              const left = whiteCount * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
              const isActive = activeKeys.has(key.note);
              return (
                <motion.button
                  key={key.note}
                  onClick={() => handleKeyPress(key.note, key.frequency)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ backgroundColor: isActive ? "rgba(180, 80, 180, 0.9)" : "rgb(30, 30, 30)" }}
                  className="absolute z-10 flex flex-col justify-end items-center pb-1 rounded-b-md touch-manipulation"
                  style={{
                    left,
                    top: 0,
                    width: BLACK_KEY_WIDTH,
                    height: BLACK_KEY_HEIGHT,
                  }}
                >
                  <span className="text-[10px] font-medium text-white/90">{key.note}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs">A S D F G H J K L · White keys</p>
      </div>
    </div>
  );
}
