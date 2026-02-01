"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LABS } from "@/lib/labs";
import { playClickSound } from "@/lib/audio";
import FloatingNotes from "@/components/FloatingNotes";
import { getSessionData } from "@/lib/sessionProgress";

export default function LabsPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(getSessionData());

  useEffect(() => {
    const refresh = () => setProgress(getSessionData());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const handleLabClick = (labId: string) => {
    void playClickSound();
    router.push(`/labs/${labId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] relative overflow-hidden">
      <FloatingNotes />
      
      <div className="relative z-10 p-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 mt-8"
        >
          <div className="flex justify-center gap-4 mb-4">
            <motion.button
              onClick={() => router.push("/progress")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gray-800/80 rounded-full text-sm flex items-center gap-2 border border-gray-700"
            >
              <span className="text-blue-400 font-semibold">Lv.{progress.level}</span>
              <span className="text-gray-400">•</span>
              <span className="text-amber-400">{progress.streak}🔥</span>
            </motion.button>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Music Lab
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore sound, experiment with music, learn through play
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LABS.map((lab, index) => (
            <motion.button
              key={lab.id}
              onClick={() => handleLabClick(lab.id)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              disabled={!lab.unlocked}
              className={`
                relative p-8 rounded-3xl text-left
                bg-gradient-to-br ${lab.gradient}
                ${lab.unlocked ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed"}
                shadow-2xl hover:shadow-3xl transition-all duration-300
                overflow-hidden group
              `}
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)] animate-pulse" />
              </div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">{lab.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">{lab.name}</h2>
                <p className="text-white/80 text-sm">{lab.description}</p>
                
                {!lab.unlocked && (
                  <div className="mt-4 text-white/60 text-sm">🔒 Coming soon</div>
                )}
              </div>

              {/* Hover effect */}
              <motion.div
                className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />
            </motion.button>
          ))}
        </div>

        {/* Footer message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 text-gray-500 text-sm"
        >
          <p>🎵 No lessons. No tests. Just music. 🎵</p>
        </motion.div>
      </div>
    </div>
  );
}

