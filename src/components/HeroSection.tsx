import React from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { APIMatch } from '../services/api';

interface HeroSectionProps {
  featuredMatch: APIMatch | null;
}

const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/1200x400?text=Featured+Match';

const HeroSection: React.FC<HeroSectionProps> = ({ featuredMatch }) => {
  const navigate = useNavigate();

  if (!featuredMatch) {
    return (
      <div className="relative overflow-hidden bg-[#0c0c0c] rounded-[2rem] p-12 mb-12 text-center text-slate-100 min-h-[50vh] flex flex-col items-center justify-center border border-white/5 shadow-2xl">
        <div className="noise-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <h2 className="relative z-10 text-4xl md:text-5xl font-black mb-4 tracking-tighter text-balance text-white">
          Welcome to <span className="text-emerald-400">Mpira streams</span>
        </h2>
        <p className="relative z-10 text-slate-400 mb-8 max-w-lg mx-auto text-lg font-medium">
          Your ultimate destination for live sports streaming. Premium quality, zero interruptions.
        </p>
        <button
          className="relative z-10 bg-white text-slate-950 font-bold py-4 px-10 rounded-2xl text-md hover-spring tinted-shadow-emerald-hover hover:bg-emerald-400 hover:text-slate-950 cursor-pointer"
          onClick={() => navigate('/')}
        >
          Explore Live Matches
        </button>
      </div>
    );
  }

  const formattedDate = new Date(featuredMatch.date).toLocaleString();
  const backgroundImage = featuredMatch.poster ? api.getPosterUrl(featuredMatch.poster) : PLACEHOLDER_IMAGE_URL;

  const isLive = featuredMatch.status?.toLowerCase() === 'live';

  return (
    <div className="relative rounded-[2rem] overflow-hidden mb-16 min-h-[60vh] lg:min-h-[550px] flex items-end select-none group">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] ease-out group-hover:scale-105"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent lg:via-[#0a0a0a]/50 lg:bg-gradient-to-r lg:from-[#0a0a0a] lg:via-[#0a0a0a]/80 lg:to-transparent"></div>
      <div className="noise-overlay opacity-10"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full p-6 md:p-12 lg:p-16 flex flex-col lg:flex-row items-end justify-between gap-8 max-w-[1440px] mx-auto">
        <div className="w-full lg:max-w-3xl flex flex-col items-start text-left">
          {isLive && (
            <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-lg backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-bold tracking-widest uppercase">Live Now</span>
            </div>
          )}
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-4 leading-[1.1] tracking-tighter text-white text-balance drop-shadow-2xl">
            {featuredMatch.title}
          </h2>
          <p className="text-base md:text-lg text-slate-300 font-medium flex items-center gap-2 mb-8">
            <span className="opacity-80">Scheduled for</span>
            <span className="text-white font-bold">{formattedDate}</span>
          </p>
          
          <button
            className="w-full sm:w-auto bg-emerald-500 text-slate-950 font-black py-4 px-10 rounded-2xl text-lg hover-spring hover:scale-[1.02] tinted-shadow-emerald cursor-pointer hover:bg-emerald-400 active:scale-95"
            onClick={() => navigate(`/watch/${featuredMatch.id}`)}
          >
            Watch Stream
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;