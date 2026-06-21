"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { playPianoNote, playClickSound } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import type { Lab } from "@/lib/labs";

interface HarmonyLabProps {
  lab: Lab;
}

type Mood = "happy" | "chill" | "epic" | "mystery";

const CHORDS: Record<string, { name: string; notes: number[]; color: string }> = {
  I: { name: "C", notes: [261.63, 329.63, 392], color: "from-[#5a9a8e] to-[#4a8578]" },
  ii: { name: "Dm", notes: [293.66, 349.23, 440], color: "from-[#5a9a8e] to-[#4a7c7e]" },
  iii: { name: "Em", notes: [329.63, 392, 493.88], color: "from-[#6ab09a] to-[#5a9a8e]" },
  IV: { name: "F", notes: [349.23, 440, 523.25], color: "from-[#e8b84a] to-[#d4a43a]" },
  V: { name: "G", notes: [392, 493.88, 587.33], color: "from-[#e69a80] to-[#d4856a]" },
  vi: { name: "Am", notes: [220, 261.63, 329.63], color: "from-[#d4856a] to-[#c27458]" },
  viio: { name: "Bº", notes: [246.94, 293.66, 349.23], color: "from-[#c27458] to-[#a85a45]" },
};

const MOOD_PROGRESSIONS: Record<Mood, string[]> = {
  happy: ["I", "V", "vi", "IV"],
  chill: ["I", "vi", "IV", "V"],
  epic: ["I", "IV", "I", "V"],
  mystery: ["vi", "IV", "ii", "V"],
};

export default function HarmonyLab({ lab }: HarmonyLabProps) {
  const recordActivity = useLabActivity();
  const [progression, setProgression] = useState<string[]>(["I", "IV", "V", "I"]);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [isLooping, setIsLooping] = useState(false);
  const loopRef = useRef(false);

  const playChord = useCallback((roman: string, index?: number) => {
    const chord = CHORDS[roman];
    if (!chord) return;
    recordActivity?.(1);
    void playClickSound(500, 0.04);
    chord.notes.forEach((freq, i) => {
      setTimeout(() => void playPianoNote(freq, 0.6), i * 40);
    });
    if (index !== undefined) setPlayingIndex(index);
  }, [recordActivity]);

  const playProgression = useCallback(async () => {
    loopRef.current = true;
    setIsLooping(true);
    const loop = async (i: number) => {
      if (!loopRef.current) return;
      setPlayingIndex(i);
      const roman = progression[i];
      const chord = CHORDS[roman];
      if (chord) {
        chord.notes.forEach((freq, j) => {
          setTimeout(() => void playPianoNote(freq, 0.5), j * 35);
        });
      }
      await new Promise((r) => setTimeout(r, 800));
      const next = (i + 1) % progression.length;
      if (loopRef.current) loop(next);
    };
    loop(0);
  }, [progression]);

  const stopLoop = useCallback(() => {
    loopRef.current = false;
    setIsLooping(false);
    setPlayingIndex(-1);
  }, []);

  const loadMood = (mood: Mood) => {
    setProgression([...MOOD_PROGRESSIONS[mood]]);
    void playClickSound(600, 0.05);
  };

  const cycleChord = (slotIndex: number) => {
    const romans = Object.keys(CHORDS);
    setProgression((p) => {
      const current = p[slotIndex] ?? "I";
      const idx = romans.indexOf(current);
      const next = romans[(idx + 1) % romans.length]!;
      const n = [...p];
      n[slotIndex] = next;
      return n;
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-lg w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            {lab.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Build chord progressions</p>
        </motion.div>

        {/* Mood presets */}
        <div className="flex flex-wrap gap-2">
          {(["happy", "chill", "epic", "mystery"] as Mood[]).map((m) => (
            <motion.button
              key={m}
              onClick={() => loadMood(m)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl text-sm capitalize transition-colors"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
            >
              {m}
            </motion.button>
          ))}
        </div>

        {/* Progression builder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-4 gap-3"
        >
          {[0, 1, 2, 3].map((i) => {
            const roman = progression[i] ?? "I";
            const chord = CHORDS[roman];
            const isPlaying = playingIndex === i;
            return (
              <motion.button
                key={i}
                onClick={() => playChord(roman, i)}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${chord?.color ?? "from-[#4a5a5c] to-[#3a4a4c]"} text-white font-bold text-xl ${
                  isPlaying ? "ring-4 ring-[var(--accent-amber)] ring-offset-2 ring-offset-[var(--bg-deep)]" : ""
                }`}
              >
                {roman}
                <span className="block text-sm font-normal opacity-80 mt-1">{chord?.name}</span>
              </motion.button>
            );
          })}
        </motion.div>

        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => cycleChord(i)}
              className="w-8 h-8 rounded-lg text-sm transition-colors"
              style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
            >
              ↻
            </button>
          ))}
        </div>

        {/* Play progression */}
        <motion.button
          onClick={isLooping ? stopLoop : playProgression}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl text-white font-bold text-lg"
            style={{ background: "linear-gradient(135deg, var(--accent-coral), #c27458)" }}
        >
          {isLooping ? "⏹ Stop Loop" : "▶ Play Progression"}
        </motion.button>
      </div>
    </div>
  );
}
