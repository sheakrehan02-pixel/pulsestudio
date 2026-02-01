"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { playPianoNote, playSynthNote, playMarimbaNote } from "@/lib/audio";
import { useLabActivity } from "@/components/LabSessionContext";
import type { Lab } from "@/lib/labs";

interface CreativityLabProps {
  lab: Lab;
}

type Instrument = "piano" | "synth" | "marimba";

const PIANO_KEYS = [
  { note: "C3", frequency: 130.81, isSharp: false },
  { note: "C#3", frequency: 138.59, isSharp: true },
  { note: "D3", frequency: 146.83, isSharp: false },
  { note: "D#3", frequency: 155.56, isSharp: true },
  { note: "E3", frequency: 164.81, isSharp: false },
  { note: "F3", frequency: 174.61, isSharp: false },
  { note: "F#3", frequency: 185, isSharp: true },
  { note: "G3", frequency: 196, isSharp: false },
  { note: "G#3", frequency: 207.65, isSharp: true },
  { note: "A3", frequency: 220, isSharp: false },
  { note: "A#3", frequency: 233.08, isSharp: true },
  { note: "B3", frequency: 246.94, isSharp: false },
  { note: "C4", frequency: 261.63, isSharp: false },
  { note: "C#4", frequency: 277.18, isSharp: true },
  { note: "D4", frequency: 293.66, isSharp: false },
  { note: "D#4", frequency: 311.13, isSharp: true },
  { note: "E4", frequency: 329.63, isSharp: false },
  { note: "F4", frequency: 349.23, isSharp: false },
  { note: "F#4", frequency: 369.99, isSharp: true },
  { note: "G4", frequency: 392, isSharp: false },
  { note: "G#4", frequency: 415.3, isSharp: true },
  { note: "A4", frequency: 440, isSharp: false },
  { note: "A#4", frequency: 466.16, isSharp: true },
  { note: "B4", frequency: 493.88, isSharp: false },
  { note: "C5", frequency: 523.25, isSharp: false },
];

const PLAY_FN = {
  piano: (f: number, d: number) => playPianoNote(f, d),
  synth: (f: number, d: number) => playSynthNote(f, d),
  marimba: (f: number, d: number) => playMarimbaNote(f, d),
};

