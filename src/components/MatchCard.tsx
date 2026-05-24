import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";

interface MatchCardProps {
  match: APIMatch;
}

const PLACEHOLDER_IMAGE_URL = "/sports_placeholder.png";

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const navigate = useNavigate();

  const imageUrl = match.poster ? api.getPosterUrl(match.poster) : PLACEHOLDER_IMAGE_URL;
  const sportName = match.category || "Match";

  return (
    <div
      className="rounded-[1.25rem] shadow-lg overflow-hidden relative group/card cursor-pointer aspect-video bg-[#121212] flex flex-col justify-between select-none hover-spring hover:-translate-y-2 tinted-shadow-emerald-hover border border-white/5"
      onClick={() => navigate(`/watch/${match.id}`)}
    >
      {/* Vibrant Border Glow on Hover */}
      <div className="absolute inset-0 rounded-[1.25rem] ring-1 ring-transparent group-hover/card:ring-2 group-hover/card:ring-emerald-400 group-hover/card:shadow-[inset_0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 z-30 pointer-events-none"></div>

      {/* Colorful Background Image */}
      <img
        src={imageUrl}
        alt={`${match.title}`}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-500"
        loading="lazy"
      />
      
      {/* Lightweight gradient just enough to make text readable, not black and white */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10 pointer-events-none h-full opacity-90 group-hover/card:opacity-100 transition-opacity"></div>

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <svg 
          className="w-16 h-16 text-white opacity-0 group-hover/card:opacity-100 transform scale-75 group-hover/card:scale-100 transition-all duration-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] filter ml-2"
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M6 4l15 8-15 8z" />
        </svg>
      </div>

      <div className="relative z-20 p-4 w-full flex flex-col h-full justify-between pointer-events-none">
        
        {/* Top Badges */}
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            {match.status === 'live' && (
              <div className="bg-red-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                LIVE
              </div>
            )}
            {match.status === 'upcoming' && (
              <div className="bg-slate-900/80 backdrop-blur-md text-slate-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-widest border border-white/10">
                UPCOMING
              </div>
            )}
          </div>
          {match.sources?.some((s) => s.hd) && (
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded tracking-wider">
              HD
            </span>
          )}
        </div>

        {/* Bottom Typography */}
        <div className="flex flex-col items-start transform transition-transform duration-300 group-hover/card:-translate-y-1 mt-auto">
          <p className="text-emerald-400 font-bold text-xs tracking-wider uppercase mb-1 drop-shadow-md">{sportName}</p>
          <h3 className="text-white text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-2 drop-shadow-lg">
            {match.title}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;