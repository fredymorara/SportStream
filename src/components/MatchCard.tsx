import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";
import { formatEventDate } from "../utils/formatDate";

interface MatchCardProps {
  match: APIMatch;
}

const PLACEHOLDER_IMAGE_URL = "/sports_placeholder.png";

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const formattedDate = formatEventDate(match.date);

  const imageSources = api.getPosterCandidates(match);
  const [imageIndex, setImageIndex] = useState(0);
  const imageUrl = imageSources[imageIndex] || PLACEHOLDER_IMAGE_URL;
  const openMatch = () =>
    navigate(`/watch/${encodeURIComponent(match.uriName)}${location.search}`);
  const sportName = match.category || "Match";
  const isLive = match.status?.toLowerCase() === "live";

  return (
    <div
      className="group min-w-0 w-full cursor-pointer touch-manipulation flex flex-col gap-3"
      role="button"
      tabIndex={0}
      aria-label={`Watch ${match.title}`}
      onClick={openMatch}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openMatch();
        }
      }}
    >
      {/* Thumbnail Container */}
      <div
        className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900 bg-cover bg-center ring-1 ring-inset ring-white/10 transition-[box-shadow] duration-300 group-hover:ring-white/25"
        style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE_URL})` }}
      >
        <img
          src={imageUrl}
          alt={`${match.title}`}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() =>
            setImageIndex((index) =>
              index < imageSources.length - 1 ? index + 1 : index,
            )
          }
        />

        {/* Play Button Overlay */}
        <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white">
          <svg
            className="ml-0.5 h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {/* Top Badges overlaying image slightly */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none">
          {isLive ? (
            <div className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
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
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <span className={isLive ? "text-red-400" : "text-zinc-400"}>
            {sportName}
          </span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
        <h3 className="text-pretty break-words text-sm font-bold leading-snug text-white group-hover:text-blue-300 sm:text-base">
          {match.title}
        </h3>
      </div>
    </div>
  );
};

export default React.memo(MatchCard);
