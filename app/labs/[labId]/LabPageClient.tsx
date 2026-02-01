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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] relative">
        <button
          onClick={() => router.push("/labs")}
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-gray-900/80 backdrop-blur-sm rounded-full text-white hover:bg-gray-800 transition-colors"
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
