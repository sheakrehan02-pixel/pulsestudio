import type { SkillDomain } from "./assessment";
import { getWeakestDomains } from "./assessment";

export type MilestoneId = "spark" | "wave" | "pulse" | "bloom" | "resonance";

export interface SeasonMilestone {
  id: MilestoneId;
  name: string;
  subtitle: string;
  description: string;
  xpThreshold: number;
  insight: string;
  color: string;
}

export const SEASON_MILESTONES: SeasonMilestone[] = [
  {
    id: "spark",
    name: "Spark",
    subtitle: "The first signal",
    description: "You've entered the studio. Something is awakening.",
    xpThreshold: 0,
    insight: "Every master was once a beginner who refused to quit.",
    color: "#e8b84a",
  },
  {
    id: "wave",
    name: "Wave",
    subtitle: "Momentum builds",
    description: "Patterns are forming. Your ears are opening.",
    xpThreshold: 100,
    insight: "Consistency beats talent when talent doesn't practice.",
    color: "#5a9a8e",
  },
  {
    id: "pulse",
    name: "Pulse",
    subtitle: "Rhythm in your veins",
    description: "You're not visiting music anymore — you're living in it.",
    xpThreshold: 250,
    insight: "The gap between sessions is where growth sleeps. Keep showing up.",
    color: "#d4856a",
  },
  {
    id: "bloom",
    name: "Bloom",
    subtitle: "Skills take root",
    description: "Your weak areas are strengthening. Your identity is sharpening.",
    xpThreshold: 450,
    insight: "What felt impossible last week is becoming instinct.",
    color: "#6ab09a",
  },
  {
    id: "resonance",
    name: "Resonance",
    subtitle: "Full frequency",
    description: "Season complete. You've transformed. A new chapter awaits.",
    xpThreshold: 700,
    insight: "You didn't just learn music — you became more musical.",
    color: "#c9a0dc",
  },
];

export const SEASON_XP_GOAL = 700;

export function getSeasonNumber(seasonStartDate: string): number {
  if (!seasonStartDate) return 1;
  const start = new Date(seasonStartDate);
  const now = new Date();
  const weeks = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, weeks + 1);
}

export function getCurrentMilestone(seasonXP: number): SeasonMilestone {
  let current = SEASON_MILESTONES[0]!;
  for (const m of SEASON_MILESTONES) {
    if (seasonXP >= m.xpThreshold) current = m;
  }
  return current;
}

export function getNextMilestone(seasonXP: number): SeasonMilestone | null {
  for (const m of SEASON_MILESTONES) {
    if (seasonXP < m.xpThreshold) return m;
  }
  return null;
}

export function getMilestoneProgress(seasonXP: number): {
  current: SeasonMilestone;
  next: SeasonMilestone | null;
  percent: number;
  xpToNext: number;
} {
  const current = getCurrentMilestone(seasonXP);
  const next = getNextMilestone(seasonXP);

  if (!next) {
    return { current, next: null, percent: 100, xpToNext: 0 };
  }

  const rangeStart = current.xpThreshold;
  const rangeEnd = next.xpThreshold;
  const progress = seasonXP - rangeStart;
  const range = rangeEnd - rangeStart;
  const percent = Math.min(100, Math.round((progress / range) * 100));

  return {
    current,
    next,
    percent,
    xpToNext: rangeEnd - seasonXP,
  };
}

export function checkNewMilestone(
  previousXP: number,
  currentXP: number,
  claimedMilestones: MilestoneId[]
): SeasonMilestone | null {
  for (const m of SEASON_MILESTONES) {
    if (
      previousXP < m.xpThreshold &&
      currentXP >= m.xpThreshold &&
      !claimedMilestones.includes(m.id)
    ) {
      return m;
    }
  }
  return null;
}

export function getSeasonFocusDomain(
  skillScores: Record<SkillDomain, number>
): SkillDomain {
  return getWeakestDomains(skillScores, 1)[0] ?? "rhythm";
}

export function getStudioSessionBrief(
  streak: number,
  seasonXP: number,
  focusDomain: SkillDomain
): { headline: string; subline: string } {
  const { next, xpToNext } = getMilestoneProgress(seasonXP);

  if (streak >= 7) {
    return {
      headline: `${streak}-day streak. You're in the zone.`,
      subline: next
        ? `${xpToNext} XP to reach ${next.name}`
        : "Season mastered. Keep the fire alive.",
    };
  }

  if (next) {
    return {
      headline: `Today's studio session`,
      subline: `${xpToNext} XP until ${next.name} — focus on ${focusDomain}`,
    };
  }

  return {
    headline: "Your studio awaits",
    subline: "One focused session can change everything.",
  };
}
