import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";

interface HeroSectionProps {
  featuredMatch: APIMatch | null;
}

const PLACEHOLDER_IMAGE_URL = "/sports_placeholder.png";

const HeroSection: React.FC<HeroSectionProps> = ({ featuredMatch }) => {
  const navigate = useNavigate();
  const [failedImage, setFailedImage] = useState<{
    matchId: string;
    imageIndex: number;
  } | null>(null);

  if (!featuredMatch) {
    return (
      <div className="w-full bg-zinc-900/50 rounded-xl border border-white/5 p-12 text-center text-zinc-400 mb-12 flex flex-col items-center justify-center min-h-[40vh]">
        <h2 className="text-3xl font-bold text-white mb-4">
          Welcome to SportStream
        </h2>
        <p className="mb-6 max-w-md">
          Your home for live sports and upcoming events.
        </p>
        <button
          className="bg-emerald-500 text-black font-semibold py-2.5 px-6 rounded-md hover:bg-emerald-400 transition-colors"
          onClick={() => navigate("/")}
        >
          Explore Matches
        </button>
      </div>
    );
  }

  const formattedDate = new Date(featuredMatch.date).toLocaleString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const imageSources = api.getPosterCandidates(featuredMatch);
  const imageIndex =
    failedImage?.matchId === featuredMatch.id ? failedImage.imageIndex : 0;
  const backgroundImage = imageSources[imageIndex] || PLACEHOLDER_IMAGE_URL;
  const isLive = featuredMatch.status?.toLowerCase() === "live";

  return (
    <div className="mb-12 flex w-full flex-col gap-6 lg:flex-row">
      {/* Main Image Area */}
      <div
        className="flex-1 relative aspect-video lg:aspect-auto lg:h-[450px] bg-zinc-900 rounded-xl overflow-hidden cursor-pointer group"
        role="button"
        tabIndex={0}
        aria-label={`Watch ${featuredMatch.title}`}
        onClick={() =>
          navigate(`/watch/${encodeURIComponent(featuredMatch.uriName)}`)
        }
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigate(`/watch/${encodeURIComponent(featuredMatch.uriName)}`);
          }
        }}
      >
        <img
          src={backgroundImage}
          alt={featuredMatch.title}
          className="h-full w-full object-cover"
          onError={() => {
            setFailedImage({
              matchId: featuredMatch.id,
              imageIndex: Math.min(imageIndex + 1, imageSources.length - 1),
            });
          }}
        />
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white">
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="lg:w-[400px] flex flex-col justify-end p-2 lg:p-4">
        {isLive && (
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span className="text-red-500 text-xs font-bold uppercase tracking-wider">
              Live Now
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <span className="text-white">
            {featuredMatch.category || "Featured"}
          </span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-6">
          {featuredMatch.title}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
          <button
            className="flex-1 bg-emerald-500 text-black font-semibold py-3 px-6 rounded-md hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
            onClick={() =>
              navigate(`/watch/${encodeURIComponent(featuredMatch.uriName)}`)
            }
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
