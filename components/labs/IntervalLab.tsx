"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playPianoNote, playSuccessSound, playErrorSound, playClickSound } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import { recordLabQuizScore } from "@/lib/sessionProgress";
import type { Lab } from "@/lib/labs";

interface IntervalLabProps {
  lab: Lab;
}

const INTERVALS = [
  { name: "Minor 2nd", semitones: 1, symbol: "m2" },
  { name: "Major 2nd", semitones: 2, symbol: "M2" },
  { name: "Minor 3rd", semitones: 3, symbol: "m3" },
  { name: "Major 3rd", semitones: 4, symbol: "M3" },
  { name: "Perfect 4th", semitones: 5, symbol: "P4" },
  { name: "Perfect 5th", semitones: 7, symbol: "P5" },
  { name: "Octave", semitones: 12, symbol: "P8" },
];

const ROOT_FREQ = 261.63;

function freqFromSemitones(semitones: number) {
  return ROOT_FREQ * Math.pow(2, semitones / 12);
}

export default function IntervalLab({ lab }: IntervalLabProps) {
  const recordActivity = useLabActivity();
  const [target, setTarget] = useState(INTERVALS[3]!);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [playing, setPlaying] = useState(false);

  const playInterval = useCallback(async (interval = target) => {
    setPlaying(true);
    recordActivity?.(1);
    await playPianoNote(ROOT_FREQ, 0.5);
    await new Promise((r) => setTimeout(r, 600));
    await playPianoNote(freqFromSemitones(interval.semitones), 0.5);
    setPlaying(false);
  }, [recordActivity, target]);

  const newRound = useCallback(() => {
    const next = INTERVALS[Math.floor(Math.random() * INTERVALS.length)]!;
    setTarget(next);
    setSelected(null);
    setResult(null);
    setTimeout(() => void playInterval(next), 300);
  }, [playInterval]);

  const handleGuess = useCallback((name: string) => {
    recordActivity?.(1);
    void playClickSound(500, 0.04);
    setSelected(name);
    const correct = name === target.name;
    setResult(correct ? "correct" : "wrong");
    if (correct) {
      setScore((s) => {
        const next = s + 10;
        if (next % 50 === 0) recordLabQuizScore("intervals", Math.min(100, 30 + next));
        return next;
      });
      setStreak((s) => s + 1);
      void playSuccessSound();
      setTimeout(newRound, 1200);
    } else {
      setStreak(0);
      void playErrorSound();
    }
  }, [recordActivity, target, newRound]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-lg w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            {lab.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Train your ear to hear note distances
          </p>
        </motion.div>

        <motion.div
          className="rounded-3xl p-8 flex flex-col items-center gap-4"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          animate={playing ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-end gap-3 h-24">
            {[0, target.semitones].map((st, i) => (
              <motion.div
                key={i}
                className="w-12 rounded-t-lg"
                style={{
                  height: `${30 + st * 5}px`,
                  background: i === 0
                    ? "linear-gradient(to top, var(--accent-teal), #6ab09a)"
                    : "linear-gradient(to top, var(--accent-coral), #e69a80)",
                }}
                animate={playing ? { scaleY: [1, 1.3, 1] } : {}}
                transition={{ delay: i * 0.5, duration: 0.4 }}
              />
            ))}
          </div>

          <motion.button
            onClick={() => void playInterval()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={playing}
            className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, var(--accent-coral), #c27458)" }}
          >
            {playing ? "Playing..." : "▶ Play Interval"}
          </motion.button>

          <motion.button
            onClick={newRound}
            whileTap={{ scale: 0.95 }}
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            New interval →
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-2 gap-2">
          {INTERVALS.map((interval) => (
            <motion.button
              key={interval.name}
              onClick={() => handleGuess(interval.name)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background:
                  selected === interval.name
                    ? result === "correct" && interval.name === target.name
                      ? "rgba(90, 154, 142, 0.3)"
                      : result === "wrong" && interval.name === selected
                        ? "rgba(212, 133, 106, 0.3)"
                        : "var(--accent-teal-soft)"
                    : "var(--bg-elevated)",
                border: `1px solid ${
                  selected === interval.name ? "var(--accent-teal)" : "var(--border-subtle)"
                }`,
                color: "var(--text-primary)",
              }}
            >
              <span className="font-mono text-xs mr-1" style={{ color: "var(--accent-amber)" }}>
                {interval.symbol}
              </span>
              {interval.name}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {result === "wrong" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm"
              style={{ color: "var(--accent-coral)" }}
            >
              That was a {target.name}. Listen again!
            </motion.p>
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
