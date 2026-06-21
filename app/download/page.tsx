"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { playClickSound } from "@/lib/audio";

export default function DownloadPage() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    void playClickSound();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstallable(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--bg-deep)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center">
          <h1
            className="text-4xl md:text-5xl font-display font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Get Music Lab
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Use in browser or install for the best experience
          </p>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h2
              className="text-xl font-semibold mb-2 flex items-center gap-2 font-display"
              style={{ color: "var(--text-primary)" }}
            >
              Use in Browser
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              No download needed. Open Music Lab directly in your browser.
            </p>
            <motion.button
              onClick={() => {
                void playClickSound();
                router.push("/labs");
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 text-white font-semibold rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-teal), #4a8578)",
              }}
            >
              Open Music Lab →
            </motion.button>
          </motion.div>

          {isInstallable && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl p-6"
              style={{
                background: "var(--accent-teal-soft)",
                border: "1px solid rgba(90, 154, 142, 0.35)",
              }}
            >
              <h2
                className="text-xl font-semibold mb-2 flex items-center gap-2 font-display"
                style={{ color: "var(--accent-teal)" }}
              >
                Install App
              </h2>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                Add Music Lab to your device for a full app experience.
              </p>
              <motion.button
                onClick={handleInstall}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 text-white font-semibold rounded-xl"
                style={{ background: "var(--accent-teal)" }}
              >
                Install Music Lab
              </motion.button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h2
              className="text-xl font-semibold mb-2 flex items-center gap-2 font-display"
              style={{ color: "var(--text-primary)" }}
            >
              Add to Home Screen (Mobile)
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              On your phone, tap Share → Add to Home Screen to install.
            </p>
            <div
              className="space-y-3 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <p>
                <strong style={{ color: "var(--text-secondary)" }}>
                  iPhone:
                </strong>{" "}
                Safari → Share icon → Add to Home Screen
              </p>
              <p>
                <strong style={{ color: "var(--text-secondary)" }}>
                  Android:
                </strong>{" "}
                Chrome → Menu (⋮) → Add to Home screen
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h2
              className="text-xl font-semibold mb-2 flex items-center gap-2 font-display"
              style={{ color: "var(--text-primary)" }}
            >
              Download for Android
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Get the Android APK for offline use.
            </p>
            <a
              href="/downloads/MusicLab.apk"
              download="MusicLab.apk"
              onClick={() => void playClickSound()}
              className="block w-full py-4 font-semibold rounded-xl text-center transition-colors"
              style={{
                background: "var(--accent-coral-soft)",
                border: "1px solid var(--border-warm)",
                color: "var(--accent-coral)",
              }}
            >
              Download APK
            </a>
            <p
              className="text-xs mt-2"
              style={{ color: "var(--text-muted)" }}
            >
              If the link doesn&apos;t work, the APK may not be built yet. Use
              &quot;Add to Home Screen&quot; instead.
            </p>
          </motion.div>
        </div>

        <motion.button
          onClick={() => router.push("/")}
          className="text-sm transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}
