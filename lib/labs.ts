// Music Lab architecture
// Each lab teaches music through interactive exploration

export type LabId = 
  | "rhythm" 
  | "pitch" 
  | "sound-design" 
  | "pattern" 
  | "harmony" 
  | "creativity";

export interface Lab {
  id: LabId;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  unlocked: boolean;
  category: "rhythm" | "pitch" | "sound" | "structure" | "harmony" | "creativity";
}

export const LABS: Lab[] = [
  {
    id: "rhythm",
    name: "Rhythm Lab",
    description: "Feel the pulse, master the beat",
    icon: "🥁",
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
    unlocked: true,
    category: "rhythm",
  },
  {
    id: "pitch",
    name: "Pitch & Melody Lab",
    description: "Explore tones and melodies",
    icon: "🎵",
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
    unlocked: true,
    category: "pitch",
  },
  {
    id: "sound-design",
    name: "Sound Design Lab",
    description: "Create and shape sounds",
    icon: "🎛️",
    color: "green",
    gradient: "from-green-500 to-emerald-500",
    unlocked: true,
    category: "sound",
  },
  {
    id: "pattern",
    name: "Pattern Lab",
    description: "Build music like LEGO blocks",
    icon: "🧩",
    color: "yellow",
    gradient: "from-yellow-500 to-orange-500",
    unlocked: true,
    category: "structure",
  },
  {
    id: "harmony",
    name: "Harmony Lab",
    description: "Discover chords and harmony",
    icon: "🎼",
    color: "pink",
    gradient: "from-pink-500 to-rose-500",
    unlocked: true,
    category: "harmony",
  },
  {
    id: "creativity",
    name: "Creativity Sandbox",
    description: "Pure exploration, no rules",
    icon: "🎨",
    color: "indigo",
    gradient: "from-indigo-500 to-purple-500",
    unlocked: true,
    category: "creativity",
  },
];

// AI Feedback types (mocked for now)
export interface AIFeedback {
  type: "encouragement" | "hint" | "correction" | "celebration";
  message: string;
  timestamp: number;
}

export function generateAIFeedback(
  context: string,
  performance: "excellent" | "good" | "needs-improvement"
): AIFeedback {
  const messages = {
    excellent: [
      "Perfect timing! 🎯",
      "You're getting it! ✨",
      "That sounded great! 🎵",
      "Keep going! 🔥",
    ],
    good: [
      "Almost there! Try again",
      "Close! Listen carefully",
      "Good try! A little adjustment",
      "You're on the right track",
    ],
    "needs-improvement": [
      "Try a different approach",
      "Listen to the pattern",
      "Take your time",
      "Experiment a bit more",
    ],
  };

  const type = 
    performance === "excellent" ? "celebration" :
    performance === "good" ? "hint" :
    "correction";

  return {
    type,
    message: messages[performance][Math.floor(Math.random() * messages[performance].length)],
    timestamp: Date.now(),
  };
}

