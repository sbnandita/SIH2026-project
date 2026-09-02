import { 
  BackgroundThemeItem, 
  AvatarItem, 
  GameLevel, 
  Challenge, 
  Achievement, 
  DailyMission, 
  ExerciseDefinition,
  ExerciseId
} from '../types';

export const BACKGROUND_THEMES: BackgroundThemeItem[] = [
  { id: 'midnight', name: 'Midnight Crimson', description: 'Deep space dark crimson aesthetic with subtle starlight.', css_class: 'bg-theme-midnight', price_coins: 0, rarity: 'FREE', is_starter: true },
  { id: 'forest', name: 'Obsidian Forest', description: 'Silhouetted mystical pines beneath a dark crimson twilight.', css_class: 'bg-theme-forest', price_coins: 0, rarity: 'FREE', is_starter: true },
  { id: 'ocean', name: 'Abyssal Ocean', description: 'Subtle dark nautical tide currents in deep crimson indigo.', css_class: 'bg-theme-ocean', price_coins: 0, rarity: 'FREE', is_starter: true },
  { id: 'aurora', name: 'Crimson Aurora', description: 'Ethereal ribbons of pastel crimson and obsidian night.', css_class: 'bg-theme-aurora', price_coins: 0, rarity: 'FREE', is_starter: true },
  { id: 'sunset', name: 'Shadow Sunset', description: 'Dusk horizon glowing with subdued dark crimson warmth.', css_class: 'bg-theme-sunset', price_coins: 0, rarity: 'FREE', is_starter: true },
  { id: 'dark_void', name: 'Dark Void', description: 'Pure minimalist high-contrast dark space with subtle energy grid.', css_class: 'bg-theme-dark_void', price_coins: 100, rarity: 'COMMON', is_starter: false },
  { id: 'galaxy', name: 'Nebula Nexus', description: 'Swirling cosmic dust and distant crimson stars.', css_class: 'bg-theme-galaxy', price_coins: 150, rarity: 'RARE', is_starter: false },
  { id: 'cyber', name: 'Cyber Matrix', description: 'Futuristic athletic grid lines and digital pulses.', css_class: 'bg-theme-cyber', price_coins: 200, rarity: 'RARE', is_starter: false },
  { id: 'neon', name: 'Crimson Pulse', description: 'Rhythmic energetic glow lines for intense training sessions.', css_class: 'bg-theme-neon', price_coins: 250, rarity: 'PREMIUM', is_starter: false },
  { id: 'mountain', name: 'Alpine Shadow', description: 'Majestic peaks rising into a starry crimson sky.', css_class: 'bg-theme-mountain', price_coins: 300, rarity: 'PREMIUM', is_starter: false },
  { id: 'rain', name: 'Obsidian Rain', description: 'Soothing vertical motion lines reminiscent of rain.', css_class: 'bg-theme-rain', price_coins: 350, rarity: 'SPECIAL', is_starter: false },
];

