-- ========================================================
-- FITRON DATABASE SCHEMA (Supabase PostgreSQL)
-- Move. Track. Level Up.
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    fitron_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    equipped_avatar JSONB DEFAULT '{"face": "face_1", "hair": "hair_1", "outfit": "outfit_1", "accessory": "none", "pose": "pose_ready"}'::jsonb,
    equipped_background TEXT DEFAULT 'midnight',
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    coins INTEGER DEFAULT 0 CHECK (coins >= 0),
    rank TEXT DEFAULT 'BRONZE' CHECK (rank IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND')),
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    streak INTEGER DEFAULT 0 CHECK (streak >= 0),
    last_active_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTIVITIES & WORKOUT SESSIONS
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    total_sets INTEGER DEFAULT 1,
    total_reps INTEGER DEFAULT 0,
    source TEXT NOT NULL CHECK (source IN ('camera', 'manual')),
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    reps INTEGER DEFAULT 0,
    weight_kg NUMERIC DEFAULT 0,
    rest_seconds INTEGER DEFAULT 60,
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GAME LEVELS & PROGRESS
CREATE TABLE IF NOT EXISTS public.game_levels (
    id INTEGER PRIMARY KEY,
    level_number INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    exercise TEXT NOT NULL,
    target_reps INTEGER DEFAULT 5,
    target_duration_seconds INTEGER DEFAULT 0,
    is_special BOOLEAN DEFAULT false,
    difficulty TEXT DEFAULT 'BEGINNER' CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE')),
    xp_reward INTEGER DEFAULT 50,
    coin_reward INTEGER DEFAULT 10,
    unlock_requirement_level INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.user_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    level_id INTEGER NOT NULL REFERENCES public.game_levels(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT true,
    score INTEGER DEFAULT 100,
    stars INTEGER DEFAULT 3 CHECK (stars BETWEEN 1 AND 3),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, level_id)
);

-- 4. CHALLENGES
CREATE TABLE IF NOT EXISTS public.challenges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_count INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL,
    coin_reward INTEGER NOT NULL,
    duration_days INTEGER DEFAULT 7
);

CREATE TABLE IF NOT EXISTS public.user_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('NOT_STARTED', 'ACTIVE', 'COMPLETED')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE (user_id, challenge_id)
);

-- 5. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 50,
    coin_reward INTEGER DEFAULT 20
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, achievement_id)
);

-- 6. FRIENDS & SOCIAL
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (sender_id, receiver_id)
);

-- 7. GOALS & DAILY MISSIONS
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    unit TEXT NOT NULL,
    frequency TEXT DEFAULT 'DAILY' CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_missions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 30,
    coin_reward INTEGER DEFAULT 15
);

-- 8. TRANSACTIONS LEDGER (XP & COINS)
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('EARN', 'SPEND')),
    source_type TEXT NOT NULL,
    source_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS & PREFERENCES
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_requests BOOLEAN DEFAULT true,
    challenges BOOLEAN DEFAULT true,
    achievements BOOLEAN DEFAULT true,
    game_updates BOOLEAN DEFAULT true,
    workout_updates BOOLEAN DEFAULT true,
    goals BOOLEAN DEFAULT true,
    daily_missions BOOLEAN DEFAULT true,
    activity_reminders BOOLEAN DEFAULT true,
    weekly_summary BOOLEAN DEFAULT true,
    cosmetic_unlocks BOOLEAN DEFAULT true
);

-- 10. COSMETICS (AVATAR ITEMS & BACKGROUNDS)
CREATE TABLE IF NOT EXISTS public.avatar_items (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('face', 'hair', 'outfit', 'accessory', 'pose')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_coins INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'FREE' CHECK (rarity IN ('FREE', 'COMMON', 'RARE', 'PREMIUM', 'SPECIAL')),
    asset_id TEXT NOT NULL,
    is_starter BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.user_avatar_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES public.avatar_items(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.backgrounds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    css_class TEXT NOT NULL,
    price_coins INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'FREE' CHECK (rarity IN ('FREE', 'COMMON', 'RARE', 'PREMIUM', 'SPECIAL')),
    is_starter BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.user_backgrounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    background_id TEXT NOT NULL REFERENCES public.backgrounds(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, background_id)
);

-- 11. AI CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.game_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backgrounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public items readable by all users" ON public.game_levels FOR SELECT USING (true);
CREATE POLICY "Public challenges readable by all users" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Public achievements readable by all users" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Public daily missions readable by all users" ON public.daily_missions FOR SELECT USING (true);
CREATE POLICY "Public avatar items readable by all users" ON public.avatar_items FOR SELECT USING (true);
CREATE POLICY "Public backgrounds readable by all users" ON public.backgrounds FOR SELECT USING (true);

CREATE POLICY "Profiles are viewable by everyone for leaderboard" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can manage own workout sessions" ON public.workout_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own workout sets" ON public.workout_sets FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_sessions WHERE workout_sessions.id = workout_sets.session_id AND workout_sessions.user_id = auth.uid())
);
CREATE POLICY "Users can manage own levels" ON public.user_levels FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own challenges" ON public.user_challenges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own friends" ON public.friends FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can manage friend requests" ON public.friend_requests FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can manage own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own xp transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own coin transactions" ON public.coin_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own avatar items" ON public.user_avatar_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own backgrounds" ON public.user_backgrounds FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own AI messages" ON public.ai_messages FOR ALL USING (auth.uid() = user_id);

