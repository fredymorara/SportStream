import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MainLayout from "../layouts/MainLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMatchesByStatus } from "../store/matchesSlice";
import { api } from "../services/api";
import { formatEventDate } from "../utils/formatDate";
import type { StreamLink } from "../services/api";

const PLACEHOLDER_IMAGE_URL = "/sports_placeholder.png";

/* ─── Feed card (vertical, full-width inside sidebar) ─────────────────────── */

interface FeedCardProps {
  link: StreamLink;
  index: number;
  active: boolean;
  onSelect: (id: string) => void;
}

const FeedCard: React.FC<FeedCardProps> = ({ link, index, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(link.id)}
    aria-pressed={active}
    className={`group relative w-full overflow-hidden rounded-lg border px-4 py-3 text-left transition-all duration-200 active:scale-[.98] ${
      active
        ? "border-accent/50 bg-accent/10 shadow-[0_0_20px_rgba(0,240,118,.12)]"
        : "border-border bg-surface hover:border-border-bright hover:bg-surface-elevated"
    }`}
  >
    {/* subtle left accent bar */}
    <span
      className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-all duration-200 ${
        active ? "bg-accent" : "bg-white/0 group-hover:bg-white/15"
      }`}
    />
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className={`truncate text-sm font-semibold leading-snug ${
            active ? "text-accent" : "text-white/90"
          }`}
        >
          {link.label || `Feed ${index + 1}`}
        </span>
        {link.locale && (
          <span
            className={`text-[11px] uppercase tracking-wider ${
              active ? "text-accent" : "text-muted"
            }`}
          >
            {link.locale}
          </span>
        )}
      </div>
      {link.isLive !== undefined && (
        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest ${
            link.isLive
              ? active
                ? "bg-accent/20 text-accent"
                : "bg-accent/10 text-accent"
              : active
                ? "bg-amber-500/15 text-amber-400"
                : "bg-amber-500/10 text-amber-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              link.isLive ? "bg-accent" : "bg-amber-500"
            }`}
          />
          {link.isLive ? "On air" : "Waiting"}
        </span>
      )}
    </div>
  </button>
);

/* ─── Player Page ─────────────────────────────────────────────────────────── */

const PlayerPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { rawMatches, loading, error } = useAppSelector(
    (state) => state.matches,
  );
  const [selectedLinkId, setSelectedLinkId] = useState("");
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [streamStarted, setStreamStarted] = useState(false);
  const [failedPoster, setFailedPoster] = useState<{
    matchId: string;
    imageIndex: number;
  } | null>(null);

  const match = useMemo(
    () => rawMatches.find((m) => m.uriName === matchId) ?? null,
    [rawMatches, matchId],
  );

  useEffect(() => {
    if (rawMatches.length === 0) {
      dispatch(fetchMatchesByStatus({ status: "all", forceRefresh: true }));
    }
  }, [dispatch, rawMatches.length]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSelectedLinkId(
        match?.streamLinks.find((l) => l.isLive)?.id ||
          match?.streamLinks[0]?.id ||
          "",
      );
      setFrameLoaded(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [match?.id, match?.streamLinks]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setFrameLoaded(false);
      setStreamStarted(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [selectedLinkId]);

  /* ── loading ── */
  if (loading && rawMatches.length === 0) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="96" />
        </div>
      </MainLayout>
    );
  }

  /* ── error / not found ── */
  if (error || !match) {
    const isNetworkError = Boolean(error);
    return (
      <MainLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-5 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <p className="mb-1 font-bold text-white">
              {isNetworkError ? "Couldn't load events" : "Stream not found"}
            </p>
            <p className="text-sm text-muted">
              {isNetworkError
                ? error
                : "This event may have ended or the link is invalid."}
            </p>
          </div>
          <button
            onClick={() => navigate(`/${location.search}`)}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-black uppercase tracking-wider text-ink-inverse transition hover:scale-105 hover:bg-accent active:scale-100"
          >
            Back to Events
          </button>
        </div>
      </MainLayout>
    );
  }

  const selectedLink =
    match.streamLinks.find((l) => l.id === selectedLinkId) ||
    match.streamLinks[0] ||
    null;

  const posterCandidates = api.getPosterCandidates(match);
  const posterIndex =
    failedPoster?.matchId === match.id ? failedPoster.imageIndex : 0;
  const posterUrl = posterCandidates[posterIndex] || PLACEHOLDER_IMAGE_URL;

  const isLive = match.status === "live";
  const formattedDate = formatEventDate(match.date, { weekday: "long" });

  return (
    <MainLayout>
      <Helmet>
        <title>{match.title} | SportStream — Event Guide</title>
        <meta
          name="description"
          content={`Event details and third-party feed information for ${match.title}. SportStream is an educational project and does not host or provide streams.`}
        />
        <meta property="og:title" content={`${match.title} | SportStream`} />
        <meta
          property="og:description"
          content={`Discover ${match.title} and other live sports events from third-party sources.`}
        />
        <meta property="og:image" content={posterUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={match.title} />
        <meta
          name="twitter:description"
          content="Discover live sports events from third-party sources."
        />
        <meta name="twitter:image" content={posterUrl} />
      </Helmet>

      {/*
        Two-column layout on desktop (lg+):
          left  — video player (flex-1, keeps 16:9 ratio)
          right — info + feeds sidebar (fixed 340-380px, sticky)
        On mobile: stacks vertically (video → info)
      */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">

        {/* ── LEFT: video player ────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <div
            className="relative w-full overflow-hidden rounded-xl bg-pitch shadow-[0_4px_60px_rgba(0,0,0,0.7)]"
            style={{ aspectRatio: "16/9" }}
          >
            {/* Poster */}
            <img
              key={posterUrl}
              src={posterUrl}
              alt=""
              aria-hidden="true"
              onError={() => {
                if (posterIndex < posterCandidates.length - 1) {
                  setFailedPoster({ matchId: match.id, imageIndex: posterIndex + 1 });
                }
              }}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
              style={{ opacity: frameLoaded ? 0 : 1 }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              style={{ opacity: frameLoaded ? 0 : 1 }}
            />

            {/* Iframe (mounts only after play is clicked) */}
            {selectedLink && streamStarted && (
              <iframe
                key={selectedLink.id}
                src={selectedLink.iframe}
                title={`${match.title} stream`}
                allow="fullscreen; picture-in-picture"
                allowFullScreen
                onLoad={() => setFrameLoaded(true)}
                className="absolute inset-0 z-10 h-full w-full border-0 bg-black"
              />
            )}

            {/* Play gate */}
            {!streamStarted && selectedLink && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <h2 className="max-w-md text-xl font-black leading-tight text-white drop-shadow-lg sm:text-3xl">
                  {match.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setStreamStarted(true)}
                  className="mt-1 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-black shadow-[0_8px_20px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/20 transition-all duration-200 hover:scale-110 hover:bg-accent-hover active:scale-95"
                  aria-label="Play stream"
                >
                  <svg className="ml-1 h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            )}

            {/* No stream */}
            {!selectedLink && (
              <div className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center text-sm text-white/50">
                No streaming links available for this event yet.
              </div>
            )}

            {/* Connecting spinner */}
            {streamStarted && !frameLoaded && selectedLink && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3">
                <span className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-accent" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                  Connecting…
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: info + feeds sidebar ──────────────────────────────── */}
        <aside className="flex shrink-0 flex-col gap-0 overflow-hidden rounded-xl border border-border bg-surface lg:sticky lg:top-[calc(72px+2rem)] lg:w-[340px] xl:w-[380px]">

          {/* Match info block */}
          <div className="px-5 pb-4 pt-5">
            {/* Status + category row */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {isLive && (
                <span className="flex items-center gap-1.5 rounded-full bg-red-600/20 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest text-red-400 ring-1 ring-red-500/25">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Live
                </span>
              )}
              {!isLive && match.status === "upcoming" && (
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest text-amber-400 ring-1 ring-amber-500/20">
                  Upcoming
                </span>
              )}
              <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                {match.category}
              </span>
            </div>

            {/* League */}
            {match.tag && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
                {match.tag}
              </p>
            )}

            {/* Title */}
            <h1 className="text-lg font-black leading-tight text-white sm:text-xl">
              {match.title}
            </h1>

            {/* Date */}
            <p className="mt-2 text-xs text-muted">{formattedDate}</p>
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-border" />

          {/* Back button */}
          <div className="px-5 py-3">
            <button
              type="button"
              onClick={() => navigate(`/${location.search}`)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted transition-all hover:bg-surface-elevated hover:text-white active:scale-[.98]"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
              </svg>
              Back to events
            </button>
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-border" />

          {/* Feeds */}
          <div className="flex flex-col gap-2.5 px-5 py-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted">
              Available feeds
              {match.streamLinks.length > 0 && (
                <span className="ml-2 rounded-full bg-surface-elevated px-1.5 py-px font-bold text-muted">
                  {match.streamLinks.length}
                </span>
              )}
            </p>

            {match.streamLinks.length > 0 ? (
              match.streamLinks.map((link, index) => (
                <FeedCard
                  key={link.id}
                  link={link}
                  index={index}
                  active={selectedLink?.id === link.id}
                  onSelect={setSelectedLinkId}
                />
              ))
            ) : (
              <p className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-4 text-sm text-muted">
                No feeds published yet.
              </p>
            )}
          </div>
        </aside>
      </div>
    </MainLayout>
  );
};

export default PlayerPage;
