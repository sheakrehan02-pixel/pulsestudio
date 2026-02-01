"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SkillDomain, Skill } from "@/lib/types";
import { SKILLS, DOMAIN_INFO } from "@/lib/data";
import { getUserProgress, calculateLevel, xpProgressInLevel } from "@/lib/progress";
import { playClickSound } from "@/lib/audio";

export default function DashboardPage() {
  const router = useRouter();
  const progress = getUserProgress();
  const xpProgress = xpProgressInLevel(progress.totalXP, progress.level);

  const handleSkillClick = (skill: Skill) => {
    if (!skill.unlocked) return;
    void playClickSound();
    
    // Route to appropriate screen based on skill domain
    switch (skill.domain) {
      case "rhythm":
        router.push("/lesson");
        break;
      case "instruments":
        router.push("/piano");
        break;
      case "creativity":
        router.push("/creativity");
        break;
      default:
        router.push("/lesson");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with XP and Streak */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Your Progress</h1>
              <p className="text-gray-400">Level {progress.level}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">{progress.streak} 🔥</div>
              <p className="text-sm text-gray-400">Day Streak</p>
            </div>
          </div>
          
          {/* XP Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">XP Progress</span>
              <span className="text-blue-400 font-semibold">{progress.totalXP} XP</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500">
              {100 - xpProgress} XP until Level {progress.level + 1}
            </p>
          </div>
        </motion.div>

        {/* Skill Domains */}
        {(Object.keys(SKILLS) as SkillDomain[]).map((domain, domainIndex) => {
          const domainInfo = DOMAIN_INFO[domain];
          const domainSkills = SKILLS[domain];
          const domainColor = domainInfo.color;

          return (
            <motion.div
              key={domain}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: domainIndex * 0.1 }}
              className="bg-gray-900/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{domainInfo.name}</h2>
                  <p className="text-sm text-gray-400">{domainInfo.description}</p>
                </div>
                <div className="text-3xl">{domainSkills[0]?.icon || "🎵"}</div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {domainSkills.map((skill, skillIndex) => {
                  const isUnlocked = skill.unlocked;
                  const colorClasses = {
                    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
                    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
                    green: "from-green-500/20 to-green-600/20 border-green-500/30",
                    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
                    pink: "from-pink-500/20 to-pink-600/20 border-pink-500/30",
                  };

                  return (
                    <motion.button
                      key={skill.id}
                      onClick={() => handleSkillClick(skill)}
                      disabled={!isUnlocked}
                      whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
                      whileTap={isUnlocked ? { scale: 0.98 } : {}}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: domainIndex * 0.1 + skillIndex * 0.05 }}
                      className={`
                        relative p-4 rounded-xl text-left
                        ${isUnlocked 
                          ? `bg-gradient-to-br ${colorClasses[domainColor as keyof typeof colorClasses]} border backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all` 
                          : "bg-gray-800/30 border-gray-700/50 cursor-not-allowed opacity-50"
                        }
                      `}
                    >
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2 text-gray-500">🔒</div>
                      )}
                      
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-2xl">{skill.icon}</div>
                        {isUnlocked && (
                          <div className="text-xs font-semibold text-gray-400">
                            Lv. {skill.level}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1">{skill.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{skill.description}</p>
                      
                      {isUnlocked && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-gray-400">{skill.xpEarned} XP</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level}%` }}
                              transition={{ duration: 0.6, delay: 0.3 }}
                              className={`h-full bg-gradient-to-r ${
                                domainColor === "blue" ? "from-blue-500 to-blue-600" :
                                domainColor === "purple" ? "from-purple-500 to-purple-600" :
                                domainColor === "green" ? "from-green-500 to-green-600" :
                                domainColor === "yellow" ? "from-yellow-500 to-yellow-600" :
                                "from-pink-500 to-pink-600"
                              } rounded-full`}
                            />
                          </div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

