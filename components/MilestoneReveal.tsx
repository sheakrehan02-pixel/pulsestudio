"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SeasonMilestone } from "@/lib/season";
import SkillRadar from "@/components/SkillRadar";
import type { SkillScores } from "@/lib/assessment";

interface MilestoneRevealProps {
  milestone: SeasonMilestone;
  scores: SkillScores;
  onComplete: () => void;
}

function ParticleBurst({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: color,
            left: "50%",
            top: "50%",
          }}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos((i / 24) * Math.PI * 2) * (80 + Math.random() * 120),
            y: Math.sin((i / 24) * Math.PI * 2) * (80 + Math.random() * 120),
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.8, delay: 0.6 + i * 0.02, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export default function MilestoneReveal({
  milestone,
  scores,
  onComplete,
}: MilestoneRevealProps) {
  const [phase, setPhase] = useState<"intro" | "reveal" | "insight">("intro");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1800);
    const t2 = setTimeout(() => setPhase("insight"), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(10, 12, 14, 0.95)" }}
    >
      <ParticleBurst color={milestone.color} />

      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${milestone.color}18, transparent)`,
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-md w-full text-center">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5, filter: "blur(8px)" }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="w-24 h-24 mx-auto rounded-full mb-8 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${milestone.color}, ${milestone.color}66)`,
                  boxShadow: `0 0 60px ${milestone.color}88`,
                }}
                animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
              >
                <span className="text-3xl">✦</span>
              </motion.div>
            </motion.div>
          )}

          {(phase === "reveal" || phase === "insight") && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="text-xs uppercase tracking-[0.3em] mb-4 font-medium"
                style={{ color: milestone.color }}
              >
                Milestone Reached
              </div>

              <h1
                className="text-5xl md:text-6xl font-display font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {milestone.name}
              </h1>

              <p className="text-lg italic mb-6" style={{ color: milestone.color }}>
                {milestone.subtitle}
              </p>

              <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
                {milestone.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "insight" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div
              className="rounded-2xl p-5 italic text-sm"
              style={{
                background: `${milestone.color}12`,
                border: `1px solid ${milestone.color}33`,
                color: "var(--text-secondary)",
              }}
            >
              &ldquo;{milestone.insight}&rdquo;
            </div>

            <div className="flex justify-center">
              <SkillRadar scores={scores} size={180} highlightWeak={false} />
            </div>

            <motion.button
              onClick={onComplete}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-full text-lg font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${milestone.color}, ${milestone.color}aa)`,
                boxShadow: `0 8px 32px ${milestone.color}44`,
              }}
            >
              Continue Your Journey
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
