import React from 'react';
import { UserProfile, ExerciseId } from '../../types';
import { FitronDB } from '../../lib/db';
import { getRankDetails } from '../../lib/rankEngine';
import { AvatarPreview } from '../avatar/AvatarPreview';
import { 
  Flame, 
  Zap, 
  Coins, 
  Trophy, 
  Gamepad2, 
  Camera, 
  Dumbbell, 
  Bot, 
  ShoppingBag, 
  ChevronRight, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Users, 
  Play,
  Target
} from 'lucide-react';

interface DashboardPageProps {
  userProfile: UserProfile;
  onNavigate: (tab: string) => void;
  onStartMotionWorkout: (exerciseId?: ExerciseId) => void;
  onProfileUpdated: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  userProfile,
  onNavigate,
  onStartMotionWorkout,
  onProfileUpdated,
}) => {
  const rankInfo = getRankDetails(userProfile.xp);
  const dailyMissions = FitronDB.getDailyMissions();
  const userChallenges = FitronDB.getUserChallenges();
  const friends = FitronDB.getFriends();
  const workouts = FitronDB.getWorkoutSessions();
  const notifications = FitronDB.getNotifications();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Hero Athlete Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl fitron-card p-6 sm:p-8 border border-border-subtle bg-gradient-to-r from-bg-card via-bg-secondary to-[#1c060f]">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative cursor-pointer" onClick={() => onNavigate('profile')}>
              <AvatarPreview equipped={userProfile.equipped_avatar} size="lg" animate />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-crimson-dark text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-crimson text-white tracking-wider">
                {userProfile.fitron_id}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-crimson-pastel uppercase tracking-wider">
                Athlete Overview
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-0.5">
                Welcome back, {userProfile.full_name.split(' ')[0]}!
              </h1>
              <p className="text-text-secondary text-xs sm:text-sm mt-1">
                Your movement is the game. Ready to level up today?
              </p>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${rankInfo.badgeClass}`}>
                  {userProfile.rank} RANK
                </span>
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {userProfile.streak} Day Streak
                </span>
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1 font-heading">
                  <Coins className="w-3.5 h-3.5" />
                  {userProfile.coins} Coins
                </span>
              </div>
            </div>
          </div>

          {/* XP Rank Progression Widget */}
          <div className="w-full md:w-72 p-5 rounded-2xl bg-bg-primary/90 border border-border-subtle text-left shadow-card">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Current Experience</span>
              <span className="font-bold text-crimson-pastel font-heading text-sm">{userProfile.xp} XP</span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-bg-secondary mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-crimson to-crimson-pastel transition-all duration-500"
                style={{ width: `${rankInfo.progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-secondary mt-2">
              <span>{rankInfo.progressPercent}% to next rank</span>
              <span>{!rankInfo.isMaxRank ? `${rankInfo.xpToNext} XP needed` : 'MAX RANK'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Hub */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-crimson-pastel" /> Quick Actions
          </h2>
          <span className="text-xs text-text-muted">Immediate Game & Workout Launchers</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <button
            onClick={() => onStartMotionWorkout('standard_pushups')}
            className="fitron-card fitron-card-hover p-4 rounded-2xl border border-border-subtle flex flex-col items-center text-center group transition"
          >
            <div className="w-11 h-11 rounded-xl bg-crimson-dark/40 border border-crimson/50 text-crimson-pastel flex items-center justify-center group-hover:scale-110 transition shadow-crimson-sm mb-2">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">FITRON Motion</span>
            <span className="text-[10px] text-text-muted mt-0.5">Camera Track</span>
          </button>

          <button
            onClick={() => onNavigate('game')}
            className="fitron-card fitron-card-hover p-4 rounded-2xl border border-border-subtle flex flex-col items-center text-center group transition"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center group-hover:scale-110 transition mb-2">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Game Mode</span>
            <span className="text-[10px] text-text-muted mt-0.5">Stage {userProfile.current_level}</span>
          </button>

          <button
            onClick={() => onNavigate('fitness')}
            className="fitron-card fitron-card-hover p-4 rounded-2xl border border-border-subtle flex flex-col items-center text-center group transition"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center group-hover:scale-110 transition mb-2">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Start Workout</span>
            <span className="text-[10px] text-text-muted mt-0.5">Exercise Studio</span>
          </button>

          <button
            onClick={() => onNavigate('challenges')}
            className="fitron-card fitron-card-hover p-4 rounded-2xl border border-border-subtle flex flex-col items-center text-center group transition"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center group-hover:scale-110 transition mb-2">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Challenges</span>
            <span className="text-[10px] text-text-muted mt-0.5">Weekly Trials</span>
          </button>

          <button
            onClick={() => onNavigate('ai')}
            className="fitron-card fitron-card-hover p-4 rounded-2xl border border-border-subtle flex flex-col items-center text-center group transition"
          >
            <div className="w-11 h-11 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center group-hover:scale-110 transition mb-2">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">FITRON AI</span>
            <span className="text-[10px] text-text-muted mt-0.5">Coach Chat</span>
          </button>

          <button
            onClick={() => onNavigate('store')}
            className="fitron-card fitron-card-hover p-4 rounded-2xl border border-border-subtle flex flex-col items-center text-center group transition"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center group-hover:scale-110 transition mb-2">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Store</span>
            <span className="text-[10px] text-text-muted mt-0.5">Gear & Themes</span>
          </button>

          <button
            onClick={() => onNavigate('progress')}
            className="fitron-card fitron-card-hover p-4 rounded-2xl border border-border-subtle flex flex-col items-center text-center group transition"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition mb-2">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Progress</span>
            <span className="text-[10px] text-text-muted mt-0.5">Analytics & BMI</span>
          </button>
        </div>
      </div>

      {/* 3. Main Dashboard Grid (Missions, Adventure Map Teaser, Social Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Daily Missions & Adventure Map */}
        <div className="lg:col-span-8 space-y-8">
          {/* Daily Missions Card */}
          <div className="fitron-card p-6 rounded-3xl border border-border-subtle">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-crimson-pastel" /> Today's Missions
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">Complete daily movements to claim XP & Coin rewards</p>
              </div>
              <button
                onClick={() => onNavigate('challenges')}
                className="text-xs text-crimson-pastel font-semibold hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {dailyMissions.map((mission) => {
                const isComplete = mission.completed || (mission.current_value || 0) >= mission.target_value;
                return (
                  <div
                    key={mission.id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                      isComplete
                        ? 'bg-bg-secondary border-emerald-500/40'
                        : 'bg-bg-secondary border-border-subtle'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-text-muted font-semibold uppercase">
                        <span>Mission</span>
                        {isComplete && <span className="text-emerald-400 font-bold">Done</span>}
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{mission.title}</h4>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{mission.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                      <span className="text-crimson-pastel font-bold">+{mission.xp_reward} XP</span>
                      <span className="text-amber-400 font-bold">+{mission.coin_reward} C</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Game Mode Level Progress Card */}
          <div className="fitron-card p-6 rounded-3xl border border-border-subtle relative overflow-hidden bg-gradient-to-br from-bg-card to-[#190913]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-crimson-dark/40 text-crimson-pastel border border-crimson/40 uppercase">
                  Current Stage
                </span>
                <h3 className="text-xl font-bold text-white font-heading mt-1">
                  Adventure Level {userProfile.current_level}
                </h3>
              </div>

              <button
                onClick={() => onNavigate('game')}
                className="btn-crimson px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-crimson-sm self-start sm:self-auto"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Launch Adventure Map
              </button>
            </div>

            <p className="text-xs text-text-secondary mt-4">
              Advance your fitness journey node-by-node. Every stage tests verified form and awards XP and store Coins.
            </p>
          </div>
        </div>

        {/* Right Column (4 cols): Friend Activity & Recent Notifications */}
        <div className="lg:col-span-4 space-y-6">
          {/* Friend Activity Feed */}
          <div className="fitron-card p-6 rounded-3xl border border-border-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-crimson-pastel" /> Friend Activity
              </h3>
              <button
                onClick={() => onNavigate('social')}
                className="text-xs text-crimson-pastel hover:underline"
              >
                Leaderboard
              </button>
            </div>

            <div className="divide-y divide-border-subtle mt-2">
              {friends.slice(0, 4).map((friend) => (
                <div key={friend.id} className="py-3 flex items-center gap-3">
                  <AvatarPreview equipped={friend.equipped_avatar} size="xs" showBackground={false} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{friend.username}</div>
                    <div className="text-[11px] text-text-muted truncate">
                      {friend.last_activity || 'Active recently'}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-crimson-pastel font-heading">
                    {friend.xp} XP
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications Snippet */}
          <div className="fitron-card p-6 rounded-3xl border border-border-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Recent Alerts
              </h3>
              <button
                onClick={() => onNavigate('notifications')}
                className="text-xs text-crimson-pastel hover:underline"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-border-subtle mt-2">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="py-2.5">
                  <div className="text-xs font-semibold text-white truncate">{notif.title}</div>
                  <div className="text-[11px] text-text-secondary truncate mt-0.5">{notif.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
