import React, { useState } from 'react';
import { UserProfile, GameLevel, UserLevel, LevelStatus } from '../../types';
import { GAME_LEVELS, EXERCISE_LIBRARY } from '../../lib/constants';
import { FitronDB } from '../../lib/db';
import { MotionStudio } from '../motion/MotionStudio';
import { 
  Gamepad2, 
  Lock, 
  CheckCircle2, 
  Star, 
  Zap, 
  Coins, 
  Flame, 
  Play, 
  Sparkles, 
  Trophy,
  ShieldAlert,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameModePageProps {
  userProfile: UserProfile;
  onProfileUpdated: () => void;
}

export const GameModePage: React.FC<GameModePageProps> = ({ userProfile, onProfileUpdated }) => {
  const [userLevels, setUserLevels] = useState<UserLevel[]>(FitronDB.getUserLevels());
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);
  const [activeWorkoutLevel, setActiveWorkoutLevel] = useState<GameLevel | null>(null);

  const getLevelStatus = (level: GameLevel): LevelStatus => {
    const userLvl = userLevels.find(ul => ul.level_id === level.id);
    if (userLvl && userLvl.completed) return 'COMPLETED';

    const isUnlocked = FitronDB.isLevelUnlocked(level.level_number);
    if (!isUnlocked) return 'LOCKED';

    if (level.is_special) return 'SPECIAL';
    return 'AVAILABLE';
  };

  const handleOpenLevel = (level: GameLevel) => {
    const status = getLevelStatus(level);
    if (status === 'LOCKED') return;
    setSelectedLevel(level);
  };

  const handleStartLevelWorkout = (level: GameLevel) => {
    setSelectedLevel(null);
    setActiveWorkoutLevel(level);
  };

  const handleLevelCompleted = () => {
    setUserLevels(FitronDB.getUserLevels());
    onProfileUpdated();
    setActiveWorkoutLevel(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl fitron-card p-8 border border-border-subtle bg-gradient-to-r from-bg-card via-bg-secondary to-[#1c060f]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-dark/40 border border-crimson/40 text-crimson-pastel text-xs font-semibold uppercase tracking-wider mb-3">
              <Gamepad2 className="w-3.5 h-3.5" />
              Fitness Adventure Map
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              FITRON GAME MODE
            </h1>
            <p className="text-text-secondary mt-2 max-w-xl text-sm sm:text-base">
              Progress through connected athletic trials. Complete physical movement objectives with verified form to unlock stages, earn Coins, and level up your athlete rank.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-4 rounded-2xl bg-bg-primary/90 border border-border-subtle shadow-card text-center">
              <div className="text-xs text-text-muted">Cleared Stages</div>
              <div className="text-2xl font-bold text-crimson-pastel font-heading">
                {userLevels.filter(u => u.completed).length} / {GAME_LEVELS.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Connected Winding Level Path */}
      <div className="relative fitron-card p-6 sm:p-12 border border-border-subtle rounded-3xl overflow-hidden bg-bg-card">
        {/* Subtle Ambient Background Trails */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C51F4A_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto space-y-12">
          {GAME_LEVELS.map((level, index) => {
            const status = getLevelStatus(level);
            const userLvl = userLevels.find(ul => ul.level_id === level.id);
            const isCompleted = status === 'COMPLETED';
            const isLocked = status === 'LOCKED';
            const isSpecial = level.is_special;
            const isNextAvailable = status === 'AVAILABLE' || (status === 'SPECIAL' && !isCompleted);

            // Alternate nodes left and right along the path
            const offsetClass = index % 2 === 0 ? 'sm:-translate-x-16 md:-translate-x-28' : 'sm:translate-x-16 md:translate-x-28';

            return (
              <div key={level.id} className="relative flex flex-col items-center w-full">
                {/* Connecting Trail Line to Next Level */}
                {index < GAME_LEVELS.length - 1 && (
                  <div className="absolute top-16 w-1 h-16 bg-gradient-to-b from-border-subtle to-border-subtle z-0 flex items-center justify-center">
                    {isCompleted && (
                      <div className="w-1 h-full bg-crimson shadow-crimson-sm transition-all" />
                    )}
                  </div>
                )}

                {/* Level Node Card */}
                <div
                  onClick={() => handleOpenLevel(level)}
                  className={`relative z-10 w-full max-w-sm rounded-2xl p-4 border transition-all duration-300 ${offsetClass} ${
                    isLocked
                      ? 'bg-bg-secondary/60 border-border-subtle opacity-60 cursor-not-allowed'
                      : isCompleted
                      ? 'bg-bg-secondary border-emerald-500/40 hover:border-emerald-500 shadow-md cursor-pointer hover:scale-[1.02]'
                      : isSpecial
                      ? 'bg-gradient-to-br from-bg-secondary to-[#200814] border-crimson hover:border-crimson-pastel shadow-crimson-md cursor-pointer hover:scale-[1.03] animate-pulse-glow'
                      : 'bg-bg-secondary border-crimson/50 hover:border-crimson shadow-crimson-sm cursor-pointer hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Node Icon Circle */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-heading font-black text-lg ${
                        isLocked
                          ? 'bg-bg-card text-text-muted border border-border-subtle'
                          : isCompleted
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
                          : isSpecial
                          ? 'bg-crimson text-white shadow-crimson-md'
                          : 'bg-crimson-dark/50 text-crimson-pastel border border-crimson/60'
                      }`}>
                        {isLocked ? (
                          <Lock className="w-5 h-5" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <span>{level.level_number}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-muted">STAGE {level.level_number}</span>
                          {isSpecial && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              SPECIAL TRIAL
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-white text-base leading-tight mt-0.5">
                          {level.title}
                        </h3>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {level.target_reps > 0 ? `${level.target_reps} Reps` : `${level.target_duration_seconds}s Hold`} • {level.exercise}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-semibold text-crimson-pastel">
                        <Zap className="w-3.5 h-3.5" /> +{level.xp_reward} XP
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 mt-1">
                        <Coins className="w-3.5 h-3.5" /> +{level.coin_reward}
                      </div>
                    </div>
                  </div>

                  {/* Stars for Completed Levels */}
                  {isCompleted && (
                    <div className="mt-3 pt-3 border-t border-border-subtle/60 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3].map(s => (
                          <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        Completed <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}

                  {isNextAvailable && (
                    <div className="mt-3 pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs text-crimson-pastel font-semibold">
                      <span>Ready for Action</span>
                      <span className="flex items-center gap-1">Start Stage <ChevronRight className="w-4 h-4" /></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LEVEL DETAILS MODAL */}
      {selectedLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="fitron-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-border-subtle bg-bg-card shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson-pastel uppercase tracking-wider">
                <Gamepad2 className="w-4 h-4" /> Stage {selectedLevel.level_number}
              </div>
              <button
                onClick={() => setSelectedLevel(null)}
                className="text-text-muted hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white font-heading">{selectedLevel.title}</h3>
              <p className="text-text-secondary text-sm mt-1">{selectedLevel.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Target Objective</span>
                <span className="font-bold text-white">
                  {selectedLevel.target_reps > 0 ? `${selectedLevel.target_reps} Repetitions` : `${selectedLevel.target_duration_seconds} Seconds`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Exercise</span>
                <span className="font-bold text-crimson-pastel">{selectedLevel.exercise}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Difficulty</span>
                <span className="font-semibold text-white">{selectedLevel.difficulty}</span>
              </div>
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-sm">
                <span className="text-text-muted">Rewards</span>
                <span className="font-bold text-white">
                  +{selectedLevel.xp_reward} XP / +{selectedLevel.coin_reward} Coins
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleStartLevelWorkout(selectedLevel)}
                className="btn-crimson flex-1 py-3.5 font-bold flex items-center justify-center gap-2 shadow-crimson-md"
              >
                <Play className="w-4 h-4 fill-white" />
                Launch Stage Trial
              </button>
              <button
                onClick={() => setSelectedLevel(null)}
                className="btn-secondary px-5 font-semibold text-text-secondary hover:text-white"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE LEVEL WORKOUT RUNNER */}
      {activeWorkoutLevel && (
        <MotionStudio
          userProfile={userProfile}
          initialExerciseId={activeWorkoutLevel.exercise_id}
          targetRepsOverride={activeWorkoutLevel.target_reps > 0 ? activeWorkoutLevel.target_reps : undefined}
          targetDurationOverride={activeWorkoutLevel.target_duration_seconds > 0 ? activeWorkoutLevel.target_duration_seconds : undefined}
          isGameModeLevel={true}
          gameLevelId={activeWorkoutLevel.id}
          onWorkoutSaved={handleLevelCompleted}
          onClose={() => setActiveWorkoutLevel(null)}
        />
      )}
    </div>
  );
};
