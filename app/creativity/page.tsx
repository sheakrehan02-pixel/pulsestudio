"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { playPianoNote } from "@/lib/audio";

// Piano key frequencies (C3 to C5, two octaves for more creativity)
const PIANO_KEYS = [
  { note: "C3", frequency: 130.81, isSharp: false },
  { note: "C#3", frequency: 138.59, isSharp: true },
  { note: "D3", frequency: 146.83, isSharp: false },
  { note: "D#3", frequency: 155.56, isSharp: true },
  { note: "E3", frequency: 164.81, isSharp: false },
  { note: "F3", frequency: 174.61, isSharp: false },
  { note: "F#3", frequency: 185.00, isSharp: true },
  { note: "G3", frequency: 196.00, isSharp: false },
  { note: "G#3", frequency: 207.65, isSharp: true },
  { note: "A3", frequency: 220.00, isSharp: false },
  { note: "A#3", frequency: 233.08, isSharp: true },
  { note: "B3", frequency: 246.94, isSharp: false },
  { note: "C4", frequency: 261.63, isSharp: false },
  { note: "C#4", frequency: 277.18, isSharp: true },
  { note: "D4", frequency: 293.66, isSharp: false },
  { note: "D#4", frequency: 311.13, isSharp: true },
  { note: "E4", frequency: 329.63, isSharp: false },
  { note: "F4", frequency: 349.23, isSharp: false },
  { note: "F#4", frequency: 369.99, isSharp: true },
  { note: "G4", frequency: 392.00, isSharp: false },
  { note: "G#4", frequency: 415.30, isSharp: true },
  { note: "A4", frequency: 440.00, isSharp: false },
  { note: "A#4", frequency: 466.16, isSharp: true },
  { note: "B4", frequency: 493.88, isSharp: false },
  { note: "C5", frequency: 523.25, isSharp: false },
];

export default function CreativityPage() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [playHistory, setPlayHistory] = useState<Array<{ note: string; time: number }>>([]);

  const handleKeyPress = useCallback((note: string, frequency: number) => {
    void playPianoNote(frequency, 0.5);
    setLastPlayed(note);
    setActiveKeys((prev) => new Set([...prev, note]));
    setPlayHistory((prev) => [...prev, { note, time: Date.now() }]);

    setTimeout(() => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }, 300);
  }, []);

  // Keyboard support
  useEffect(() => {
    const keyboardMap: Record<string, { note: string; frequency: number }> = {};
    const whiteKeys = PIANO_KEYS.filter((k) => !k.isSharp);
    "asdfghjklzxcvbnm".split("").forEach((key, i) => {
      if (whiteKeys[i]) {
        keyboardMap[key] = {
          note: whiteKeys[i].note,
          frequency: whiteKeys[i].frequency,
        };
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      const mapped = keyboardMap[e.key.toLowerCase()];
      if (mapped && !activeKeys.has(mapped.note)) {
        handleKeyPress(mapped.note, mapped.frequency);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, activeKeys]);

  const clearHistory = () => {
    setPlayHistory([]);
    setLastPlayed(null);
  };

  const whiteKeys = PIANO_KEYS.filter((key) => !key.isSharp);
  const blackKeys = PIANO_KEYS.filter((key) => key.isSharp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Creativity Mode
          </h1>
          <p className="text-gray-400">Explore freely. No rules. Just music.</p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-2xl p-6 backdrop-blur-sm border border-pink-500/30 text-center"
        >
          <p className="text-gray-300 mb-2">
            🎨 This is your musical playground. Experiment, explore, and create.
          </p>
          <p className="text-sm text-gray-400">
            Click keys or use keyboard: A S D F G H J K L (white keys)
          </p>
          {playHistory.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={clearHistory}
              className="mt-4 px-4 py-2 bg-gray-800/50 text-gray-300 text-sm rounded-full hover:bg-gray-700/50 transition-colors"
            >
              Clear History
            </motion.button>
          )}
        </motion.div>

        {/* Piano */}
        <div className="relative flex justify-center">
          <div className="relative" style={{ width: `${whiteKeys.length * 64}px` }}>
            {/* White Keys */}
            <div className="flex relative">
              {whiteKeys.map((key) => {
                const isActive = activeKeys.has(key.note);
                const isLastPlayed = lastPlayed === key.note;

                return (
                  <motion.button
                    key={key.note}
                    onClick={() => handleKeyPress(key.note, key.frequency)}
                    whileHover={{ y: -5 }}
                    whileTap={{ y: 0, scale: 0.95 }}
                    animate={{
                      scale: isActive ? 0.95 : 1,
                      y: isActive ? 0 : 0,
                    }}
                    className={`
                      w-16 h-64 rounded-b-lg
                      flex flex-col items-center justify-end pb-4 relative z-10
                      transition-all duration-200
                      ${isActive || isLastPlayed
                        ? "bg-gradient-to-b from-pink-300 to-purple-300 text-gray-900 shadow-lg"
                        : "bg-white text-gray-800 border border-gray-300"
                      }
                    `}
                  >
                    <span className="text-xs font-semibold opacity-60">{key.note}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Black Keys */}
            {blackKeys.map((key) => {
              const keyIndex = PIANO_KEYS.findIndex((k) => k.note === key.note);
              let whiteKeyCount = 0;
              for (let i = 0; i < keyIndex; i++) {
                if (!PIANO_KEYS[i].isSharp) {
                  whiteKeyCount++;
                }
              }
              const position = whiteKeyCount * 64 + 40;
              const isActive = activeKeys.has(key.note);

              return (
                <motion.button
                  key={key.note}
                  onClick={() => handleKeyPress(key.note, key.frequency)}
                  whileHover={{ y: -3 }}
                  whileTap={{ y: 0, scale: 0.95 }}
                  animate={{
                    scale: isActive ? 0.95 : 1,
                  }}
                  className={`
                    w-10 h-40 rounded-b-lg absolute z-20
                    flex items-end justify-center pb-2 text-xs
                    transition-all duration-200
                    ${isActive
                      ? "bg-gradient-to-b from-pink-500 to-purple-500 text-white shadow-lg"
                      : "bg-gray-900 text-white"
                    }
                  `}
                  style={{ left: `${position}px`, top: 0 }}
                >
                  {key.note}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Play History Visualization */}
        {playHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 rounded-2xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Your Creation</h3>
            <div className="flex flex-wrap gap-2">
              {playHistory.slice(-20).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full text-sm border border-pink-500/30"
                >
                  {item.note}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

