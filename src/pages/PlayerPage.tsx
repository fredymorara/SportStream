import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMatchesByStatus } from "../store/matchesSlice";
import { api } from "../services/api";
import { formatEventDate } from "../utils/formatDate";

const PLACEHOLDER_IMAGE_URL = "/sports_placeholder.png";

import { Helmet } from "react-helmet-async";

const PlayerPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const playerSurfaceRef = useRef<HTMLDivElement>(null);

  const { rawMatches } = useAppSelector((state) => state.matches);
  const { loading, error } = useAppSelector((state) => state.matches);
  const [selectedLinkId, setSelectedLinkId] = useState("");
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [streamStarted, setStreamStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [failedPoster, setFailedPoster] = useState<{
    matchId: string;
    imageIndex: number;
  } | null>(null);

  const match = useMemo(() => {
    return rawMatches.find((m) => m.uriName === matchId) || null;
  }, [rawMatches, matchId]);

  const selectedLink =
    match?.streamLinks.find((link) => link.id === selectedLinkId) ||
    match?.streamLinks[0] ||
    null;

  useEffect(() => {
    if (rawMatches.length === 0) {
      dispatch(fetchMatchesByStatus({ status: "all", forceRefresh: true }));
    }
  }, [dispatch, rawMatches.length]);

  useEffect(() => {
    const resetSelection = window.setTimeout(() => {
      setSelectedLinkId(
        match?.streamLinks.find((link) => link.isLive)?.id ||
          match?.streamLinks[0]?.id ||
          "",
      );
      setFrameLoaded(false);
    }, 0);
    return () => window.clearTimeout(resetSelection);
  }, [match?.id, match?.streamLinks]);

  useEffect(() => {
    const resetPlayer = window.setTimeout(() => {
      setFrameLoaded(false);
      setStreamStarted(false);
    }, 0);
    return () => window.clearTimeout(resetPlayer);
  }, [selectedLink?.id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      const playerSurface = playerSurfaceRef.current;
      const fullscreen = Boolean(
        fullscreenElement &&
        playerSurface &&
        (fullscreenElement === playerSurface ||
          playerSurface.contains(fullscreenElement)),
      );
      setIsFullscreen(fullscreen);
      if (!fullscreen) setControlsVisible(true);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    let hideTimeout = window.setTimeout(() => setControlsVisible(false), 2200);
    const revealControls = () => {
      setControlsVisible(true);
      window.clearTimeout(hideTimeout);
      hideTimeout = window.setTimeout(() => setControlsVisible(false), 2200);
    };

    window.addEventListener("pointermove", revealControls);
    window.addEventListener("wheel", revealControls, { passive: true });
    window.addEventListener("touchstart", revealControls, { passive: true });
    return () => {
      window.clearTimeout(hideTimeout);
      window.removeEventListener("pointermove", revealControls);
      window.removeEventListener("wheel", revealControls);
      window.removeEventListener("touchstart", revealControls);
    };
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    const playerSurface = playerSurfaceRef.current;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await playerSurface?.requestFullscreen();
      }
    } catch (fullscreenError) {
      console.error("Unable to toggle player fullscreen:", fullscreenError);
    }
  };

  if (loading && rawMatches.length === 0) {
    return (
      <MainLayout fullViewport>
        <div className="flex h-full flex-col items-center justify-center">
          <LoadingSpinner color="#10B981" size="80" />
        </div>
      </MainLayout>
    );
  }

  if (error || !match) {
    return (
      <MainLayout fullViewport>
        <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center px-6 text-center">
          <p className="text-red-500 text-lg font-medium mb-6">
            Match not found or streams failed to load.
          </p>
          <button
            onClick={() => navigate(`/${location.search}`)}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black tracking-wide py-3 px-6 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105"
          >
            RETURN TO HOME
          </button>
        </div>
      </MainLayout>
    );
  }

  const posterCandidates = api.getPosterCandidates(match);
  const posterIndex =
    failedPoster?.matchId === match.id ? failedPoster.imageIndex : 0;
  const backgroundImage =
    posterCandidates[posterIndex] || PLACEHOLDER_IMAGE_URL;
  const isLive = match.status === "live";
  const formattedDate = formatEventDate(match.date, {
    weekday: "long",
  });

  return (
    <MainLayout fullViewport>
      <Helmet>
        <title>Watch {match.title} | SportStream</title>
        <meta
          name="description"
          content={`Watch ${match.title} on SportStream.`}
        />
        <meta
          property="og:title"
          content={`Watch ${match.title} | SportStream`}
        />
        <meta
          property="og:description"
          content={`Watch ${match.title} on SportStream.`}
        />
        <meta property="og:image" content={backgroundImage} />
        <meta property="og:type" content="video.other" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Watch ${match.title}`} />
        <meta
          name="twitter:description"
          content={`Watch ${match.title} on SportStream.`}
        />
        <meta name="twitter:image" content={backgroundImage} />
      </Helmet>

      <div
        ref={playerSurfaceRef}
        className="relative h-[100dvh] w-full overflow-hidden bg-[#050505]"
        onPointerMove={() => {
          if (isFullscreen) setControlsVisible(true);
        }}
        onWheel={() => {
          if (isFullscreen) setControlsVisible(true);
        }}
      >
        <img
          key={backgroundImage}
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          onError={() => {
            if (posterIndex < posterCandidates.length - 1) {
              setFailedPoster({
                matchId: match.id,
                imageIndex: posterIndex + 1,
              });
            }
          }}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: frameLoaded ? 0.28 : 1 }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/75" />

        {selectedLink && streamStarted && (
          <iframe
            key={selectedLink.id}
            src={selectedLink.iframe}
            title={`${match.title} - ${selectedLink.label}`}
            allow="fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={() => setFrameLoaded(true)}
            className="absolute inset-0 z-0 h-full w-full border-0 bg-transparent"
          />
        )}

        <header
          className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 bg-gradient-to-b from-black/80 to-transparent px-4 pb-12 pt-4 transition-opacity duration-300 sm:px-7 sm:pt-6 ${controlsVisible ? "opacity-100" : "opacity-0"}`}
          aria-hidden={!controlsVisible}
          inert={!controlsVisible}
        >
          <button
            type="button"
            onClick={() => navigate(`/${location.search}`)}
            aria-label="Back to events"
            className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-white/15"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6M9 12h12" />
            </svg>
          </button>
          <div className="min-w-0 flex-1 text-right">
            <div className="mb-1 flex items-center justify-end gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/65">
              {isLive && (
                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.8)]" />
              )}
              <span>{match.category}</span>
              <span className="text-white/30">/</span>
              <span>{selectedLink?.label || "No feed available"}</span>
            </div>
            <h1 className="truncate text-lg font-bold text-white drop-shadow-md sm:text-2xl">
              {match.title}
            </h1>
            <p className="mt-1 text-xs text-white/60">{formattedDate}</p>
          </div>
        </header>

        {!selectedLink && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-white/75">
            No streaming links are available for this event.
          </div>
        )}

        {selectedLink && !streamStarted && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
            <div className="flex max-w-lg flex-col items-center">
              <span className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/65">
                {match.category}
              </span>
              <h2 className="mb-7 text-3xl font-black leading-tight text-white drop-shadow-lg sm:text-5xl">
                {match.title}
              </h2>
              <button
                type="button"
                onClick={() => setStreamStarted(true)}
                className="pointer-events-auto flex min-h-14 items-center gap-3 rounded-full bg-emerald-400 px-7 text-sm font-black uppercase tracking-wider text-black shadow-[0_8px_36px_rgba(16,185,129,.28)] transition hover:scale-[1.03] hover:bg-emerald-300"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Stream
              </button>
              <p className="mt-4 text-xs text-white/60">{selectedLink.label}</p>
            </div>
          </div>
        )}

        {streamStarted && !frameLoaded && selectedLink && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
              Connecting to {selectedLink.label}
            </span>
          </div>
        )}

        <footer
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-5 pt-16 transition-opacity duration-300 sm:px-7 sm:pb-7 ${controlsVisible ? "opacity-100" : "opacity-0"}`}
          aria-hidden={!controlsVisible}
          inert={!controlsVisible}
        >
          <div className="flex flex-col gap-3 pr-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                Available feeds
              </p>
              {match.streamLinks.length > 0 ? (
                <div className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto pb-1">
                  {match.streamLinks.map((link, index) => {
                    const active = selectedLink?.id === link.id;
                    return (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => setSelectedLinkId(link.id)}
                        aria-pressed={active}
                        className={`flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3 text-left transition ${active ? "border-emerald-300 bg-emerald-400 text-black" : "border-white/15 bg-black/55 text-white hover:bg-white/15"}`}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full ${active ? "bg-black/10" : "bg-white/10"}`}
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                        <span className="flex flex-col">
                          <span className="text-xs font-bold">
                            {link.label || `Feed ${index + 1}`}
                          </span>
                          {link.isLive !== undefined && (
                            <span
                              className={`text-[9px] font-black uppercase ${active ? "text-black/60" : link.isLive ? "text-emerald-300" : "text-amber-300"}`}
                            >
                              {link.isLive ? "Live" : "Waiting"}
                            </span>
                          )}
                          {link.locale && (
                            <span
                              className={`text-[10px] uppercase ${active ? "text-black/60" : "text-white/50"}`}
                            >
                              {link.locale}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-white/60">
                  No feeds published for this event.
                </p>
              )}
            </div>
            <div className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-white/50">
              {match.streamLinks.length}{" "}
              {match.streamLinks.length === 1 ? "feed" : "feeds"}
            </div>
          </div>
        </footer>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          aria-pressed={isFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="pointer-events-auto absolute bottom-5 right-4 z-30 flex h-11 w-11 items-center justify-center bg-transparent text-white/85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300 sm:bottom-7 sm:right-7"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            {isFullscreen ? (
              <path d="M8 3v5H3m13-5v5h5M3 16h5v5m8-5h5v5" />
            ) : (
              <path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
            )}
          </svg>
        </button>
      </div>
    </MainLayout>
  );
};

export default PlayerPage;