export const AVATAR_ITEMS: AvatarItem[] = [
  // Faces
  { id: 'face_1', category: 'face', name: 'Determined Focus', description: 'Standard athletic expression with focused eyes.', price_coins: 0, rarity: 'FREE', asset_id: 'face_focus', is_starter: true },
  { id: 'face_2', category: 'face', name: 'Fierce Champion', description: 'Intense energetic expression with battle focus.', price_coins: 80, rarity: 'COMMON', asset_id: 'face_fierce', is_starter: false },
  { id: 'face_3', category: 'face', name: 'Zen Master', description: 'Calm, collected composure ready for any challenge.', price_coins: 120, rarity: 'RARE', asset_id: 'face_zen', is_starter: false },
  
  // Hairstyles
  { id: 'hair_1', category: 'hair', name: 'Athletic Buzz', description: 'Clean modern short cut for high performance.', price_coins: 0, rarity: 'FREE', asset_id: 'hair_buzz', is_starter: true },
  { id: 'hair_2', category: 'hair', name: 'Dynamic Sweep', description: 'Flowing swept-back style with natural volume.', price_coins: 0, rarity: 'FREE', asset_id: 'hair_sweep', is_starter: true },
  { id: 'hair_3', category: 'hair', name: 'Neon Crest', description: 'Modern textured fade with crimson highlights.', price_coins: 75, rarity: 'COMMON', asset_id: 'hair_crest', is_starter: false },
  { id: 'hair_4', category: 'hair', name: 'Cyber Braids', description: 'Futuristic athletic braids with cyber ties.', price_coins: 150, rarity: 'PREMIUM', asset_id: 'hair_braids', is_starter: false },

  // Outfits
  { id: 'outfit_1', category: 'outfit', name: 'FITRON Core Suit', description: 'Standard aerodynamic compression athletic wear.', price_coins: 0, rarity: 'FREE', asset_id: 'outfit_core', is_starter: true },
  { id: 'outfit_2', category: 'outfit', name: 'Stealth Hoodie', description: 'Dark minimal sleeveless hoodie with crimson piping.', price_coins: 0, rarity: 'FREE', asset_id: 'outfit_stealth', is_starter: true },
  { id: 'outfit_3', category: 'outfit', name: 'Cyber Athletic Armor', description: 'Reinforced lightweight exoskeleton sports mesh.', price_coins: 150, rarity: 'RARE', asset_id: 'outfit_cyber', is_starter: false },
  { id: 'outfit_4', category: 'outfit', name: 'Apex Champion Robe', description: 'Elite gold & dark crimson master athletic garb.', price_coins: 300, rarity: 'SPECIAL', asset_id: 'outfit_apex', is_starter: false },

  // Accessories
  { id: 'acc_1', category: 'accessory', name: 'None', description: 'Clean look with no accessories.', price_coins: 0, rarity: 'FREE', asset_id: 'acc_none', is_starter: true },
  { id: 'acc_2', category: 'accessory', name: 'Crimson Headband', description: 'Moisture-wicking athletic headband with FITRON crest.', price_coins: 50, rarity: 'COMMON', asset_id: 'acc_headband', is_starter: false },
  { id: 'acc_3', category: 'accessory', name: 'Cyber Visor', description: 'Futuristic HUD athletic visor displaying vital metrics.', price_coins: 100, rarity: 'RARE', asset_id: 'acc_visor', is_starter: false },
  { id: 'acc_4', category: 'accessory', name: 'Weighted Wristbands', description: 'Weighted training bands for elite athletes.', price_coins: 120, rarity: 'RARE', asset_id: 'acc_wristbands', is_starter: false },

  // Poses
  { id: 'pose_ready', category: 'pose', name: 'Ready Stance', description: 'Classic athletic stance ready to spring into action.', price_coins: 0, rarity: 'FREE', asset_id: 'pose_ready', is_starter: true },
  { id: 'pose_flex', category: 'pose', name: 'Power Flex', description: 'Confident athletic arm flexion celebrating victory.', price_coins: 0, rarity: 'FREE', asset_id: 'pose_flex', is_starter: true },
  { id: 'pose_zen', category: 'pose', name: 'Resting Guardian', description: 'Calm breathing posture between workout sets.', price_coins: 0, rarity: 'FREE', asset_id: 'pose_zen', is_starter: true },
  { id: 'pose_apex', category: 'pose', name: 'Apex Strike', description: 'Dynamic acrobatic victory pose in mid-jump.', price_coins: 200, rarity: 'PREMIUM', asset_id: 'pose_apex', is_starter: false },
];

