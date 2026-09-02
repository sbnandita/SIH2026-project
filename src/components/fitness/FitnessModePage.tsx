import React, { useState } from 'react';
import { UserProfile, ExerciseId, WorkoutSession } from '../../types';
import { EXERCISE_LIBRARY } from '../../lib/constants';
import { FitronDB } from '../../lib/db';
import { MotionStudio } from '../motion/MotionStudio';
import { 
  Dumbbell, 
  Plus, 
  Play, 
  Clock, 
  Calendar, 
  Zap, 
  Flame, 
  Camera, 
  Edit3, 
  CheckCircle,
  Filter
} from 'lucide-react';

interface FitnessModePageProps {
  userProfile: UserProfile;
  onProfileUpdated: () => void;
}

export const FitnessModePage: React.FC<FitnessModePageProps> = ({ userProfile, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState<'library' | 'custom' | 'history'>('library');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeWorkoutExercise, setActiveWorkoutExercise] = useState<ExerciseId | null>(null);

  // Custom Workout Form State
  const [customExerciseId, setCustomExerciseId] = useState<ExerciseId>('standard_pushups');
  const [customSets, setCustomSets] = useState<number>(3);
  const [customReps, setCustomReps] = useState<number>(10);
  const [customRest, setCustomRest] = useState<number>(60);

  const workoutHistory = FitronDB.getWorkoutSessions();

  const exerciseList = Object.values(EXERCISE_LIBRARY);
  const filteredExercises = selectedCategory === 'All'
    ? exerciseList
    : exerciseList.filter(e => e.category === selectedCategory);

  const handleStartExercise = (id: ExerciseId) => {
    setActiveWorkoutExercise(id);
  };

  const handleWorkoutCompleted = (session: WorkoutSession) => {
    setActiveWorkoutExercise(null);
    onProfileUpdated();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl fitron-card p-8 border border-border-subtle bg-gradient-to-r from-bg-card via-bg-secondary to-[#1c060f]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-dark/40 border border-crimson/40 text-crimson-pastel text-xs font-semibold uppercase tracking-wider mb-3">
              <Dumbbell className="w-3.5 h-3.5" />
              Athletic Training Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              FITNESS MODE
            </h1>
            <p className="text-text-secondary mt-2 max-w-xl text-sm sm:text-base">
              Build custom training routines, select targeted exercises, configure sets and reps, and track your physical history with real form validation.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-4 rounded-2xl bg-bg-primary/90 border border-border-subtle shadow-card text-center">
              <div className="text-xs text-text-muted">Total Workouts</div>
              <div className="text-2xl font-bold text-white font-heading">
                {workoutHistory.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
            activeTab === 'library'
              ? 'bg-crimson text-white shadow-crimson-sm'
              : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Exercise Library ({exerciseList.length})
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
            activeTab === 'custom'
              ? 'bg-crimson text-white shadow-crimson-sm'
              : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <Plus className="w-4 h-4" />
          Custom Workout Builder
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
            activeTab === 'history'
              ? 'bg-crimson text-white shadow-crimson-sm'
              : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <Clock className="w-4 h-4" />
          Workout History ({workoutHistory.length})
        </button>
      </div>

      {/* TAB 1: EXERCISE LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['All', 'Upper', 'Lower', 'Core', 'Cardio'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-crimson-dark text-white border border-crimson'
                    : 'bg-bg-card text-text-secondary hover:text-white border border-border-subtle'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map(ex => (
              <div
                key={ex.id}
                className="fitron-card rounded-2xl p-6 border border-border-subtle hover:border-crimson/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-crimson-dark/30 text-crimson-pastel border border-crimson/40 uppercase tracking-wider">
                      {ex.category}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" /> Camera Supported
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mt-3 font-heading">{ex.name}</h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{ex.description}</p>

                  <div className="mt-4 p-3 rounded-xl bg-bg-secondary border border-border-subtle grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-text-muted block text-[10px]">Sets</span>
                      <span className="font-bold text-white">{ex.defaultSets}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">Target</span>
                      <span className="font-bold text-white">{ex.defaultReps} {ex.isTimeBased ? 's' : 'reps'}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">Rest</span>
                      <span className="font-bold text-white">{ex.defaultRestSeconds}s</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-xs font-semibold text-crimson-pastel flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> +{ex.xpPerRep} XP / rep
                  </span>

                  <button
                    onClick={() => handleStartExercise(ex.id)}
                    className="btn-crimson px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-crimson-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Start Workout
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM WORKOUT BUILDER */}
      {activeTab === 'custom' && (
        <div className="fitron-card p-8 rounded-3xl border border-border-subtle max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-crimson-dark/40 border border-crimson/40 flex items-center justify-center text-crimson-pastel">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Custom Routine Builder</h2>
              <p className="text-xs text-text-secondary">Configure workout variables before starting session</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1 font-semibold">Select Exercise</label>
              <select
                value={customExerciseId}
                onChange={(e) => setCustomExerciseId(e.target.value as ExerciseId)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-white text-sm font-semibold focus:outline-none focus:border-crimson"
              >
                {exerciseList.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name} ({ex.category})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-text-muted block mb-1 font-semibold">Sets</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={customSets}
                  onChange={(e) => setCustomSets(parseInt(e.target.value) || 1)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-white text-center font-bold text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1 font-semibold">Reps / Duration</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={customReps}
                  onChange={(e) => setCustomReps(parseInt(e.target.value) || 1)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-white text-center font-bold text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1 font-semibold">Rest Time (s)</label>
                <input
                  type="number"
                  min="15"
                  max="300"
                  value={customRest}
                  onChange={(e) => setCustomRest(parseInt(e.target.value) || 30)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-white text-center font-bold text-sm"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle flex items-center justify-between text-xs">
              <span className="text-text-muted">Total Movement Volume:</span>
              <span className="font-bold text-white">{customSets * customReps} reps • Est. +{customSets * customReps * 4 + 20} XP</span>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              onClick={() => handleStartExercise(customExerciseId)}
              className="btn-crimson flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 shadow-crimson-md"
            >
              <Play className="w-4 h-4 fill-white" />
              Launch Custom Workout Session
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: WORKOUT HISTORY */}
      {activeTab === 'history' && (
        <div className="fitron-card p-6 border border-border-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-crimson-pastel" />
              Workout History Ledger
            </h2>
            <span className="text-xs text-text-secondary">Verified physical activities</span>
          </div>

          {workoutHistory.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">
              No workouts recorded yet. Start an exercise session above to log your first activity!
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {workoutHistory.map(session => (
                <div key={session.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      session.source === 'camera'
                        ? 'bg-crimson-dark/40 text-crimson-pastel border border-crimson/40'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}>
                      {session.source === 'camera' ? <Camera className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-white text-base">{session.exercise_name}</div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {new Date(session.created_at).toLocaleDateString()} • {session.total_sets} Sets • {session.total_reps} Reps • {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-sm font-bold text-crimson-pastel font-heading">
                        +{session.xp_earned} XP
                      </div>
                      <div className="text-xs font-semibold text-amber-400">
                        +{session.coins_earned} Coins
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE WORKOUT OVERLAY */}
      {activeWorkoutExercise && (
        <MotionStudio
          userProfile={userProfile}
          initialExerciseId={activeWorkoutExercise}
          onWorkoutSaved={handleWorkoutCompleted}
          onClose={() => setActiveWorkoutExercise(null)}
        />
      )}
    </div>
  );
};
