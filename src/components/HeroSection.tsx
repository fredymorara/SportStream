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
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-8 text-center text-slate-100">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          Welcome to SpaceStream!
        </h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Your ultimate destination for live sports streaming.
        </p>
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-md transition-colors duration-200"
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
    <div
      className="relative bg-cover bg-center rounded-xl overflow-hidden shadow-2xl p-6 md:p-12 mb-8 border border-slate-800 min-h-[300px] flex items-end select-none"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-black mb-2 leading-tight tracking-tight text-white drop-shadow-md">
            {featuredMatch.title}
          </h2>
          <p className="text-sm md:text-base text-slate-300 font-medium drop-shadow-sm flex items-center justify-center md:justify-start gap-2">
            <span>📅 {formattedDate}</span>
            {isLive && (
              <span className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-md font-extrabold shadow-lg animate-pulse">
                LIVE
              </span>
            )}
          </p>
        </div>

        <button
          className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-8 rounded-xl text-md shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate(`/watch/${featuredMatch.id}`)}
        >
          Watch Stream
        </button>
      </div>
    </div>
  );
};

export default HeroSection;