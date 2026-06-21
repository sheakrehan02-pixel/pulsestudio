"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playPianoNote, playClickSound, playKick, playSnare, playHiHat, playSuccessSound, playErrorSound } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import { recordLabQuizScore } from "@/lib/sessionProgress";
import type { Lab } from "@/lib/labs";

interface PatternLabProps {
  lab: Lab;
}

type RowType = "kick" | "snare" | "hat" | "melody";
type Mode = "build" | "challenge";

const ROWS: { type: RowType; label: string; color: string; play: () => void }[] = [
  { type: "kick", label: "Kick", color: "from-[#e8b84a] to-[#d4a43a]", play: () => void playKick() },
  { type: "snare", label: "Snare", color: "from-[#d4856a] to-[#c27458]", play: () => void playSnare() },
  { type: "hat", label: "Hi-Hat", color: "from-[#5a9a8e] to-[#4a8578]", play: () => void playHiHat() },
  { type: "melody", label: "Melody", color: "from-[#d4856a] to-[#c27458]", play: () => {} },
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

function patternsMatch(a: boolean[][], b: boolean[][]): boolean {
  for (let r = 0; r < a.length; r++) {
    for (let c = 0; c < BEATS; c++) {
      if (!!a[r]?.[c] !== !!b[r]?.[c]) return false;
    }
  }
  return true;
}

export default function PatternLab({ lab }: PatternLabProps) {
  const recordActivity = useLabActivity();
  const [mode, setMode] = useState<Mode>("build");
  const [pattern, setPattern] = useState<boolean[][]>(
    ROWS.map(() => Array(BEATS).fill(false))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [bpm, setBpm] = useState(120);
  const isPlayingRef = useRef(false);

  const [challengeTarget, setChallengeTarget] = useState<boolean[][] | null>(null);
  const [challengeName, setChallengeName] = useState("");
  const [challengeResult, setChallengeResult] = useState<"correct" | "wrong" | null>(null);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeRound, setChallengeRound] = useState(0);

  const beatInterval = (60 / bpm) * 1000 / 4;

  const toggleCell = useCallback((rowIndex: number, beatIndex: number) => {
    recordActivity?.(1);
    void playClickSound(400, 0.04);
    setPattern((prev) => {
      const next = prev.map((r, i) =>
        i === rowIndex ? r.map((v, j) => (j === beatIndex ? !v : v)) : r
      );
      return next;
    });
    if (!pattern[rowIndex]?.[beatIndex]) {
      playRow(rowIndex, beatIndex);
    }
  }, [pattern, recordActivity]);

  const loadPreset = useCallback((preset: typeof PRESETS[0]) => {
    void playClickSound(600, 0.06);
    setPattern(preset.pattern.map((r) => [...r]));
  }, []);

  const playPattern = useCallback((pat = pattern) => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentBeat(-1);
      return;
    }
    isPlayingRef.current = true;
    setIsPlaying(true);
    recordActivity?.(1);

    let beat = 0;
    const loop = () => {
      if (!isPlayingRef.current) return;
      const bi = beat % BEATS;
      setCurrentBeat(bi);
      pat.forEach((row, ri) => {
        if (row[bi]) playRow(ri, bi);
      });
      beat++;
      setTimeout(loop, beatInterval);
    };
    loop();
  }, [pattern, beatInterval, recordActivity]);

  const startChallenge = useCallback(() => {
    setMode("challenge");
    setChallengeScore(0);
    setChallengeRound(0);
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)]!;
    setChallengeTarget(preset.pattern.map((r) => [...r]));
    setChallengeName(preset.name);
    setPattern(ROWS.map(() => Array(BEATS).fill(false)));
    setChallengeResult(null);
    setTimeout(() => playPattern(preset.pattern.map((r) => [...r])), 500);
  }, [playPattern]);

  const checkChallenge = useCallback(() => {
    if (!challengeTarget) return;
    recordActivity?.(1);
    const correct = patternsMatch(pattern, challengeTarget);
    setChallengeResult(correct ? "correct" : "wrong");

    if (correct) {
      const newScore = challengeScore + 20;
      setChallengeScore(newScore);
      void playSuccessSound();
      const nextRound = challengeRound + 1;
      setChallengeRound(nextRound);
      if (nextRound >= 3) {
        recordLabQuizScore("pattern", Math.min(100, 50 + newScore));
      }
      setTimeout(() => {
        const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)]!;
        setChallengeTarget(preset.pattern.map((r) => [...r]));
        setChallengeName(preset.name);
        setPattern(ROWS.map(() => Array(BEATS).fill(false)));
        setChallengeResult(null);
        setTimeout(() => playPattern(preset.pattern.map((r) => [...r])), 400);
      }, 1500);
    } else {
      void playErrorSound();
    }
  }, [challengeTarget, pattern, challengeScore, challengeRound, recordActivity, playPattern]);

  const clearPattern = useCallback(() => {
    void playClickSound(300, 0.04);
    setPattern(ROWS.map(() => Array(BEATS).fill(false)));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-2xl w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            {lab.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Build beats like a producer — or match patterns in challenge mode
          </p>
        </motion.div>

        <div className="flex gap-2 justify-center">
          {(["build", "challenge"] as Mode[]).map((m) => (
            <motion.button
              key={m}
              onClick={() => (m === "challenge" ? startChallenge() : setMode("build"))}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-full text-sm font-medium capitalize"
              style={{
                background: mode === m ? "var(--accent-amber)" : "var(--bg-elevated)",
                color: mode === m ? "white" : "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {m === "build" ? "Build" : "Challenge"}
            </motion.button>
          ))}
        </div>

        {mode === "build" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <motion.button
                key={preset.name}
                onClick={() => loadPreset(preset)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
              >
                {preset.name}
              </motion.button>
            ))}
          </motion.div>
        )}

        {mode === "challenge" && challengeTarget && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 text-center"
            style={{ background: "var(--accent-amber-soft)", border: "1px solid rgba(232,184,74,0.3)" }}
          >
            <div className="text-sm font-medium" style={{ color: "var(--accent-amber)" }}>
              Round {Math.min(challengeRound + 1, 3)}/3 · Score: {challengeScore}
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Listen to &quot;{challengeName}&quot; then recreate it on the grid
            </p>
            <button
              onClick={() => playPattern(challengeTarget.map((r) => [...r]))}
              className="mt-2 text-xs underline"
              style={{ color: "var(--accent-amber)" }}
            >
              Replay pattern
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 overflow-x-auto"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <div className="min-w-[520px] space-y-2">
            {ROWS.map((row, rowIndex) => (
              <div key={row.type} className="flex items-center gap-2">
                <div className={`w-14 h-10 rounded-lg bg-gradient-to-r ${row.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
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
                        pattern[rowIndex]?.[beatIndex] ? `bg-gradient-to-r ${row.color}` : ""
                      } ${currentBeat === beatIndex && isPlaying ? "ring-2 ring-[var(--accent-amber)]" : ""}`}
                      style={{ background: !pattern[rowIndex]?.[beatIndex] ? "var(--bg-surface)" : undefined }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
            <span>BPM: {bpm}</span>
            <span>{Math.round(beatInterval)}ms per step</span>
          </div>
          <input
            type="range"
            min={60}
            max={180}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full accent-[var(--accent-amber)]"
          />
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          {mode === "build" ? (
            <>
              <motion.button
                onClick={() => playPattern()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl text-white font-bold"
                style={{ background: "linear-gradient(135deg, var(--accent-amber), #d4a43a)" }}
              >
                {isPlaying ? "⏹ Stop" : "▶ Play"}
              </motion.button>
              <motion.button
                onClick={clearPattern}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl font-medium"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
              >
                Clear
              </motion.button>
            </>
          ) : (
            <motion.button
              onClick={checkChallenge}
              disabled={challengeResult !== null}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-xl text-white font-bold"
              style={{ background: "linear-gradient(135deg, var(--accent-teal), #4a8578)" }}
            >
              Check Pattern
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {challengeResult && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm font-medium"
              style={{ color: challengeResult === "correct" ? "var(--accent-teal)" : "var(--accent-coral)" }}
            >
              {challengeResult === "correct"
                ? challengeRound >= 3
                  ? "Challenge complete! Great ear for patterns."
                  : "Perfect match! Next round..."
                : "Not quite — listen again and adjust"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
