import React, { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import EventArt from "../components/EventArt";
import ScoreBug from "../components/ScoreBug";
import Ticker from "../components/Ticker";
import FixtureBoard from "../components/FixtureBoard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMatchesByStatus } from "../store/matchesSlice";
import type { APIMatch } from "../services/api";
import { formatEventDate } from "../utils/formatDate";

const SPORTS = ["football", "basketball", "baseball"];
const rank = (match: APIMatch) =>
  match.status === "live" ? 0 : match.status === "upcoming" ? 1 : 2;
const byProximity = (a: APIMatch, b: APIMatch) =>
  rank(a) - rank(b) || a.date - b.date;

const titleFor = (sport: string) =>
  sport === "live"
    ? "Live now"
    : sport === "upcoming"
      ? "Upcoming events"
      : sport === "other"
        ? "Other sports"
        : `${sport.charAt(0).toUpperCase()}${sport.slice(1)} events`;

const subtitleFor = (sport: string) =>
  sport === "live"
    ? "Every feed currently on air, nearest kickoff first."
    : sport === "upcoming"
      ? "What starts next, ordered by the nearest start time."
      : `Live and upcoming ${sport === "other" ? "sports" : sport} fixtures in one place.`;

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    rawMatches,
    loading,
    error,
    lastUpdated,
    selectedSport,
    searchQuery,
  } = useAppSelector((state) => state.matches);

  useEffect(() => {
    const refresh = () =>
      dispatch(fetchMatchesByStatus({ status: "all", forceRefresh: true }));
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [dispatch]);

  const filteredMatches = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(23, 59, 59, 999);

    let list = rawMatches.filter(
      (match) =>
        match.status === "live" ||
        (match.date >= start.getTime() && match.date <= end.getTime()),
    );

    if (selectedSport === "live") {
      list = list.filter((match) => match.status === "live");
    } else if (selectedSport === "upcoming") {
      list = list.filter((match) => match.status === "upcoming");
    } else if (SPORTS.includes(selectedSport)) {
      list = list.filter(
        (match) => match.category?.toLowerCase() === selectedSport,
      );
    } else if (selectedSport === "other") {
      list = list.filter(
        (match) => !SPORTS.includes(match.category?.toLowerCase() || ""),
      );
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (match) =>
          match.title.toLowerCase().includes(query) ||
          match.category?.toLowerCase().includes(query) ||
          match.tag?.toLowerCase().includes(query),
      );
    }

    return [...list].sort(byProximity);
  }, [rawMatches, selectedSport, searchQuery]);

  const featuredMatch = useMemo(() => {
    const eligible = rawMatches.filter(
      (match) =>
        !/red\s*zone/i.test([match.title, match.uriName, match.tag || ""].join(" ")) &&
        (match.status !== "ended" || match.allowPastStreams),
    );
    const football = eligible.filter(
      (match) => match.category?.trim().toLowerCase() === "football",
    );
    const pool = football.length ? football : eligible;
    return [...pool].sort(byProximity)[0] ?? null;
  }, [rawMatches]);

  const openMatch = (match: APIMatch) =>
    navigate(`/watch/${encodeURIComponent(match.uriName)}${location.search}`);

  const retry = () =>
    dispatch(fetchMatchesByStatus({ status: "all", forceRefresh: true }));

  if (loading && rawMatches.length === 0) {
    return (
      <MainLayout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center">
          <LoadingSpinner size="96" />
        </div>
      </MainLayout>
    );
  }

  if (error && rawMatches.length === 0) {
    return (
      <MainLayout>
        <div className="mt-8 flex min-h-[40vh] flex-col items-center justify-center gap-4 border-t border-border py-16 text-center">
          <span className="sig-stamp bg-live-badge px-3 py-1 text-sm text-white">
            Signal lost
          </span>
          <p className="font-display text-3xl font-extrabold uppercase text-ink">
            Couldn’t load the fixture feed
          </p>
          <p className="max-w-md text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="sig-stamp mt-2 bg-accent px-6 py-3 text-sm text-ink-inverse hover:bg-accent-hover"
          >
            Try again
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {selectedSport === "all" && (
        <h1 className="sr-only">Live sports fixtures</h1>
      )}
      <Helmet>
        <title>SportStream | Live fixtures, on air</title>
        <meta
          name="description"
          content="An educational project for discovering live and upcoming sports fixtures from third-party sources. SportStream does not host or provide streams."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      {error && rawMatches.length > 0 && (
        <div
          role="status"
          className="mb-6 flex flex-col gap-3 border border-accent/40 bg-surface px-4 py-3 text-sm text-ink sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold">Showing the last available fixtures.</p>
            <p className="mt-1 text-xs text-muted">
              {lastUpdated
                ? `Last updated ${formatEventDate(lastUpdated, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}. ${error}`
                : error}
            </p>
          </div>
          <button
            type="button"
            onClick={retry}
            className="sig-stamp w-fit border border-accent px-4 py-2 text-xs text-accent"
          >
            Retry
          </button>
        </div>
      )}

      {selectedSport === "all" && featuredMatch ? (
        <section className="mb-6" aria-label="Featured fixture">
          <div className="relative min-h-[clamp(360px,44vw,540px)] overflow-hidden border border-border">
            <div className="absolute inset-0">
              <EventArt match={featuredMatch} eager className="h-full w-full" imgClassName="scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-pitch via-pitch/85 to-pitch/25" />
                <div className="absolute inset-0 bg-gradient-to-t from-pitch via-transparent to-transparent" />
              </EventArt>
            </div>

            <button
              type="button"
              onClick={() => openMatch(featuredMatch)}
              aria-label={`Watch ${featuredMatch.title}`}
              className="sr-only focus:not-sr-only focus:absolute focus:inset-0 focus:z-30 focus:flex focus:items-center focus:justify-center focus:bg-pitch/70 focus:text-ink"
            >
              Watch {featuredMatch.title}
            </button>

            <div className="relative z-10 flex min-h-[clamp(360px,44vw,540px)] flex-col justify-between p-5 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3">
                <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-accent">
                  Featured fixture
                </span>
                <span className="h-px flex-1 bg-border-bright" />
                <span className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {featuredMatch.category}
                </span>
              </div>

              <div className="max-w-3xl">
                <ScoreBug match={featuredMatch} />
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => openMatch(featuredMatch)}
                    className="sig-stamp bg-live-badge px-7 py-3 text-sm text-white hover:bg-signal"
                  >
                    Watch Now
                  </button>
                  <span className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
                    {featuredMatch.streamLinks.length} available feeds
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-6 border-b-2 border-ink pb-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="max-w-[16ch] font-display text-5xl font-extrabold uppercase leading-[0.88] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                {titleFor(selectedSport)}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted">
                {subtitleFor(selectedSport)}
              </p>
            </div>
            <span className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              {filteredMatches.length} fixtures
            </span>
          </div>
        </section>
      )}

      {selectedSport === "all" && (
        <div className="mb-8">
          <Ticker matches={rawMatches} onSelect={openMatch} />
        </div>
      )}

      {filteredMatches.length > 0 ? (
        <FixtureBoard
          title={selectedSport === "all" ? "All fixtures" : "Fixtures"}
          matches={filteredMatches}
          onSelect={openMatch}
        />
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 border-t border-border py-16 text-center">
          <span className="sig-stamp bg-surface px-3 py-1 text-xs text-muted">
            No signal
          </span>
          <p className="font-display text-3xl font-extrabold uppercase text-ink">
            Nothing on this board
          </p>
          <p className="max-w-sm text-sm text-muted">
            Try another sport, clear the search, or check back closer to kickoff.
          </p>
        </div>
      )}

      <footer className="mt-16 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} SportStream. Educational project.</p>
        <p>
          Events and streams are provided by third-party sources. SportStream does
          not host or provide streams.
        </p>
      </footer>
    </MainLayout>
  );
};

export default HomePage;
