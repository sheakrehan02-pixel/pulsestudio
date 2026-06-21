"use client";

import { motion } from "framer-motion";
import { SEASON_MILESTONES, getMilestoneProgress } from "@/lib/season";
import type { MilestoneId } from "@/lib/season";

interface SeasonJourneyProps {
  seasonXP: number;
  claimedMilestones: MilestoneId[];
  seasonNumber?: number;
}

export default function SeasonJourney({
  seasonXP,
  claimedMilestones,
  seasonNumber = 1,
}: SeasonJourneyProps) {
  const { current, next, percent, xpToNext } = getMilestoneProgress(seasonXP);

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Season {seasonNumber}
          </div>
          <div className="text-xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            {current.name}
            <span className="text-sm font-normal ml-2" style={{ color: current.color }}>
              {current.subtitle}
            </span>
          </div>
        </div>
        {next && (
          <div className="text-right text-xs" style={{ color: "var(--text-muted)" }}>
            <div>{xpToNext} XP to {next.name}</div>
            <div style={{ color: next.color }}>{percent}%</div>
          </div>
        )}
      </div>

      <div className="relative px-2">
        <div
          className="absolute top-5 left-4 right-4 h-0.5"
          style={{ background: "var(--border-subtle)" }}
        />
        <motion.div
          className="absolute top-5 left-4 h-0.5 origin-left"
          style={{
            background: `linear-gradient(90deg, ${current.color}, ${next?.color ?? current.color})`,
            width: `calc((100% - 2rem) * ${seasonXP / 700})`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="relative flex justify-between">
          {SEASON_MILESTONES.map((m, i) => {
            const reached = seasonXP >= m.xpThreshold;
            const claimed = claimedMilestones.includes(m.id);
            const isCurrent = current.id === m.id;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="flex flex-col items-center"
                style={{ width: `${100 / SEASON_MILESTONES.length}%` }}
              >
                <motion.div
                  className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: reached
                      ? `linear-gradient(135deg, ${m.color}, ${m.color}88)`
                      : "var(--bg-surface)",
                    border: isCurrent
                      ? `2px solid ${m.color}`
                      : "2px solid var(--border-subtle)",
                    color: reached ? "white" : "var(--text-muted)",
                    boxShadow: isCurrent ? `0 0 24px ${m.color}66` : "none",
                  }}
                  animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {claimed ? "✓" : i + 1}
                </motion.div>
                <div
                  className="text-[10px] mt-2 text-center font-medium"
                  style={{ color: reached ? m.color : "var(--text-muted)" }}
                >
                  {m.name}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {next && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 rounded-xl p-4 text-center"
          style={{
            background: `${next.color}15`,
            border: `1px solid ${next.color}33`,
          }}
        >
          <p className="text-sm italic" style={{ color: "var(--text-secondary)" }}>
            {next.description}
          </p>
        </motion.div>
      )}
    </div>
  );
}
