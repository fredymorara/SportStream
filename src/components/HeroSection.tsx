import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";
import { formatEventDate } from "../utils/formatDate";

interface HeroSectionProps {
  featuredMatch: APIMatch | null;
  otherLive?: APIMatch[];
}

const PLACEHOLDER_IMAGE_URL = "/sports_placeholder.png";

/** Parse "Team A vs Team B" → ["Team A", "Team B"]. Returns null if not a matchup. */
function parseMatchup(title: string): [string, string] | null {
  const match = title.match(
    /^(.+?)\s+(?:vs?\.?|versus|@)\s+(.+)$/i,
  );
  if (!match) return null;
  return [match[1].trim(), match[2].trim()];
}

/** Compact live-match chip for the "other live" strip */
const LiveChip: React.FC<{ match: APIMatch }> = ({ match }) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <button
      type="button"
      onClick={() =>
        navigate(`/watch/${encodeURIComponent(match.uriName)}${location.search}`)
      }
      className="flex shrink-0 flex-col gap-1.5 rounded-lg border border-border bg-surface p-3 text-left transition-all hover:border-border-bright hover:bg-surface-elevated active:scale-[.98]"
      style={{ minWidth: "160px", maxWidth: "200px" }}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-live" />
        <span className="text-[11px] font-black uppercase tracking-widest text-live">Live</span>
        <span className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-muted">
          {match.category}
        </span>
      </div>
      <p className="line-clamp-2 text-xs font-bold leading-snug text-ink">
        {match.title}
      </p>
      {match.tag && (
        <p className="truncate text-[11px] text-muted">{match.tag}</p>
      )}
    </button>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({
  featuredMatch,
  otherLive = [],
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [failedImage, setFailedImage] = useState<{
    matchId: string;
    imageIndex: number;
  } | null>(null);

  /* ── empty state ── */
  if (!featuredMatch) {
    return (
      <div className="mb-10 flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-border bg-surface px-8 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-pitch">
          <svg className="h-7 w-7 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-black text-ink">No events right now</h2>
        <p className="text-sm text-muted">Check back soon — events go live closer to kick-off.</p>
      </div>
    );
  }

  const imageSources = api.getPosterCandidates(featuredMatch);
  const imageIndex =
    failedImage?.matchId === featuredMatch.id ? failedImage.imageIndex : 0;
  const bgImage = imageSources[imageIndex] || PLACEHOLDER_IMAGE_URL;

  const isLive = featuredMatch.status === "live";
  const formattedDate = formatEventDate(featuredMatch.date, { weekday: "long" });
  const matchup = parseMatchup(featuredMatch.title);

  const openFeatured = () =>
    navigate(`/watch/${encodeURIComponent(featuredMatch.uriName)}${location.search}`);

  return (
    <div className="mb-10">
      {/* ── Main hero card ───────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ minHeight: "clamp(320px, 42vw, 520px)" }}
      >
        {/* Background image */}
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          onError={() => {
            if (imageIndex < imageSources.length - 1)
              setFailedImage({ matchId: featuredMatch.id, imageIndex: imageIndex + 1 });
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Gradient overlays — dark frame, keeps image readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Accessible activation button (screen-reader / keyboard users) */}
        <button
          type="button"
          onClick={openFeatured}
          aria-label={`Watch ${featuredMatch.title}`}
          className="sr-only focus:not-sr-only focus:absolute focus:inset-0 focus:z-30 focus:flex focus:items-center focus:justify-center focus:bg-black/30 focus:text-white focus:outline-none"
        >
          Watch {featuredMatch.title}
        </button>

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-6 sm:p-8 lg:p-10"
          style={{ minHeight: "clamp(320px, 42vw, 520px)" }}>

          {/* Top row: badges */}
          <div className="flex items-center gap-2.5">
            {isLive ? (
              <span className="flex items-center gap-1.5 rounded-full bg-live-badge px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Live Now
              </span>
            ) : (
              <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white/80">
                Upcoming
              </span>
            )}
            <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/70">
              {featuredMatch.category}
            </span>
          </div>

          {/* Center / bottom content */}
          <div className="mt-auto max-w-2xl">
            {/* League */}
            {featuredMatch.tag && (
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                {featuredMatch.tag}
              </p>
            )}

            {/* Title — matchup split or plain */}
            {matchup ? (
              <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="text-3xl font-black leading-none text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                  {matchup[0]}
                </span>
                <span className="text-lg font-black text-white/60 sm:text-2xl">vs</span>
                <span className="text-3xl font-black leading-none text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                  {matchup[1]}
                </span>
              </div>
            ) : (
              <h2 className="mb-5 max-w-xl text-3xl font-black leading-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                {featuredMatch.title}
              </h2>
            )}

            {/* Date */}
            <p className="mb-6 text-sm font-medium text-white/60">{formattedDate}</p>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openFeatured}
                className="flex items-center gap-2.5 rounded-lg bg-accent px-6 py-3 text-sm font-black uppercase tracking-wider text-ink-inverse shadow-[0_6px_16px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-white/20 transition-all hover:scale-[1.03] hover:bg-accent-hover hover:ring-white/30 active:scale-100"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </button>
              {otherLive.length > 0 && (
                <span className="text-sm font-semibold text-white/50">
                  +{otherLive.length} more live
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Other live strip ─────────────────────────────────────────── */}
      {otherLive.length > 0 && (
        <div className="mt-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-live" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">
              Also live
            </p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {otherLive.map((m) => (
              <LiveChip key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