export default function CreativityLab({ lab }: CreativityLabProps) {
  const recordActivity = useLabActivity();
  const [instrument, setInstrument] = useState<Instrument>("piano");
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [playHistory, setPlayHistory] = useState<Array<{ note: string; time: number; frequency: number }>>([]);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(-1);
  const [vizBars, setVizBars] = useState<number[]>(Array(16).fill(0));
  const playbackRef = useRef<NodeJS.Timeout[]>([]);

  const playNote = PLAY_FN[instrument];

  const handleKeyPress = useCallback(
    (note: string, frequency: number) => {
      if (isPlayingBack) return;
      recordActivity?.(1);
      void playNote(frequency, 0.5);
      setLastPlayed(note);
      setActiveKeys((prev) => new Set([...prev, note]));
      setPlayHistory((prev) => [...prev, { note, time: Date.now(), frequency }]);
      setVizBars((b) => [...b.slice(1), (frequency / 523) * 100]);
      setTimeout(() => setActiveKeys((prev) => {
        const n = new Set(prev);
        n.delete(note);
        return n;
      }), 280);
    },
    [instrument, isPlayingBack, recordActivity]
  );

  useEffect(() => {
    const map: Record<string, { note: string; frequency: number }> = {};
    const whites = PIANO_KEYS.filter((k) => !k.isSharp);
    "asdfghjklzxcvbnmqwertyuiop".split("").forEach((k, i) => {
      if (whites[i]) map[k] = { note: whites[i]!.note, frequency: whites[i]!.frequency };
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const m = map[e.key.toLowerCase()];
      if (m) {
        e.preventDefault();
        handleKeyPress(m.note, m.frequency);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleKeyPress]);

  const clearHistory = useCallback(() => {
    playbackRef.current.forEach(clearTimeout);
    setPlayHistory([]);
    setLastPlayed(null);
    setIsPlayingBack(false);
    setPlaybackIndex(-1);
    setVizBars(Array(16).fill(0));
  }, []);

  const playBack = useCallback(() => {
    if (playHistory.length === 0 || isPlayingBack) return;
    recordActivity?.(1);
    setIsPlayingBack(true);
    const start = playHistory[0]!.time;
    playbackRef.current = playHistory.map((item, i) =>
      setTimeout(() => {
        void playNote(item.frequency, 0.4);
        setPlaybackIndex(i);
        setVizBars((b) => [...b.slice(1), (item.frequency / 523) * 100]);
        if (i === playHistory.length - 1) {
          setTimeout(() => {
            setIsPlayingBack(false);
            setPlaybackIndex(-1);
          }, 500);
        }
      }, item.time - start)
    );
  }, [playHistory, isPlayingBack, instrument, recordActivity]);

  useEffect(() => () => playbackRef.current.forEach(clearTimeout), []);

  const whiteKeys = PIANO_KEYS.filter((k) => !k.isSharp);
  const blackKeys = PIANO_KEYS.filter((k) => k.isSharp);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-3xl w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {lab.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">No rules. Just sound.</p>
        </motion.div>

        {/* Instrument selector */}
        <div className="flex gap-2 justify-center">
          {(["piano", "synth", "marimba"] as Instrument[]).map((inst) => (
            <motion.button
              key={inst}
              onClick={() => setInstrument(inst)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
                instrument === inst
                  ? "bg-purple-500/40 text-purple-200 border border-purple-500/50"
                  : "bg-gray-800 text-gray-500"
              }`}
            >
              {inst}
            </motion.button>
          ))}
        </div>

        {/* Reactive visualizer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-end justify-center gap-1 h-20"
        >
          {vizBars.map((h, i) => (
            <motion.div
              key={i}
              layout
              className="w-3 rounded-t bg-gradient-to-t from-purple-600 to-pink-500"
              animate={{ height: `${Math.max(4, h)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          ))}
        </motion.div>

        {/* Piano */}
        <div className="relative flex justify-center overflow-x-auto">
          <div className="relative" style={{ width: Math.min(whiteKeys.length * 48, 512) }}>
            <div className="flex">
              {whiteKeys.map((key) => {
                const isActive = activeKeys.has(key.note);
                const isLast = lastPlayed === key.note;
                return (
                  <motion.button
                    key={key.note}
                    onClick={() => handleKeyPress(key.note, key.frequency)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    animate={{
                      backgroundColor: isActive || isLast ? "rgba(168, 85, 247, 0.4)" : "white",
                    }}
                    className="flex-1 min-w-[36px] h-44 sm:h-52 rounded-b-lg flex flex-col justify-end pb-1 text-gray-800 border border-gray-300 text-xs"
                  >
                    {key.note}
                  </motion.button>
                );
              })}
            </div>
            {blackKeys.map((key) => {
              const idx = PIANO_KEYS.findIndex((k) => k.note === key.note);
              let wc = 0;
              for (let i = 0; i < idx; i++) if (!PIANO_KEYS[i]!.isSharp) wc++;
              const left = `${(wc + 0.65) * (100 / whiteKeys.length)}%`;
              const isActive = activeKeys.has(key.note);
              return (
                <motion.button
                  key={key.note}
                  onClick={() => handleKeyPress(key.note, key.frequency)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{ backgroundColor: isActive ? "rgba(192, 132, 252, 0.8)" : "#111" }}
                  className="absolute w-8 h-32 rounded-b-lg flex items-end justify-center pb-1 text-[10px] text-white z-10"
                  style={{ left: `calc(${left} - 16px)`, top: 0 }}
                >
                  {key.note}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        {playHistory.length > 0 && (
          <div className="flex gap-2 justify-center">
            <motion.button
              onClick={playBack}
              disabled={isPlayingBack}
              className="px-5 py-2 rounded-xl bg-purple-500/40 text-purple-200 font-medium disabled:opacity-50"
            >
              ▶ Play Back
            </motion.button>
            <motion.button
              onClick={clearHistory}
              className="px-5 py-2 rounded-xl bg-gray-800 text-gray-400"
            >
              Clear
            </motion.button>
          </div>
        )}

        {/* Note trail */}
        {playHistory.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center max-h-16 overflow-y-auto">
            {playHistory.slice(-24).map((item, i) => {
              const origIdx = Math.max(0, playHistory.length - 24 + i);
              return (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-2 py-0.5 rounded text-xs ${
                  playbackIndex === origIdx ? "bg-purple-500/50" : "bg-gray-800 text-gray-500"
                }`}
              >
                {item.note}
              </motion.span>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
