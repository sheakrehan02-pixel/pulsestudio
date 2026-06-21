"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AssessmentRunner from "@/components/AssessmentRunner";
import SkillRadar from "@/components/SkillRadar";
import AmbientBackground from "@/components/AmbientBackground";
import FloatingNotes from "@/components/FloatingNotes";
import { getPretestQuestions, getRecommendedLabs } from "@/lib/assessment";
import { savePretestResults } from "@/lib/sessionProgress";
import { LABS } from "@/lib/labs";
import type { SkillScores } from "@/lib/assessment";
import { LabIcon } from "@/components/icons";
import SoundIdentityCard from "@/components/SoundIdentityCard";
import { deriveSoundIdentity, getPersonalizedInsight } from "@/lib/soundIdentity";

export default function AssessmentPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "test" | "results" | "identity" | "recommendations">("intro");
  const [scores, setScores] = useState<SkillScores | null>(null);
  const [questions] = useState(() => getPretestQuestions());

  if (phase === "intro") {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 pb-24">
        <AmbientBackground variant="home" />
        <FloatingNotes />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-lg text-center space-y-6"
        >
          <div className="text-sm uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Skill Assessment
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            Discover Your Musical Profile
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            A quick 12-question diagnostic across rhythm, pitch, harmony, and more.
            Questions are randomized each time. We&apos;ll recommend labs tailored to your strengths and growth areas.
          </p>
          <div className="flex flex-col gap-3">
            <motion.button
              onClick={() => setPhase("test")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-full text-lg font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, var(--accent-teal), #4a8578)",
                boxShadow: "0 4px 24px rgba(90, 154, 142, 0.35)",
              }}
            >
              Start Pretest
            </motion.button>
            <button
              onClick={() => router.push("/labs")}
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Skip for now
            </button>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Takes about 5 minutes · Uses your microphone-free ear training
          </p>
        </motion.div>
      </div>
    );
  }

  if (phase === "test") {
    return (
      <AssessmentRunner
        questions={questions}
        title="Skill Pretest"
        subtitle="Answer each question — there are no wrong answers, only data"
        onComplete={(s) => {
          setScores(s);
          savePretestResults(s);
          setPhase("results");
        }}
      />
    );
  }

  if (phase === "results" && scores) {
    return (
      <div className="min-h-screen pb-24" style={{ background: "var(--bg-deep)" }}>
        <div className="px-4 pt-8 pb-4 text-center">
          <h1 className="text-2xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            Your Skill Profile
          </h1>
        </div>
        <div className="flex justify-center px-4 mb-6">
          <SkillRadar scores={scores} />
        </div>
        <div className="px-4 max-w-md mx-auto">
          <motion.button
            onClick={() => setPhase("identity")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-full text-lg font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, var(--accent-teal), #4a8578)",
              boxShadow: "0 4px 24px rgba(90, 154, 142, 0.35)",
            }}
          >
            Discover Your Sound Identity
          </motion.button>
        </div>
      </div>
    );
  }

  if (phase === "identity" && scores) {
    const archetype = deriveSoundIdentity(scores);
    return (
      <div className="min-h-screen p-4 pb-24 flex flex-col items-center justify-center" style={{ background: "var(--bg-deep)" }}>
        <div className="max-w-lg w-full space-y-6">
          <SoundIdentityCard
            archetype={archetype}
            insight={getPersonalizedInsight(scores)}
          />
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            onClick={() => setPhase("recommendations")}
            whileHover={{ scale: 1.03 }}
            className="w-full py-4 rounded-full text-lg font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${archetype.accent}, ${archetype.accent}aa)`,
            }}
          >
            See Your Recommended Labs
          </motion.button>
        </div>
      </div>
    );
  }

  if (phase === "recommendations" && scores) {
    const recommended = getRecommendedLabs(scores, 3);
    return (
      <div className="min-h-screen p-4 pb-24" style={{ background: "var(--bg-deep)" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
              Labs For You
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              Based on your pretest, focus on these areas first
            </p>
          </div>

          {recommended.map((labId, i) => {
            const lab = LABS.find((l) => l.id === labId);
            if (!lab) return null;
            return (
              <motion.button
                key={labId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => router.push(`/labs/${labId}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-5 rounded-2xl text-left bg-gradient-to-br ${lab.gradient}`}
              >
                <div className="flex items-center gap-3">
                  <LabIcon id={lab.icon} size={28} />
                  <div>
                    <div className="font-semibold text-white">{lab.name}</div>
                    <div className="text-sm text-white/80">{lab.description}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}

          <motion.button
            onClick={() => router.push("/labs")}
            whileHover={{ scale: 1.02 }}
            className="w-full py-4 rounded-full font-semibold text-white"
            style={{ background: "linear-gradient(135deg, var(--accent-teal), #4a8578)" }}
          >
            Explore All Labs
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return null;
}
