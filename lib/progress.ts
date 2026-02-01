// Progress and XP management
// Designed to support gamification and skill tracking

import { UserProgress, Skill, SkillDomain } from "./types";
import { SKILLS } from "./data";

// Calculate total XP from all skills
export function calculateTotalXP(skills: Skill[]): number {
  return skills.reduce((total, skill) => total + skill.xpEarned, 0);
}

// Calculate level from total XP (100 XP per level)
export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 100) + 1;
}

// Calculate XP needed for next level
export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * 100;
}

// Calculate XP progress in current level (0-100)
export function xpProgressInLevel(totalXP: number, level: number): number {
  const xpInCurrentLevel = totalXP % 100;
  return xpInCurrentLevel;
}

// Get user progress (mock data for now)
export function getUserProgress(): UserProgress {
  const allSkills = Object.values(SKILLS).flat();
  const totalXP = calculateTotalXP(allSkills);
  const level = calculateLevel(totalXP);

  return {
    totalXP,
    level,
    streak: 5, // Mock streak
    skills: allSkills,
    lessons: [], // Would come from data
  };
}

// Award XP to a skill
export function awardXP(
  skillId: string,
  xpAmount: number,
  currentSkills: Skill[]
): Skill[] {
  return currentSkills.map((skill) => {
    if (skill.id === skillId) {
      const newXP = skill.xpEarned + xpAmount;
      const newLevel = Math.min(100, Math.floor(newXP / 10)); // 10 XP per level
      return {
        ...skill,
        xpEarned: newXP,
        level: newLevel,
      };
    }
    return skill;
  });
}

// Check if a skill should be unlocked
export function shouldUnlockSkill(skill: Skill, allSkills: Skill[]): boolean {
  // Simple unlock logic: unlock if previous skill in domain is at level 30+
  const domainSkills = allSkills.filter((s) => s.domain === skill.domain);
  const skillIndex = domainSkills.findIndex((s) => s.id === skill.id);
  
  if (skillIndex === 0) return true; // First skill always unlocked
  if (skillIndex === -1) return false;
  
  const previousSkill = domainSkills[skillIndex - 1];
  return previousSkill.level >= 30;
}

