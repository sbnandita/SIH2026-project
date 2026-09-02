export type RankType = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface EquippedAvatar {
  face: string;
  hair: string;
  outfit: string;
  accessory: string;
  pose: string;
}

export interface UserProfile {
  id: string;
  fitron_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  equipped_avatar: EquippedAvatar;
  equipped_background: string;
  xp: number;
  coins: number;
  rank: RankType;
  current_level: number;
  streak: number;
  last_active_date?: string;
  created_at: string;
  updated_at?: string;
}

export type ExerciseId = 
  | 'wall_pushups'
  | 'assisted_squats'
  | 'incline_pushups'
  | 'bodyweight_squats'
  | 'knee_pushups'
  | 'standard_pushups'
  | 'plank'
  | 'lunges'
  | 'jumping_jacks'
  | 'situps'
  | 'calf_raises';

export interface ExerciseDefinition {
  id: ExerciseId;
  name: string;
  category: 'Upper' | 'Lower' | 'Core' | 'Cardio';
  cameraSupported: boolean;
  isTimeBased?: boolean;
  defaultReps: number;
  defaultSets: number;
  defaultRestSeconds: number;
  xpPerRep: number;
  description: string;
  cues: string[];
}

export interface WorkoutSet {
  id?: string;
  set_number: number;
  reps: number;
  weight_kg?: number;
  rest_seconds: number;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  title: string;
  exercise_name: string;
  duration_seconds: number;
  total_sets: number;
  total_reps: number;
  source: 'camera' | 'manual';
  xp_earned: number;
  coins_earned: number;
  created_at: string;
  sets?: WorkoutSet[];
}

export type LevelDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

export type LevelStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'SPECIAL';

export interface GameLevel {
  id: number;
  level_number: number;
  title: string;
  description: string;
  exercise: string;
  exercise_id: ExerciseId;
  target_reps: number;
  target_duration_seconds: number;
  is_special: boolean;
  difficulty: LevelDifficulty;
  xp_reward: number;
  coin_reward: number;
  unlock_requirement_level: number;
}

export interface UserLevel {
  id: string;
  user_id: string;
  level_id: number;
  completed: boolean;
  score: number;
  stars: number;
  completed_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target_type: 'streak_days' | 'reps_pushup' | 'weekend_days' | 'workouts_count' | 'camera_workouts';
  target_count: number;
  xp_reward: number;
  coin_reward: number;
  duration_days: number;
  icon?: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  status: 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED';
  started_at: string;
  completed_at?: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: 'MILESTONE' | 'GAME' | 'STREAK' | 'CHALLENGE' | 'RANK' | 'MOTION' | 'VOLUME' | 'SOCIAL';
  xp_reward: number;
  coin_reward: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  completed: boolean;
  created_at: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target_type: 'workout' | 'camera_reps' | 'game_level' | 'streak';
  target_value: number;
  current_value?: number;
  completed?: boolean;
  xp_reward: number;
  coin_reward: number;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  source_type: 'game_level' | 'workout' | 'challenge' | 'achievement' | 'streak' | 'daily_mission';
  source_id?: string;
  created_at: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  type: 'EARN' | 'SPEND';
  source_type: 'challenge' | 'achievement' | 'special_level' | 'daily_mission' | 'store_purchase';
  source_id?: string;
  created_at: string;
}

export type NotificationType = 
  | 'friend_request'
  | 'friend_accepted'
  | 'xp_earned'
  | 'rank_up'
  | 'level_completed'
  | 'level_unlocked'
  | 'challenge_started'
  | 'challenge_progress'
  | 'challenge_completed'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'workout_completed'
  | 'goal_completed'
  | 'daily_mission'
  | 'activity_reminder'
  | 'weekly_summary'
  | 'cosmetic_unlocked'
  | 'cosmetic_equipped'
  | 'system';

export type NotificationFilter = 
  | 'ALL'
  | 'FRIENDS'
  | 'FITNESS'
  | 'GAME'
  | 'CHALLENGES'
  | 'ACHIEVEMENTS'
  | 'GOALS'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationFilter;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  friend_requests: boolean;
  challenges: boolean;
  achievements: boolean;
  game_updates: boolean;
  workout_updates: boolean;
  goals: boolean;
  daily_missions: boolean;
  activity_reminders: boolean;
  weekly_summary: boolean;
  cosmetic_unlocks: boolean;
}

export interface FriendProfile {
  id: string;
  fitron_id: string;
  username: string;
  full_name: string;
  rank: RankType;
  xp: number;
  streak: number;
  equipped_avatar: EquippedAvatar;
  online_status?: 'online' | 'offline' | 'in_workout';
  last_activity?: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_profile?: FriendProfile;
  receiver_profile?: FriendProfile;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
}

export interface AvatarItem {
  id: string;
  category: 'face' | 'hair' | 'outfit' | 'accessory' | 'pose';
  name: string;
  description: string;
  price_coins: number;
  rarity: 'FREE' | 'COMMON' | 'RARE' | 'PREMIUM' | 'SPECIAL';
  asset_id: string;
  is_starter: boolean;
}

export interface BackgroundThemeItem {
  id: string;
  name: string;
  description: string;
  css_class: string;
  price_coins: number;
  rarity: 'FREE' | 'COMMON' | 'RARE' | 'PREMIUM' | 'SPECIAL';
  is_starter: boolean;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// MediaPipe & Motion Detection Types
export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type PushUpStage = 'READY' | 'DOWN' | 'UP' | 'COMPLETE';
export type SquatStage = 'STANDING' | 'BENDING' | 'BOTTOM' | 'ASCENDING' | 'COMPLETE';
export type JumpingJackStage = 'FEET_TOGETHER' | 'FEET_APART' | 'ARMS_HIGH' | 'COMPLETE';

export interface MotionMetrics {
  currentReps: number;
  targetReps: number;
  currentSet: number;
  totalSets: number;
  stateText: string;
  formFeedback: string;
  formConfidence: number; // 0 to 100
  isCalibrated: boolean;
  currentAngle: number;
  primaryMetricPercent: number;
}
