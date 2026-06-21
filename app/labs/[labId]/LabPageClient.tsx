"use client";

import { useRouter } from "next/navigation";
import { LABS } from "@/lib/labs";
import { LabSessionProvider } from "@/components/LabSessionContext";
import RhythmLab from "@/components/labs/RhythmLab";
import PitchLab from "@/components/labs/PitchLab";
import SoundDesignLab from "@/components/labs/SoundDesignLab";
import PatternLab from "@/components/labs/PatternLab";
import HarmonyLab from "@/components/labs/HarmonyLab";
import CreativityLab from "@/components/labs/CreativityLab";
import TempoLab from "@/components/labs/TempoLab";
import IntervalLab from "@/components/labs/IntervalLab";
import DynamicsLab from "@/components/labs/DynamicsLab";
import MemoryLab from "@/components/labs/MemoryLab";
import ScalesLab from "@/components/labs/ScalesLab";
import GrooveLab from "@/components/labs/GrooveLab";
import LabTip from "@/components/LabTip";
import type { LabId } from "@/lib/labs";

const LAB_TIPS: Record<string, { title: string; tips: string[] }> = {
  rhythm: {
    title: "Rhythm Lab Tips",
    tips: [
      "Tap the big button or press Space to tap with the beat",
      "Start the metronome first, then tap when you hear the click",
      "Adjust BPM: slower (60–80) for beginners, faster (120+) for challenge",
    ],
  },
  pitch: {
    title: "Pitch Lab Tips",
    tips: [
      "Click keys or use A S D F G H J K L for white keys",
      "Listen to how different notes relate to each other",
      "Try playing simple melodies like Twinkle Twinkle",
    ],
  },
  "sound-design": {
    title: "Sound Design Tips",
    tips: [
      "Sine = smooth, Square = buzzy, Sawtooth = bright, Triangle = mellow",
      "440 Hz is concert A — try doubling (880) or halving (220)",
      "Experiment with frequency + wave type combinations",
    ],
  },
  pattern: {
    title: "Pattern Lab Tips",
    tips: [
      "Click cells to add notes — rows are notes, columns are beats",
      "Try creating a simple 4-beat loop first",
      "Play your pattern to hear it — adjust and repeat!",
    ],
  },
  harmony: {
    title: "Harmony Lab Tips",
    tips: [
      "Each chord has a different emotional feel",
      "C Major and G Major often sound good together",
      "Try playing chords in sequence to make progressions",
    ],
  },
  creativity: {
    title: "Creativity Sandbox Tips",
    tips: [
      "No rules — explore freely!",
      "Use keyboard for faster playing",
      "Record and playback your creations",
    ],
  },
  tempo: {
    title: "Tempo Lab Tips",
    tips: [
      "Listen to the metronome first, then tap to match",
      "Start slow (60–80 BPM) and work up to faster tempos",
      "Compare tempos side-by-side to feel the difference",
    ],
  },
  intervals: {
    title: "Interval Lab Tips",
    tips: [
      "Listen to both notes — the distance between them is the interval",
      "Major 3rd sounds happy; minor 3rd sounds darker",
      "Perfect 5th is the 'power chord' interval",
    ],
  },
  dynamics: {
    title: "Dynamics Lab Tips",
    tips: [
      "pp = very soft, ff = very loud — feel the volume difference",
      "Crescendo means gradually getting louder",
      "Dynamics add emotion and expression to music",
    ],
  },
  memory: {
    title: "Memory Lab Tips",
    tips: [
      "Listen carefully to the full sequence before tapping",
      "Start with short sequences and build up",
      "Hum the melody in your head to help remember",
    ],
  },
  scales: {
    title: "Scales Lab Tips",
    tips: [
      "Major scales sound bright and happy; minor scales sound darker",
      "Pentatonic scales use 5 notes — great for melodies",
      "Try Quiz Mode to train your ear to identify scales",
    ],
  },
  groove: {
    title: "Groove Lab Tips",
    tips: [
      "Straight grooves have even timing — rock and pop",
      "Swing grooves have a long-short feel — jazz and blues",
      "Syncopated grooves emphasize off-beats — reggae and funk",
    ],
  },
};

interface LabPageClientProps {
  labId: string;
}

export default function LabPageClient({ labId }: LabPageClientProps) {
  const router = useRouter();
  const lab = LABS.find((l) => l.id === labId);

  if (!lab) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Lab not found</p>
      </div>
    );
  }

  const LabComponent = {
    rhythm: RhythmLab,
    pitch: PitchLab,
    "sound-design": SoundDesignLab,
    pattern: PatternLab,
    harmony: HarmonyLab,
    creativity: CreativityLab,
    tempo: TempoLab,
    intervals: IntervalLab,
    dynamics: DynamicsLab,
    memory: MemoryLab,
    scales: ScalesLab,
    groove: GrooveLab,
  }[labId];

  if (!LabComponent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Lab coming soon</p>
      </div>
    );
  }

  const tips = LAB_TIPS[labId];

  return (
    <LabSessionProvider labId={labId as LabId}>
      <div
        className="min-h-screen relative"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(90, 154, 142, 0.04) 0%, transparent 50%), var(--bg-deep)",
        }}
      >
        <button
          onClick={() => router.push("/labs")}
          className="absolute top-4 left-4 z-50 px-4 py-2 rounded-full backdrop-blur-sm transition-colors"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          ← Back to Labs
        </button>

        {tips && (
          <div className="absolute top-16 right-4 z-40 w-64 sm:w-72">
            <LabTip title={tips.title} tips={tips.tips} defaultOpen={false} />
          </div>
        )}

        <LabComponent lab={lab} />
      </div>
    </LabSessionProvider>
  );
}
