"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { playPianoNote } from "@/lib/audio";

// Piano key frequencies (C4 to C5, one octave)
const PIANO_KEYS = [
  { note: "C", frequency: 261.63, isSharp: false },
  { note: "C#", frequency: 277.18, isSharp: true },
  { note: "D", frequency: 293.66, isSharp: false },
  { note: "D#", frequency: 311.13, isSharp: true },
  { note: "E", frequency: 329.63, isSharp: false },
  { note: "F", frequency: 349.23, isSharp: false },
  { note: "F#", frequency: 369.99, isSharp: true },
  { note: "G", frequency: 392.00, isSharp: false },
  { note: "G#", frequency: 415.30, isSharp: true },
  { note: "A", frequency: 440.00, isSharp: false },
  { note: "A#", frequency: 466.16, isSharp: true },
  { note: "B", frequency: 493.88, isSharp: false },
  { note: "C5", frequency: 523.25, isSharp: false },
];

const MIDDLE_C_FREQUENCY = 261.63; // C4

export default function PianoPage() {
  const router = useRouter();
  const [challengeActive, setChallengeActive] = useState(false);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [foundMiddleC, setFoundMiddleC] = useState(false);

  const handleKeyPress = (note: string, frequency: number) => {
    void playPianoNote(frequency, 0.3);
    setLastPlayed(note);

    if (challengeActive && frequency === MIDDLE_C_FREQUENCY) {
      setFoundMiddleC(true);
      setTimeout(() => {
        setChallengeActive(false);
        setFoundMiddleC(false);
      }, 2000);
    }
  };

  const startChallenge = () => {
    setChallengeActive(true);
    setFoundMiddleC(false);
    setLastPlayed(null);
  };

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
      if (mapped) {
        handleKeyPress(mapped.note, mapped.frequency);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const whiteKeys = PIANO_KEYS.filter((key) => !key.isSharp);
  const blackKeys = PIANO_KEYS.filter((key) => key.isSharp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col items-center justify-center p-4 pb-24">

      <div className="max-w-6xl w-full space-y-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold mb-2">Piano Playground</h1>
          <p className="text-gray-400">Explore notes and find Middle C</p>
        </motion.div>

        {/* Challenge Section */}
        <div className="bg-gray-900/50 rounded-2xl p-6 backdrop-blur-sm text-center">
          {!challengeActive ? (
            <div>
              <p className="text-gray-300 mb-4">
                {foundMiddleC
                  ? "🎉 You found Middle C! Great job!"
                  : "Click keys to hear different notes"}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startChallenge}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full"
              >
                Challenge: Find Middle C
              </motion.button>
            </div>
          ) : (
            <div>
              <p className="text-xl text-yellow-400 mb-2">
                🎯 Find Middle C (C4)
              </p>
              <p className="text-gray-400 text-sm">
                Click the white key that plays Middle C
              </p>
            </div>
          )}
        </div>

        {/* Piano */}
        <div className="relative flex justify-center">
          <div className="relative" style={{ width: `${whiteKeys.length * 64}px` }}>
            {/* White Keys */}
            <div className="flex relative">
              {whiteKeys.map((key, index) => {
                const isMiddleC = key.frequency === MIDDLE_C_FREQUENCY;
                const isHighlighted =
                  challengeActive && isMiddleC && !foundMiddleC;
                const isLastPlayed = lastPlayed === key.note;

                return (
                  <motion.button
                    key={key.note}
                    onClick={() => handleKeyPress(key.note, key.frequency)}
                    whileHover={{ y: -5 }}
                    whileTap={{ y: 0, scale: 0.95 }}
                    className={`
                      w-16 h-64 bg-white text-gray-800 border border-gray-300 rounded-b-lg
                      flex flex-col items-center justify-end pb-4 relative z-10
                      ${isHighlighted ? "ring-4 ring-yellow-400 ring-opacity-75" : ""}
                      ${isLastPlayed ? "bg-blue-100" : ""}
                      ${isMiddleC ? "border-yellow-400 border-2" : ""}
                      transition-colors duration-200
                    `}
                  >
                    {isMiddleC && (
                      <span className="text-xs font-bold text-yellow-600 mb-2">
                        C4
                      </span>
                    )}
                    <span className="text-sm font-semibold">{key.note}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Black Keys */}
            {blackKeys.map((key) => {
              // Find the white key index before this black key
              const keyIndex = PIANO_KEYS.findIndex((k) => k.note === key.note);
              let whiteKeyCount = 0;
              for (let i = 0; i < keyIndex; i++) {
                if (!PIANO_KEYS[i].isSharp) {
                  whiteKeyCount++;
                }
              }
              
              // Position black key between white keys
              const position = whiteKeyCount * 64 + 40; // 40px offset to center between keys

              return (
                <motion.button
                  key={key.note}
                  onClick={() => handleKeyPress(key.note, key.frequency)}
                  whileHover={{ y: -3 }}
                  whileTap={{ y: 0, scale: 0.95 }}
                  className="w-10 h-40 bg-gray-900 text-white rounded-b-lg absolute z-20 flex items-end justify-center pb-2 text-xs"
                  style={{ left: `${position}px`, top: 0 }}
                >
                  {key.note}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="text-center space-y-2">
          {lastPlayed && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-lg text-blue-400 font-semibold"
            >
              Last played: {lastPlayed}
            </motion.p>
          )}
          <p className="text-sm text-gray-500">
            💡 Tip: Use keyboard keys A S D F G H J K L to play white keys
          </p>
        </div>
      </div>
    </div>
  );
}

