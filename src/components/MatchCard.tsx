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

  const formattedDate = new Date(match.date).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const imageUrl = match.poster
    ? api.getPosterUrl(match.poster)
    : PLACEHOLDER_IMAGE_URL;
  const sportName = match.category || "Match";
  const isLive = match.status?.toLowerCase() === "live";

  return (
    <div
      className="group cursor-pointer flex flex-col gap-3 w-full"
      onClick={() => navigate(`/watch/${encodeURIComponent(match.uriName)}`)}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-white/20 hover-lift">
        <img
          src={imageUrl}
          alt={`${match.title}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            <svg
              className="w-6 h-6 text-black ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Top Badges overlaying image slightly */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none">
          {isLive ? (
            <div className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              LIVE
            </div>
          ) : match.status === "upcoming" ? (
            <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
              UPCOMING
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {/* Details Container (below image) */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <span className={isLive ? "text-red-400" : "text-zinc-400"}>
            {sportName}
          </span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
        <h3 className="text-white text-sm sm:text-base font-bold leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
          {match.title}
        </h3>
      </div>
    </div>
  );
};

export default MatchCard;
