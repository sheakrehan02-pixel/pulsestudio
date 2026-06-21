import type { LabId } from "./labs";

export type SkillDomain =
  | "rhythm"
  | "pitch"
  | "sound"
  | "structure"
  | "harmony"
  | "creativity";

export type SkillScores = Record<SkillDomain, number>;

export interface AssessmentQuestion {
  id: string;
  domain: SkillDomain;
  type: "rhythm-tap" | "pitch-choice" | "tempo-choice" | "interval-choice" | "pattern-choice" | "harmony-mood" | "memory-sequence";
  prompt: string;
  /** For choice questions */
  options?: string[];
  correctIndex?: number;
  /** For rhythm: target BPM; memory: note indices */
  meta?: Record<string, unknown>;
}

export interface AssessmentResult {
  scores: SkillScores;
  completedAt: number;
  totalCorrect: number;
  totalQuestions: number;
}

export interface WeeklyCheckRecord {
  weekKey: string;
  date: string;
  scores: SkillScores;
  delta: Partial<SkillScores>;
  totalCorrect: number;
  totalQuestions: number;
}

export const DOMAIN_LABELS: Record<SkillDomain, string> = {
  rhythm: "Rhythm & Timing",
  pitch: "Pitch & Ear Training",
  sound: "Sound Design",
  structure: "Patterns & Structure",
  harmony: "Harmony & Chords",
  creativity: "Creative Expression",
};

export const DOMAIN_TO_LABS: Record<SkillDomain, LabId[]> = {
  rhythm: ["rhythm", "tempo", "groove"],
  pitch: ["pitch", "intervals", "scales"],
  sound: ["sound-design", "dynamics"],
  structure: ["pattern"],
  harmony: ["harmony"],
  creativity: ["creativity", "memory"],
};

export const LAB_TO_DOMAIN: Record<LabId, SkillDomain> = {
  rhythm: "rhythm",
  tempo: "rhythm",
  groove: "rhythm",
  pitch: "pitch",
  intervals: "pitch",
  scales: "pitch",
  "sound-design": "sound",
  dynamics: "sound",
  pattern: "structure",
  harmony: "harmony",
  creativity: "creativity",
  memory: "creativity",
};

export function getDefaultSkillScores(): SkillScores {
  return {
    rhythm: 50,
    pitch: 50,
    sound: 50,
    structure: 50,
    harmony: 50,
    creativity: 50,
  };
}

export function getISOWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function daysSince(dateStr: string): number {
  if (!dateStr) return Infinity;
  const last = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

export function isWeeklyCheckDue(lastCheckDate: string): boolean {
  return daysSince(lastCheckDate) >= 7;
}

/** Full skill diagnostic — 12 questions across all domains */
export const PRETEST_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "r1",
    domain: "rhythm",
    type: "rhythm-tap",
    prompt: "Tap along with the beat — match the pulse as closely as you can",
    meta: { bpm: 90, beats: 8 },
  },
  {
    id: "p1",
    domain: "pitch",
    type: "pitch-choice",
    prompt: "Which note is higher?",
    options: ["First note", "Second note", "Same pitch"],
    correctIndex: 0,
    meta: { freqA: 440, freqB: 349.23 },
  },
  {
    id: "t1",
    domain: "rhythm",
    type: "tempo-choice",
    prompt: "Which tempo feels faster?",
    options: ["First clip", "Second clip"],
    correctIndex: 0,
    meta: { bpmA: 140, bpmB: 80 },
  },
  {
    id: "i1",
    domain: "pitch",
    type: "interval-choice",
    prompt: "What interval do you hear?",
    options: ["Unison", "Major 3rd", "Perfect 5th", "Octave"],
    correctIndex: 2,
    meta: { root: 261.63, interval: 7 },
  },
  {
    id: "s1",
    domain: "structure",
    type: "pattern-choice",
    prompt: "Which pattern matches what you heard?",
    options: ["Kick-Snare-Kick-Snare", "Kick-Kick-Snare-Snare", "Snare-Kick-Snare-Kick", "All kicks"],
    correctIndex: 0,
    meta: { pattern: [1, 0, 1, 0] },
  },
  {
    id: "h1",
    domain: "harmony",
    type: "harmony-mood",
    prompt: "Which chord feels brighter and happier?",
    options: ["Major chord", "Minor chord"],
    correctIndex: 0,
    meta: { type: "major-minor" },
  },
  {
    id: "sd1",
    domain: "sound",
    type: "pitch-choice",
    prompt: "Which sound is brighter?",
    options: ["Sine wave", "Sawtooth wave"],
    correctIndex: 1,
    meta: { waveA: "sine", waveB: "sawtooth", freq: 440 },
  },
  {
    id: "m1",
    domain: "creativity",
    type: "memory-sequence",
    prompt: "Repeat the melody you just heard",
    meta: { notes: [0, 2, 4], baseFreq: 261.63 },
  },
  {
    id: "r2",
    domain: "rhythm",
    type: "rhythm-tap",
    prompt: "Tap a faster beat — stay locked to the pulse",
    meta: { bpm: 120, beats: 8 },
  },
  {
    id: "p2",
    domain: "pitch",
    type: "interval-choice",
    prompt: "Identify this interval",
    options: ["Minor 2nd", "Major 2nd", "Major 3rd", "Perfect 4th"],
    correctIndex: 2,
    meta: { root: 392, interval: 4 },
  },
  {
    id: "st2",
    domain: "structure",
    type: "pattern-choice",
    prompt: "Which rhythm has syncopation (off-beat emphasis)?",
    options: ["Straight quarter notes", "Off-beat hits", "All rests", "Single hit"],
    correctIndex: 1,
    meta: { pattern: [0, 1, 0, 1] },
  },
  {
    id: "c1",
    domain: "creativity",
    type: "harmony-mood",
    prompt: "Which progression feels more resolved and complete?",
    options: ["I → V → I", "I → bVI → bVII"],
    correctIndex: 0,
    meta: { type: "progression" },
  },
];

