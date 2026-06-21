import type { SkillScores, SkillDomain } from "./assessment";
import { DOMAIN_LABELS, getWeakestDomains } from "./assessment";
import type { LabId } from "./labs";

export type SoundArchetypeId =
  | "pulse-keeper"
  | "ear-alchemist"
  | "tone-sculptor"
  | "pattern-architect"
  | "harmony-seeker"
  | "free-composer"
  | "complete-musician";

export interface SoundArchetype {
  id: SoundArchetypeId;
  title: string;
  tagline: string;
  description: string;
  edge: string;
  growthEdge: string;
  gradient: string;
  accent: string;
  domains: SkillDomain[];
  signatureLabs: LabId[];
}

export const SOUND_ARCHETYPES: Record<SoundArchetypeId, SoundArchetype> = {
  "pulse-keeper": {
    id: "pulse-keeper",
    title: "The Pulse Keeper",
    tagline: "You feel time before you hear it",
    description:
      "Rhythm lives in your body. You lock onto grooves instinctively — your superpower is making music move.",
    edge: "Natural timing and groove awareness",
    growthEdge: "Expand into melody and harmonic color",
    gradient: "from-[#4a8578] via-[#5a9a8e] to-[#6ab09a]",
    accent: "#5a9a8e",
    domains: ["rhythm", "structure"],
    signatureLabs: ["rhythm", "groove", "tempo"],
  },
  "ear-alchemist": {
    id: "ear-alchemist",
    title: "The Ear Alchemist",
    tagline: "You hear what others miss",
    description:
      "Pitch and intervals are your language. You transform sound into feeling — every note carries meaning for you.",
    edge: "Sharp pitch recognition and melodic intuition",
    growthEdge: "Build rhythmic confidence and pattern skills",
    gradient: "from-[#c27458] via-[#d4856a] to-[#e69a80]",
    accent: "#d4856a",
    domains: ["pitch", "harmony"],
    signatureLabs: ["pitch", "intervals", "scales"],
  },
  "tone-sculptor": {
    id: "tone-sculptor",
    title: "The Tone Sculptor",
    tagline: "You paint with timbre",
    description:
      "Sound design is your canvas. You understand that HOW a note sounds matters as much as which note it is.",
    edge: "Timbre awareness and expressive dynamics",
    growthEdge: "Deepen structural and rhythmic foundations",
    gradient: "from-[#d4a43a] via-[#e8b84a] to-[#f0c860]",
    accent: "#e8b84a",
    domains: ["sound", "creativity"],
    signatureLabs: ["sound-design", "dynamics", "creativity"],
  },
  "pattern-architect": {
    id: "pattern-architect",
    title: "The Pattern Architect",
    tagline: "You build worlds from repetition",
    description:
      "Structure and rhythm combine in you — you see music as layers, loops, and evolving patterns.",
    edge: "Pattern recognition and arrangement thinking",
    growthEdge: "Develop ear training and harmonic depth",
    gradient: "from-[#4a8578] via-[#5a9a8e] to-[#d4856a]",
    accent: "#5a9a8e",
    domains: ["structure", "rhythm"],
    signatureLabs: ["pattern", "groove", "rhythm"],
  },
  "harmony-seeker": {
    id: "harmony-seeker",
    title: "The Harmony Seeker",
    tagline: "Chords tell you stories",
    description:
      "Harmony is your emotional compass. You feel tension, release, and mood shifts in every progression.",
    edge: "Chord mood sensitivity and progression feel",
    growthEdge: "Strengthen rhythm precision and sound design",
    gradient: "from-[#d4856a] via-[#c9a0dc] to-[#e69a80]",
    accent: "#e69a80",
    domains: ["harmony", "pitch"],
    signatureLabs: ["harmony", "scales", "intervals"],
  },
  "free-composer": {
    id: "free-composer",
    title: "The Free Composer",
    tagline: "Rules are starting points, not limits",
    description:
      "Creativity flows through you. You experiment fearlessly — your music is discovery, not repetition.",
    edge: "Creative exploration and musical curiosity",
    growthEdge: "Ground experimentation in ear training fundamentals",
    gradient: "from-[#e8b84a] via-[#d4856a] to-[#5a9a8e]",
    accent: "#e8b84a",
    domains: ["creativity", "sound"],
    signatureLabs: ["creativity", "memory", "sound-design"],
  },
  "complete-musician": {
    id: "complete-musician",
    title: "The Complete Musician",
    tagline: "Balance is your instrument",
    description:
      "No single domain dominates — you are building across all dimensions. Rare and powerful.",
    edge: "Well-rounded musical foundation",
    growthEdge: "Push your weakest domain to unlock mastery",
    gradient: "from-[#5a9a8e] via-[#e8b84a] to-[#d4856a]",
    accent: "#5a9a8e",
    domains: ["rhythm", "pitch", "harmony"],
    signatureLabs: ["rhythm", "pitch", "harmony"],
  },
};

