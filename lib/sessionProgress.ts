// Session-based progress tracking for Music Lab
// Persists to localStorage for cross-session continuity

import type { LabId } from "./labs";
import {
  type SkillScores,
  type WeeklyCheckRecord,
  getDefaultSkillScores,
  getISOWeekKey,
  getRecommendedLabs,
  isWeeklyCheckDue,
  LAB_TO_DOMAIN,
} from "./assessment";
import type { MilestoneId } from "./season";
import { SEASON_MILESTONES } from "./season";
import type { SeasonMilestone } from "./season";
import type { SoundArchetypeId } from "./soundIdentity";
import { deriveSoundIdentity } from "./soundIdentity";

export interface LabSession {
  labId: LabId;
  startedAt: number;
  durationMs: number;
  activityCount: number;
  xpEarned: number;
}

export interface LabStats {
  labId: LabId;
  totalSessions: number;
  totalTimeMs: number;
  totalActivity: number;
  totalXP: number;
  lastVisit: number;
}

export interface UserSessionData {
  totalXP: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  labStats: Record<LabId, LabStats>;
  weeklyGoal: number;
  weeklyMinutes: number;
  weekKey: string;
  pretestComplete: boolean;
  skillScores: SkillScores;
  baselineScores: SkillScores | null;
  lastWeeklyCheckDate: string;
  weeklyCheckHistory: WeeklyCheckRecord[];
  soundIdentity: SoundArchetypeId | null;
  seasonXP: number;
  seasonStartDate: string;
  claimedMilestones: MilestoneId[];
  lastStudioSessionDate: string;
  studioSessionsCompleted: number;
}

const STORAGE_KEY = "music-lab-progress";

function getDefaultData(): UserSessionData {
  return {
    totalXP: 0,
    level: 1,
    streak: 0,
    lastActiveDate: "",
    labStats: {} as Record<LabId, LabStats>,
    weeklyGoal: 30,
    weeklyMinutes: 0,
    weekKey: getISOWeekKey(),
    pretestComplete: false,
    skillScores: getDefaultSkillScores(),
    baselineScores: null,
    lastWeeklyCheckDate: "",
    weeklyCheckHistory: [],
    soundIdentity: null,
    seasonXP: 0,
    seasonStartDate: "",
    claimedMilestones: [],
    lastStudioSessionDate: "",
    studioSessionsCompleted: 0,
  };
}

function normalizeWeek(data: UserSessionData): UserSessionData {
  const currentWeek = getISOWeekKey();
  if (data.weekKey !== currentWeek) {
    return { ...data, weekKey: currentWeek, weeklyMinutes: 0 };
  }
  return data;
}

function loadData(): UserSessionData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw) as Partial<UserSessionData>;
    const merged: UserSessionData = {
      ...getDefaultData(),
      ...parsed,
      skillScores: { ...getDefaultSkillScores(), ...parsed.skillScores },
      weeklyCheckHistory: parsed.weeklyCheckHistory ?? [],
      claimedMilestones: parsed.claimedMilestones ?? [],
    };
    if (merged.pretestComplete && !merged.soundIdentity) {
      merged.soundIdentity = deriveSoundIdentity(merged.skillScores).id;
    }
    if (merged.pretestComplete && !merged.seasonStartDate) {
      merged.seasonStartDate = merged.lastWeeklyCheckDate || new Date().toISOString().slice(0, 10);
    }
    if (merged.pretestComplete && merged.claimedMilestones.length === 0) {
      merged.claimedMilestones = ["spark"];
    }
    return normalizeWeek(merged);
  } catch {
    return getDefaultData();
  }
}

