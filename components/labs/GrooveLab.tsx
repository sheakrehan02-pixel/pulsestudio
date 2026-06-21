"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClickSound, playKick, playSnare, playHiHat, playSuccessSound, playErrorSound } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import { recordLabQuizScore } from "@/lib/sessionProgress";
import type { Lab } from "@/lib/labs";

interface GrooveLabProps {
  lab: Lab;
}

type GrooveType = "straight" | "swing" | "syncopated" | "shuffle";
type Mode = "feel" | "quiz";

const GROOVES: { id: GrooveType; name: string; description: string; pattern: boolean[]; swing?: boolean }[] = [
  {
    id: "straight",
    name: "Straight",
    description: "Even eighth notes — rock, pop, EDM",
    pattern: [1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0].map(Boolean),
  },
  {
    id: "swing",
    name: "Swing",
    description: "Long-short pairs — jazz, blues, funk",
    pattern: [1,0,0,1,0,0,1,0, 1,0,0,1,0,0,1,0].map(Boolean),
    swing: true,
  },
  {
    id: "syncopated",
    name: "Syncopated",
    description: "Off-beat emphasis — reggae, ska, Latin",
    pattern: [0,1,0,0,1,0,1,0, 0,1,0,0,1,0,1,0].map(Boolean),
  },
  {
    id: "shuffle",
    name: "Shuffle",
    description: "Triplet feel — blues rock, boogie",
    pattern: [1,0,1,0,0,1,0,1, 1,0,1,0,0,1,0,1].map(Boolean),
    swing: true,
  },
];

const BEATS = 16;

function playGrooveBeat(beatIndex: number, groove: typeof GROOVES[0]) {
  const bi = beatIndex % BEATS;
  if (!groove.pattern[bi]) return;
  if (bi % 4 === 0) void playKick();
  else if (bi % 4 === 2) void playSnare();
  else void playHiHat();
}