export const EXERCISE_LIBRARY: Record<ExerciseId, ExerciseDefinition> = {
  wall_pushups: {
    id: 'wall_pushups',
    name: 'Wall Push-Ups',
    category: 'Upper',
    cameraSupported: true,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 45,
    xpPerRep: 3,
    description: 'Beginner upper body push variation performed standing angled against a sturdy wall.',
    cues: ['Keep body straight in a plank line', 'Bend elbows to 90 degrees', 'Push through palms to full extension']
  },
  assisted_squats: {
    id: 'assisted_squats',
    name: 'Assisted Squats',
    category: 'Lower',
    cameraSupported: true,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 45,
    xpPerRep: 3,
    description: 'Squat movement with light hand support on a chair or doorframe to build quad and glute strength.',
    cues: ['Feet shoulder-width apart', 'Hips back and down', 'Keep chest up and knees tracking over toes']
  },
  incline_pushups: {
    id: 'incline_pushups',
    name: 'Incline Push-Ups',
    category: 'Upper',
    cameraSupported: true,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 60,
    xpPerRep: 4,
    description: 'Elevated push-up on a bench or sturdy table, bridging the gap between wall and floor push-ups.',
    cues: ['Straight spinal line', 'Elbows at 45 degree angle from torso', 'Full chest descent towards surface']
  },
  bodyweight_squats: {
    id: 'bodyweight_squats',
    name: 'Bodyweight Squats',
    category: 'Lower',
    cameraSupported: true,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60,
    xpPerRep: 4,
    description: 'Standard free-standing squats activating quads, hamstrings, and glutes.',
    cues: ['Weight balanced on mid-foot and heel', 'Thighs parallel to ground', 'Drive hips upward to standing']
  },
  knee_pushups: {
    id: 'knee_pushups',
    name: 'Knee Push-Ups',
    category: 'Upper',
    cameraSupported: true,
    defaultReps: 8,
    defaultSets: 3,
    defaultRestSeconds: 60,
    xpPerRep: 4,
    description: 'Floor push-up pivoting from the knees, developing core and chest pressing power.',
    cues: ['Straight line from head to knees', 'Core engaged to avoid sagging hips', 'Full lockout at the top']
  },
  standard_pushups: {
    id: 'standard_pushups',
    name: 'Standard Push-Ups',
    category: 'Upper',
    cameraSupported: true,
    defaultReps: 10,
    defaultSets: 3,
    defaultRestSeconds: 60,
    xpPerRep: 5,
    description: 'Full plank push-ups with complete range of motion from floor to arm extension.',
    cues: ['Hands slightly wider than shoulder width', 'Elbows tucked 45 degrees', 'Lower until chest is inches from floor']
  },
  plank: {
    id: 'plank',
    name: 'Plank Hold',
    category: 'Core',
    cameraSupported: true,
    isTimeBased: true,
    defaultReps: 30, // seconds
    defaultSets: 3,
    defaultRestSeconds: 60,
    xpPerRep: 2, // per 2 seconds
    description: 'Isometric core stability hold engaging entire anterior kinetic chain.',
    cues: ['Elbows under shoulders', 'Glutes squeezed tight', 'Neutral neck looking slightly ahead']
  },
  lunges: {
    id: 'lunges',
    name: 'Alternating Lunges',
    category: 'Lower',
    cameraSupported: true,
    defaultReps: 12,
    defaultSets: 3,
    defaultRestSeconds: 60,
    xpPerRep: 4,
    description: 'Unilateral leg exercise developing single-leg balance, quad strength, and hip flexibility.',
    cues: ['Step forward into 90 degree knee bends', 'Torso upright', 'Push back forcefully through front heel']
  },
  jumping_jacks: {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    category: 'Cardio',
    cameraSupported: true,
    defaultReps: 25,
    defaultSets: 3,
    defaultRestSeconds: 45,
    xpPerRep: 2,
    description: 'Full body cardiovascular drill with synchronized arm raises and leg abductions.',
    cues: ['Land softly on balls of feet', 'Touch hands overhead', 'Maintain steady breathing rhythm']
  },
  situps: {
    id: 'situps',
    name: 'Sit-Ups',
    category: 'Core',
    cameraSupported: true,
    defaultReps: 15,
    defaultSets: 3,
    defaultRestSeconds: 45,
    xpPerRep: 3,
    description: 'Abdominal flexion movement lifting upper torso from supine to upright.',
    cues: ['Knees bent at 90 degrees', 'Engage abs to initiate lift', 'Avoid pulling on back of neck']
  },
  calf_raises: {
    id: 'calf_raises',
    name: 'Calf Raises',
    category: 'Lower',
    cameraSupported: true,
    defaultReps: 20,
    defaultSets: 3,
    defaultRestSeconds: 30,
    xpPerRep: 2,
    description: 'Controlled plantarflexion raising heels off the ground for calf strength and ankle stability.',
    cues: ['Press evenly through balls of feet', 'Pause at peak contraction', 'Slow 2-second eccentric lowering']
  }
};

