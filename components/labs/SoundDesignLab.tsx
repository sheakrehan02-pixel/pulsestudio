"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLabActivity } from "@/components/LabSessionContext";
import type { Lab } from "@/lib/labs";

interface SoundDesignLabProps {
  lab: Lab;
}

type WaveType = "sine" | "square" | "sawtooth" | "triangle";

const PRESETS: { name: string; freq: number; wave: WaveType; desc: string }[] = [
  { name: "Warm Pad", freq: 220, wave: "sine", desc: "Smooth & cozy" },
  { name: "Laser Zap", freq: 880, wave: "sawtooth", desc: "Bright & edgy" },
  { name: "Sub Boom", freq: 55, wave: "sine", desc: "Deep bass" },
  { name: "Bell Tone", freq: 1047, wave: "triangle", desc: "Crystalline" },
  { name: "8-Bit", freq: 440, wave: "square", desc: "Retro game" },
];

export default function SoundDesignLab({ lab }: SoundDesignLabProps) {
  const recordActivity = useLabActivity();
  const [frequency, setFrequency] = useState(440);
  const [waveType, setWaveType] = useState<WaveType>("sine");
  const [detune, setDetune] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState(0);
  const oscRef = useRef<OscillatorNode[]>([]);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      oscRef.current.forEach((o) => o.stop());
    };
  }, []);

  const initCtx = async () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
    }
    return ctxRef.current;
  };

  const playSound = async () => {
    const ctx = await initCtx();
    oscRef.current.forEach((o) => o.stop());
    oscRef.current = [];

    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    [0, detune].forEach((dt) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.frequency.value = frequency;
      osc.detune.value = dt;
      osc.type = waveType;
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
      oscRef.current.push(osc);
    });
  };

  const togglePlay = async () => {
    recordActivity?.(1);
    if (isPlaying) {
      oscRef.current.forEach((o) => o.stop());
      oscRef.current = [];
      setIsPlaying(false);
    } else {
      await playSound();
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
      }, 550);
    }
  };

  const loadPreset = (p: typeof PRESETS[0]) => {
    setFrequency(p.freq);
    setWaveType(p.wave);
    void playSound();
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 550);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setPhase((ph) => ph + 0.15), 50);
    return () => clearInterval(id);
  }, [isPlaying]);

  const waveformPoints = Array.from({ length: 120 }, (_, i) => {
    const x = (i / 120) * 100;
    let y = 50;
    const t = (i / 120) * Math.PI * 4 + phase;
    switch (waveType) {
      case "sine":
        y = 50 + Math.sin(t) * 35;
        break;
      case "square":
        y = 50 + (Math.sin(t) > 0 ? 35 : -35);
        break;
      case "sawtooth":
        y = 50 + ((t % (Math.PI * 2)) / (Math.PI * 2) - 0.5) * 70;
        break;
      case "triangle":
        y = 50 + (Math.abs(((t % (Math.PI * 2)) / Math.PI) - 1) - 0.5) * 70;
        break;
    }
    return { x, y };
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-md w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
            {lab.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Shape sound from scratch</p>
        </motion.div>

        {/* Presets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        >
          {PRESETS.map((preset) => (
            <motion.button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-left hover:border-emerald-500/30"
            >
              <div className="font-medium text-sm text-emerald-300">{preset.name}</div>
              <div className="text-xs text-gray-500">{preset.desc}</div>
            </motion.button>
          ))}
        </motion.div>

        {/* Live Waveform */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800"
        >
          <div className="text-xs text-gray-500 mb-2">Waveform</div>
          <svg viewBox="0 0 100 100" className="w-full h-32">
            <motion.polyline
              points={waveformPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="url(#waveGrad)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Frequency</span>
              <span className="text-emerald-400 font-mono">{frequency} Hz</span>
            </div>
            <input
              type="range"
              min="55"
              max="2000"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Detune</span>
              <span className="text-emerald-400 font-mono">{detune}¢</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={detune}
              onChange={(e) => setDetune(Number(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">Wave Type</div>
            <div className="grid grid-cols-4 gap-2">
              {(["sine", "square", "sawtooth", "triangle"] as WaveType[]).map((w) => (
                <motion.button
                  key={w}
                  onClick={() => setWaveType(w)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`py-2 rounded-lg text-xs font-medium capitalize ${
                    waveType === w
                      ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {w}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            onClick={togglePlay}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg"
          >
            {isPlaying ? "🔊 Playing..." : "▶ Play Sound"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
