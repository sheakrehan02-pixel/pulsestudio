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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Get Music Lab
          </h1>
          <p className="text-gray-400">
            Use in browser or install for the best experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Use in browser */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/60 rounded-2xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <span>🌐</span> Use in Browser
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              No download needed. Open Music Lab directly in your browser.
            </p>
            <motion.button
              onClick={() => {
                void playClickSound();
                router.push("/labs");
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl"
            >
              Open Music Lab →
            </motion.button>
          </motion.div>

          {/* Install PWA (desktop) */}
          {isInstallable && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/30"
            >
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span>📱</span> Install App
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Add Music Lab to your device for a full app experience.
              </p>
              <motion.button
                onClick={handleInstall}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl"
              >
                Install Music Lab
              </motion.button>
            </motion.div>
          )}

          {/* Add to Home Screen (mobile) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/60 rounded-2xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <span>📲</span> Add to Home Screen (Mobile)
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              On your phone, tap Share → Add to Home Screen to install.
            </p>
            <div className="space-y-3 text-sm text-gray-500">
              <p><strong className="text-gray-400">iPhone:</strong> Safari → Share icon → Add to Home Screen</p>
              <p><strong className="text-gray-400">Android:</strong> Chrome → Menu (⋮) → Add to Home screen</p>
            </div>
          </motion.div>

          {/* Download APK */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/60 rounded-2xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <span>🤖</span> Download for Android
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Get the Android APK for offline use.
            </p>
            <a
              href="/downloads/MusicLab.apk"
              download="MusicLab.apk"
              onClick={() => void playClickSound()}
              className="block w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl text-center transition-colors"
            >
              Download APK
            </a>
            <p className="text-xs text-gray-500 mt-2">
              If the link doesn&apos;t work, the APK may not be built yet. Use &quot;Add to Home Screen&quot; instead.
            </p>
          </motion.div>
        </div>

        <motion.button
          onClick={() => router.push("/")}
          className="text-gray-500 hover:text-gray-400 text-sm"
        >
          ← Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}
