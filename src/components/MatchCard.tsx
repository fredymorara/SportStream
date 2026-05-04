import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";

interface MatchCardProps {
  match: APIMatch;
}

const PLACEHOLDER_IMAGE_URL = "https://via.placeholder.com/400x200?text=No+Image";

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const navigate = useNavigate();
  const formattedDate = new Date(match.date).toLocaleString();

  const imageUrl = match.poster ? api.getPosterUrl(match.poster) : PLACEHOLDER_IMAGE_URL;

  return (
    <div
      className="rounded-xl border border-slate-800/80 shadow-lg overflow-hidden relative group cursor-pointer aspect-video bg-slate-900 flex flex-col justify-between select-none"
      onClick={() => navigate(`/watch/${match.id}`)}
    >
      <img
        src={imageUrl}
        alt={`${match.title}`}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
      
      <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-1 bg-slate-950/70 backdrop-blur-sm p-1.5 rounded-lg border border-slate-800 shadow">
            {match.teams?.home?.badge && (
              <img
                src={api.getBadgeUrl(match.teams.home.badge)}
                alt=""
                className="w-6 h-6 object-contain"
              />
            )}
            {match.teams?.away?.badge && (
              <img
                src={api.getBadgeUrl(match.teams.away.badge)}
                alt=""
                className="w-6 h-6 object-contain"
              />
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1 text-xs">
            {match.sources && match.sources.some((s) => s.hd) && (
              <span className="bg-emerald-500/90 backdrop-blur-sm text-slate-950 px-2 py-0.5 rounded font-extrabold shadow">
                HD
              </span>
            )}
            {match.popular && (
              <span className="bg-pink-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded font-extrabold shadow">
                Hot
              </span>
            )}
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 bg-emerald-500/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300 text-slate-950">
            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>

        <div className="mt-auto">
          <h3 className="text-md md:text-lg font-bold tracking-tight mb-1 line-clamp-2 drop-shadow-md text-white">
            {match.title}
          </h3>
          <p className="text-slate-300 text-xs font-medium flex items-center gap-1 drop-shadow-sm">
            📅 {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;