export const GAME_LEVELS: GameLevel[] = [
  { id: 1, level_number: 1, title: 'First Step', description: 'Build foundation strength against the wall.', exercise: 'Wall Push-Ups', exercise_id: 'wall_pushups', target_reps: 5, target_duration_seconds: 0, is_special: false, difficulty: 'BEGINNER', xp_reward: 50, coin_reward: 10, unlock_requirement_level: 0 },
  { id: 2, level_number: 2, title: 'Lower Foundation', description: 'Establish knee and hip joint mobility.', exercise: 'Assisted Squats', exercise_id: 'assisted_squats', target_reps: 10, target_duration_seconds: 0, is_special: false, difficulty: 'BEGINNER', xp_reward: 50, coin_reward: 10, unlock_requirement_level: 1 },
  { id: 3, level_number: 3, title: 'Incline Elevation', description: 'Increase push intensity with incline angle.', exercise: 'Incline Push-Ups', exercise_id: 'incline_pushups', target_reps: 5, target_duration_seconds: 0, is_special: false, difficulty: 'BEGINNER', xp_reward: 50, coin_reward: 15, unlock_requirement_level: 2 },
  { id: 4, level_number: 4, title: 'Gravity Squats', description: 'Standard bodyweight squats with deep flexion.', exercise: 'Bodyweight Squats', exercise_id: 'bodyweight_squats', target_reps: 10, target_duration_seconds: 0, is_special: false, difficulty: 'BEGINNER', xp_reward: 50, coin_reward: 15, unlock_requirement_level: 3 },
  { id: 5, level_number: 5, title: 'Knee Resistance', description: 'Knee push-ups with perfect upper body alignment.', exercise: 'Knee Push-Ups', exercise_id: 'knee_pushups', target_reps: 5, target_duration_seconds: 0, is_special: false, difficulty: 'BEGINNER', xp_reward: 60, coin_reward: 20, unlock_requirement_level: 4 },
  { id: 6, level_number: 6, title: 'First Trial', description: 'Special endurance test: Push past your limits with standard push-ups.', exercise: 'Standard Push-Ups', exercise_id: 'standard_pushups', target_reps: 8, target_duration_seconds: 0, is_special: true, difficulty: 'INTERMEDIATE', xp_reward: 100, coin_reward: 35, unlock_requirement_level: 5 },
  { id: 7, level_number: 7, title: 'Core Awakening', description: 'Hold static horizontal plank with pelvic stability.', exercise: 'Plank Hold', exercise_id: 'plank', target_reps: 0, target_duration_seconds: 30, is_special: false, difficulty: 'INTERMEDIATE', xp_reward: 60, coin_reward: 20, unlock_requirement_level: 6 },
  { id: 8, level_number: 8, title: 'Dynamic Lunges', description: 'Step lunges testing balance and quad power.', exercise: 'Alternating Lunges', exercise_id: 'lunges', target_reps: 10, target_duration_seconds: 0, is_special: false, difficulty: 'INTERMEDIATE', xp_reward: 65, coin_reward: 20, unlock_requirement_level: 7 },
  { id: 9, level_number: 9, title: 'Cardio Burst', description: 'Rhythmic jumping jacks tracking arm & leg abduction.', exercise: 'Jumping Jacks', exercise_id: 'jumping_jacks', target_reps: 20, target_duration_seconds: 0, is_special: false, difficulty: 'INTERMEDIATE', xp_reward: 70, coin_reward: 25, unlock_requirement_level: 8 },
  { id: 10, level_number: 10, title: 'Midway Gate', description: 'Special milestone: Knee push-ups volume trial.', exercise: 'Knee Push-Ups', exercise_id: 'knee_pushups', target_reps: 12, target_duration_seconds: 0, is_special: true, difficulty: 'INTERMEDIATE', xp_reward: 120, coin_reward: 40, unlock_requirement_level: 9 },
  { id: 11, level_number: 11, title: 'Abdominal Force', description: 'Controlled sit-ups with spine curvature safety.', exercise: 'Sit-Ups', exercise_id: 'situps', target_reps: 12, target_duration_seconds: 0, is_special: false, difficulty: 'INTERMEDIATE', xp_reward: 75, coin_reward: 25, unlock_requirement_level: 10 },
  { id: 12, level_number: 12, title: 'Calf Elevation', description: 'Controlled calf raises focusing on ankle plantarflexion.', exercise: 'Calf Raises', exercise_id: 'calf_raises', target_reps: 15, target_duration_seconds: 0, is_special: false, difficulty: 'INTERMEDIATE', xp_reward: 75, coin_reward: 25, unlock_requirement_level: 11 },
  { id: 13, level_number: 13, title: 'Standard Mastery', description: 'Clean form standard push-ups.', exercise: 'Standard Push-Ups', exercise_id: 'standard_pushups', target_reps: 10, target_duration_seconds: 0, is_special: false, difficulty: 'ADVANCED', xp_reward: 80, coin_reward: 30, unlock_requirement_level: 12 },
  { id: 14, level_number: 14, title: 'Endurance Plank', description: 'Extended static plank hold.', exercise: 'Plank Hold', exercise_id: 'plank', target_reps: 0, target_duration_seconds: 45, is_special: false, difficulty: 'ADVANCED', xp_reward: 85, coin_reward: 30, unlock_requirement_level: 13 },
  { id: 15, level_number: 15, title: 'Inferno Gauntlet', description: 'Special Level: 15 Bodyweight Squats under camera detection.', exercise: 'Bodyweight Squats', exercise_id: 'bodyweight_squats', target_reps: 15, target_duration_seconds: 0, is_special: true, difficulty: 'ADVANCED', xp_reward: 150, coin_reward: 50, unlock_requirement_level: 14 },
  { id: 16, level_number: 16, title: 'Explosive Jacks', description: 'High tempo jumping jacks with full upper extension.', exercise: 'Jumping Jacks', exercise_id: 'jumping_jacks', target_reps: 30, target_duration_seconds: 0, is_special: false, difficulty: 'ADVANCED', xp_reward: 90, coin_reward: 30, unlock_requirement_level: 15 },
  { id: 17, level_number: 17, title: 'Core Fortitude', description: 'Extended sit-ups session with steady cadence.', exercise: 'Sit-Ups', exercise_id: 'situps', target_reps: 18, target_duration_seconds: 0, is_special: false, difficulty: 'ADVANCED', xp_reward: 95, coin_reward: 35, unlock_requirement_level: 16 },
  { id: 18, level_number: 18, title: 'Iron Foundation', description: 'Deep squats holding pause at 90 degrees.', exercise: 'Bodyweight Squats', exercise_id: 'bodyweight_squats', target_reps: 20, target_duration_seconds: 0, is_special: false, difficulty: 'ADVANCED', xp_reward: 100, coin_reward: 35, unlock_requirement_level: 17 },
  { id: 19, level_number: 19, title: 'Centurion Push', description: 'Unbroken standard push-ups with full lockout.', exercise: 'Standard Push-Ups', exercise_id: 'standard_pushups', target_reps: 15, target_duration_seconds: 0, is_special: false, difficulty: 'ADVANCED', xp_reward: 110, coin_reward: 40, unlock_requirement_level: 18 },
  { id: 20, level_number: 20, title: 'Apex Titan Ascent', description: 'Ultimate Boss Level: 60s Plank Hold with camera form verification.', exercise: 'Plank Hold', exercise_id: 'plank', target_reps: 0, target_duration_seconds: 60, is_special: true, difficulty: 'ELITE', xp_reward: 250, coin_reward: 100, unlock_requirement_level: 19 }
];

