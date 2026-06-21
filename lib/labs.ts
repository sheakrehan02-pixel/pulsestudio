// Music Lab architecture
// Nature-inspired color palette: teal (sky/water), coral (flower petal), amber (honey/center)

export type LabId =
  | "rhythm"
  | "pitch"
  | "sound-design"
  | "pattern"
  | "harmony"
  | "creativity"
  | "tempo"
  | "intervals"
  | "dynamics"
  | "memory"
  | "scales"
  | "groove";

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
    icon: "drum",
    color: "teal",
    gradient: "from-[#5a9a8e] to-[#4a8578]",
    unlocked: true,
    category: "rhythm",
  },
  {
    id: "pitch",
    name: "Pitch & Melody Lab",
    description: "Explore tones and melodies",
    icon: "music",
    color: "coral",
    gradient: "from-[#d4856a] to-[#c27458]",
    unlocked: true,
    category: "pitch",
  },
  {
    id: "sound-design",
    name: "Sound Design Lab",
    description: "Create and shape sounds",
    icon: "sliders",
    color: "amber",
    gradient: "from-[#e8b84a] to-[#d4a43a]",
    unlocked: true,
    category: "sound",
  },
  {
    id: "pattern",
    name: "Pattern Lab",
    description: "Build music like LEGO blocks",
    icon: "blocks",
    color: "teal",
    gradient: "from-[#5a9a8e] to-[#6ab09a]",
    unlocked: true,
    category: "structure",
  },
  {
    id: "harmony",
    name: "Harmony Lab",
    description: "Discover chords and harmony",
    icon: "music2",
    color: "coral",
    gradient: "from-[#d4856a] to-[#e69a80]",
    unlocked: true,
    category: "harmony",
  },
  {
    id: "creativity",
    name: "Creativity Sandbox",
    description: "Pure exploration, no rules",
    icon: "palette",
    color: "amber",
    gradient: "from-[#e8b84a] via-[#d4856a] to-[#5a9a8e]",
    unlocked: true,
    category: "creativity",
  },
  {
    id: "tempo",
    name: "Tempo Lab",
    description: "Feel speed changes and master BPM",
    icon: "timer",
    color: "teal",
    gradient: "from-[#4a8578] to-[#5a9a8e]",
    unlocked: true,
    category: "rhythm",
  },
  {
    id: "intervals",
    name: "Interval Lab",
    description: "Train your ear on note distances",
    icon: "ruler",
    color: "coral",
    gradient: "from-[#c27458] to-[#d4856a]",
    unlocked: true,
    category: "pitch",
  },
  {
    id: "dynamics",
    name: "Dynamics Lab",
    description: "Shape volume, expression, and feel",
    icon: "zap",
    color: "amber",
    gradient: "from-[#d4a43a] to-[#e8b84a]",
    unlocked: true,
    category: "sound",
  },
  {
    id: "memory",
    name: "Memory Lab",
    description: "Remember and replay melodies",
    icon: "sparkles",
    color: "coral",
    gradient: "from-[#d4856a] via-[#e8b84a] to-[#5a9a8e]",
    unlocked: true,
    category: "creativity",
  },
  {
    id: "scales",
    name: "Scales Lab",
    description: "Master major, minor, and pentatonic scales",
    icon: "key",
    color: "coral",
    gradient: "from-[#d4856a] to-[#e69a80]",
    unlocked: true,
    category: "pitch",
  },
  {
    id: "groove",
    name: "Groove Lab",
    description: "Feel swing, syncopation, and pocket",
    icon: "party",
    color: "teal",
    gradient: "from-[#4a8578] to-[#6ab09a]",
    unlocked: true,
    category: "rhythm",
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
      "Perfect timing!",
      "You're getting it!",
      "That sounded great!",
      "Keep going!",
    ],
    good: [
      "Almost there — try again",
      "Close — listen carefully",
      "Good try — a little adjustment",
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
    performance === "excellent"
      ? "celebration"
      : performance === "good"
        ? "hint"
        : "correction";

  return {
    type,
    message:
      messages[performance][Math.floor(Math.random() * messages[performance].length)],
    timestamp: Date.now(),
  };
}
