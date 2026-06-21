"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AmbientBackground from "@/components/AmbientBackground";
import SoundIdentityCard from "@/components/SoundIdentityCard";
import SeasonJourney from "@/components/SeasonJourney";
import MilestoneReveal from "@/components/MilestoneReveal";
import SkillRadar from "@/components/SkillRadar";
import { LabIcon } from "@/components/icons";
import { playClickSound } from "@/lib/audio";
import {
  getSessionData,
  getSuggestedLab,
  needsPretest,
  completeStudioSession,
  claimMilestone,
  getPendingMilestone,
} from "@/lib/sessionProgress";
import { LABS } from "@/lib/labs";
import { SOUND_ARCHETYPES, getMicroLessonForDomain, getPersonalizedInsight } from "@/lib/soundIdentity";
import { getSeasonNumber, getSeasonFocusDomain, getStudioSessionBrief } from "@/lib/season";
import { DOMAIN_LABELS } from "@/lib/assessment";

type Phase = "intro" | "identity" | "focus" | "launch" | "milestone";

export default function StudioPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [mounted, setMounted] = useState(false);
  const [pendingMilestone, setPendingMilestone] = useState<ReturnType<typeof getPendingMilestone>>(null);

  useEffect(() => {
    setMounted(true);
    if (needsPretest()) {
      router.replace("/assessment");
      return;
    }
    const pending = getPendingMilestone();
    if (pending && pending.id !== "spark") {
      setPendingMilestone(pending);
      setPhase("milestone");
    }
  }, [router]);

  const data = mounted ? getSessionData() : null;

  const archetype = useMemo(() => {
    if (!data?.soundIdentity) return null;
    return SOUND_ARCHETYPES[data.soundIdentity];
  }, [data?.soundIdentity]);

  const focusDomain = data ? getSeasonFocusDomain(data.skillScores) : "rhythm";
  const microLesson = useMemo(() => getMicroLessonForDomain(focusDomain), [focusDomain]);
  const suggestedLab = mounted ? getSuggestedLab() : null;
  const lab = suggestedLab ? LABS.find((l) => l.id === suggestedLab) : null;
  const brief = data
    ? getStudioSessionBrief(data.streak, data.seasonXP, focusDomain)
    : { headline: "", subline: "" };

  const handleLaunchLab = () => {
    void playClickSound();
    completeStudioSession();
    if (suggestedLab) router.push(`/labs/${suggestedLab}`);
    else router.push("/labs");
  };

  if (!mounted || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-deep)" }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Opening the studio...
        </motion.div>
      </div>
    );
  }

  if (phase === "milestone" && pendingMilestone) {
    return (
      <MilestoneReveal
        milestone={pendingMilestone}
        scores={data.skillScores}
        onComplete={() => {
          claimMilestone(pendingMilestone.id);
          setPendingMilestone(null);
          setPhase("intro");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-24" style={{ background: "var(--bg-deep)" }}>
      <AmbientBackground variant="home" />

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10"
          >
            <motion.div
              className="flex items-end justify-center gap-1 h-24 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {Array.from({ length: 32 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{ background: "var(--accent-teal)" }}
                  animate={{
                    height: [8, 12 + Math.sin(i * 0.5) * 40, 8],
                  }}
                  transition={{
                    duration: 0.8 + (i % 5) * 0.1,
                    repeat: Infinity,
                    delay: i * 0.03,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.9 }}
              className="text-center max-w-lg"
            >
              <div className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "var(--text-muted)" }}>
                Studio Session
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                {brief.headline}
              </h1>
              <p className="text-lg mb-2" style={{ color: "var(--text-secondary)" }}>{brief.subline}</p>
              <p className="text-sm italic" style={{ color: "var(--accent-teal)" }}>
                {getPersonalizedInsight(data.skillScores)}
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                void playClickSound();
                setPhase(archetype ? "identity" : "focus");
              }}
              className="mt-12 px-12 py-4 rounded-full text-lg font-semibold text-white studio-enter-btn"
              style={{
                background: "linear-gradient(135deg, var(--accent-teal), #4a8578)",
                boxShadow: "0 8px 40px rgba(90, 154, 142, 0.45)",
              }}
            >
              Enter the Studio
            </motion.button>
          </motion.div>
        )}

        {phase === "identity" && archetype && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10"
          >
            <SoundIdentityCard
              archetype={archetype}
              insight={getPersonalizedInsight(data.skillScores)}
            />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={() => { void playClickSound(); setPhase("focus"); }}
              className="mt-8 px-10 py-3 rounded-full font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${archetype.accent}, ${archetype.accent}aa)` }}
            >
              Continue
            </motion.button>
          </motion.div>
        )}

        {phase === "focus" && (
          <motion.div
            key="focus"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="min-h-screen px-4 pt-12 pb-24 relative z-10 max-w-lg mx-auto space-y-6"
          >
            <div className="text-center">
              <div className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--accent-amber)" }}>
                Today&apos;s Focus
              </div>
              <h2 className="text-3xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
                {DOMAIN_LABELS[focusDomain]}
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="text-sm font-semibold mb-2" style={{ color: "var(--accent-teal)" }}>
                {microLesson.title}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                {microLesson.insight}
              </p>
              <div
                className="rounded-xl p-3 text-xs"
                style={{ background: "var(--accent-teal-soft)", color: "var(--accent-teal)" }}
              >
                <strong>Try this:</strong> {microLesson.practice}
              </div>
            </motion.div>

            <div className="flex justify-center">
              <SkillRadar scores={data.skillScores} size={180} />
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
            >
              <SeasonJourney
                seasonXP={data.seasonXP}
                claimedMilestones={data.claimedMilestones}
                seasonNumber={getSeasonNumber(data.seasonStartDate)}
              />
            </div>

            <motion.button
              onClick={() => { void playClickSound(); setPhase("launch"); }}
              whileHover={{ scale: 1.02 }}
              className="w-full py-4 rounded-full font-semibold text-white"
              style={{ background: "linear-gradient(135deg, var(--accent-teal), #4a8578)" }}
            >
              I&apos;m Ready
            </motion.button>
          </motion.div>
        )}

        {phase === "launch" && lab && (
          <motion.div
            key="launch"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-full max-w-md p-8 rounded-3xl bg-gradient-to-br ${lab.gradient} relative overflow-hidden`}
              style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 text-center text-white">
                <div className="text-xs uppercase tracking-[0.2em] mb-4 opacity-80">
                  Your Session Lab
                </div>
                <div className="flex justify-center mb-4">
                  <LabIcon id={lab.icon} size={48} />
                </div>
                <h2 className="text-3xl font-display font-semibold mb-2">{lab.name}</h2>
                <p className="text-white/85 text-sm mb-6">{lab.description}</p>
                <p className="text-xs italic text-white/70 mb-6">
                  {microLesson.practice}
                </p>
                <motion.button
                  onClick={handleLaunchLab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-4 rounded-full font-bold text-lg"
                  style={{ background: "rgba(255,255,255,0.95)", color: "#1c2426" }}
                >
                  Start Session →
                </motion.button>
              </div>
            </motion.div>

            <button
              onClick={() => router.push("/labs")}
              className="mt-6 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Browse all labs instead
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
