// Session-based progress tracking for Music Lab
// Persists to localStorage for cross-session continuity

import type { LabId } from "./labs";

export interface LabSession {
  labId: LabId;
  startedAt: number;
  durationMs: number;
  activityCount: number; // taps, notes played, etc.
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
  lastActiveDate: string; // YYYY-MM-DD
  labStats: Record<LabId, LabStats>;
  weeklyGoal: number; // minutes per week
  weeklyMinutes: number;
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
  };
}

function loadData(): UserSessionData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw) as UserSessionData;
    return { ...getDefaultData(), ...parsed };
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

  if (diffDays === 0) return data; // same day, no change
  if (diffDays === 1) return { ...data, streak: data.streak + 1, lastActiveDate: today };
  return { ...data, streak: 1, lastActiveDate: today };
}

export function recordLabSession(session: LabSession): void {
  const data = loadData();
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

  saveData({
    ...updated,
    totalXP,
    level,
    labStats,
    lastActiveDate: today,
    weeklyMinutes,
  });
}

export function getLabStats(labId: LabId): LabStats | null {
  return loadData().labStats[labId] || null;
}

export function getSuggestedLab(): LabId | null {
  const data = loadData();
  const labs: LabId[] = ["rhythm", "pitch", "sound-design", "pattern", "harmony", "creativity"];
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

export function getWeeklyProgress(): { minutes: number; goal: number; percent: number } {
  const data = loadData();
  const percent = Math.min(100, Math.round((data.weeklyMinutes / data.weeklyGoal) * 100));
  return {
    minutes: Math.round(data.weeklyMinutes * 10) / 10,
    goal: data.weeklyGoal,
    percent,
  };
}
