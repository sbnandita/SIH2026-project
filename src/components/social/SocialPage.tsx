import React, { useState } from 'react';
import { UserProfile, FriendProfile, RankType } from '../../types';
import { FitronDB } from '../../lib/db';
import { AvatarPreview } from '../avatar/AvatarPreview';
import { 
  Users, 
  Trophy, 
  UserPlus, 
  Flame, 
  Zap, 
  Crown, 
  Medal, 
  ShieldCheck, 
  Search, 
  Check, 
  X, 
  Sparkles,
  Award,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SocialPageProps {
  userProfile: UserProfile;
  onProfileUpdated: () => void;
}

export const SocialPage: React.FC<SocialPageProps> = ({ userProfile, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'leaderboards'>('leaderboards');
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'weekly' | 'friends'>('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<{ success: boolean; message: string } | null>(null);

  const friends = FitronDB.getFriends();
  const leaderboard = FitronDB.getLeaderboard(leaderboardType);

  const handleSendFriendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const result = FitronDB.sendFriendRequest(searchQuery);
    setSearchStatus(result);
    if (result.success) {
      setSearchQuery('');
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      onProfileUpdated();
    }
  };

  const handleRemoveFriend = (id: string) => {
    FitronDB.removeFriend(id);
    onProfileUpdated();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl fitron-card p-8 border border-border-subtle bg-gradient-to-r from-bg-card via-bg-secondary to-[#1c060f]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-dark/40 border border-crimson/40 text-crimson-pastel text-xs font-semibold uppercase tracking-wider mb-3">
              <Users className="w-3.5 h-3.5" />
              Social Arena & Community
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              FRIENDS & LEADERBOARDS
            </h1>
            <p className="text-text-secondary mt-2 max-w-xl text-sm sm:text-base">
              Connect with fellow athletes using unique FITRON IDs. Compete on global movement volume and consistency streaks.
            </p>
          </div>

          <div className="px-6 py-4 rounded-2xl bg-bg-primary/90 border border-border-subtle shadow-card flex items-center gap-3">
            <div>
              <div className="text-xs text-text-muted">Your FITRON ID</div>
              <div className="text-xl font-mono font-bold text-crimson-pastel tracking-wider">
                {userProfile.fitron_id}
              </div>
            </div>
          </div>
        </div>

        {/* Health Ethics Notice */}
        <div className="relative z-10 mt-6 pt-4 border-t border-border-subtle/60 flex items-center gap-2 text-xs text-text-secondary">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Responsible Competition: Leaderboards rank solely on verified XP and consistency. Weight and appearance are never ranked.</span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('leaderboards')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
              activeTab === 'leaderboards'
                ? 'bg-crimson text-white shadow-crimson-sm'
                : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Ranked Leaderboards
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
              activeTab === 'friends'
                ? 'bg-crimson text-white shadow-crimson-sm'
                : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
            }`}
          >
            <Users className="w-4 h-4" />
            Friends ({friends.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LEADERBOARDS */}
      {activeTab === 'leaderboards' && (
        <div className="space-y-6">
          {/* Subtabs for Leaderboard Filter */}
          <div className="flex items-center gap-2">
            {[
              { id: 'global', label: 'Global Ranking' },
              { id: 'weekly', label: 'Weekly Consistency' },
              { id: 'friends', label: 'Friends Only' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLeaderboardType(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  leaderboardType === tab.id
                    ? 'bg-crimson-dark text-white border border-crimson'
                    : 'bg-bg-card text-text-secondary hover:text-white border border-border-subtle'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {leaderboard.slice(0, 3).map((athlete, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              const medalColors = isFirst
                ? 'border-amber-500/50 bg-gradient-to-b from-[#241708] to-bg-card'
                : isSecond
                ? 'border-zinc-400/50 bg-gradient-to-b from-[#1c1d1e] to-bg-card'
                : 'border-amber-700/50 bg-gradient-to-b from-[#20100a] to-bg-card';

              const rankText = isFirst ? '1st Place' : isSecond ? '2nd Place' : '3rd Place';

              return (
                <div
                  key={athlete.id}
                  className={`fitron-card rounded-3xl p-6 border transition flex flex-col items-center text-center relative ${medalColors} ${
                    isFirst ? 'md:-translate-y-3 shadow-crimson-md' : ''
                  }`}
                >
                  <div className="absolute top-4 right-4">
                    {isFirst ? (
                      <Crown className="w-6 h-6 text-amber-400 fill-amber-400" />
                    ) : (
                      <Medal className="w-5 h-5 text-text-secondary" />
                    )}
                  </div>

                  <div className="relative mb-3">
                    <AvatarPreview equipped={athlete.equipped_avatar} size="lg" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-crimson text-white">
                      {rankText}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-lg mt-2">{athlete.username}</h3>
                  <div className="text-xs text-text-muted font-mono">{athlete.fitron_id}</div>

                  <div className="mt-4 pt-3 border-t border-border-subtle/60 w-full flex items-center justify-around text-xs">
                    <div>
                      <div className="text-text-muted text-[10px]">Rank</div>
                      <div className="font-bold text-crimson-pastel">{athlete.rank}</div>
                    </div>
                    <div>
                      <div className="text-text-muted text-[10px]">XP</div>
                      <div className="font-bold text-white font-heading text-sm">{athlete.xp}</div>
                    </div>
                    <div>
                      <div className="text-text-muted text-[10px]">Streak</div>
                      <div className="font-bold text-amber-400 flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> {athlete.streak}d
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Leaderboard Table */}
          <div className="fitron-card rounded-2xl border border-border-subtle overflow-hidden">
            <div className="p-4 bg-bg-secondary border-b border-border-subtle text-xs font-semibold text-text-muted grid grid-cols-12 gap-4">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Athlete</div>
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-2 text-center">Streak</div>
              <div className="col-span-2 text-right">Total XP</div>
            </div>

            <div className="divide-y divide-border-subtle">
              {leaderboard.map((athlete, index) => {
                const isUser = athlete.fitron_id === userProfile.fitron_id;
                return (
                  <div
                    key={athlete.id}
                    className={`p-4 grid grid-cols-12 gap-4 items-center text-sm transition ${
                      isUser ? 'bg-crimson-dark/20 font-semibold' : 'hover:bg-bg-secondary/40'
                    }`}
                  >
                    <div className="col-span-1 text-center font-bold text-text-muted">
                      {index + 1}
                    </div>

                    <div className="col-span-5 flex items-center gap-3">
                      <AvatarPreview equipped={athlete.equipped_avatar} size="xs" showBackground={false} />
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {athlete.username}
                          {isUser && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-crimson text-white">YOU</span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted font-mono">{athlete.fitron_id}</div>
                      </div>
                    </div>

                    <div className="col-span-2 text-center">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        athlete.rank === 'DIAMOND' ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30' :
                        athlete.rank === 'PLATINUM' ? 'text-zinc-200 bg-zinc-800' :
                        athlete.rank === 'GOLD' ? 'text-amber-400 bg-amber-950/40' :
                        athlete.rank === 'SILVER' ? 'text-zinc-300 bg-zinc-800' :
                        'text-amber-600 bg-amber-950/20'
                      }`}>
                        {athlete.rank}
                      </span>
                    </div>

                    <div className="col-span-2 text-center font-bold text-amber-400 flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{athlete.streak}d</span>
                    </div>

                    <div className="col-span-2 text-right font-bold text-white font-heading text-base">
                      {athlete.xp} <span className="text-xs font-normal text-text-muted">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FRIENDS MANAGEMENT */}
      {activeTab === 'friends' && (
        <div className="space-y-8">
          {/* Add Friend Search Input */}
          <div className="fitron-card p-6 rounded-2xl border border-border-subtle">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-crimson-pastel" /> Connect with Athletes
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Enter any athlete's unique FITRON ID (e.g. FTR-91823) or username to connect.
            </p>

            <form onSubmit={handleSendFriendRequest} className="flex gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Enter FITRON ID (e.g. FTR-12948) or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-crimson font-mono"
                />
              </div>
              <button
                type="submit"
                className="btn-crimson px-6 py-3 text-xs font-bold flex items-center gap-1.5 shadow-crimson-sm"
              >
                <UserPlus className="w-4 h-4" /> Send Request
              </button>
            </form>

            {searchStatus && (
              <div className={`mt-3 text-xs p-3 rounded-xl border ${
                searchStatus.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-crimson-dark/30 border-crimson/50 text-crimson-pastel'
              }`}>
                {searchStatus.message}
              </div>
            )}
          </div>

          {/* Friends List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="fitron-card rounded-2xl p-6 border border-border-subtle flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <AvatarPreview equipped={friend.equipped_avatar} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{friend.username}</h4>
                      <span className={`w-2 h-2 rounded-full ${
                        friend.online_status === 'online' ? 'bg-emerald-400' :
                        friend.online_status === 'in_workout' ? 'bg-amber-400 animate-ping' :
                        'bg-zinc-600'
                      }`} />
                    </div>
                    <div className="text-xs font-mono text-text-muted">{friend.fitron_id}</div>

                    <div className="flex items-center gap-3 mt-3 text-xs">
                      <span className="text-crimson-pastel font-bold">{friend.rank}</span>
                      <span className="text-text-muted">•</span>
                      <span className="text-white font-mono">{friend.xp} XP</span>
                      <span className="text-text-muted">•</span>
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> {friend.streak}d
                      </span>
                    </div>

                    {friend.last_activity && (
                      <p className="text-[11px] text-text-secondary mt-2 bg-bg-secondary px-2 py-1 rounded-lg border border-border-subtle/50">
                        {friend.last_activity}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="text-text-muted hover:text-crimson-pastel text-xs p-1"
                  title="Remove friend"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
