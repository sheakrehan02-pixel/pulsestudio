"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playPianoNote, playSuccessSound, playErrorSound, playClickSound } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import { recordLabQuizScore } from "@/lib/sessionProgress";
import type { Lab } from "@/lib/labs";

interface ScalesLabProps {
  lab: Lab;
}

const ROOT = 261.63;

const SCALES = [
  {
    name: "C Major",
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    mood: "Bright and happy",
    color: "from-[#5a9a8e] to-[#6ab09a]",
  },
  {
    name: "A Minor",
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    mood: "Dark and melancholic",
    color: "from-[#d4856a] to-[#c27458]",
  },
  {
    name: "C Pentatonic",
    intervals: [0, 2, 4, 7, 9, 12],
    mood: "Simple and universal",
    color: "from-[#e8b84a] to-[#d4a43a]",
  },
  {
    name: "Blues Scale",
    intervals: [0, 3, 5, 6, 7, 10, 12],
    mood: "Soulful and expressive",
    color: "from-[#4a8578] to-[#5a9a8e]",
  },
];

type Mode = "explore" | "quiz";

function noteFreq(semitones: number) {
  return ROOT * Math.pow(2, semitones / 12);
}

export default function ScalesLab({ lab }: ScalesLabProps) {
  const recordActivity = useLabActivity();
  const [mode, setMode] = useState<Mode>("explore");
  const [activeScale, setActiveScale] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const [quizTarget, setQuizTarget] = useState(0);
  const [quizOptions, setQuizOptions] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [streak, setStreak] = useState(0);

  const scale = SCALES[activeScale]!;

  const playScale = useCallback(async (scaleIndex = activeScale) => {
    const s = SCALES[scaleIndex]!;
    setPlaying(true);
    recordActivity?.(1);
    for (let i = 0; i < s.intervals.length; i++) {
      setHighlighted(i);
      await playPianoNote(noteFreq(s.intervals[i]!), 0.35);
      await new Promise((r) => setTimeout(r, 280));
    }
    setHighlighted(null);
    setPlaying(false);
  }, [activeScale, recordActivity]);

  const newQuizRound = useCallback(() => {
    const target = Math.floor(Math.random() * SCALES.length);
    const others = SCALES.map((_, i) => i).filter((i) => i !== target);
    const shuffled = others.sort(() => Math.random() - 0.5);
    const options = [target, shuffled[0]!, shuffled[1]!].sort(() => Math.random() - 0.5);
    setQuizTarget(target);
    setQuizOptions(options);
    setQuizResult(null);
    setTimeout(() => void playScale(target), 400);
  }, [playScale]);

  const startQuiz = useCallback(() => {
    setMode("quiz");
    setScore(0);
    setRound(0);
    setStreak(0);
    newQuizRound();
  }, [newQuizRound]);

  const handleQuizGuess = useCallback((guess: number) => {
    recordActivity?.(1);
    void playClickSound(500, 0.04);
    const correct = guess === quizTarget;
    setQuizResult(correct ? "correct" : "wrong");

    if (correct) {
      const newScore = score + 10;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      void playSuccessSound();
      const nextRound = round + 1;
      setRound(nextRound);
      if (nextRound >= 5) {
        recordLabQuizScore("scales", Math.min(100, 40 + newScore));
      }
      setTimeout(newQuizRound, 1200);
    } else {
      setStreak(0);
      void playErrorSound();
    }
  }, [recordActivity, quizTarget, score, streak, round, newQuizRound]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-lg w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            {lab.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Hear, play, and identify musical scales
          </p>
        </motion.div>

        <div className="flex gap-2 justify-center">
          {(["explore", "quiz"] as Mode[]).map((m) => (
            <motion.button
              key={m}
              onClick={() => (m === "quiz" ? startQuiz() : setMode("explore"))}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-full text-sm font-medium capitalize"
              style={{
                background: mode === m ? "var(--accent-teal)" : "var(--bg-elevated)",
                color: mode === m ? "white" : "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {m === "explore" ? "Explore" : "Quiz Mode"}
            </motion.button>
          ))}
        </div>

        {mode === "explore" && (
          <>
            <div className="flex flex-wrap gap-2 justify-center">
              {SCALES.map((s, i) => (
                <motion.button
                  key={s.name}
                  onClick={() => { setActiveScale(i); void playClickSound(500, 0.04); }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeScale === i ? "ring-2 ring-white/40" : ""}`}
                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
                >
                  {s.name}
                </motion.button>
              ))}
            </div>

            <motion.div
              key={activeScale}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl p-6"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
            >
              <div className={`text-center mb-4 px-4 py-2 rounded-xl bg-gradient-to-r ${scale.color} text-white font-semibold`}>
                {scale.name}
              </div>
              <p className="text-sm text-center mb-6" style={{ color: "var(--text-muted)" }}>{scale.mood}</p>

              <div className="flex items-end justify-center gap-2 h-32 mb-6">
                {scale.intervals.map((st, i) => (
                  <motion.button
                    key={i}
                    onClick={() => { recordActivity?.(1); void playPianoNote(noteFreq(st), 0.4); }}
                    animate={highlighted === i ? { scale: [1, 1.2, 1] } : {}}
                    className="flex-1 max-w-10 rounded-t-lg"
                    style={{
                      height: `${24 + st * 4}px`,
                      background: highlighted === i
                        ? "linear-gradient(to top, var(--accent-amber), #d4a43a)"
                        : "linear-gradient(to top, var(--accent-teal), #6ab09a)",
                    }}
                  />
                ))}
              </div>

              <motion.button
                onClick={() => void playScale()}
                disabled={playing}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ background: "linear-gradient(135deg, var(--accent-teal), #4a8578)" }}
              >
                {playing ? "Playing..." : "▶ Play Scale"}
              </motion.button>
            </motion.div>
          </>
        )}

        {mode === "quiz" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6 space-y-4"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--accent-teal)" }}>Score: {score}</span>
              <span style={{ color: "var(--accent-amber)" }}>Streak: {streak}</span>
              <span style={{ color: "var(--text-muted)" }}>Round {Math.min(round + 1, 5)}/5</span>
            </div>

            <p className="text-center font-medium" style={{ color: "var(--text-primary)" }}>
              Which scale did you hear?
            </p>

            <motion.button
              onClick={() => void playScale(quizTarget)}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl font-medium"
              style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}
            >
              🔊 Replay Scale
            </motion.button>

            <div className="space-y-2">
              {quizOptions.map((opt) => (
                <motion.button
                  key={opt}
                  onClick={() => quizResult === null && handleQuizGuess(opt)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={quizResult !== null}
                  className="w-full py-3 px-4 rounded-xl text-left font-medium"
                  style={{
                    background:
                      quizResult !== null && opt === quizTarget
                        ? "var(--accent-teal-soft)"
                        : quizResult === "wrong" && opt !== quizTarget
                          ? "var(--bg-surface)"
                          : "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: quizResult !== null && opt === quizTarget
                      ? "1px solid rgba(90,154,142,0.5)"
                      : "1px solid var(--border-subtle)",
                  }}
                >
                  {SCALES[opt]!.name}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {quizResult && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm font-medium"
                  style={{ color: quizResult === "correct" ? "var(--accent-teal)" : "var(--accent-coral)" }}
                >
                  {quizResult === "correct" ? "Correct!" : `It was ${SCALES[quizTarget]!.name}`}
                </motion.p>
              )}
            </AnimatePresence>

            {round >= 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-3">
                <p className="font-semibold" style={{ color: "var(--accent-teal)" }}>
                  Quiz complete! Score: {score}/50
                </p>
                <button
                  onClick={startQuiz}
                  className="text-sm underline"
                  style={{ color: "var(--text-muted)" }}
                >
                  Play again
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
