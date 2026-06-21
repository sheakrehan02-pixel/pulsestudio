"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  getSessionData,
  getSuggestedLab,
  getWeeklyProgress,
  getLabStats,
  getRecommendedLabsFromSession,
  needsPretest,
  needsWeeklyCheck,
} from "@/lib/sessionProgress";
import { LABS } from "@/lib/labs";
import { LabIcon } from "@/components/icons";
import SkillRadar from "@/components/SkillRadar";
import AmbientBackground from "@/components/AmbientBackground";
import SeasonJourney from "@/components/SeasonJourney";
import SoundIdentityCard from "@/components/SoundIdentityCard";
import { DOMAIN_LABELS, getWeakestDomains, getSkillLevelLabel } from "@/lib/assessment";
import { SOUND_ARCHETYPES } from "@/lib/soundIdentity";
import { getSeasonNumber } from "@/lib/season";
import type { LabId } from "@/lib/labs";

export default function ProgressPage() {
  const router = useRouter();
  const [data, setData] = useState(getSessionData());
  const [suggestedLab, setSuggestedLab] = useState<LabId | null>(null);
  const [recommended, setRecommended] = useState<LabId[]>([]);
  const [weekly, setWeekly] = useState(getWeeklyProgress());

  const refresh = () => {
    setData(getSessionData());
    setSuggestedLab(getSuggestedLab());
    setRecommended(getRecommendedLabsFromSession(3));
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
    "You're building something beautiful",
    "Every moment counts",
    "Music is in your hands",
    "Progress, not perfection",
    "Keep the momentum",
    "You're growing",
  ];
  const message =
    encouragingMessages[
      Math.floor(Math.random() * encouragingMessages.length)
    ];

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${hrs}h ${m}m` : `${hrs}h`;
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 relative" style={{ background: "var(--bg-deep)" }}>
      <AmbientBackground variant="subtle" />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden z-10"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(90, 154, 142, 0.06) 0%, transparent 60%)",
          }}
        />
        <div className="relative px-4 pt-8 pb-6">
          <h1 className="text-2xl font-display font-semibold mb-1 text-[var(--text-primary)]">
            Your Progress
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {message}
          </p>

          {/* Level & XP Row */}
          <div className="flex gap-3 mb-4">
            <div
              className="flex-1 rounded-xl p-4 backdrop-blur-sm"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Level
              </div>
              <div
                className="text-2xl font-semibold"
                style={{ color: "var(--accent-teal)" }}
              >
                {data.level}
              </div>
            </div>
            <div
              className="flex-1 rounded-xl p-4 backdrop-blur-sm"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Total XP
              </div>
              <div
                className="text-2xl font-semibold"
                style={{ color: "var(--accent-coral)" }}
              >
                {data.totalXP}
              </div>
            </div>
            <div
              className="flex-1 rounded-xl p-4 backdrop-blur-sm"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Streak
              </div>
              <div
                className="text-2xl font-semibold flex items-center gap-1"
                style={{ color: "var(--accent-amber)" }}
              >
                {data.streak}{" "}
                <LabIcon id="flame" size={20} style={{ opacity: 0.9 }} />
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div
            className="rounded-xl p-4 backdrop-blur-sm"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex justify-between text-xs mb-2">
              <span style={{ color: "var(--text-secondary)" }}>
                Level {data.level} Progress
              </span>
              <span style={{ color: "var(--text-muted)" }}>
                {xpInLevel}/100 XP
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "var(--bg-surface)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, var(--accent-teal), var(--accent-amber))",
                }}
              />
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              {xpForNext} XP to Level {data.level + 1}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Season Journey — the X factor progress path */}
      {data.pretestComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="px-4 mb-4 z-10"
        >
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <SeasonJourney
              seasonXP={data.seasonXP}
              claimedMilestones={data.claimedMilestones}
              seasonNumber={getSeasonNumber(data.seasonStartDate)}
            />
            <motion.button
              onClick={() => router.push("/studio")}
              whileHover={{ scale: 1.01 }}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-white text-sm"
              style={{ background: "linear-gradient(135deg, var(--accent-teal), #4a8578)" }}
            >
              Start Studio Session
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Sound Identity */}
      {data.soundIdentity && SOUND_ARCHETYPES[data.soundIdentity] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="px-4 mb-4 z-10"
        >
          <SoundIdentityCard
            archetype={SOUND_ARCHETYPES[data.soundIdentity]}
            compact
            reveal={false}
          />
        </motion.div>
      )}

      {/* Pretest / Weekly Check CTAs */}
      {(needsPretest() || needsWeeklyCheck()) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 mb-4 z-10">
          {needsPretest() ? (
            <motion.button
              onClick={() => router.push("/assessment")}
              whileHover={{ scale: 1.01 }}
              className="w-full rounded-xl p-4 text-left"
              style={{
                background: "var(--accent-teal-soft)",
                border: "1px solid rgba(90, 154, 142, 0.35)",
              }}
            >
              <div className="font-semibold" style={{ color: "var(--accent-teal)" }}>
                Take the Skill Pretest
              </div>
              <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Get personalized lab recommendations based on your abilities
              </div>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => router.push("/weekly-check")}
              whileHover={{ scale: 1.01 }}
              className="w-full rounded-xl p-4 text-left"
              style={{
                background: "var(--accent-amber-soft)",
                border: "1px solid rgba(232, 184, 74, 0.35)",
              }}
            >
              <div className="font-semibold" style={{ color: "var(--accent-amber)" }}>
                Weekly Progress Check Available
              </div>
              <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                See if you&apos;ve improved in your focus areas this week
              </div>
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Skill Radar */}
      {data.pretestComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="px-4 mb-4 z-10"
        >
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold font-display" style={{ color: "var(--text-primary)" }}>
                Skill Profile
              </h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--accent-teal-soft)", color: "var(--accent-teal)" }}>
                {getSkillLevelLabel(
                  Math.round(
                    Object.values(data.skillScores).reduce((a, b) => a + b, 0) /
                      Object.values(data.skillScores).length
                  )
                )}
              </span>
            </div>
            <SkillRadar scores={data.skillScores} />
            {getWeakestDomains(data.skillScores, 2).length > 0 && (
              <p className="text-xs mt-4 text-center" style={{ color: "var(--text-muted)" }}>
                Focus areas: {getWeakestDomains(data.skillScores, 2).map((d) => DOMAIN_LABELS[d]).join(" · ")}
              </p>
            )}

            {data.baselineScores && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="text-xs mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Since Pretest
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(data.skillScores) as (keyof typeof data.skillScores)[]).map((domain) => {
                    const delta = data.skillScores[domain] - (data.baselineScores?.[domain] ?? 50);
                    if (Math.abs(delta) < 1) return null;
                    return (
                      <div key={domain} className="flex justify-between text-xs">
                        <span style={{ color: "var(--text-secondary)" }}>{DOMAIN_LABELS[domain].split(" ")[0]}</span>
                        <span style={{ color: delta > 0 ? "var(--accent-teal)" : "var(--accent-coral)" }}>
                          {delta > 0 ? "+" : ""}{delta}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Weekly Check History */}
      {data.weeklyCheckHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
          className="px-4 mb-4 z-10"
        >
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold font-display" style={{ color: "var(--text-primary)" }}>
                Weekly Progress
              </h2>
              {needsWeeklyCheck() && (
                <button
                  onClick={() => router.push("/weekly-check")}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: "var(--accent-amber-soft)", color: "var(--accent-amber)" }}
                >
                  Check due
                </button>
              )}
            </div>
            <div className="space-y-2">
              {data.weeklyCheckHistory.slice(-4).reverse().map((record) => (
                <div
                  key={record.weekKey}
                  className="flex justify-between items-center py-2 px-3 rounded-lg text-sm"
                  style={{ background: "var(--bg-surface)" }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>{record.date}</span>
                  <span style={{ color: "var(--accent-teal)" }}>
                    {record.totalCorrect}/{record.totalQuestions} correct
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    {Math.round(
                      Object.values(record.scores).reduce((a, b) => a + b, 0) /
                        Object.values(record.scores).length
                    )} avg
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Weekly Goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 mb-4"
      >
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--accent-teal-soft)",
            border: "1px solid rgba(90, 154, 142, 0.3)",
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--accent-teal)" }}
            >
              Weekly Goal
            </span>
            <span
              className="text-sm"
              style={{ color: "var(--accent-teal)", opacity: 0.9 }}
            >
              {weekly.minutes} / {weekly.goal} min
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(0,0,0,0.1)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, weekly.percent)}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: "var(--accent-teal)" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Recommended Labs (weakness-based) */}
      {recommended.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="px-4 mb-4 z-10"
        >
          <div className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
            Recommended for your growth areas
          </div>
          <div className="space-y-2">
            {recommended.map((labId) => {
              const lab = LABS.find((l) => l.id === labId);
              if (!lab) return null;
              return (
                <motion.button
                  key={labId}
                  onClick={() => router.push(`/labs/${labId}`)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full rounded-xl p-4 text-left flex items-center gap-4"
                  style={{
                    background: "var(--accent-teal-soft)",
                    border: "1px solid rgba(90, 154, 142, 0.3)",
                  }}
                >
                  <LabIcon id={lab.icon} size={28} />
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {lab.name}
                    </div>
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {lab.description}
                    </div>
                  </div>
                  <span style={{ color: "var(--accent-teal)" }}>→</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Suggested Next Lab */}
      {suggestedLab && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-4 mb-4"
        >
          <div
            className="text-sm mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Suggested for you
          </div>
          <motion.button
            onClick={() => router.push(`/labs/${suggestedLab}`)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full rounded-xl p-4 text-left flex items-center gap-4"
            style={{
              background: "var(--accent-coral-soft)",
              border: "1px solid var(--border-warm)",
            }}
          >
            {(() => {
              const lab = LABS.find((l) => l.id === suggestedLab);
              return (
                <>
                  <div className="flex items-center">
                    <LabIcon id={lab?.icon ?? "music"} size={28} />
                  </div>
                  <div className="flex-1">
                    <div
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Try {lab?.name ?? suggestedLab}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {lab?.description}
                    </div>
                  </div>
                  <span
                    className="text-lg"
                    style={{ color: "var(--accent-coral)" }}
                  >
                    →
                  </span>
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
        className="px-4 flex-1 z-10"
      >
        <h2
          className="text-lg font-semibold mb-3 font-display"
          style={{ color: "var(--text-primary)" }}
        >
          Lab Activity
        </h2>
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
                  className="w-full rounded-xl p-4 flex items-center gap-4 text-left transition-colors"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex items-center">
                    <LabIcon id={lab.icon} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {lab.name}
                    </div>
                    <div
                      className="flex gap-4 text-xs mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <span>{sessions} sessions</span>
                      <span>{formatTime(time)}</span>
                      <span>{activity} actions</span>
                      {xp > 0 && (
                        <span style={{ color: "var(--accent-coral)" }}>
                          {xp} XP
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: "var(--text-muted)" }}>→</span>
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
          className="flex-1 py-3 font-semibold rounded-xl text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-teal), #4a8578)",
          }}
        >
          Explore Labs
        </motion.button>
        <motion.button
          onClick={() => router.push("/labs/creativity")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 font-semibold rounded-xl"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-warm)",
            color: "var(--text-secondary)",
          }}
        >
          Create
        </motion.button>
      </motion.div>
    </div>
  );
}
