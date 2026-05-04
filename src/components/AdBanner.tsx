import React from 'react';

interface AdBannerProps {
  position?: 'top' | 'inline';
  active?: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({ position = "top", active = false }) => {
  if (!active) return null;

  return (
    <div 
      className={`w-full max-w-4xl mx-auto my-4 p-4 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-sm flex flex-col items-center justify-center min-h-[90px] select-none ${
        position === 'inline' ? 'col-span-full' : ''
      }`}
    >
      <span className="text-xs uppercase tracking-wider text-slate-600 mb-1 font-bold">
        Sponsored Content
      </span>
      <div className="text-xs">
        Monetization space placeholder
      </div>
    </div>
  );
};

export default AdBanner;