function saveData(data: UserSessionData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getSessionData(): UserSessionData {
  return loadData();
}

function updateStreak(data: UserSessionData, today: string): UserSessionData {
  if (!data.lastActiveDate) {
    return { ...data, streak: 1, lastActiveDate: today };
  }
  const last = new Date(data.lastActiveDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return data;
  if (diffDays === 1) return { ...data, streak: data.streak + 1, lastActiveDate: today };
  return { ...data, streak: 1, lastActiveDate: today };
}

export function recordLabSession(session: LabSession): void {
  const data = normalizeWeek(loadData());
  const today = new Date().toISOString().slice(0, 10);
  const updated = updateStreak(data, today);

  const labStats = { ...updated.labStats };
  const existing = labStats[session.labId] || {
    labId: session.labId,
    totalSessions: 0,
    totalTimeMs: 0,
    totalActivity: 0,
    totalXP: 0,
    lastVisit: 0,
  };

  labStats[session.labId] = {
    ...existing,
    totalSessions: existing.totalSessions + 1,
    totalTimeMs: existing.totalTimeMs + session.durationMs,
    totalActivity: existing.totalActivity + session.activityCount,
    totalXP: existing.totalXP + session.xpEarned,
    lastVisit: Date.now(),
  };

  const totalXP = updated.totalXP + session.xpEarned;
  const level = Math.floor(totalXP / 100) + 1;
  const weeklyMinutes = updated.weeklyMinutes + session.durationMs / 60000;
  const seasonXP = updated.seasonXP + session.xpEarned;

  saveData({
    ...updated,
    totalXP,
    level,
    labStats,
    lastActiveDate: today,
    weeklyMinutes,
    seasonXP,
  });
}

export function savePretestResults(scores: SkillScores): void {
  const data = normalizeWeek(loadData());
  const identity = deriveSoundIdentity(scores);
  const today = new Date().toISOString().slice(0, 10);
  saveData({
    ...data,
    pretestComplete: true,
    skillScores: scores,
    baselineScores: scores,
    lastWeeklyCheckDate: today,
    soundIdentity: identity.id,
    seasonStartDate: data.seasonStartDate || today,
    claimedMilestones: data.claimedMilestones.length ? data.claimedMilestones : ["spark"],
  });
}

export function saveWeeklyCheckResults(
  scores: SkillScores,
  record: WeeklyCheckRecord
): void {
  const data = normalizeWeek(loadData());
  saveData({
    ...data,
    skillScores: scores,
    lastWeeklyCheckDate: new Date().toISOString().slice(0, 10),
    weeklyCheckHistory: [...data.weeklyCheckHistory.slice(-11), record],
  });
}

export function getLabStats(labId: LabId): LabStats | null {
  return loadData().labStats[labId] || null;
}

export function getSuggestedLab(): LabId | null {
  const data = loadData();
  if (data.pretestComplete) {
    const recommended = getRecommendedLabs(data.skillScores, 1);
    if (recommended[0]) return recommended[0];
  }
  const labs: LabId[] = [
    "rhythm", "pitch", "sound-design", "pattern", "harmony", "creativity",
    "tempo", "intervals", "dynamics", "memory", "scales", "groove",
  ];
  let minTime = Infinity;
  let suggested: LabId | null = null;

  for (const labId of labs) {
    const stats = data.labStats[labId];
    const time = stats?.totalTimeMs ?? 0;
    if (time < minTime) {
      minTime = time;
      suggested = labId;
    }
  }
  return suggested;
}

export function getRecommendedLabsFromSession(count = 3): LabId[] {
  const data = loadData();
  if (data.pretestComplete) {
    const recentLabIds = (Object.entries(data.labStats) as [LabId, LabStats][])
      .sort((a, b) => (b[1].lastVisit ?? 0) - (a[1].lastVisit ?? 0))
      .slice(0, 4)
      .map(([id]) => id);
    return getRecommendedLabs(data.skillScores, count, recentLabIds);
  }
  return [];
}

/** Update skill score for a domain based on lab quiz performance (0-100) */
export function recordLabQuizScore(labId: LabId, quizScore: number): void {
  const data = normalizeWeek(loadData());
  const domain = LAB_TO_DOMAIN[labId];
  if (!domain) return;

  const clamped = Math.max(0, Math.min(100, quizScore));
  const existing = data.skillScores[domain];
  const updated = Math.round(existing * 0.7 + clamped * 0.3);

  saveData({
    ...data,
    skillScores: { ...data.skillScores, [domain]: updated },
  });
}

export function needsPretest(): boolean {
  return !loadData().pretestComplete;
}

export function needsWeeklyCheck(): boolean {
  const data = loadData();
  if (!data.pretestComplete) return false;
  return isWeeklyCheckDue(data.lastWeeklyCheckDate);
}

export function getWeeklyProgress(): { minutes: number; goal: number; percent: number } {
  const data = normalizeWeek(loadData());
  const percent = Math.min(100, Math.round((data.weeklyMinutes / data.weeklyGoal) * 100));
  return {
    minutes: Math.round(data.weeklyMinutes * 10) / 10,
    goal: data.weeklyGoal,
    percent,
  };
}

export function completeStudioSession(): void {
  const data = normalizeWeek(loadData());
  const today = new Date().toISOString().slice(0, 10);
  const updated = updateStreak(data, today);
  saveData({
    ...updated,
    lastStudioSessionDate: today,
    studioSessionsCompleted: updated.studioSessionsCompleted + 1,
    seasonXP: updated.seasonXP + 25,
    totalXP: updated.totalXP + 25,
    lastActiveDate: today,
  });
}

export function claimMilestone(milestoneId: MilestoneId): void {
  const data = loadData();
  if (data.claimedMilestones.includes(milestoneId)) return;
  saveData({
    ...data,
    claimedMilestones: [...data.claimedMilestones, milestoneId],
  });
}

export function getPendingMilestone(): SeasonMilestone | null {
  const data = loadData();
  for (const m of SEASON_MILESTONES) {
    if (m.id === "spark") continue;
    if (data.seasonXP >= m.xpThreshold && !data.claimedMilestones.includes(m.id)) {
      return m;
    }
  }
  return null;
}
