import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, AIMessage } from '../../types';
import { FitronDB } from '../../lib/db';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Trash2, 
  ShieldCheck, 
  Zap, 
  Dumbbell, 
  Target, 
  HelpCircle,
  Flame,
  Award,
  RefreshCw
} from 'lucide-react';

interface FitronAIPageProps {
  userProfile: UserProfile;
}

export const FitronAIPage: React.FC<FitronAIPageProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Greetings athlete **${userProfile.full_name}**! I am **FITRON AI**, your personalized fitness and game progression advisor.

You are currently **${userProfile.rank}** rank with **${userProfile.xp} XP** and a **${userProfile.streak}-day streak**. How can I assist your movement journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    "Create a beginner workout routine",
    "How does Game Mode adventure map work?",
    "Tips to increase my push-up count",
    "Explain proper plank form & alignment",
    "How do I earn more Coins for cosmetics?",
    "What should I do today for my streak?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Context-aware intelligent response generator
  const generateAIResponse = async (userQuery: string): Promise<string> => {
    const query = userQuery.toLowerCase();
    const workouts = FitronDB.getWorkoutSessions();
    const challenges = FitronDB.getUserChallenges();
    const levels = FitronDB.getUserLevels();
    const goals = FitronDB.getGoals();

    // Check for unsafe medical requests
    if (query.includes('injur') || query.includes('pain') || query.includes('sprain') || query.includes('diagnos') || query.includes('torn') || query.includes('bone')) {
      return `⚠️ **Health & Safety Notice**: I cannot provide medical diagnoses or advice for physical injuries. If you are experiencing pain, discomfort, or injury, please stop physical exercise immediately and consult a qualified medical professional or physiotherapist. Listen to your body and prioritize rest and recovery!`;
    }

    if (query.includes('diet') || query.includes('starve') || query.includes('lose weight fast') || query.includes('skinny') || query.includes('fat')) {
      return `FITRON focuses entirely on sustainable movement, athletic consistency, and gamified progress rather than restrictive diets or body aesthetics. Make sure you are nourishing your body with balanced meals, drinking plenty of water, and getting 7-9 hours of restorative sleep to power your workouts!`;
    }

    // 1. Beginner workout request
    if (query.includes('beginner') || query.includes('routine') || query.includes('create') && query.includes('workout')) {
      return `Here is a personalized 15-minute beginner workout crafted for your current **${userProfile.rank}** level:

1. **Warm-up**: 2 minutes light arm circles & torso twists.
2. **Wall Push-Ups** (or Incline): 3 sets × 8–10 reps (Rest 45s).
3. **Assisted / Bodyweight Squats**: 3 sets × 10 reps (Rest 45s).
4. **Plank Hold**: 3 sets × 20 seconds (Rest 60s).
5. **Cool-down**: Gentle quad and chest stretches.

💡 *Tip*: You can launch **FITRON Motion** in Fitness Mode to have the camera verify your form in real time!`;
    }

    // 2. Game Mode explanations
    if (query.includes('game') || query.includes('adventure') || query.includes('level') || query.includes('map')) {
      const completedCount = levels.filter(l => l.completed).length;
      return `**FITRON Game Mode** is an adventure level map with 20 progressive fitness stages!

- **Your Current Stage**: Stage ${userProfile.current_level}
- **Cleared Stages**: ${completedCount} / 20
- **Mechanics**: Each node has specific movement targets (e.g. 5 Wall Push-Ups, 10 Squats, or 30s Planks).
- **Rewards**: Completing a stage awards **+50 to +250 XP** and bonus **Coins** to unlock custom themes & avatar gear in the Store.

Head to the **Game Mode** tab to launch your next available stage!`;
    }

    // 3. Push-up guidance & form
    if (query.includes('push-up') || query.includes('pushup') || query.includes('form')) {
      return `To build high-volume push-up power and maintain clean form:

1. **Straight Plank Line**: Keep your shoulders, hips, and ankles in a straight kinetic corridor. Avoid sagging hips or piked pelvis.
2. **45-Degree Elbow Angle**: Avoid flaring your elbows 90 degrees wide; tuck them to approximately 45 degrees from your ribs.
3. **Full Lockout**: Descend until your chest is approximately 2–3 inches from the surface, then press through the base of your palms until arms are straight.
4. **Progression Path**: Master Wall Push-Ups → Incline Push-Ups → Knee Push-Ups → Standard Push-Ups.`;
    }

    // 4. Plank hold guidance
    if (query.includes('plank')) {
      return `**Mastering the Plank Hold**:

- Place elbows directly beneath shoulders.
- Squeeze your glutes, core, and quadriceps tightly.
- Push the floor away through your forearms to engage the serratus anterior.
- Keep your neck neutral by gazing a few inches in front of your hands.
- *Quality over quantity*: A rock-solid 30-second plank with high tension is far more effective than a sloppy 2-minute hold!`;
    }

    // 5. Coins & Store guidance
    if (query.includes('coin') || query.includes('store') || query.includes('cosmetic') || query.includes('avatar') || query.includes('theme')) {
      return `🪙 **FITRON Economy & Cosmetics**:

- **Your Balance**: ${userProfile.coins} Coins
- **How to Earn Coins**: Complete **Challenges** (+25–45 Coins), clear **Special Game Mode Trials** (+35–100 Coins), and achieve **Daily Missions** (+15–20 Coins).
- **What to Buy**: Check out the **Store** to unlock atmospheric background themes (like *Cyber Matrix*, *Neon Pulse*, and *Obsidian Rain*) or custom hairstyles, armor, and poses for your athlete avatar!
- *Note*: Cosmetics are purely visual and cannot be bought with real money. XP is always earned through real physical movement.`;
    }

    // 6. Streak & Consistency guidance
    if (query.includes('streak') || query.includes('today') || query.includes('what should i do')) {
      return `🔥 **Streak & Daily Game Plan**:

- **Current Streak**: ${userProfile.streak} Days active!
- **Milestone Goal**: ${userProfile.streak < 7 ? 'Reach 7 Days for +50 XP & "On A Roll" Badge!' : userProfile.streak < 14 ? 'Reach 14 Days for +100 XP!' : 'Maintain for the 30-Day Legend milestone!'}
- **Recommended Action Today**:
  1. Complete at least 1 verified workout in Fitness Mode or clear Stage ${userProfile.current_level} in Game Mode.
  2. Check off your Daily Movement mission (+30 XP).
  3. Drink 500ml water and take 5 minutes to stretch!`;
    }

    // 7. General Progress Summary
    return `Here is your current athletic summary on FITRON:

- **Athlete**: ${userProfile.full_name} (${userProfile.fitron_id})
- **Rank**: ${userProfile.rank} (${userProfile.xp} XP total)
- **Streak**: ${userProfile.streak} Days
- **Total Workouts Logged**: ${workouts.length}
- **Active Challenges**: ${challenges.filter(c => c.status === 'ACTIVE').length}

Keep your momentum moving forward! Ask me if you need exercise tutorials, custom workout schedules, or gameplay tips.`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: AIMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Simulate natural response latency
      setTimeout(async () => {
        const reply = await generateAIResponse(query);
        const aiMsg: AIMessage = {
          id: 'ai_' + Date.now(),
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
      }, 600);
    } catch (err) {
      setIsLoading(false);
      const errorMsg: AIMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: 'FITRON AI is temporarily busy. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Conversation reset. Ready for your next workout plan, ${userProfile.full_name}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl fitron-card p-6 sm:p-8 border border-border-subtle bg-gradient-to-r from-bg-card via-bg-secondary to-[#1c060f]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-dark/40 border border-crimson/40 text-crimson-pastel text-xs font-semibold uppercase tracking-wider mb-2">
              <Bot className="w-3.5 h-3.5" />
              Intelligent Athletic Advisor
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
              FITRON AI COACH
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              Your personalized fitness coach and game progression advisor. Ask for customized workouts, form tips, recovery advice, and game mechanics.
            </p>
          </div>

          <button
            onClick={handleClearHistory}
            className="btn-secondary px-4 py-2 text-xs text-text-secondary hover:text-white flex items-center gap-1.5 self-start md:self-auto"
          >
            <Trash2 className="w-4 h-4" /> Clear Chat
          </button>
        </div>

        {/* Safety Banner */}
        <div className="relative z-10 mt-4 pt-3 border-t border-border-subtle/60 flex items-center gap-2 text-xs text-text-secondary">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Responsible AI: Provides general exercise and gamification guidance. Not a substitute for medical diagnosis.</span>
        </div>
      </div>

      {/* Quick Prompts Row */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-text-muted flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-crimson-pastel" /> Quick Prompts
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3.5 py-1.5 rounded-xl bg-bg-secondary border border-border-subtle hover:border-crimson text-xs text-text-secondary hover:text-white transition whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="fitron-card rounded-3xl border border-border-subtle flex flex-col h-[520px] overflow-hidden bg-bg-card">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isUser
                    ? 'bg-crimson text-white shadow-crimson-sm'
                    : 'bg-bg-secondary border border-border-subtle text-crimson-pastel'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-crimson text-white rounded-tr-none'
                    : 'bg-bg-secondary border border-border-subtle text-white rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-line prose prose-invert max-w-none text-sm">
                    {msg.content}
                  </div>
                  <div className={`text-[10px] mt-2 font-mono ${isUser ? 'text-white/70 text-right' : 'text-text-muted'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-bg-secondary border border-border-subtle flex items-center justify-center text-crimson-pastel animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-bg-secondary border border-border-subtle text-xs text-text-secondary flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-crimson-pastel" />
                FITRON AI is analyzing your query...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border-subtle bg-bg-secondary">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask FITRON AI about workouts, form cues, goals, or game stages..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-bg-primary border border-border-subtle rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-crimson placeholder:text-text-muted"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`btn-crimson px-5 py-3 rounded-xl flex items-center justify-center ${
                !inputText.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : 'shadow-crimson-sm'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