-- ========================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_fitron_id TEXT;
BEGIN
    new_fitron_id := 'FTR-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
    
    INSERT INTO public.profiles (id, fitron_id, username, full_name, xp, coins, rank, current_level, streak)
    VALUES (
        NEW.id,
        new_fitron_id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'Athlete_' || SUBSTRING(NEW.id::TEXT, 1, 6)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'FITRON Athlete'),
        0,
        0,
        'BRONZE',
        1,
        0
    );

    INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id);

    INSERT INTO public.user_backgrounds (user_id, background_id)
    SELECT NEW.id, id FROM public.backgrounds WHERE is_starter = true;

    INSERT INTO public.user_avatar_items (user_id, item_id)
    SELECT NEW.id, id FROM public.avatar_items WHERE is_starter = true;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed initial static records
INSERT INTO public.backgrounds (id, name, description, css_class, price_coins, rarity, is_starter) VALUES
('midnight', 'Midnight Crimson', 'Deep space dark crimson aesthetic with subtle starlight.', 'bg-theme-midnight', 0, 'FREE', true),
('forest', 'Obsidian Forest', 'Silhouetted mystical pines beneath a dark crimson twilight.', 'bg-theme-forest', 0, 'FREE', true),
('ocean', 'Abyssal Ocean', 'Subtle dark nautical tide currents in deep crimson indigo.', 'bg-theme-ocean', 0, 'FREE', true),
('aurora', 'Crimson Aurora', 'Ethereal ribbons of pastel crimson and obsidian night.', 'bg-theme-aurora', 0, 'FREE', true),
('sunset', 'Shadow Sunset', 'Dusk horizon glowing with subdued dark crimson warmth.', 'bg-theme-sunset', 0, 'FREE', true),
('dark_void', 'Dark Void', 'Pure minimalist high-contrast dark space with subtle energy grid.', 100, 'COMMON', false),
('galaxy', 'Nebula Nexus', 'Swirling cosmic dust and distant crimson stars.', 150, 'RARE', false),
('cyber', 'Cyber Matrix', 'Futuristic athletic grid lines and digital pulses.', 200, 'RARE', false),
('neon', 'Crimson Pulse', 'Rhythmic energetic glow lines for intense training sessions.', 250, 'PREMIUM', false),
('mountain', 'Alpine Shadow', 'Majestic peaks rising into a starry crimson sky.', 300, 'PREMIUM', false),
('rain', 'Obsidian Rain', 'Soothing vertical motion lines reminiscent of rain.', 350, 'SPECIAL', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.avatar_items (id, category, name, description, price_coins, rarity, asset_id, is_starter) VALUES
('face_1', 'face', 'Determined Focus', 'Standard athletic expression with focused eyes.', 0, 'FREE', 'face_focus', true),
('face_2', 'face', 'Fierce Champion', 'Intense energetic expression with battle focus.', 80, 'COMMON', 'face_fierce', false),
('face_3', 'face', 'Zen Master', 'Calm, collected composure ready for any challenge.', 120, 'RARE', 'face_zen', false),
('hair_1', 'hair', 'Classic Athletic Buzz', 'Clean modern short cut for high performance.', 0, 'FREE', 'hair_buzz', true),
('hair_2', 'hair', 'Dynamic Sweep', 'Flowing swept-back style with natural volume.', 0, 'FREE', 'hair_sweep', true),
('hair_3', 'hair', 'Neon Crest', 'Modern textured fade with crimson highlights.', 75, 'COMMON', 'hair_crest', false),
('hair_4', 'hair', 'Cyber Braids', 'Futuristic athletic braids with cyber ties.', 150, 'PREMIUM', 'hair_braids', false),
('outfit_1', 'outfit', 'FITRON Core Tech Suit', 'Standard aerodynamic compression athletic wear.', 0, 'FREE', 'outfit_core', true),
('outfit_2', 'outfit', 'Stealth Trainer Hoodie', 'Dark minimal sleeveless hoodie with crimson piping.', 0, 'FREE', 'outfit_stealth', true),
('outfit_3', 'outfit', 'Cyber Athletic Armor', 'Reinforced lightweight exoskeleton sports mesh.', 150, 'RARE', 'outfit_cyber', false),
('outfit_4', 'outfit', 'Apex Champion Robe', 'Elite gold & dark crimson master athletic garb.', 300, 'SPECIAL', 'outfit_apex', false),
('acc_1', 'accessory', 'None', 'Clean look with no accessories.', 0, 'FREE', 'acc_none', true),
('acc_2', 'accessory', 'Crimson Headband', 'Moisture-wicking athletic headband with FITRON crest.', 50, 'COMMON', 'acc_headband', false),
('acc_3', 'accessory', 'Cyber Visor', 'Futuristic HUD athletic visor displaying vital metrics.', 100, 'RARE', 'acc_visor', false),
('acc_4', 'accessory', 'Heavy Weighted Wristbands', 'Weighted training bands for elite athletes.', 120, 'RARE', 'acc_wristbands', false),
('pose_ready', 'pose', 'Ready Stance', 'Classic athletic stance ready to spring into action.', 0, 'FREE', 'pose_ready', true),
('pose_flex', 'pose', 'Power Flex', 'Confident athletic arm flexion celebrating victory.', 0, 'FREE', 'pose_flex', true),
('pose_zen', 'pose', 'Resting Guardian', 'Calm breathing posture between workout sets.', 0, 'FREE', 'pose_zen', true),
('pose_apex', 'pose', 'Apex Strike', 'Dynamic acrobatic victory pose in mid-jump.', 200, 'PREMIUM', 'pose_apex', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.game_levels (id, level_number, title, description, exercise, target_reps, target_duration_seconds, is_special, difficulty, xp_reward, coin_reward, unlock_requirement_level) VALUES
(1, 1, 'First Step', 'Build foundation strength against the wall.', 'Wall Push-Ups', 5, 0, false, 'BEGINNER', 50, 10, 0),
(2, 2, 'Lower Foundation', 'Establish knee and hip joint mobility.', 'Assisted Squats', 10, 0, false, 'BEGINNER', 50, 10, 1),
(3, 3, 'Incline Elevation', 'Increase push intensity with incline angle.', 'Incline Push-Ups', 5, 0, false, 'BEGINNER', 50, 15, 2),
(4, 4, 'Gravity Squats', 'Standard bodyweight squats with deep flexion.', 'Bodyweight Squats', 10, 0, false, 'BEGINNER', 50, 15, 3),
(5, 5, 'Knee Resistance', 'Knee push-ups with perfect upper body alignment.', 'Knee Push-Ups', 5, 0, false, 'BEGINNER', 60, 20, 4),
(6, 6, 'First Trial', 'Special endurance test: Combine push-ups and squats.', 'Standard Push-Ups', 8, 0, true, 'INTERMEDIATE', 100, 35, 5),
(7, 7, 'Core Awakening', 'Hold static horizontal plank with pelvic stability.', 'Plank', 0, 30, false, 'INTERMEDIATE', 60, 20, 6),
(8, 8, 'Dynamic Lunges', 'Step lunges testing balance and quad power.', 'Lunges', 10, 0, false, 'INTERMEDIATE', 65, 20, 7),
(9, 9, 'Cardio Burst', 'Rhythmic jumping jacks tracking arm & leg abduction.', 'Jumping Jacks', 20, 0, false, 'INTERMEDIATE', 70, 25, 8),
(10, 10, 'Midway Gate', 'Special test: Form test on knee push-ups and core.', 'Knee Push-Ups', 12, 0, true, 'INTERMEDIATE', 120, 40, 9),
(11, 11, 'Abdominal Force', 'Controlled sit-ups with spine curvature safety.', 'Sit-Ups', 12, 0, false, 'INTERMEDIATE', 75, 25, 10),
(12, 12, 'Calf Elevation', 'Controlled calf raises focusing on ankle plantarflexion.', 'Calf Raises', 15, 0, false, 'INTERMEDIATE', 75, 25, 11),
(13, 13, 'Standard Mastery', 'Clean form standard push-ups.', 'Standard Push-Ups', 10, 0, false, 'ADVANCED', 80, 30, 12),
(14, 14, 'Endurance Plank', 'Extended static plank hold.', 'Plank', 0, 45, false, 'ADVANCED', 85, 30, 13),
(15, 15, 'Inferno Gauntlet', 'Special level: 15 Bodyweight Squats under camera detection.', 'Bodyweight Squats', 15, 0, true, 'ADVANCED', 150, 50, 14),
(16, 16, 'Explosive Jacks', 'High tempo jumping jacks with full upper extension.', 'Jumping Jacks', 30, 0, false, 'ADVANCED', 90, 30, 15),
(17, 17, 'Core Fortitude', 'Extended sit-ups session with steady cadence.', 'Sit-Ups', 18, 0, false, 'ADVANCED', 95, 35, 16),
(18, 18, 'Iron Foundation', 'Deep squats holding pause at 90 degrees.', 'Bodyweight Squats', 20, 0, false, 'ADVANCED', 100, 35, 17),
(19, 19, 'Centurion Push', 'Unbroken standard push-ups with full lockout.', 'Standard Push-Ups', 15, 0, false, 'ADVANCED', 110, 40, 18),
(20, 20, 'Apex Titan Ascent', 'Ultimate Boss Level: 60s Plank + 20 Push-Ups Mastery.', 'Plank', 0, 60, true, 'ELITE', 250, 100, 19)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.challenges (id, title, description, target_type, target_count, xp_reward, coin_reward, duration_days) VALUES
('chal_7day_move', '7 Day Move', 'Stay active consistently for 7 days with at least 1 session daily.', 'streak_days', 7, 50, 25, 7),
('chal_pushup_path', 'Push-Up Path', 'Complete a total of 100 push-ups across workouts.', 'reps_pushup', 100, 50, 30, 14),
('chal_weekend_move', 'Weekend Move', 'Complete workout sessions on Saturday and Sunday.', 'weekend_days', 2, 50, 25, 3),
('chal_consistency_run', 'Consistency Run', 'Complete 10 total workout sessions with zero dropped weeks.', 'workouts_count', 10, 50, 40, 14),
('chal_camera_master', 'Motion Pioneer', 'Complete 5 full workouts verified by FITRON Motion camera.', 'camera_workouts', 5, 80, 45, 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.achievements (id, code, title, description, icon, category, xp_reward, coin_reward) VALUES
('ach_first_move', 'FIRST_MOVE', 'First Move', 'Complete your first physical activity session.', 'Footprints', 'MILESTONE', 30, 15),
('ach_first_level', 'FIRST_LEVEL', 'First Level', 'Complete your first Game Mode level.', 'Flag', 'GAME', 50, 20),
('ach_on_a_roll', 'ON_A_ROLL', 'On A Roll', 'Reach a 7-day workout streak.', 'Flame', 'STREAK', 50, 25),
('ach_challenge_acc', 'CHALLENGE_ACCEPTED', 'Challenge Accepted', 'Complete your first challenge.', 'Trophy', 'CHALLENGE', 50, 25),
('ach_golden_step', 'GOLDEN_STEP', 'Golden Step', 'Reach Gold Rank (1,000+ XP).', 'Award', 'RANK', 100, 50),
('ach_diamond_journey', 'DIAMOND_JOURNEY', 'Diamond Journey', 'Ascend to Diamond Rank (3,500+ XP).', 'Crown', 'RANK', 250, 100),
('ach_motion_started', 'MOTION_STARTED', 'Motion Started', 'Complete your first camera-tracked workout.', 'Camera', 'MOTION', 40, 20),
('ach_rep_runner', 'REP_RUNNER', 'Rep Runner', 'Accumulate 250 verified movement repetitions.', 'Zap', 'VOLUME', 75, 35),
('ach_friendly_rival', 'FRIENDLY_RIVAL', 'Friendly Rival', 'Connect with a friend on FITRON.', 'Users', 'SOCIAL', 40, 20)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.daily_missions (id, title, description, target_type, target_value, xp_reward, coin_reward) VALUES
('dm_activity_1', 'Daily Movement', 'Complete at least 1 workout activity today.', 'workout', 1, 30, 15),
('dm_camera_1', 'Motion Check', 'Track at least 10 reps using FITRON Motion camera.', 'camera_reps', 10, 40, 20),
('dm_game_1', 'Adventure Step', 'Clear or replay 1 Game Mode level.', 'game_level', 1, 30, 15)
ON CONFLICT (id) DO NOTHING;
