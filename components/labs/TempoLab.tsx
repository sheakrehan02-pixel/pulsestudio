"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClickSound, playSuccessSound, playErrorSound } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import type { Lab } from "@/lib/labs";

interface TempoLabProps {
  lab: Lab;
}

type Mode = "match" | "compare" | "tap";

const TEMPO_PRESETS = [
  { name: "Largo", bpm: 60, desc: "Slow & broad" },
  { name: "Andante", bpm: 80, desc: "Walking pace" },
  { name: "Moderato", bpm: 100, desc: "Moderate" },
  { name: "Allegro", bpm: 120, desc: "Fast & lively" },
  { name: "Presto", bpm: 160, desc: "Very fast" },
];

export default function TempoLab({ lab }: TempoLabProps) {
  const recordActivity = useLabActivity();
  const [mode, setMode] = useState<Mode>("match");
  const [targetBpm, setTargetBpm] = useState(100);
  const [userBpm, setUserBpm] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pulse, setPulse] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const tapTimes = useRef<number[]>([]);
  const metronomeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playMetronome = useCallback((bpm: number) => {
    if (metronomeRef.current) clearInterval(metronomeRef.current);
    setIsPlaying(true);
    const interval = (60 / bpm) * 1000;
    void playClickSound(900, 0.08);
    setPulse(1.2);
    metronomeRef.current = setInterval(() => {
      void playClickSound(800, 0.08);
      setPulse(1.2);
      setTimeout(() => setPulse(1), 100);
    }, interval);
  }, []);

  const stopMetronome = useCallback(() => {
    if (metronomeRef.current) {
      clearInterval(metronomeRef.current);
      metronomeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const newTarget = useCallback(() => {
    const preset = TEMPO_PRESETS[Math.floor(Math.random() * TEMPO_PRESETS.length)]!;
    setTargetBpm(preset.bpm);
    setUserBpm(null);
    setFeedback(null);
    tapTimes.current = [];
    return preset;
  }, []);

  const handleTap = useCallback(() => {
    recordActivity?.(1);
    void playClickSound(600, 0.05);
    const now = Date.now();
    tapTimes.current.push(now);
    if (tapTimes.current.length > 8) tapTimes.current.shift();

    if (tapTimes.current.length >= 3) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimes.current.length; i++) {
        intervals.push(tapTimes.current[i]! - tapTimes.current[i - 1]!);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avg);
      setUserBpm(bpm);

      const diff = Math.abs(bpm - targetBpm);
      if (diff <= 5) {
        setScore((s) => s + 10);
        setStreak((s) => s + 1);
        setFeedback("Perfect tempo match!");
        void playSuccessSound();
      } else if (diff <= 15) {
        setFeedback(`Close! Target: ${targetBpm} BPM, yours: ${bpm}`);
      } else {
        setStreak(0);
        setFeedback(`Target: ${targetBpm} BPM — keep tapping`);
        void playErrorSound();
      }
    }
  }, [recordActivity, targetBpm]);

  const startMatchRound = useCallback(() => {
    const preset = newTarget();
    stopMetronome();
    setTimeout(() => {
      playMetronome(preset.bpm);
      setTimeout(stopMetronome, 4000);
    }, 500);
  }, [newTarget, playMetronome, stopMetronome]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-lg w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            {lab.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Feel the pulse — master speed and timing
          </p>
        </motion.div>

        <div className="flex gap-2 justify-center">
          {(["match", "compare", "tap"] as Mode[]).map((m) => (
            <motion.button
              key={m}
              onClick={() => { setMode(m); stopMetronome(); }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full text-sm font-medium capitalize"
              style={{
                background: mode === m ? "var(--accent-teal)" : "var(--bg-elevated)",
                color: mode === m ? "white" : "var(--text-secondary)",
                border: `1px solid ${mode === m ? "var(--accent-teal)" : "var(--border-subtle)"}`,
              }}
            >
              {m === "match" ? "Match BPM" : m === "compare" ? "Compare" : "Free Tap"}
            </motion.button>
          ))}
        </div>

        <motion.div
          className="relative rounded-3xl p-8 flex flex-col items-center"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          animate={{ scale: pulse }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <div className="text-6xl font-display font-bold mb-2" style={{ color: "var(--accent-teal)" }}>
            {mode === "tap" ? (userBpm ?? "—") : targetBpm}
          </div>
          <div className="text-sm uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            BPM
          </div>

          {mode === "match" && (
            <motion.button
              onClick={startMatchRound}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-6 py-3 rounded-xl text-white font-semibold"
              style={{ background: "linear-gradient(135deg, var(--accent-teal), #4a8578)" }}
            >
              {isPlaying ? "Listening..." : "New Round"}
            </motion.button>
          )}

          {mode === "compare" && (
            <div className="mt-6 flex gap-3">
              {TEMPO_PRESETS.slice(0, 3).map((p) => (
                <motion.button
                  key={p.name}
                  onClick={() => { recordActivity?.(1); playMetronome(p.bpm); setTimeout(stopMetronome, 3000); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 rounded-xl text-center"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
                >
                  <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.name}</div>
                  <div className="text-xs" style={{ color: "var(--accent-teal)" }}>{p.bpm}</div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {(mode === "match" || mode === "tap") && (
          <motion.button
            onClick={mode === "match" ? handleTap : () => {
              recordActivity?.(1);
              const now = Date.now();
              tapTimes.current.push(now);
              if (tapTimes.current.length >= 2) {
                const avg = tapTimes.current.slice(-4).reduce((acc, t, i, arr) => {
                  if (i === 0) return acc;
                  return acc + (t - arr[i - 1]!);
                }, 0) / (Math.min(tapTimes.current.length, 4) - 1);
                setUserBpm(Math.round(60000 / avg));
              }
              void playClickSound(700, 0.06);
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.92 }}
            className="w-full py-6 rounded-2xl text-xl font-bold text-white"
            style={{
              background: "linear-gradient(135deg, var(--accent-teal), var(--accent-amber))",
              boxShadow: "0 8px 32px rgba(90, 154, 142, 0.3)",
            }}
          >
            TAP
          </motion.button>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm font-medium"
              style={{ color: "var(--accent-amber)" }}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center gap-6 text-sm">
          <span style={{ color: "var(--text-muted)" }}>Score: <strong style={{ color: "var(--accent-teal)" }}>{score}</strong></span>
          <span style={{ color: "var(--text-muted)" }}>Streak: <strong style={{ color: "var(--accent-amber)" }}>{streak}</strong></span>
        </div>
      </div>
    </div>
  );
}
