"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  getSessionData,
  getSuggestedLab,
  getWeeklyProgress,
  getLabStats,
} from "@/lib/sessionProgress";
import { LABS } from "@/lib/labs";
import type { LabId } from "@/lib/labs";

export default function ProgressPage() {
  const router = useRouter();
  const [data, setData] = useState(getSessionData());
  const [suggestedLab, setSuggestedLab] = useState<LabId | null>(null);
  const [weekly, setWeekly] = useState(getWeeklyProgress());

  const refresh = () => {
    setData(getSessionData());
    setSuggestedLab(getSuggestedLab());
    setWeekly(getWeeklyProgress());
  };

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const xpInLevel = data.totalXP % 100;
  const xpForNext = 100 - xpInLevel;
  const levelProgress = (xpInLevel / 100) * 100;

  const encouragingMessages = [
    "You're on fire! 🔥",
    "Keep the momentum! ⚡",
    "Every tap counts! 🎯",
    "Music is in your hands! 🎵",
    "Progress, not perfection! ✨",
    "You're building something great! 🌟",
  ];
  const message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${hrs}h ${m}m` : `${hrs}h`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent" />
        <div className="relative px-4 pt-8 pb-6">
          <h1 className="text-3xl font-bold mb-1">Your Progress</h1>
          <p className="text-gray-400 text-sm mb-6">{message}</p>

          {/* Level & XP Row */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-gray-900/80 rounded-2xl p-4 backdrop-blur-sm border border-gray-800">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Level</div>
              <div className="text-3xl font-bold text-blue-400">{data.level}</div>
            </div>
            <div className="flex-1 bg-gray-900/80 rounded-2xl p-4 backdrop-blur-sm border border-gray-800">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total XP</div>
              <div className="text-3xl font-bold text-purple-400">{data.totalXP}</div>
            </div>
            <div className="flex-1 bg-gray-900/80 rounded-2xl p-4 backdrop-blur-sm border border-gray-800">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Streak</div>
              <div className="text-3xl font-bold text-amber-400 flex items-center gap-1">
                {data.streak} <span className="text-xl">🔥</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="bg-gray-900/80 rounded-2xl p-4 backdrop-blur-sm border border-gray-800">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-400">Level {data.level} Progress</span>
              <span className="text-gray-500">{xpInLevel}/100 XP</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">{xpForNext} XP to Level {data.level + 1}</div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 mb-4"
      >
        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl p-4 border border-emerald-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-emerald-300">Weekly Goal</span>
            <span className="text-sm text-emerald-400">
              {weekly.minutes} / {weekly.goal} min
            </span>
          </div>
          <div className="h-2 bg-gray-900/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, weekly.percent)}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Suggested Next Lab */}
      {suggestedLab && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-4 mb-4"
        >
          <div className="text-sm text-gray-500 mb-2">Suggested for you</div>
          <motion.button
            onClick={() => router.push(`/labs/${suggestedLab}`)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-2xl p-4 border border-blue-500/30 text-left flex items-center gap-4"
          >
            {(() => {
              const lab = LABS.find((l) => l.id === suggestedLab);
              return (
                <>
                  <div className="text-4xl">{lab?.icon ?? "🎵"}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">Try {lab?.name ?? suggestedLab}</div>
                    <div className="text-sm text-gray-400">{lab?.description}</div>
                  </div>
                  <span className="text-blue-400 text-lg">→</span>
                </>
              );
            })()}
          </motion.button>
        </motion.div>
      )}

      {/* Lab Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4 flex-1"
      >
        <h2 className="text-lg font-semibold mb-3">Lab Activity</h2>
        <div className="space-y-2">
          {LABS.filter((l) => l.unlocked).map((lab, index) => {
            const stats = getLabStats(lab.id);
            const sessions = stats?.totalSessions ?? 0;
            const time = stats?.totalTimeMs ?? 0;
            const activity = stats?.totalActivity ?? 0;
            const xp = stats?.totalXP ?? 0;

            return (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
              >
                <motion.button
                  onClick={() => router.push(`/labs/${lab.id}`)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-gray-900/60 rounded-xl p-4 border border-gray-800 flex items-center gap-4 text-left hover:border-gray-700 transition-colors"
                >
                  <div className="text-2xl">{lab.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{lab.name}</div>
                    <div className="flex gap-4 text-xs text-gray-500 mt-0.5">
                      <span>{sessions} sessions</span>
                      <span>{formatTime(time)}</span>
                      <span>{activity} actions</span>
                      {xp > 0 && <span className="text-purple-400">{xp} XP</span>}
                    </div>
                  </div>
                  <span className="text-gray-500">→</span>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-4 pt-4 flex gap-3"
      >
        <motion.button
          onClick={() => router.push("/labs")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl"
        >
          Explore Labs
        </motion.button>
        <motion.button
          onClick={() => router.push("/labs/creativity")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 bg-gray-800 text-white font-semibold rounded-xl border border-gray-700"
        >
          🎨 Create
        </motion.button>
      </motion.div>
    </div>
  );
}
