"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClickSound, playSuccessSound, playErrorSound } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import type { Lab } from "@/lib/labs";

type Mode = "free" | "copy";
type Accuracy = "perfect" | "close" | "off" | null;

interface RhythmLabProps {
  lab: Lab;
}

// Rhythms: 1 = hit, 0 = rest. 4 beats per bar, 8 subdivisions = 32 slots.
const RHYTHM_PATTERNS: { name: string; pattern: number[] }[] = [
  { name: "Four on the Floor", pattern: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
  { name: "Eighth Notes", pattern: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] },
  { name: "Syncopation", pattern: [1,0,0,1, 0,1,0,0, 1,0,1,0, 0,0,1,0] },
  { name: "Hip-Hop", pattern: [1,0,1,0, 0,1,0,1, 1,0,0,1, 0,1,1,0] },
];

export default function RhythmLab({ lab }: RhythmLabProps) {
  const recordActivity = useLabActivity();
  const [mode, setMode] = useState<Mode>("free");
  const [isActive, setIsActive] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [taps, setTaps] = useState<number[]>([]);
  const [accuracy, setAccuracy] = useState<Accuracy>(null);
  const [streak, setStreak] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const [particles, setParticles] = useState<{ id: number }[]>([]);
  const [copyPattern, setCopyPattern] = useState<number[] | null>(null);
  const [copyIndex, setCopyIndex] = useState(0);
  const [copyUserInput, setCopyUserInput] = useState<number[]>([]);
  const metronomeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBeatRef = useRef(0);
  const beatIntervalMs = (60 / bpm) * 1000;
  const particleIdRef = useRef(0);

  const addParticle = useCallback(() => {
    const id = ++particleIdRef.current;
    setParticles((p) => [...p.slice(-12), { id }]);
    setTimeout(() => setParticles((p) => p.filter((pt) => pt.id !== id)), 600);
  }, []);

  const startMetronome = useCallback(() => {
    if (metronomeRef.current) clearInterval(metronomeRef.current);
    lastBeatRef.current = Date.now();
    void playClickSound(900, 0.08);
    setPulseScale(1.15);
    metronomeRef.current = setInterval(() => {
      lastBeatRef.current = Date.now();
      void playClickSound(900, 0.08);
      setPulseScale(1.15);
    }, beatIntervalMs);
  }, [bpm, beatIntervalMs]);

  const stopMetronome = useCallback(() => {
    if (metronomeRef.current) {
      clearInterval(metronomeRef.current);
      metronomeRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      startMetronome();
      return stopMetronome;
    }
  }, [bpm, isActive, startMetronome, stopMetronome]);

  useEffect(() => {
    if (pulseScale > 1) {
      const t = setTimeout(() => setPulseScale(1), 100);
      return () => clearTimeout(t);
    }
  }, [pulseScale]);

  const evaluateTap = useCallback(() => {
    const now = Date.now();
    const elapsed = Math.abs(now - lastBeatRef.current);
    const tol = beatIntervalMs * 0.25;
    if (elapsed < tol) {
      setAccuracy("perfect");
      setStreak((s) => s + 1);
      void playSuccessSound();
      return "perfect";
    }
    if (elapsed < tol * 2) {
      setAccuracy("close");
      setStreak(0);
      void playClickSound(600, 0.08);
      return "close";
    }
    setAccuracy("off");
    setStreak(0);
    void playErrorSound();
    return "off";
  }, [beatIntervalMs]);

  const handleTap = useCallback(() => {
    if (!isActive) {
      setMode("free");
      setCopyPattern(null);
      setCopyUserInput([]);
      setCopyIndex(0);
      startMetronome();
      setIsActive(true);
      setTaps([]);
      setStreak(0);
      return;
    }

    if (mode === "copy" && copyPattern) {
      const res = evaluateTap();
      setCopyUserInput((u) => [...u, copyPattern[copyIndex] ?? 0]);
      setCopyIndex((i) => Math.min(i + 1, copyPattern.length - 1));
      if (res === "perfect") addParticle();
      recordActivity?.(1);
      setTimeout(() => setAccuracy(null), 400);
      return;
    }

    const res = evaluateTap();
    setTaps((t) => [...t, Date.now()]);
    if (res === "perfect") addParticle();
    recordActivity?.(1);
    setTimeout(() => setAccuracy(null), 400);
  }, [isActive, mode, copyPattern, copyIndex, evaluateTap, addParticle, recordActivity, startMetronome]);

  const startCopyMode = (pattern: number[]) => {
    setMode("copy");
    setCopyPattern(pattern);
    setCopyIndex(0);
    setCopyUserInput([]);
    if (!isActive) {
      setIsActive(true);
      startMetronome();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleTap]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24 relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <AnimatePresence>
          {particles.map(({ id }) => (
            <motion.div
              key={id}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute w-4 h-4 rounded-full bg-cyan-400"
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-lg w-full space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            {lab.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{lab.description}</p>
        </motion.div>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 p-1 bg-gray-900/80 rounded-xl"
        >
          {(["free", "copy"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === "free") setCopyPattern(null);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m ? "bg-cyan-500/30 text-cyan-300" : "text-gray-500"
              }`}
            >
              {m === "free" ? "Free Tap" : "Copy Rhythm"}
            </button>
          ))}
        </motion.div>

        {mode === "copy" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-wrap gap-2"
          >
            {RHYTHM_PATTERNS.map(({ name, pattern }) => (
              <motion.button
                key={name}
                onClick={() => startCopyMode(pattern)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 bg-gray-800 rounded-lg text-xs text-gray-300 hover:bg-gray-700"
              >
                {name}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Pulse visualization */}
        <motion.div
          className="relative aspect-square max-w-[280px] mx-auto"
          animate={{ scale: pulseScale }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {[1, 2, 3, 4].map((r) => (
            <motion.div
              key={r}
              className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
              style={{ padding: `${r * 12}%` }}
              animate={
                isActive
                  ? {
                      scale: [1, 1.02, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }
                  : {}
              }
              transition={{ duration: beatIntervalMs / 1000, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          <motion.button
            onClick={handleTap}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={`absolute inset-[20%] rounded-full flex flex-col items-center justify-center font-bold text-lg transition-colors ${
              accuracy === "perfect"
                ? "bg-emerald-500/80"
                : accuracy === "close"
                  ? "bg-amber-500/80"
                  : accuracy === "off"
                    ? "bg-red-500/50"
                    : "bg-gradient-to-br from-blue-500 to-cyan-500"
            }`}
          >
            {isActive ? "TAP" : "START"}
            {streak >= 3 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs mt-1"
              >
                {streak}× combo!
              </motion.span>
            )}
          </motion.button>
        </motion.div>

        {/* BPM */}
        <div className="flex items-center justify-center gap-3">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              void playClickSound(500, 0.03);
              setBpm((b) => Math.max(60, b - 10));
            }}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl"
          >
            −
          </motion.button>
          <span className="text-2xl font-mono tabular-nums text-cyan-400 w-16 text-center">{bpm}</span>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              void playClickSound(500, 0.03);
              setBpm((b) => Math.min(180, b + 10));
            }}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl"
          >
            +
          </motion.button>
          <span className="text-gray-500 text-sm">BPM</span>
        </div>

        <p className="text-center text-gray-600 text-xs">
          Space to tap · {taps.length} taps
        </p>
      </div>
    </div>
  );
}
