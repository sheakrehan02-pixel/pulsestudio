"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Note {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  symbol: string;
}

const musicalNotes = ["♪", "♫", "♬", "♩"];

export default function FloatingNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const newNotes: Note[] = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 5,
      symbol: musicalNotes[i % musicalNotes.length],
    }));
    setNotes(newNotes);
  }, []);

  // Nature-inspired colors: teal, coral, amber - soft and organic
  const noteColors = [
    "rgba(90, 154, 142, 0.18)",
    "rgba(212, 133, 106, 0.15)",
    "rgba(232, 184, 74, 0.12)",
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          initial={{
            x: `${note.x}vw`,
            y: `${note.y}vh`,
            opacity: 0,
            scale: 0.6,
          }}
          animate={{
            y: [`${note.y}vh`, `${note.y - 15}vh`, `${note.y}vh`],
            x: [
              `${note.x}vw`,
              `${note.x + Math.sin(note.id * 0.7) * 4}vw`,
              `${note.x}vw`,
            ],
            opacity: [0, 0.4, 0],
            scale: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: note.duration,
            delay: note.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute text-3xl md:text-5xl"
          style={{
            color: noteColors[note.id % noteColors.length],
            fontFamily: "var(--font-display)",
          }}
        >
          {note.symbol}
        </motion.div>
      ))}
    </div>
  );
}