/** Extended question pool for weekly checks and randomized pretests */
export const EXTENDED_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "r3",
    domain: "rhythm",
    type: "rhythm-tap",
    prompt: "Tap along with a slow, steady pulse",
    meta: { bpm: 70, beats: 8 },
  },
  {
    id: "r4",
    domain: "rhythm",
    type: "tempo-choice",
    prompt: "Which clip has a slower tempo?",
    options: ["First clip", "Second clip"],
    correctIndex: 1,
    meta: { bpmA: 130, bpmB: 75 },
  },
  {
    id: "p3",
    domain: "pitch",
    type: "pitch-choice",
    prompt: "Which note is lower?",
    options: ["First note", "Second note", "Same pitch"],
    correctIndex: 1,
    meta: { freqA: 523.25, freqB: 329.63 },
  },
  {
    id: "p4",
    domain: "pitch",
    type: "interval-choice",
    prompt: "What interval is this?",
    options: ["Minor 2nd", "Major 3rd", "Perfect 5th", "Octave"],
    correctIndex: 3,
    meta: { root: 220, interval: 12 },
  },
  {
    id: "p5",
    domain: "pitch",
    type: "pitch-choice",
    prompt: "Which scale sounds major (happy)?",
    options: ["First scale", "Second scale"],
    correctIndex: 0,
    meta: { type: "scale-major-minor" },
  },
  {
    id: "s2",
    domain: "structure",
    type: "pattern-choice",
    prompt: "Which pattern has a backbeat (snare on 2 and 4)?",
    options: ["All kicks", "Kick on 1 & 3, snare on 2 & 4", "Only hi-hats", "Random hits"],
    correctIndex: 1,
    meta: { pattern: [1, 0, 1, 0] },
  },
  {
    id: "s3",
    domain: "structure",
    type: "pattern-choice",
    prompt: "Which pattern is a simple 4-on-the-floor?",
    options: ["Kick every beat", "Snare every beat", "One hit only", "All rests"],
    correctIndex: 0,
    meta: { pattern: [1, 1, 1, 1] },
  },
  {
    id: "h2",
    domain: "harmony",
    type: "harmony-mood",
    prompt: "Which chord sounds darker and sadder?",
    options: ["Major chord", "Minor chord"],
    correctIndex: 1,
    meta: { type: "major-minor" },
  },
  {
    id: "h3",
    domain: "harmony",
    type: "harmony-mood",
    prompt: "Which progression feels unresolved (wants to continue)?",
    options: ["I → V", "I → IV → I", "I → I", "V → I"],
    correctIndex: 0,
    meta: { type: "progression" },
  },
  {
    id: "sd2",
    domain: "sound",
    type: "pitch-choice",
    prompt: "Which wave sounds smoother and rounder?",
    options: ["Sine wave", "Square wave"],
    correctIndex: 0,
    meta: { waveA: "sine", waveB: "square", freq: 330 },
  },
  {
    id: "sd3",
    domain: "sound",
    type: "pitch-choice",
    prompt: "Which sound is harsher and buzzier?",
    options: ["Triangle wave", "Sawtooth wave"],
    correctIndex: 1,
    meta: { waveA: "triangle", waveB: "sawtooth", freq: 220 },
  },
  {
    id: "m2",
    domain: "creativity",
    type: "memory-sequence",
    prompt: "Repeat this 4-note melody",
    meta: { notes: [0, 2, 1, 4], baseFreq: 261.63 },
  },
  {
    id: "m3",
    domain: "creativity",
    type: "memory-sequence",
    prompt: "Repeat this ascending melody",
    meta: { notes: [0, 1, 2, 3], baseFreq: 293.66 },
  },
  {
    id: "gr1",
    domain: "rhythm",
    type: "pattern-choice",
    prompt: "Which groove has a swing feel (long-short pairs)?",
    options: ["Straight eighths", "Swing feel", "All rests", "Single hit"],
    correctIndex: 1,
    meta: { pattern: [1, 0, 1, 0] },
  },
];

