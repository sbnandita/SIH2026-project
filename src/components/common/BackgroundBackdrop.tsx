import React from 'react';

interface BackgroundBackdropProps {
  themeId: string;
}

export const BackgroundBackdrop: React.FC<BackgroundBackdropProps> = ({ themeId }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 transition-all duration-700 bg-theme-${themeId}`}>
      {/* Subtle Grid Ambient Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
      
      {/* Top Crimson Ambient Radial Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-crimson-dark/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Cyber theme scanning effect */}
      {themeId === 'cyber' && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-crimson/5 to-transparent h-20 w-full animate-scan pointer-events-none" />
      )}

      {/* Rain theme subtle overlay */}
      {themeId === 'rain' && (
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#C51F4A_1px,transparent_1px)] [background-size:16px_16px]" />
      )}
    </div>
  );
};
