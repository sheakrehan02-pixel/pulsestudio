"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FloatingNotes from "@/components/FloatingNotes";
import AmbientBackground from "@/components/AmbientBackground";
import { playClickSound } from "@/lib/audio";
import { needsPretest, needsWeeklyCheck, getSessionData } from "@/lib/sessionProgress";
import { LabIcon } from "@/components/icons";
import { SOUND_ARCHETYPES } from "@/lib/soundIdentity";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showPretestBanner, setShowPretestBanner] = useState(false);
  const [showWeeklyBanner, setShowWeeklyBanner] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowPretestBanner(needsPretest());
    setShowWeeklyBanner(needsWeeklyCheck());
  }, []);

  const handleStart = () => {
    void playClickSound();
    if (needsPretest()) {
      router.push("/assessment");
    } else {
      router.push("/studio");
    }
  };

  const data = mounted ? getSessionData() : null;
  const identity = data?.soundIdentity ? SOUND_ARCHETYPES[data.soundIdentity] : null;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-deep)" }}
    >
      <AmbientBackground variant="home" />
      <FloatingNotes />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="text-center z-10 px-6 max-w-2xl"
      >
        {mounted && showPretestBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-4 py-3 rounded-2xl text-sm"
            style={{
              background: "var(--accent-teal-soft)",
              border: "1px solid rgba(90, 154, 142, 0.35)",
              color: "var(--accent-teal)",
            }}
          >
            New here? Discover your Sound Identity with the skill pretest
          </motion.div>
        )}

        {mounted && showWeeklyBanner && !showPretestBanner && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push("/weekly-check")}
            className="mb-6 w-full px-4 py-3 rounded-2xl text-sm font-medium"
            style={{
              background: "var(--accent-amber-soft)",
              border: "1px solid rgba(232, 184, 74, 0.35)",
              color: "var(--accent-amber)",
            }}
          >
            Weekly progress check is ready — see how you&apos;ve improved
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6 font-medium"
        >
          {identity ? identity.tagline : "Learn through play"}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl font-display font-semibold mb-6 text-[var(--text-primary)] tracking-tight"
        >
          Music Lab
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 leading-relaxed"
        >
          {identity ? (
            <>
              You are <span style={{ color: identity.accent }}>{identity.title}</span>.
              <br />
              Your studio session is ready.
            </>
          ) : (
            <>
              Explore sound with your ears and hands.
              <br />
              12 interactive labs. Your unique Sound Identity awaits.
            </>
          )}
        </motion.p>

        {data && data.pretestComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-8 text-sm"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <span style={{ color: "var(--accent-teal)" }}>Lv.{data.level}</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span style={{ color: "var(--accent-amber)" }} className="flex items-center gap-1">
              {data.streak}<LabIcon id="flame" size={14} />
            </span>
            <span className="text-[var(--text-muted)]">•</span>
            <span style={{ color: "var(--accent-coral)" }}>{data.seasonXP} season XP</span>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(90, 154, 142, 0.45)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            className="px-12 py-4 rounded-full text-lg font-semibold text-white transition-all duration-300 animate-glow-pulse studio-enter-btn"
            style={{
              background: `linear-gradient(135deg, var(--accent-teal) 0%, #4a8578 100%)`,
              boxShadow: "0 4px 24px rgba(90, 154, 142, 0.35)",
            }}
          >
            {showPretestBanner ? "Discover Your Sound Identity" : "Start Studio Session"}
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              void playClickSound();
              router.push("/labs");
            }}
            className="px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 border"
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border-warm)",
              color: "var(--text-secondary)",
            }}
          >
            Explore Labs
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex gap-3 justify-center flex-wrap"
        >
          {[
            { label: "Studio", path: "/studio", style: "teal" as const },
            { label: "Pretest", path: "/assessment", style: "amber" as const },
            { label: "Progress", path: "/progress", style: "coral" as const },
          ].map((btn) => (
            <motion.button
              key={btn.path}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                void playClickSound();
                router.push(btn.path);
              }}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
              style={{
                background:
                  btn.style === "teal"
                    ? "var(--accent-teal-soft)"
                    : btn.style === "amber"
                      ? "var(--accent-amber-soft)"
                      : "var(--accent-coral-soft)",
                color:
                  btn.style === "teal"
                    ? "var(--accent-teal)"
                    : btn.style === "amber"
                      ? "var(--accent-amber)"
                      : "var(--accent-coral)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {btn.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
