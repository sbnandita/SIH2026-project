import React from 'react';
import { EquippedAvatar } from '../../types';

interface AvatarPreviewProps {
  equipped: EquippedAvatar;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showBackground?: boolean;
  className?: string;
  animate?: boolean;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  equipped,
  size = 'md',
  showBackground = true,
  className = '',
  animate = false,
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28',
    xl: 'w-48 h-48',
    full: 'w-full aspect-square max-w-[340px]',
  };

  const isFullBody = size === 'lg' || size === 'xl' || size === 'full';

  // Hair style renderer
  const renderHair = () => {
    switch (equipped.hair) {
      case 'hair_2': // Dynamic Sweep
        return (
          <path
            d="M32 30 C32 18 45 10 65 14 C75 16 78 26 72 36 C68 40 60 42 55 42 C45 42 35 38 32 30 Z"
            fill="#1E1418"
            stroke="#C51F4A"
            strokeWidth="1.5"
          />
        );
      case 'hair_3': // Neon Crest Fade
        return (
          <g>
            <path
              d="M36 30 C36 14 50 8 68 12 C72 13 74 20 68 28 C62 34 50 35 36 30 Z"
              fill="#2A0E18"
              stroke="#E85A7A"
              strokeWidth="2"
            />
            <path d="M42 16 L54 11 L60 14" stroke="#FF2E63" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'hair_4': // Cyber Braids
        return (
          <g>
            <path d="M35 28 C35 15 50 12 65 15 C72 20 70 32 68 36 Z" fill="#15191C" stroke="#C51F4A" strokeWidth="1.5" />
            <path d="M36 32 Q30 45 32 60" stroke="#E85A7A" strokeWidth="3" strokeLinecap="round" />
            <path d="M64 32 Q70 45 68 60" stroke="#E85A7A" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="60" r="2.5" fill="#FF2E63" />
            <circle cx="68" cy="60" r="2.5" fill="#FF2E63" />
          </g>
        );
      case 'hair_1': // Athletic Buzz
      default:
        return (
          <path
            d="M35 32 C35 20 45 15 65 20 C70 23 70 32 66 36 C55 38 40 37 35 32 Z"
            fill="#1A1C20"
            stroke="#8F1637"
            strokeWidth="1.5"
          />
        );
    }
  };

  // Face Expression
  const renderFace = () => {
    switch (equipped.face) {
      case 'face_2': // Fierce Champion
        return (
          <g>
            {/* Fierce angled brows */}
            <path d="M40 38 L48 42" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <path d="M60 42 L52 38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="43" cy="44" r="2" fill="#E85A7A" />
            <circle cx="57" cy="44" r="2" fill="#E85A7A" />
            {/* Smirk */}
            <path d="M44 54 Q50 58 56 53" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'face_3': // Zen Master
        return (
          <g>
            {/* Calm curved brows */}
            <path d="M39 39 Q44 37 48 40" stroke="#A7ADB4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M52 40 Q56 37 61 39" stroke="#A7ADB4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Peaceful eyes */}
            <path d="M41 44 Q44 46 47 44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M53 44 Q56 46 59 44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Serene smile */}
            <path d="M45 54 Q50 56 55 54" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'face_1': // Determined Focus
      default:
        return (
          <g>
            {/* Focused straight brows */}
            <path d="M40 40 L48 41" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <path d="M52 41 L60 40" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="44" cy="45" r="2.2" fill="#FFFFFF" />
            <circle cx="56" cy="45" r="2.2" fill="#FFFFFF" />
            {/* Confident mouth */}
            <path d="M45 54 L55 54" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
    }
  };

  // Outfit
  const renderOutfit = () => {
    switch (equipped.outfit) {
      case 'outfit_2': // Stealth Hoodie
        return (
          <g>
            <path d="M30 68 Q50 62 70 68 L76 96 L24 96 Z" fill="#15191C" stroke="#22272B" strokeWidth="1.5" />
            <path d="M44 64 L50 78 L56 64" fill="#0B0D0F" stroke="#C51F4A" strokeWidth="1.5" />
            <line x1="38" y1="74" x2="38" y2="88" stroke="#E85A7A" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="62" y1="74" x2="62" y2="88" stroke="#E85A7A" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      case 'outfit_3': // Cyber Armor
        return (
          <g>
            <path d="M28 66 L72 66 L78 96 L22 96 Z" fill="#101316" stroke="#8F1637" strokeWidth="2" />
            {/* Exoskeleton plates */}
            <polygon points="40,70 60,70 56,86 44,86" fill="#1D2226" stroke="#E85A7A" strokeWidth="1.5" />
            <circle cx="50" cy="78" r="3.5" fill="#FF2E63" />
            <path d="M30 72 L36 84" stroke="#C51F4A" strokeWidth="2" />
            <path d="M70 72 L64 84" stroke="#C51F4A" strokeWidth="2" />
          </g>
        );
      case 'outfit_4': // Apex Champion Robe
        return (
          <g>
            <path d="M26 64 L74 64 L80 96 L20 96 Z" fill="#240713" stroke="#FFD700" strokeWidth="2" />
            <path d="M42 64 L50 82 L58 64" fill="#8F1637" stroke="#FFD700" strokeWidth="1.5" />
            {/* Gold trim medals */}
            <circle cx="50" cy="88" r="4" fill="#FFD700" stroke="#FFFFFF" strokeWidth="1" />
          </g>
        );
      case 'outfit_1': // Core Tech Suit
      default:
        return (
          <g>
            <path d="M32 66 Q50 63 68 66 L74 96 L26 96 Z" fill="#15191C" stroke="#22272B" strokeWidth="1.5" />
            <path d="M50 65 L50 96" stroke="#C51F4A" strokeWidth="2" />
            <path d="M38 76 L46 84" stroke="#8F1637" strokeWidth="1.5" />
            <path d="M62 76 L54 84" stroke="#8F1637" strokeWidth="1.5" />
          </g>
        );
    }
  };

  // Accessories
  const renderAccessory = () => {
    switch (equipped.accessory) {
      case 'acc_2': // Crimson Headband
        return (
          <g>
            <rect x="34" y="32" width="32" height="6" rx="2" fill="#C51F4A" />
            <circle cx="50" cy="35" r="2" fill="#FFFFFF" />
          </g>
        );
      case 'acc_3': // Cyber Visor
        return (
          <g>
            <polygon points="36,41 64,41 60,47 40,47" fill="rgba(255, 46, 99, 0.85)" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="42" y1="44" x2="58" y2="44" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2,2" />
          </g>
        );
      case 'acc_4': // Wristbands (full body view)
        return isFullBody ? (
          <g>
            <rect x="18" y="78" width="6" height="5" rx="1.5" fill="#FF2E63" />
            <rect x="76" y="78" width="6" height="5" rx="1.5" fill="#FF2E63" />
          </g>
        ) : null;
      case 'acc_1':
      default:
        return null;
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden ${sizeMap[size]} ${className}`}>
      {/* Background backing */}
      {showBackground && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#220914] to-[#101316] border border-border-subtle rounded-2xl" />
      )}

      {/* SVG Avatar */}
      <svg
        viewBox="0 0 100 100"
        className={`relative z-10 w-full h-full ${animate ? 'animate-float' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle aura behind avatar */}
        <circle cx="50" cy="50" r="38" fill="rgba(197, 31, 74, 0.12)" filter="blur(8px)" />

        {/* Neck */}
        <rect x="44" y="56" width="12" height="12" rx="3" fill="#D49A80" />

        {/* Head Base */}
        <ellipse cx="50" cy="46" rx="15" ry="18" fill="#E8B298" stroke="#1D2226" strokeWidth="1" />

        {/* Ears */}
        <circle cx="34" cy="46" r="3.5" fill="#D49A80" />
        <circle cx="66" cy="46" r="3.5" fill="#D49A80" />

        {/* Features */}
        {renderFace()}

        {/* Hair */}
        {renderHair()}

        {/* Outfit & Upper Body */}
        {renderOutfit()}

        {/* Accessories Layer */}
        {renderAccessory()}
      </svg>
    </div>
  );
};