function getStrongestDomains(scores: SkillScores, count = 2): SkillDomain[] {
  return (Object.entries(scores) as [SkillDomain, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([d]) => d);
}

function isBalanced(scores: SkillScores): boolean {
  const values = Object.values(scores);
  const max = Math.max(...values);
  const min = Math.min(...values);
  return max - min <= 15;
}

export function deriveSoundIdentity(scores: SkillScores): SoundArchetype {
  if (isBalanced(scores)) return SOUND_ARCHETYPES["complete-musician"];

  const [top, second] = getStrongestDomains(scores, 2);
  const pair = new Set([top, second]);

  if (pair.has("rhythm") && pair.has("structure")) return SOUND_ARCHETYPES["pattern-architect"];
  if (pair.has("rhythm")) return SOUND_ARCHETYPES["pulse-keeper"];
  if (pair.has("pitch") && pair.has("harmony")) return SOUND_ARCHETYPES["harmony-seeker"];
  if (pair.has("pitch")) return SOUND_ARCHETYPES["ear-alchemist"];
  if (pair.has("sound") || pair.has("creativity")) return SOUND_ARCHETYPES["tone-sculptor"];
  if (pair.has("harmony")) return SOUND_ARCHETYPES["harmony-seeker"];
  if (pair.has("creativity")) return SOUND_ARCHETYPES["free-composer"];

  return SOUND_ARCHETYPES["complete-musician"];
}

export interface MicroLesson {
  id: string;
  domain: SkillDomain;
  title: string;
  insight: string;
  practice: string;
}

export const MICRO_LESSONS: MicroLesson[] = [
  {
    id: "ml-rhythm-1",
    domain: "rhythm",
    title: "The Pocket",
    insight: "Great musicians don't rush the beat — they sit slightly behind it, in the 'pocket.'",
    practice: "Tap along with a metronome at 80 BPM. Try landing just after the click.",
  },
  {
    id: "ml-pitch-1",
    domain: "pitch",
    title: "Relative Pitch",
    insight: "You don't need perfect pitch. Relative pitch — hearing intervals — is learnable by anyone.",
    practice: "Hum a note, then hum a perfect 5th above it. That's your first interval.",
  },
  {
    id: "ml-sound-1",
    domain: "sound",
    title: "Timbre Is Identity",
    insight: "The same note on piano vs. synth tells a completely different story.",
    practice: "Play middle C on sine, square, and saw waves. Name the emotion each evokes.",
  },
  {
    id: "ml-structure-1",
    domain: "structure",
    title: "Repetition Creates Groove",
    insight: "The best beats use 16 steps but only 4-6 active hits. Less is more.",
    practice: "Build a beat with only kick on 1 and snare on 3. Add one hi-hat pattern.",
  },
  {
    id: "ml-harmony-1",
    domain: "harmony",
    title: "Major vs Minor",
    insight: "One semitone change in the third interval flips happiness to melancholy.",
    practice: "Play C major, then C minor. Feel the emotional shift in your body.",
  },
  {
    id: "ml-creativity-1",
    domain: "creativity",
    title: "Constraints Unlock Creativity",
    insight: "Limiting yourself to 3 notes often produces better melodies than unlimited freedom.",
    practice: "Write a melody using only C, E, and G. No other notes allowed.",
  },
];

export function getMicroLessonForDomain(domain: SkillDomain): MicroLesson {
  const pool = MICRO_LESSONS.filter((l) => l.domain === domain);
  return pool[Math.floor(Math.random() * pool.length)] ?? MICRO_LESSONS[0]!;
}

export function getPersonalizedInsight(scores: SkillScores): string {
  const weak = getWeakestDomains(scores, 1)[0];
  const strong = getStrongestDomains(scores, 1)[0];
  if (!weak || !strong) return "Every session reshapes your musical DNA.";
  return `Your ${DOMAIN_LABELS[strong].split(" ")[0]?.toLowerCase()} is your edge. This season, transform your ${DOMAIN_LABELS[weak].split(" ")[0]?.toLowerCase()}.`;
}
