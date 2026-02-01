// Core types for the music learning app
// Designed to support all educational domains

export type SkillDomain = 
  | "rhythm" 
  | "pitch" 
  | "notes" 
  | "instruments" 
  | "creativity";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface Skill {
  id: string;
  domain: SkillDomain;
  name: string;
  description: string;
  icon: string;
  level: number; // 0-100
  xpEarned: number;
  lessonsCompleted: number;
  unlocked: boolean;
}

export interface Lesson {
  id: string;
  skillId: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  duration: number; // minutes
  xpReward: number;
  unlocked: boolean;
  completed: boolean;
}

export interface UserProgress {
  totalXP: number;
  level: number;
  streak: number;
  skills: Skill[];
  lessons: Lesson[];
}

export interface TapResult {
  accuracy: "perfect" | "close" | "off" | null;
  timestamp: number;
  beatOffset: number; // milliseconds from perfect beat
}

export interface RhythmLessonConfig {
  bpm: number;
  difficulty: DifficultyLevel;
  timeSignature: [number, number]; // [beats, noteValue]
  targetTaps: number;
  tolerance: number; // milliseconds
}

// Future expansion types
export interface MIDIConfig {
  enabled: boolean;
  deviceId?: string;
}

export interface AIFeedback {
  type: "encouragement" | "correction" | "tip";
  message: string;
  timestamp: number;
}

