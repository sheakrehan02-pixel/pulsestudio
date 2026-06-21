"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type AssessmentQuestion,
  type SkillScores,
  computeScoresFromAnswers,
  getDefaultSkillScores,
} from "@/lib/assessment";
import {
  playClickSound,
  playPianoNote,
  playWaveNote,
  playSuccessSound,
  playErrorSound,
  playKick,
  playSnare,
} from "@/lib/audio";

interface AssessmentRunnerProps {
  questions: AssessmentQuestion[];
  title: string;
  subtitle: string;
  onComplete: (scores: SkillScores, answers: Record<string, { correct: boolean; accuracy?: number }>) => void;
}

export default function AssessmentRunner({
  questions,
  title,
  subtitle,
  onComplete,
}: AssessmentRunnerProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { correct: boolean; accuracy?: number }>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rhythmTaps, setRhythmTaps] = useState<number[]>([]);
  const [memoryInput, setMemoryInput] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const tapStartRef = useRef<number>(0);

  const q = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const advance = useCallback(
    (answer: { correct: boolean; accuracy?: number }) => {
      if (!q) return;
      const next = { ...answers, [q.id]: answer };
      setAnswers(next);
      setSelected(null);
      setFeedback(null);
      setRhythmTaps([]);
      setMemoryInput([]);

      if (step + 1 >= questions.length) {
        const result = computeScoresFromAnswers(questions, next);
        onComplete(result.scores, next);
      } else {
        setStep((s) => s + 1);
      }
    },
    [q, answers, step, questions, onComplete]
  );

  const playQuestionAudio = useCallback(async () => {
    if (!q) return;
    setPlaying(true);
    void playClickSound(500, 0.04);

    if (q.type === "pitch-choice" && q.meta) {
      const { freqA, freqB, waveA, waveB, freq, type } = q.meta as Record<string, unknown>;
      if (type === "scale-major-minor") {
        const major = [261.63, 293.66, 329.63, 349.23, 392];
        const minor = [261.63, 293.66, 311.13, 349.23, 392];
        for (const f of major) {
          await playPianoNote(f, 0.3);
          await new Promise((r) => setTimeout(r, 250));
        }
        await new Promise((r) => setTimeout(r, 700));
        for (const f of minor) {
          await playPianoNote(f, 0.3);
          await new Promise((r) => setTimeout(r, 250));
        }
      } else if (waveA && waveB) {
        await playWaveNote(freq as number, waveA as OscillatorType, 0.5);
        await new Promise((r) => setTimeout(r, 700));
        await playWaveNote(freq as number, waveB as OscillatorType, 0.5);
      } else {
        await playPianoNote(freqA as number, 0.5);
        await new Promise((r) => setTimeout(r, 700));
        await playPianoNote(freqB as number, 0.5);
      }
    } else if (q.type === "interval-choice" && q.meta) {
      const { root, interval } = q.meta as { root: number; interval: number };
      await playPianoNote(root, 0.5);
      await new Promise((r) => setTimeout(r, 600));
      await playPianoNote(root * Math.pow(2, interval / 12), 0.5);
    } else if (q.type === "tempo-choice" && q.meta) {
      const { bpmA, bpmB } = q.meta as { bpmA: number; bpmB: number };
      for (let i = 0; i < 4; i++) {
        void playClickSound(900, 0.06);
        await new Promise((r) => setTimeout(r, (60 / bpmA) * 1000));
      }
      await new Promise((r) => setTimeout(r, 500));
      for (let i = 0; i < 4; i++) {
        void playClickSound(700, 0.06);
        await new Promise((r) => setTimeout(r, (60 / bpmB) * 1000));
      }
    } else if (q.type === "harmony-mood" && q.meta) {
      const moodType = (q.meta as { type?: string }).type;
      if (moodType === "progression") {
        await playPianoNote(261.63, 0.5);
        await new Promise((r) => setTimeout(r, 500));
        await playPianoNote(392, 0.5);
        await new Promise((r) => setTimeout(r, 500));
        await playPianoNote(261.63, 0.6);
        await new Promise((r) => setTimeout(r, 900));
        await playPianoNote(261.63, 0.5);
        await new Promise((r) => setTimeout(r, 500));
        await playPianoNote(311.13, 0.5);
        await new Promise((r) => setTimeout(r, 500));
        await playPianoNote(349.23, 0.6);
      } else {
        await playPianoNote(261.63, 0.6);
        await new Promise((r) => setTimeout(r, 400));
        await playPianoNote(329.63, 0.6);
        await new Promise((r) => setTimeout(r, 400));
        await playPianoNote(392, 0.6);
        await new Promise((r) => setTimeout(r, 800));
        await playPianoNote(246.94, 0.6);
        await new Promise((r) => setTimeout(r, 400));
        await playPianoNote(293.66, 0.6);
        await new Promise((r) => setTimeout(r, 400));
        await playPianoNote(349.23, 0.6);
      }
    } else if (q.type === "pattern-choice" && q.meta) {
      const pattern = q.meta.pattern as number[];
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i]) {
          i % 2 === 0 ? void playKick() : void playSnare();
        }
        await new Promise((r) => setTimeout(r, 400));
      }
    } else if (q.type === "memory-sequence" && q.meta) {
      const { notes, baseFreq } = q.meta as { notes: number[]; baseFreq: number };
      const freqs = [baseFreq, baseFreq * 1.122, baseFreq * 1.26, baseFreq * 1.335, baseFreq * 1.498, baseFreq * 1.682];
      for (const n of notes) {
        await playPianoNote(freqs[n]!, 0.4);
        await new Promise((r) => setTimeout(r, 500));
      }
    } else if (q.type === "rhythm-tap" && q.meta) {
      const { bpm } = q.meta as { bpm: number };
      tapStartRef.current = Date.now();
      for (let i = 0; i < 4; i++) {
        void playClickSound(900, 0.08);
        await new Promise((r) => setTimeout(r, (60 / bpm) * 1000));
      }
    }

    setPlaying(false);
  }, [q]);

  const handleChoice = (index: number) => {
    setSelected(index);
    const correct = index === q?.correctIndex;
    setFeedback(correct ? "Correct!" : "Not quite — that's okay!");
    correct ? void playSuccessSound() : void playErrorSound();
    setTimeout(() => advance({ correct }), 900);
  };

  const handleRhythmTap = () => {
    const now = Date.now();
    const taps = [...rhythmTaps, now];
    setRhythmTaps(taps);
    void playClickSound(700, 0.05);

    if (taps.length >= 6) {
      const meta = q?.meta as { bpm: number } | undefined;
      const targetInterval = meta ? (60 / meta.bpm) * 1000 : 666;
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) intervals.push(taps[i]! - taps[i - 1]!);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const accuracy = Math.max(0, 1 - Math.abs(avg - targetInterval) / targetInterval);
      const correct = accuracy > 0.7;
      correct ? void playSuccessSound() : void playErrorSound();
      setFeedback(correct ? "Great timing!" : "Keep practicing rhythm!");
      setTimeout(() => advance({ correct, accuracy }), 900);
    }
  };

  const handleMemoryTap = (index: number) => {
    const meta = q?.meta as { notes: number[]; baseFreq: number } | undefined;
    if (!meta) return;
    const freqs = [meta.baseFreq, meta.baseFreq * 1.122, meta.baseFreq * 1.26, meta.baseFreq * 1.335, meta.baseFreq * 1.498, meta.baseFreq * 1.682];
    void playPianoNote(freqs[index]!, 0.3);
    const next = [...memoryInput, index];
    setMemoryInput(next);

    if (next.length === meta.notes.length) {
      const correct = next.every((n, i) => n === meta.notes[i]);
      correct ? void playSuccessSound() : void playErrorSound();
      setTimeout(() => advance({ correct }), 900);
    }
  };

  if (!q) return null;

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: "var(--bg-deep)" }}>
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{subtitle}</p>

        <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-surface)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--accent-teal), var(--accent-amber))" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Question {step + 1} of {questions.length}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="w-full max-w-md space-y-6"
          >
            <p className="text-lg text-center font-medium" style={{ color: "var(--text-primary)" }}>
              {q.prompt}
            </p>

            {q.type !== "rhythm-tap" && q.type !== "memory-sequence" && (
              <motion.button
                onClick={() => void playQuestionAudio()}
                disabled={playing}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl font-medium"
                style={{
                  background: "var(--accent-teal-soft)",
                  color: "var(--accent-teal)",
                  border: "1px solid rgba(90, 154, 142, 0.3)",
                }}
              >
                {playing ? "Playing..." : "▶ Play Audio"}
              </motion.button>
            )}

            {q.type === "rhythm-tap" && (
              <>
                <motion.button
                  onClick={() => void playQuestionAudio()}
                  className="w-full py-2 rounded-xl text-sm"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
                >
                  ▶ Hear the beat first
                </motion.button>
                <motion.button
                  onClick={handleRhythmTap}
                  whileTap={{ scale: 0.92 }}
                  className="w-full py-8 rounded-2xl text-2xl font-bold text-white"
                  style={{ background: "linear-gradient(135deg, var(--accent-teal), var(--accent-amber))" }}
                >
                  TAP ({rhythmTaps.length}/6)
                </motion.button>
              </>
            )}

            {q.type === "memory-sequence" && (
              <>
                <motion.button
                  onClick={() => void playQuestionAudio()}
                  className="w-full py-2 rounded-xl text-sm mb-2"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
                >
                  ▶ Replay melody
                </motion.button>
                <div className="grid grid-cols-3 gap-2">
                  {["C", "D", "E", "F", "G", "A"].map((label, i) => (
                    <motion.button
                      key={label}
                      onClick={() => handleMemoryTap(i)}
                      whileTap={{ scale: 0.95 }}
                      className="py-4 rounded-xl font-bold"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                    >
                      {label}
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {q.options && q.type !== "memory-sequence" && q.type !== "rhythm-tap" && (
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <motion.button
                    key={opt}
                    onClick={() => handleChoice(i)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 px-5 rounded-xl text-left font-medium transition-all"
                    style={{
                      background:
                        selected === i
                          ? "var(--accent-teal-soft)"
                          : "var(--bg-elevated)",
                      border: `1px solid ${selected === i ? "var(--accent-teal)" : "var(--border-subtle)"}`,
                      color: "var(--text-primary)",
                    }}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            )}

            {feedback && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm font-medium"
                style={{ color: "var(--accent-amber)" }}
              >
                {feedback}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function AssessmentResults({
  scores,
  onContinue,
  isWeekly = false,
  delta,
}: {
  scores: SkillScores;
  onContinue: () => void;
  isWeekly?: boolean;
  delta?: Partial<SkillScores>;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-6 text-center"
      >
        <div className="text-5xl mb-2">🎵</div>
        <h1 className="text-3xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
          {isWeekly ? "Weekly Check Complete!" : "Your Skill Profile"}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {isWeekly
            ? "Here's how you've grown this week."
            : "We've mapped your strengths and areas to grow."}
        </p>

        <div className="space-y-3 text-left">
          {(Object.entries(scores) as [keyof SkillScores, number][]).map(([domain, score]) => (
            <div key={domain} className="flex items-center gap-3">
              <span className="text-xs w-20 capitalize" style={{ color: "var(--text-muted)" }}>
                {domain}
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-surface)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: "var(--accent-teal)" }}
                />
              </div>
              <span className="text-sm font-semibold w-12 text-right" style={{ color: "var(--accent-teal)" }}>
                {score}
                {delta?.[domain] != null && (
                  <span className="text-xs ml-1" style={{ color: delta[domain]! >= 0 ? "var(--accent-teal)" : "var(--accent-coral)" }}>
                    {delta[domain]! >= 0 ? "+" : ""}{delta[domain]}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        <motion.button
          onClick={onContinue}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-full text-lg font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, var(--accent-teal), #4a8578)",
            boxShadow: "0 4px 24px rgba(90, 154, 142, 0.35)",
          }}
        >
          {isWeekly ? "Back to Progress" : "See Recommended Labs"}
        </motion.button>
      </motion.div>
    </div>
  );
}
