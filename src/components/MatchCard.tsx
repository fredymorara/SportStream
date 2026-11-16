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
      {/* Thumbnail */}
      <div
        className="relative aspect-video overflow-hidden rounded-lg bg-[#111319] ring-1 ring-inset ring-[#1f2432] transition-[ring-color] duration-200 group-hover:ring-[#2e3547]"
        style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE_URL})`, backgroundSize: "cover" }}
      >
        <img
          src={imageUrl}
          alt={match.title}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() =>
            setImageIndex((i) => (i < imageSources.length - 1 ? i + 1 : i))
          }
        />

        {/* Play icon bottom-right */}
        <div className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <svg className="ml-0.5 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          {isLive ? (
            <span className="flex items-center gap-1.5 rounded bg-[#ff2d55] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Live
            </span>
          ) : match.status === "upcoming" ? (
            <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
              Upcoming
            </span>
          ) : null}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1 px-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-bold uppercase tracking-wider">
          <span className={isLive ? "text-[#ff2d55]" : "text-[#4a5568]"}>
            {match.category || "Sport"}
          </span>
          <span className="text-[#2e3547]">·</span>
          <span className="text-[#4a5568]">{formattedDate}</span>
        </div>
        <h3 className="text-pretty break-words text-sm font-bold leading-snug text-[#f1f5f9] transition-colors duration-150 group-hover:text-[#00f076] sm:text-base">
          {match.title}
        </h3>
        {match.tag && (
          <p className="truncate text-[11px] text-[#4a5568]">{match.tag}</p>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
