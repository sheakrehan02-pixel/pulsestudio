"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Note {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

const musicalNotes = ["♪", "♫", "♬", "♩", "♭", "♯"];

export default function FloatingNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    // Create 20 floating notes
    const newNotes: Note[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }));
    setNotes(newNotes);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          initial={{
            x: `${note.x}vw`,
            y: `${note.y}vh`,
            opacity: 0.3,
            scale: 0.5,
          }}
          animate={{
            y: [`${note.y}vh`, `${note.y - 20}vh`, `${note.y}vh`],
            x: [`${note.x}vw`, `${note.x + Math.sin(note.id) * 5}vw`, `${note.x}vw`],
            opacity: [0.3, 0.6, 0.3],
            scale: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: note.duration,
            delay: note.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute text-4xl md:text-6xl text-blue-400/30"
        >
          {musicalNotes[note.id % musicalNotes.length]}
        </motion.div>
      ))}
    </div>
  );
}

