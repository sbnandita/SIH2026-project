import {
  UserProfile,
  WorkoutSession,
  WorkoutSet,
  GameLevel,
  UserLevel,
  Challenge,
  UserChallenge,
  Achievement,
  UserAchievement,
  DailyMission,
  Goal,
  XPTransaction,
  CoinTransaction,
  AppNotification,
  NotificationPreferences,
  FriendProfile,
  FriendRequest,
  EquippedAvatar,
  NotificationType,
  NotificationFilter,
} from '../types';
import {
  GAME_LEVELS,
  CHALLENGES,
  ACHIEVEMENTS,
  INITIAL_DAILY_MISSIONS,
  BACKGROUND_THEMES,
  AVATAR_ITEMS,
} from './constants';
import { calculateRank, checkStreakMilestone } from './rankEngine';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  USER_PROFILE: 'fitron_user_profile',
  WORKOUT_SESSIONS: 'fitron_workout_sessions',
  USER_LEVELS: 'fitron_user_levels',
  USER_CHALLENGES: 'fitron_user_challenges',
  USER_ACHIEVEMENTS: 'fitron_user_achievements',
  DAILY_MISSIONS: 'fitron_daily_missions',
  GOALS: 'fitron_goals',
  XP_TRANSACTIONS: 'fitron_xp_transactions',
  COIN_TRANSACTIONS: 'fitron_coin_transactions',
  UNLOCKED_BACKGROUNDS: 'fitron_unlocked_backgrounds',
  UNLOCKED_AVATAR_ITEMS: 'fitron_unlocked_avatar_items',
  NOTIFICATIONS: 'fitron_notifications',
  NOTIFICATION_PREFS: 'fitron_notification_prefs',
  FRIENDS: 'fitron_friends',
  FRIEND_REQUESTS: 'fitron_friend_requests',
};

// Seed demo friends and community athletes for rich social interaction
const SEED_FRIENDS: FriendProfile[] = [
  {
    id: 'friend_1',
    fitron_id: 'FTR-91823',
    username: 'CrimsonRunner',
    full_name: 'Maya Lin',
    rank: 'GOLD',
    xp: 1420,
    streak: 8,
    equipped_avatar: { face: 'face_1', hair: 'hair_2', outfit: 'outfit_2', accessory: 'acc_2', pose: 'pose_flex' },
    online_status: 'online',
    last_activity: 'Finished 15 Standard Push-Ups'
  },
  {
    id: 'friend_2',
    fitron_id: 'FTR-30491',
    username: 'ApexTitan',
    full_name: 'Alex Rivera',
    rank: 'PLATINUM',
    xp: 2650,
    streak: 15,
    equipped_avatar: { face: 'face_2', hair: 'hair_3', outfit: 'outfit_3', accessory: 'acc_3', pose: 'pose_apex' },
    online_status: 'in_workout',
    last_activity: 'In workout: 60s Plank Hold'
  },
  {
    id: 'friend_3',
    fitron_id: 'FTR-77120',
    username: 'ZenPulse',
    full_name: 'Devon Patel',
    rank: 'SILVER',
    xp: 890,
    streak: 5,
    equipped_avatar: { face: 'face_3', hair: 'hair_1', outfit: 'outfit_1', accessory: 'acc_1', pose: 'pose_zen' },
    online_status: 'offline',
    last_activity: 'Completed Game Level 4'
  },
  {
    id: 'friend_4',
    fitron_id: 'FTR-12948',
    username: 'ValkyrieMotion',
    full_name: 'Elena Rostova',
    rank: 'DIAMOND',
    xp: 4120,
    streak: 32,
    equipped_avatar: { face: 'face_2', hair: 'hair_4', outfit: 'outfit_4', accessory: 'acc_4', pose: 'pose_apex' },
    online_status: 'online',
    last_activity: 'Claimed Motion Pioneer Challenge'
  }
];

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Listener error:', e);
    }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function generateFitronId(): string {
  const randNum = Math.floor(10000 + Math.random() * 90000);
  return `FTR-${randNum}`;
}

