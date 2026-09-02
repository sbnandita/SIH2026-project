import React, { useState } from 'react';
import { UserProfile, ExerciseId } from '../../types';
import { FitronDB } from '../../lib/db';
import { AvatarPreview } from '../avatar/AvatarPreview';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Dumbbell, 
  Camera, 
  Trophy, 
  Users, 
  TrendingUp, 
  Bot, 
  ShoppingBag, 
  User, 
  Bell, 
  Flame, 
  Zap, 
  Coins, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface AppShellProps {
  userProfile: UserProfile;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onStartMotionWorkout: (exerciseId?: ExerciseId) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  userProfile,
  activeTab,
  onTabChange,
  onStartMotionWorkout,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notifications = FitronDB.getNotifications();
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'game', label: 'Game Mode', icon: Gamepad2, badge: `Lvl ${userProfile.current_level}` },
    { id: 'fitness', label: 'Fitness Mode', icon: Dumbbell },
    { id: 'motion', label: 'FITRON Motion', icon: Camera, highlight: true },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'social', label: 'Friends & Arena', icon: Users },
    { id: 'progress', label: 'Progress & BMI', icon: TrendingUp },
    { id: 'ai', label: 'FITRON AI', icon: Bot },
    { id: 'store', label: 'Store', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount > 0 ? `${unreadNotifCount}` : undefined },
  ];

  const handleNavClick = (tabId: string) => {
    if (tabId === 'motion') {
      onStartMotionWorkout('standard_pushups');
    } else {
      onTabChange(tabId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* 1. TOP BAR */}
      <header className="sticky top-0 z-40 h-16 bg-[#0B0D0F]/90 backdrop-blur-md border-b border-border-subtle px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-white hover:bg-bg-secondary"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-bg-card border border-crimson/50 flex items-center justify-center shadow-crimson-sm">
              <svg className="w-5 h-5" viewBox="0 0 100 100">
                <polygon points="50,8 90,30 90,70 50,92 10,70 10,30" fill="#0B0D0F" stroke="#C51F4A" strokeWidth="8" />
                <path d="M30,35 L70,35 L40,55 L65,55 L35,75" stroke="#E85A7A" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div>
              <span className="font-heading font-black text-xl tracking-tight text-white block leading-none">
                FITRON
              </span>
              <span className="text-[9px] font-bold text-crimson-pastel tracking-widest uppercase block leading-none mt-0.5">
                LEVEL UP
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Athlete Metrics & Profile Hub */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Streak Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-secondary border border-border-subtle text-xs font-bold text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>{userProfile.streak}d</span>
          </div>

          {/* XP Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-crimson-dark/30 border border-crimson/40 text-xs font-bold text-crimson-pastel font-heading">
            <Zap className="w-4 h-4" />
            <span>{userProfile.xp} XP</span>
          </div>

          {/* Coins Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs font-bold text-amber-300 font-heading">
            <Coins className="w-4 h-4" />
            <span>{userProfile.coins}</span>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => onTabChange('notifications')}
            className="relative p-2 rounded-xl text-text-secondary hover:text-white hover:bg-bg-secondary border border-transparent hover:border-border-subtle transition"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson shadow-crimson-sm" />
            )}
          </button>

          {/* Profile Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-bg-secondary border border-transparent hover:border-border-subtle transition"
            >
              <AvatarPreview equipped={userProfile.equipped_avatar} size="xs" />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-white leading-tight">{userProfile.username}</div>
                <div className="text-[10px] text-crimson-pastel font-bold leading-tight uppercase">{userProfile.rank}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden lg:block" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl fitron-card p-2 border border-border-subtle shadow-2xl bg-bg-card z-50 text-xs"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="p-3 border-b border-border-subtle mb-1">
                  <div className="font-bold text-white text-sm">{userProfile.full_name}</div>
                  <div className="text-text-muted font-mono">{userProfile.fitron_id}</div>
                </div>

                <button
                  onClick={() => onTabChange('profile')}
                  className="w-full text-left px-3 py-2 rounded-xl text-text-secondary hover:text-white hover:bg-bg-secondary flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Profile & Stats
                </button>
                <button
                  onClick={() => onTabChange('store')}
                  className="w-full text-left px-3 py-2 rounded-xl text-text-secondary hover:text-white hover:bg-bg-secondary flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Cosmetics Store
                </button>
                <button
                  onClick={() => onTabChange('ai')}
                  className="w-full text-left px-3 py-2 rounded-xl text-text-secondary hover:text-white hover:bg-bg-secondary flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" /> FITRON AI Advisor
                </button>

                <div className="pt-1 mt-1 border-t border-border-subtle">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-crimson-pastel hover:bg-crimson-dark/20 flex items-center gap-2 font-semibold"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY CONTAINER (Sidebar + Main Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border-subtle bg-[#0B0D0F]/60 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-crimson text-white shadow-crimson-sm'
                    : item.highlight
                    ? 'bg-crimson-dark/20 border border-crimson/30 text-crimson-pastel hover:bg-crimson-dark/30'
                    : 'text-text-secondary hover:text-white hover:bg-bg-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-bg-secondary text-crimson-pastel border border-border-subtle'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Mobile Full Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <span className="font-heading font-bold text-lg text-white">FITRON MENU</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-text-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-auto py-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition ${
                      isActive
                        ? 'bg-crimson border-crimson text-white shadow-crimson-sm'
                        : 'bg-bg-card border-border-subtle text-text-secondary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold text-white mt-2">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={onLogout}
              className="w-full py-3 rounded-xl bg-crimson-dark/40 text-crimson-pastel border border-crimson/40 text-xs font-bold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating FITRON AI Assistant Button */}
      {activeTab !== 'ai' && (
        <button
          onClick={() => onTabChange('ai')}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl btn-crimson shadow-crimson-md flex items-center gap-2 text-white text-xs font-bold animate-float"
          title="Ask FITRON AI Coach"
        >
          <Bot className="w-5 h-5" />
          <span className="hidden sm:inline">Ask FITRON AI</span>
        </button>
      )}
    </div>
  );
};
