import React, { useState } from 'react';
import { UserProfile, EquippedAvatar } from '../../types';
import { AVATAR_ITEMS } from '../../lib/constants';
import { FitronDB } from '../../lib/db';
import { AvatarPreview } from './AvatarPreview';
import { Coins, Check, Lock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AvatarBuilderProps {
  userProfile: UserProfile;
  onAvatarUpdated: () => void;
}

export const AvatarBuilder: React.FC<AvatarBuilderProps> = ({ userProfile, onAvatarUpdated }) => {
  const [currentTab, setCurrentTab] = useState<'face' | 'hair' | 'outfit' | 'accessory' | 'pose'>('hair');
  const [previewAvatar, setPreviewAvatar] = useState<EquippedAvatar>({ ...userProfile.equipped_avatar });
  const [unlockedItems, setUnlockedItems] = useState<string[]>(FitronDB.getUnlockedAvatarItems());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const categories = [
    { id: 'hair', label: 'Hairstyle' },
    { id: 'face', label: 'Face' },
    { id: 'outfit', label: 'Outfit' },
    { id: 'accessory', label: 'Accessories' },
    { id: 'pose', label: 'Poses' },
  ] as const;

  const itemsForCategory = AVATAR_ITEMS.filter(item => item.category === currentTab);

  const handleSelectItem = (item: typeof AVATAR_ITEMS[0]) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPreviewAvatar(prev => ({
      ...prev,
      [currentTab]: item.id,
    }));
  };

  const handleUnlockItem = (item: typeof AVATAR_ITEMS[0]) => {
    setErrorMsg(null);
    if (userProfile.coins < item.price_coins) {
      setErrorMsg(`Insufficient coins. You need ${item.price_coins - userProfile.coins} more coins.`);
      return;
    }

    const success = FitronDB.unlockAvatarItem(item.id);
    if (success) {
      setUnlockedItems(FitronDB.getUnlockedAvatarItems());
      setSuccessMsg(`Unlocked ${item.name}!`);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      onAvatarUpdated();
    } else {
      setErrorMsg('Failed to unlock item.');
    }
  };

  const handleSaveAvatar = () => {
    // Ensure all items in preview are unlocked
    const currentSelectedIds = Object.values(previewAvatar);
    const hasLocked = currentSelectedIds.some(id => !unlockedItems.includes(id));
    if (hasLocked) {
      setErrorMsg('You have selected locked items. Unlock them first with Coins.');
      return;
    }

    FitronDB.equipAvatar(previewAvatar);
    setSuccessMsg('Avatar updated and equipped successfully!');
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.5 } });
    onAvatarUpdated();
  };

  const isCurrentEquipped = JSON.stringify(previewAvatar) === JSON.stringify(userProfile.equipped_avatar);

  return (
    <div className="fitron-card p-6 border border-border-subtle">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-crimson-pastel" />
            Athlete Avatar Studio
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Customize your modular FITRON avatar representation. Unlocked items are saved to your profile.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary border border-border-subtle">
          <Coins className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-white">{userProfile.coins}</span>
          <span className="text-xs text-text-muted">Coins</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-crimson-dark/30 border border-crimson/50 text-crimson-pastel text-sm">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Avatar Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-bg-secondary border border-border-subtle">
          <div className="relative">
            <AvatarPreview equipped={previewAvatar} size="xl" animate />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-crimson-dark text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full border border-crimson text-white">
              {userProfile.fitron_id}
            </div>
          </div>

          <div className="mt-8 w-full flex flex-col gap-3">
            <button
              onClick={handleSaveAvatar}
              disabled={isCurrentEquipped}
              className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                isCurrentEquipped
                  ? 'bg-bg-card text-text-muted border border-border-subtle cursor-default'
                  : 'btn-crimson'
              }`}
            >
              {isCurrentEquipped ? (
                <>
                  <Check className="w-5 h-5" /> Currently Equipped
                </>
              ) : (
                'Equip & Save Avatar'
              )}
            </button>
            <button
              onClick={() => setPreviewAvatar({ ...userProfile.equipped_avatar })}
              className="text-xs text-text-secondary hover:text-white transition py-1 text-center"
            >
              Reset to currently equipped
            </button>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-7 flex flex-col">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-border-subtle">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCurrentTab(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  currentTab === cat.id
                    ? 'bg-crimson text-white shadow-crimson-sm'
                    : 'bg-bg-secondary text-text-secondary hover:text-white hover:bg-bg-elevated'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-h-[380px] overflow-y-auto pr-1">
            {itemsForCategory.map(item => {
              const isUnlocked = unlockedItems.includes(item.id);
              const isSelected = previewAvatar[currentTab] === item.id;
              const canAfford = userProfile.coins >= item.price_coins;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`p-4 rounded-xl border transition cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-crimson bg-crimson-dark/20 ring-1 ring-crimson'
                      : 'border-border-subtle bg-bg-secondary hover:border-text-secondary/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-crimson text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      item.rarity === 'FREE' ? 'bg-emerald-950/60 text-emerald-400' :
                      item.rarity === 'COMMON' ? 'bg-zinc-800 text-zinc-300' :
                      item.rarity === 'RARE' ? 'bg-blue-950/60 text-blue-300' :
                      item.rarity === 'PREMIUM' ? 'bg-purple-950/60 text-purple-300' :
                      'bg-amber-950/60 text-amber-300'
                    }`}>
                      {item.rarity}
                    </span>

                    {isUnlocked ? (
                      <span className="text-xs text-emerald-400 font-medium">Unlocked</span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlockItem(item);
                        }}
                        disabled={!canAfford}
                        className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition ${
                          canAfford
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{item.price_coins} Coins</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