export class FitronDB {
  // Initialize or retrieve user profile
  static getUserProfile(): UserProfile | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static createDefaultProfile(username: string, fullName: string, email: string): UserProfile {
    const newProfile: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      fitron_id: generateFitronId(),
      username: username || 'Athlete_' + Math.floor(Math.random() * 1000),
      full_name: fullName || 'FITRON Athlete',
      equipped_avatar: {
        face: 'face_1',
        hair: 'hair_1',
        outfit: 'outfit_1',
        accessory: 'acc_1',
        pose: 'pose_ready',
      },
      equipped_background: 'midnight',
      xp: 0,
      coins: 0,
      rank: 'BRONZE',
      current_level: 1,
      streak: 1,
      last_active_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile));

    // Initialize starter backgrounds (first 5 free)
    const starterBgs = BACKGROUND_THEMES.filter(b => b.is_starter).map(b => b.id);
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_BACKGROUNDS, JSON.stringify(starterBgs));

    // Initialize starter avatar items
    const starterAvatars = AVATAR_ITEMS.filter(a => a.is_starter).map(a => a.id);
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_AVATAR_ITEMS, JSON.stringify(starterAvatars));

    // Initialize starter challenges
    const initialUserChallenges: UserChallenge[] = CHALLENGES.map(c => ({
      id: 'uc_' + c.id,
      user_id: newProfile.id,
      challenge_id: c.id,
      current_progress: 0,
      status: 'ACTIVE',
      started_at: new Date().toISOString(),
    }));
    localStorage.setItem(STORAGE_KEYS.USER_CHALLENGES, JSON.stringify(initialUserChallenges));

    // Initialize daily missions
    localStorage.setItem(STORAGE_KEYS.DAILY_MISSIONS, JSON.stringify(INITIAL_DAILY_MISSIONS));

    // Initialize default goals
    const initialGoals: Goal[] = [
      {
        id: 'goal_1',
        user_id: newProfile.id,
        title: '30 Active Minutes Daily',
        target_value: 30,
        current_value: 0,
        unit: 'mins',
        frequency: 'DAILY',
        completed: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'goal_2',
        user_id: newProfile.id,
        title: '50 Total Push-Ups',
        target_value: 50,
        current_value: 0,
        unit: 'reps',
        frequency: 'WEEKLY',
        completed: false,
        created_at: new Date().toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(initialGoals));

    // Initialize starter notification preferences
    const defaultPrefs: NotificationPreferences = {
      user_id: newProfile.id,
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
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify(defaultPrefs));

    // Initialize starter welcome notification
    this.addNotification(
      'Welcome to FITRON!',
      'Your movement is the game. Complete workouts to earn XP, level up, and unlock rewards.',
      'system',
      'SYSTEM'
    );

    notifyListeners();
    return newProfile;
  }

  static updateProfile(partial: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    if (!current) throw new Error('No user logged in');
    
    const updated: UserProfile = {
      ...current,
      ...partial,
      rank: partial.xp !== undefined ? calculateRank(partial.xp) : (current.rank || 'BRONZE'),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    notifyListeners();
    return updated;
  }

  static logout() {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    notifyListeners();
  }

  // --- XP & COIN REWARDS SYSTEM ---

  static addXP(amount: number, reason: string, sourceType: XPTransaction['source_type'], sourceId?: string): { newXP: number; rankUp: boolean; newRank: string } {
    const profile = this.getUserProfile();
    if (!profile) return { newXP: 0, rankUp: false, newRank: 'BRONZE' };

    const previousRank = profile.rank;
    const newXP = profile.xp + amount;
    const newRank = calculateRank(newXP);
    const rankUp = newRank !== previousRank;

    // Record XP transaction
    const tx: XPTransaction = {
      id: 'xptx_' + Math.random().toString(36).substring(2, 9),
      user_id: profile.id,
      amount,
      reason,
      source_type: sourceType,
      source_id: sourceId,
      created_at: new Date().toISOString(),
    };
    const txs: XPTransaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.XP_TRANSACTIONS) || '[]');
    txs.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.XP_TRANSACTIONS, JSON.stringify(txs));

    this.updateProfile({ xp: newXP, rank: newRank });

    this.addNotification(
      `+${amount} XP Earned!`,
      reason,
      'xp_earned',
      'FITNESS'
    );

    if (rankUp) {
      this.addNotification(
        `RANK ASCENSION: ${newRank}!`,
        `Congratulations! You have ascended to ${newRank} rank.`,
        'rank_up',
        'ACHIEVEMENTS'
      );

      if (newRank === 'GOLD') {
        this.unlockAchievement('GOLDEN_STEP');
      } else if (newRank === 'DIAMOND') {
        this.unlockAchievement('DIAMOND_JOURNEY');
      }
    }

    return { newXP, rankUp, newRank };
  }

  static addCoins(amount: number, reason: string, sourceType: CoinTransaction['source_type'], sourceId?: string): number {
    const profile = this.getUserProfile();
    if (!profile || amount <= 0) return profile?.coins || 0;

    const newCoins = profile.coins + amount;

    const tx: CoinTransaction = {
      id: 'ctx_' + Math.random().toString(36).substring(2, 9),
      user_id: profile.id,
      amount,
      reason,
      type: 'EARN',
      source_type: sourceType,
      source_id: sourceId,
      created_at: new Date().toISOString(),
    };
    const txs: CoinTransaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COIN_TRANSACTIONS) || '[]');
    txs.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.COIN_TRANSACTIONS, JSON.stringify(txs));

    this.updateProfile({ coins: newCoins });

    this.addNotification(
      `+${amount} Coins Received!`,
      reason,
      'achievement_unlocked',
      'GAME'
    );

    return newCoins;
  }

  static spendCoins(amount: number, reason: string, sourceType: CoinTransaction['source_type'], sourceId?: string): boolean {
    const profile = this.getUserProfile();
    if (!profile || profile.coins < amount) return false;

    const newCoins = profile.coins - amount;

    const tx: CoinTransaction = {
      id: 'ctx_' + Math.random().toString(36).substring(2, 9),
      user_id: profile.id,
      amount: -amount,
      reason,
      type: 'SPEND',
      source_type: sourceType,
      source_id: sourceId,
      created_at: new Date().toISOString(),
    };
    const txs: CoinTransaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COIN_TRANSACTIONS) || '[]');
    txs.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.COIN_TRANSACTIONS, JSON.stringify(txs));

    this.updateProfile({ coins: newCoins });
    return true;
  }

  static getXPTransactions(): XPTransaction[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.XP_TRANSACTIONS) || '[]');
  }

  static getCoinTransactions(): CoinTransaction[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COIN_TRANSACTIONS) || '[]');
  }

  // --- GAME MODE ADVENTURE SYSTEM ---

  static getUserLevels(): UserLevel[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_LEVELS) || '[]');
  }

  static isLevelUnlocked(levelNumber: number): boolean {
    if (levelNumber === 1) return true;
    const userLevels = this.getUserLevels();
    const prevLevel = userLevels.find(ul => ul.level_id === levelNumber - 1 && ul.completed);
    return Boolean(prevLevel);
  }

  static completeGameLevel(levelId: number, stars: number = 3, score: number = 100): { success: boolean; level: GameLevel; xpAwarded: number; coinsAwarded: number } {
    const profile = this.getUserProfile();
    if (!profile) throw new Error('No user profile');

    const level = GAME_LEVELS.find(l => l.id === levelId);
    if (!level) throw new Error('Level not found');

    const userLevels = this.getUserLevels();
    const existing = userLevels.find(ul => ul.level_id === levelId);

    const isFirstTimeCompletion = !existing || !existing.completed;

    const userLevel: UserLevel = {
      id: existing ? existing.id : 'ul_' + Math.random().toString(36).substring(2, 9),
      user_id: profile.id,
      level_id: levelId,
      completed: true,
      score: Math.max(score, existing?.score || 0),
      stars: Math.max(stars, existing?.stars || 0),
      completed_at: new Date().toISOString(),
    };

    const updatedLevels = existing
      ? userLevels.map(ul => ul.level_id === levelId ? userLevel : ul)
      : [...userLevels, userLevel];

    localStorage.setItem(STORAGE_KEYS.USER_LEVELS, JSON.stringify(updatedLevels));

    let xpAwarded = 0;
    let coinsAwarded = 0;

    if (isFirstTimeCompletion) {
      xpAwarded = level.xp_reward;
      coinsAwarded = level.coin_reward;

      this.addXP(xpAwarded, `Game Level ${level.level_number} Completed: ${level.title}`, 'game_level', String(levelId));
      if (coinsAwarded > 0) {
        this.addCoins(coinsAwarded, `Level ${level.level_number} Reward`, level.is_special ? 'special_level' : 'daily_mission', String(levelId));
      }

      // Unlock next level by updating current_level if higher
      const nextLevelNumber = level.level_number + 1;
      if (nextLevelNumber > profile.current_level) {
        this.updateProfile({ current_level: nextLevelNumber });
        this.addNotification(
          `Level ${nextLevelNumber} Unlocked!`,
          `You've unlocked the next adventure map stage.`,
          'level_unlocked',
          'GAME'
        );
      }

      this.unlockAchievement('FIRST_LEVEL');

      // Update daily mission
      this.advanceDailyMission('game_level', 1);
    }

    notifyListeners();
    return { success: true, level, xpAwarded, coinsAwarded };
  }

  // --- WORKOUT SESSIONS SYSTEM ---

  static getWorkoutSessions(): WorkoutSession[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS) || '[]');
  }

  static saveWorkoutSession(sessionData: Omit<WorkoutSession, 'id' | 'user_id' | 'created_at'>): WorkoutSession {
    const profile = this.getUserProfile();
    if (!profile) throw new Error('No user profile');

    const session: WorkoutSession = {
      ...sessionData,
      id: 'ws_' + Math.random().toString(36).substring(2, 9),
      user_id: profile.id,
      created_at: new Date().toISOString(),
    };

    const sessions = this.getWorkoutSessions();
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(sessions));

    // Update streak
    this.incrementStreak();

    // Award XP and Coins
    if (session.xp_earned > 0) {
      this.addXP(session.xp_earned, `Completed Workout: ${session.exercise_name}`, 'workout', session.id);
    }
    if (session.coins_earned > 0) {
      this.addCoins(session.coins_earned, `Workout Completion Bonus`, 'daily_mission', session.id);
    }

    // Trigger achievements
    this.unlockAchievement('FIRST_MOVE');
    if (session.source === 'camera') {
      this.unlockAchievement('MOTION_STARTED');
      this.advanceChallenge('camera_workouts', 1);
      this.advanceDailyMission('camera_reps', session.total_reps);
    }

    // Check rep runner achievement
    const allReps = sessions.reduce((sum, s) => sum + s.total_reps, 0);
    if (allReps >= 250) {
      this.unlockAchievement('REP_RUNNER');
    }

    // Update Challenges
    this.advanceChallenge('workouts_count', 1);
    if (session.exercise_name.toLowerCase().includes('push-up') || session.exercise_name.toLowerCase().includes('pushup')) {
      this.advanceChallenge('reps_pushup', session.total_reps);
    }

    // Update Daily Mission
    this.advanceDailyMission('workout', 1);

    // Update Goals
    this.advanceGoals(session);

    notifyListeners();
    return session;
  }

  static incrementStreak() {
    const profile = this.getUserProfile();
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    if (profile.last_active_date === today) {
      // Already active today
      return;
    }

    const prevStreak = profile.streak;
    let newStreak = prevStreak + 1;

    // Check if missed more than 2 days
    if (profile.last_active_date) {
      const lastDate = new Date(profile.last_active_date);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays > 2) {
        // Soft reset after missed rest window
        newStreak = 1;
      }
    }

    this.updateProfile({ streak: newStreak, last_active_date: today });

    // Check streak milestone rewards
    const milestone = checkStreakMilestone(newStreak, prevStreak);
    if (milestone && milestone.reached) {
      this.addXP(milestone.xpReward, `${milestone.milestone}-Day Streak Milestone reached!`, 'streak');
      this.addCoins(Math.floor(milestone.xpReward / 2), `${milestone.milestone}-Day Streak Bonus`, 'achievement');
      this.addNotification(
        `🔥 ${milestone.milestone}-Day Streak Reached!`,
        `Amazing consistency! You've earned +${milestone.xpReward} XP.`,
        'streak_milestone',
        'ACHIEVEMENTS'
      );

      if (milestone.milestone >= 7) {
        this.unlockAchievement('ON_A_ROLL');
        this.advanceChallenge('streak_days', newStreak);
      }
    }
  }

  // --- CHALLENGES SYSTEM ---

  static getUserChallenges(): UserChallenge[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_CHALLENGES) || '[]');
  }

  static advanceChallenge(targetType: Challenge['target_type'], count: number) {
    const userChallenges = this.getUserChallenges();
    let updated = false;

    const newChallenges = userChallenges.map(uc => {
      if (uc.status === 'COMPLETED') return uc;
      const challenge = CHALLENGES.find(c => c.id === uc.challenge_id);
      if (!challenge || challenge.target_type !== targetType) return uc;

      const newProgress = uc.current_progress + count;
      const isComplete = newProgress >= challenge.target_count;

      if (isComplete) {
        // Complete challenge
        this.addXP(challenge.xp_reward, `Challenge Completed: ${challenge.title}`, 'challenge', challenge.id);
        this.addCoins(challenge.coin_reward, `Challenge Reward: ${challenge.title}`, 'challenge', challenge.id);
        this.addNotification(
          `🏆 Challenge Completed: ${challenge.title}!`,
          `You've earned +${challenge.xp_reward} XP and +${challenge.coin_reward} Coins.`,
          'challenge_completed',
          'CHALLENGES'
        );
        this.unlockAchievement('CHALLENGE_ACCEPTED');

        updated = true;
        return {
          ...uc,
          current_progress: challenge.target_count,
          status: 'COMPLETED' as const,
          completed_at: new Date().toISOString(),
        };
      }

      updated = true;
      return {
        ...uc,
        current_progress: Math.min(newProgress, challenge.target_count),
      };
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.USER_CHALLENGES, JSON.stringify(newChallenges));
      notifyListeners();
    }
  }

  // --- ACHIEVEMENTS SYSTEM ---

  static getUserAchievements(): UserAchievement[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_ACHIEVEMENTS) || '[]');
  }

  static unlockAchievement(code: string): boolean {
    const profile = this.getUserProfile();
    if (!profile) return false;

    const achievement = ACHIEVEMENTS.find(a => a.code === code);
    if (!achievement) return false;

    const userAchievements = this.getUserAchievements();
    const existing = userAchievements.find(ua => ua.achievement_id === achievement.id);
    if (existing) return false; // Already unlocked

    const newUA: UserAchievement = {
      id: 'ua_' + Math.random().toString(36).substring(2, 9),
      user_id: profile.id,
      achievement_id: achievement.id,
      unlocked_at: new Date().toISOString(),
    };

    userAchievements.push(newUA);
    localStorage.setItem(STORAGE_KEYS.USER_ACHIEVEMENTS, JSON.stringify(userAchievements));

    this.addXP(achievement.xp_reward, `Achievement Unlocked: ${achievement.title}`, 'achievement', achievement.id);
    this.addCoins(achievement.coin_reward, `Achievement Reward: ${achievement.title}`, 'achievement', achievement.id);

    this.addNotification(
      `🎖️ Achievement Unlocked: ${achievement.title}!`,
      achievement.description,
      'achievement_unlocked',
      'ACHIEVEMENTS'
    );

    notifyListeners();
    return true;
  }

  // --- DAILY MISSIONS & GOALS ---

  static getDailyMissions(): DailyMission[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_MISSIONS) || '[]');
  }

  static advanceDailyMission(targetType: DailyMission['target_type'], amount: number) {
    const missions = this.getDailyMissions();
    let updated = false;

    const newMissions = missions.map(m => {
      if (m.target_type === targetType && !m.completed) {
        const cur = (m.current_value || 0) + amount;
        const isComplete = cur >= m.target_value;
        if (isComplete && !m.completed) {
          this.addXP(m.xp_reward, `Daily Mission: ${m.title}`, 'daily_mission', m.id);
          this.addCoins(m.coin_reward, `Daily Mission Reward`, 'daily_mission', m.id);
          this.addNotification(
            `⚡ Mission Complete: ${m.title}`,
            `+${m.xp_reward} XP & +${m.coin_reward} Coins awarded!`,
            'daily_mission',
            'GOALS'
          );
        }
        updated = true;
        return { ...m, current_value: cur, completed: isComplete };
      }
      return m;
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.DAILY_MISSIONS, JSON.stringify(newMissions));
      notifyListeners();
    }
  }

  static getGoals(): Goal[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
  }

  static addGoal(title: string, targetValue: number, unit: string, frequency: Goal['frequency']): Goal {
    const profile = this.getUserProfile();
    if (!profile) throw new Error('No user profile');

    const newGoal: Goal = {
      id: 'g_' + Math.random().toString(36).substring(2, 9),
      user_id: profile.id,
      title,
      target_value: targetValue,
      current_value: 0,
      unit,
      frequency,
      completed: false,
      created_at: new Date().toISOString(),
    };

    const goals = this.getGoals();
    goals.push(newGoal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    notifyListeners();
    return newGoal;
  }

  static advanceGoals(session: WorkoutSession) {
    const goals = this.getGoals();
    const newGoals = goals.map(g => {
      let add = 0;
      if (g.unit === 'mins') {
        add = Math.round(session.duration_seconds / 60);
      } else if (g.unit === 'reps') {
        add = session.total_reps;
      }
      const cur = g.current_value + add;
      const isCompleted = cur >= g.target_value;
      if (isCompleted && !g.completed) {
        this.addXP(30, `Goal Achieved: ${g.title}`, 'daily_mission', g.id);
        this.addNotification(`🎯 Goal Achieved!`, `You completed "${g.title}"!`, 'goal_completed', 'GOALS');
      }
      return { ...g, current_value: cur, completed: isCompleted };
    });
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
  }

  // --- COSMETICS: BACKGROUNDS & AVATAR ---

  static getUnlockedBackgrounds(): string[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.UNLOCKED_BACKGROUNDS) || '["midnight"]');
  }

  static unlockBackground(backgroundId: string): boolean {
    const bg = BACKGROUND_THEMES.find(b => b.id === backgroundId);
    if (!bg) return false;

    const unlocked = this.getUnlockedBackgrounds();
    if (unlocked.includes(backgroundId)) return true;

    if (bg.price_coins > 0) {
      const spent = this.spendCoins(bg.price_coins, `Unlocked Background: ${bg.name}`, 'store_purchase', bg.id);
      if (!spent) return false;
    }

    unlocked.push(backgroundId);
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_BACKGROUNDS, JSON.stringify(unlocked));

    this.addNotification(
      `✨ New Theme Unlocked!`,
      `You unlocked the ${bg.name} background theme.`,
      'cosmetic_unlocked',
      'SYSTEM'
    );

    notifyListeners();
    return true;
  }

  static equipBackground(backgroundId: string) {
    const unlocked = this.getUnlockedBackgrounds();
    if (!unlocked.includes(backgroundId)) return;
    this.updateProfile({ equipped_background: backgroundId });
    this.addNotification(
      `Theme Equipped`,
      `Applied ${backgroundId} theme to FITRON.`,
      'cosmetic_equipped',
      'SYSTEM'
    );
  }

  static getUnlockedAvatarItems(): string[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.UNLOCKED_AVATAR_ITEMS) || '["face_1", "hair_1", "outfit_1", "acc_1", "pose_ready"]');
  }

  static unlockAvatarItem(itemId: string): boolean {
    const item = AVATAR_ITEMS.find(a => a.id === itemId);
    if (!item) return false;

    const unlocked = this.getUnlockedAvatarItems();
    if (unlocked.includes(itemId)) return true;

    if (item.price_coins > 0) {
      const spent = this.spendCoins(item.price_coins, `Unlocked ${item.name}`, 'store_purchase', item.id);
      if (!spent) return false;
    }

    unlocked.push(itemId);
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_AVATAR_ITEMS, JSON.stringify(unlocked));

    this.addNotification(
      `Cosmetic Unlocked!`,
      `You unlocked ${item.name} (${item.category}).`,
      'cosmetic_unlocked',
      'SYSTEM'
    );

    notifyListeners();
    return true;
  }

  static equipAvatar(equipped: EquippedAvatar) {
    this.updateProfile({ equipped_avatar: equipped });
    this.addNotification(
      `Avatar Updated`,
      `Your custom FITRON athlete avatar has been saved.`,
      'cosmetic_equipped',
      'SYSTEM'
    );
  }

  // --- SOCIAL & FRIENDS ---

  static getFriends(): FriendProfile[] {
    const custom: FriendProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIENDS) || '[]');
    return [...SEED_FRIENDS, ...custom];
  }

  static getFriendRequests(): FriendRequest[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS) || '[]');
  }

  static sendFriendRequest(fitronIdOrUsername: string): { success: boolean; message: string } {
    const profile = this.getUserProfile();
    if (!profile) return { success: false, message: 'Must be logged in' };

    const clean = fitronIdOrUsername.trim().toUpperCase();
    if (clean === profile.fitron_id || clean === profile.username.toUpperCase()) {
      return { success: false, message: 'You cannot add yourself as a friend.' };
    }

    const friends = this.getFriends();
    if (friends.some(f => f.fitron_id.toUpperCase() === clean || f.username.toUpperCase() === clean)) {
      return { success: false, message: 'You are already friends with this athlete.' };
    }

    // Create simulated athlete or match
    const newFriend: FriendProfile = {
      id: 'f_' + Math.random().toString(36).substring(2, 9),
      fitron_id: clean.startsWith('FTR-') ? clean : `FTR-${Math.floor(10000 + Math.random() * 90000)}`,
      username: clean.startsWith('FTR-') ? `Athlete_${clean.substring(4)}` : fitronIdOrUsername.trim(),
      full_name: 'Verified Athlete',
      rank: 'SILVER',
      xp: 750,
      streak: 4,
      equipped_avatar: { face: 'face_1', hair: 'hair_1', outfit: 'outfit_1', accessory: 'acc_1', pose: 'pose_ready' },
      online_status: 'online',
      last_activity: 'Active 10 mins ago'
    };

    const currentFriends: FriendProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIENDS) || '[]');
    currentFriends.push(newFriend);
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(currentFriends));

    this.unlockAchievement('FRIENDLY_RIVAL');

    this.addNotification(
      `Friend Connected!`,
      `You are now connected with ${newFriend.username} (${newFriend.fitron_id}).`,
      'friend_accepted',
      'FRIENDS'
    );

    notifyListeners();
    return { success: true, message: `Friend connected: ${newFriend.username}` };
  }

  static removeFriend(friendId: string) {
    const custom: FriendProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIENDS) || '[]');
    const filtered = custom.filter(f => f.id !== friendId);
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(filtered));
    notifyListeners();
  }

  static getLeaderboard(type: 'friends' | 'weekly' | 'global'): FriendProfile[] {
    const profile = this.getUserProfile();
    const userAsFriend: FriendProfile = profile ? {
      id: profile.id,
      fitron_id: profile.fitron_id,
      username: `${profile.username} (You)`,
      full_name: profile.full_name,
      rank: profile.rank,
      xp: profile.xp,
      streak: profile.streak,
      equipped_avatar: profile.equipped_avatar,
      online_status: 'online',
      last_activity: 'Active now'
    } : {
      id: 'self',
      fitron_id: 'FTR-00000',
      username: 'You',
      full_name: 'You',
      rank: 'BRONZE',
      xp: 0,
      streak: 0,
      equipped_avatar: { face: 'face_1', hair: 'hair_1', outfit: 'outfit_1', accessory: 'acc_1', pose: 'pose_ready' }
    };

    let list = [...this.getFriends(), userAsFriend];

    if (type === 'weekly') {
      // Sort by active weekly velocity
      return list.sort((a, b) => b.streak - a.streak || b.xp - a.xp);
    }
    
    // Global & Friends: Ranked strictly by verified XP and streak
    return list.sort((a, b) => b.xp - a.xp || b.streak - a.streak);
  }

  // --- NOTIFICATIONS HUB ---

  static getNotifications(): AppNotification[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  }

  static addNotification(title: string, message: string, type: NotificationType, category: NotificationFilter) {
    const profile = this.getUserProfile();
    const notif: AppNotification = {
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      user_id: profile?.id || 'anonymous',
      title,
      message,
      type,
      category,
      read: false,
      created_at: new Date().toISOString(),
    };

    const current: AppNotification[] = this.getNotifications();
    current.unshift(notif);
    // Keep max 50 recent notifications
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(current.slice(0, 50)));
    notifyListeners();
  }

  static markNotificationRead(id: string) {
    const current = this.getNotifications();
    const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    notifyListeners();
  }

  static markAllNotificationsRead() {
    const current = this.getNotifications();
    const updated = current.map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    notifyListeners();
  }

  static getNotificationPreferences(): NotificationPreferences {
    const profile = this.getUserProfile();
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFS);
    if (raw) return JSON.parse(raw);
    return {
      user_id: profile?.id || 'usr_default',
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
  }

  static updateNotificationPreferences(prefs: NotificationPreferences) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify(prefs));
    notifyListeners();
  }
}
