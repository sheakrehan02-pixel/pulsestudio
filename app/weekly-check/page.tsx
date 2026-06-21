"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AssessmentRunner, { AssessmentResults } from "@/components/AssessmentRunner";
import SkillRadar from "@/components/SkillRadar";
import {
  getWeeklyCheckQuestions,
  mergeSkillScores,
  getScoreDelta,
  getISOWeekKey,
  type SkillScores,
  type WeeklyCheckRecord,
} from "@/lib/assessment";
import {
  getSessionData,
  saveWeeklyCheckResults,
  needsPretest,
} from "@/lib/sessionProgress";

export default function WeeklyCheckPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"gate" | "test" | "results">("gate");
  const [scores, setScores] = useState<SkillScores | null>(null);
  const [delta, setDelta] = useState<Partial<SkillScores>>({});
  const [beforeScores, setBeforeScores] = useState<SkillScores | null>(null);
  const data = getSessionData();

  useEffect(() => {
    if (needsPretest()) {
      router.replace("/assessment");
    }
  }, [router]);

  if (phase === "gate") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 pb-24" style={{ background: "var(--bg-deep)" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center space-y-6"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ background: "var(--accent-amber-soft)", color: "var(--accent-amber)" }}
          >
            Weekly Progress Check
          </div>
          <h1 className="text-3xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            How Much Have You Grown?
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Take a quick 8-question check focused on your growth areas.
            Compare results to your baseline and track improvement over time.
          </p>

          {data.weeklyCheckHistory.length > 0 && (
            <div
              className="rounded-xl p-4 text-left text-sm"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
            >
              <div style={{ color: "var(--text-muted)" }}>Last check</div>
              <div style={{ color: "var(--text-primary)" }}>{data.lastWeeklyCheckDate}</div>
            </div>
          )}

          <motion.button
            onClick={() => {
              setBeforeScores({ ...data.skillScores });
              setPhase("test");
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-full text-lg font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, var(--accent-amber), var(--accent-coral))",
            }}
          >
            Start Weekly Check
          </motion.button>
          <button
            onClick={() => router.push("/progress")}
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Back to Progress
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === "test" && beforeScores) {
    const questions = getWeeklyCheckQuestions(beforeScores);
    return (
      <AssessmentRunner
        questions={questions}
        title="Weekly Check"
        subtitle="Same skills, new questions — let's see your progress"
        onComplete={(incoming, answers) => {
          const merged = mergeSkillScores(beforeScores, incoming, 0.5);
          const d = getScoreDelta(beforeScores, merged);
          const totalCorrect = Object.values(answers).filter((a) => a.correct).length;
          const record: WeeklyCheckRecord = {
            weekKey: getISOWeekKey(),
            date: new Date().toISOString().slice(0, 10),
            scores: merged,
            delta: d,
            totalCorrect,
            totalQuestions: questions.length,
          };
          saveWeeklyCheckResults(merged, record);
          setScores(merged);
          setDelta(d);
          setPhase("results");
        }}
      />
    );
  }

  if (phase === "results" && scores && beforeScores) {
    return (
      <div className="min-h-screen pb-24" style={{ background: "var(--bg-deep)" }}>
        <div className="flex justify-center px-4 pt-8 mb-4">
          <SkillRadar scores={scores} />
        </div>
        <AssessmentResults
          scores={scores}
          delta={delta}
          isWeekly
          onContinue={() => router.push("/progress")}
        />
      </div>
    );
  }

  return null;
}
