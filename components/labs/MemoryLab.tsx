"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playPianoNote, playSuccessSound, playErrorSound, playClickSound } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import type { Lab } from "@/lib/labs";

interface MemoryLabProps {
  lab: Lab;
}

const NOTES = [
  { label: "C", freq: 261.63 },
  { label: "D", freq: 293.66 },
  { label: "E", freq: 329.63 },
  { label: "F", freq: 349.23 },
  { label: "G", freq: 392 },
  { label: "A", freq: 440 },
];

type Phase = "idle" | "playing" | "input" | "result";

export default function MemoryLab({ lab }: MemoryLabProps) {
  const recordActivity = useLabActivity();
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(3);
  const [score, setScore] = useState(0);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const playSequence = useCallback(async (seq: number[]) => {
    setPhase("playing");
    for (let i = 0; i < seq.length; i++) {
      const note = NOTES[seq[i]!]!;
      setHighlight(seq[i]!);
      await playPianoNote(note.freq, 0.4);
      await new Promise((r) => setTimeout(r, 500));
      setHighlight(null);
      await new Promise((r) => setTimeout(r, 150));
    }
    setPhase("input");
    setUserInput([]);
  }, []);

  const startRound = useCallback(() => {
    recordActivity?.(1);
    void playClickSound(600, 0.05);
    const len = Math.min(level, 8);
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * NOTES.length));
    setSequence(seq);
    setMessage(null);
    setTimeout(() => void playSequence(seq), 400);
  }, [level, playSequence, recordActivity]);

  const handleNotePress = useCallback(async (index: number) => {
    if (phase !== "input") return;
    recordActivity?.(1);
    setHighlight(index);
    await playPianoNote(NOTES[index]!.freq, 0.35);
    setTimeout(() => setHighlight(null), 200);

    const next = [...userInput, index];
    setUserInput(next);

    const expected = sequence[next.length - 1];
    if (index !== expected) {
      setPhase("result");
      setMessage("Wrong note — try again!");
      void playErrorSound();
      return;
    }

    if (next.length === sequence.length) {
      setPhase("result");
      setScore((s) => s + level * 10);
      setLevel((l) => Math.min(l + 1, 8));
      setMessage(`Level ${level} complete!`);
      void playSuccessSound();
    }
  }, [phase, userInput, sequence, level, recordActivity]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-lg w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            {lab.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Remember and replay the melody
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 text-sm">
          <span style={{ color: "var(--text-muted)" }}>Level: <strong style={{ color: "var(--accent-teal)" }}>{level}</strong></span>
          <span style={{ color: "var(--text-muted)" }}>Score: <strong style={{ color: "var(--accent-amber)" }}>{score}</strong></span>
        </div>

        <motion.div
          className="rounded-3xl p-6"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <div className="grid grid-cols-3 gap-3 mb-6">
            {NOTES.map((note, i) => (
              <motion.button
                key={note.label}
                onClick={() => void handleNotePress(i)}
                disabled={phase === "playing"}
                whileHover={{ scale: phase === "input" ? 1.05 : 1 }}
                whileTap={{ scale: 0.92 }}
                animate={
                  highlight === i
                    ? { scale: 1.1, boxShadow: "0 0 24px rgba(232, 184, 74, 0.5)" }
                    : { scale: 1, boxShadow: "0 0 0px transparent" }
                }
                className="py-6 rounded-2xl text-lg font-bold font-display"
                style={{
                  background:
                    highlight === i
                      ? "linear-gradient(135deg, var(--accent-amber), var(--accent-coral))"
                      : "var(--bg-surface)",
                  color: highlight === i ? "white" : "var(--text-primary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {note.label}
              </motion.button>
            ))}
          </div>

          <div className="flex justify-center">
            <motion.button
              onClick={startRound}
              disabled={phase === "playing"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-xl text-white font-semibold"
              style={{
                background: "linear-gradient(135deg, var(--accent-coral), var(--accent-teal))",
                opacity: phase === "playing" ? 0.6 : 1,
              }}
            >
              {phase === "idle" ? "Start Game" : phase === "playing" ? "Listen..." : "Play Again"}
            </motion.button>
          </div>
        </motion.div>

        {phase === "input" && (
          <div className="flex justify-center gap-2">
            {sequence.map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                animate={{
                  background:
                    i < userInput.length ? "var(--accent-teal)" : "var(--border-subtle)",
                  scale: i < userInput.length ? 1.2 : 1,
                }}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center font-medium"
              style={{ color: "var(--accent-amber)" }}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
