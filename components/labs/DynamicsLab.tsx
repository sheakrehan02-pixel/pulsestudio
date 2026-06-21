"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { playDynamicNote, playClickSound, playPianoNote } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import type { Lab } from "@/lib/labs";

interface DynamicsLabProps {
  lab: Lab;
}

type DynamicType = "pp" | "p" | "mp" | "mf" | "f" | "ff";

const DYNAMICS: { id: DynamicType; label: string; volume: number; desc: string }[] = [
  { id: "pp", label: "pp", volume: 0.05, desc: "Pianissimo — very soft" },
  { id: "p", label: "p", volume: 0.12, desc: "Piano — soft" },
  { id: "mp", label: "mp", volume: 0.2, desc: "Mezzo-piano — moderately soft" },
  { id: "mf", label: "mf", volume: 0.35, desc: "Mezzo-forte — moderately loud" },
  { id: "f", label: "f", volume: 0.55, desc: "Forte — loud" },
  { id: "ff", label: "ff", volume: 0.8, desc: "Fortissimo — very loud" },
];

export default function DynamicsLab({ lab }: DynamicsLabProps) {
  const recordActivity = useLabActivity();
  const [selected, setSelected] = useState<DynamicType>("mf");
  const [mode, setMode] = useState<"explore" | "crescendo" | "quiz">("explore");
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(32).fill(0.2));
  const [quizTarget, setQuizTarget] = useState(DYNAMICS[3]!);
  const [quizScore, setQuizScore] = useState(0);
  const animRef = useRef<number | null>(null);

  const animateWave = useCallback((volume: number) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    let frame = 0;
    const animate = () => {
      frame++;
      setWaveHeights(
        Array.from({ length: 32 }, (_, i) => {
          const base = volume * (0.5 + Math.sin(frame * 0.08 + i * 0.4) * 0.5);
          return Math.max(0.05, base);
        })
      );
      if (frame < 60) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  }, []);

  const playDynamic = useCallback(async (dyn: typeof DYNAMICS[0]) => {
    recordActivity?.(1);
    void playClickSound(400 + dyn.volume * 400, 0.04);
    animateWave(dyn.volume);
    await playPianoNote(440, 0.6 * dyn.volume + 0.2);
  }, [recordActivity, animateWave]);

  const playCrescendo = useCallback(async () => {
    recordActivity?.(1);
    void playDynamicNote(392, 0.05, 0.7, 2);
    let frame = 0;
    const animate = () => {
      frame++;
      const vol = 0.05 + (frame / 120) * 0.75;
      setWaveHeights(
        Array.from({ length: 32 }, (_, i) =>
          vol * (0.5 + Math.sin(frame * 0.06 + i * 0.3) * 0.5)
        )
      );
      if (frame < 120) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  }, [recordActivity]);

  const startQuiz = useCallback(() => {
    const target = DYNAMICS[Math.floor(Math.random() * DYNAMICS.length)]!;
    setQuizTarget(target);
    setTimeout(() => void playDynamic(target), 400);
  }, [playDynamic]);

  const handleQuizGuess = useCallback((dyn: typeof DYNAMICS[0]) => {
    recordActivity?.(1);
    if (dyn.id === quizTarget.id) {
      setQuizScore((s) => s + 1);
      setTimeout(startQuiz, 800);
    }
  }, [recordActivity, quizTarget, startQuiz]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const current = DYNAMICS.find((d) => d.id === selected)!;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-lg w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            {lab.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Shape volume and expression like a performer
          </p>
        </motion.div>

        <div className="flex gap-2 justify-center">
          {(["explore", "crescendo", "quiz"] as const).map((m) => (
            <motion.button
              key={m}
              onClick={() => { setMode(m); if (m === "quiz") startQuiz(); }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full text-sm font-medium capitalize"
              style={{
                background: mode === m ? "var(--accent-amber)" : "var(--bg-elevated)",
                color: mode === m ? "var(--bg-deep)" : "var(--text-secondary)",
              }}
            >
              {m}
            </motion.button>
          ))}
        </div>

        <motion.div
          className="rounded-3xl p-6 overflow-hidden"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-end justify-center gap-0.5 h-32 mb-4">
            {waveHeights.map((h, i) => (
              <motion.div
                key={i}
                className="w-2 rounded-full"
                style={{
                  height: `${h * 100}%`,
                  background: `linear-gradient(to top, var(--accent-amber), var(--accent-coral))`,
                }}
                animate={{ height: `${h * 100}%` }}
                transition={{ duration: 0.05 }}
              />
            ))}
          </div>

          {mode === "explore" && (
            <>
              <div className="flex justify-between gap-1 mb-4">
                {DYNAMICS.map((dyn) => (
                  <motion.button
                    key={dyn.id}
                    onClick={() => { setSelected(dyn.id); void playDynamic(dyn); }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex-1 py-3 rounded-lg text-xs font-bold"
                    style={{
                      background: selected === dyn.id ? "var(--accent-amber)" : "var(--bg-surface)",
                      color: selected === dyn.id ? "var(--bg-deep)" : "var(--text-secondary)",
                    }}
                  >
                    {dyn.label}
                  </motion.button>
                ))}
              </div>
              <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                {current.desc}
              </p>
            </>
          )}

          {mode === "crescendo" && (
            <div className="text-center">
              <motion.button
                onClick={() => void playCrescendo()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-xl text-white font-semibold"
                style={{ background: "linear-gradient(135deg, var(--accent-amber), var(--accent-coral))" }}
              >
                ▶ Crescendo (soft → loud)
              </motion.button>
              <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                Watch the wave grow as volume increases
              </p>
            </div>
          )}

          {mode === "quiz" && (
            <div>
              <p className="text-center text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                What dynamic level did you hear?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DYNAMICS.map((dyn) => (
                  <motion.button
                    key={dyn.id}
                    onClick={() => handleQuizGuess(dyn)}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 rounded-lg text-sm font-bold"
                    style={{ background: "var(--bg-surface)", color: "var(--text-primary)" }}
                  >
                    {dyn.label}
                  </motion.button>
                ))}
              </div>
              <p className="text-center text-xs mt-3" style={{ color: "var(--accent-teal)" }}>
                Score: {quizScore}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
