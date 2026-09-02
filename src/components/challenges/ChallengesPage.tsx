import React, { useState } from 'react';
import { UserProfile, Challenge, UserChallenge, DailyMission, Goal } from '../../types';
import { CHALLENGES } from '../../lib/constants';
import { FitronDB } from '../../lib/db';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Coins, 
  CheckCircle, 
  Target, 
  Clock, 
  Plus, 
  Sparkles,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChallengesPageProps {
  userProfile: UserProfile;
  onProfileUpdated: () => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ userProfile, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'missions' | 'goals'>('challenges');
  const userChallenges = FitronDB.getUserChallenges();
  const dailyMissions = FitronDB.getDailyMissions();
  const goals = FitronDB.getGoals();

  // New Goal Modal State
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(30);
  const [newGoalUnit, setNewGoalUnit] = useState<'mins' | 'reps'>('mins');
  const [newGoalFreq, setNewGoalFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    FitronDB.addGoal(newGoalTitle, newGoalTarget, newGoalUnit, newGoalFreq);
    setShowNewGoalModal(false);
    setNewGoalTitle('');
    onProfileUpdated();
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl fitron-card p-8 border border-border-subtle bg-gradient-to-r from-bg-card via-bg-secondary to-[#1c060f]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-dark/40 border border-crimson/40 text-crimson-pastel text-xs font-semibold uppercase tracking-wider mb-3">
              <Trophy className="w-3.5 h-3.5" />
              Progressive Objectives & Milestones
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              CHALLENGES & MISSIONS
            </h1>
            <p className="text-text-secondary mt-2 max-w-xl text-sm sm:text-base">
              Complete consistency trials, daily missions, and personal targets to earn major XP spikes and cosmetic Coins.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-4 rounded-2xl bg-bg-primary/90 border border-border-subtle shadow-card text-center">
              <div className="text-xs text-text-muted">Completed Challenges</div>
              <div className="text-2xl font-bold text-crimson-pastel font-heading">
                {userChallenges.filter(c => c.status === 'COMPLETED').length} / {CHALLENGES.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
              activeTab === 'challenges'
                ? 'bg-crimson text-white shadow-crimson-sm'
                : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Active Challenges ({CHALLENGES.length})
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
              activeTab === 'missions'
                ? 'bg-crimson text-white shadow-crimson-sm'
                : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
            }`}
          >
            <Zap className="w-4 h-4" />
            Daily Missions ({dailyMissions.length})
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
              activeTab === 'goals'
                ? 'bg-crimson text-white shadow-crimson-sm'
                : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
            }`}
          >
            <Target className="w-4 h-4" />
            Personal Goals ({goals.length})
          </button>
        </div>

        {activeTab === 'goals' && (
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="btn-crimson px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Goal
          </button>
        )}
      </div>

      {/* TAB 1: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CHALLENGES.map((challenge) => {
            const userChal = userChallenges.find(uc => uc.challenge_id === challenge.id);
            const progress = userChal?.current_progress || 0;
            const isCompleted = userChal?.status === 'COMPLETED' || progress >= challenge.target_count;
            const percent = Math.min(100, Math.round((progress / challenge.target_count) * 100));

            return (
              <div
                key={challenge.id}
                className={`fitron-card rounded-2xl p-6 border transition flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-bg-card'
                    : 'border-border-subtle hover:border-crimson/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCompleted
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                          : 'bg-crimson-dark/40 text-crimson-pastel border border-crimson/40'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg font-heading">{challenge.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isCompleted ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-bg-secondary text-text-secondary'
                          }`}>
                            {isCompleted ? 'Completed' : 'Active'}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">{challenge.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Progress</span>
                      <span className="font-bold text-white font-mono">{progress} / {challenge.target_count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-bg-secondary overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-crimson to-crimson-pastel'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="text-crimson-pastel flex items-center gap-1 font-heading">
                      <Zap className="w-3.5 h-3.5" /> +{challenge.xp_reward} XP
                    </span>
                    <span className="text-amber-400 flex items-center gap-1 font-heading">
                      <Coins className="w-3.5 h-3.5" /> +{challenge.coin_reward} Coins
                    </span>
                  </div>

                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {challenge.duration_days} Days
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: DAILY MISSIONS */}
      {activeTab === 'missions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dailyMissions.map((mission) => {
            const isCompleted = mission.completed || (mission.current_value || 0) >= mission.target_value;
            const percent = Math.min(100, Math.round(((mission.current_value || 0) / mission.target_value) * 100));

            return (
              <div
                key={mission.id}
                className={`fitron-card rounded-2xl p-6 border transition flex flex-col justify-between ${
                  isCompleted ? 'border-emerald-500/40' : 'border-border-subtle hover:border-crimson/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bg-secondary text-text-secondary uppercase">
                      Daily Objective
                    </span>
                    {isCompleted && (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Done
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mt-3 font-heading">{mission.title}</h3>
                  <p className="text-xs text-text-secondary mt-1">{mission.description}</p>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Daily Progress</span>
                      <span className="font-bold text-white font-mono">{mission.current_value || 0} / {mission.target_value}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-bg-secondary overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-crimson'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs font-semibold">
                  <span className="text-crimson-pastel flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> +{mission.xp_reward} XP
                  </span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> +{mission.coin_reward} Coins
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: PERSONAL GOALS */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {goals.length === 0 ? (
            <div className="fitron-card p-12 text-center text-text-muted rounded-2xl border border-border-subtle">
              No personal targets created yet. Click "Create Goal" above to set your first active fitness goal!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const isCompleted = goal.completed || goal.current_value >= goal.target_value;
                const percent = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));

                return (
                  <div
                    key={goal.id}
                    className={`fitron-card rounded-2xl p-6 border transition flex flex-col justify-between ${
                      isCompleted ? 'border-emerald-500/40' : 'border-border-subtle'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bg-secondary text-text-secondary uppercase">
                          {goal.frequency} Target
                        </span>
                        {isCompleted && (
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Goal Achieved!
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white mt-3 font-heading">{goal.title}</h3>

                      <div className="mt-5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-muted">Current Progress</span>
                          <span className="font-bold text-white font-mono">
                            {goal.current_value} / {goal.target_value} {goal.unit} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-bg-secondary overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-crimson to-crimson-pastel'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                      <span>Remaining: {Math.max(0, goal.target_value - goal.current_value)} {goal.unit}</span>
                      <span className="text-crimson-pastel font-semibold">+30 XP upon completion</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE NEW GOAL MODAL */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleCreateGoal} className="fitron-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-border-subtle bg-bg-card shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                <Target className="w-5 h-5 text-crimson-pastel" /> Set Personal Target
              </h3>
              <button
                type="button"
                onClick={() => setShowNewGoalModal(false)}
                className="text-text-muted hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1 font-semibold">Goal Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45 active minutes daily, 100 push-ups"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-white text-sm focus:outline-none focus:border-crimson"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1 font-semibold">Target Value</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 1)}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-white text-center font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1 font-semibold">Unit</label>
                  <select
                    value={newGoalUnit}
                    onChange={(e) => setNewGoalUnit(e.target.value as 'mins' | 'reps')}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-white text-sm font-semibold focus:outline-none"
                  >
                    <option value="mins">Active Minutes</option>
                    <option value="reps">Total Repetitions</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-1 font-semibold">Frequency</label>
                <select
                  value={newGoalFreq}
                  onChange={(e) => setNewGoalFreq(e.target.value as any)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-white text-sm font-semibold focus:outline-none"
                >
                  <option value="DAILY">Daily Goal</option>
                  <option value="WEEKLY">Weekly Goal</option>
                  <option value="MONTHLY">Monthly Goal</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="btn-crimson flex-1 py-3.5 font-bold text-sm shadow-crimson-md"
              >
                Save Personal Target
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
