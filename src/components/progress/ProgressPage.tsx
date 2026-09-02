import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { FitronDB } from '../../lib/db';
import { getRankDetails } from '../../lib/rankEngine';
import { 
  TrendingUp, 
  Flame, 
  Zap, 
  Dumbbell, 
  Clock, 
  Trophy, 
  Camera, 
  Calculator, 
  ShieldCheck, 
  Activity,
  Award,
  Layers
} from 'lucide-react';

interface ProgressPageProps {
  userProfile: UserProfile;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ userProfile }) => {
  const workouts = FitronDB.getWorkoutSessions();
  const userLevels = FitronDB.getUserLevels();
  const userChallenges = FitronDB.getUserChallenges();
  const rankInfo = getRankDetails(userProfile.xp);

  // Aggregate stats
  const totalReps = workouts.reduce((sum, w) => sum + w.total_reps, 0);
  const totalDurationSeconds = workouts.reduce((sum, w) => sum + w.duration_seconds, 0);
  const totalActiveMinutes = Math.round(totalDurationSeconds / 60);
  const totalSets = workouts.reduce((sum, w) => sum + w.total_sets, 0);
  const cameraWorkoutsCount = workouts.filter(w => w.source === 'camera').length;
  const completedStages = userLevels.filter(ul => ul.completed).length;
  const completedChallenges = userChallenges.filter(uc => uc.status === 'COMPLETED').length;

  // BMI Calculator State
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [bmiResult, setBmiResult] = useState<{ value: number; category: string; color: string } | null>(null);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (heightCm <= 0 || weightKg <= 0) return;

    const heightM = heightCm / 100;
    const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

    let category = 'Normal';
    let color = 'text-emerald-400';
    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-400';
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Moderate / Standard';
      color = 'text-emerald-400';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      color = 'text-amber-400';
    } else {
      category = 'High Category';
      color = 'text-crimson-pastel';
    }

    setBmiResult({ value: bmi, category, color });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl fitron-card p-8 border border-border-subtle bg-gradient-to-r from-bg-card via-bg-secondary to-[#1c060f]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-dark/40 border border-crimson/40 text-crimson-pastel text-xs font-semibold uppercase tracking-wider mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Athletic Analytics & Analytics
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              MOVEMENT PROGRESS
            </h1>
            <p className="text-text-secondary mt-2 max-w-xl text-sm sm:text-base">
              Track your lifetime movement volume, workout consistency, stage completions, and rank velocity.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-4 rounded-2xl bg-bg-primary/90 border border-border-subtle shadow-card text-center">
              <div className="text-xs text-text-muted">Current Rank</div>
              <div className="text-2xl font-bold font-heading text-crimson-pastel">
                {userProfile.rank}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="fitron-card p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Clock className="w-4 h-4 text-crimson-pastel" /> Active Minutes
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-heading">
            {totalActiveMinutes}
            <span className="text-xs text-text-muted font-normal ml-1">mins</span>
          </div>
        </div>

        <div className="fitron-card p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Dumbbell className="w-4 h-4 text-amber-400" /> Total Repetitions
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-heading">
            {totalReps}
            <span className="text-xs text-text-muted font-normal ml-1">reps</span>
          </div>
        </div>

        <div className="fitron-card p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Flame className="w-4 h-4 text-orange-400" /> Consistency Streak
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-heading">
            {userProfile.streak}
            <span className="text-xs text-text-muted font-normal ml-1">days</span>
          </div>
        </div>

        <div className="fitron-card p-5 rounded-2xl border border-border-subtle">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Zap className="w-4 h-4 text-crimson-pastel" /> Total XP
          </div>
          <div className="text-3xl font-extrabold text-crimson-pastel mt-2 font-heading">
            {userProfile.xp}
            <span className="text-xs text-text-muted font-normal ml-1">XP</span>
          </div>
        </div>
      </div>

      {/* Secondary Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="fitron-card p-6 rounded-2xl border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-crimson-pastel" /> FITRON Motion Verified
            </h3>
            <span className="text-xs font-mono font-bold text-crimson-pastel">
              {cameraWorkoutsCount} Sessions
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Workouts verified via live browser camera computer vision with pose skeleton tracking.
          </p>
          <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle flex items-center justify-between text-xs">
            <span className="text-text-muted">Total Camera Sets</span>
            <span className="font-bold text-white">{cameraWorkoutsCount * 3} sets</span>
          </div>
        </div>

        <div className="fitron-card p-6 rounded-2xl border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Game Stages Cleared
            </h3>
            <span className="text-xs font-mono font-bold text-amber-400">
              {completedStages} / 20
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Progress through the 20-stage athletic adventure map.
          </p>
          <div className="w-full h-2 rounded-full bg-bg-secondary overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${Math.round((completedStages / 20) * 100)}%` }}
            />
          </div>
        </div>

        <div className="fitron-card p-6 rounded-2xl border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" /> Challenges Done
            </h3>
            <span className="text-xs font-mono font-bold text-blue-400">
              {completedChallenges} Challenges
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Multi-day consistency trials and volume targets completed.
          </p>
          <div className="p-3 rounded-xl bg-bg-secondary border border-border-subtle flex items-center justify-between text-xs">
            <span className="text-text-muted">Cosmetics Earned</span>
            <span className="font-bold text-amber-400">{userProfile.coins} Coins</span>
          </div>
        </div>
      </div>

      {/* RESPONSIBLE BMI SCREENING TOOL */}
      <div className="fitron-card p-8 rounded-3xl border border-border-subtle space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-crimson-pastel uppercase tracking-wider mb-1">
              <Calculator className="w-4 h-4" /> General Health Metric
            </div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Body Mass Index (BMI) Calculator
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Optional general screening estimation tool.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-bg-secondary border border-border-subtle flex items-center gap-2 text-xs text-text-secondary">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Zero Competition Impact</span>
          </div>
        </div>

        {/* Responsible Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-bg-secondary/80 border border-border-subtle text-xs text-text-secondary space-y-1.5 leading-relaxed">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Important Health & Ethical Disclaimer:
          </div>
          <p>
            • BMI is a general statistical screening tool and is <strong>never a clinical diagnosis</strong> of health, fitness, or body composition.
          </p>
          <p>
            • FITRON <strong>never uses BMI or weight</strong> for XP, athlete ranks, leaderboard rankings, rewards, or friend comparisons. Your movement is what matters.
          </p>
        </div>

        {/* Calculation Form */}
        <form onSubmit={calculateBMI} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-xs text-text-muted block mb-1 font-semibold">Height (cm)</label>
            <input
              type="number"
              min="100"
              max="250"
              required
              value={heightCm}
              onChange={(e) => setHeightCm(parseFloat(e.target.value) || 170)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-white font-bold text-sm text-center"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1 font-semibold">Weight (kg)</label>
            <input
              type="number"
              min="30"
              max="250"
              required
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-white font-bold text-sm text-center"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="btn-crimson w-full py-3.5 text-xs font-bold shadow-crimson-sm"
            >
              Calculate Metric
            </button>
          </div>
        </form>

        {/* Results Box */}
        {bmiResult && (
          <div className="p-5 rounded-2xl bg-bg-secondary border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
            <div>
              <div className="text-xs text-text-muted">Calculated Index:</div>
              <div className="text-3xl font-extrabold text-white font-heading mt-1">
                {bmiResult.value} <span className="text-xs text-text-muted font-normal">kg/m²</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs text-text-muted">General Category:</div>
              <div className={`text-lg font-bold ${bmiResult.color} mt-0.5`}>
                {bmiResult.category}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
