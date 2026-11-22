import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MainLayout from "../layouts/MainLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import EventArt from "../components/EventArt";
import ScoreBug from "../components/ScoreBug";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMatchesByStatus } from "../store/matchesSlice";
import type { StreamLink } from "../services/api";

interface FeedCardProps {
  link: StreamLink;
  index: number;
  active: boolean;
  onSelect: (id: string) => void;
}

/** A feed as a stamped coupon: the state prints on it and never vanishes. */
const FeedCard: React.FC<FeedCardProps> = ({ link, index, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(link.id)}
    aria-pressed={active}
    className={`group flex w-full items-center justify-between gap-3 border px-4 py-3 text-left transition-colors ${
      active
        ? "border-accent bg-surface-elevated"
        : "border-border bg-surface hover:border-border-bright"
    }`}
  >
    <span className="min-w-0">
      <span className="block font-display text-base font-bold uppercase tracking-wide text-ink">
        Feed {String(index + 1).padStart(2, "0")}
      </span>
      <span className="block truncate text-[11px] font-semibold uppercase tracking-wider text-muted">
        {link.label || "Source"}
        {link.locale ? ` · ${link.locale}` : ""}
      </span>
    </span>
    <span className="flex shrink-0 items-center gap-2">
      <span
        className={`sig-stamp px-2 py-1 text-xs ${
          link.isLive
            ? "bg-live-badge text-white"
            : "bg-surface-elevated text-accent"
        }`}
      >
        {link.isLive ? "Live" : "Waiting"}
      </span>
      <span
        aria-hidden="true"
        className={`h-4 w-1 ${active ? "bg-accent" : "bg-transparent group-hover:bg-border-bright"}`}
      />
    </span>
  </button>
);

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

  const match = useMemo(
    () => rawMatches.find((item) => item.uriName === matchId) ?? null,
    [rawMatches, matchId],
  );

  useEffect(() => {
    if (rawMatches.length === 0) {
      dispatch(fetchMatchesByStatus({ status: "all", forceRefresh: true }));
    }
  }, [dispatch, rawMatches.length]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSelectedLinkId(
        match?.streamLinks.find((link) => link.isLive)?.id ||
          match?.streamLinks[0]?.id ||
          "",
      );
      setFrameLoaded(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [match?.id, match?.streamLinks]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFrameLoaded(false);
      setStreamStarted(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedLinkId]);

  if (loading && rawMatches.length === 0) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="96" />
        </div>
      </MainLayout>
    );
  }

  if (error || !match) {
    const isNetworkError = Boolean(error);
    return (
      <MainLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-5 px-6 text-center">
          <span className="sig-stamp bg-live-badge px-3 py-1 text-xs text-white">
            {isNetworkError ? "Signal lost" : "Off air"}
          </span>
          <p className="font-display text-3xl font-extrabold uppercase text-ink">
            {isNetworkError ? "Couldn’t load fixtures" : "Stream not found"}
          </p>
          <p className="text-sm text-muted">
            {isNetworkError
              ? error
              : "This event may have ended or the link is invalid."}
          </p>
          <button
            type="button"
            onClick={() => navigate(`/app${location.search}`)}
            className="sig-stamp mt-2 bg-accent px-6 py-3 text-sm text-ink-inverse hover:bg-accent-hover"
          >
            Back to events
          </button>
        </div>
      </MainLayout>
    );
  }

  const selectedLink =
    match.streamLinks.find((link) => link.id === selectedLinkId) ||
    match.streamLinks[0] ||
    null;
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
          content="Discover third-party sports feeds. SportStream is educational and does not host streams."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
        <div className="min-w-0 flex-1">
          <div className="relative">
            <div
              className="relative w-full overflow-hidden border border-border bg-pitch"
              style={{ aspectRatio: "16/9" }}
            >
              <div className="absolute inset-0">
                <EventArt match={match} eager className="h-full w-full" imgClassName="transition-opacity duration-500">
                  <div
                    aria-hidden="true"
                    className="player-poster-veil absolute inset-x-0 top-0 h-3/4 bg-gradient-to-b from-pitch/95 via-pitch/60 to-transparent"
                    style={{ opacity: frameLoaded ? 0 : 1 }}
                  />
                  <div
                    aria-hidden="true"
                    className="player-poster-veil absolute inset-0 bg-gradient-to-t from-pitch/80 via-transparent to-transparent"
                    style={{ opacity: frameLoaded ? 0 : 1 }}
                  />
                </EventArt>
              </div>

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

              {!selectedLink && (
                <div className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center text-sm text-muted">
                  No streaming links available for this event yet.
                </div>
              )}

              {streamStarted && !frameLoaded && selectedLink && (
                <div className="player-connecting absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-pitch/80">
                  <span className="h-9 w-9 animate-spin border-2 border-border-bright border-t-accent" />
                  <span className="sig-stamp text-xs text-muted">Connecting…</span>
                </div>
              )}
            </div>

            {!streamStarted && selectedLink && (
              <div className="flex flex-col gap-4 border border-t-0 border-border bg-surface p-4 sm:absolute sm:inset-0 sm:z-20 sm:justify-between sm:gap-0 sm:border-transparent sm:bg-transparent sm:p-6 lg:p-8">
                <div className="max-w-2xl sm:border sm:border-border-bright sm:bg-pitch/85 sm:p-4">
                  <ScoreBug match={match} compact />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setStreamStarted(true)}
                    aria-label="Play stream"
                    className="sig-stamp flex h-14 w-14 items-center justify-center bg-live-badge text-lg text-white hover:bg-signal"
                  >
                    <svg className="ml-0.5 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <span className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
                    Open feed
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="flex shrink-0 flex-col border border-border bg-surface lg:sticky lg:top-[calc(72px+1.5rem)] lg:w-[340px] xl:w-[380px]">
          <div className="border-b border-border p-5">
            <h1 className="sr-only">{match.title}</h1>
            <p className="sig-stamp mb-3 text-xs text-muted">Event details</p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`sig-stamp px-2 py-1 text-xs ${
                  match.status === "live"
                    ? "bg-live-badge text-white"
                    : "bg-surface-elevated text-accent"
                }`}
              >
                {match.status === "live"
                  ? "Live"
                  : match.status === "upcoming"
                    ? "Waiting"
                    : "Ended"}
              </span>
              <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {match.tag || match.category}
              </span>
            </div>
            <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Kickoff
            </p>
            <p className="font-display text-3xl font-extrabold leading-none text-accent">
              {new Intl.DateTimeFormat(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(match.date))}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/app${location.search}`)}
            className="flex w-full items-center gap-2 border-b border-border px-5 py-3 text-sm font-semibold text-muted hover:text-ink"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
            </svg>
            Back to events
          </button>

          <div className="flex flex-col gap-2 p-5">
            <p className="sig-stamp mb-1 text-xs text-muted">
              Available feeds
              {match.streamLinks.length > 0 && (
                <span className="ml-2 text-accent">{match.streamLinks.length}</span>
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
              <p className="border border-border px-4 py-5 text-sm text-muted">
                No feeds published yet.
              </p>
            )}
          </div>
        </aside>
      </div>

      <p className="mt-8 border-t border-border pt-5 text-xs text-muted">
        Educational project. Feeds come from third-party sources; SportStream does
        not host or provide streams.
      </p>
    </MainLayout>
  );
};

export default PlayerPage;
