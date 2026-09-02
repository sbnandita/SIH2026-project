import React, { useState } from 'react';
import { UserProfile, BackgroundThemeItem } from '../../types';
import { BACKGROUND_THEMES, AVATAR_ITEMS } from '../../lib/constants';
import { FitronDB } from '../../lib/db';
import { AvatarBuilder } from '../avatar/AvatarBuilder';
import { Coins, Sparkles, Check, Lock, ShieldCheck, History, Palette, User, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StorePageProps {
  userProfile: UserProfile;
  onProfileUpdated: () => void;
}

export const StorePage: React.FC<StorePageProps> = ({ userProfile, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'avatars' | 'history'>('themes');
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(FitronDB.getUnlockedBackgrounds());
  const [previewTheme, setPreviewTheme] = useState<string>(userProfile.equipped_background);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const coinHistory = FitronDB.getCoinTransactions();

  const handleUnlockTheme = (theme: BackgroundThemeItem) => {
    setStatusMsg(null);
    if (userProfile.coins < theme.price_coins) {
      setStatusMsg({ type: 'error', text: `Insufficient coins. You need ${theme.price_coins - userProfile.coins} more coins.` });
      return;
    }

    const success = FitronDB.unlockBackground(theme.id);
    if (success) {
      setUnlockedThemes(FitronDB.getUnlockedBackgrounds());
      setStatusMsg({ type: 'success', text: `Unlocked ${theme.name} theme!` });
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      onProfileUpdated();
    }
  };

  const handleEquipTheme = (themeId: string) => {
    FitronDB.equipBackground(themeId);
    setPreviewTheme(themeId);
    setStatusMsg({ type: 'success', text: `Theme equipped successfully!` });
    onProfileUpdated();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl fitron-card p-8 border border-border-subtle bg-gradient-to-r from-bg-card via-bg-secondary to-[#1c060f]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-dark/40 border border-crimson/40 text-crimson-pastel text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Cosmetics & Customization Store
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              FITRON ATHLETIC STORE
            </h1>
            <p className="text-text-secondary mt-2 max-w-xl text-sm sm:text-base">
              Spend Coins earned through workouts, challenges, and game levels. Cosmetics are strictly visual — XP cannot be bought.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="px-6 py-4 rounded-2xl bg-bg-primary/90 border border-border-subtle flex items-center gap-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-text-muted font-medium">Your Coin Balance</div>
                <div className="text-2xl font-bold text-white flex items-center gap-1.5 font-heading">
                  {userProfile.coins} <span className="text-amber-400 text-sm font-normal">Coins</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsible Gaming Badge */}
        <div className="relative z-10 mt-6 pt-4 border-t border-border-subtle/60 flex items-center gap-2 text-xs text-text-secondary">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Fair Play Guarantee: 100% cosmetic items. Zero pay-to-win mechanics.</span>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl border text-sm font-medium ${
          statusMsg.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-crimson-dark/30 border-crimson/50 text-crimson-pastel'
        }`}>
          {statusMsg.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
            activeTab === 'themes'
              ? 'bg-crimson text-white shadow-crimson-sm'
              : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <Palette className="w-4 h-4" />
          Background Themes ({BACKGROUND_THEMES.length})
        </button>
        <button
          onClick={() => setActiveTab('avatars')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
            activeTab === 'avatars'
              ? 'bg-crimson text-white shadow-crimson-sm'
              : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <User className="w-4 h-4" />
          Avatar Studio ({AVATAR_ITEMS.length} Items)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
            activeTab === 'history'
              ? 'bg-crimson text-white shadow-crimson-sm'
              : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
          }`}
        >
          <History className="w-4 h-4" />
          Coin Ledger ({coinHistory.length})
        </button>
      </div>

      {/* TAB 1: BACKGROUND THEMES */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Atmospheric Background Themes</h2>
            <span className="text-xs text-text-secondary">First 5 themes are unlocked for free</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BACKGROUND_THEMES.map((theme) => {
              const isUnlocked = unlockedThemes.includes(theme.id);
              const isEquipped = userProfile.equipped_background === theme.id;
              const canAfford = userProfile.coins >= theme.price_coins;

              return (
                <div
                  key={theme.id}
                  className={`fitron-card rounded-2xl overflow-hidden border transition relative flex flex-col justify-between ${
                    isEquipped
                      ? 'border-crimson ring-1 ring-crimson shadow-crimson-sm'
                      : 'border-border-subtle hover:border-text-secondary/40'
                  }`}
                >
                  {/* Theme Visual Preview Box */}
                  <div className={`h-36 w-full relative p-4 flex flex-col justify-between ${theme.css_class} border-b border-border-subtle`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        theme.rarity === 'FREE' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' :
                        theme.rarity === 'COMMON' ? 'bg-zinc-900/80 text-zinc-300 border border-zinc-700' :
                        theme.rarity === 'RARE' ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30' :
                        theme.rarity === 'PREMIUM' ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30' :
                        'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      }`}>
                        {theme.rarity}
                      </span>
                      {isEquipped && (
                        <span className="px-2 py-0.5 rounded-full bg-crimson text-white text-[11px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Equipped
                        </span>
                      )}
                    </div>

                    <div className="text-white font-bold text-lg drop-shadow-md">
                      {theme.name}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-text-secondary mb-4">
                      {theme.description}
                    </p>

                    <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {theme.price_coins === 0 ? (
                          <span className="text-xs font-semibold text-emerald-400">Free Starter</span>
                        ) : (
                          <div className="flex items-center gap-1 text-sm font-bold text-white">
                            <Coins className="w-4 h-4 text-amber-400" />
                            {theme.price_coins}
                          </div>
                        )}
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => handleEquipTheme(theme.id)}
                          disabled={isEquipped}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            isEquipped
                              ? 'bg-bg-secondary text-text-muted cursor-default border border-border-subtle'
                              : 'btn-crimson'
                          }`}
                        >
                          {isEquipped ? 'Active' : 'Equip Theme'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnlockTheme(theme)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                            canAfford
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock ({theme.price_coins} C)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AVATAR CUSTOMIZER */}
      {activeTab === 'avatars' && (
        <AvatarBuilder userProfile={userProfile} onAvatarUpdated={onProfileUpdated} />
      )}

      {/* TAB 3: COIN TRANSACTION HISTORY */}
      {activeTab === 'history' && (
        <div className="fitron-card p-6 border border-border-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-crimson-pastel" />
              Coin Transaction Ledger
            </h2>
            <span className="text-xs text-text-secondary">Verified database records</span>
          </div>

          {coinHistory.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">
              No coin transactions recorded yet. Complete challenges or workout missions to earn coins!
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {coinHistory.map((tx) => {
                const isEarn = tx.type === 'EARN';
                return (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isEarn ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-crimson-dark/40 text-crimson-pastel border border-crimson/30'
                      }`}>
                        {isEarn ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{tx.reason}</div>
                        <div className="text-xs text-text-muted">
                          {new Date(tx.created_at).toLocaleDateString()} • {tx.source_type.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className={`font-bold font-heading text-base ${isEarn ? 'text-emerald-400' : 'text-crimson-pastel'}`}>
                      {isEarn ? '+' : ''}{tx.amount} Coins
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