export const CHALLENGES: Challenge[] = [
  { id: 'chal_7day_move', title: '7 Day Move', description: 'Stay active consistently for 7 days with at least 1 session daily.', target_type: 'streak_days', target_count: 7, xp_reward: 50, coin_reward: 25, duration_days: 7, icon: 'Flame' },
  { id: 'chal_pushup_path', title: 'Push-Up Path', description: 'Complete a cumulative total of 100 push-ups across workouts.', target_type: 'reps_pushup', target_count: 100, xp_reward: 50, coin_reward: 30, duration_days: 14, icon: 'Zap' },
  { id: 'chal_weekend_move', title: 'Weekend Move', description: 'Complete workout sessions on Saturday and Sunday.', target_type: 'weekend_days', target_count: 2, xp_reward: 50, coin_reward: 25, duration_days: 3, icon: 'Calendar' },
  { id: 'chal_consistency_run', title: 'Consistency Run', description: 'Complete 10 total workout sessions with regular frequency.', target_type: 'workouts_count', target_count: 10, xp_reward: 50, coin_reward: 40, duration_days: 14, icon: 'Activity' },
  { id: 'chal_camera_master', title: 'Motion Pioneer', description: 'Complete 5 full workouts verified by FITRON Motion camera.', target_type: 'camera_workouts', target_count: 5, xp_reward: 80, coin_reward: 45, duration_days: 10, icon: 'Camera' }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_first_move', code: 'FIRST_MOVE', title: 'First Move', description: 'Complete your first physical activity session.', icon: 'Footprints', category: 'MILESTONE', xp_reward: 30, coin_reward: 15 },
  { id: 'ach_first_level', code: 'FIRST_LEVEL', title: 'First Level', description: 'Complete your first Game Mode level.', icon: 'Flag', category: 'GAME', xp_reward: 50, coin_reward: 20 },
  { id: 'ach_on_a_roll', code: 'ON_A_ROLL', title: 'On A Roll', description: 'Reach a 7-day workout streak.', icon: 'Flame', category: 'STREAK', xp_reward: 50, coin_reward: 25 },
  { id: 'ach_challenge_acc', code: 'CHALLENGE_ACCEPTED', title: 'Challenge Accepted', description: 'Complete your first challenge.', icon: 'Trophy', category: 'CHALLENGE', xp_reward: 50, coin_reward: 25 },
  { id: 'ach_golden_step', code: 'GOLDEN_STEP', title: 'Golden Step', description: 'Reach Gold Rank (1,000+ XP).', icon: 'Award', category: 'RANK', xp_reward: 100, coin_reward: 50 },
  { id: 'ach_diamond_journey', code: 'DIAMOND_JOURNEY', title: 'Diamond Journey', description: 'Ascend to Diamond Rank (3,500+ XP).', icon: 'Crown', category: 'RANK', xp_reward: 250, coin_reward: 100 },
  { id: 'ach_motion_started', code: 'MOTION_STARTED', title: 'Motion Started', description: 'Complete your first camera-tracked workout.', icon: 'Camera', category: 'MOTION', xp_reward: 40, coin_reward: 20 },
  { id: 'ach_rep_runner', code: 'REP_RUNNER', title: 'Rep Runner', description: 'Accumulate 250 verified movement repetitions.', icon: 'Zap', category: 'VOLUME', xp_reward: 75, coin_reward: 35 },
  { id: 'ach_friendly_rival', code: 'FRIENDLY_RIVAL', title: 'Friendly Rival', description: 'Connect with a friend on FITRON.', icon: 'Users', category: 'SOCIAL', xp_reward: 40, coin_reward: 20 }
];

export const INITIAL_DAILY_MISSIONS: DailyMission[] = [
  { id: 'dm_activity_1', title: 'Daily Movement', description: 'Complete at least 1 workout session today.', target_type: 'workout', target_value: 1, current_value: 0, completed: false, xp_reward: 30, coin_reward: 15 },
  { id: 'dm_camera_1', title: 'Motion Check', description: 'Track at least 10 reps using FITRON Motion camera.', target_type: 'camera_reps', target_value: 10, current_value: 0, completed: false, xp_reward: 40, coin_reward: 20 },
  { id: 'dm_game_1', title: 'Adventure Step', description: 'Complete or replay 1 Game Mode level.', target_type: 'game_level', target_value: 1, current_value: 0, completed: false, xp_reward: 30, coin_reward: 15 }
];
