import React, { useState } from 'react';
import { UserProfile, NotificationPreferences } from '../../types';
import { FitronDB } from '../../lib/db';
import { ACHIEVEMENTS } from '../../lib/constants';
import { getRankDetails, RANK_THRESHOLDS } from '../../lib/rankEngine';
import { AvatarPreview } from '../avatar/AvatarPreview';
import { AvatarBuilder } from '../avatar/AvatarBuilder';
import { 
  User, 
  Trophy, 
  Flame, 
  Zap, 
  Coins, 
  Settings, 
  Bell, 
  Palette, 
  History, 
  CheckCircle, 
  Lock, 
  Sparkles,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfilePageProps {
  userProfile: UserProfile;
  onProfileUpdated: () => void;
  onNavigateToStore?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userProfile,
  onProfileUpdated,
  onNavigateToStore,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'customization' | 'settings'>('overview');
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
    FitronDB.getNotificationPreferences()
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(userProfile.full_name);

  const userAchievements = FitronDB.getUserAchievements();
  const unlockedAchievementIds = userAchievements.map(ua => ua.achievement_id);
  const rankInfo = getRankDetails(userProfile.xp);

  const handleTogglePref = (key: keyof NotificationPreferences) => {
    if (key === 'user_id') return;
    const updated = {
      ...notificationPrefs,
      [key]: !notificationPrefs[key],
    };
    setNotificationPrefs(updated);
    FitronDB.updateNotificationPreferences(updated);
  };

  const handleEnableAllPrefs = () => {
    const updated: NotificationPreferences = {
      ...notificationPrefs,
      friend_requests: true,
      challenges: true,
      achievements: true,
      game_updates: true,
      workout_updates: true,
      goals: true,
      daily_missions: true,
      activity_reminders: true,
      weekly_summary: true,
      cosmetic_unlocks: true,
    };
    setNotificationPrefs(updated);
    FitronDB.updateNotificationPreferences(updated);
  };

  const handleDisableAllPrefs = () => {
    const updated: NotificationPreferences = {
      ...notificationPrefs,
      friend_requests: false,
      challenges: false,
      achievements: false,
      game_updates: false,
      workout_updates: false,
      goals: false,
      daily_missions: false,
      activity_reminders: false,
      weekly_summary: false,
      cosmetic_unlocks: false,
    };
    setNotificationPrefs(updated);
    FitronDB.updateNotificationPreferences(updated);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNameValue.trim()) return;
    FitronDB.updateProfile({ full_name: editNameValue.trim() });
    setIsEditingName(false);
    onProfileUpdated();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Profile Hero Card */}
      <div className="relative overflow-hidden rounded-3xl fitron-card p-8 border border-border-subtle bg-gradient-to-r from-bg-card via-bg-secondary to-[#1c060f]">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <AvatarPreview equipped={userProfile.equipped_avatar} size="xl" animate />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-crimson-dark text-[10px] font-bold px-3 py-0.5 rounded-full border border-crimson text-white tracking-wider">
                {userProfile.fitron_id}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                {isEditingName ? (
                  <form onSubmit={handleSaveName} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      className="bg-bg-primary border border-crimson rounded-lg px-2 py-1 text-white font-bold text-lg"
                      autoFocus
                    />
                    <button type="submit" className="text-xs bg-crimson px-2 py-1 rounded text-white font-semibold">Save</button>
                    <button type="button" onClick={() => setIsEditingName(false)} className="text-xs text-text-muted">Cancel</button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                      {userProfile.full_name}
                    </h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-text-muted hover:text-white p-1"
                      title="Edit Name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-xs text-text-secondary mt-0.5 font-mono">@{userProfile.username}</div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${rankInfo.badgeClass}`}>
                  {userProfile.rank} RANK
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {userProfile.streak} Day Streak
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-crimson-dark/30 text-crimson-pastel border border-crimson/40 flex items-center gap-1 font-heading">
                  <Zap className="w-3.5 h-3.5" />
                  {userProfile.xp} XP
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1 font-heading">
                  <Coins className="w-3.5 h-3.5" />
                  {userProfile.coins} Coins
                </span>
              </div>
            </div>
          </div>

          {/* XP Progress to Next Rank */}
          {!rankInfo.isMaxRank && (
            <div className="w-full md:w-64 p-4 rounded-2xl bg-bg-primary/90 border border-border-subtle text-left shadow-card">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Next Rank:</span>
                <span className="font-bold text-white font-heading">{RANK_THRESHOLDS[userProfile.rank]?.next}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-bg-secondary mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-crimson to-crimson-pastel transition-all duration-500"
                  style={{ width: `${rankInfo.progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-text-secondary mt-1.5 flex justify-between">
                <span>{rankInfo.progressPercent}%</span>
                <span>{rankInfo.xpToNext} XP needed</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
            activeTab === 'overview'
              ? 'bg-crimson text-white shadow-crimson-sm'
              : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <User className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
            activeTab === 'achievements'
              ? 'bg-crimson text-white shadow-crimson-sm'
              : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <Trophy className="w-4 h-4" /> Achievements ({unlockedAchievementIds.length}/{ACHIEVEMENTS.length})
        </button>
        <button
          onClick={() => setActiveTab('customization')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
            activeTab === 'customization'
              ? 'bg-crimson text-white shadow-crimson-sm'
              : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <Palette className="w-4 h-4" /> Avatar & Theme
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
            activeTab === 'settings'
              ? 'bg-crimson text-white shadow-crimson-sm'
              : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <Settings className="w-4 h-4" /> Notification Settings
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="fitron-card p-6 rounded-2xl border border-border-subtle space-y-2">
              <div className="text-xs text-text-muted">Current Theme</div>
              <div className="text-lg font-bold text-white capitalize">{userProfile.equipped_background.replace('_', ' ')}</div>
              <p className="text-xs text-text-secondary">Atmospheric background active across FITRON.</p>
            </div>

            <div className="fitron-card p-6 rounded-2xl border border-border-subtle space-y-2">
              <div className="text-xs text-text-muted">Adventure Stage</div>
              <div className="text-lg font-bold text-crimson-pastel">Stage {userProfile.current_level}</div>
              <p className="text-xs text-text-secondary">Next active level node in Game Mode map.</p>
            </div>

            <div className="fitron-card p-6 rounded-2xl border border-border-subtle space-y-2">
              <div className="text-xs text-text-muted">Member Since</div>
              <div className="text-lg font-bold text-white">{new Date(userProfile.created_at).toLocaleDateString()}</div>
              <p className="text-xs text-text-secondary">Authenticated on verified Supabase ledger.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedAchievementIds.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`fitron-card rounded-2xl p-6 border transition flex flex-col justify-between ${
                  isUnlocked
                    ? 'border-crimson/50 bg-gradient-to-b from-bg-card to-[#1d0a14]'
                    : 'border-border-subtle opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bg-secondary text-text-secondary uppercase">
                      {ach.category}
                    </span>
                    {isUnlocked ? (
                      <span className="text-xs font-bold text-crimson-pastel flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Locked
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mt-3 font-heading">{ach.title}</h3>
                  <p className="text-xs text-text-secondary mt-1">{ach.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs font-semibold">
                  <span className="text-crimson-pastel flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> +{ach.xp_reward} XP
                  </span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> +{ach.coin_reward} Coins
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: CUSTOMIZATION */}
      {activeTab === 'customization' && (
        <AvatarBuilder userProfile={userProfile} onAvatarUpdated={onProfileUpdated} />
      )}

      {/* TAB 4: SETTINGS & NOTIFICATION PREFERENCES */}
      {activeTab === 'settings' && (
        <div className="fitron-card p-8 rounded-3xl border border-border-subtle max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
            <div>
              <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                <Bell className="w-5 h-5 text-crimson-pastel" /> Notification & Alert Preferences
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">Control which event notifications appear in your FITRON hub</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEnableAllPrefs}
                className="text-xs px-2.5 py-1 rounded bg-bg-secondary text-text-secondary hover:text-white border border-border-subtle"
              >
                Enable All
              </button>
              <button
                onClick={handleDisableAllPrefs}
                className="text-xs px-2.5 py-1 rounded bg-bg-secondary text-text-secondary hover:text-white border border-border-subtle"
              >
                Disable All
              </button>
            </div>
          </div>

          <div className="divide-y divide-border-subtle">
            {[
              { key: 'friend_requests', label: 'Friend Requests & Social' },
              { key: 'challenges', label: 'Challenges & Consistency Milestones' },
              { key: 'achievements', label: 'Achievement Unlocks & Rank Ups' },
              { key: 'game_updates', label: 'Game Mode Stages & Unlocks' },
              { key: 'workout_updates', label: 'Workout Completions & XP Gains' },
              { key: 'goals', label: 'Personal Targets & Mission Progress' },
              { key: 'activity_reminders', label: 'Daily Movement Reminders (Max 1/day)' },
              { key: 'cosmetic_unlocks', label: 'Cosmetic Unlocks & Store Items' },
            ].map(item => {
              const key = item.key as keyof NotificationPreferences;
              const isEnabled = notificationPrefs[key];

              return (
                <div key={item.key} className="py-3.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                  <button
                    onClick={() => handleTogglePref(key)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isEnabled ? 'bg-crimson' : 'bg-bg-secondary border border-border-subtle'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        isEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
