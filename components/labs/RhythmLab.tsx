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
              className="absolute w-4 h-4 rounded-full"
              style={{ background: "var(--accent-teal)" }}
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
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-[var(--text-primary)]">
            {lab.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{lab.description}</p>
        </motion.div>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 p-1 rounded-xl"
          style={{ background: "var(--bg-elevated)" }}
        >
          {(["free", "copy"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === "free") setCopyPattern(null);
              }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={mode === m ? { background: "var(--accent-teal-soft)", color: "var(--accent-teal)" } : { color: "var(--text-muted)" }}
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
                className="px-3 py-2 rounded-lg text-xs transition-colors"
                style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}
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
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: "rgba(90, 154, 142, 0.35)", padding: `${r * 12}%` }}
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
            className="absolute inset-[20%] rounded-full flex flex-col items-center justify-center font-bold text-lg transition-colors"
            style={
              accuracy === "perfect"
                ? { background: "var(--accent-teal)", opacity: 0.9 }
                : accuracy === "close"
                  ? { background: "var(--accent-amber)", opacity: 0.9 }
                  : accuracy === "off"
                    ? { background: "var(--accent-coral)", opacity: 0.7 }
                    : { background: "linear-gradient(135deg, var(--accent-teal), #4a8578)" }
            }
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
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ background: "var(--bg-elevated)" }}
          >
            −
          </motion.button>
          <span className="text-2xl font-mono tabular-nums w-16 text-center" style={{ color: "var(--accent-teal)" }}>{bpm}</span>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              void playClickSound(500, 0.03);
              setBpm((b) => Math.min(180, b + 10));
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ background: "var(--bg-elevated)" }}
          >
            +
          </motion.button>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>BPM</span>
        </div>

        <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
          Space to tap · {taps.length} taps
        </p>
      </div>
    </div>
  );
}