const ALL_QUESTIONS = [...PRETEST_QUESTIONS, ...EXTENDED_QUESTIONS];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** Randomized 12-question pretest — 2 per domain */
export function getPretestQuestions(): AssessmentQuestion[] {
  const domains = Object.keys(DOMAIN_LABELS) as SkillDomain[];
  const selected: AssessmentQuestion[] = [];

  for (const domain of domains) {
    const pool = ALL_QUESTIONS.filter((q) => q.domain === domain);
    const picks = shuffle(pool).slice(0, 2);
    selected.push(...picks);
  }

  return shuffle(selected);
}

/** Weekly check — 8 unique questions focused on weak areas */
export function getWeeklyCheckQuestions(scores: SkillScores): AssessmentQuestion[] {
  const sorted = (Object.entries(scores) as [SkillDomain, number][])
    .sort((a, b) => a[1] - b[1]);

  const weakDomains = sorted.slice(0, 3).map(([d]) => d);
  const weakPool = shuffle(ALL_QUESTIONS.filter((q) => weakDomains.includes(q.domain)));
  const strongPool = shuffle(
    ALL_QUESTIONS.filter((q) => !weakDomains.includes(q.domain))
  );

  const selected = [...weakPool.slice(0, 5), ...strongPool.slice(0, 3)];
  return selected.length >= 8 ? selected.slice(0, 8) : shuffle(ALL_QUESTIONS).slice(0, 8);
}

export function computeScoresFromAnswers(
  questions: AssessmentQuestion[],
  answers: Record<string, { correct: boolean; accuracy?: number }>
): AssessmentResult {
  const domainTotals: Record<SkillDomain, { sum: number; count: number }> = {
    rhythm: { sum: 0, count: 0 },
    pitch: { sum: 0, count: 0 },
    sound: { sum: 0, count: 0 },
    structure: { sum: 0, count: 0 },
    harmony: { sum: 0, count: 0 },
    creativity: { sum: 0, count: 0 },
  };

  let totalCorrect = 0;

  for (const q of questions) {
    const ans = answers[q.id];
    if (!ans) continue;
    const score = ans.correct
      ? 100
      : ans.accuracy != null
        ? Math.round(ans.accuracy * 100)
        : 20;
    domainTotals[q.domain].sum += score;
    domainTotals[q.domain].count += 1;
    if (ans.correct) totalCorrect += 1;
  }

  const scores = getDefaultSkillScores();
  for (const domain of Object.keys(domainTotals) as SkillDomain[]) {
    const { sum, count } = domainTotals[domain];
    if (count > 0) scores[domain] = Math.round(sum / count);
  }

  return {
    scores,
    completedAt: Date.now(),
    totalCorrect,
    totalQuestions: questions.length,
  };
}

export function mergeSkillScores(
  existing: SkillScores,
  incoming: SkillScores,
  weight = 0.6
): SkillScores {
  const merged = { ...existing };
  for (const domain of Object.keys(incoming) as SkillDomain[]) {
    merged[domain] = Math.round(existing[domain] * (1 - weight) + incoming[domain] * weight);
  }
  return merged;
}

export function getWeakestDomains(scores: SkillScores, count = 3): SkillDomain[] {
  return (Object.entries(scores) as [SkillDomain, number][])
    .sort((a, b) => a[1] - b[1])
    .slice(0, count)
    .map(([d]) => d);
}

export function getRecommendedLabs(
  scores: SkillScores,
  count = 3,
  recentLabIds: LabId[] = []
): LabId[] {
  const weak = getWeakestDomains(scores, 6);
  const candidates: { labId: LabId; priority: number }[] = [];

  for (let i = 0; i < weak.length; i++) {
    const domain = weak[i]!;
    const domainScore = scores[domain];
    for (const labId of DOMAIN_TO_LABS[domain]) {
      const recentlyUsed = recentLabIds.indexOf(labId);
      const recencyPenalty = recentlyUsed >= 0 ? (recentLabIds.length - recentlyUsed) * 5 : 0;
      candidates.push({
        labId,
        priority: (100 - domainScore) + i * 10 - recencyPenalty,
      });
    }
  }

  candidates.sort((a, b) => b.priority - a.priority);
  const labs: LabId[] = [];
  for (const c of candidates) {
    if (!labs.includes(c.labId)) labs.push(c.labId);
    if (labs.length >= count) break;
  }
  return labs;
}

export function getScoreDelta(
  before: SkillScores,
  after: SkillScores
): Partial<SkillScores> {
  const delta: Partial<SkillScores> = {};
  for (const domain of Object.keys(before) as SkillDomain[]) {
    delta[domain] = after[domain] - before[domain];
  }
  return delta;
}

export function getSkillLevelLabel(score: number): string {
  if (score >= 85) return "Expert";
  if (score >= 70) return "Advanced";
  if (score >= 50) return "Intermediate";
  if (score >= 30) return "Developing";
  return "Beginner";
}
