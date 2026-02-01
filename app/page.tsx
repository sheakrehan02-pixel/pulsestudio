"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FloatingNotes from "@/components/FloatingNotes";
import { playClickSound } from "@/lib/audio";

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    void playClickSound();
    router.push("/labs");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Animated background notes */}
      <FloatingNotes />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 px-4"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
        >
          Music Lab
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          Explore sound, experiment with music, learn through play
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Enter the Lab</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
            />
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              void playClickSound();
              router.push("/download");
            }}
            className="px-12 py-4 bg-gray-800/80 text-white text-xl font-semibold rounded-full border border-gray-600 hover:border-gray-500 transition-all"
          >
            📥 Download / Install
          </motion.button>
        </div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              void playClickSound();
              router.push("/piano");
            }}
            className="px-6 py-2 bg-gray-800/50 text-gray-300 text-sm font-medium rounded-full border border-gray-700 hover:border-gray-600 transition-colors"
          >
            🎹 Piano
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              void playClickSound();
              router.push("/progress");
            }}
            className="px-6 py-2 bg-gray-800/50 text-gray-300 text-sm font-medium rounded-full border border-gray-700 hover:border-gray-600 transition-colors"
          >
            📊 Progress
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

