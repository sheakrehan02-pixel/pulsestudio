"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LABS } from "@/lib/labs";
import { LabIcon } from "@/components/icons";
import { LabCardIcon } from "@/components/LabCardIcon";
import { playClickSound } from "@/lib/audio";
import FloatingNotes from "@/components/FloatingNotes";
import AmbientBackground from "@/components/AmbientBackground";
import {
  getSessionData,
  getRecommendedLabsFromSession,
  needsPretest,
  needsWeeklyCheck,
} from "@/lib/sessionProgress";
import { DOMAIN_LABELS, getWeakestDomains } from "@/lib/assessment";
import type { LabId } from "@/lib/labs";

export default function LabsPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(getSessionData());
  const [recommended, setRecommended] = useState<LabId[]>([]);

  useEffect(() => {
    const refresh = () => {
      const data = getSessionData();
      setProgress(data);
      setRecommended(getRecommendedLabsFromSession(3));
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const handleLabClick = (labId: string) => {
    void playClickSound();
    router.push(`/labs/${labId}`);
  };

  const weakDomains = progress.pretestComplete
    ? getWeakestDomains(progress.skillScores, 2)
    : [];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--bg-deep)" }}>
      <AmbientBackground variant="labs" />
      <FloatingNotes />

      <div className="relative z-10 p-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 mt-8"
        >
          <div className="flex justify-center gap-3 mb-4 flex-wrap">
            <motion.button
              onClick={() => router.push("/progress")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full text-sm flex items-center gap-2 font-medium"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ color: "var(--accent-teal)" }}>Lv.{progress.level}</span>
              <span className="text-[var(--text-muted)]">•</span>
              <span style={{ color: "var(--accent-amber)" }} className="flex items-center gap-0.5">
                {progress.streak}<LabIcon id="flame" size={14} />
              </span>
            </motion.button>

            {needsPretest() && (
              <motion.button
                onClick={() => router.push("/assessment")}
                whileHover={{ scale: 1.05 }}
                animate={{ boxShadow: ["0 0 0px rgba(90,154,142,0)", "0 0 16px rgba(90,154,142,0.4)", "0 0 0px rgba(90,154,142,0)"] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: "var(--accent-teal-soft)",
                  color: "var(--accent-teal)",
                  border: "1px solid rgba(90,154,142,0.4)",
                }}
              >
                Sound Identity
              </motion.button>
            )}

            {!needsPretest() && (
              <motion.button
                onClick={() => router.push("/studio")}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: "var(--accent-teal-soft)",
                  color: "var(--accent-teal)",
                  border: "1px solid rgba(90,154,142,0.4)",
                }}
              >
                Studio Session
              </motion.button>
            )}

            {needsWeeklyCheck() && !needsPretest() && (
              <motion.button
                onClick={() => router.push("/weekly-check")}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: "var(--accent-amber-soft)",
                  color: "var(--accent-amber)",
                  border: "1px solid rgba(232,184,74,0.4)",
                }}
              >
                Weekly Check
              </motion.button>
            )}
          </div>

          <h1
            className="text-5xl md:text-7xl font-display font-semibold mb-4 tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Music Lab
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            12 labs · Sound Identity · Season Journey
          </p>
        </motion.div>

        {recommended.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto mb-8"
          >
            <div className="text-sm mb-3 font-medium" style={{ color: "var(--text-muted)" }}>
              Recommended for your growth areas
              {weakDomains.length > 0 && (
                <span style={{ color: "var(--accent-coral)" }}>
                  {" "}· {weakDomains.map((d) => DOMAIN_LABELS[d].split(" ")[0]).join(", ")}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recommended.map((labId, i) => {
                const lab = LABS.find((l) => l.id === labId);
                if (!lab) return null;
                return (
                  <motion.button
                    key={labId}
                    onClick={() => handleLabClick(labId)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl text-left bg-gradient-to-br ${lab.gradient} relative overflow-hidden`}
                  >
                    <div className="absolute top-2 right-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white/90">
                      For you
                    </div>
                    <LabCardIcon labId={labId} size={48} />
                    <div className="font-semibold text-white mt-2">{lab.name}</div>
                    <div className="text-xs text-white/80">{lab.description}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LABS.map((lab, index) => {
            const isRecommended = recommended.includes(lab.id);
            return (
              <motion.button
                key={lab.id}
                onClick={() => handleLabClick(lab.id)}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                disabled={!lab.unlocked}
                className={`
                  relative p-7 rounded-2xl text-left lab-card-shine
                  bg-gradient-to-br ${lab.gradient}
                  ${lab.unlocked ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed"}
                  transition-all duration-300 overflow-hidden group
                  ${isRecommended ? "ring-2 ring-white/30" : ""}
                `}
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
              >
                <div className="absolute inset-0 opacity-20">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.5), transparent 50%)",
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <LabCardIcon labId={lab.id} size={64} />
                    <LabIcon id={lab.icon} size={20} className="text-white/40" />
                  </div>
                  <h2 className="text-xl font-semibold text-white/95 mb-1.5 font-display">
                    {lab.name}
                  </h2>
                  <p className="text-white/85 text-sm leading-relaxed">{lab.description}</p>
                </div>

                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: "linear-gradient(to bottom right, rgba(255,255,255,0.12), transparent)",
                  }}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
