import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";

interface HeroSectionProps {
  featuredMatch: APIMatch | null;
}

const PLACEHOLDER_IMAGE_URL =
  "https://via.placeholder.com/1200x400?text=Featured+Match";

const HeroSection: React.FC<HeroSectionProps> = ({ featuredMatch }) => {
  const navigate = useNavigate();

  if (!featuredMatch) {
    return (
      <div className="w-full bg-zinc-900/50 rounded-xl border border-white/5 p-12 text-center text-zinc-400 mb-12 flex flex-col items-center justify-center min-h-[40vh]">
        <h2 className="text-3xl font-bold text-white mb-4">
          Welcome to SportStream
        </h2>
        <p className="mb-6 max-w-md">
          Your premium destination for live sports streaming. Select a category
          from the sidebar to get started.
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

  const backgroundImage = featuredMatch.poster
    ? api.getPosterUrl(featuredMatch.poster)
    : PLACEHOLDER_IMAGE_URL;
  const isLive = featuredMatch.status?.toLowerCase() === "live";

  return (
    <div className="w-full mb-12 flex flex-col lg:flex-row gap-6 animate-fade-in-up">
      {/* Main Image Area */}
      <div
        className="flex-1 relative aspect-video lg:aspect-auto lg:h-[450px] bg-zinc-900 rounded-xl overflow-hidden cursor-pointer group"
        onClick={() =>
          navigate(`/watch/${encodeURIComponent(featuredMatch.uriName)}`)
        }
      >
        <img
          src={backgroundImage}
          alt={featuredMatch.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
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
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
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