export default function GrooveLab({ lab }: GrooveLabProps) {
  const recordActivity = useLabActivity();
  const [mode, setMode] = useState<Mode>("feel");
  const [activeGroove, setActiveGroove] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [bpm, setBpm] = useState(100);
  const isPlayingRef = useRef(false);

  const [quizTarget, setQuizTarget] = useState(0);
  const [quizOptions, setQuizOptions] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const groove = GROOVES[activeGroove]!;

  const playGroove = useCallback((grooveIndex = activeGroove) => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentBeat(-1);
      return;
    }

    const g = GROOVES[grooveIndex]!;
    isPlayingRef.current = true;
    setIsPlaying(true);
    recordActivity?.(1);

    const baseInterval = (60 / bpm) * 1000 / 2;
    let beat = 0;

    const loop = () => {
      if (!isPlayingRef.current) return;
      const bi = beat % BEATS;
      setCurrentBeat(bi);
      playGrooveBeat(bi, g);
      beat++;
      const interval = g.swing && bi % 2 === 1 ? baseInterval * 0.65 : baseInterval * 1.35;
      setTimeout(loop, g.swing ? (bi % 2 === 0 ? baseInterval * 1.35 : baseInterval * 0.65) : baseInterval);
    };
    loop();
  }, [activeGroove, bpm, recordActivity]);

  const newQuizRound = useCallback(() => {
    const target = Math.floor(Math.random() * GROOVES.length);
    const others = GROOVES.map((_, i) => i).filter((i) => i !== target);
    const options = [target, others[0]!, others[1]!].sort(() => Math.random() - 0.5);
    setQuizTarget(target);
    setQuizOptions(options);
    setQuizResult(null);

    isPlayingRef.current = true;
    setIsPlaying(true);
    const g = GROOVES[target]!;
    const baseInterval = (60 / bpm) * 1000 / 2;
    let beat = 0;
    const playLoop = () => {
      if (beat >= BEATS * 2) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setCurrentBeat(-1);
        return;
      }
      const bi = beat % BEATS;
      setCurrentBeat(bi);
      playGrooveBeat(bi, g);
      beat++;
      setTimeout(playLoop, g.swing ? (bi % 2 === 0 ? baseInterval * 1.35 : baseInterval * 0.65) : baseInterval);
    };
    playLoop();
  }, [bpm]);

  const startQuiz = useCallback(() => {
    setMode("quiz");
    setScore(0);
    setRound(0);
    newQuizRound();
  }, [newQuizRound]);

  const handleQuizGuess = useCallback((guess: number) => {
    recordActivity?.(1);
    void playClickSound(500, 0.04);
    const correct = guess === quizTarget;
    setQuizResult(correct ? "correct" : "wrong");

    if (correct) {
      const newScore = score + 10;
      setScore(newScore);
      void playSuccessSound();
      const nextRound = round + 1;
      setRound(nextRound);
      if (nextRound >= 5) {
        recordLabQuizScore("groove", Math.min(100, 40 + newScore));
      }
      setTimeout(newQuizRound, 1400);
    } else {
      void playErrorSound();
    }
  }, [recordActivity, quizTarget, score, round, newQuizRound]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-lg w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            {lab.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Feel the difference between straight, swing, and syncopated grooves
          </p>
        </motion.div>

        <div className="flex gap-2 justify-center">
          {(["feel", "quiz"] as Mode[]).map((m) => (
            <motion.button
              key={m}
              onClick={() => (m === "quiz" ? startQuiz() : setMode("feel"))}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-full text-sm font-medium capitalize"
              style={{
                background: mode === m ? "var(--accent-teal)" : "var(--bg-elevated)",
                color: mode === m ? "white" : "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {m === "feel" ? "Feel Grooves" : "Identify Groove"}
            </motion.button>
          ))}
        </div>

        {mode === "feel" && (
          <>
            <div className="flex flex-wrap gap-2 justify-center">
              {GROOVES.map((g, i) => (
                <motion.button
                  key={g.id}
                  onClick={() => { setActiveGroove(i); void playClickSound(500, 0.04); }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeGroove === i ? "ring-2 ring-[var(--accent-teal)]" : ""}`}
                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
                >
                  {g.name}
                </motion.button>
              ))}
            </div>

            <motion.div
              className="rounded-3xl p-6 space-y-4"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="text-center">
                <div className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>{groove.name}</div>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{groove.description}</p>
              </div>

              <div className="flex gap-1">
                {Array.from({ length: BEATS }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded-md transition-all ${
                      groove.pattern[i]
                        ? "bg-gradient-to-t from-[var(--accent-teal)] to-[#6ab09a]"
                        : ""
                    } ${currentBeat === i && isPlaying ? "ring-2 ring-[var(--accent-amber)] scale-110" : ""}`}
                    style={{ background: !groove.pattern[i] ? "var(--bg-surface)" : undefined }}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>BPM: {bpm}</span>
                  <span>{groove.swing ? "Swing feel" : "Straight feel"}</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={160}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-[var(--accent-teal)]"
                />
              </div>

              <motion.button
                onClick={() => playGroove()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ background: "linear-gradient(135deg, var(--accent-teal), #4a8578)" }}
              >
                {isPlaying ? "⏹ Stop" : "▶ Play Groove"}
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
              <span style={{ color: "var(--text-muted)" }}>Round {Math.min(round + 1, 5)}/5</span>
            </div>

            <div className="flex gap-1 h-6">
              {Array.from({ length: BEATS }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${currentBeat === i ? "bg-[var(--accent-amber)]" : "var(--bg-surface)"}`}
                />
              ))}
            </div>

            <p className="text-center font-medium" style={{ color: "var(--text-primary)" }}>
              What type of groove is this?
            </p>

            <motion.button
              onClick={newQuizRound}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl font-medium"
              style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}
            >
              🔊 Replay Groove
            </motion.button>

            <div className="space-y-2">
              {quizOptions.map((opt) => (
                <motion.button
                  key={opt}
                  onClick={() => quizResult === null && handleQuizGuess(opt)}
                  whileHover={{ scale: 1.01 }}
                  disabled={quizResult !== null}
                  className="w-full py-3 px-4 rounded-xl text-left font-medium"
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {GROOVES[opt]!.name} — {GROOVES[opt]!.description.split("—")[0]?.trim()}
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
                  {quizResult === "correct" ? "Nice groove recognition!" : `It was ${GROOVES[quizTarget]!.name}`}
                </motion.p>
              )}
            </AnimatePresence>

            {round >= 5 && (
              <div className="text-center">
                <p className="font-semibold" style={{ color: "var(--accent-teal)" }}>Quiz done! Score: {score}/50</p>
                <button onClick={startQuiz} className="text-sm underline mt-2" style={{ color: "var(--text-muted)" }}>
                  Play again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
