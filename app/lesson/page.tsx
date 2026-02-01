"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { playClickSound, playSuccessSound, playErrorSound } from "@/lib/audio";
import { DifficultyLevel, RhythmLessonConfig } from "@/lib/types";

type TapAccuracy = "perfect" | "close" | "off" | null;

interface TapResult {
  accuracy: TapAccuracy;
  timestamp: number;
  beatOffset: number;
}

const DIFFICULTY_CONFIGS: Record<DifficultyLevel, RhythmLessonConfig> = {
  beginner: {
    bpm: 100,
    difficulty: "beginner",
    timeSignature: [4, 4],
    targetTaps: 16,
    tolerance: 150, // milliseconds
  },
  intermediate: {
    bpm: 120,
    difficulty: "intermediate",
    timeSignature: [4, 4],
    targetTaps: 24,
    tolerance: 100,
  },
  advanced: {
    bpm: 140,
    difficulty: "advanced",
    timeSignature: [4, 4],
    targetTaps: 32,
    tolerance: 75,
  },
};

export default function LessonPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("beginner");
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [taps, setTaps] = useState<TapResult[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<TapAccuracy>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBeatTimeRef = useRef<number>(0);
  const tapCountRef = useRef(0);
  
  const config = DIFFICULTY_CONFIGS[difficulty];
  const beatInterval = (60 / config.bpm) * 1000;

  // Start/stop metronome
  const toggleMetronome = useCallback(() => {
    if (isActive) {
      // Stop
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
      setIsActive(false);
      setMessage("Paused");
    } else {
      // Start
      setShowDifficultySelect(false);
      lastBeatTimeRef.current = Date.now();
      void playClickSound(800, 0.1);
      metronomeIntervalRef.current = setInterval(() => {
        lastBeatTimeRef.current = Date.now();
        void playClickSound(800, 0.1);
      }, beatInterval);
      setIsActive(true);
      setMessage("Tap in time with the beat!");
      setTaps([]);
      setScore(0);
      setStreak(0);
      setProgress(0);
      tapCountRef.current = 0;
    }
  }, [isActive, beatInterval]);

  // Handle user tap
  const handleTap = useCallback(() => {
    if (!isActive && !showDifficultySelect) {
      toggleMetronome();
      return;
    }
    if (showDifficultySelect) return;

    const now = Date.now();
    const timeSinceLastBeat = Math.abs(now - lastBeatTimeRef.current);
    const perfectWindow = config.tolerance;
    const closeWindow = config.tolerance * 1.5;

    let accuracy: TapAccuracy;
    if (timeSinceLastBeat < perfectWindow) {
      accuracy = "perfect";
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);
      void playSuccessSound();
      setMessage("Perfect timing! 🎯");
    } else if (timeSinceLastBeat < closeWindow) {
      accuracy = "close";
      setScore((prev) => prev + 5);
      setStreak(0);
      void playClickSound(600, 0.1);
      setMessage("Close! Keep trying");
    } else {
      accuracy = "off";
      setStreak(0);
      void playErrorSound();
      setMessage("Off beat - listen carefully");
    }

    setCurrentFeedback(accuracy);
    setTaps((prev) => [...prev, { accuracy, timestamp: now, beatOffset: timeSinceLastBeat }]);
    tapCountRef.current += 1;
    setProgress((tapCountRef.current / config.targetTaps) * 100);

    // Clear feedback after animation
    setTimeout(() => {
      setCurrentFeedback(null);
    }, 500);

    // Complete lesson after target taps
    if (tapCountRef.current >= config.targetTaps) {
      setTimeout(() => {
        if (metronomeIntervalRef.current) {
          clearInterval(metronomeIntervalRef.current);
        }
        setIsActive(false);
        const accuracyRate = (taps.filter(t => t.accuracy === "perfect").length / config.targetTaps) * 100;
        if (accuracyRate >= 80) {
          setMessage("Excellent! You've mastered this level! 🎉");
        } else if (accuracyRate >= 60) {
          setMessage("Good job! Keep practicing to improve.");
        } else {
          setMessage("Nice try! Practice makes perfect.");
        }
        setTimeout(() => {
          router.push("/progress");
        }, 2000);
      }, 1000);
    }
  }, [isActive, config, toggleMetronome, router, taps, showDifficultySelect]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleTap]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    };
  }, []);

  // Visual feedback color
  const getFeedbackColor = () => {
    switch (currentFeedback) {
      case "perfect":
        return "bg-green-500";
      case "close":
        return "bg-yellow-500";
      case "off":
        return "bg-red-500";
      default:
        return "bg-gray-700";
    }
  };

  const getDifficultyColor = (level: DifficultyLevel) => {
    switch (level) {
      case "beginner":
        return "from-green-500 to-emerald-500";
      case "intermediate":
        return "from-yellow-500 to-orange-500";
      case "advanced":
        return "from-red-500 to-pink-500";
    }
  };

  if (showDifficultySelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col items-center justify-center p-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full space-y-8"
        >
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-2">Rhythm Tap</h1>
            <p className="text-gray-400">Choose your difficulty level</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(DIFFICULTY_CONFIGS) as DifficultyLevel[]).map((level) => {
              const levelConfig = DIFFICULTY_CONFIGS[level];
              const isSelected = difficulty === level;

              return (
                <motion.button
                  key={level}
                  onClick={() => {
                    setDifficulty(level);
                    void playClickSound();
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-6 rounded-2xl border-2 transition-all
                    ${isSelected
                      ? `bg-gradient-to-br ${getDifficultyColor(level)} border-transparent text-white`
                      : "bg-gray-900/50 border-gray-700 text-gray-300"
                    }
                  `}
                >
                  <div className="text-3xl mb-2">
                    {level === "beginner" && "🌱"}
                    {level === "intermediate" && "⚡"}
                    {level === "advanced" && "🔥"}
                  </div>
                  <h3 className="text-xl font-bold mb-2 capitalize">{level}</h3>
                  <div className="text-sm space-y-1 opacity-80">
                    <p>{levelConfig.bpm} BPM</p>
                    <p>{levelConfig.targetTaps} taps</p>
                    <p>±{levelConfig.tolerance}ms tolerance</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowDifficultySelect(false);
              void playClickSound();
            }}
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full text-lg"
          >
            Start Lesson
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-4xl w-full space-y-8">
        {/* Difficulty Badge */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`px-4 py-2 rounded-full bg-gradient-to-r ${getDifficultyColor(difficulty)} text-white text-sm font-semibold`}
          >
            {difficulty.toUpperCase()} • {config.bpm} BPM
          </motion.div>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center">
          <div className="relative w-64 h-64">
            <svg className="transform -rotate-90 w-64 h-64">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-800"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-blue-500"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold">{Math.round(progress)}%</div>
                <div className="text-sm text-gray-400">
                  {tapCountRef.current}/{config.targetTaps}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tap Area */}
        <motion.button
          onClick={handleTap}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full h-64 rounded-2xl ${getFeedbackColor()} transition-colors duration-300 flex items-center justify-center text-white text-2xl font-bold shadow-2xl relative overflow-hidden`}
        >
          <AnimatePresence mode="wait">
            {currentFeedback && (
              <motion.div
                key={currentFeedback}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-6xl">
                  {currentFeedback === "perfect" && "✓"}
                  {currentFeedback === "close" && "~"}
                  {currentFeedback === "off" && "✗"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <span className="relative z-10">
            {isActive ? "Tap Now!" : "Start Metronome"}
          </span>
          <div className="absolute bottom-4 text-sm opacity-70">
            Press Space or Click
          </div>
        </motion.button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900/50 rounded-xl p-6 text-center backdrop-blur-sm"
          >
            <div className="text-3xl font-bold text-blue-400">{score}</div>
            <div className="text-sm text-gray-400 mt-1">Score</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900/50 rounded-xl p-6 text-center backdrop-blur-sm"
          >
            <div className="text-3xl font-bold text-yellow-400">{streak}</div>
            <div className="text-sm text-gray-400 mt-1">Streak</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900/50 rounded-xl p-6 text-center backdrop-blur-sm"
          >
            <div className="text-3xl font-bold text-purple-400">
              {Math.round((taps.filter(t => t.accuracy === "perfect").length / Math.max(taps.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-400 mt-1">Accuracy</div>
          </motion.div>
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center text-lg text-gray-300"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
