"use client";

import { motion } from "framer-motion";

interface AmbientBackgroundProps {
  variant?: "home" | "labs" | "subtle";
}

export default function AmbientBackground({ variant = "subtle" }: AmbientBackgroundProps) {
  const orbs =
    variant === "home"
      ? [
          { x: "15%", y: "20%", size: 320, color: "rgba(90, 154, 142, 0.12)", delay: 0 },
          { x: "75%", y: "60%", size: 280, color: "rgba(212, 133, 106, 0.1)", delay: 1.2 },
          { x: "50%", y: "80%", size: 240, color: "rgba(232, 184, 74, 0.08)", delay: 2.4 },
          { x: "85%", y: "15%", size: 180, color: "rgba(90, 154, 142, 0.06)", delay: 0.8 },
        ]
      : variant === "labs"
        ? [
            { x: "10%", y: "30%", size: 200, color: "rgba(90, 154, 142, 0.08)", delay: 0 },
            { x: "80%", y: "70%", size: 220, color: "rgba(212, 133, 106, 0.07)", delay: 1.5 },
          ]
        : [
            { x: "20%", y: "40%", size: 160, color: "rgba(90, 154, 142, 0.05)", delay: 0 },
          ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {variant === "home" && (
        <>
          <motion.div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(244,237,230,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(244,237,230,0.5) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
            animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
                background: i % 2 === 0 ? "var(--accent-teal)" : "var(--accent-amber)",
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
                y: [0, -30, -60],
              }}
              transition={{
                duration: 3,
                delay: i * 0.7,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
